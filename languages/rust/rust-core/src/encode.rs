use std::{
    borrow::Cow,
    collections::{BTreeMap, HashMap, VecDeque},
    rc::Rc,
    sync::Arc,
};

use crate::{Number, Timestamp};

/// A format that Arri values can be written to.
///
/// Methods describe values in terms of the Arri type system. It's up to each format
/// to decide how each value is represented (e.g. JSON writes `int64` values as strings).
///
/// Containers are opened with their length so that formats which need length prefixes
/// (such as MessagePack or CBOR) can be implemented without buffering.
pub trait Encoder {
    fn encode_null(&mut self) -> Result<(), EncodeError>;
    fn encode_bool(&mut self, v: bool) -> Result<(), EncodeError>;
    fn encode_f32(&mut self, v: f32) -> Result<(), EncodeError>;
    fn encode_f64(&mut self, v: f64) -> Result<(), EncodeError>;
    fn encode_i8(&mut self, v: i8) -> Result<(), EncodeError>;
    fn encode_u8(&mut self, v: u8) -> Result<(), EncodeError>;
    fn encode_i16(&mut self, v: i16) -> Result<(), EncodeError>;
    fn encode_u16(&mut self, v: u16) -> Result<(), EncodeError>;
    fn encode_i32(&mut self, v: i32) -> Result<(), EncodeError>;
    fn encode_u32(&mut self, v: u32) -> Result<(), EncodeError>;
    fn encode_i64(&mut self, v: i64) -> Result<(), EncodeError>;
    fn encode_u64(&mut self, v: u64) -> Result<(), EncodeError>;
    fn encode_str(&mut self, v: &str) -> Result<(), EncodeError>;
    fn encode_timestamp(&mut self, v: &Timestamp) -> Result<(), EncodeError>;
    /// Encode a number inside of a dynamic ("any") value.
    ///
    /// Unlike [`Encoder::encode_i64`] this should always use the format's native number representation.
    fn encode_number(&mut self, v: Number) -> Result<(), EncodeError>;

    /// Start an object that will contain `len` entries
    fn begin_object(&mut self, len: usize) -> Result<(), EncodeError>;
    /// Write an object key. Must be followed by exactly one value.
    fn encode_key(&mut self, key: &str) -> Result<(), EncodeError>;
    fn end_object(&mut self) -> Result<(), EncodeError>;

    /// Start a list that will contain `len` elements
    fn begin_list(&mut self, len: usize) -> Result<(), EncodeError>;
    fn end_list(&mut self) -> Result<(), EncodeError>;
}

/// A type that can be written to any [`Encoder`]
#[diagnostic::on_unimplemented(
    message = "`{Self}` cannot be encoded by arri",
    label = "`{Self}` does not implement `Encode`",
    note = "use `#[derive(ArriModel)]` on your own types"
)]
pub trait Encode {
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError>;
}

/// Implemented by types that encode as an object with known keys (the "properties" schema form).
///
/// This allows the fields to be written into an object that was started by someone else,
/// which is needed for internally tagged unions.
#[diagnostic::on_unimplemented(
    message = "`{Self}` is not an object",
    label = "`{Self}` must be a struct with named fields",
    note = "variants of internally tagged unions (`#[arri(tag_key = \"...\")]` without `value_key`) must be objects. Use a struct variant, or a newtype variant containing a struct that derives `ArriModel`"
)]
pub trait EncodeFields {
    /// The number of keys that [`EncodeFields::encode_fields`] will write
    fn field_count(&self) -> usize;
    /// Write each key / value pair without opening or closing the object
    fn encode_fields<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError>;
}

/// An error that occurred while encoding.
///
/// More variants may be added in the future, so matches on this enum outside of arri need a `_` arm.
#[derive(Debug, Clone, PartialEq)]
#[non_exhaustive]
pub enum EncodeError {
    /// `NaN` and infinite values cannot be represented in JSON
    NonFiniteFloat(f64),
    Custom(String),
}

impl EncodeError {
    pub fn custom(message: impl std::fmt::Display) -> Self {
        Self::Custom(message.to_string())
    }
}

impl std::fmt::Display for EncodeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            EncodeError::NonFiniteFloat(v) => write!(f, "cannot encode non-finite float {v}"),
            EncodeError::Custom(message) => f.write_str(message),
        }
    }
}

impl std::error::Error for EncodeError {}

macro_rules! impl_encode_scalar {
    ($($ty:ty => $method:ident),* $(,)?) => {
        $(
            impl Encode for $ty {
                #[inline]
                fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
                    e.$method(*self)
                }
            }
        )*
    };
}

impl_encode_scalar! {
    bool => encode_bool,
    f32 => encode_f32,
    f64 => encode_f64,
    i8 => encode_i8,
    u8 => encode_u8,
    i16 => encode_i16,
    u16 => encode_u16,
    i32 => encode_i32,
    u32 => encode_u32,
    i64 => encode_i64,
    u64 => encode_u64,
}

impl Encode for str {
    #[inline]
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        e.encode_str(self)
    }
}

impl Encode for String {
    #[inline]
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        e.encode_str(self)
    }
}

impl Encode for Cow<'_, str> {
    #[inline]
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        e.encode_str(self)
    }
}

macro_rules! impl_encode_pointer {
    ($($ty:ident),*) => {
        $(
            impl<T: Encode + ?Sized> Encode for $ty<T> {
                #[inline]
                fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
                    T::encode(self, e)
                }
            }

            impl<T: EncodeFields + ?Sized> EncodeFields for $ty<T> {
                #[inline]
                fn field_count(&self) -> usize {
                    T::field_count(self)
                }

                #[inline]
                fn encode_fields<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
                    T::encode_fields(self, e)
                }
            }
        )*
    };
}

impl_encode_pointer!(Box, Rc, Arc);

impl<T: Encode + ?Sized> Encode for &T {
    #[inline]
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        T::encode(self, e)
    }
}

impl<T: EncodeFields + ?Sized> EncodeFields for &T {
    #[inline]
    fn field_count(&self) -> usize {
        T::field_count(self)
    }

    #[inline]
    fn encode_fields<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        T::encode_fields(self, e)
    }
}

pub(crate) fn encode_list<'a, T, E, I>(e: &mut E, len: usize, items: I) -> Result<(), EncodeError>
where
    T: Encode + 'a,
    E: Encoder + ?Sized,
    I: IntoIterator<Item = &'a T>,
{
    e.begin_list(len)?;
    for item in items {
        item.encode(e)?;
    }
    e.end_list()
}

pub(crate) fn encode_map<'a, K, V, E, I>(
    e: &mut E,
    len: usize,
    entries: I,
) -> Result<(), EncodeError>
where
    K: AsRef<str> + 'a,
    V: Encode + 'a,
    E: Encoder + ?Sized,
    I: IntoIterator<Item = (&'a K, &'a V)>,
{
    e.begin_object(len)?;
    for (key, value) in entries {
        e.encode_key(key.as_ref())?;
        value.encode(e)?;
    }
    e.end_object()
}

impl<T: Encode> Encode for [T] {
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        encode_list(e, self.len(), self)
    }
}

impl<T: Encode, const N: usize> Encode for [T; N] {
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        encode_list(e, N, self)
    }
}

impl<T: Encode> Encode for Vec<T> {
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        encode_list(e, self.len(), self)
    }
}

impl<T: Encode> Encode for VecDeque<T> {
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        encode_list(e, self.len(), self)
    }
}

impl<V: Encode, S> Encode for HashMap<String, V, S> {
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        encode_map(e, self.len(), self)
    }
}

impl<V: Encode> Encode for BTreeMap<String, V> {
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        encode_map(e, self.len(), self)
    }
}
