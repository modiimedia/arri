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

use crate::encoder::Encoder;

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

        use crate::{any_type::AnyType, encoder::Encodable, encoder_json::JsonEncoder};

        enum TestEnum {
            Foo,
            Bar,
            Baz,
        }

        impl Encodable for TestEnum {
            fn encode<T: super::Encoder>(&self, encoder: &mut T) {
                match self {
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
        impl Encodable for TestObject {
            fn encode<T: super::Encoder>(&self, encoder: &mut T) {
                encoder.begin_object();
                encoder.encode_field("string");
                <String as Encodable>::encode(&self.string, encoder);
                encoder.encode_field("boolean");
                <bool as Encodable>::encode(&self.boolean, encoder);
                encoder.encode_field("timestamp");
                <DateTime<Utc> as Encodable>::encode(&self.timestamp, encoder);
                encoder.encode_field("float32");
                <f32 as Encodable>::encode(&self.float32, encoder);
                encoder.encode_field("float64");
                <f64 as Encodable>::encode(&self.float64, encoder);
                encoder.encode_field("int8");
                <i8 as Encodable>::encode(&self.int8, encoder);
                encoder.encode_field("uint8");
                <u8 as Encodable>::encode(&self.uint8, encoder);
                encoder.encode_field("int16");
                <i16 as Encodable>::encode(&self.int16, encoder);
                encoder.encode_field("uint16");
                <u16 as Encodable>::encode(&self.uint16, encoder);
                encoder.encode_field("int32");
                <i32 as Encodable>::encode(&self.int32, encoder);
                encoder.encode_field("uint32");
                <u32 as Encodable>::encode(&self.uint32, encoder);
                encoder.encode_field("int64");
                <i64 as Encodable>::encode(&self.int64, encoder);
                encoder.encode_field("uint64");
                <u64 as Encodable>::encode(&self.uint64, encoder);
                encoder.encode_field("enum");
                <TestEnum as Encodable>::encode(&self.r#enum, encoder);
                encoder.encode_field("object");
                <TestNestedObject as Encodable>::encode(&self.object, encoder);
                encoder.encode_field("array");
                <Vec<bool> as Encodable>::encode(&self.array, encoder);
                encoder.encode_field("record");
                <HashMap<String, bool> as Encodable>::encode(&self.record, encoder);
                encoder.encode_field("discriminator");
                <TestDiscriminator as Encodable>::encode(&self.discriminator, encoder);
                encoder.encode_field("any");
                <AnyType as Encodable>::encode(&self.any, encoder);
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

        impl Encodable for TestDiscriminator {
            fn encode<T: super::Encoder>(&self, encoder: &mut T) {
                match &self {
                    TestDiscriminator::A { id } => {
                        encoder.begin_object();
                        encoder.encode_field("type");
                        encoder.encode_string("A");
                        encoder.encode_field("id");
                        <String as Encodable>::encode(&id, encoder);
                        encoder.end_object();
                    }
                    TestDiscriminator::B { id, name } => {
                        encoder.begin_object();
                        encoder.encode_field("type");
                        encoder.encode_string("B");
                        encoder.encode_field("id");
                        <String as Encodable>::encode(&id, encoder);
                        encoder.encode_field("name");
                        <String as Encodable>::encode(&name, encoder);
                        encoder.end_object();
                    }
                    TestDiscriminator::C { id, name, date } => {
                        encoder.begin_object();
                        encoder.encode_field("type");
                        encoder.encode_string("B");
                        encoder.encode_field("id");
                        <String as Encodable>::encode(&id, encoder);
                        encoder.encode_field("name");
                        <String as Encodable>::encode(&name, encoder);
                        encoder.encode_field("date");
                        <NaiveDateTime as Encodable>::encode(&date, encoder);
                        encoder.end_object();
                    }
                }
            }
        }

        struct TestNestedObject {
            pub id: String,
            pub content: String,
        }

        impl Encodable for TestNestedObject {
            fn encode<T: super::Encoder>(&self, encoder: &mut T) {
                encoder.begin_object();
                encoder.encode_field("id");
                encoder.encode_string(&self.id);
                encoder.encode_field("content");
                encoder.encode_string(&self.content);
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
        input.encode(&mut encoder);
        let result = encoder.bytes();
        let serde_result = serde_json::from_slice::<serde_json::Value>(result);
        assert!(serde_result.is_ok());
    }
}
