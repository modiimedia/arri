use sqlx_core::{
    decode::Decode as SqlxDecode,
    encode::{Encode as SqlxEncode, IsNull},
    error::BoxDynError,
    type_info::TypeInfo,
    types::Type as SqlxType,
    value::ValueRef,
};
use sqlx_sqlite::{Sqlite, SqliteArgumentValue, SqliteTypeInfo, SqliteValueRef};

use super::{Json, parse_sql_timestamp};
use crate::{Decode, Encode, Timestamp};

// --- Json<T> ---

impl<T: ?Sized> SqlxType<Sqlite> for Json<T> {
    fn type_info() -> SqliteTypeInfo {
        <str as SqlxType<Sqlite>>::type_info()
    }

    fn compatible(ty: &SqliteTypeInfo) -> bool {
        <&str as SqlxType<Sqlite>>::compatible(ty)
    }
}

impl<T: Encode + ?Sized> SqlxEncode<'_, Sqlite> for Json<T> {
    fn encode_by_ref(&self, buf: &mut Vec<SqliteArgumentValue<'_>>) -> Result<IsNull, BoxDynError> {
        let json = crate::json::to_string(&self.0)?;
        <String as SqlxEncode<Sqlite>>::encode(json, buf)
    }
}

impl<'r, T: Decode> SqlxDecode<'r, Sqlite> for Json<T> {
    fn decode(value: SqliteValueRef<'r>) -> Result<Self, BoxDynError> {
        let s = <&str as SqlxDecode<Sqlite>>::decode(value)?;
        crate::json::from_str(s).map(Json).map_err(Into::into)
    }
}

// --- Timestamp ---

impl SqlxType<Sqlite> for Timestamp {
    fn type_info() -> SqliteTypeInfo {
        <str as SqlxType<Sqlite>>::type_info()
    }

    fn compatible(ty: &SqliteTypeInfo) -> bool {
        matches!(ty.name(), "DATETIME" | "TEXT" | "INTEGER" | "REAL")
    }
}

impl SqlxEncode<'_, Sqlite> for Timestamp {
    fn encode_by_ref(&self, buf: &mut Vec<SqliteArgumentValue<'_>>) -> Result<IsNull, BoxDynError> {
        <String as SqlxEncode<Sqlite>>::encode(self.to_rfc3339(), buf)
    }
}

impl<'r> SqlxDecode<'r, Sqlite> for Timestamp {
    fn decode(value: SqliteValueRef<'r>) -> Result<Self, BoxDynError> {
        match value.type_info().name() {
            "TEXT" | "DATETIME" => {
                let s = <&str as SqlxDecode<Sqlite>>::decode(value)?;
                parse_sql_timestamp(s, true).map_err(Into::into)
            }
            "INTEGER" => {
                let secs = <i64 as SqlxDecode<Sqlite>>::decode(value)?;
                Timestamp::from_unix(secs, 0).map_err(Into::into)
            }
            "REAL" => {
                let julian = <f64 as SqlxDecode<Sqlite>>::decode(value)?;
                decode_julian_day(julian)
            }
            other => Err(format!("cannot decode Timestamp from SQLite {other} value").into()),
        }
    }
}

fn decode_julian_day(julian: f64) -> Result<Timestamp, BoxDynError> {
    const EPOCH_IN_JULIAN_DAYS: f64 = 2_440_587.5;
    const MILLIS_IN_DAY: f64 = 86_400_000.0;
    let millis = ((julian - EPOCH_IN_JULIAN_DAYS) * MILLIS_IN_DAY).round();
    if !millis.is_finite() || millis < i64::MIN as f64 || millis >= i64::MAX as f64 {
        return Err(format!("invalid SQLite Julian day timestamp: {julian}").into());
    }
    Timestamp::from_unix_millis(millis as i64).map_err(Into::into)
}
