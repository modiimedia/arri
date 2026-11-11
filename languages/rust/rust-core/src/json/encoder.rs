use super::scan::find_special;
use crate::{EncodeError, Encoder, Number, Timestamp};

/// An [`Encoder`] that writes JSON.
///
/// Arri specific representations:
///
/// - `int64` and `uint64` are written as strings
/// - timestamps are written as RFC 3339 strings
/// - `NaN` and infinite floats produce an [`EncodeError::NonFiniteFloat`] error
#[derive(Debug, Default, Clone)]
pub struct JsonEncoder {
    buf: Vec<u8>,
    needs_comma: bool,
}

impl JsonEncoder {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            buf: Vec::with_capacity(capacity),
            needs_comma: false,
        }
    }

    /// The JSON that has been written so far
    pub fn as_bytes(&self) -> &[u8] {
        &self.buf
    }

    pub fn into_bytes(self) -> Vec<u8> {
        self.buf
    }

    pub fn into_string(self) -> String {
        // every write is either ASCII or comes from a `&str`
        String::from_utf8(self.buf).expect("JsonEncoder only writes valid UTF-8")
    }

    /// Clear the output so that the encoder can be reused (retains the allocated capacity)
    pub fn clear(&mut self) {
        self.buf.clear();
        self.needs_comma = false;
    }

    #[inline]
    fn begin_value(&mut self) {
        if self.needs_comma {
            self.buf.push(b',');
        }
    }

    #[inline]
    fn write_raw_value(&mut self, bytes: &[u8]) {
        self.begin_value();
        self.buf.extend_from_slice(bytes);
        self.needs_comma = true;
    }

    #[inline]
    fn write_u64(&mut self, v: u64) {
        let mut tmp = [0u8; 20];
        let start = format_u64(v, &mut tmp);
        self.buf.extend_from_slice(&tmp[start..]);
    }

    fn write_i64(&mut self, v: i64) {
        if v < 0 {
            self.buf.push(b'-');
        }
        self.write_u64(v.unsigned_abs());
    }

    #[inline]
    fn encode_unsigned(&mut self, v: u64) -> Result<(), EncodeError> {
        self.begin_value();
        self.write_u64(v);
        self.needs_comma = true;
        Ok(())
    }

    #[inline]
    fn encode_signed(&mut self, v: i64) -> Result<(), EncodeError> {
        self.begin_value();
        self.write_i64(v);
        self.needs_comma = true;
        Ok(())
    }

    fn write_escaped_str(&mut self, v: &str) {
        self.buf.push(b'"');
        let bytes = v.as_bytes();
        let mut start = 0;
        loop {
            // copy everything up to the next byte that needs escaping in one go
            let i = find_special(bytes, start);
            self.buf.extend_from_slice(&bytes[start..i]);
            let Some(&b) = bytes.get(i) else {
                break;
            };
            let escape: &[u8] = match b {
                b'"' => b"\\\"",
                b'\\' => b"\\\\",
                b'\n' => b"\\n",
                b'\r' => b"\\r",
                b'\t' => b"\\t",
                0x08 => b"\\b",
                0x0c => b"\\f",
                _ => b"",
            };
            if escape.is_empty() {
                const HEX: &[u8; 16] = b"0123456789abcdef";
                self.buf.extend_from_slice(&[
                    b'\\',
                    b'u',
                    b'0',
                    b'0',
                    HEX[(b >> 4) as usize],
                    HEX[(b & 0xf) as usize],
                ]);
            } else {
                self.buf.extend_from_slice(escape);
            }
            start = i + 1;
        }
        self.buf.push(b'"');
    }

    #[inline]
    fn write_float(&mut self, v: f64, is_f32: bool) -> Result<(), EncodeError> {
        if !v.is_finite() {
            return Err(EncodeError::NonFiniteFloat(v));
        }
        self.begin_value();
        let abs = v.abs();
        // very large / small numbers use exponent notation instead of being written with hundreds
        // of digits (both are valid JSON)
        let use_exponent = abs != 0.0 && !(1e-7..1e21).contains(&abs);
        // zmij finds the shortest digits that round trip. They're laid out the same way as Rust's
        // `Display` (or `LowerExp` when using exponents) which matches JavaScript.
        let mut zmij = zmij::Buffer::new();
        let formatted = if is_f32 {
            zmij.format_finite(v as f32)
        } else {
            zmij.format_finite(v)
        };
        let bytes = formatted.as_bytes();
        // Within this range zmij never uses exponent notation, so its output already matches
        // except that whole numbers end with ".0". (zmij switches to exponents outside of
        // 1e-5..1e16 for f64 and 1e-6..1e13 for f32. `zmij_fixed_notation_range` checks this.)
        let (fixed_min, fixed_max) = if is_f32 { (1e-6, 1e12) } else { (1e-5, 1e15) };
        if abs == 0.0 || (fixed_min..fixed_max).contains(&abs) {
            self.buf
                .extend_from_slice(bytes.strip_suffix(b".0").unwrap_or(bytes));
        } else {
            write_float_digits(&mut self.buf, bytes, use_exponent);
        }
        self.needs_comma = true;
        Ok(())
    }
}

/// Rewrite a number formatted by zmij (e.g. `1.0`, `1.5e-7`, `1e16`) using the layout of Rust's
/// `Display` (`1`, `0.00000015`, `10000000000000000`) or `LowerExp` (`1e0`, `1.5e-7`, `1e16`).
fn write_float_digits(out: &mut Vec<u8>, formatted: &[u8], use_exponent: bool) {
    let (negative, rest) = match formatted.split_first() {
        Some((b'-', rest)) => (true, rest),
        _ => (false, formatted),
    };
    let (mantissa, exponent) = match rest.iter().position(|&b| b == b'e') {
        Some(i) => {
            let (exponent_negative, digits) = match &rest[i + 1..] {
                [b'-', digits @ ..] => (true, digits),
                [b'+', digits @ ..] => (false, digits),
                digits => (false, digits),
            };
            let value = digits
                .iter()
                .fold(0i32, |acc, &b| acc * 10 + (b - b'0') as i32);
            (&rest[..i], if exponent_negative { -value } else { value })
        }
        None => (rest, 0),
    };
    // the significant digits and the position of the decimal point (the value is 0.DIGITS * 10^point)
    let mut digits = [0u8; 24];
    let mut len = 0;
    let mut point = None;
    for &b in mantissa {
        if b == b'.' {
            point = Some(len);
        } else {
            digits[len] = b;
            len += 1;
        }
    }
    let mut point = point.unwrap_or(len) as i32 + exponent;
    let mut start = 0;
    while start < len && digits[start] == b'0' {
        start += 1;
        point -= 1;
    }
    let mut end = len;
    while end > start && digits[end - 1] == b'0' {
        end -= 1;
    }
    if negative {
        out.push(b'-');
    }
    let digits = &digits[start..end];
    if digits.is_empty() {
        out.push(b'0');
        return;
    }
    if use_exponent {
        out.push(digits[0]);
        if digits.len() > 1 {
            out.push(b'.');
            out.extend_from_slice(&digits[1..]);
        }
        out.push(b'e');
        let exponent = point - 1;
        if exponent < 0 {
            out.push(b'-');
        }
        let mut tmp = [0u8; 20];
        let start = format_u64(exponent.unsigned_abs() as u64, &mut tmp);
        out.extend_from_slice(&tmp[start..]);
    } else if point <= 0 {
        out.extend_from_slice(b"0.");
        out.resize(out.len() + (-point) as usize, b'0');
        out.extend_from_slice(digits);
    } else if point as usize >= digits.len() {
        out.extend_from_slice(digits);
        out.resize(out.len() + point as usize - digits.len(), b'0');
    } else {
        out.extend_from_slice(&digits[..point as usize]);
        out.push(b'.');
        out.extend_from_slice(&digits[point as usize..]);
    }
}

/// "00" "01" ... "99"
const DIGIT_PAIRS: &[u8; 200] = b"\
0001020304050607080910111213141516171819\
2021222324252627282930313233343536373839\
4041424344454647484950515253545556575859\
6061626364656667686970717273747576777879\
8081828384858687888990919293949596979899";

/// Writes the decimal digits of `v` to the end of `buf` and returns the index of the first digit.
///
/// Two digits are produced per division, which roughly halves the number of divisions compared to
/// producing one digit at a time.
#[inline]
fn format_u64(mut v: u64, buf: &mut [u8; 20]) -> usize {
    let mut i = buf.len();
    while v >= 100 {
        let pair = (v % 100) as usize * 2;
        v /= 100;
        i -= 2;
        buf[i..i + 2].copy_from_slice(&DIGIT_PAIRS[pair..pair + 2]);
    }
    if v >= 10 {
        let pair = v as usize * 2;
        i -= 2;
        buf[i..i + 2].copy_from_slice(&DIGIT_PAIRS[pair..pair + 2]);
    } else {
        i -= 1;
        buf[i] = b'0' + v as u8;
    }
    i
}

impl Encoder for JsonEncoder {
    #[inline]
    fn encode_null(&mut self) -> Result<(), EncodeError> {
        self.write_raw_value(b"null");
        Ok(())
    }

    #[inline]
    fn encode_bool(&mut self, v: bool) -> Result<(), EncodeError> {
        self.write_raw_value(if v { b"true" } else { b"false" });
        Ok(())
    }

    #[inline]
    fn encode_f32(&mut self, v: f32) -> Result<(), EncodeError> {
        self.write_float(v as f64, true)
    }

    #[inline]
    fn encode_f64(&mut self, v: f64) -> Result<(), EncodeError> {
        self.write_float(v, false)
    }

    #[inline]
    fn encode_i8(&mut self, v: i8) -> Result<(), EncodeError> {
        self.encode_signed(v as i64)
    }

    #[inline]
    fn encode_u8(&mut self, v: u8) -> Result<(), EncodeError> {
        self.encode_unsigned(v as u64)
    }

    #[inline]
    fn encode_i16(&mut self, v: i16) -> Result<(), EncodeError> {
        self.encode_signed(v as i64)
    }

    #[inline]
    fn encode_u16(&mut self, v: u16) -> Result<(), EncodeError> {
        self.encode_unsigned(v as u64)
    }

    #[inline]
    fn encode_i32(&mut self, v: i32) -> Result<(), EncodeError> {
        self.encode_signed(v as i64)
    }

    #[inline]
    fn encode_u32(&mut self, v: u32) -> Result<(), EncodeError> {
        self.encode_unsigned(v as u64)
    }

    #[inline]
    fn encode_i64(&mut self, v: i64) -> Result<(), EncodeError> {
        self.begin_value();
        self.buf.push(b'"');
        self.write_i64(v);
        self.buf.push(b'"');
        self.needs_comma = true;
        Ok(())
    }

    #[inline]
    fn encode_u64(&mut self, v: u64) -> Result<(), EncodeError> {
        self.begin_value();
        self.buf.push(b'"');
        self.write_u64(v);
        self.buf.push(b'"');
        self.needs_comma = true;
        Ok(())
    }

    #[inline]
    fn encode_str(&mut self, v: &str) -> Result<(), EncodeError> {
        self.begin_value();
        self.write_escaped_str(v);
        self.needs_comma = true;
        Ok(())
    }

    #[inline]
    fn encode_timestamp(&mut self, v: &Timestamp) -> Result<(), EncodeError> {
        self.begin_value();
        self.buf.push(b'"');
        self.buf.extend_from_slice(v.format().as_str().as_bytes());
        self.buf.push(b'"');
        self.needs_comma = true;
        Ok(())
    }

    #[inline]
    fn encode_number(&mut self, v: Number) -> Result<(), EncodeError> {
        match v {
            Number::Int(v) => self.encode_signed(v),
            Number::Uint(v) => self.encode_unsigned(v),
            Number::Float(v) => self.write_float(v, false),
        }
    }

    #[inline]
    fn begin_object(&mut self, _len: usize) -> Result<(), EncodeError> {
        self.begin_value();
        self.buf.push(b'{');
        self.needs_comma = false;
        Ok(())
    }

    #[inline]
    fn encode_key(&mut self, key: &str) -> Result<(), EncodeError> {
        self.begin_value();
        self.write_escaped_str(key);
        self.buf.push(b':');
        self.needs_comma = false;
        Ok(())
    }

    #[inline]
    fn end_object(&mut self) -> Result<(), EncodeError> {
        self.buf.push(b'}');
        self.needs_comma = true;
        Ok(())
    }

    #[inline]
    fn begin_list(&mut self, _len: usize) -> Result<(), EncodeError> {
        self.begin_value();
        self.buf.push(b'[');
        self.needs_comma = false;
        Ok(())
    }

    #[inline]
    fn end_list(&mut self) -> Result<(), EncodeError> {
        self.buf.push(b']');
        self.needs_comma = true;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Encode, Value, json::to_string};

    /// The previous float formatting (Rust's `Display` / `LowerExp`). The output must not change.
    fn reference_float(v: f64, is_f32: bool) -> String {
        let abs = v.abs();
        let use_exponent = abs != 0.0 && !(1e-7..1e21).contains(&abs);
        match (is_f32, use_exponent) {
            (true, false) => format!("{}", v as f32),
            (true, true) => format!("{:e}", v as f32),
            (false, false) => format!("{v}"),
            (false, true) => format!("{v:e}"),
        }
    }

    #[test]
    fn floats_match_the_reference_formatting() {
        let mut values: Vec<f64> = vec![
            0.0,
            -0.0,
            1.0,
            -1.0,
            0.1,
            0.2,
            0.3,
            1.5,
            100.0,
            1e20,
            1e21,
            1e22,
            1e-7,
            1e-8,
            9.999999e-8,
            1.0000001e-7,
            123456789.0,
            0.000123,
            1.7976931348623157e308,
            f64::MIN_POSITIVE,
            5e-324,
            f64::EPSILON,
            9007199254740993.0,
            1e15,
            1e16,
            1e17,
            123e18,
            999999999999999999999.0,
        ];
        for exponent in -330..310 {
            let p = 10f64.powi(exponent);
            values.extend([p, p * 1.5, p * 9.99, p * 0.999_999_9, p * 1.000_000_1]);
        }
        let mut x: u64 = 0x9E37_79B9_7F4A_7C15;
        for i in 0..400_000 {
            x ^= x << 13;
            x ^= x >> 7;
            x ^= x << 17;
            values.push(match i % 4 {
                0 => f64::from_bits(x),
                1 => f64::from(f32::from_bits(x as u32)),
                2 => (x % 10_000_000) as f64 / 1000.0,
                _ => (x >> 11) as f64 / (1u64 << 53) as f64 * 1e6,
            });
        }
        /// When the value is exactly halfway between the two shortest candidates, `Display` rounds
        /// up while zmij (and JavaScript's `Number.prototype.toString`) rounds to the even digit.
        /// Both are the same length and parse to the same value.
        fn check(actual: String, expected: String, same_value: impl Fn(&str, &str) -> bool) {
            if actual == expected {
                return;
            }
            assert_eq!(actual.len(), expected.len(), "{actual} vs {expected}");
            assert!(same_value(&actual, &expected), "{actual} vs {expected}");
            let last_digit = actual.trim_end_matches(|c: char| !c.is_ascii_digit());
            let last_digit = last_digit.as_bytes()[last_digit.len() - 1];
            assert!(
                (last_digit - b'0').is_multiple_of(2),
                "{actual} vs {expected} should only differ when rounding a tie to even"
            );
        }
        for v in values.into_iter().filter(|v| v.is_finite()) {
            let mut e = JsonEncoder::new();
            e.encode_f64(v).unwrap();
            check(e.into_string(), reference_float(v, false), |a, b| {
                a.parse::<f64>() == b.parse::<f64>()
            });
            let v32 = v as f32;
            if v32.is_finite() {
                let mut e = JsonEncoder::new();
                e.encode_f32(v32).unwrap();
                check(
                    e.into_string(),
                    reference_float(v32 as f64, true),
                    |a, b| a.parse::<f32>() == b.parse::<f32>(),
                );
            }
        }
        // a known tie: this f32 is exactly 273948.625, so 273948.62 and 273948.63 are equally close
        let tie = 273_948.62_f32;
        assert_eq!(tie as f64, 273948.625);
        assert_eq!(to_string(&tie).unwrap(), "273948.62");
    }

    /// `JsonEncoder::write_float` relies on zmij not using exponent notation within these ranges
    #[test]
    fn zmij_fixed_notation_range() {
        let mut x: u64 = 0x2545_F491_4F6C_DD1D;
        for _ in 0..200_000 {
            x ^= x << 13;
            x ^= x >> 7;
            x ^= x << 17;
            let unit = (x >> 11) as f64 / (1u64 << 53) as f64;
            // spread over the whole range on a log scale
            let v64 = 1e-5 * 10f64.powf(unit * 20.0);
            if (1e-5..1e15).contains(&v64) {
                let mut b = zmij::Buffer::new();
                assert!(!b.format_finite(v64).contains('e'), "{v64:e}");
            }
            let v32 = (1e-6 * 10f64.powf(unit * 18.0)) as f32;
            if (1e-6..1e12).contains(&(v32 as f64)) {
                let mut b = zmij::Buffer::new();
                assert!(!b.format_finite(v32).contains('e'), "{v32:e}");
            }
        }
        for v in [1e-5, 1e15 - 1.0, 9.999999999999999e14] {
            assert!(!zmij::Buffer::new().format_finite(v).contains('e'), "{v:e}");
        }
        for v in [1e-6f32, 999_999_900_000.0, 1.0000001e-6] {
            assert!(!zmij::Buffer::new().format_finite(v).contains('e'), "{v:e}");
        }
    }

    #[test]
    fn integers_match_display() {
        let mut values: Vec<u64> =
            vec![0, 1, 9, 10, 99, 100, 101, 999, 1000, u64::MAX, u64::MAX - 1];
        for digits in 0..20 {
            let p = 10u64.pow(digits);
            values.extend([p, p - 1, p + 1, p.saturating_mul(5)]);
        }
        let mut x: u64 = 0x2545_F491_4F6C_DD1D;
        for _ in 0..100_000 {
            x ^= x << 13;
            x ^= x >> 7;
            x ^= x << 17;
            values.push(x >> (x % 64));
        }
        for v in values {
            assert_eq!(to_string(&v).unwrap(), format!("\"{v}\""));
            let signed = v as i64;
            assert_eq!(to_string(&signed).unwrap(), format!("\"{signed}\""));
            if let Ok(small) = u32::try_from(v) {
                assert_eq!(to_string(&small).unwrap(), small.to_string());
            }
        }
        assert_eq!(to_string(&i64::MIN).unwrap(), "\"-9223372036854775808\"");
        assert_eq!(to_string(&i32::MIN).unwrap(), "-2147483648");
    }

    #[test]
    fn scalars() {
        assert_eq!(to_string(&true).unwrap(), "true");
        assert_eq!(to_string(&-128i8).unwrap(), "-128");
        assert_eq!(to_string(&u32::MAX).unwrap(), "4294967295");
        assert_eq!(to_string(&i64::MIN).unwrap(), "\"-9223372036854775808\"");
        assert_eq!(to_string(&u64::MAX).unwrap(), "\"18446744073709551615\"");
        assert_eq!(to_string(&1.5f32).unwrap(), "1.5");
        assert_eq!(to_string(&1.1f32).unwrap(), "1.1");
        assert_eq!(to_string(&-0.25f64).unwrap(), "-0.25");
        assert_eq!(to_string(&10.0f64).unwrap(), "10");
        assert_eq!(to_string(&1e300f64).unwrap(), "1e300");
        assert_eq!(to_string(&1.5e-10f64).unwrap(), "1.5e-10");
        assert_eq!(to_string(&0.0f64).unwrap(), "0");
        assert!(matches!(
            to_string(&f64::INFINITY),
            Err(EncodeError::NonFiniteFloat(_))
        ));
        assert!(to_string(&f32::NAN).is_err());
    }

    #[test]
    fn string_escapes() {
        assert_eq!(
            to_string("double-quote: \" | backslash: \\ | backspace: \u{8} | form-feed: \u{c} | newline: \n | carriage-return: \r | tab: \t | unicode: \u{0} | \u{1f} | / | é 🎉").unwrap(),
            r#""double-quote: \" | backslash: \\ | backspace: \b | form-feed: \f | newline: \n | carriage-return: \r | tab: \t | unicode: \u0000 | \u001f | / | é 🎉""#
        );
    }

    #[test]
    fn nested_containers_and_commas() {
        let value = Value::Object(vec![
            ("a".into(), Value::List(vec![])),
            (
                "b\"".into(),
                Value::List(vec![
                    Value::Object(vec![]),
                    Value::Null,
                    Value::List(vec![Value::from(1), Value::from(2)]),
                ]),
            ),
            (
                "c".into(),
                Value::Object(vec![("d".into(), Value::from(u64::MAX))]),
            ),
        ]);
        assert_eq!(
            to_string(&value).unwrap(),
            r#"{"a":[],"b\"":[{},null,[1,2]],"c":{"d":18446744073709551615}}"#
        );
    }

    #[test]
    fn encoder_can_be_reused() {
        let mut encoder = JsonEncoder::new();
        vec![1, 2].encode(&mut encoder).unwrap();
        assert_eq!(encoder.as_bytes(), b"[1,2]");
        encoder.clear();
        "hi".encode(&mut encoder).unwrap();
        assert_eq!(encoder.into_string(), "\"hi\"");
    }
}
