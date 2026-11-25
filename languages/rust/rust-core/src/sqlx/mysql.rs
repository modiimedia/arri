use sqlx_core::{
    decode::Decode as SqlxDecode,
    encode::{Encode as SqlxEncode, IsNull},
    error::BoxDynError,
    type_info::TypeInfo,
    types::Type as SqlxType,
};
use sqlx_mysql::{MySql, MySqlTypeInfo, MySqlValueRef};

use super::{Json, parse_sql_timestamp};
use crate::{Decode, Encode, Timestamp};

// --- Json<T> ---

impl<T: ?Sized> SqlxType<MySql> for Json<T> {
    fn type_info() -> MySqlTypeInfo {
        <str as SqlxType<MySql>>::type_info()
    }

    fn compatible(ty: &MySqlTypeInfo) -> bool {
        ty.name() == "JSON"
            || <&str as SqlxType<MySql>>::compatible(ty)
            || <&[u8] as SqlxType<MySql>>::compatible(ty)
    }
}

impl<T: Encode + ?Sized> SqlxEncode<'_, MySql> for Json<T> {
    fn encode_by_ref(&self, buf: &mut Vec<u8>) -> Result<IsNull, BoxDynError> {
        let json = crate::json::to_string(&self.0)?;
        <String as SqlxEncode<MySql>>::encode(json, buf)
    }
}

impl<'r, T: Decode> SqlxDecode<'r, MySql> for Json<T> {
    fn decode(value: MySqlValueRef<'r>) -> Result<Self, BoxDynError> {
        let s = <&str as SqlxDecode<MySql>>::decode(value)?;
        crate::json::from_str(s).map(Json).map_err(Into::into)
    }
}

// --- Timestamp ---
// Assumes the MySQL connection's `time_zone` is set to `+00:00` (UTC), matching `sqlx-mysql`'s
// `chrono::DateTime<Utc>` implementation.

impl SqlxType<MySql> for Timestamp {
    fn type_info() -> MySqlTypeInfo {
        <str as SqlxType<MySql>>::type_info()
    }

    fn compatible(ty: &MySqlTypeInfo) -> bool {
        matches!(ty.name(), "TIMESTAMP" | "DATETIME")
    }
}

impl SqlxEncode<'_, MySql> for Timestamp {
    fn encode_by_ref(&self, buf: &mut Vec<u8>) -> Result<IsNull, BoxDynError> {
        let formatted = format_mysql_datetime(self);
        <String as SqlxEncode<MySql>>::encode(formatted, buf)
    }
}

impl<'r> SqlxDecode<'r, MySql> for Timestamp {
    fn decode(value: MySqlValueRef<'r>) -> Result<Self, BoxDynError> {
        let bytes = <&[u8] as SqlxDecode<MySql>>::decode(value)?;
        decode_mysql_timestamp_bytes(bytes)
    }
}

/// Format as MySQL UTC datetime string (`YYYY-MM-DD HH:MM:SS` or `YYYY-MM-DD HH:MM:SS.ffffff`).
fn format_mysql_datetime(ts: &Timestamp) -> String {
    let (year, month, day, hour, minute, second, nanos) = ts.utc_components();
    let micros = nanos / 1_000;
    if micros == 0 {
        format!("{year:04}-{month:02}-{day:02} {hour:02}:{minute:02}:{second:02}")
    } else {
        format!("{year:04}-{month:02}-{day:02} {hour:02}:{minute:02}:{second:02}.{micros:06}")
    }
}

/// Decode either MySQL's binary datetime packet (`[len, year_le, month, day, ...]`)
/// or MySQL's text representation (`YYYY-MM-DD HH:MM:SS[.ffffff]`).
fn decode_mysql_timestamp_bytes(bytes: &[u8]) -> Result<Timestamp, BoxDynError> {
    if bytes.is_empty() {
        return Err("empty MySQL timestamp buffer".into());
    }
    // Binary format starts with a length byte of 0, 4, 7, or 11 (never an ASCII digit '0'..='9').
    let len = bytes[0];
    if matches!(len, 0 | 4 | 7 | 11) && bytes.len() == 1 + len as usize {
        return decode_mysql_binary_datetime(&bytes[1..]);
    }
    let text = std::str::from_utf8(bytes)?;
    parse_sql_timestamp(text, true).map_err(Into::into)
}

fn decode_mysql_binary_datetime(buf: &[u8]) -> Result<Timestamp, BoxDynError> {
    match buf.len() {
        0 => Err("MySQL returned a zero datetime".into()),
        4 | 7 | 11 => {
            let year = u16::from_le_bytes([buf[0], buf[1]]) as i64;
            let month = buf[2] as u32;
            let day = buf[3] as u32;
            let (hour, minute, second) = if buf.len() >= 7 {
                (buf[4] as u32, buf[5] as u32, buf[6] as u32)
            } else {
                (0, 0, 0)
            };
            let nanos = if buf.len() == 11 {
                let micros = u32::from_le_bytes([buf[7], buf[8], buf[9], buf[10]]);
                micros
                    .checked_mul(1_000)
                    .ok_or_else(|| format!("MySQL microseconds out of range: {micros}"))?
            } else {
                0
            };
            Timestamp::from_date_time(year, month, day, hour, minute, second, nanos, 0)
                .map_err(Into::into)
        }
        len => Err(format!("unexpected MySQL binary datetime length: {len}").into()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn json_encode_writes_lenenc_string() {
        let mut buf = Vec::new();
        let value = Json(vec![1i32, 2i32]);
        let is_null = SqlxEncode::<MySql>::encode_by_ref(&value, &mut buf).unwrap();
        assert!(!is_null.is_null());
        // length byte (5) + "[1,2]"
        assert_eq!(buf, b"\x05[1,2]");
    }

    #[test]
    fn timestamp_format_and_decode_binary_and_text() {
        let ts = Timestamp::parse("2024-02-29T12:30:45.123456Z").unwrap();
        assert_eq!(format_mysql_datetime(&ts), "2024-02-29 12:30:45.123456");

        // Binary (11 bytes payload: year=2024, month=2, day=29, 12:30:45, micros=123456)
        let mut binary = vec![11u8];
        binary.extend_from_slice(&2024u16.to_le_bytes());
        binary.extend_from_slice(&[2, 29, 12, 30, 45]);
        binary.extend_from_slice(&123_456u32.to_le_bytes());
        assert_eq!(decode_mysql_timestamp_bytes(&binary).unwrap(), ts);

        // Binary without micros (7 bytes payload)
        let ts_sec = Timestamp::parse("2024-02-29T12:30:45Z").unwrap();
        assert_eq!(format_mysql_datetime(&ts_sec), "2024-02-29 12:30:45");
        let mut binary_7 = vec![7u8];
        binary_7.extend_from_slice(&2024u16.to_le_bytes());
        binary_7.extend_from_slice(&[2, 29, 12, 30, 45]);
        assert_eq!(decode_mysql_timestamp_bytes(&binary_7).unwrap(), ts_sec);

        // Binary date-only (4 bytes payload)
        let ts_date = Timestamp::parse("2024-02-29T00:00:00Z").unwrap();
        let mut binary_4 = vec![4u8];
        binary_4.extend_from_slice(&2024u16.to_le_bytes());
        binary_4.extend_from_slice(&[2, 29]);
        assert_eq!(decode_mysql_timestamp_bytes(&binary_4).unwrap(), ts_date);

        // Text protocol
        assert_eq!(
            decode_mysql_timestamp_bytes(b"2024-02-29 12:30:45.123456").unwrap(),
            ts
        );
    }
}
