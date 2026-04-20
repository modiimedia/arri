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
