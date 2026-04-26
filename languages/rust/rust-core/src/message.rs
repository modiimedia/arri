use std::collections::HashMap;
use std::ffi::c_float;
use std::{num::ParseIntError, str::Utf8Error};

use crate::any_type::AnyType;
use crate::encoder::Encoder;

pub trait Message: Sized {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self);

    fn size_hint(&self) -> usize {
        0
    }
}

impl Message for bool {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.encode_boolean(*v);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Message for f32 {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.encode_float32(*v);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Message for f64 {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.encode_float64(*v);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Message for i8 {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.encode_int8(*v);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Message for u8 {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.encode_uint8(*v);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Message for i16 {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.encode_int16(*v);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Message for u16 {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.encode_uint16(*v);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Message for i32 {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.encode_int32(*v);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Message for u32 {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.encode_uint32(*v);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Message for i64 {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.encode_int64(*v);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Message for u64 {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.encode_uint64(*v);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Message for String {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.encode_string(&v);
    }

    fn size_hint(&self) -> usize {
        self.len()
    }
}

impl Message for &str {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.encode_string(&v);
    }
    fn size_hint(&self) -> usize {
        self.len()
    }
}

impl<M: Message> Message for Vec<M> {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.begin_list();
        for item in v {
            <M as Message>::encode(encoder, item);
        }
        encoder.end_list();
    }

    fn size_hint(&self) -> usize {
        let mut size = 0;
        for item in self {
            size += item.size_hint()
        }
        size
    }
}

#[cfg(feature = "chrono")]
impl<Tz: chrono::TimeZone> Message for chrono::DateTime<Tz> {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.encode_timestamp(&v.to_rfc3339());
    }

    fn size_hint(&self) -> usize {
        let str = &self.to_rfc3339().to_string();
        str.len()
    }
}

#[cfg(feature = "chrono")]
impl Message for chrono::NaiveDateTime {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        let date_str = v.and_utc().to_rfc3339();
        encoder.encode_timestamp(&date_str);
    }
}

impl Message for AnyType {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        match v {
            AnyType::Boolean(val) => encoder.encode_boolean(*val),
            AnyType::Number(val) => match val {
                crate::any_type::NumberType::Float(c_float) => encoder.encode_float64(*c_float),
                crate::any_type::NumberType::Int(c_int) => encoder.encode_int32(*c_int),
                crate::any_type::NumberType::Uint(c_uint) => encoder.encode_uint32(*c_uint),
                crate::any_type::NumberType::BigInt(c_big_int) => encoder.encode_int64(*c_big_int),
                crate::any_type::NumberType::BigUint(c_big_uint) => {
                    encoder.encode_uint64(*c_big_uint)
                }
            },
            AnyType::String(val) => encoder.encode_string(&val),
            AnyType::Object(val) => {
                encoder.begin_object();
                for (key, val) in val.iter() {
                    encoder.encode_field(key);
                    Self::encode(encoder, val);
                }
                encoder.end_object();
            }
            AnyType::List(vals) => {
                encoder.begin_list();
                for item in vals.iter() {
                    Self::encode(encoder, item);
                }
                encoder.end_list();
            }
        }
    }
}

#[cfg(feature = "serde")]
impl Message for serde_json::Value {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        match v {
            serde_json::Value::Null => {
                encoder.encode_null();
            }
            serde_json::Value::Bool(val) => {
                encoder.encode_boolean(*val);
            }
            serde_json::Value::Number(number) => {
                encoder.encode_float64(number.as_f64().unwrap_or_default());
            }
            serde_json::Value::String(str) => {
                encoder.encode_string(&str);
            }
            serde_json::Value::Array(values) => {
                encoder.begin_list();
                for item in values.iter() {
                    Self::encode(encoder, &item);
                }
                encoder.end_list();
            }
            serde_json::Value::Object(map) => {
                encoder.begin_object();
                for (key, val) in map.iter() {
                    encoder.encode_field(key);
                    Self::encode(encoder, val);
                }
                encoder.end_object();
            }
        }
    }
}

impl<V: Message> Message for HashMap<String, V> {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.begin_object();
        for (key, val) in v.iter() {
            encoder.encode_field(key);
            <V as Message>::encode(encoder, val);
        }
        encoder.end_object();
    }
}

impl<V: Message> Message for HashMap<&str, V> {
    fn encode<T: Encoder>(encoder: &mut T, v: &Self) {
        encoder.begin_object();
        for (key, val) in v.iter() {
            encoder.encode_field(key);
            <V as Message>::encode(encoder, val);
        }
        encoder.end_object();
    }
}
