use std::{
    borrow::Cow,
    collections::{BTreeMap, HashMap, VecDeque},
    hash::BuildHasher,
    rc::Rc,
    sync::Arc,
};

use crate::{Timestamp, Value};

/// A format that Arri values can be read from.
///
/// This is a "pull" style decoder. The caller decides what type it expects next and the
/// decoder either produces that type or returns an error.
///
/// Objects are read with [`Decoder::begin_object`] followed by repeated calls to
/// [`Decoder::next_key`] until it returns `false`. Each key must be followed by
/// decoding (or skipping) exactly one value. Lists work the same way using
/// [`Decoder::begin_list`] and [`Decoder::next_element`].
pub trait Decoder {
    /// If the next value is `null` consume it and return `true`. Otherwise return `false` without consuming anything.
    fn decode_null(&mut self) -> Result<bool, DecodeError>;
    fn decode_bool(&mut self) -> Result<bool, DecodeError>;
    fn decode_f32(&mut self) -> Result<f32, DecodeError>;
    fn decode_f64(&mut self) -> Result<f64, DecodeError>;
    fn decode_i8(&mut self) -> Result<i8, DecodeError>;
    fn decode_u8(&mut self) -> Result<u8, DecodeError>;
    fn decode_i16(&mut self) -> Result<i16, DecodeError>;
    fn decode_u16(&mut self) -> Result<u16, DecodeError>;
    fn decode_i32(&mut self) -> Result<i32, DecodeError>;
    fn decode_u32(&mut self) -> Result<u32, DecodeError>;
    fn decode_i64(&mut self) -> Result<i64, DecodeError>;
    fn decode_u64(&mut self) -> Result<u64, DecodeError>;
    fn decode_string(&mut self) -> Result<String, DecodeError>;
    fn decode_timestamp(&mut self) -> Result<Timestamp, DecodeError>;
    /// Decode any value
    fn decode_any(&mut self) -> Result<Value, DecodeError>;

    /// Start reading an object. Returns the number of entries if the format knows it ahead of time.
    fn begin_object(&mut self) -> Result<Option<usize>, DecodeError>;
    /// Read the next key of the current object into `key`.
    ///
    /// Returns `false` (and closes the object) when there are no more entries.
    fn next_key(&mut self, key: &mut String) -> Result<bool, DecodeError>;

    /// Start reading a list. Returns the number of elements if the format knows it ahead of time.
    fn begin_list(&mut self) -> Result<Option<usize>, DecodeError>;
    /// Returns `true` if the current list has another element that needs to be decoded.
    ///
    /// Returns `false` (and closes the list) when there are no more elements.
    fn next_element(&mut self) -> Result<bool, DecodeError>;

    /// Skip over the next value
    fn skip_value(&mut self) -> Result<(), DecodeError>;
}

/// A type that can be read from any [`Decoder`]
#[diagnostic::on_unimplemented(
    message = "`{Self}` cannot be decoded by arri",
    label = "`{Self}` does not implement `Decode`",
    note = "use `#[derive(ArriModel)]` on your own types"
)]
pub trait Decode: Sized {
    fn decode<D: Decoder + ?Sized>(d: &mut D) -> Result<Self, DecodeError>;
}

/// Implemented by types that decode from an object with known keys (the "properties" schema form).
///
/// This allows the fields to be read from an object that was opened by someone else,
/// which is needed for internally tagged unions.
#[diagnostic::on_unimplemented(
    message = "`{Self}` is not an object",
    label = "`{Self}` must be a struct with named fields",
    note = "variants of internally tagged unions (`#[arri(tag_key = \"...\")]` without `value_key`) must be objects. Use a struct variant, or a newtype variant containing a struct that derives `ArriModel`"
)]
pub trait DecodeFields: Sized {
    /// Read the remaining entries of an object that has already been opened with [`Decoder::begin_object`].
    ///
    /// - `key` is a scratch buffer that may be reused between calls
    /// - `skip_key` is a key that should always be ignored (such as the tag of an internally tagged union)
    fn decode_fields<D: Decoder + ?Sized>(
        d: &mut D,
        key: &mut String,
        skip_key: Option<&str>,
    ) -> Result<Self, DecodeError>;
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum DecodeErrorKind {
    /// The input is malformed (e.g. invalid JSON)
    Syntax,
    /// The input is nested more deeply than the decoder allows
    DepthLimitExceeded,
    /// The input is well formed but it's the wrong type
    InvalidType,
    /// The input is the right type but the value is not allowed (e.g. integer out of range, invalid timestamp)
    InvalidValue,
    MissingField,
    /// An unknown key was found on a strict object
    UnknownField,
    /// An enum value or union tag that isn't recognized
    UnknownVariant,
    Custom,
}

/// A segment of the path that leads to where a [`DecodeError`] occurred
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum PathSegment {
    Key(String),
    Index(usize),
}

/// An error that occurred while decoding.
///
/// Errors keep track of where in the input they occurred. See [`DecodeError::instance_path`].
#[derive(Debug, Clone, PartialEq)]
pub struct DecodeError {
    kind: DecodeErrorKind,
    message: String,
    /// stored innermost segment first since segments are added as the error propagates outward
    path: Vec<PathSegment>,
}

impl DecodeError {
    pub fn new(kind: DecodeErrorKind, message: impl Into<String>) -> Self {
        Self {
            kind,
            message: message.into(),
            path: Vec::new(),
        }
    }

    pub fn syntax(message: impl Into<String>) -> Self {
        Self::new(DecodeErrorKind::Syntax, message)
    }

    pub fn invalid_type(expected: &str, found: &str) -> Self {
        Self::new(
            DecodeErrorKind::InvalidType,
            format!("expected {expected} but found {found}"),
        )
    }

    pub fn invalid_value(message: impl Into<String>) -> Self {
        Self::new(DecodeErrorKind::InvalidValue, message)
    }

    pub fn missing_field(name: &str) -> Self {
        Self::new(
            DecodeErrorKind::MissingField,
            format!("missing required field \"{name}\""),
        )
    }

    pub fn unknown_field(name: &str) -> Self {
        Self::new(
            DecodeErrorKind::UnknownField,
            format!("unknown field \"{name}\""),
        )
    }

    pub fn unknown_variant(value: &str, expected: &[&str]) -> Self {
        let mut message = format!("unknown value \"{value}\", expected one of [");
        for (i, item) in expected.iter().enumerate() {
            if i > 0 {
                message.push_str(", ");
            }
            message.push('"');
            message.push_str(item);
            message.push('"');
        }
        message.push(']');
        Self::new(DecodeErrorKind::UnknownVariant, message)
    }

    pub fn custom(message: impl std::fmt::Display) -> Self {
        Self::new(DecodeErrorKind::Custom, message.to_string())
    }

    /// Record that this error occurred inside of the object field `key`
    #[cold]
    pub fn in_field(mut self, key: &str) -> Self {
        self.path.push(PathSegment::Key(key.to_string()));
        self
    }

    /// Record that this error occurred inside of the list element at `index`
    #[cold]
    pub fn in_index(mut self, index: usize) -> Self {
        self.path.push(PathSegment::Index(index));
        self
    }

    pub fn kind(&self) -> DecodeErrorKind {
        self.kind
    }

    pub fn message(&self) -> &str {
        &self.message
    }

    /// The path to where the error occurred, outermost segment first
    pub fn path(&self) -> impl DoubleEndedIterator<Item = &PathSegment> {
        self.path.iter().rev()
    }

    /// A [JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901) pointing to where in the input the error occurred.
    ///
    /// Returns an empty string if the error occurred at the root.
    pub fn instance_path(&self) -> String {
        let mut output = String::new();
        for segment in self.path() {
            output.push('/');
            match segment {
                PathSegment::Key(key) => {
                    for c in key.chars() {
                        match c {
                            '~' => output.push_str("~0"),
                            '/' => output.push_str("~1"),
                            c => output.push(c),
                        }
                    }
                }
                PathSegment::Index(index) => output.push_str(&index.to_string()),
            }
        }
        output
    }
}

impl std::fmt::Display for DecodeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.message)?;
        if !self.path.is_empty() {
            write!(f, " at \"{}\"", self.instance_path())?;
        }
        Ok(())
    }
}

impl std::error::Error for DecodeError {}

macro_rules! impl_decode_scalar {
    ($($ty:ty => $method:ident),* $(,)?) => {
        $(
            impl Decode for $ty {
                #[inline]
                fn decode<D: Decoder + ?Sized>(d: &mut D) -> Result<Self, DecodeError> {
                    d.$method()
                }
            }
        )*
    };
}

impl_decode_scalar! {
    bool => decode_bool,
    f32 => decode_f32,
    f64 => decode_f64,
    i8 => decode_i8,
    u8 => decode_u8,
    i16 => decode_i16,
    u16 => decode_u16,
    i32 => decode_i32,
    u32 => decode_u32,
    i64 => decode_i64,
    u64 => decode_u64,
    String => decode_string,
}

impl Decode for Cow<'_, str> {
    fn decode<D: Decoder + ?Sized>(d: &mut D) -> Result<Self, DecodeError> {
        d.decode_string().map(Cow::Owned)
    }
}

impl Decode for Box<str> {
    fn decode<D: Decoder + ?Sized>(d: &mut D) -> Result<Self, DecodeError> {
        d.decode_string().map(String::into_boxed_str)
    }
}

macro_rules! impl_decode_pointer {
    ($($ty:ident),*) => {
        $(
            impl<T: Decode> Decode for $ty<T> {
                #[inline]
                fn decode<D: Decoder + ?Sized>(d: &mut D) -> Result<Self, DecodeError> {
                    T::decode(d).map($ty::new)
                }
            }

            impl<T: DecodeFields> DecodeFields for $ty<T> {
                #[inline]
                fn decode_fields<D: Decoder + ?Sized>(
                    d: &mut D,
                    key: &mut String,
                    skip_key: Option<&str>,
                ) -> Result<Self, DecodeError> {
                    T::decode_fields(d, key, skip_key).map($ty::new)
                }
            }
        )*
    };
}

impl_decode_pointer!(Box, Rc, Arc);

fn decode_list<T: Decode, D: Decoder + ?Sized>(
    d: &mut D,
    mut push: impl FnMut(T),
) -> Result<(), DecodeError> {
    let mut index = 0;
    while d.next_element()? {
        push(T::decode(d).map_err(|e| e.in_index(index))?);
        index += 1;
    }
    Ok(())
}

/// guards against preallocating huge amounts of memory when a format reports a bogus length
const MAX_PREALLOCATE: usize = 4096;

impl<T: Decode> Decode for Vec<T> {
    fn decode<D: Decoder + ?Sized>(d: &mut D) -> Result<Self, DecodeError> {
        let len = d.begin_list()?.unwrap_or(0);
        let mut output = Vec::with_capacity(len.min(MAX_PREALLOCATE));
        decode_list(d, |item| output.push(item))?;
        Ok(output)
    }
}

impl<T: Decode> Decode for VecDeque<T> {
    fn decode<D: Decoder + ?Sized>(d: &mut D) -> Result<Self, DecodeError> {
        let len = d.begin_list()?.unwrap_or(0);
        let mut output = VecDeque::with_capacity(len.min(MAX_PREALLOCATE));
        decode_list(d, |item| output.push_back(item))?;
        Ok(output)
    }
}

pub(crate) fn decode_map<V: Decode, D: Decoder + ?Sized>(
    d: &mut D,
    mut insert: impl FnMut(String, V),
) -> Result<(), DecodeError> {
    let mut key = String::new();
    while d.next_key(&mut key)? {
        let value = V::decode(d).map_err(|e| e.in_field(&key))?;
        insert(std::mem::take(&mut key), value);
    }
    Ok(())
}

impl<V: Decode, S: BuildHasher + Default> Decode for HashMap<String, V, S> {
    fn decode<D: Decoder + ?Sized>(d: &mut D) -> Result<Self, DecodeError> {
        let len = d.begin_object()?.unwrap_or(0);
        let mut output = HashMap::with_capacity_and_hasher(len.min(MAX_PREALLOCATE), S::default());
        decode_map(d, |k, v| {
            output.insert(k, v);
        })?;
        Ok(output)
    }
}

impl<V: Decode> Decode for BTreeMap<String, V> {
    fn decode<D: Decoder + ?Sized>(d: &mut D) -> Result<Self, DecodeError> {
        d.begin_object()?;
        let mut output = BTreeMap::new();
        decode_map(d, |k, v| {
            output.insert(k, v);
        })?;
        Ok(output)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn instance_path_is_built_outermost_first() {
        let err = DecodeError::missing_field("id")
            .in_field("a/b")
            .in_index(2)
            .in_field("items~");
        assert_eq!(err.instance_path(), "/items~0/2/a~1b");
        assert_eq!(
            err.to_string(),
            "missing required field \"id\" at \"/items~0/2/a~1b\""
        );
    }

    #[test]
    fn unknown_variant_message() {
        let err = DecodeError::unknown_variant("C", &["A", "B"]);
        assert_eq!(
            err.message(),
            "unknown value \"C\", expected one of [\"A\", \"B\"]"
        );
        assert_eq!(err.kind(), DecodeErrorKind::UnknownVariant);
    }
}
