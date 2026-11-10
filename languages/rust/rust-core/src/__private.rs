//! Runtime helpers used by `#[derive(ArriModel)]`. Not part of the public API.

use crate::{DecodeError, Decoder, TypeDef, Value, ValueDecoder};

pub use std::borrow::Cow;
pub use std::option::Option::{self, None, Some};
pub use std::result::Result::{self, Err, Ok};
pub use std::string::String;
pub use std::vec::Vec;

/// Implemented by derived unions. Decodes a variant once its tag is known.
pub trait DecodeVariant: Sized {
    /// Every tag value that the union accepts
    const VARIANTS: &'static [&'static str];

    /// Decode the variant with the given `tag`.
    ///
    /// For externally and adjacently tagged unions the decoder is positioned at the variant's value.
    /// For internally tagged unions the decoder is positioned inside of an object that has already
    /// been opened, and the remaining keys of that object belong to the variant.
    fn decode_variant<D: Decoder + ?Sized>(
        d: &mut D,
        tag: &str,
        key: &mut String,
    ) -> Result<Self, DecodeError>;
}

fn check_variant<T: DecodeVariant>(tag: &str) -> Result<(), DecodeError> {
    if T::VARIANTS.contains(&tag) {
        Ok(())
    } else {
        Err(DecodeError::unknown_variant(tag, T::VARIANTS))
    }
}

/// `{ "<tag>": <value> }`
pub fn decode_external<T: DecodeVariant, D: Decoder + ?Sized>(d: &mut D) -> Result<T, DecodeError> {
    d.begin_object()?;
    let mut tag = String::new();
    if !d.next_key(&mut tag)? {
        return Err(DecodeError::invalid_value(
            "expected an object with exactly one key indicating the union variant",
        ));
    }
    check_variant::<T>(&tag).map_err(|e| e.in_field(&tag))?;
    let mut key = String::new();
    let value = T::decode_variant(d, &tag, &mut key).map_err(|e| e.in_field(&tag))?;
    if d.next_key(&mut key)? {
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
    let mut key = String::new();
    if !d.next_key(&mut key)? {
        return Err(DecodeError::missing_field(tag_key));
    }

    // fast path: the tag is the first key (arri encoders always write it first)
    if key == tag_key {
        let tag = d.decode_string().map_err(|e| e.in_field(tag_key))?;
        check_variant::<T>(&tag).map_err(|e| e.in_field(tag_key))?;
        return T::decode_variant(d, &tag, &mut key);
    }

    // slow path: buffer the object until the tag is found and then decode the variant from the buffer
    let mut entries: Vec<(String, Value)> = Vec::new();
    loop {
        let value = d.decode_any().map_err(|e| e.in_field(&key))?;
        entries.push((std::mem::take(&mut key), value));
        if !d.next_key(&mut key)? {
            break;
        }
    }
    let tag = match entries.iter().rev().find(|(k, _)| k == tag_key) {
        Some((_, Value::String(tag))) => tag.clone(),
        Some(_) => {
            return Err(DecodeError::invalid_value("union tag must be a string").in_field(tag_key));
        }
        None => return Err(DecodeError::missing_field(tag_key)),
    };
    check_variant::<T>(&tag).map_err(|e| e.in_field(tag_key))?;
    let mut buffered = ValueDecoder::new(Value::Object(entries));
    buffered.begin_object()?;
    T::decode_variant(&mut buffered, &tag, &mut key)
}

/// `{ "<tag_key>": "<tag>", "<value_key>": <value> }`
pub fn decode_adjacent<T: DecodeVariant, D: Decoder + ?Sized>(
    d: &mut D,
    tag_key: &str,
    value_key: &str,
    strict: bool,
) -> Result<T, DecodeError> {
    d.begin_object()?;
    let mut key = String::new();
    let mut tag: Option<String> = None;
    let mut result: Option<T> = None;
    // used when the value appears before the tag
    let mut buffered: Option<Value> = None;
    while d.next_key(&mut key)? {
        if key == tag_key {
            let value = d.decode_string().map_err(|e| e.in_field(tag_key))?;
            check_variant::<T>(&value).map_err(|e| e.in_field(tag_key))?;
            tag = Some(value);
        } else if key == value_key {
            match &tag {
                Some(tag) => {
                    result = Some(
                        T::decode_variant(d, tag, &mut key).map_err(|e| e.in_field(value_key))?,
                    );
                }
                None => buffered = Some(d.decode_any().map_err(|e| e.in_field(value_key))?),
            }
        } else {
            unknown_key(d, &key, None, strict)?;
        }
    }
    let Some(tag) = tag else {
        return Err(DecodeError::missing_field(tag_key));
    };
    if let Some(result) = result {
        return Ok(result);
    }
    match buffered {
        Some(value) => T::decode_variant(&mut ValueDecoder::new(value), &tag, &mut key)
            .map_err(|e| e.in_field(value_key)),
        None => Err(DecodeError::missing_field(value_key)),
    }
}

/// Handle a key that doesn't belong to any field
#[inline]
pub fn unknown_key<D: Decoder + ?Sized>(
    d: &mut D,
    key: &str,
    skip_key: Option<&str>,
    strict: bool,
) -> Result<(), DecodeError> {
    if strict && skip_key != Some(key) {
        return Err(DecodeError::unknown_field(key));
    }
    d.skip_value()
}

/// Read the remaining keys of an object that has no fields of its own
#[inline]
pub fn decode_no_fields<D: Decoder + ?Sized>(
    d: &mut D,
    key: &mut String,
    skip_key: Option<&str>,
    strict: bool,
) -> Result<(), DecodeError> {
    while d.next_key(key)? {
        unknown_key(d, key, skip_key, strict)?;
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
