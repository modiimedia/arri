//! Core building blocks for Arri RPC models in Rust.
//!
//! This crate provides three capabilities for your types:
//!
//! - [`ArriSchema`]: produce an [Arri Type Definition](https://github.com/modiimedia/arri/blob/master/specifications/arri_type_definition.md)
//! - [`Encode`]: write the type using any [`Encoder`] (currently [JSON](json))
//! - [`Decode`]: read the type using any [`Decoder`] (currently [JSON](json))
//!
//! All three are normally implemented with `#[derive(ArriModel)]`:
//!
//! ```
//! use arri::{ArriModel, Nullable, Timestamp};
//!
//! /// A user of the application
//! #[derive(ArriModel)]
//! struct User {
//!     id: String,
//!     name: Nullable<String>,
//!     created_at: Timestamp,
//!     /// The user's biography
//!     bio: Option<String>,
//! }
//!
//! let user: User = arri::json::from_str(
//!     r#"{"id":"1","name":null,"created_at":"2001-01-01T16:00:00.000Z"}"#,
//! )
//! .unwrap();
//! assert_eq!(
//!     arri::json::to_string(&user).unwrap(),
//!     r#"{"id":"1","name":null,"created_at":"2001-01-01T16:00:00.000Z"}"#,
//! );
//! ```
//!
//! # Optional vs nullable
//!
//! - `Option<T>` fields may be omitted from the payload. They are placed under `optionalProperties`.
//! - [`Nullable<T>`] values must be present but may be `null`. They are marked with `isNullable`.
//! - `Option<Nullable<T>>` fields may be omitted, `null`, or `T`.
//!
//! `Option<T>` is only meaningful as a struct field, so it does not implement the arri traits itself.
//!
//! # Supporting new formats
//!
//! The [`Encoder`] / [`Decoder`] traits describe values in terms of the Arri type system
//! (int64, timestamp, objects with known lengths, etc.) rather than in terms of JSON tokens.
//! How a value is represented is decided by the format. For example the JSON format writes
//! `int64` values as strings while a binary format could write them natively.

// allows the derive macro output (which references `::arri`) to be used inside this crate
extern crate self as arri;

mod decode;
mod encode;
mod impls;
pub mod json;
mod nullable;
mod schema;
mod timestamp;
mod type_def;
mod value;

#[doc(hidden)]
pub mod __private;

pub use decode::{Decode, DecodeError, DecodeErrorKind, DecodeFields, Decoder, PathSegment};
pub use encode::{Encode, EncodeError, EncodeFields, Encoder};
pub use nullable::Nullable;
pub use schema::{ArriSchema, SchemaContext, type_def_of};
pub use timestamp::{Timestamp, TimestampError};
pub use type_def::{Form, Metadata, Properties, Type, TypeDef, Union};
pub use value::{Number, Value, ValueDecoder, ValueEncoder, from_value, to_value};

/// Derives [`ArriSchema`], [`Encode`], and [`Decode`] for a struct or enum.
///
/// # Mapping
///
/// | Rust                                    | Arri schema form                         |
/// | --------------------------------------- | ---------------------------------------- |
/// | struct with named fields                | `properties`                             |
/// | struct with a single unnamed field      | the schema of the inner type             |
/// | enum where every variant is a unit      | `enum`                                   |
/// | any other enum                          | `union`                                  |
///
/// Union variants are mapped as follows:
///
/// - unit variants are empty objects (`{"properties": {}}`)
/// - newtype variants (`Variant(T)`) use the schema of `T`
/// - struct variants are anonymous objects
///
/// # Metadata
///
/// - The type name becomes `metadata.id`. For generic types the ids of each type argument are
///   appended (`Page<User>` becomes `PageUser`).
/// - Doc comments become `metadata.description` (on types, fields, and union variants)
/// - `#[deprecated]` becomes `metadata.isDeprecated`, and the deprecation note becomes `metadata.deprecatedNote`
///
/// # Attributes
///
/// Container attributes:
///
/// - `#[arri(id = "...")]`: override the type id
/// - `#[arri(rename_all = "...")]`: rename every field (structs) or variant (enums). Accepts
///   `snake_case`, `camelCase`, `PascalCase`, `SCREAMING_SNAKE_CASE`, `kebab-case`,
///   `SCREAMING-KEBAB-CASE`, `lowercase`, and `UPPERCASE`
/// - `#[arri(strict)]`: reject unknown keys when decoding (sets `isStrict` for structs)
/// - `#[arri(tag_key = "...")]`: make an enum an internally tagged union
/// - `#[arri(tag_key = "...", value_key = "...")]`: make an enum an adjacently tagged union
/// - `#[arri(crate = "...")]`: path to the `arri` crate, if it has been re-exported elsewhere
///
/// Variant attributes:
///
/// - `#[arri(rename = "...")]`: override the variant's serial value
/// - `#[arri(rename_all = "...")]`: rename every field of a struct variant
///
/// Field attributes:
///
/// - `#[arri(rename = "...")]`: override the field's key
#[cfg(feature = "derive")]
pub use arri_derive::ArriModel;

/// Marker trait for types that can describe, encode, and decode themselves.
///
/// Implemented automatically for every type that implements [`ArriSchema`], [`Encode`], and [`Decode`].
pub trait ArriModel: ArriSchema + Encode + Decode {}

impl<T: ArriSchema + Encode + Decode> ArriModel for T {}
