use sqlx_core::{
    decode::Decode as SqlxDecode,
    encode::{Encode as SqlxEncode, IsNull},
    error::BoxDynError,
    type_info::TypeInfo,
    types::{JsonValue, Type as SqlxType},
    value::ValueRef,
};
use sqlx_postgres::{
    PgArgumentBuffer, PgHasArrayType, PgTypeInfo, PgValueFormat, PgValueRef, Postgres, types::Oid,
};

use super::{Json, parse_sql_timestamp};
use crate::{Decode, Encode, Nullable, Timestamp, Value, json::JsonEncoder};

/// PostgreSQL's `jsonb` binary format version prefix.
const JSONB_VERSION: u8 = 1;

/// PostgreSQL epoch (`2000-01-01T00:00:00Z`) in seconds since the Unix epoch.
const PG_EPOCH_SECS: i64 = 946_684_800;

/// Built-in PostgreSQL OID for `timestamptz` (`timestamp with time zone`).
const PG_TIMESTAMPTZ_OID: Oid = Oid(1184);

/// Built-in PostgreSQL OID for `_timestamptz` (`timestamptz[]`).
const PG_TIMESTAMPTZ_ARRAY_OID: Oid = Oid(1185);

// --- Json<T> ---

impl<T: ?Sized> SqlxType<Postgres> for Json<T> {
    fn type_info() -> PgTypeInfo {
        <JsonValue as SqlxType<Postgres>>::type_info()
    }

    fn compatible(ty: &PgTypeInfo) -> bool {
        <JsonValue as SqlxType<Postgres>>::compatible(ty)
    }
}

impl<T> PgHasArrayType for Json<T> {
    fn array_type_info() -> PgTypeInfo {
        <JsonValue as PgHasArrayType>::array_type_info()
    }

    fn array_compatible(ty: &PgTypeInfo) -> bool {
        <JsonValue as PgHasArrayType>::array_compatible(ty)
    }
}

impl<T: Encode + ?Sized> SqlxEncode<'_, Postgres> for Json<T> {
    fn encode_by_ref(&self, buf: &mut PgArgumentBuffer) -> Result<IsNull, BoxDynError> {
        // Encodes in PostgreSQL's JSONB binary wire format (version byte + UTF-8 JSON).
        buf.push(JSONB_VERSION);
        JsonEncoder::encode_into(&self.0, buf)?;
        Ok(IsNull::No)
    }
}

impl<'r, T: Decode> SqlxDecode<'r, Postgres> for Json<T> {
    fn decode(value: PgValueRef<'r>) -> Result<Self, BoxDynError> {
        let mut buf = value.as_bytes()?;

        if value.format() == PgValueFormat::Binary
            && value.type_info().as_ref() == &<JsonValue as SqlxType<Postgres>>::type_info()
        {
            match buf.first() {
                Some(&JSONB_VERSION) => buf = &buf[1..],
                Some(&version) => {
                    return Err(format!("unsupported JSONB format version {version}").into());
                }
                None => return Err("unexpected empty JSONB value".into()),
            }
        }

        crate::json::from_slice(buf).map(Json).map_err(Into::into)
    }
}

// --- Value ---

impl PgHasArrayType for Value {
    fn array_type_info() -> PgTypeInfo {
        <JsonValue as PgHasArrayType>::array_type_info()
    }

    fn array_compatible(ty: &PgTypeInfo) -> bool {
        <JsonValue as PgHasArrayType>::array_compatible(ty)
    }
}

// --- Nullable<T> ---

impl<T: PgHasArrayType> PgHasArrayType for Nullable<T> {
    fn array_type_info() -> PgTypeInfo {
        T::array_type_info()
    }

    fn array_compatible(ty: &PgTypeInfo) -> bool {
        T::array_compatible(ty)
    }
}

// --- Timestamp ---

impl SqlxType<Postgres> for Timestamp {
    fn type_info() -> PgTypeInfo {
        PgTypeInfo::with_oid(PG_TIMESTAMPTZ_OID)
    }

    fn compatible(ty: &PgTypeInfo) -> bool {
        ty.oid() == Some(PG_TIMESTAMPTZ_OID) || ty.name().eq_ignore_ascii_case("timestamptz")
    }
}

impl PgHasArrayType for Timestamp {
    fn array_type_info() -> PgTypeInfo {
        PgTypeInfo::with_oid(PG_TIMESTAMPTZ_ARRAY_OID)
    }

    fn array_compatible(ty: &PgTypeInfo) -> bool {
        ty.oid() == Some(PG_TIMESTAMPTZ_ARRAY_OID)
            || ty.name().eq_ignore_ascii_case("timestamptz[]")
            || ty.name().eq_ignore_ascii_case("_timestamptz")
    }
}

impl SqlxEncode<'_, Postgres> for Timestamp {
    fn encode_by_ref(&self, buf: &mut PgArgumentBuffer) -> Result<IsNull, BoxDynError> {
        let micros = (self.unix_seconds() as i128 - PG_EPOCH_SECS as i128) * 1_000_000
            + (self.subsec_nanos() / 1_000) as i128;
        let micros = i64::try_from(micros)
            .map_err(|_| format!("Timestamp out of range for Postgres: {self}"))?;
        buf.extend_from_slice(&micros.to_be_bytes());
        Ok(IsNull::No)
    }

    fn size_hint(&self) -> usize {
        std::mem::size_of::<i64>()
    }
}

impl<'r> SqlxDecode<'r, Postgres> for Timestamp {
    fn decode(value: PgValueRef<'r>) -> Result<Self, BoxDynError> {
        match value.format() {
            PgValueFormat::Binary => {
                let micros = <i64 as SqlxDecode<Postgres>>::decode(value)?;
                decode_pg_micros(micros)
            }
            PgValueFormat::Text => {
                let text = value.as_str()?;
                parse_sql_timestamp(text, false).map_err(Into::into)
            }
        }
    }
}

fn decode_pg_micros(micros: i64) -> Result<Timestamp, BoxDynError> {
    let secs = PG_EPOCH_SECS
        .checked_add(micros.div_euclid(1_000_000))
        .ok_or_else(|| format!("Postgres timestamp out of range: {micros} us"))?;
    let nanos = (micros.rem_euclid(1_000_000) as u32) * 1_000;
    Timestamp::from_unix(secs, nanos).map_err(Into::into)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn json_type_info_and_array_type_info() {
        assert_eq!(
            <Json<String> as SqlxType<Postgres>>::type_info().name(),
            "JSONB"
        );
        assert!(<Json<String> as SqlxType<Postgres>>::compatible(
            &<JsonValue as SqlxType<Postgres>>::type_info()
        ));
        assert!(<Json<String> as SqlxType<Postgres>>::compatible(
            &PgTypeInfo::with_oid(Oid(114))
        ));
        assert!(!<Json<String> as SqlxType<Postgres>>::compatible(
            &<i32 as SqlxType<Postgres>>::type_info()
        ));
        assert_eq!(
            <Json<String> as PgHasArrayType>::array_type_info().name(),
            "JSONB[]"
        );
        assert_eq!(
            <Value as PgHasArrayType>::array_type_info().name(),
            "JSONB[]"
        );
    }

    #[test]
    fn json_encode_writes_jsonb_version_prefix() {
        let mut buf = PgArgumentBuffer::default();
        let value = Json(vec![1i64, 2i64]);
        let is_null = SqlxEncode::<Postgres>::encode_by_ref(&value, &mut buf).unwrap();
        assert!(!is_null.is_null());
        assert_eq!(&*buf, b"\x01[\"1\",\"2\"]");
    }

    #[test]
    fn value_encode_writes_jsonb_version_prefix() {
        let mut buf = PgArgumentBuffer::default();
        let is_null = SqlxEncode::<Postgres>::encode_by_ref(&Value::Null, &mut buf).unwrap();
        assert!(!is_null.is_null());
        assert_eq!(&*buf, b"\x01null");
    }

    #[test]
    fn nullable_encode_null_and_present() {
        let mut buf = PgArgumentBuffer::default();
        let is_null =
            SqlxEncode::<Postgres>::encode_by_ref(&Nullable::<i32>::Null, &mut buf).unwrap();
        assert!(is_null.is_null());
        assert!(buf.is_empty());

        let is_null =
            SqlxEncode::<Postgres>::encode_by_ref(&Nullable::Present(42i32), &mut buf).unwrap();
        assert!(!is_null.is_null());
        assert_eq!(&*buf, &42i32.to_be_bytes());
    }

    #[test]
    fn timestamp_type_info_and_binary_round_trip() {
        assert_eq!(
            <Timestamp as SqlxType<Postgres>>::type_info().oid(),
            Some(PG_TIMESTAMPTZ_OID)
        );
        assert!(<Timestamp as SqlxType<Postgres>>::compatible(
            &PgTypeInfo::with_oid(PG_TIMESTAMPTZ_OID)
        ));
        assert!(!<Timestamp as SqlxType<Postgres>>::compatible(
            &<i64 as SqlxType<Postgres>>::type_info()
        ));
        assert!(<Timestamp as PgHasArrayType>::array_compatible(
            &PgTypeInfo::with_oid(PG_TIMESTAMPTZ_ARRAY_OID)
        ));

        for input in [
            "2000-01-01T00:00:00.000Z",
            "2001-01-01T16:00:00.123456Z",
            "1970-01-01T00:00:00.000Z",
            "1969-12-31T23:59:59.999999Z",
            "1999-12-31T23:59:59.000001Z",
        ] {
            let ts = Timestamp::parse(input).unwrap();
            let mut buf = PgArgumentBuffer::default();
            let is_null = SqlxEncode::<Postgres>::encode_by_ref(&ts, &mut buf).unwrap();
            assert!(!is_null.is_null());
            let micros = i64::from_be_bytes((*buf).as_slice().try_into().unwrap());
            assert_eq!(decode_pg_micros(micros).unwrap(), ts, "{input}");
        }
    }
}
