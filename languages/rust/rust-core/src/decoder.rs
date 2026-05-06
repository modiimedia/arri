use std::{num::ParseIntError, str::Utf8Error};

use crate::{Nullable, any_type::AnyType};

pub trait Decodable: Sized {
    fn decode<V: Visitor, D: Decoder<V>>(decoder: &mut D) -> Result<Self, DecodeError>;
}

pub trait Visitor {
    type Value;

    fn visit_str(&self, _: &str) -> Result<Self::Value, DecodeError> {
        Err(DecodeError::InvalidType)
    }

    fn visit_boolean(&self, _: bool) -> Result<Self::Value, DecodeError> {
        Err(DecodeError::InvalidType)
    }

    fn visit_int8(&self, _: i8) -> Result<Self::Value, DecodeError> {
        Err(DecodeError::InvalidType)
    }

    fn visit_uint8(&self, _: u8) -> Result<Self::Value, DecodeError> {
        Err(DecodeError::InvalidType)
    }

    // TODO: rest of the types
}

pub trait Decoder<V: Visitor> {
    fn decode_string(&mut self, visitor: V) -> Result<String, DecodeError>;
    fn decode_boolean(&mut self, visitor: V) -> Result<bool, DecodeError>;
    fn decode_timestamp(&mut self, visitor: V) -> Result<String, DecodeError>;
    fn decode_float32(&mut self, visitor: V) -> Result<f32, DecodeError>;
    fn decode_float64(&mut self, visitor: V) -> Result<f64, DecodeError>;
    fn decode_int8(&mut self, visitor: V) -> Result<i8, DecodeError>;
    fn decode_uint8(&mut self, visitor: V) -> Result<u8, DecodeError>;
    fn decode_int16(&mut self, visitor: V) -> Result<i16, DecodeError>;
    fn decode_uint16(&mut self, visitor: V) -> Result<u16, DecodeError>;
    fn decode_int32(&mut self, visitor: V) -> Result<i32, DecodeError>;
    fn decode_uint32(&mut self, visitor: V) -> Result<u32, DecodeError>;
    fn decode_int64(&mut self, visitor: V) -> Result<i64, DecodeError>;
    fn decode_uint64(&mut self, visitor: V) -> Result<u64, DecodeError>;
    fn decode_nullable<T: Decodable>(&mut self, visitor: V) -> Result<Nullable<T>, DecodeError>;
    fn decode_any(&mut self, visitor: V) -> Result<AnyType, DecodeError>;

    fn begin_object(&mut self, visitor: V) -> Result<(), DecodeError>;
    fn end_object(&mut self, visitor: V) -> Result<(), DecodeError>;
    /// returns the next field name, or None if the object ended.
    fn next_field(&mut self, visitor: V) -> Result<Option<String>, DecodeError>;

    fn begin_list(&mut self, visitor: V) -> Result<(), DecodeError>;
    fn end_list(&mut self, visitor: V) -> Result<(), DecodeError>;
    fn has_next_element(&mut self, visitor: V) -> Result<bool, DecodeError>;

    fn skip_value(&mut self, visitor: V) -> Result<(), DecodeError>;
}

pub enum DecodeError {
    InvalidType,
}

impl From<ParseIntError> for DecodeError {
    fn from(value: ParseIntError) -> Self {
        todo!()
    }
}

impl From<Utf8Error> for DecodeError {
    fn from(value: Utf8Error) -> Self {
        todo!()
    }
}
