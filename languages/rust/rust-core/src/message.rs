use std::{num::ParseIntError, str::Utf8Error};

pub trait Message: Sized {
    fn encode<T: Encoder>(encoder: &mut T, v: Self);

    fn size_hint() -> usize {
        0
    }
}

impl Message for bool {
    fn encode<T: Encoder>(encoder: &mut T, v: Self) {
        encoder.encode_boolean(v);
    }
}

impl Message for f32 {
    fn encode<T: Encoder>(encoder: &mut T, v: Self) {
        encoder.encode_float32(v);
    }
}

impl Message for f64 {
    fn encode<T: Encoder>(encoder: &mut T, v: Self) {
        encoder.encode_float64(v);
    }
}

impl Message for i8 {
    fn encode<T: Encoder>(encoder: &mut T, v: Self) {
        encoder.encode_int8(v);
    }
}

impl Message for u8 {
    fn encode<T: Encoder>(encoder: &mut T, v: Self) {
        encoder.encode_uint8(v);
    }
}

impl Message for i16 {
    fn encode<T: Encoder>(encoder: &mut T, v: Self) {
        encoder.encode_int16(v);
    }
}

impl Message for u16 {
    fn encode<T: Encoder>(encoder: &mut T, v: Self) {
        encoder.encode_uint16(v);
    }
}

impl Message for i32 {
    fn encode<T: Encoder>(encoder: &mut T, v: Self) {
        encoder.encode_int32(v);
    }
}

impl Message for u32 {
    fn encode<T: Encoder>(encoder: &mut T, v: Self) {
        encoder.encode_uint32(v);
    }
}

impl Message for i64 {
    fn encode<T: Encoder>(encoder: &mut T, v: Self) {
        encoder.encode_int64(v);
    }
}

impl Message for u64 {
    fn encode<T: Encoder>(encoder: &mut T, v: Self) {
        encoder.encode_uint64(v);
    }
}

impl Message for String {
    fn encode<T: Encoder>(encoder: &mut T, v: Self) {
        encoder.encode_string(&v);
    }
}

impl Message for &str {
    fn encode<T: Encoder>(encoder: &mut T, v: Self) {
        encoder.encode_string(&v);
    }
}

#[cfg(feature = "chrono")]
impl<Tz: chrono::TimeZone> Message for chrono::DateTime<Tz> {
    fn encode<T: Encoder>(encoder: &mut T, v: Self) {
        encoder.encode_timestamp(&v.to_rfc3339());
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
    fn encode_nullable<T: Message>(&mut self, v: T);

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
        if let Some(true) = self.needs_comma.last() {
            self.buffer.push(b',');
        }
        if let Some(val) = self.needs_comma.last_mut() {
            *val = true;
        }
    }
}

use std::io::Write;

impl Encoder for JsonEncoder {
    fn encode_boolean(&mut self, v: bool) {
        match v {
            true => self.buffer.extend_from_slice(&"true".as_bytes()),
            false => self.buffer.extend_from_slice(&"false".as_bytes()),
        }
    }

    fn encode_float32(&mut self, v: f32) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
    }

    fn encode_float64(&mut self, v: f64) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
    }

    fn encode_int8(&mut self, v: i8) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
    }

    fn encode_uint8(&mut self, v: u8) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
    }

    fn encode_int16(&mut self, v: i16) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
    }

    fn encode_uint16(&mut self, v: u16) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
    }

    fn encode_int32(&mut self, v: i32) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
    }

    fn encode_uint32(&mut self, v: u32) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
    }

    fn encode_int64(&mut self, v: i64) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
    }

    fn encode_uint64(&mut self, v: u64) {
        self.write_comma_if_needed();
        let _ = write!(&mut self.buffer, "{}", v);
    }

    fn encode_string(&mut self, v: &str) {
        todo!()
    }

    fn encode_timestamp(&mut self, v: &str) {
        todo!()
    }

    fn encode_nullable<T: Message>(&mut self, v: T) {
        todo!()
    }

    fn begin_object(&mut self) {
        todo!()
    }

    fn end_object(&mut self) {
        todo!()
    }

    fn encode_field(&mut self, field: &str) {
        todo!()
    }

    fn begin_list(&mut self) {
        todo!()
    }

    fn end_list(&mut self) {
        todo!()
    }
}
