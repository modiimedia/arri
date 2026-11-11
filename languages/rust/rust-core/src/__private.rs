//! Runtime helpers used by `#[derive(ArriModel)]`. Not part of the public API.

use crate::{
    DecodeError, Decoder, EncodeError, Encoder, Number, Timestamp, TypeDef, Value, ValueDecoder,
};

pub use std::borrow::Cow;
pub use std::option::Option::{self, None, Some};
pub use std::result::Result::{self, Err, Ok};
pub use std::string::String;
pub use std::vec::Vec;

/// Implemented by derived unions. Decodes a variant once its tag is known.
pub trait DecodeVariant: Sized {
    /// Every tag value that the union accepts, in declaration order
    const VARIANTS: &'static [&'static str];

    /// Decode the variant at `index` in [`DecodeVariant::VARIANTS`].
    ///
    /// For externally and adjacently tagged unions the decoder is positioned at the variant's value.
    /// For internally tagged unions the decoder is positioned inside of an object that has already
    /// been opened, and the remaining keys of that object belong to the variant.
    fn decode_variant<D: Decoder + ?Sized>(d: &mut D, index: usize) -> Result<Self, DecodeError>;
}

/// Returns the position of `tag` in `T::VARIANTS`
#[inline]
fn variant_index<T: DecodeVariant>(tag: &str) -> Result<usize, DecodeError> {
    T::VARIANTS
        .iter()
        .position(|variant| *variant == tag)
        .ok_or_else(|| DecodeError::unknown_variant(tag, T::VARIANTS))
}

/// `{ "<tag>": <value> }`
pub fn decode_external<T: DecodeVariant, D: Decoder + ?Sized>(d: &mut D) -> Result<T, DecodeError> {
    d.begin_object()?;
    let index = match d.next_key()? {
        Some(tag) => variant_index::<T>(tag).map_err(|e| e.in_field(tag))?,
        None => {
            return Err(DecodeError::invalid_value(
                "expected an object with exactly one key indicating the union variant",
            ));
        }
    };
    let tag = T::VARIANTS[index];
    let value = T::decode_variant(d, index).map_err(|e| e.in_field(tag))?;
    if let Some(key) = d.next_key()? {
        if key == tag {
            return Err(DecodeError::duplicate_key(tag));
        }
        return Err(DecodeError::invalid_value(format!(
            "unexpected key \"{key}\", externally tagged unions must have exactly one key"
        )));
    }
    Ok(value)
}

/// `{ "<tag_key>": "<tag>", ...variant fields }`
pub fn decode_internal<T: DecodeVariant, D: Decoder + ?Sized>(
    d: &mut D,
    tag_key: &str,
) -> Result<T, DecodeError> {
    d.begin_object()?;
    let first_key = match d.next_key()? {
        Some(key) => key,
        None => return Err(DecodeError::missing_field(tag_key)),
    };

    // fast path: the tag is the first key (arri encoders always write it first)
    if first_key == tag_key {
        let tag = d.decode_str().map_err(|e| e.in_field(tag_key))?;
        let index = variant_index::<T>(tag).map_err(|e| e.in_field(tag_key))?;
        return T::decode_variant(d, index);
    }

    // slow path: buffer the object until the tag is found and then decode the variant from the buffer
    let first_key = first_key.to_string();
    let first_value = d.decode_any().map_err(|e| e.in_field(&first_key))?;
    let mut entries: Vec<(String, Value)> = vec![(first_key, first_value)];
    while let Some(key) = d.next_key()? {
        let key = key.to_string();
        let value = d.decode_any().map_err(|e| e.in_field(&key))?;
        entries.push((key, value));
    }
    let mut tag_position = None;
    for (i, (key, _)) in entries.iter().enumerate() {
        if key == tag_key {
            if tag_position.is_some() {
                return Err(DecodeError::duplicate_key(tag_key));
            }
            tag_position = Some(i);
        }
    }
    let Some(tag_position) = tag_position else {
        return Err(DecodeError::missing_field(tag_key));
    };
    // the variant's fields treat the tag key as a duplicate so it's removed before decoding them
    let index = match entries.remove(tag_position).1 {
        Value::String(tag) => variant_index::<T>(&tag).map_err(|e| e.in_field(tag_key))?,
        _ => {
            return Err(DecodeError::invalid_value("union tag must be a string").in_field(tag_key));
        }
    };
    let mut buffered = ValueDecoder::new(Value::Object(entries));
    buffered.begin_object()?;
    T::decode_variant(&mut buffered, index)
}

/// `{ "<tag_key>": "<tag>", "<value_key>": <value> }`
pub fn decode_adjacent<T: DecodeVariant, D: Decoder + ?Sized>(
    d: &mut D,
    tag_key: &str,
    value_key: &str,
    strict: bool,
) -> Result<T, DecodeError> {
    enum Key {
        Tag,
        Value,
        Other,
    }
    d.begin_object()?;
    let mut index: Option<usize> = None;
    let mut result: Option<T> = None;
    // used when the value appears before the tag
    let mut buffered: Option<Value> = None;
    while let Some(key) = d.next_key()? {
        let key = if key == tag_key {
            Key::Tag
        } else if key == value_key {
            Key::Value
        } else {
            check_unknown_key(key, None, strict)?;
            Key::Other
        };
        match key {
            Key::Tag => {
                if index.is_some() {
                    return Err(DecodeError::duplicate_key(tag_key));
                }
                let tag = d.decode_str().map_err(|e| e.in_field(tag_key))?;
                index = Some(variant_index::<T>(tag).map_err(|e| e.in_field(tag_key))?);
            }
            Key::Value if result.is_some() || buffered.is_some() => {
                return Err(DecodeError::duplicate_key(value_key));
            }
            Key::Value => match index {
                Some(index) => {
                    result = Some(T::decode_variant(d, index).map_err(|e| e.in_field(value_key))?);
                }
                None => buffered = Some(d.decode_any().map_err(|e| e.in_field(value_key))?),
            },
            Key::Other => d.skip_value()?,
        }
    }
    let Some(index) = index else {
        return Err(DecodeError::missing_field(tag_key));
    };
    if let Some(result) = result {
        return Ok(result);
    }
    match buffered {
        Some(value) => T::decode_variant(&mut ValueDecoder::new(value), index)
            .map_err(|e| e.in_field(value_key)),
        None => Err(DecodeError::missing_field(value_key)),
    }
}

/// Used by derived code when a key doesn't match any field.
///
/// `tag_key` is the tag of an internally tagged union which has already been read, so seeing it
/// again is a duplicate. Otherwise returns an error if unknown keys aren't allowed, or
/// `usize::MAX` which derived code treats as "skip this value".
#[inline]
pub fn check_unknown_key(
    key: &str,
    tag_key: Option<&str>,
    strict: bool,
) -> Result<usize, DecodeError> {
    if tag_key == Some(key) {
        return Err(DecodeError::duplicate_key(key));
    }
    if strict {
        return Err(DecodeError::unknown_field(key));
    }
    Ok(usize::MAX)
}

/// `keys.contains(&key)` that can be used in constants
pub const fn contains_key(keys: &[&str], key: &str) -> bool {
    let key = key.as_bytes();
    let mut i = 0;
    while i < keys.len() {
        let candidate = keys[i].as_bytes();
        if candidate.len() == key.len() {
            let mut j = 0;
            while j < key.len() && candidate[j] == key[j] {
                j += 1;
            }
            if j == key.len() {
                return true;
            }
        }
        i += 1;
    }
    false
}

#[cold]
pub fn duplicate_key(name: &str) -> DecodeError {
    DecodeError::duplicate_key(name)
}

/// Read the remaining keys of an object that has no fields of its own
#[inline]
pub fn decode_no_fields<D: Decoder + ?Sized>(
    d: &mut D,
    tag_key: Option<&str>,
    strict: bool,
) -> Result<(), DecodeError> {
    while let Some(key) = d.next_key()? {
        check_unknown_key(key, tag_key, strict)?;
        d.skip_value()?;
    }
    Ok(())
}

#[cold]
pub fn missing_field(name: &str) -> DecodeError {
    DecodeError::missing_field(name)
}

#[cold]
pub fn unknown_variant(tag: &str, expected: &[&str]) -> DecodeError {
    DecodeError::unknown_variant(tag, expected)
}

/// Apply doc comment / deprecation metadata to a type definition
pub fn with_metadata(
    mut def: TypeDef,
    description: Option<&str>,
    deprecated: Option<Option<&str>>,
) -> TypeDef {
    if let Some(description) = description {
        def.metadata.description = Some(description.to_string());
    }
    if let Some(note) = deprecated {
        def.metadata.is_deprecated = true;
        def.metadata.deprecated_note = note.map(str::to_string);
    }
    def
}

/// Encodes a newtype variant of an internally tagged union.
///
/// The variant's value must be an object. The tag is written as the first entry of that object
/// and every other call is passed through.
pub struct TaggedEncoder<'a, E: ?Sized> {
    inner: &'a mut E,
    tag_key: &'a str,
    tag: &'a str,
    started: bool,
}

impl<'a, E: Encoder + ?Sized> TaggedEncoder<'a, E> {
    #[inline]
    pub fn new(inner: &'a mut E, tag_key: &'a str, tag: &'a str) -> Self {
        Self {
            inner,
            tag_key,
            tag,
            started: false,
        }
    }

    #[cold]
    fn not_an_object(&self) -> EncodeError {
        EncodeError::custom(format!(
            "the \"{}\" variant of an internally tagged union must be encoded as an object",
            self.tag
        ))
    }
}

macro_rules! tagged_encode {
    ($($method:ident($($arg:ident: $ty:ty),*);)*) => {
        $(
            #[inline]
            fn $method(&mut self, $($arg: $ty),*) -> Result<(), EncodeError> {
                if !self.started {
                    return Err(self.not_an_object());
                }
                self.inner.$method($($arg),*)
            }
        )*
    };
}

impl<E: Encoder + ?Sized> Encoder for TaggedEncoder<'_, E> {
    tagged_encode! {
        encode_null();
        encode_bool(v: bool);
        encode_f32(v: f32);
        encode_f64(v: f64);
        encode_i8(v: i8);
        encode_u8(v: u8);
        encode_i16(v: i16);
        encode_u16(v: u16);
        encode_i32(v: i32);
        encode_u32(v: u32);
        encode_i64(v: i64);
        encode_u64(v: u64);
        encode_str(v: &str);
        encode_timestamp(v: &Timestamp);
        encode_number(v: Number);
        encode_key(key: &str);
        end_object();
        begin_list(len: usize);
        end_list();
    }

    #[inline]
    fn begin_object(&mut self, len: usize) -> Result<(), EncodeError> {
        if self.started {
            return self.inner.begin_object(len);
        }
        self.started = true;
        self.inner.begin_object(len + 1)?;
        self.inner.encode_key(self.tag_key)?;
        self.inner.encode_str(self.tag)
    }
}

/// Decodes a newtype variant of an internally tagged union.
///
/// The union has already opened the object and read the tag, so the variant's first
/// [`Decoder::begin_object`] continues reading that object instead of opening a new one.
/// Finding the tag key again in that object is a duplicate key error.
pub struct TaggedDecoder<'a, D: ?Sized> {
    inner: &'a mut D,
    tag_key: &'a str,
    /// how many objects / lists are open. 0 means the variant hasn't started reading its object yet
    /// and 1 means it's reading the object that contains the tag.
    depth: usize,
}

impl<'a, D: Decoder + ?Sized> TaggedDecoder<'a, D> {
    #[inline(always)]
    pub fn new(inner: &'a mut D, tag_key: &'a str) -> Self {
        Self {
            inner,
            tag_key,
            depth: 0,
        }
    }
}

#[cold]
fn tagged_not_an_object(expected: &str) -> DecodeError {
    DecodeError::invalid_type(expected, "object")
}

macro_rules! tagged_decode {
    ($($method:ident -> $ty:ty, $expected:literal;)*) => {
        $(
            #[inline(always)]
            fn $method(&mut self) -> Result<$ty, DecodeError> {
                if self.depth == 0 {
                    return Err(tagged_not_an_object($expected));
                }
                self.inner.$method()
            }
        )*
    };
}

impl<D: Decoder + ?Sized> Decoder for TaggedDecoder<'_, D> {
    tagged_decode! {
        decode_bool -> bool, "boolean";
        decode_f32 -> f32, "float32";
        decode_f64 -> f64, "float64";
        decode_i8 -> i8, "int8";
        decode_u8 -> u8, "uint8";
        decode_i16 -> i16, "int16";
        decode_u16 -> u16, "uint16";
        decode_i32 -> i32, "int32";
        decode_u32 -> u32, "uint32";
        decode_i64 -> i64, "int64";
        decode_u64 -> u64, "uint64";
        decode_string -> String, "string";
        decode_str -> &str, "string";
        decode_timestamp -> Timestamp, "timestamp";
        decode_any -> Value, "any";
    }

    #[inline(always)]
    fn decode_null(&mut self) -> Result<bool, DecodeError> {
        // the variant's value is an object that has already been opened, so it isn't null
        if self.depth == 0 {
            return Ok(false);
        }
        self.inner.decode_null()
    }

    #[inline(always)]
    fn begin_object(&mut self) -> Result<Option<usize>, DecodeError> {
        if self.depth == 0 {
            self.depth = 1;
            return Ok(None);
        }
        let len = self.inner.begin_object()?;
        self.depth += 1;
        Ok(len)
    }

    #[inline(always)]
    fn next_key(&mut self) -> Result<Option<&str>, DecodeError> {
        if self.depth == 0 {
            return Err(DecodeError::custom(
                "next_key() called outside of an object",
            ));
        }
        let depth = self.depth;
        let tag_key = self.tag_key;
        match self.inner.next_key()? {
            Some(key) if depth == 1 && key == tag_key => Err(duplicate_key(tag_key)),
            Some(key) => Ok(Some(key)),
            None => {
                self.depth -= 1;
                Ok(None)
            }
        }
    }

    #[inline(always)]
    fn begin_list(&mut self) -> Result<Option<usize>, DecodeError> {
        if self.depth == 0 {
            return Err(tagged_not_an_object("array"));
        }
        let len = self.inner.begin_list()?;
        self.depth += 1;
        Ok(len)
    }

    #[inline(always)]
    fn next_element(&mut self) -> Result<bool, DecodeError> {
        let has_next = self.inner.next_element()?;
        if !has_next {
            self.depth -= 1;
        }
        Ok(has_next)
    }

    #[inline(always)]
    fn skip_value(&mut self) -> Result<(), DecodeError> {
        if self.depth == 0 {
            // skip the rest of the variant's object
            self.begin_object()?;
            while self.next_key()?.is_some() {
                self.inner.skip_value()?;
            }
            return Ok(());
        }
        self.inner.skip_value()
    }
}
