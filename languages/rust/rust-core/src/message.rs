use std::collections::HashMap;

use crate::any_type::AnyType;
use crate::encoder::Encodable;

pub trait Model: Sized + Encodable {}

impl Model for bool {}

impl Model for f32 {}

impl Model for f64 {}

impl Model for i8 {}

impl Model for u8 {}

impl Model for i16 {}

impl Model for u16 {}

impl Model for i32 {}

impl Model for u32 {}

impl Model for i64 {}

impl Model for u64 {}

impl Model for String {}

impl Model for &str {}

impl<M: Model> Model for Vec<M> {}

#[cfg(feature = "chrono")]
impl<Tz: chrono::TimeZone> Model for chrono::DateTime<Tz> {}

#[cfg(feature = "chrono")]
impl Model for chrono::NaiveDateTime {}

impl Model for AnyType {}

#[cfg(feature = "serde")]
impl Model for serde_json::Value {}

impl<V: Model> Model for HashMap<String, V> {}

impl<V: Model> Model for HashMap<&str, V> {}
