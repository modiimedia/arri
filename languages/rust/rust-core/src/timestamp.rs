use std::{
    borrow::Cow,
    cmp::Ordering,
    hash::{Hash, Hasher},
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use crate::{
    ArriSchema, Decode, DecodeError, Decoder, Encode, EncodeError, Encoder, SchemaContext, Type,
    TypeDef,
};

/// A point in time with nanosecond precision and an optional UTC offset.
///
/// This is the type used for the Arri `timestamp` type. Over JSON it's represented as an
/// [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339) string.
///
/// Supported range is `0000-01-01T00:00:00Z` through `9999-12-31T23:59:59.999999999Z`
/// (the range that RFC 3339 can represent).
///
/// The UTC offset is preserved when parsing and formatting, but it does not affect equality,
/// ordering, or hashing. Two timestamps are equal if they represent the same instant.
///
/// Conversions to and from `chrono` and `time` types are available with the `chrono` and `time` features.
#[derive(Clone, Copy)]
pub struct Timestamp {
    /// seconds since the unix epoch (UTC)
    secs: i64,
    nanos: u32,
    offset_minutes: i16,
}

const NANOS_PER_SEC: u32 = 1_000_000_000;
const SECS_PER_DAY: i64 = 86_400;
/// 0000-01-01T00:00:00Z
const MIN_SECS: i64 = -62_167_219_200;
/// 9999-12-31T23:59:59Z
const MAX_SECS: i64 = 253_402_300_799;
/// RFC 3339 offsets are limited to +/-23:59
const MAX_OFFSET_MINUTES: i16 = 23 * 60 + 59;

/// An error produced when creating or parsing a [`Timestamp`]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TimestampError {
    message: Cow<'static, str>,
}

impl TimestampError {
    fn new(message: impl Into<Cow<'static, str>>) -> Self {
        Self {
            message: message.into(),
        }
    }

    fn out_of_range() -> Self {
        Self::new("timestamp is outside of the supported range (years 0000 - 9999)")
    }

    fn invalid_format(reason: &'static str) -> Self {
        Self::new(format!("invalid RFC 3339 timestamp: {reason}"))
    }
}

impl std::fmt::Display for TimestampError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.message)
    }
}

impl std::error::Error for TimestampError {}

impl Timestamp {
    /// 1970-01-01T00:00:00Z
    pub const UNIX_EPOCH: Timestamp = Timestamp {
        secs: 0,
        nanos: 0,
        offset_minutes: 0,
    };

    /// Create a UTC timestamp from seconds and nanoseconds since the unix epoch
    pub fn from_unix(secs: i64, nanos: u32) -> Result<Self, TimestampError> {
        if nanos >= NANOS_PER_SEC {
            return Err(TimestampError::new(
                "nanoseconds must be less than 1,000,000,000",
            ));
        }
        if !(MIN_SECS..=MAX_SECS).contains(&secs) {
            return Err(TimestampError::out_of_range());
        }
        Ok(Self {
            secs,
            nanos,
            offset_minutes: 0,
        })
    }

    /// Create a UTC timestamp from milliseconds since the unix epoch
    pub fn from_unix_millis(millis: i64) -> Result<Self, TimestampError> {
        let secs = millis.div_euclid(1000);
        let nanos = millis.rem_euclid(1000) as u32 * 1_000_000;
        Self::from_unix(secs, nanos)
    }

    /// The current time (UTC)
    pub fn now() -> Self {
        Self::try_from(SystemTime::now()).unwrap_or(Self::UNIX_EPOCH)
    }

    /// Whole seconds since the unix epoch
    pub const fn unix_seconds(&self) -> i64 {
        self.secs
    }

    /// Milliseconds since the unix epoch (sub-millisecond precision is truncated)
    pub const fn unix_millis(&self) -> i64 {
        self.secs * 1000 + (self.nanos / 1_000_000) as i64
    }

    /// The fractional part of the timestamp in nanoseconds
    pub const fn subsec_nanos(&self) -> u32 {
        self.nanos
    }

    /// The UTC offset in minutes. This is only used when formatting.
    pub const fn offset_minutes(&self) -> i16 {
        self.offset_minutes
    }

    /// Returns the same instant but formatted with a different UTC offset
    pub fn with_offset_minutes(self, offset_minutes: i16) -> Result<Self, TimestampError> {
        if !(-MAX_OFFSET_MINUTES..=MAX_OFFSET_MINUTES).contains(&offset_minutes) {
            return Err(TimestampError::new(
                "UTC offset must be between -23:59 and +23:59",
            ));
        }
        let local = self.secs + offset_minutes as i64 * 60;
        if !(MIN_SECS..=MAX_SECS).contains(&local) {
            return Err(TimestampError::out_of_range());
        }
        Ok(Self {
            offset_minutes,
            ..self
        })
    }

    /// Returns the same instant with a UTC offset of zero
    pub fn to_utc(self) -> Self {
        Self {
            offset_minutes: 0,
            ..self
        }
    }

    /// Parse an [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339) timestamp.
    ///
    /// Example: `2001-01-01T16:00:00.000Z` or `2001-01-01T08:00:00-08:00`
    pub fn parse(input: &str) -> Result<Self, TimestampError> {
        let b = input.as_bytes();
        // shortest valid input "YYYY-MM-DDTHH:MM:SSZ"
        if b.len() < 20 {
            return Err(TimestampError::invalid_format("input is too short"));
        }
        let year = parse_digits(b, 0, 4)? as i64;
        expect_byte(b, 4, b'-')?;
        let month = parse_digits(b, 5, 2)?;
        expect_byte(b, 7, b'-')?;
        let day = parse_digits(b, 8, 2)?;
        if !matches!(b[10], b'T' | b't' | b' ') {
            return Err(TimestampError::invalid_format(
                "expected \"T\" between the date and time",
            ));
        }
        let hour = parse_digits(b, 11, 2)?;
        expect_byte(b, 13, b':')?;
        let minute = parse_digits(b, 14, 2)?;
        expect_byte(b, 16, b':')?;
        let second = parse_digits(b, 17, 2)?;

        if !(1..=12).contains(&month) {
            return Err(TimestampError::invalid_format(
                "month must be between 01 and 12",
            ));
        }
        if day < 1 || day > days_in_month(year, month) {
            return Err(TimestampError::invalid_format(
                "day is out of range for the month",
            ));
        }
        if hour > 23 || minute > 59 || second > 60 {
            return Err(TimestampError::invalid_format("time is out of range"));
        }

        let mut pos = 19;
        let mut nanos: u32 = 0;
        if b[pos] == b'.' {
            pos += 1;
            let start = pos;
            let mut scale = NANOS_PER_SEC / 10;
            while pos < b.len() && b[pos].is_ascii_digit() {
                // digits beyond nanosecond precision are ignored
                nanos += (b[pos] - b'0') as u32 * scale;
                scale /= 10;
                pos += 1;
            }
            if pos == start {
                return Err(TimestampError::invalid_format(
                    "expected digits after the decimal point",
                ));
            }
        }

        let offset_minutes: i16 = match b.get(pos) {
            Some(b'Z' | b'z') => {
                pos += 1;
                0
            }
            Some(sign @ (b'+' | b'-')) => {
                let sign: i16 = if *sign == b'-' { -1 } else { 1 };
                if b.len() < pos + 6 {
                    return Err(TimestampError::invalid_format("UTC offset is incomplete"));
                }
                let offset_hours = parse_digits(b, pos + 1, 2)?;
                expect_byte(b, pos + 3, b':')?;
                let offset_mins = parse_digits(b, pos + 4, 2)?;
                if offset_hours > 23 || offset_mins > 59 {
                    return Err(TimestampError::invalid_format("UTC offset is out of range"));
                }
                pos += 6;
                sign * (offset_hours * 60 + offset_mins) as i16
            }
            _ => {
                return Err(TimestampError::invalid_format(
                    "expected \"Z\" or a UTC offset (e.g. \"+01:00\")",
                ));
            }
        };
        if pos != b.len() {
            return Err(TimestampError::invalid_format(
                "unexpected trailing characters",
            ));
        }

        let local = days_from_civil(year, month, day) * SECS_PER_DAY
            + hour as i64 * 3600
            + minute as i64 * 60
            + second as i64;
        let secs = local - offset_minutes as i64 * 60;
        if !(MIN_SECS..=MAX_SECS).contains(&secs) || !(MIN_SECS..=MAX_SECS).contains(&local) {
            return Err(TimestampError::out_of_range());
        }
        Ok(Self {
            secs,
            nanos,
            offset_minutes,
        })
    }

    /// Format as an [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339) string.
    ///
    /// At least millisecond precision is always written (`2001-01-01T16:00:00.000Z`).
    /// Microseconds or nanoseconds are written when they're non-zero.
    pub fn to_rfc3339(&self) -> String {
        self.format().as_str().to_string()
    }

    pub(crate) fn format(&self) -> FormattedTimestamp {
        let mut out = FormattedTimestamp {
            buf: [0; FormattedTimestamp::CAPACITY],
            len: 0,
        };
        let local = self.secs + self.offset_minutes as i64 * 60;
        let days = local.div_euclid(SECS_PER_DAY);
        let secs_of_day = local.rem_euclid(SECS_PER_DAY) as u32;
        let (year, month, day) = civil_from_days(days);

        out.push_digits(year as u32, 4);
        out.push(b'-');
        out.push_digits(month, 2);
        out.push(b'-');
        out.push_digits(day, 2);
        out.push(b'T');
        out.push_digits(secs_of_day / 3600, 2);
        out.push(b':');
        out.push_digits(secs_of_day / 60 % 60, 2);
        out.push(b':');
        out.push_digits(secs_of_day % 60, 2);
        out.push(b'.');
        if self.nanos.is_multiple_of(1_000_000) {
            out.push_digits(self.nanos / 1_000_000, 3);
        } else if self.nanos.is_multiple_of(1000) {
            out.push_digits(self.nanos / 1000, 6);
        } else {
            out.push_digits(self.nanos, 9);
        }
        if self.offset_minutes == 0 {
            out.push(b'Z');
        } else {
            out.push(if self.offset_minutes < 0 { b'-' } else { b'+' });
            let offset = self.offset_minutes.unsigned_abs() as u32;
            out.push_digits(offset / 60, 2);
            out.push(b':');
            out.push_digits(offset % 60, 2);
        }
        out
    }
}

/// A formatted RFC 3339 timestamp stored on the stack
pub(crate) struct FormattedTimestamp {
    buf: [u8; Self::CAPACITY],
    len: usize,
}

impl FormattedTimestamp {
    /// "YYYY-MM-DDTHH:MM:SS.nnnnnnnnn+HH:MM"
    const CAPACITY: usize = 35;

    fn push(&mut self, byte: u8) {
        self.buf[self.len] = byte;
        self.len += 1;
    }

    fn push_digits(&mut self, mut value: u32, width: usize) {
        for i in (0..width).rev() {
            self.buf[self.len + i] = b'0' + (value % 10) as u8;
            value /= 10;
        }
        self.len += width;
    }

    pub(crate) fn as_str(&self) -> &str {
        // only ASCII bytes are ever written
        std::str::from_utf8(&self.buf[..self.len]).expect("formatted timestamps are ASCII")
    }
}

fn parse_digits(b: &[u8], start: usize, len: usize) -> Result<u32, TimestampError> {
    let mut value = 0;
    for &byte in &b[start..start + len] {
        if !byte.is_ascii_digit() {
            return Err(TimestampError::invalid_format("expected a digit"));
        }
        value = value * 10 + (byte - b'0') as u32;
    }
    Ok(value)
}

fn expect_byte(b: &[u8], index: usize, expected: u8) -> Result<(), TimestampError> {
    if b[index] != expected {
        return Err(TimestampError::new(format!(
            "invalid RFC 3339 timestamp: expected \"{}\" at position {index}",
            expected as char
        )));
    }
    Ok(())
}

fn is_leap_year(year: i64) -> bool {
    (year % 4 == 0 && year % 100 != 0) || year % 400 == 0
}

fn days_in_month(year: i64, month: u32) -> u32 {
    match month {
        2 if is_leap_year(year) => 29,
        2 => 28,
        4 | 6 | 9 | 11 => 30,
        _ => 31,
    }
}

/// Days since the unix epoch for a proleptic Gregorian date.
/// See <https://howardhinnant.github.io/date_algorithms.html#days_from_civil>
fn days_from_civil(year: i64, month: u32, day: u32) -> i64 {
    let y = if month <= 2 { year - 1 } else { year };
    let era = y.div_euclid(400);
    let yoe = y.rem_euclid(400);
    let m = month as i64;
    let doy = (153 * (if m > 2 { m - 3 } else { m + 9 }) + 2) / 5 + day as i64 - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    era * 146_097 + doe - 719_468
}

/// Inverse of [`days_from_civil`].
/// See <https://howardhinnant.github.io/date_algorithms.html#civil_from_days>
fn civil_from_days(days: i64) -> (i64, u32, u32) {
    let z = days + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z.rem_euclid(146_097);
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = (doy - (153 * mp + 2) / 5 + 1) as u32;
    let month = if mp < 10 { mp + 3 } else { mp - 9 } as u32;
    let year = yoe + era * 400 + (month <= 2) as i64;
    (year, month, day)
}

impl PartialEq for Timestamp {
    fn eq(&self, other: &Self) -> bool {
        self.secs == other.secs && self.nanos == other.nanos
    }
}

impl Eq for Timestamp {}

impl PartialOrd for Timestamp {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Timestamp {
    fn cmp(&self, other: &Self) -> Ordering {
        (self.secs, self.nanos).cmp(&(other.secs, other.nanos))
    }
}

impl Hash for Timestamp {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.secs.hash(state);
        self.nanos.hash(state);
    }
}

impl std::fmt::Display for Timestamp {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.format().as_str())
    }
}

impl std::fmt::Debug for Timestamp {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Timestamp({})", self.format().as_str())
    }
}

impl std::str::FromStr for Timestamp {
    type Err = TimestampError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s)
    }
}

impl TryFrom<SystemTime> for Timestamp {
    type Error = TimestampError;

    fn try_from(value: SystemTime) -> Result<Self, Self::Error> {
        match value.duration_since(UNIX_EPOCH) {
            Ok(duration) => {
                let secs = i64::try_from(duration.as_secs())
                    .map_err(|_| TimestampError::out_of_range())?;
                Self::from_unix(secs, duration.subsec_nanos())
            }
            Err(err) => {
                let duration = err.duration();
                let mut secs = -i64::try_from(duration.as_secs())
                    .map_err(|_| TimestampError::out_of_range())?;
                let mut nanos = duration.subsec_nanos();
                if nanos > 0 {
                    secs -= 1;
                    nanos = NANOS_PER_SEC - nanos;
                }
                Self::from_unix(secs, nanos)
            }
        }
    }
}

impl From<Timestamp> for SystemTime {
    fn from(value: Timestamp) -> Self {
        if value.secs >= 0 {
            UNIX_EPOCH + Duration::new(value.secs as u64, value.nanos)
        } else {
            UNIX_EPOCH - Duration::from_secs(value.secs.unsigned_abs())
                + Duration::from_nanos(value.nanos as u64)
        }
    }
}

impl ArriSchema for Timestamp {
    fn type_name() -> Cow<'static, str> {
        Cow::Borrowed("Timestamp")
    }

    fn type_def(_: &mut SchemaContext) -> TypeDef {
        TypeDef::scalar(Type::Timestamp)
    }
}

impl Encode for Timestamp {
    #[inline]
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        e.encode_timestamp(self)
    }
}

impl Decode for Timestamp {
    #[inline]
    fn decode<D: Decoder + ?Sized>(d: &mut D) -> Result<Self, DecodeError> {
        d.decode_timestamp()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_and_format_round_trip() {
        let cases = [
            ("2001-01-01T16:00:00.000Z", 978_364_800, 0, 0),
            ("1970-01-01T00:00:00.000Z", 0, 0, 0),
            ("1969-12-31T23:59:59.999Z", -1, 999_000_000, 0),
            ("2024-02-29T12:30:45.123456Z", 1_709_209_845, 123_456_000, 0),
            (
                "2024-02-29T12:30:45.123456789Z",
                1_709_209_845,
                123_456_789,
                0,
            ),
            ("2001-01-01T08:00:00.000-08:00", 978_364_800, 0, -480),
            ("2001-01-01T21:30:00.000+05:30", 978_364_800, 0, 330),
            ("0000-01-01T00:00:00.000Z", MIN_SECS, 0, 0),
            ("9999-12-31T23:59:59.999999999Z", MAX_SECS, 999_999_999, 0),
        ];
        for (input, secs, nanos, offset) in cases {
            let ts = Timestamp::parse(input).unwrap();
            assert_eq!(ts.unix_seconds(), secs, "{input}");
            assert_eq!(ts.subsec_nanos(), nanos, "{input}");
            assert_eq!(ts.offset_minutes(), offset, "{input}");
            assert_eq!(ts.to_rfc3339(), input);
        }
    }

    #[test]
    fn parse_normalizes_alternate_forms() {
        let cases = [
            ("2001-01-01T16:00:00Z", "2001-01-01T16:00:00.000Z"),
            ("2001-01-01t16:00:00z", "2001-01-01T16:00:00.000Z"),
            ("2001-01-01 16:00:00.5Z", "2001-01-01T16:00:00.500Z"),
            (
                "2001-01-01T16:00:00.1234567891234Z",
                "2001-01-01T16:00:00.123456789Z",
            ),
            ("2016-12-31T23:59:60Z", "2017-01-01T00:00:00.000Z"),
        ];
        for (input, expected) in cases {
            assert_eq!(Timestamp::parse(input).unwrap().to_rfc3339(), expected);
        }
    }

    #[test]
    fn parse_rejects_invalid_input() {
        let cases = [
            "",
            "2001-01-01",
            "2001-01-01T16:00:00",
            "2001-13-01T16:00:00Z",
            "2001-02-29T16:00:00Z",
            "2001-01-32T16:00:00Z",
            "2001-01-01T24:00:00Z",
            "2001-01-01T16:60:00Z",
            "2001-01-01T16:00:00.Z",
            "2001-01-01T16:00:00+0100",
            "2001-01-01T16:00:00+24:00",
            "2001-01-01T16:00:00Zjunk",
            "20O1-01-01T16:00:00Z",
            "0000-01-01T00:00:00+01:00",
            "9999-12-31T23:59:59-01:00",
        ];
        for input in cases {
            assert!(
                Timestamp::parse(input).is_err(),
                "{input:?} should be invalid"
            );
        }
    }

    #[test]
    fn equality_ignores_offset() {
        let a = Timestamp::parse("2001-01-01T16:00:00Z").unwrap();
        let b = Timestamp::parse("2001-01-01T08:00:00-08:00").unwrap();
        assert_eq!(a, b);
        assert!(Timestamp::parse("2001-01-01T16:00:00.001Z").unwrap() > a);
    }

    #[test]
    fn constructors() {
        let ts = Timestamp::from_unix_millis(-1).unwrap();
        assert_eq!(ts.to_rfc3339(), "1969-12-31T23:59:59.999Z");
        assert_eq!(ts.unix_millis(), -1);
        assert!(Timestamp::from_unix(0, NANOS_PER_SEC).is_err());
        assert!(Timestamp::from_unix(MAX_SECS + 1, 0).is_err());
        assert!(Timestamp::UNIX_EPOCH.with_offset_minutes(24 * 60).is_err());
        assert_eq!(
            Timestamp::UNIX_EPOCH
                .with_offset_minutes(-90)
                .unwrap()
                .to_rfc3339(),
            "1969-12-31T22:30:00.000-01:30"
        );
    }

    #[test]
    fn system_time_round_trip() {
        for millis in [0, 1_700_000_000_123, -1_700_000_000_123, -1] {
            let ts = Timestamp::from_unix_millis(millis).unwrap();
            let system_time = SystemTime::from(ts);
            assert_eq!(Timestamp::try_from(system_time).unwrap(), ts);
        }
        assert!(Timestamp::now() > Timestamp::parse("2020-01-01T00:00:00Z").unwrap());
    }
}
