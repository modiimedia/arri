//! Runtime helpers used by `#[derive(ArriModel)]`. Not part of the public API.

use crate::{DecodeError, Decoder, TypeDef, Value, ValueDecoder};

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
