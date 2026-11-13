use std::borrow::Cow;

use chrono::{DateTime, FixedOffset, Utc};

use crate::{
    Decode, DecodeError, Decoder, Encode, EncodeError, Encoder, SchemaContext, Timestamp,
    TimestampError, Type, TypeDef,
};

impl TryFrom<DateTime<Utc>> for Timestamp {
    type Error = TimestampError;

    fn try_from(value: DateTime<Utc>) -> Result<Self, Self::Error> {
        Timestamp::from_unix(value.timestamp(), value.timestamp_subsec_nanos())
    }
}

impl TryFrom<DateTime<FixedOffset>> for Timestamp {
    type Error = TimestampError;

    fn try_from(value: DateTime<FixedOffset>) -> Result<Self, Self::Error> {
        // RFC 3339 offsets only have minute precision
        let offset_minutes = (value.offset().local_minus_utc() / 60) as i16;
        Timestamp::from_unix(value.timestamp(), value.timestamp_subsec_nanos())?
            .with_offset_minutes(offset_minutes)
    }
}

impl From<Timestamp> for DateTime<Utc> {
    fn from(value: Timestamp) -> Self {
        DateTime::from_timestamp(value.unix_seconds(), value.subsec_nanos())
            .expect("every Timestamp is within chrono's supported range")
    }
}

impl From<Timestamp> for DateTime<FixedOffset> {
    fn from(value: Timestamp) -> Self {
        let offset = FixedOffset::east_opt(value.offset_minutes() as i32 * 60)
            .expect("Timestamp offsets are always less than 24 hours");
        DateTime::<Utc>::from(value).with_timezone(&offset)
    }
}

macro_rules! impl_chrono {
    ($($ty:ty),*) => {
        $(
            impl Type for $ty {
                fn generic_name() -> Cow<'static, str> {
                    Timestamp::generic_name()
                }

                fn type_def(ctx: &mut SchemaContext) -> TypeDef {
                    Timestamp::type_def(ctx)
                }
            }

            impl Encode for $ty {
                fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
                    let timestamp = Timestamp::try_from(*self).map_err(EncodeError::custom)?;
                    e.encode_timestamp(&timestamp)
                }
            }

            impl Decode for $ty {
                fn decode<D: Decoder + ?Sized>(d: &mut D) -> Result<Self, DecodeError> {
                    d.decode_timestamp().map(Self::from)
                }
            }
        )*
    };
}

impl_chrono!(DateTime<Utc>, DateTime<FixedOffset>);

#[cfg(test)]
mod tests {
    use super::*;
    use crate::json;

    #[test]
    fn chrono_round_trip() {
        let input = r#""2001-01-01T08:00:00.123-08:00""#;
        let utc: DateTime<Utc> = json::from_str(input).unwrap();
        assert_eq!(utc.timestamp_millis(), 978_364_800_123);
        assert_eq!(
            json::to_string(&utc).unwrap(),
            r#""2001-01-01T16:00:00.123Z""#
        );

        let fixed: DateTime<FixedOffset> = json::from_str(input).unwrap();
        assert_eq!(fixed.offset().local_minus_utc(), -8 * 3600);
        assert_eq!(json::to_string(&fixed).unwrap(), input);
        assert_eq!(
            crate::type_def_of::<DateTime<Utc>>().to_json(),
            r#"{"type":"timestamp"}"#
        );
    }
}
