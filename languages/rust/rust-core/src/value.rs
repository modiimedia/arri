use std::borrow::Cow;

use crate::{
    ArriSchema, Decode, DecodeError, Decoder, Encode, EncodeError, Encoder, SchemaContext,
    Timestamp, TypeDef,
};

/// A dynamically typed value. Corresponds to the "empty" schema form which accepts anything.
///
/// Object entries are stored in a `Vec` so that the original key order is preserved. Duplicate keys
/// are kept as well since a `Value` represents arbitrary input. They're rejected once the value is
/// decoded into a type with a schema (see [`DecodeErrorKind::DuplicateKey`](crate::DecodeErrorKind::DuplicateKey)).
#[derive(Debug, Clone, PartialEq, Default)]
pub enum Value {
    #[default]
    Null,
    Bool(bool),
    Number(Number),
    String(String),
    List(Vec<Value>),
    Object(Vec<(String, Value)>),
}

/// A number stored inside of a [`Value`]
///
/// Comparisons are numeric, so `Number::Int(1) == Number::Uint(1)`.
#[derive(Debug, Clone, Copy)]
pub enum Number {
    Int(i64),
    Uint(u64),
    Float(f64),
}

impl Number {
    pub fn as_i64(&self) -> Option<i64> {
        match *self {
            Number::Int(v) => Some(v),
            Number::Uint(v) => i64::try_from(v).ok(),
            Number::Float(v) => float_to_int(v),
        }
    }

    pub fn as_u64(&self) -> Option<u64> {
        match *self {
            Number::Int(v) => u64::try_from(v).ok(),
            Number::Uint(v) => Some(v),
            Number::Float(v) => float_to_int(v),
        }
    }

    pub fn as_f64(&self) -> f64 {
        match *self {
            Number::Int(v) => v as f64,
            Number::Uint(v) => v as f64,
            Number::Float(v) => v,
        }
    }

    /// The value as an integer if it's a whole number
    pub(crate) fn as_i128(&self) -> Option<i128> {
        match *self {
            Number::Int(v) => Some(v as i128),
            Number::Uint(v) => Some(v as i128),
            Number::Float(v) => float_to_int(v),
        }
    }
}

fn float_to_int<T: TryFrom<i128>>(v: f64) -> Option<T> {
    // f64 can represent integers well beyond i128 so the range check must happen before the cast
    if v.is_finite() && v.fract() == 0.0 && v.abs() < 1e38 {
        T::try_from(v as i128).ok()
    } else {
        None
    }
}

impl PartialEq for Number {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (Number::Float(a), Number::Float(b)) => a == b,
            (Number::Float(_), _) | (_, Number::Float(_)) => self.as_f64() == other.as_f64(),
            _ => self.as_i128() == other.as_i128(),
        }
    }
}

impl From<i64> for Number {
    fn from(value: i64) -> Self {
        Number::Int(value)
    }
}

impl From<u64> for Number {
    fn from(value: u64) -> Self {
        match i64::try_from(value) {
            Ok(v) => Number::Int(v),
            Err(_) => Number::Uint(value),
        }
    }
}

impl From<f64> for Number {
    fn from(value: f64) -> Self {
        Number::Float(value)
    }
}

impl Value {
    pub fn is_null(&self) -> bool {
        matches!(self, Value::Null)
    }

    pub fn as_bool(&self) -> Option<bool> {
        match self {
            Value::Bool(v) => Some(*v),
            _ => None,
        }
    }

    pub fn as_number(&self) -> Option<Number> {
        match self {
            Value::Number(v) => Some(*v),
            _ => None,
        }
    }

    pub fn as_str(&self) -> Option<&str> {
        match self {
            Value::String(v) => Some(v),
            _ => None,
        }
    }

    pub fn as_list(&self) -> Option<&[Value]> {
        match self {
            Value::List(v) => Some(v),
            _ => None,
        }
    }

    pub fn as_object(&self) -> Option<&[(String, Value)]> {
        match self {
            Value::Object(v) => Some(v),
            _ => None,
        }
    }

    /// Get the value of an object key. If the key appears multiple times the last one wins.
    pub fn get(&self, key: &str) -> Option<&Value> {
        self.as_object()?
            .iter()
            .rev()
            .find(|(k, _)| k == key)
            .map(|(_, v)| v)
    }

    fn kind(&self) -> &'static str {
        match self {
            Value::Null => "null",
            Value::Bool(_) => "boolean",
            Value::Number(_) => "number",
            Value::String(_) => "string",
            Value::List(_) => "array",
            Value::Object(_) => "object",
        }
    }
}

macro_rules! impl_value_from {
    ($($ty:ty => $variant:ident($conv:expr)),* $(,)?) => {
        $(
            impl From<$ty> for Value {
                fn from(value: $ty) -> Self {
                    Value::$variant($conv(value))
                }
            }
        )*
    };
}

impl_value_from! {
    bool => Bool(|v| v),
    i32 => Number(|v: i32| Number::Int(v as i64)),
    i64 => Number(Number::Int),
    u32 => Number(|v: u32| Number::Int(v as i64)),
    u64 => Number(Number::from),
    f64 => Number(Number::Float),
    Number => Number(|v| v),
    String => String(|v| v),
    &str => String(str::to_string),
    Vec<Value> => List(|v| v),
    Vec<(String, Value)> => Object(|v| v),
}

impl ArriSchema for Value {
    fn generic_name() -> Cow<'static, str> {
        Cow::Borrowed("Any")
    }

    fn type_def(_: &mut SchemaContext) -> TypeDef {
        TypeDef::empty()
    }
}

impl Encode for Value {
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        match self {
            Value::Null => e.encode_null(),
            Value::Bool(v) => e.encode_bool(*v),
            Value::Number(v) => e.encode_number(*v),
            Value::String(v) => e.encode_str(v),
            Value::List(items) => {
                e.begin_list(items.len())?;
                for item in items {
                    item.encode(e)?;
                }
                e.end_list()
            }
            Value::Object(entries) => {
                e.begin_object(entries.len())?;
                for (key, value) in entries {
                    e.encode_key(key)?;
                    value.encode(e)?;
                }
                e.end_object()
            }
        }
    }
}

impl Decode for Value {
    fn decode<D: Decoder + ?Sized>(d: &mut D) -> Result<Self, DecodeError> {
        d.decode_any()
    }
}

/// Convert any [`Encode`] type into a [`Value`]
pub fn to_value<T: Encode + ?Sized>(value: &T) -> Result<Value, EncodeError> {
    let mut encoder = ValueEncoder::new();
    value.encode(&mut encoder)?;
    encoder.finish()
}

/// Decode any [`Decode`] type from a [`Value`]
pub fn from_value<T: Decode>(value: Value) -> Result<T, DecodeError> {
    T::decode(&mut ValueDecoder::new(value))
}

/// An [`Encoder`] that builds a [`Value`].
///
/// Timestamps are stored as RFC 3339 strings.
#[derive(Debug, Default)]
pub struct ValueEncoder {
    stack: Vec<Partial>,
    result: Option<Value>,
}

#[derive(Debug)]
enum Partial {
    List(Vec<Value>),
    Object(Vec<(String, Value)>, Option<String>),
}

impl ValueEncoder {
    pub fn new() -> Self {
        Self::default()
    }

    /// Returns the encoded value
    pub fn finish(self) -> Result<Value, EncodeError> {
        if !self.stack.is_empty() {
            return Err(EncodeError::custom("an object or list was not closed"));
        }
        self.result
            .ok_or_else(|| EncodeError::custom("no value was encoded"))
    }

    fn push(&mut self, value: Value) -> Result<(), EncodeError> {
        match self.stack.last_mut() {
            None => {
                if self.result.is_some() {
                    return Err(EncodeError::custom("multiple root values were encoded"));
                }
                self.result = Some(value);
            }
            Some(Partial::List(items)) => items.push(value),
            Some(Partial::Object(entries, key)) => {
                let key = key
                    .take()
                    .ok_or_else(|| EncodeError::custom("object value was encoded without a key"))?;
                entries.push((key, value));
            }
        }
        Ok(())
    }
}

fn check_finite(v: f64) -> Result<f64, EncodeError> {
    if v.is_finite() {
        Ok(v)
    } else {
        Err(EncodeError::NonFiniteFloat(v))
    }
}

impl Encoder for ValueEncoder {
    fn encode_null(&mut self) -> Result<(), EncodeError> {
        self.push(Value::Null)
    }

    fn encode_bool(&mut self, v: bool) -> Result<(), EncodeError> {
        self.push(Value::Bool(v))
    }

    fn encode_f32(&mut self, v: f32) -> Result<(), EncodeError> {
        // round trip through the shortest decimal representation so that 1.1f32 becomes 1.1 rather than 1.100000023841858
        let v: f64 = v.to_string().parse().unwrap_or(v as f64);
        self.push(Value::Number(Number::Float(check_finite(v)?)))
    }

    fn encode_f64(&mut self, v: f64) -> Result<(), EncodeError> {
        self.push(Value::Number(Number::Float(check_finite(v)?)))
    }

    fn encode_i8(&mut self, v: i8) -> Result<(), EncodeError> {
        self.push(Value::Number(Number::Int(v as i64)))
    }

    fn encode_u8(&mut self, v: u8) -> Result<(), EncodeError> {
        self.push(Value::Number(Number::Int(v as i64)))
    }

    fn encode_i16(&mut self, v: i16) -> Result<(), EncodeError> {
        self.push(Value::Number(Number::Int(v as i64)))
    }

    fn encode_u16(&mut self, v: u16) -> Result<(), EncodeError> {
        self.push(Value::Number(Number::Int(v as i64)))
    }

    fn encode_i32(&mut self, v: i32) -> Result<(), EncodeError> {
        self.push(Value::Number(Number::Int(v as i64)))
    }

    fn encode_u32(&mut self, v: u32) -> Result<(), EncodeError> {
        self.push(Value::Number(Number::Int(v as i64)))
    }

    fn encode_i64(&mut self, v: i64) -> Result<(), EncodeError> {
        self.push(Value::Number(Number::Int(v)))
    }

    fn encode_u64(&mut self, v: u64) -> Result<(), EncodeError> {
        self.push(Value::Number(Number::from(v)))
    }

    fn encode_str(&mut self, v: &str) -> Result<(), EncodeError> {
        self.push(Value::String(v.to_string()))
    }

    fn encode_timestamp(&mut self, v: &Timestamp) -> Result<(), EncodeError> {
        self.push(Value::String(v.to_rfc3339()))
    }

    fn encode_number(&mut self, v: Number) -> Result<(), EncodeError> {
        if let Number::Float(f) = v {
            check_finite(f)?;
        }
        self.push(Value::Number(v))
    }

    fn begin_object(&mut self, len: usize) -> Result<(), EncodeError> {
        self.stack
            .push(Partial::Object(Vec::with_capacity(len), None));
        Ok(())
    }

    fn encode_key(&mut self, key: &str) -> Result<(), EncodeError> {
        match self.stack.last_mut() {
            Some(Partial::Object(_, pending @ None)) => {
                *pending = Some(key.to_string());
                Ok(())
            }
            Some(Partial::Object(_, Some(_))) => Err(EncodeError::custom(
                "object key was encoded without a value",
            )),
            _ => Err(EncodeError::custom(
                "object key was encoded outside of an object",
            )),
        }
    }

    fn end_object(&mut self) -> Result<(), EncodeError> {
        match self.stack.pop() {
            Some(Partial::Object(entries, None)) => self.push(Value::Object(entries)),
            Some(Partial::Object(_, Some(_))) => Err(EncodeError::custom(
                "object key was encoded without a value",
            )),
            _ => Err(EncodeError::custom(
                "end_object() called without a matching begin_object()",
            )),
        }
    }

    fn begin_list(&mut self, len: usize) -> Result<(), EncodeError> {
        self.stack.push(Partial::List(Vec::with_capacity(len)));
        Ok(())
    }

    fn end_list(&mut self) -> Result<(), EncodeError> {
        match self.stack.pop() {
            Some(Partial::List(items)) => self.push(Value::List(items)),
            _ => Err(EncodeError::custom(
                "end_list() called without a matching begin_list()",
            )),
        }
    }
}

/// A [`Decoder`] that reads from a [`Value`].
///
/// This decoder accepts values produced by any format. Since some formats (such as JSON) encode
/// `int64`, `uint64`, and `timestamp` values as strings, those types can be read from strings
/// as well as their native representation.
#[derive(Debug)]
pub struct ValueDecoder {
    next: Option<Value>,
    stack: Vec<Frame>,
    /// holds the most recent key / borrowed string so that a reference to it can be returned
    current: String,
}

#[derive(Debug)]
enum Frame {
    List(std::vec::IntoIter<Value>),
    Object(std::vec::IntoIter<(String, Value)>),
}

impl ValueDecoder {
    pub fn new(value: Value) -> Self {
        Self {
            next: Some(value),
            stack: Vec::new(),
            current: String::new(),
        }
    }

    fn take(&mut self) -> Result<Value, DecodeError> {
        self.next
            .take()
            .ok_or_else(|| DecodeError::custom("decoder has no value to read"))
    }

    fn take_number(&mut self, expected: &str, allow_string: bool) -> Result<i128, DecodeError> {
        match self.take()? {
            Value::Number(n) => n.as_i128().ok_or_else(|| {
                DecodeError::invalid_value(format!(
                    "expected {expected} but found a fractional number"
                ))
            }),
            Value::String(s) if allow_string => crate::json::parse_integer(&s).ok_or_else(|| {
                DecodeError::invalid_value(format!("\"{s}\" is not a valid {expected}"))
            }),
            other => Err(DecodeError::invalid_type(expected, other.kind())),
        }
    }
}

macro_rules! value_decode_int {
    ($($method:ident => $ty:ty, $name:literal, $allow_string:literal);* $(;)?) => {
        $(
            fn $method(&mut self) -> Result<$ty, DecodeError> {
                let n = self.take_number($name, $allow_string)?;
                <$ty>::try_from(n).map_err(|_| {
                    DecodeError::invalid_value(format!("{n} is out of range for {}", $name))
                })
            }
        )*
    };
}

impl Decoder for ValueDecoder {
    fn decode_null(&mut self) -> Result<bool, DecodeError> {
        if matches!(self.next, Some(Value::Null)) {
            self.next = None;
            return Ok(true);
        }
        Ok(false)
    }

    fn decode_bool(&mut self) -> Result<bool, DecodeError> {
        match self.take()? {
            Value::Bool(v) => Ok(v),
            other => Err(DecodeError::invalid_type("boolean", other.kind())),
        }
    }

    fn decode_f32(&mut self) -> Result<f32, DecodeError> {
        match self.take()? {
            Value::Number(n) => {
                let v = n.as_f64() as f32;
                if v.is_finite() {
                    Ok(v)
                } else {
                    Err(DecodeError::invalid_value(format!(
                        "{} is out of range for float32",
                        n.as_f64()
                    )))
                }
            }
            other => Err(DecodeError::invalid_type("float32", other.kind())),
        }
    }

    fn decode_f64(&mut self) -> Result<f64, DecodeError> {
        match self.take()? {
            Value::Number(n) if n.as_f64().is_finite() => Ok(n.as_f64()),
            Value::Number(n) => Err(DecodeError::invalid_value(format!(
                "{} is out of range for float64",
                n.as_f64()
            ))),
            other => Err(DecodeError::invalid_type("float64", other.kind())),
        }
    }

    value_decode_int! {
        decode_i8 => i8, "int8", false;
        decode_u8 => u8, "uint8", false;
        decode_i16 => i16, "int16", false;
        decode_u16 => u16, "uint16", false;
        decode_i32 => i32, "int32", false;
        decode_u32 => u32, "uint32", false;
        decode_i64 => i64, "int64", true;
        decode_u64 => u64, "uint64", true;
    }

    fn decode_string(&mut self) -> Result<String, DecodeError> {
        match self.take()? {
            Value::String(v) => Ok(v),
            other => Err(DecodeError::invalid_type("string", other.kind())),
        }
    }

    fn decode_str(&mut self) -> Result<&str, DecodeError> {
        match self.take()? {
            Value::String(v) => {
                self.current = v;
                Ok(&self.current)
            }
            other => Err(DecodeError::invalid_type("string", other.kind())),
        }
    }

    fn decode_timestamp(&mut self) -> Result<Timestamp, DecodeError> {
        match self.take()? {
            Value::String(v) => {
                Timestamp::parse(&v).map_err(|e| DecodeError::invalid_value(e.to_string()))
            }
            other => Err(DecodeError::invalid_type("timestamp", other.kind())),
        }
    }

    fn decode_any(&mut self) -> Result<Value, DecodeError> {
        self.take()
    }

    fn begin_object(&mut self) -> Result<Option<usize>, DecodeError> {
        match self.take()? {
            Value::Object(entries) => {
                let len = entries.len();
                self.stack.push(Frame::Object(entries.into_iter()));
                Ok(Some(len))
            }
            other => Err(DecodeError::invalid_type("object", other.kind())),
        }
    }

    fn next_key(&mut self) -> Result<Option<&str>, DecodeError> {
        match self.stack.last_mut() {
            Some(Frame::Object(entries)) => match entries.next() {
                Some((k, v)) => {
                    self.current = k;
                    self.next = Some(v);
                    Ok(Some(&self.current))
                }
                None => {
                    self.stack.pop();
                    Ok(None)
                }
            },
            _ => Err(DecodeError::custom(
                "next_key() called outside of an object",
            )),
        }
    }

    fn begin_list(&mut self) -> Result<Option<usize>, DecodeError> {
        match self.take()? {
            Value::List(items) => {
                let len = items.len();
                self.stack.push(Frame::List(items.into_iter()));
                Ok(Some(len))
            }
            other => Err(DecodeError::invalid_type("array", other.kind())),
        }
    }

    fn next_element(&mut self) -> Result<bool, DecodeError> {
        match self.stack.last_mut() {
            Some(Frame::List(items)) => match items.next() {
                Some(v) => {
                    self.next = Some(v);
                    Ok(true)
                }
                None => {
                    self.stack.pop();
                    Ok(false)
                }
            },
            _ => Err(DecodeError::custom(
                "next_element() called outside of a list",
            )),
        }
    }

    fn skip_value(&mut self) -> Result<(), DecodeError> {
        self.take().map(|_| ())
    }
}

#[cfg(test)]
mod tests {
    use std::collections::BTreeMap;

    use super::*;
    use crate::Nullable;

    #[test]
    fn number_equality_is_numeric() {
        assert_eq!(Number::Int(1), Number::Uint(1));
        assert_eq!(Number::Int(1), Number::Float(1.0));
        assert_ne!(Number::Int(-1), Number::Uint(u64::MAX));
        assert_eq!(Number::from(u64::MAX), Number::Uint(u64::MAX));
    }

    #[test]
    fn round_trip_through_value() {
        let mut input = BTreeMap::new();
        input.insert(
            "a".to_string(),
            vec![Nullable::Present(1i64), Nullable::Null],
        );
        input.insert("b".to_string(), vec![]);
        let value = to_value(&input).unwrap();
        assert_eq!(
            value,
            Value::Object(vec![
                (
                    "a".into(),
                    Value::List(vec![Value::Number(Number::Int(1)), Value::Null])
                ),
                ("b".into(), Value::List(vec![])),
            ])
        );
        let output: BTreeMap<String, Vec<Nullable<i64>>> = from_value(value).unwrap();
        assert_eq!(output, input);
    }

    #[test]
    fn value_decoder_reads_json_style_representations() {
        assert_eq!(from_value::<i64>(Value::from("-12")).unwrap(), -12);
        assert_eq!(from_value::<u64>(Value::from(u64::MAX)).unwrap(), u64::MAX);
        assert_eq!(from_value::<i8>(Value::from(4.0)).unwrap(), 4);
        assert!(from_value::<i8>(Value::from("4")).is_err());
        assert!(from_value::<i8>(Value::from(4.5)).is_err());
        assert!(from_value::<u8>(Value::from(256)).is_err());
        assert_eq!(
            from_value::<Timestamp>(Value::from("2001-01-01T16:00:00.000Z"))
                .unwrap()
                .unix_seconds(),
            978_364_800
        );
    }

    #[test]
    fn value_encoder_rejects_non_finite_floats() {
        assert!(matches!(
            to_value(&f64::NAN),
            Err(EncodeError::NonFiniteFloat(_))
        ));
        assert_eq!(to_value(&1.1f32).unwrap(), Value::from(1.1));
    }
}
