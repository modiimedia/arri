use sonic_rs::LazyValue;
use sonic_rs::Read;

use crate::decoder::{DecodeError, Decoder};

pub struct JsonDecoder<'a> {
    de: sonic_rs::Deserializer<sonic_rs::Read<'a>>,
}

enum ScopeState {
    Object,
    List,
}

impl<'a> JsonDecoder<'a> {
    pub fn new(input: &'a [u8]) -> Self {
        Self {
            de: sonic_rs::Deserializer::from_slice(input),
        }
    }

    pub fn reader(&mut self) -> &mut sonic_rs::Read<'a> {
        todo!()
    }
}

impl<'a> Decoder for JsonDecoder<'a> {
    fn decode_string(&mut self) -> Result<String, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_boolean(&mut self) -> Result<bool, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_timestamp(&mut self) -> Result<String, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_float32(&mut self) -> Result<f32, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_float64(&mut self) -> Result<f64, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_int8(&mut self) -> Result<i8, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_uint8(&mut self) -> Result<u8, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_int16(&mut self) -> Result<i16, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_uint16(&mut self) -> Result<u16, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_int32(&mut self) -> Result<i32, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_uint32(&mut self) -> Result<u32, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_int64(&mut self) -> Result<i64, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_uint64(&mut self) -> Result<u64, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_nullable<T: crate::decoder::Decodable>(
        &mut self,
    ) -> Result<crate::Nullable<T>, crate::decoder::DecodeError> {
        todo!()
    }

    fn begin_object(&mut self) -> Result<(), crate::decoder::DecodeError> {
        todo!()
    }

    fn end_object(&mut self) -> Result<(), crate::decoder::DecodeError> {
        todo!()
    }

    fn next_field(&mut self) -> Result<Option<String>, crate::decoder::DecodeError> {
        todo!()
    }

    fn begin_list(&mut self) -> Result<(), crate::decoder::DecodeError> {
        todo!()
    }

    fn end_list(&mut self) -> Result<(), crate::decoder::DecodeError> {
        todo!()
    }

    fn has_next_element(&mut self) -> Result<bool, crate::decoder::DecodeError> {
        todo!()
    }

    fn skip_value(&mut self) -> Result<(), crate::decoder::DecodeError> {
        todo!()
    }
}
