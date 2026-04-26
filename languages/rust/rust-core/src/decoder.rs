use std::{num::ParseIntError, str::Utf8Error};

use crate::{Nullable, any_type::AnyType};

pub trait Decodable: Sized {
    fn decode<D: Decoder>(decoder: &mut D) -> Result<Self, DecodeError>;
}

pub trait Decoder {
    fn decode_string(&mut self) -> Result<String, DecodeError>;
    fn decode_boolean(&mut self) -> Result<bool, DecodeError>;
    fn decode_timestamp(&mut self) -> Result<String, DecodeError>;
    fn decode_float32(&mut self) -> Result<f32, DecodeError>;
    fn decode_float64(&mut self) -> Result<f64, DecodeError>;
    fn decode_int8(&mut self) -> Result<i8, DecodeError>;
    fn decode_uint8(&mut self) -> Result<u8, DecodeError>;
    fn decode_int16(&mut self) -> Result<i16, DecodeError>;
    fn decode_uint16(&mut self) -> Result<u16, DecodeError>;
    fn decode_int32(&mut self) -> Result<i32, DecodeError>;
    fn decode_uint32(&mut self) -> Result<u32, DecodeError>;
    fn decode_int64(&mut self) -> Result<i64, DecodeError>;
    fn decode_uint64(&mut self) -> Result<u64, DecodeError>;
    fn decode_nullable<T: Decodable>(&mut self) -> Result<Nullable<T>, DecodeError>;
    fn decode_any(&mut self) -> Result<AnyType, DecodeError>;

    fn begin_object(&mut self) -> Result<(), DecodeError>;
    fn end_object(&mut self) -> Result<(), DecodeError>;
    /// returns the next field name, or None if the object ended.
    fn next_field(&mut self) -> Result<Option<String>, DecodeError>;

    fn begin_list(&mut self) -> Result<(), DecodeError>;
    fn end_list(&mut self) -> Result<(), DecodeError>;
    fn has_next_element(&mut self) -> Result<bool, DecodeError>;

    fn skip_value(&mut self) -> Result<(), DecodeError>;
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
