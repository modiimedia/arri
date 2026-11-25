//! Optional [sqlx](https://docs.rs/sqlx) integration (`sqlx-postgres`, `sqlx-mysql`, `sqlx-sqlite`).
//!
//! Wrap any type implementing [`Encode`] / [`Decode`] in [`Json`] to bind or fetch it as a SQL
//! JSON column without requiring `serde` or `serde_json`:
//!
//! ```rust,ignore
//! use arri::{Arri, Nullable, Timestamp, Value, sqlx::Json};
//!
//! #[derive(Arri)]
//! struct UserSettings {
//!     theme: String,
//!     notifications: bool,
//! }
//!
//! #[derive(sqlx::FromRow)]
//! struct UserRow {
//!     id: String,
//!     bio: Nullable<String>,
//!     settings: Json<UserSettings>,
//!     extra: Value,
//!     created_at: Timestamp,
//! }
//! ```
//!
//! In addition to [`Json<T>`], this integration implements `sqlx`'s `Type`, `Encode`, and `Decode`
//! traits directly for [`Value`], [`Nullable<T>`], and [`Timestamp`].
//!
//! When using `sqlx`'s compile-time checked macros (`query!`, `query_as!`), use SQLx's column
//! type override syntax (e.g. `settings AS "settings: arri::sqlx::Json<UserSettings>"`).

use std::{
    borrow::Cow,
    ops::{Deref, DerefMut},
};

use sqlx_core::{
    database::Database,
    decode::Decode as SqlxDecode,
    encode::{Encode as SqlxEncode, IsNull},
    error::BoxDynError,
    type_info::TypeInfo,
    types::Type as SqlxType,
    value::ValueRef,
};

use crate::{
    Decode, DecodeError, Decoder, Encode, EncodeError, Encoder, Nullable, SchemaContext, Timestamp,
    TimestampError, Type, TypeDef, Value,
};

#[cfg(feature = "sqlx-mysql")]
mod mysql;
#[cfg(feature = "sqlx-postgres")]
mod postgres;
#[cfg(feature = "sqlx-sqlite")]
mod sqlite;

/// Wrapper for encoding and decoding any Arri [`Encode`] / [`Decode`] type as a SQL JSON column.
///
/// Mirrors `sqlx::types::Json<T>` using [`crate::json`] instead of `serde_json`:
///
/// - **PostgreSQL** (`sqlx-postgres`): maps to `JSONB` (and decodes both `JSONB` and `JSON`).
///   Also implements `PgHasArrayType` so `Vec<Json<T>>` works with `JSONB[]` / `JSON[]`.
/// - **MySQL** (`sqlx-mysql`): maps to `JSON` (and accepts string/blob types).
/// - **SQLite** (`sqlx-sqlite`): maps to `TEXT`.
///
/// `Json<T>` also forwards Arri's own [`Type`], [`Encode`], and [`Decode`] traits transparently
/// to `T`, so it can be embedded inside `#[derive(Arri)]` structs if needed.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Json<T: ?Sized>(pub T);

impl<T> Json<T> {
    /// Unwrap the inner value.
    #[inline]
    pub fn into_inner(self) -> T {
        self.0
    }
}

impl<T> From<T> for Json<T> {
    #[inline]
    fn from(value: T) -> Self {
        Self(value)
    }
}

impl<T: ?Sized> Deref for Json<T> {
    type Target = T;

    #[inline]
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<T: ?Sized> DerefMut for Json<T> {
    #[inline]
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl<T: ?Sized> AsRef<T> for Json<T> {
    #[inline]
    fn as_ref(&self) -> &T {
        &self.0
    }
}

impl<T: ?Sized> AsMut<T> for Json<T> {
    #[inline]
    fn as_mut(&mut self) -> &mut T {
        &mut self.0
    }
}

impl<T: Type + ?Sized> Type for Json<T> {
    const PROPERTIES: Option<&'static [&'static str]> = T::PROPERTIES;

    fn generic_name() -> Cow<'static, str> {
        T::generic_name()
    }

    fn type_def(ctx: &mut SchemaContext) -> TypeDef {
        T::type_def(ctx)
    }
}

impl<T: Encode + ?Sized> Encode for Json<T> {
    #[inline]
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        self.0.encode(e)
    }

    #[inline]
    fn encode_internally_tagged<E: Encoder + ?Sized>(
        &self,
        e: &mut E,
        tag_key: &str,
        tag: &str,
    ) -> Result<(), EncodeError> {
        self.0.encode_internally_tagged(e, tag_key, tag)
    }
}

impl<T: Decode> Decode for Json<T> {
    #[inline]
    fn decode<D: Decoder + ?Sized>(d: &mut D) -> Result<Self, DecodeError> {
        T::decode(d).map(Self)
    }

    #[inline]
    fn decode_internally_tagged<D: Decoder + ?Sized>(
        d: &mut D,
        tag_key: &str,
    ) -> Result<Self, DecodeError> {
        T::decode_internally_tagged(d, tag_key).map(Self)
    }
}

#[cfg(feature = "serde")]
impl<T: ::serde::Serialize + ?Sized> ::serde::Serialize for Json<T> {
    fn serialize<S: ::serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        self.0.serialize(serializer)
    }
}

#[cfg(feature = "serde")]
impl<'de, T: ::serde::Deserialize<'de>> ::serde::Deserialize<'de> for Json<T> {
    fn deserialize<D: ::serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        T::deserialize(deserializer).map(Self)
    }
}

// --- Value ---
// Delegates to `Json<Value>` for every database backend that implements `Json`.
// `Value::Null` encodes as JSON `null` (not SQL `NULL`); wrap in `Option<Value>` or
// `Nullable<Value>` for nullable SQL columns.

impl<DB> SqlxType<DB> for Value
where
    Json<Self>: SqlxType<DB>,
    DB: Database,
{
    fn type_info() -> DB::TypeInfo {
        <Json<Self> as SqlxType<DB>>::type_info()
    }

    fn compatible(ty: &DB::TypeInfo) -> bool {
        <Json<Self> as SqlxType<DB>>::compatible(ty)
    }
}

impl<'q, DB> SqlxEncode<'q, DB> for Value
where
    for<'a> Json<&'a Self>: SqlxEncode<'q, DB>,
    DB: Database,
{
    fn encode_by_ref(
        &self,
        buf: &mut <DB as Database>::ArgumentBuffer<'q>,
    ) -> Result<IsNull, BoxDynError> {
        <Json<&Self> as SqlxEncode<'q, DB>>::encode(Json(self), buf)
    }
}

impl<'r, DB> SqlxDecode<'r, DB> for Value
where
    Json<Self>: SqlxDecode<'r, DB>,
    DB: Database,
{
    fn decode(value: <DB as Database>::ValueRef<'r>) -> Result<Self, BoxDynError> {
        <Json<Self> as SqlxDecode<'r, DB>>::decode(value).map(Json::into_inner)
    }
}

// --- Nullable<T> ---
// Mirrors `Option<T>` in `sqlx`: `Nullable::Null` maps to SQL `NULL`.

impl<T, DB> SqlxType<DB> for Nullable<T>
where
    T: SqlxType<DB>,
    DB: Database,
{
    fn type_info() -> DB::TypeInfo {
        <T as SqlxType<DB>>::type_info()
    }

    fn compatible(ty: &DB::TypeInfo) -> bool {
        ty.is_null() || <T as SqlxType<DB>>::compatible(ty)
    }
}

impl<'q, T, DB> SqlxEncode<'q, DB> for Nullable<T>
where
    T: SqlxEncode<'q, DB> + SqlxType<DB> + 'q,
    DB: Database,
{
    #[inline]
    fn produces(&self) -> Option<DB::TypeInfo> {
        match self {
            Nullable::Present(value) => value.produces(),
            Nullable::Null => Some(T::type_info()),
        }
    }

    #[inline]
    fn encode(self, buf: &mut <DB as Database>::ArgumentBuffer<'q>) -> Result<IsNull, BoxDynError> {
        match self {
            Nullable::Present(value) => value.encode(buf),
            Nullable::Null => Ok(IsNull::Yes),
        }
    }

    #[inline]
    fn encode_by_ref(
        &self,
        buf: &mut <DB as Database>::ArgumentBuffer<'q>,
    ) -> Result<IsNull, BoxDynError> {
        match self {
            Nullable::Present(value) => value.encode_by_ref(buf),
            Nullable::Null => Ok(IsNull::Yes),
        }
    }

    #[inline]
    fn size_hint(&self) -> usize {
        match self {
            Nullable::Present(value) => value.size_hint(),
            Nullable::Null => 0,
        }
    }
}

impl<'r, T, DB> SqlxDecode<'r, DB> for Nullable<T>
where
    T: SqlxDecode<'r, DB>,
    DB: Database,
{
    fn decode(value: <DB as Database>::ValueRef<'r>) -> Result<Self, BoxDynError> {
        if value.is_null() {
            Ok(Nullable::Null)
        } else {
            T::decode(value).map(Nullable::Present)
        }
    }
}

/// Parse SQL textual timestamp formats into [`Timestamp`].
///
/// Accepts RFC 3339 as well as common SQL variants:
/// - `YYYY-MM-DD HH:MM:SS` (and `YYYY-MM-DD HH:MM` for SQLite)
/// - optional fractional seconds (`.f` through nanosecond precision)
/// - optional timezone specifier: `Z`/`z`, `±HH`, `±HH:MM`, or `±HHMM`
///
/// When `allow_naive_utc` is `true`, timestamps without a timezone offset are interpreted as UTC.
pub(crate) fn parse_sql_timestamp(
    input: &str,
    allow_naive_utc: bool,
) -> Result<Timestamp, TimestampError> {
    if let Ok(ts) = Timestamp::parse(input) {
        return Ok(ts);
    }
    let b = input.as_bytes();
    // shortest valid naive input with minutes: "YYYY-MM-DD HH:MM" (16 bytes)
    if b.len() < 16 {
        return Err(Timestamp::parse(input).unwrap_err());
    }
    let year = parse_ascii_digits(b, 0, 4)? as i64;
    if b[4] != b'-' || b[7] != b'-' {
        return Err(Timestamp::parse(input).unwrap_err());
    }
    let month = parse_ascii_digits(b, 5, 2)?;
    let day = parse_ascii_digits(b, 8, 2)?;
    if !matches!(b[10], b'T' | b't' | b' ') {
        return Err(Timestamp::parse(input).unwrap_err());
    }
    let hour = parse_ascii_digits(b, 11, 2)?;
    if b[13] != b':' {
        return Err(Timestamp::parse(input).unwrap_err());
    }
    let minute = parse_ascii_digits(b, 14, 2)?;

    let mut pos = 16;
    let second = if b.get(pos) == Some(&b':') {
        if b.len() < pos + 3 {
            return Err(Timestamp::parse(input).unwrap_err());
        }
        let s = parse_ascii_digits(b, pos + 1, 2)?;
        pos += 3;
        s
    } else {
        0
    };

    let mut nanos: u32 = 0;
    if b.get(pos) == Some(&b'.') {
        pos += 1;
        let start = pos;
        let mut scale = 100_000_000u32;
        while pos < b.len() && b[pos].is_ascii_digit() {
            nanos += (b[pos] - b'0') as u32 * scale;
            scale /= 10;
            pos += 1;
        }
        if pos == start {
            return Err(Timestamp::parse(input).unwrap_err());
        }
    }

    let rest = &b[pos..];
    let offset_minutes: i16 = match rest {
        [] if allow_naive_utc => 0,
        [b'Z' | b'z'] => 0,
        [sign @ (b'+' | b'-'), tz @ ..] => {
            let sign: i16 = if *sign == b'-' { -1 } else { 1 };
            let (tz_h, tz_m) = match tz {
                // +HH (Postgres text format, e.g. `+00`, `-08`)
                [h1, h2] if h1.is_ascii_digit() && h2.is_ascii_digit() => {
                    (parse_ascii_digits(tz, 0, 2)?, 0)
                }
                // +HHMM
                [h1, h2, m1, m2]
                    if h1.is_ascii_digit()
                        && h2.is_ascii_digit()
                        && m1.is_ascii_digit()
                        && m2.is_ascii_digit() =>
                {
                    (parse_ascii_digits(tz, 0, 2)?, parse_ascii_digits(tz, 2, 2)?)
                }
                // +HH:MM
                [h1, h2, b':', m1, m2]
                    if h1.is_ascii_digit()
                        && h2.is_ascii_digit()
                        && m1.is_ascii_digit()
                        && m2.is_ascii_digit() =>
                {
                    (parse_ascii_digits(tz, 0, 2)?, parse_ascii_digits(tz, 3, 2)?)
                }
                _ => return Err(Timestamp::parse(input).unwrap_err()),
            };
            if tz_h > 23 || tz_m > 59 {
                return Err(Timestamp::parse(input).unwrap_err());
            }
            sign * (tz_h * 60 + tz_m) as i16
        }
        _ => return Err(Timestamp::parse(input).unwrap_err()),
    };

    Timestamp::from_date_time(
        year,
        month,
        day,
        hour,
        minute,
        second,
        nanos,
        offset_minutes,
    )
}

fn parse_ascii_digits(b: &[u8], start: usize, len: usize) -> Result<u32, TimestampError> {
    let mut value = 0u32;
    for &byte in &b[start..start + len] {
        if !byte.is_ascii_digit() {
            return Err(Timestamp::parse("").unwrap_err());
        }
        value = value * 10 + (byte - b'0') as u32;
    }
    Ok(value)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_sql_timestamp_variants() {
        // Postgres text format (+HH)
        let pg = parse_sql_timestamp("2001-01-01 16:00:00+00", false).unwrap();
        assert_eq!(pg.to_rfc3339(), "2001-01-01T16:00:00.000Z");

        let pg_off = parse_sql_timestamp("2001-01-01 08:00:00.123456-08", false).unwrap();
        assert_eq!(pg_off.unix_seconds(), 978_364_800);
        assert_eq!(pg_off.subsec_nanos(), 123_456_000);
        assert_eq!(pg_off.offset_minutes(), -480);

        let pg_half = parse_sql_timestamp("2001-01-01 21:30:00+05:30", false).unwrap();
        assert_eq!(pg_half, pg);
        assert_eq!(pg_half.offset_minutes(), 330);

        // Naive UTC (MySQL / SQLite)
        let naive = parse_sql_timestamp("2001-01-01 16:00:00.5", true).unwrap();
        assert_eq!(naive.to_rfc3339(), "2001-01-01T16:00:00.500Z");

        // SQLite HH:MM without seconds
        let no_sec = parse_sql_timestamp("2001-01-01 16:00", true).unwrap();
        assert_eq!(no_sec.to_rfc3339(), "2001-01-01T16:00:00.000Z");

        // Reject naive when timezone is required
        assert!(parse_sql_timestamp("2001-01-01 16:00:00", false).is_err());
        assert!(parse_sql_timestamp("not-a-timestamp", true).is_err());
    }

    #[cfg(feature = "derive")]
    #[test]
    fn json_wrapper_is_transparent_for_arri() {
        #[derive(crate::Arri, Debug, PartialEq)]
        struct Inner {
            id: String,
        }

        #[derive(crate::Arri, Debug, PartialEq)]
        struct Outer {
            inner: Json<Inner>,
        }

        assert_eq!(
            crate::type_def_of::<Json<Inner>>(),
            crate::type_def_of::<Inner>()
        );
        let outer = Outer {
            inner: Json(Inner { id: "1".into() }),
        };
        let encoded = crate::json::to_string(&outer).unwrap();
        assert_eq!(encoded, r#"{"inner":{"id":"1"}}"#);
        let decoded: Outer = crate::json::from_str(&encoded).unwrap();
        assert_eq!(decoded, outer);
    }
}
