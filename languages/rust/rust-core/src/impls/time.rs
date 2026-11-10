use std::borrow::Cow;

use time::{OffsetDateTime, UtcDateTime, UtcOffset};

use crate::{
    ArriSchema, Decode, DecodeError, Decoder, Encode, EncodeError, Encoder, SchemaContext,
    Timestamp, TimestampError, TypeDef,
};

fn from_unix_nanos(nanos: i128) -> Result<Timestamp, TimestampError> {
    let secs = nanos.div_euclid(1_000_000_000);
    let subsec = nanos.rem_euclid(1_000_000_000) as u32;
    let secs = i64::try_from(secs).unwrap_or(i64::MAX);
    Timestamp::from_unix(secs, subsec)
}

impl TryFrom<OffsetDateTime> for Timestamp {
    type Error = TimestampError;

    fn try_from(value: OffsetDateTime) -> Result<Self, Self::Error> {
        // RFC 3339 offsets only have minute precision
        let offset_minutes = (value.offset().whole_seconds() / 60) as i16;
        from_unix_nanos(value.unix_timestamp_nanos())?.with_offset_minutes(offset_minutes)
    }
}

impl TryFrom<UtcDateTime> for Timestamp {
    type Error = TimestampError;

    fn try_from(value: UtcDateTime) -> Result<Self, Self::Error> {
        from_unix_nanos(value.unix_timestamp_nanos())
    }
}

fn unix_nanos(value: &Timestamp) -> i128 {
    value.unix_seconds() as i128 * 1_000_000_000 + value.subsec_nanos() as i128
}

impl From<Timestamp> for OffsetDateTime {
    fn from(value: Timestamp) -> Self {
        let offset = UtcOffset::from_whole_seconds(value.offset_minutes() as i32 * 60)
            .expect("Timestamp offsets are always less than 24 hours");
        OffsetDateTime::from_unix_timestamp_nanos(unix_nanos(&value))
            .expect("every Timestamp is within time's supported range")
            .to_offset(offset)
    }
}

impl From<Timestamp> for UtcDateTime {
    fn from(value: Timestamp) -> Self {
        UtcDateTime::from_unix_timestamp_nanos(unix_nanos(&value))
            .expect("every Timestamp is within time's supported range")
    }
}

macro_rules! impl_time {
    ($($ty:ty),*) => {
        $(
            impl ArriSchema for $ty {
                fn type_name() -> Cow<'static, str> {
                    Timestamp::type_name()
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

impl_time!(OffsetDateTime, UtcDateTime);

#[cfg(test)]
mod tests {
    use super::*;
    use crate::json;

    #[test]
    fn time_round_trip() {
        let input = r#""2001-01-01T08:00:00.123-08:00""#;
        let utc: UtcDateTime = json::from_str(input).unwrap();
        assert_eq!(utc.unix_timestamp(), 978_364_800);
        assert_eq!(
            json::to_string(&utc).unwrap(),
            r#""2001-01-01T16:00:00.123Z""#
        );

        let offset: OffsetDateTime = json::from_str(input).unwrap();
        assert_eq!(offset.offset().whole_hours(), -8);
        assert_eq!(json::to_string(&offset).unwrap(), input);

        let before_epoch: OffsetDateTime = json::from_str(r#""1969-12-31T23:59:59.999Z""#).unwrap();
        assert_eq!(
            json::to_string(&before_epoch).unwrap(),
            r#""1969-12-31T23:59:59.999Z""#
        );
    }
}
