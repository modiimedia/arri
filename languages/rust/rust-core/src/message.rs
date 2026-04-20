use std::collections::HashMap;
use std::{num::ParseIntError, str::Utf8Error};

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
            AnyType::Number(val) => encoder.encode_float64(*val),
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

pub struct JsonEncoder {
    buffer: Vec<u8>,
    needs_comma: Vec<bool>,
}

impl JsonEncoder {
    pub fn new(capacity: usize) -> Self {
        Self {
            buffer: Vec::with_capacity(capacity),
            needs_comma: Vec::with_capacity(16),
        }
    }

    pub fn reset(&mut self) {
        self.buffer.clear();
        self.needs_comma.clear();
    }

    /// Returns a reference to the encoded JSON bytes.
    pub fn bytes(&self) -> &[u8] {
        &self.buffer
    }

    fn write_comma_if_needed(&mut self) {
        if let Some(&true) = self.needs_comma.last() {
            self.buffer.push(b',');
        }
    }

    fn mark_value_written(&mut self) {
        if let Some(val) = self.needs_comma.last_mut() {
            *val = true;
        }
    }
}

use std::io::Write;

use crate::any_type::AnyType;

impl Encoder for JsonEncoder {
    fn encode_boolean(&mut self, v: bool) {
        self.write_comma_if_needed();
        match v {
            true => self.buffer.extend_from_slice(&"true".as_bytes()),
            false => self.buffer.extend_from_slice(&"false".as_bytes()),
        }
        self.mark_value_written();
    }

    fn encode_float32(&mut self, v: f32) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
        self.mark_value_written();
    }

    fn encode_float64(&mut self, v: f64) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
        self.mark_value_written();
    }

    fn encode_int8(&mut self, v: i8) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
        self.mark_value_written();
    }

    fn encode_uint8(&mut self, v: u8) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
        self.mark_value_written();
    }

    fn encode_int16(&mut self, v: i16) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
        self.mark_value_written();
    }

    fn encode_uint16(&mut self, v: u16) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
        self.mark_value_written();
    }

    fn encode_int32(&mut self, v: i32) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
        self.mark_value_written();
    }

    fn encode_uint32(&mut self, v: u32) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
        self.mark_value_written();
    }

    fn encode_int64(&mut self, v: i64) {
        self.write_comma_if_needed();
        self.buffer.push(b'"');
        let _ = write!(&mut self.buffer, "{}", v);
        self.buffer.push(b'"');
        self.mark_value_written();
    }

    fn encode_uint64(&mut self, v: u64) {
        self.write_comma_if_needed();
        self.buffer.push(b'"');
        let _ = write!(&mut self.buffer, "{}", v);
        self.buffer.push(b'"');
        self.mark_value_written();
    }

    fn encode_string(&mut self, v: &str) {
        self.write_comma_if_needed();
        self.buffer.push(b'"');
        for b in v.bytes() {
            match b {
                // Quotes and Backslashes
                b'"' => self.buffer.extend_from_slice(b"\\\""),
                b'\\' => self.buffer.extend_from_slice(b"\\\\"),

                // Forward Slash (Optional in JSON but often included for safety)
                b'/' => self.buffer.extend_from_slice(b"\\/"),

                // Standard Whitespace Escapes
                b'\x08' => self.buffer.extend_from_slice(b"\\b"), // Backspace
                b'\x0c' => self.buffer.extend_from_slice(b"\\f"), // Form Feed
                b'\n' => self.buffer.extend_from_slice(b"\\n"),   // Newline
                b'\r' => self.buffer.extend_from_slice(b"\\r"),   // Carriage Return
                b'\t' => self.buffer.extend_from_slice(b"\\t"),   // Tab

                // Other Control Characters (U+0000 through U+001F)
                // These must be escaped as \uXXXX
                c @ 0..=31 => {
                    let _ = write!(&mut self.buffer, "\\u{:04x}", c);
                }

                // All other characters (Valid UTF-8)
                _ => self.buffer.push(b),
            }
        }
        self.buffer.push(b'"');
        self.mark_value_written();
    }

    fn encode_timestamp(&mut self, v: &str) {
        self.write_comma_if_needed();
        self.buffer.push(b'"');
        self.buffer.extend_from_slice(v.as_bytes());
        self.buffer.push(b'"');
        self.mark_value_written();
    }

    fn encode_null(&mut self) {
        self.write_comma_if_needed();
        self.buffer.extend_from_slice("null".as_bytes());
        self.mark_value_written();
    }

    fn begin_object(&mut self) {
        self.write_comma_if_needed();
        self.buffer.push(b'{');
        self.needs_comma.push(false);
    }

    fn end_object(&mut self) {
        self.buffer.push(b'}');
        self.needs_comma.pop();
        self.mark_value_written();
    }

    fn encode_field(&mut self, field: &str) {
        if let Some(&true) = self.needs_comma.last() {
            self.buffer.push(b',');
        }
        self.buffer.push(b'"');
        self.buffer.extend_from_slice(field.as_bytes());
        self.buffer.push(b'"');
        self.buffer.push(b':');
        if let Some(val) = self.needs_comma.last_mut() {
            *val = false;
        }
    }

    fn begin_list(&mut self) {
        self.write_comma_if_needed();
        self.buffer.push(b'[');
        self.needs_comma.push(false);
    }

    fn end_list(&mut self) {
        self.buffer.push(b']');
        self.needs_comma.pop();
        self.mark_value_written();
    }
}

#[cfg(test)]
mod test {
    use chrono::{DateTime, Utc};

    #[cfg(feature = "chrono")]
    #[cfg(feature = "serde")]
    #[test]
    fn test_json_encoder() {
        use std::collections::HashMap;

        use chrono::NaiveDateTime;

        use crate::{
            any_type::AnyType,
            message::{JsonEncoder, Message},
        };

        enum TestEnum {
            Foo,
            Bar,
            Baz,
        }

        impl Message for TestEnum {
            fn encode<T: super::Encoder>(encoder: &mut T, v: &Self) {
                match v {
                    TestEnum::Foo => encoder.encode_string("FOO"),
                    TestEnum::Bar => encoder.encode_string("BAR"),
                    TestEnum::Baz => encoder.encode_string("BAZ"),
                }
            }
        }

        struct TestObject {
            pub string: String,
            pub boolean: bool,
            pub timestamp: DateTime<Utc>,
            pub float32: f32,
            pub float64: f64,
            pub int8: i8,
            pub uint8: u8,
            pub int16: i16,
            pub uint16: u16,
            pub int32: i32,
            pub uint32: u32,
            pub int64: i64,
            pub uint64: u64,
            pub r#enum: TestEnum,
            pub object: TestNestedObject,
            pub array: Vec<bool>,
            pub record: HashMap<String, bool>,
            pub discriminator: TestDiscriminator,
            pub any: AnyType,
        }

        // example manual implementation
        // the derive will auto implement this for us
        impl Message for TestObject {
            fn encode<T: super::Encoder>(encoder: &mut T, v: &Self) {
                encoder.begin_object();
                encoder.encode_field("string");
                <String as Message>::encode(encoder, &v.string);
                encoder.encode_field("boolean");
                <bool as Message>::encode(encoder, &v.boolean);
                encoder.encode_field("timestamp");
                <DateTime<Utc> as Message>::encode(encoder, &v.timestamp);
                encoder.encode_field("float32");
                <f32 as Message>::encode(encoder, &v.float32);
                encoder.encode_field("float64");
                <f64 as Message>::encode(encoder, &v.float64);
                encoder.encode_field("int8");
                <i8 as Message>::encode(encoder, &v.int8);
                encoder.encode_field("uint8");
                <u8 as Message>::encode(encoder, &v.uint8);
                encoder.encode_field("int16");
                <i16 as Message>::encode(encoder, &v.int16);
                encoder.encode_field("uint16");
                <u16 as Message>::encode(encoder, &v.uint16);
                encoder.encode_field("int32");
                <i32 as Message>::encode(encoder, &v.int32);
                encoder.encode_field("uint32");
                <u32 as Message>::encode(encoder, &v.uint32);
                encoder.encode_field("int64");
                <i64 as Message>::encode(encoder, &v.int64);
                encoder.encode_field("uint64");
                <u64 as Message>::encode(encoder, &v.uint64);
                encoder.encode_field("enum");
                <TestEnum as Message>::encode(encoder, &v.r#enum);
                encoder.encode_field("object");
                <TestNestedObject as Message>::encode(encoder, &v.object);
                encoder.encode_field("array");
                <Vec<bool> as Message>::encode(encoder, &v.array);
                encoder.encode_field("record");
                <HashMap<String, bool> as Message>::encode(encoder, &v.record);
                encoder.encode_field("discriminator");
                <TestDiscriminator as Message>::encode(encoder, &v.discriminator);
                encoder.encode_field("any");
                <AnyType as Message>::encode(encoder, &v.any);
                encoder.end_object();
            }
        }

        enum TestDiscriminator {
            A {
                id: String,
            },
            B {
                id: String,
                name: String,
            },
            C {
                id: String,
                name: String,
                date: NaiveDateTime,
            },
        }

        impl Message for TestDiscriminator {
            fn encode<T: super::Encoder>(encoder: &mut T, v: &Self) {
                match v {
                    TestDiscriminator::A { id } => {
                        encoder.begin_object();
                        encoder.encode_field("type");
                        encoder.encode_string("A");
                        encoder.encode_field("id");
                        <String as Message>::encode(encoder, id);
                        encoder.end_object();
                    }
                    TestDiscriminator::B { id, name } => {
                        encoder.begin_object();
                        encoder.encode_field("type");
                        encoder.encode_string("B");
                        encoder.encode_field("id");
                        <String as Message>::encode(encoder, id);
                        encoder.encode_field("name");
                        <String as Message>::encode(encoder, name);
                        encoder.end_object();
                    }
                    TestDiscriminator::C { id, name, date } => {
                        encoder.begin_object();
                        encoder.encode_field("type");
                        encoder.encode_string("B");
                        encoder.encode_field("id");
                        <String as Message>::encode(encoder, id);
                        encoder.encode_field("name");
                        <String as Message>::encode(encoder, name);
                        encoder.encode_field("date");
                        <NaiveDateTime as Message>::encode(encoder, date);
                        encoder.end_object();
                    }
                }
            }
        }

        struct TestNestedObject {
            pub id: String,
            pub content: String,
        }

        impl Message for TestNestedObject {
            fn encode<T: super::Encoder>(encoder: &mut T, v: &Self) {
                encoder.begin_object();
                encoder.encode_field("id");
                encoder.encode_string(&v.id);
                encoder.encode_field("content");
                encoder.encode_string(&v.content);
                encoder.end_object();
            }
        }

        let input = TestObject {
            string: String::from("foo"),
            boolean: true,
            timestamp: Utc::now(),
            float32: 1.5,
            float64: 1.5,
            int8: 15,
            uint8: 15,
            int16: 155,
            uint16: 155,
            int32: 1555,
            uint32: 1555,
            int64: 15555,
            uint64: 15555,
            r#enum: TestEnum::Baz,
            object: TestNestedObject {
                id: String::from("1"),
                content: String::from("hello\nworld"),
            },
            array: vec![true, false],
            record: HashMap::new(),
            discriminator: TestDiscriminator::B {
                id: String::from("foo"),
                name: String::from("bar"),
            },
            any: AnyType::List(Box::new(vec![AnyType::Boolean(true)])),
        };
        let mut encoder = JsonEncoder::new(input.size_hint());
        TestObject::encode(&mut encoder, &input);
        let result = encoder.bytes();
        let serde_result = serde_json::from_slice::<serde_json::Value>(result);
        assert!(serde_result.is_ok());
    }
}
