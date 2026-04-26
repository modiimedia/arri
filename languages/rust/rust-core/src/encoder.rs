use std::collections::HashMap;

use indexmap::IndexMap;

use crate::{
    any_type::AnyType,
    type_definition::{Schema, SchemaMetadata, Type},
};

pub trait Encodable: Sized {
    fn encode<T: Encoder>(&self, encoder: &mut T);

    fn size_hint(&self) -> usize {
        0
    }
}

pub trait Encoder {
    fn encode_boolean(&mut self, v: bool);
    fn encode_float32(&mut self, v: f32);
    fn encode_float64(&mut self, v: f64);
    fn encode_int8(&mut self, v: i8);
    fn encode_uint8(&mut self, v: u8);
    fn encode_int16(&mut self, v: i16);
    fn encode_uint16(&mut self, v: u16);
    fn encode_int32(&mut self, v: i32);
    fn encode_uint32(&mut self, v: u32);
    fn encode_int64(&mut self, v: i64);
    fn encode_uint64(&mut self, v: u64);
    fn encode_string(&mut self, v: &str);
    fn encode_timestamp(&mut self, v: &str); // an RFC3339 string
    fn encode_null(&mut self);

    fn begin_object(&mut self);
    fn end_object(&mut self);
    fn encode_field(&mut self, field: &str);

    fn begin_list(&mut self);
    fn end_list(&mut self);
}

impl Encodable for bool {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.encode_boolean(*self);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Encodable for f32 {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.encode_float32(*self);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Encodable for f64 {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.encode_float64(*self);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Encodable for i8 {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.encode_int8(*self);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Encodable for u8 {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.encode_uint8(*self);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Encodable for i16 {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.encode_int16(*self);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Encodable for u16 {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.encode_uint16(*self);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Encodable for i32 {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.encode_int32(*self);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Encodable for u32 {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.encode_uint32(*self);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Encodable for i64 {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.encode_int64(*self);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Encodable for u64 {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.encode_uint64(*self);
    }

    fn size_hint(&self) -> usize {
        self.to_owned() as usize
    }
}

impl Encodable for String {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.encode_string(&self);
    }

    fn size_hint(&self) -> usize {
        self.len()
    }
}

impl Encodable for &str {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.encode_string(&self);
    }
    fn size_hint(&self) -> usize {
        self.len()
    }
}

impl<M: Encodable> Encodable for Vec<M> {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.begin_list();
        for item in self {
            <M as Encodable>::encode(item, encoder);
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
impl<Tz: chrono::TimeZone> Encodable for chrono::DateTime<Tz> {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.encode_timestamp(&self.to_rfc3339());
    }

    fn size_hint(&self) -> usize {
        let str = &self.to_rfc3339().to_string();
        str.len()
    }
}

#[cfg(feature = "chrono")]
impl Encodable for chrono::NaiveDateTime {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        let date_str = &self.and_utc().to_rfc3339();
        encoder.encode_timestamp(&date_str);
    }
}

impl Encodable for AnyType {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        match &self {
            AnyType::Boolean(val) => encoder.encode_boolean(*val),
            AnyType::Number(val) => match val {
                crate::any_type::N::Float(c_float) => encoder.encode_float64(*c_float),
                crate::any_type::N::Int(c_int) => encoder.encode_int32(*c_int),
                crate::any_type::N::Uint(c_uint) => encoder.encode_uint32(*c_uint),
                crate::any_type::N::BigInt(c_big_int) => encoder.encode_int64(*c_big_int),
                crate::any_type::N::BigUint(c_big_uint) => encoder.encode_uint64(*c_big_uint),
            },
            AnyType::String(val) => encoder.encode_string(&val),
            AnyType::Object(val) => {
                encoder.begin_object();
                for (key, val) in val.iter() {
                    encoder.encode_field(key);
                    Self::encode(val, encoder);
                }
                encoder.end_object();
            }
            AnyType::List(vals) => {
                encoder.begin_list();
                for item in vals.iter() {
                    Self::encode(item, encoder);
                }
                encoder.end_list();
            }
            AnyType::Null => {
                encoder.encode_null();
            }
        }
    }
}

#[cfg(feature = "serde")]
impl Encodable for serde_json::Value {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        match self {
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
                    Self::encode(item, encoder);
                }
                encoder.end_list();
            }
            serde_json::Value::Object(map) => {
                encoder.begin_object();
                for (key, val) in map.iter() {
                    encoder.encode_field(key);
                    Self::encode(val, encoder);
                }
                encoder.end_object();
            }
        }
    }
}

impl<V: Encodable> Encodable for HashMap<String, V> {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.begin_object();
        for (key, val) in self.iter() {
            encoder.encode_field(key);
            <V as Encodable>::encode(val, encoder);
        }
        encoder.end_object();
    }
}

impl<V: Encodable> Encodable for &HashMap<String, V> {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.begin_object();
        for (key, val) in self.iter() {
            encoder.encode_field(key);
            <V as Encodable>::encode(val, encoder);
        }
        encoder.end_object();
    }
}

impl<V: Encodable> Encodable for HashMap<&str, V> {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.begin_object();
        for (key, val) in self.iter() {
            encoder.encode_field(key);
            <V as Encodable>::encode(val, encoder);
        }
        encoder.end_object();
    }
}

impl<V: Encodable> Encodable for &HashMap<&str, V> {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.begin_object();
        for (key, val) in self.iter() {
            encoder.encode_field(key);
            <V as Encodable>::encode(val, encoder);
        }
        encoder.end_object();
    }
}

impl<V: Encodable> Encodable for IndexMap<String, V> {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.begin_object();
        for (key, val) in self {
            encoder.encode_field(key);
            val.encode(encoder);
        }
        encoder.end_object();
    }
}

impl<V: Encodable> Encodable for IndexMap<&str, V> {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.begin_object();
        for (key, val) in self {
            encoder.encode_field(key);
            val.encode(encoder);
        }
        encoder.end_object();
    }
}

impl<V: Encodable> Encodable for &IndexMap<String, V> {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.begin_object();
        for (key, val) in self.iter() {
            encoder.encode_field(key);
            val.encode(encoder);
        }
        encoder.end_object();
    }
}

impl<V: Encodable> Encodable for &IndexMap<&str, V> {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.begin_object();
        for (key, val) in self.iter() {
            encoder.encode_field(key);
            val.encode(encoder);
        }
        encoder.end_object();
    }
}

pub fn maybe_encode_field<E: Encoder, T: Encodable>(
    encoder: &mut E,
    field_name: &str,
    field_value: &Option<T>,
) {
    if let Some(value) = field_value {
        encoder.encode_field(field_name);
        value.encode(encoder);
    }
}

impl Encodable for Schema {
    fn encode<E: Encoder>(&self, encoder: &mut E) {
        match self {
            Schema::Empty { metadata } => {
                encoder.begin_object();
                maybe_encode_field(encoder, "metadata", metadata);
                encoder.end_object();
            }
            Schema::Type { r#type, metadata } => {
                encoder.begin_object();
                encoder.encode_field("type");
                r#type.encode(encoder);
                maybe_encode_field(encoder, "metadata", metadata);
                encoder.end_object();
            }
            Schema::Enum { r#enum, metadata } => {
                encoder.begin_object();
                encoder.encode_field("enum");
                r#enum.encode(encoder);
                maybe_encode_field(encoder, "metadata", metadata);
                encoder.end_object();
            }
            Schema::Elements { elements, metadata } => {
                encoder.begin_object();
                encoder.encode_field("elements");
                elements.encode(encoder);
                maybe_encode_field(encoder, "metadata", metadata);
                encoder.end_object();
            }
            Schema::Properties {
                properties,
                optional_properties,
                metadata,
                is_strict,
            } => {
                encoder.begin_object();
                encoder.encode_field("properties");
                encoder.begin_object();
                for (key, val) in properties {
                    encoder.encode_field(key);
                    val.encode(encoder);
                }
                encoder.end_object();
                if let Some(optional_properties) = optional_properties {
                    encoder.begin_object();
                    for (key, val) in optional_properties {
                        encoder.encode_field(key);
                        val.encode(encoder);
                    }
                    encoder.end_object();
                }
                maybe_encode_field(encoder, "metadata", metadata);
                maybe_encode_field(encoder, "isStrict", metadata);
                encoder.end_object();
            }
            Schema::Values { values, metadata } => {
                encoder.begin_object();
                encoder.encode_field("values");
                values.encode(encoder);
                maybe_encode_field(encoder, "metadata", metadata);
                encoder.end_object();
            }
            Schema::Discriminator {
                discriminator,
                mapping,
                metadata,
            } => {
                encoder.begin_object();
                encoder.encode_field("discriminator");
                discriminator.encode(encoder);
                encoder.encode_field("mapping");
                encoder.begin_object();
                for (key, val) in mapping {
                    encoder.encode_field(key);
                    val.encode(encoder);
                }
                encoder.end_object();
                maybe_encode_field(encoder, "metadata", metadata);
                encoder.end_object();
            }
            Schema::Ref { r#ref } => {
                encoder.begin_object();
                encoder.encode_field("ref");
                r#ref.encode(encoder);
                encoder.begin_object();
            }
        }
    }
}

impl Encodable for SchemaMetadata {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.encode_field("metadata");
        encoder.begin_object();
        if let Some(id) = &self.id {
            encoder.encode_field("id");
            encoder.encode_string(id);
        }
        if let Some(description) = &self.description {
            encoder.encode_field("description");
            encoder.encode_string(description);
        }
        if let Some(is_deprecated) = &self.is_deprecated {
            encoder.encode_field("isDeprecated");
            encoder.encode_boolean(*is_deprecated);
        }
        if let Some(deprecated_note) = &self.deprecated_note {
            encoder.encode_field("deprecatedNote");
            encoder.encode_string(deprecated_note);
        }
        encoder.end_object();
    }
}

impl Encodable for Type {
    fn encode<T: Encoder>(&self, encoder: &mut T) {
        encoder.encode_string(&self.to_string());
    }
}
