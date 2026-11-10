//! The JSON format.
//!
//! ```
//! use arri::{ArriModel, json};
//!
//! #[derive(ArriModel, Debug, PartialEq)]
//! struct Point {
//!     x: f64,
//!     y: f64,
//! }
//!
//! let point: Point = json::from_str(r#"{"x":1.5,"y":-2}"#).unwrap();
//! assert_eq!(point, Point { x: 1.5, y: -2.0 });
//! assert_eq!(json::to_string(&point).unwrap(), r#"{"x":1.5,"y":-2}"#);
//! ```

mod decoder;
mod encoder;

pub(crate) use decoder::parse_integer;
pub use decoder::{DEFAULT_MAX_DEPTH, JsonDecoder};
pub use encoder::JsonEncoder;

use crate::{Decode, DecodeError, Encode, EncodeError};

/// Encode a value as JSON bytes
pub fn to_vec<T: Encode + ?Sized>(value: &T) -> Result<Vec<u8>, EncodeError> {
    let mut encoder = JsonEncoder::with_capacity(128);
    value.encode(&mut encoder)?;
    Ok(encoder.into_bytes())
}

/// Encode a value as a JSON string
pub fn to_string<T: Encode + ?Sized>(value: &T) -> Result<String, EncodeError> {
    let mut encoder = JsonEncoder::with_capacity(128);
    value.encode(&mut encoder)?;
    Ok(encoder.into_string())
}

/// Decode a value from a JSON string. Fails if there is any trailing data other than whitespace.
pub fn from_str<T: Decode>(input: &str) -> Result<T, DecodeError> {
    let mut decoder = JsonDecoder::new(input);
    let value = T::decode(&mut decoder)?;
    decoder.finish()?;
    Ok(value)
}

/// Decode a value from JSON bytes. Fails if the input isn't valid UTF-8 or if there is any trailing data other than whitespace.
pub fn from_slice<T: Decode>(input: &[u8]) -> Result<T, DecodeError> {
    let mut decoder = JsonDecoder::from_slice(input)?;
    let value = T::decode(&mut decoder)?;
    decoder.finish()?;
    Ok(value)
}
