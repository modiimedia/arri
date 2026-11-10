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

    fn write_u64(&mut self, v: u64) {
        let mut tmp = [0u8; 20];
        let mut i = tmp.len();
        let mut v = v;
        loop {
            i -= 1;
            tmp[i] = b'0' + (v % 10) as u8;
            v /= 10;
            if v == 0 {
                break;
            }
        }
        self.buf.extend_from_slice(&tmp[i..]);
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
        for (i, &b) in bytes.iter().enumerate() {
            let escape: &[u8] = match b {
                b'"' => b"\\\"",
                b'\\' => b"\\\\",
                b'\n' => b"\\n",
                b'\r' => b"\\r",
                b'\t' => b"\\t",
                0x08 => b"\\b",
                0x0c => b"\\f",
                0x00..=0x1f => b"",
                _ => continue,
            };
            self.buf.extend_from_slice(&bytes[start..i]);
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
        self.buf.extend_from_slice(&bytes[start..]);
        self.buf.push(b'"');
    }

    fn write_float(&mut self, v: f64, is_f32: bool) -> Result<(), EncodeError> {
        if !v.is_finite() {
            return Err(EncodeError::NonFiniteFloat(v));
        }
        self.begin_value();
        let abs = v.abs();
        // `Display` never uses exponents so very large / small numbers would be written with
        // hundreds of digits. Use exponent notation for those instead (both are valid JSON).
        let use_exponent = abs != 0.0 && !(1e-7..1e21).contains(&abs);
        let formatted = match (is_f32, use_exponent) {
            (true, false) => (v as f32).to_string(),
            (true, true) => format!("{:e}", v as f32),
            (false, false) => v.to_string(),
            (false, true) => format!("{v:e}"),
        };
        self.buf.extend_from_slice(formatted.as_bytes());
        self.needs_comma = true;
        Ok(())
    }
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

    fn encode_f32(&mut self, v: f32) -> Result<(), EncodeError> {
        self.write_float(v as f64, true)
    }

    fn encode_f64(&mut self, v: f64) -> Result<(), EncodeError> {
        self.write_float(v, false)
    }

    fn encode_i8(&mut self, v: i8) -> Result<(), EncodeError> {
        self.encode_signed(v as i64)
    }

    fn encode_u8(&mut self, v: u8) -> Result<(), EncodeError> {
        self.encode_unsigned(v as u64)
    }

    fn encode_i16(&mut self, v: i16) -> Result<(), EncodeError> {
        self.encode_signed(v as i64)
    }

    fn encode_u16(&mut self, v: u16) -> Result<(), EncodeError> {
        self.encode_unsigned(v as u64)
    }

    fn encode_i32(&mut self, v: i32) -> Result<(), EncodeError> {
        self.encode_signed(v as i64)
    }

    fn encode_u32(&mut self, v: u32) -> Result<(), EncodeError> {
        self.encode_unsigned(v as u64)
    }

    fn encode_i64(&mut self, v: i64) -> Result<(), EncodeError> {
        self.begin_value();
        self.buf.push(b'"');
        self.write_i64(v);
        self.buf.push(b'"');
        self.needs_comma = true;
        Ok(())
    }

    fn encode_u64(&mut self, v: u64) -> Result<(), EncodeError> {
        self.begin_value();
        self.buf.push(b'"');
        self.write_u64(v);
        self.buf.push(b'"');
        self.needs_comma = true;
        Ok(())
    }

    fn encode_str(&mut self, v: &str) -> Result<(), EncodeError> {
        self.begin_value();
        self.write_escaped_str(v);
        self.needs_comma = true;
        Ok(())
    }

    fn encode_timestamp(&mut self, v: &Timestamp) -> Result<(), EncodeError> {
        self.begin_value();
        self.buf.push(b'"');
        self.buf.extend_from_slice(v.format().as_str().as_bytes());
        self.buf.push(b'"');
        self.needs_comma = true;
        Ok(())
    }

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
