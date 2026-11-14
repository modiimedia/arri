//! Optional [serde](https://serde.rs) support for arri's own types (`serde` feature).
//!
//! This lets arri's types be used inside of serde based types and formats. It does not make
//! `#[derive(Arri)]` types serde compatible (that's what `#[derive(Serialize, Deserialize)]` is for).

use std::fmt;

use ::serde::{
    Deserialize, Deserializer, Serialize, Serializer,
    de::{self, MapAccess, SeqAccess, Visitor},
    ser::{Error as _, SerializeMap, SerializeSeq},
};

use crate::{
    Metadata, Nullable, Number, Primitive, Timestamp, TypeDef, Value, decode::MAX_PREALLOCATE,
    to_value,
};

/// Serialized as an RFC 3339 string (the same representation arri uses for JSON)
impl Serialize for Timestamp {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(self.format().as_str())
    }
}

/// Deserialized from an RFC 3339 string. The UTC offset is preserved.
impl<'de> Deserialize<'de> for Timestamp {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        struct TimestampVisitor;

        impl Visitor<'_> for TimestampVisitor {
            type Value = Timestamp;

            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("an RFC 3339 timestamp string")
            }

            fn visit_str<E: de::Error>(self, value: &str) -> Result<Timestamp, E> {
                Timestamp::parse(value).map_err(E::custom)
            }
        }

        deserializer.deserialize_str(TimestampVisitor)
    }
}

/// Serialized the same way as `Option<T>` (`Null` is `None`)
impl<T: Serialize> Serialize for Nullable<T> {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Nullable::Present(value) => serializer.serialize_some(value),
            Nullable::Null => serializer.serialize_none(),
        }
    }
}

/// Deserialized the same way as `Option<T>` (`None` is `Null`).
///
/// Note: serde's derive treats any field that deserializes like an `Option` as allowed to be
/// missing, so a missing `Nullable<T>` field in a `#[derive(Deserialize)]` struct becomes `Null`
/// rather than an error. `#[derive(Arri)]` types still require `Nullable<T>` fields to be present.
impl<'de, T: Deserialize<'de>> Deserialize<'de> for Nullable<T> {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        Option::<T>::deserialize(deserializer).map(Nullable::from)
    }
}

impl Serialize for Number {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match *self {
            Number::Int(value) => serializer.serialize_i64(value),
            Number::Uint(value) => serializer.serialize_u64(value),
            Number::Float(value) => serializer.serialize_f64(value),
        }
    }
}

impl<'de> Deserialize<'de> for Number {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        struct NumberVisitor;

        impl Visitor<'_> for NumberVisitor {
            type Value = Number;

            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a number")
            }

            fn visit_i64<E: de::Error>(self, value: i64) -> Result<Number, E> {
                Ok(Number::Int(value))
            }

            fn visit_u64<E: de::Error>(self, value: u64) -> Result<Number, E> {
                Ok(Number::from(value))
            }

            fn visit_f64<E: de::Error>(self, value: f64) -> Result<Number, E> {
                Ok(Number::Float(value))
            }
        }

        deserializer.deserialize_any(NumberVisitor)
    }
}

impl Serialize for Value {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Value::Null => serializer.serialize_unit(),
            Value::Bool(value) => serializer.serialize_bool(*value),
            Value::Number(value) => value.serialize(serializer),
            Value::String(value) => serializer.serialize_str(value),
            Value::List(items) => {
                let mut seq = serializer.serialize_seq(Some(items.len()))?;
                for item in items {
                    seq.serialize_element(item)?;
                }
                seq.end()
            }
            Value::Object(entries) => {
                let mut map = serializer.serialize_map(Some(entries.len()))?;
                for (key, value) in entries {
                    map.serialize_entry(key, value)?;
                }
                map.end()
            }
        }
    }
}

/// Requires a self describing format (such as JSON) since any value is accepted
impl<'de> Deserialize<'de> for Value {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        struct ValueVisitor;

        impl<'de> Visitor<'de> for ValueVisitor {
            type Value = Value;

            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("any value")
            }

            fn visit_bool<E: de::Error>(self, value: bool) -> Result<Value, E> {
                Ok(Value::Bool(value))
            }

            fn visit_i64<E: de::Error>(self, value: i64) -> Result<Value, E> {
                Ok(Value::Number(Number::Int(value)))
            }

            fn visit_u64<E: de::Error>(self, value: u64) -> Result<Value, E> {
                Ok(Value::Number(Number::from(value)))
            }

            fn visit_f64<E: de::Error>(self, value: f64) -> Result<Value, E> {
                Ok(Value::Number(Number::Float(value)))
            }

            fn visit_str<E: de::Error>(self, value: &str) -> Result<Value, E> {
                Ok(Value::String(value.to_string()))
            }

            fn visit_string<E: de::Error>(self, value: String) -> Result<Value, E> {
                Ok(Value::String(value))
            }

            fn visit_unit<E: de::Error>(self) -> Result<Value, E> {
                Ok(Value::Null)
            }

            fn visit_none<E: de::Error>(self) -> Result<Value, E> {
                Ok(Value::Null)
            }

            fn visit_some<D: Deserializer<'de>>(self, deserializer: D) -> Result<Value, D::Error> {
                Value::deserialize(deserializer)
            }

            fn visit_seq<A: SeqAccess<'de>>(self, mut seq: A) -> Result<Value, A::Error> {
                let mut items =
                    Vec::with_capacity(seq.size_hint().unwrap_or(0).min(MAX_PREALLOCATE));
                while let Some(item) = seq.next_element()? {
                    items.push(item);
                }
                Ok(Value::List(items))
            }

            fn visit_map<A: MapAccess<'de>>(self, mut map: A) -> Result<Value, A::Error> {
                let mut entries =
                    Vec::with_capacity(map.size_hint().unwrap_or(0).min(MAX_PREALLOCATE));
                while let Some(entry) = map.next_entry::<String, Value>()? {
                    entries.push(entry);
                }
                Ok(Value::Object(entries))
            }
        }

        deserializer.deserialize_any(ValueVisitor)
    }
}

/// Serialized with the same shape as [`TypeDef::to_json`]
impl Serialize for TypeDef {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        // reuse the `Encode` implementation so the two representations can never drift apart
        to_value(self)
            .map_err(S::Error::custom)?
            .serialize(serializer)
    }
}

impl Serialize for Metadata {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        to_value(self)
            .map_err(S::Error::custom)?
            .serialize(serializer)
    }
}

/// Serialized as its schema name (e.g. `"float64"`)
impl Serialize for Primitive {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(self.as_str())
    }
}

impl<'de> Deserialize<'de> for Primitive {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        struct TypeVisitor;

        impl Visitor<'_> for TypeVisitor {
            type Value = Primitive;

            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("an arri scalar type name (e.g. \"float64\")")
            }

            fn visit_str<E: de::Error>(self, value: &str) -> Result<Primitive, E> {
                value.parse().map_err(E::custom)
            }
        }

        deserializer.deserialize_str(TypeVisitor)
    }
}

#[cfg(test)]
mod tests {
    use ::serde::{Deserialize, Serialize};

    use crate::{Nullable, Number, Primitive, Timestamp, Value};

    #[derive(Serialize, Deserialize, Debug, PartialEq)]
    struct Example {
        created_at: Timestamp,
        name: Nullable<String>,
        extra: Value,
    }

    #[test]
    fn timestamp() {
        let input = r#""2001-01-01T08:00:00.000-08:00""#;
        let ts: Timestamp = serde_json::from_str(input).unwrap();
        assert_eq!(ts.unix_seconds(), 978_364_800);
        // the offset is preserved
        assert_eq!(serde_json::to_string(&ts).unwrap(), input);
        let err = serde_json::from_str::<Timestamp>(r#""2001-13-01T00:00:00Z""#).unwrap_err();
        assert!(err.to_string().contains("month"), "{err}");
        assert!(serde_json::from_str::<Timestamp>("1000").is_err());
    }

    #[test]
    fn nullable() {
        assert_eq!(
            serde_json::to_string(&Nullable::<u8>::Null).unwrap(),
            "null"
        );
        assert_eq!(serde_json::to_string(&Nullable::Present(5u8)).unwrap(), "5");
        assert_eq!(
            serde_json::from_str::<Nullable<u8>>("null").unwrap(),
            Nullable::Null
        );
        assert_eq!(
            serde_json::from_str::<Nullable<u8>>("5").unwrap(),
            Nullable::Present(5)
        );
    }

    #[test]
    fn inside_of_serde_types() {
        let input = r#"{"created_at":"2001-01-01T16:00:00.000Z","name":null,"extra":{"b":[1,-2,1.5,true,null,"x"],"a":{}}}"#;
        let example: Example = serde_json::from_str(input).unwrap();
        assert_eq!(example.name, Nullable::Null);
        assert_eq!(
            example.extra.get("b").unwrap().as_list().unwrap()[1],
            Value::Number(Number::Int(-2))
        );
        // key order of the `Value` is preserved
        assert_eq!(serde_json::to_string(&example).unwrap(), input);

        // a missing Nullable field becomes Null with serde (see the note on the Deserialize impl)
        let example: Example =
            serde_json::from_str(r#"{"created_at":"2001-01-01T16:00:00.000Z","extra":null}"#)
                .unwrap();
        assert_eq!(example.name, Nullable::Null);
    }

    #[test]
    fn values_match_arri_json() {
        let input = r#"{"big":18446744073709551615,"neg":-9223372036854775808,"float":0.5,"list":[{"nested":null}]}"#;
        let from_serde: Value = serde_json::from_str(input).unwrap();
        let from_arri: Value = crate::json::from_str(input).unwrap();
        assert_eq!(from_serde, from_arri);
        assert_eq!(serde_json::to_string(&from_serde).unwrap(), input);
        assert_eq!(
            serde_json::from_str::<Number>("18446744073709551615").unwrap(),
            Number::Uint(u64::MAX)
        );
    }

    #[test]
    fn scalar_types() {
        assert_eq!(
            serde_json::to_string(&Primitive::Float64).unwrap(),
            r#""float64""#
        );
        assert_eq!(
            serde_json::from_str::<Primitive>(r#""uint8""#).unwrap(),
            Primitive::Uint8
        );
        assert!(serde_json::from_str::<Primitive>(r#""uint7""#).is_err());
    }

    #[cfg(feature = "derive")]
    #[test]
    fn type_defs_match_to_json() {
        /// Documented
        #[derive(crate::Arri)]
        #[allow(dead_code)]
        struct Node {
            id: String,
            #[deprecated = "use id"]
            key: Option<u64>,
            children: Vec<Node>,
            parent: Nullable<Box<Node>>,
            kind: Kind,
        }

        #[derive(crate::Arri)]
        #[arri(tag_key = "type")]
        #[allow(dead_code)]
        enum Kind {
            A { value: f32 },
            B,
        }

        let def = crate::type_def_of::<Node>();
        assert_eq!(serde_json::to_string(&def).unwrap(), def.to_json());
        assert_eq!(
            serde_json::to_string(&def.metadata).unwrap(),
            r#"{"id":"Node","description":"Documented"}"#
        );
    }
}
