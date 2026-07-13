use crate::decoder::Visitor;
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

impl<'a, V: Visitor> Decoder<V> for JsonDecoder<'a> {
    fn decode_string(&mut self, visitor: V) -> Result<String, crate::decoder::DecodeError> {
        // visitor.visit_str(_)
        todo!()
    }

    fn decode_boolean(&mut self, visitor: V) -> Result<bool, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_timestamp(&mut self, visitor: V) -> Result<String, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_float32(&mut self, visitor: V) -> Result<f32, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_float64(&mut self, visitor: V) -> Result<f64, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_int8(&mut self, visitor: V) -> Result<i8, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_uint8(&mut self, visitor: V) -> Result<u8, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_int16(&mut self, visitor: V) -> Result<i16, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_uint16(&mut self, visitor: V) -> Result<u16, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_int32(&mut self, visitor: V) -> Result<i32, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_uint32(&mut self, visitor: V) -> Result<u32, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_int64(&mut self, visitor: V) -> Result<i64, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_uint64(&mut self, visitor: V) -> Result<u64, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_nullable<T: crate::decoder::Decodable>(
        &mut self,
        visitor: V,
    ) -> Result<crate::Nullable<T>, crate::decoder::DecodeError> {
        todo!()
    }

    fn decode_any(&mut self, visitor: V) -> Result<crate::any_type::AnyType, DecodeError> {
        todo!()
    }

    fn begin_object(&mut self, visitor: V) -> Result<(), crate::decoder::DecodeError> {
        todo!()
    }

    fn end_object(&mut self, visitor: V) -> Result<(), crate::decoder::DecodeError> {
        todo!()
    }

    fn next_field(&mut self, visitor: V) -> Result<Option<String>, crate::decoder::DecodeError> {
        todo!()
    }

    fn begin_list(&mut self, visitor: V) -> Result<(), crate::decoder::DecodeError> {
        todo!()
    }

    fn end_list(&mut self, visitor: V) -> Result<(), crate::decoder::DecodeError> {
        todo!()
    }

    fn has_next_element(&mut self, visitor: V) -> Result<bool, crate::decoder::DecodeError> {
        todo!()
    }

    fn skip_value(&mut self, visitor: V) -> Result<(), crate::decoder::DecodeError> {
        todo!()
    }
}
