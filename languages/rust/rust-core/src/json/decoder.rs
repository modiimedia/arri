use super::scan::find_special;
use crate::{DecodeError, DecodeErrorKind, Decoder, Number, Timestamp, Value};

/// The default maximum nesting depth of objects and lists
pub const DEFAULT_MAX_DEPTH: usize = 128;

/// A [`Decoder`] that reads JSON.
///
/// Arri specific representations:
///
/// - `int64` and `uint64` must be strings containing a whole number
/// - timestamps must be RFC 3339 strings
/// - integer types accept whole numbers written with a fraction or exponent (e.g. `1.0` or `1e2`)
///
/// Use [`JsonDecoder::finish`] after decoding to make sure there isn't any trailing data.
#[derive(Debug)]
pub struct JsonDecoder<'a> {
    input: &'a str,
    pos: usize,
    depth: usize,
    max_depth: usize,
    /// `true` immediately after an object or list has been opened
    first: bool,
    scratch: String,
}

/// Parse a string containing an optional minus sign followed by one or more ASCII digits
pub(crate) fn parse_integer(s: &str) -> Option<i128> {
    let (negative, digits) = match s.strip_prefix('-') {
        Some(rest) => (true, rest),
        None => (false, s),
    };
    if digits.is_empty() {
        return None;
    }
    let mut value: i128 = 0;
    for b in digits.bytes() {
        if !b.is_ascii_digit() {
            return None;
        }
        value = value.checked_mul(10)?.checked_add((b - b'0') as i128)?;
    }
    Some(if negative { -value } else { value })
}

impl<'a> JsonDecoder<'a> {
    pub fn new(input: &'a str) -> Self {
        Self {
            input,
            pos: 0,
            depth: 0,
            max_depth: DEFAULT_MAX_DEPTH,
            first: false,
            scratch: String::new(),
        }
    }

    /// Create a decoder from bytes. Fails if the input isn't valid UTF-8.
    pub fn from_slice(input: &'a [u8]) -> Result<Self, DecodeError> {
        let input = std::str::from_utf8(input).map_err(|e| {
            DecodeError::syntax(format!(
                "input is not valid UTF-8 (at byte {})",
                e.valid_up_to()
            ))
        })?;
        Ok(Self::new(input))
    }

    /// Set the maximum nesting depth for objects and lists
    pub fn with_max_depth(mut self, max_depth: usize) -> Self {
        self.max_depth = max_depth;
        self
    }

    /// Ensure that only whitespace remains in the input
    pub fn finish(&mut self) -> Result<(), DecodeError> {
        self.skip_whitespace();
        match self.peek() {
            None => Ok(()),
            Some(_) => Err(self.unexpected("end of input")),
        }
    }

    #[inline]
    fn bytes(&self) -> &'a [u8] {
        self.input.as_bytes()
    }

    #[inline]
    fn peek(&self) -> Option<u8> {
        self.bytes().get(self.pos).copied()
    }

    #[inline]
    fn skip_whitespace(&mut self) {
        let bytes = self.bytes();
        while let Some(b' ' | b'\n' | b'\r' | b'\t') = bytes.get(self.pos) {
            self.pos += 1;
        }
    }

    /// skips whitespace and returns the next byte without consuming it
    #[inline]
    fn peek_value(&mut self) -> Option<u8> {
        self.skip_whitespace();
        self.peek()
    }

    #[cold]
    fn unexpected(&self, expected: &str) -> DecodeError {
        match self.input[self.pos..].chars().next() {
            Some(c) => DecodeError::syntax(format!(
                "unexpected character '{}' at byte {}, expected {expected}",
                c.escape_debug(),
                self.pos
            )),
            None => DecodeError::syntax(format!("unexpected end of input, expected {expected}")),
        }
    }

    /// Describes the next value for error messages. Assumes whitespace has been skipped.
    fn found(&self) -> &'static str {
        match self.peek() {
            Some(b'n') => "null",
            Some(b't' | b'f') => "boolean",
            Some(b'"') => "string",
            Some(b'[') => "array",
            Some(b'{') => "object",
            Some(b'-' | b'0'..=b'9') => "number",
            Some(_) => "invalid JSON",
            None => "end of input",
        }
    }

    #[cold]
    fn invalid_type(&self, expected: &str) -> DecodeError {
        match self.found() {
            "invalid JSON" | "end of input" => self.unexpected(expected),
            found => DecodeError::invalid_type(expected, found),
        }
    }

    fn expect_literal(&mut self, literal: &[u8]) -> Result<(), DecodeError> {
        if self.bytes()[self.pos..].starts_with(literal) {
            self.pos += literal.len();
            Ok(())
        } else {
            Err(self.unexpected(std::str::from_utf8(literal).unwrap_or("literal")))
        }
    }

    fn enter(&mut self) -> Result<(), DecodeError> {
        self.depth += 1;
        if self.depth > self.max_depth {
            return Err(DecodeError::new(
                DecodeErrorKind::DepthLimitExceeded,
                format!("input exceeds the maximum depth of {}", self.max_depth),
            ));
        }
        self.pos += 1;
        self.first = true;
        Ok(())
    }

    fn exit(&mut self) {
        self.pos += 1;
        self.depth -= 1;
        self.first = false;
    }

    /// Scan a JSON number. Returns the number's text and whether it's an integer literal (no fraction or exponent)
    fn scan_number(&mut self) -> Result<(&'a str, bool), DecodeError> {
        let bytes = self.bytes();
        let start = self.pos;
        let mut pos = self.pos;
        let mut is_integer = true;
        if bytes.get(pos) == Some(&b'-') {
            pos += 1;
        }
        match bytes.get(pos) {
            Some(b'0') => pos += 1,
            Some(b'1'..=b'9') => {
                while bytes.get(pos).is_some_and(u8::is_ascii_digit) {
                    pos += 1;
                }
            }
            _ => {
                self.pos = pos;
                return Err(self.unexpected("a digit"));
            }
        }
        if bytes.get(pos) == Some(&b'.') {
            is_integer = false;
            pos += 1;
            let digits_start = pos;
            while bytes.get(pos).is_some_and(u8::is_ascii_digit) {
                pos += 1;
            }
            if pos == digits_start {
                self.pos = pos;
                return Err(self.unexpected("a digit"));
            }
        }
        if let Some(b'e' | b'E') = bytes.get(pos) {
            is_integer = false;
            pos += 1;
            if let Some(b'+' | b'-') = bytes.get(pos) {
                pos += 1;
            }
            let digits_start = pos;
            while bytes.get(pos).is_some_and(u8::is_ascii_digit) {
                pos += 1;
            }
            if pos == digits_start {
                self.pos = pos;
                return Err(self.unexpected("a digit"));
            }
        }
        self.pos = pos;
        Ok((&self.input[start..pos], is_integer))
    }

    /// Read a JSON number that must be a whole number
    fn read_integer(&mut self, expected: &str) -> Result<i128, DecodeError> {
        match self.peek_value() {
            Some(b'-' | b'0'..=b'9') => {}
            _ => return Err(self.invalid_type(expected)),
        }
        if let Some(value) = self.read_simple_integer() {
            return Ok(value);
        }
        let (text, is_integer) = self.scan_number()?;
        let value = if is_integer {
            parse_integer(text)
        } else {
            text.parse::<f64>()
                .ok()
                .and_then(|v| Number::Float(v).as_i128())
        };
        value.ok_or_else(|| {
            if is_integer {
                DecodeError::invalid_value(format!("{text} is out of range for {expected}"))
            } else {
                DecodeError::invalid_value(format!("expected {expected} but found {text}"))
            }
        })
    }

    /// Fast path for the common case of a plain integer literal (e.g. `-123`) that fits in 64 bits.
    ///
    /// Returns `None` without consuming anything for anything else (fractions, exponents,
    /// overflow, or invalid input) so that the general purpose path can handle it.
    #[inline]
    fn read_simple_integer(&mut self) -> Option<i128> {
        let bytes = self.bytes();
        let mut pos = self.pos;
        let negative = bytes.get(pos) == Some(&b'-');
        if negative {
            pos += 1;
        }
        let digits_start = pos;
        let mut value: u64 = 0;
        while let Some(&b) = bytes.get(pos) {
            if !b.is_ascii_digit() {
                break;
            }
            value = value.checked_mul(10)?.checked_add((b - b'0') as u64)?;
            pos += 1;
        }
        let digit_count = pos - digits_start;
        // leading zeros, fractions, and exponents are handled by the general purpose path
        if digit_count == 0
            || (digit_count > 1 && bytes[digits_start] == b'0')
            || matches!(bytes.get(pos), Some(b'.' | b'e' | b'E'))
        {
            return None;
        }
        self.pos = pos;
        Some(if negative {
            -(value as i128)
        } else {
            value as i128
        })
    }

    /// Read an int64 / uint64.
    ///
    /// Arri encodes these as strings so that clients which store every number as a float
    /// (such as JavaScript) don't lose precision. Plain JSON numbers are accepted as well since any
    /// precision loss has already happened on the sender's side.
    fn read_large_integer(&mut self, expected: &str) -> Result<i128, DecodeError> {
        if self.peek_value() != Some(b'"') {
            return self.read_integer(expected);
        }
        let text = self.read_str()?;
        parse_integer(text).ok_or_else(|| {
            DecodeError::invalid_value(format!("\"{text}\" is not a valid {expected}"))
        })
    }

    fn read_float(&mut self, expected: &str) -> Result<&'a str, DecodeError> {
        match self.peek_value() {
            Some(b'-' | b'0'..=b'9') => Ok(self.scan_number()?.0),
            _ => Err(self.invalid_type(expected)),
        }
    }

    /// Read a JSON string and append its unescaped contents to `out`. Expects the cursor to be on the opening quote.
    fn read_string_into(&mut self, out: &mut String) -> Result<(), DecodeError> {
        let bytes = self.bytes();
        self.pos += 1;
        let mut start = self.pos;
        loop {
            self.pos = find_special(bytes, self.pos);
            let Some(&b) = bytes.get(self.pos) else {
                return Err(self.unexpected("'\"'"));
            };
            match b {
                b'"' => {
                    out.push_str(&self.input[start..self.pos]);
                    self.pos += 1;
                    return Ok(());
                }
                b'\\' => {
                    out.push_str(&self.input[start..self.pos]);
                    self.pos += 1;
                    self.read_escape(out)?;
                    start = self.pos;
                }
                _ => {
                    return Err(DecodeError::syntax(format!(
                        "unescaped control character in string at byte {}",
                        self.pos
                    )));
                }
            }
        }
    }

    /// Read a JSON string without copying it when possible. Expects the cursor to be on the opening quote.
    ///
    /// Strings without escape sequences are borrowed directly from the input. Otherwise they are
    /// unescaped into a scratch buffer that is reused between calls.
    fn read_str(&mut self) -> Result<&str, DecodeError> {
        let bytes = self.bytes();
        let start = self.pos + 1;
        let end = find_special(bytes, start);
        if bytes.get(end) == Some(&b'"') {
            self.pos = end + 1;
            return Ok(&self.input[start..end]);
        }
        let mut scratch = std::mem::take(&mut self.scratch);
        scratch.clear();
        let result = self.read_string_into(&mut scratch);
        self.scratch = scratch;
        result.map(|_| self.scratch.as_str())
    }

    /// Reads an escape sequence. The cursor should be on the character after the backslash.
    fn read_escape(&mut self, out: &mut String) -> Result<(), DecodeError> {
        let c = match self.peek() {
            Some(b'"') => '"',
            Some(b'\\') => '\\',
            Some(b'/') => '/',
            Some(b'b') => '\u{8}',
            Some(b'f') => '\u{c}',
            Some(b'n') => '\n',
            Some(b'r') => '\r',
            Some(b't') => '\t',
            Some(b'u') => {
                self.pos += 1;
                let first = self.read_hex4()?;
                let code_point = match first {
                    0xD800..=0xDBFF => {
                        // high surrogate. must be followed by an escaped low surrogate
                        if !self.bytes()[self.pos..].starts_with(b"\\u") {
                            return Err(DecodeError::syntax(format!(
                                "unpaired surrogate in string at byte {}",
                                self.pos
                            )));
                        }
                        self.pos += 2;
                        let second = self.read_hex4()?;
                        if !(0xDC00..=0xDFFF).contains(&second) {
                            return Err(DecodeError::syntax(format!(
                                "unpaired surrogate in string at byte {}",
                                self.pos
                            )));
                        }
                        0x10000 + ((first - 0xD800) << 10) + (second - 0xDC00)
                    }
                    0xDC00..=0xDFFF => {
                        return Err(DecodeError::syntax(format!(
                            "unpaired surrogate in string at byte {}",
                            self.pos
                        )));
                    }
                    other => other,
                };
                out.push(char::from_u32(code_point).expect("surrogates are handled above"));
                return Ok(());
            }
            _ => return Err(self.unexpected("a valid escape sequence")),
        };
        out.push(c);
        self.pos += 1;
        Ok(())
    }

    fn read_hex4(&mut self) -> Result<u32, DecodeError> {
        let mut value = 0;
        for _ in 0..4 {
            let digit = match self.peek() {
                Some(b @ b'0'..=b'9') => b - b'0',
                Some(b @ b'a'..=b'f') => b - b'a' + 10,
                Some(b @ b'A'..=b'F') => b - b'A' + 10,
                _ => return Err(self.unexpected("a hexadecimal digit")),
            };
            value = value * 16 + digit as u32;
            self.pos += 1;
        }
        Ok(value)
    }

    /// Skip over a string without allocating. The cursor should be on the opening quote.
    fn skip_string(&mut self) -> Result<(), DecodeError> {
        let bytes = self.bytes();
        self.pos += 1;
        loop {
            self.pos = find_special(bytes, self.pos);
            match bytes.get(self.pos) {
                None => return Err(self.unexpected("'\"'")),
                Some(b'"') => {
                    self.pos += 1;
                    return Ok(());
                }
                Some(b'\\') => {
                    self.pos += 1;
                    match self.peek() {
                        Some(b'"' | b'\\' | b'/' | b'b' | b'f' | b'n' | b'r' | b't') => {
                            self.pos += 1
                        }
                        Some(b'u') => {
                            self.pos += 1;
                            self.read_hex4()?;
                        }
                        _ => return Err(self.unexpected("a valid escape sequence")),
                    }
                }
                Some(_) => {
                    return Err(DecodeError::syntax(format!(
                        "unescaped control character in string at byte {}",
                        self.pos
                    )));
                }
            }
        }
    }
}

macro_rules! json_decode_int {
    ($($method:ident => $ty:ty, $name:literal, $reader:ident);* $(;)?) => {
        $(
            fn $method(&mut self) -> Result<$ty, DecodeError> {
                let n = self.$reader($name)?;
                <$ty>::try_from(n).map_err(|_| {
                    DecodeError::invalid_value(format!("{n} is out of range for {}", $name))
                })
            }
        )*
    };
}

impl Decoder for JsonDecoder<'_> {
    fn decode_null(&mut self) -> Result<bool, DecodeError> {
        if self.peek_value() == Some(b'n') {
            self.expect_literal(b"null")?;
            return Ok(true);
        }
        Ok(false)
    }

    fn decode_bool(&mut self) -> Result<bool, DecodeError> {
        match self.peek_value() {
            Some(b't') => self.expect_literal(b"true").map(|_| true),
            Some(b'f') => self.expect_literal(b"false").map(|_| false),
            _ => Err(self.invalid_type("boolean")),
        }
    }

    fn decode_f32(&mut self) -> Result<f32, DecodeError> {
        let text = self.read_float("float32")?;
        // `parse` turns numbers that are too large into infinity, which can't be encoded again
        match text.parse::<f32>() {
            Ok(v) if v.is_finite() => Ok(v),
            _ => Err(DecodeError::invalid_value(format!(
                "{text} is out of range for float32"
            ))),
        }
    }

    fn decode_f64(&mut self) -> Result<f64, DecodeError> {
        let text = self.read_float("float64")?;
        match text.parse::<f64>() {
            Ok(v) if v.is_finite() => Ok(v),
            _ => Err(DecodeError::invalid_value(format!(
                "{text} is out of range for float64"
            ))),
        }
    }

    json_decode_int! {
        decode_i8 => i8, "int8", read_integer;
        decode_u8 => u8, "uint8", read_integer;
        decode_i16 => i16, "int16", read_integer;
        decode_u16 => u16, "uint16", read_integer;
        decode_i32 => i32, "int32", read_integer;
        decode_u32 => u32, "uint32", read_integer;
        decode_i64 => i64, "int64", read_large_integer;
        decode_u64 => u64, "uint64", read_large_integer;
    }

    fn decode_string(&mut self) -> Result<String, DecodeError> {
        if self.peek_value() != Some(b'"') {
            return Err(self.invalid_type("string"));
        }
        self.read_str().map(str::to_string)
    }

    fn decode_str(&mut self) -> Result<&str, DecodeError> {
        if self.peek_value() != Some(b'"') {
            return Err(self.invalid_type("string"));
        }
        self.read_str()
    }

    fn decode_timestamp(&mut self) -> Result<Timestamp, DecodeError> {
        if self.peek_value() != Some(b'"') {
            return Err(self.invalid_type("timestamp"));
        }
        let text = self.read_str()?;
        Timestamp::parse(text).map_err(|e| DecodeError::invalid_value(e.to_string()))
    }

    fn decode_any(&mut self) -> Result<Value, DecodeError> {
        match self.peek_value() {
            Some(b'n') => self.expect_literal(b"null").map(|_| Value::Null),
            Some(b't' | b'f') => self.decode_bool().map(Value::Bool),
            Some(b'"') => self.decode_string().map(Value::String),
            Some(b'-' | b'0'..=b'9') => {
                let (text, is_integer) = self.scan_number()?;
                if is_integer && let Some(n) = parse_integer(text) {
                    if let Ok(n) = i64::try_from(n) {
                        return Ok(Value::Number(Number::Int(n)));
                    }
                    if let Ok(n) = u64::try_from(n) {
                        return Ok(Value::Number(Number::Uint(n)));
                    }
                }
                match text.parse::<f64>() {
                    Ok(v) if v.is_finite() => Ok(Value::Number(Number::Float(v))),
                    _ => Err(DecodeError::invalid_value(format!(
                        "{text} is out of range for a number"
                    ))),
                }
            }
            Some(b'[') => {
                self.begin_list()?;
                let mut items = Vec::new();
                while self.next_element()? {
                    let index = items.len();
                    items.push(self.decode_any().map_err(|e| e.in_index(index))?);
                }
                Ok(Value::List(items))
            }
            Some(b'{') => {
                self.begin_object()?;
                let mut entries = Vec::new();
                while let Some(key) = self.next_key()? {
                    let key = key.to_string();
                    let value = self.decode_any().map_err(|e| e.in_field(&key))?;
                    entries.push((key, value));
                }
                Ok(Value::Object(entries))
            }
            _ => Err(self.unexpected("a JSON value")),
        }
    }

    fn begin_object(&mut self) -> Result<Option<usize>, DecodeError> {
        if self.peek_value() != Some(b'{') {
            return Err(self.invalid_type("object"));
        }
        self.enter()?;
        Ok(None)
    }

    fn next_key(&mut self) -> Result<Option<&str>, DecodeError> {
        match self.peek_value() {
            Some(b'}') => {
                self.exit();
                return Ok(None);
            }
            Some(b',') if !self.first => {
                self.pos += 1;
                self.skip_whitespace();
            }
            _ if !self.first => return Err(self.unexpected("',' or '}'")),
            _ => {}
        }
        if self.peek() != Some(b'"') {
            return Err(self.unexpected("'\"'"));
        }
        // read the key's position first so that the `:` can be consumed before returning a borrow
        let key_start = self.pos;
        self.skip_string()?;
        let key_end = self.pos;
        if self.peek_value() != Some(b':') {
            return Err(self.unexpected("':'"));
        }
        self.pos += 1;
        self.first = false;
        let raw = &self.input[key_start + 1..key_end - 1];
        if !raw.as_bytes().contains(&b'\\') {
            return Ok(Some(raw));
        }
        // the key contains escape sequences so it needs to be unescaped
        let after_colon = self.pos;
        self.pos = key_start;
        let mut scratch = std::mem::take(&mut self.scratch);
        scratch.clear();
        let result = self.read_string_into(&mut scratch);
        self.scratch = scratch;
        self.pos = after_colon;
        result.map(|_| Some(self.scratch.as_str()))
    }

    fn begin_list(&mut self) -> Result<Option<usize>, DecodeError> {
        if self.peek_value() != Some(b'[') {
            return Err(self.invalid_type("array"));
        }
        self.enter()?;
        Ok(None)
    }

    fn next_element(&mut self) -> Result<bool, DecodeError> {
        match self.peek_value() {
            Some(b']') => {
                self.exit();
                return Ok(false);
            }
            Some(b',') if !self.first => {
                self.pos += 1;
            }
            _ if !self.first => return Err(self.unexpected("',' or ']'")),
            _ => {}
        }
        self.first = false;
        Ok(true)
    }

    fn skip_value(&mut self) -> Result<(), DecodeError> {
        match self.peek_value() {
            Some(b'n') => self.expect_literal(b"null"),
            Some(b't') => self.expect_literal(b"true"),
            Some(b'f') => self.expect_literal(b"false"),
            Some(b'"') => self.skip_string(),
            Some(b'-' | b'0'..=b'9') => self.scan_number().map(|_| ()),
            Some(b'[') => {
                self.begin_list()?;
                while self.next_element()? {
                    self.skip_value()?;
                }
                Ok(())
            }
            Some(b'{') => {
                self.begin_object()?;
                loop {
                    // inline version of next_key() that skips the key rather than allocating it
                    match self.peek_value() {
                        Some(b'}') => {
                            self.exit();
                            return Ok(());
                        }
                        Some(b',') if !self.first => {
                            self.pos += 1;
                            self.skip_whitespace();
                        }
                        _ if !self.first => return Err(self.unexpected("',' or '}'")),
                        _ => {}
                    }
                    if self.peek() != Some(b'"') {
                        return Err(self.unexpected("'\"'"));
                    }
                    self.skip_string()?;
                    if self.peek_value() != Some(b':') {
                        return Err(self.unexpected("':'"));
                    }
                    self.pos += 1;
                    self.first = false;
                    self.skip_value()?;
                }
            }
            _ => Err(self.unexpected("a JSON value")),
        }
    }
}

#[cfg(test)]
mod tests {
    use std::collections::BTreeMap;

    use super::*;
    use crate::{Decode, DecodeErrorKind, Nullable, json::from_str};

    #[test]
    fn scalars() {
        assert!(from_str::<bool>(" true ").unwrap());
        assert_eq!(from_str::<i8>("-128").unwrap(), -128);
        assert_eq!(from_str::<u8>("2.55e2").unwrap(), 255);
        assert_eq!(from_str::<u32>("4294967295").unwrap(), u32::MAX);
        assert_eq!(from_str::<i32>("1.0").unwrap(), 1);
        assert_eq!(
            from_str::<i64>("\"-9223372036854775808\"").unwrap(),
            i64::MIN
        );
        assert_eq!(
            from_str::<u64>("\"18446744073709551615\"").unwrap(),
            u64::MAX
        );
        // int64 / uint64 are encoded as strings but plain numbers are accepted too
        assert_eq!(from_str::<i64>("-42").unwrap(), -42);
        assert_eq!(from_str::<i64>("-9223372036854775808").unwrap(), i64::MIN);
        assert_eq!(from_str::<u64>("18446744073709551615").unwrap(), u64::MAX);
        assert_eq!(
            from_str::<u64>("1.5e19").unwrap(),
            15_000_000_000_000_000_000
        );
        assert_eq!(from_str::<f64>("-1.5e-3").unwrap(), -0.0015);
        assert_eq!(from_str::<f32>("1.1").unwrap(), 1.1f32);
        assert_eq!(from_str::<f64>("10").unwrap(), 10.0);
        // very small numbers round to zero
        assert_eq!(from_str::<f64>("1e-400").unwrap(), 0.0);
    }

    #[test]
    fn out_of_range_floats_are_rejected() {
        // these would otherwise become infinity which can't be encoded
        for input in ["1e400", "-1e400"] {
            assert_eq!(
                from_str::<f64>(input).unwrap_err().kind(),
                DecodeErrorKind::InvalidValue
            );
            assert_eq!(
                from_str::<Value>(input).unwrap_err().kind(),
                DecodeErrorKind::InvalidValue
            );
        }
        // valid float64 but too large for float32
        assert_eq!(from_str::<f64>("1e39").unwrap(), 1e39);
        assert_eq!(
            from_str::<f32>("1e39").unwrap_err().kind(),
            DecodeErrorKind::InvalidValue
        );
        assert_eq!(from_str::<f32>("3.4028235e38").unwrap(), f32::MAX);
        // the value decoder (used when buffering) behaves the same way
        let mut d = crate::ValueDecoder::new(Value::Number(Number::Float(1e39)));
        assert_eq!(
            f32::decode(&mut d).unwrap_err().kind(),
            DecodeErrorKind::InvalidValue
        );
        let mut d = crate::ValueDecoder::new(Value::Number(Number::Float(f64::INFINITY)));
        assert_eq!(
            f64::decode(&mut d).unwrap_err().kind(),
            DecodeErrorKind::InvalidValue
        );
    }

    #[test]
    fn integer_errors() {
        fn kind<T: Decode + std::fmt::Debug>(input: &str) -> DecodeErrorKind {
            from_str::<T>(input).unwrap_err().kind()
        }
        assert_eq!(kind::<u8>("256"), DecodeErrorKind::InvalidValue);
        assert_eq!(kind::<u32>("-1"), DecodeErrorKind::InvalidValue);
        assert_eq!(kind::<i32>("1.5"), DecodeErrorKind::InvalidValue);
        assert_eq!(kind::<i32>("\"1\""), DecodeErrorKind::InvalidType);
        assert_eq!(kind::<i64>("true"), DecodeErrorKind::InvalidType);
        assert_eq!(kind::<i64>("1.5"), DecodeErrorKind::InvalidValue);
        assert_eq!(kind::<u64>("-1"), DecodeErrorKind::InvalidValue);
        assert_eq!(
            kind::<i64>("9223372036854775808"),
            DecodeErrorKind::InvalidValue
        );
        assert_eq!(kind::<i64>("\"1.0\""), DecodeErrorKind::InvalidValue);
        assert_eq!(
            kind::<u64>("\"18446744073709551616\""),
            DecodeErrorKind::InvalidValue
        );
    }

    #[test]
    fn integer_fast_path_edges() {
        assert_eq!(from_str::<i32>("-0").unwrap(), 0);
        assert_eq!(from_str::<i32>("0").unwrap(), 0);
        assert_eq!(from_str::<i8>("-128").unwrap(), -128);
        assert_eq!(from_str::<u32>("1e2").unwrap(), 100);
        assert_eq!(from_str::<u32>("1E2").unwrap(), 100);
        assert_eq!(from_str::<i32>("-2.0e1").unwrap(), -20);
        // too large for the fast path's u64 accumulator
        assert_eq!(
            from_str::<u32>("100000000000000000000").unwrap_err().kind(),
            DecodeErrorKind::InvalidValue
        );
        for invalid in ["-", "01", "-01", "1.", "--1", "+1", "1e"] {
            assert_eq!(
                from_str::<i32>(invalid).unwrap_err().kind(),
                DecodeErrorKind::Syntax,
                "{invalid}"
            );
        }
    }

    #[test]
    fn escaped_keys_and_borrowed_strings() {
        // keys and enum values with escape sequences go through the scratch buffer
        let value: Value = from_str(r#"{"a\u0062":1,"plain":2,"\"quoted\"":3}"#).unwrap();
        let keys: Vec<&str> = value
            .as_object()
            .unwrap()
            .iter()
            .map(|(k, _)| k.as_str())
            .collect();
        assert_eq!(keys, ["ab", "plain", "\"quoted\""]);

        let mut d = JsonDecoder::new(r#"["plain", "esc\u0061ped", "x"]"#);
        d.begin_list().unwrap();
        assert!(d.next_element().unwrap());
        assert_eq!(d.decode_str().unwrap(), "plain");
        assert!(d.next_element().unwrap());
        assert_eq!(d.decode_str().unwrap(), "escaped");
        assert!(d.next_element().unwrap());
        assert_eq!(d.decode_str().unwrap(), "x");
        assert!(!d.next_element().unwrap());
    }

    #[test]
    fn strings() {
        assert_eq!(
            from_str::<String>(r#""a\"b\\c\/d\b\f\n\r\t\u0000\u00e9\ud83c\udf89""#).unwrap(),
            "a\"b\\c/d\u{8}\u{c}\n\r\t\u{0}é🎉"
        );
        assert_eq!(from_str::<String>("\"é🎉\"").unwrap(), "é🎉");
        for invalid in [
            "\"abc",
            "\"\\x\"",
            "\"\\u12\"",
            "\"\\ud83c\"",
            "\"\\udf89\"",
            "\"a\nb\"",
        ] {
            let err = from_str::<String>(invalid).unwrap_err();
            assert_eq!(err.kind(), DecodeErrorKind::Syntax, "{invalid:?}");
        }
    }

    #[test]
    fn containers() {
        assert_eq!(
            from_str::<Vec<Nullable<bool>>>(" [ true , null,false ] ").unwrap(),
            vec![
                Nullable::Present(true),
                Nullable::Null,
                Nullable::Present(false)
            ]
        );
        assert_eq!(from_str::<Vec<bool>>("[]").unwrap(), Vec::<bool>::new());
        let map = from_str::<BTreeMap<String, Vec<i32>>>(r#"{ "a" : [1], "b":[] }"#).unwrap();
        assert_eq!(map.get("a"), Some(&vec![1]));
        assert_eq!(map.get("b"), Some(&vec![]));
        for invalid in [
            "[1,]",
            "[,1]",
            "[1 2]",
            "{\"a\":1,}",
            "{\"a\" 1}",
            "{a:1}",
            "[1",
            "{",
        ] {
            assert_eq!(
                from_str::<Value>(invalid).unwrap_err().kind(),
                DecodeErrorKind::Syntax,
                "{invalid}"
            );
        }
    }

    #[test]
    fn error_paths() {
        let err = from_str::<BTreeMap<String, Vec<u8>>>(r#"{"a":[1,2],"b/c":[1,-2]}"#).unwrap_err();
        assert_eq!(err.instance_path(), "/b~1c/1");
        assert_eq!(err.kind(), DecodeErrorKind::InvalidValue);
    }

    #[test]
    fn any_values() {
        let value = from_str::<Value>(
            r#"{"a":null,"b":[true,"x",-1,18446744073709551615,1.5,1e300,100000000000000000000000]}"#,
        )
        .unwrap();
        let b = value.get("b").unwrap().as_list().unwrap();
        assert_eq!(b[2], Value::Number(Number::Int(-1)));
        assert!(matches!(b[3], Value::Number(Number::Uint(u64::MAX))));
        assert_eq!(b[4], Value::Number(Number::Float(1.5)));
        assert_eq!(b[5], Value::Number(Number::Float(1e300)));
        assert_eq!(b[6], Value::Number(Number::Float(1e23)));
    }

    #[test]
    fn skip_value_handles_all_types() {
        let input = r#"[{"a":{"b":[1,2.5e1,"x\"y",null,true,false,{}]},"c":"\u00e9"}, 1]"#;
        let mut d = JsonDecoder::new(input);
        d.begin_list().unwrap();
        assert!(d.next_element().unwrap());
        d.skip_value().unwrap();
        assert!(d.next_element().unwrap());
        assert_eq!(i32::decode(&mut d).unwrap(), 1);
        assert!(!d.next_element().unwrap());
        d.finish().unwrap();
    }

    #[test]
    fn trailing_data_is_rejected() {
        assert!(from_str::<bool>("true true").is_err());
        assert!(from_str::<bool>("true \n").is_ok());
        assert!(from_str::<Value>("").is_err());
    }

    #[test]
    fn depth_limit() {
        let deep = "[".repeat(200) + &"]".repeat(200);
        let err = from_str::<Value>(&deep).unwrap_err();
        assert_eq!(err.kind(), DecodeErrorKind::DepthLimitExceeded);
        let mut d = JsonDecoder::new(&deep).with_max_depth(200);
        Value::decode(&mut d).unwrap();
        let mut d = JsonDecoder::new(&deep);
        assert_eq!(
            d.skip_value().unwrap_err().kind(),
            DecodeErrorKind::DepthLimitExceeded
        );
    }

    #[test]
    fn invalid_utf8_is_rejected() {
        assert_eq!(
            crate::json::from_slice::<String>(b"\"\xff\"")
                .unwrap_err()
                .kind(),
            DecodeErrorKind::Syntax
        );
    }
}
