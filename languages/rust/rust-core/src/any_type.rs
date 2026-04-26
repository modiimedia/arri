use std::collections::HashMap;

#[derive(Debug, Default, Clone, PartialEq)]
pub enum AnyType {
    Boolean(bool),
    Number(N),
    String(String),
    Object(Box<HashMap<String, AnyType>>),
    List(Box<Vec<AnyType>>),
    #[default]
    Null,
}

#[derive(Debug, Clone, PartialEq)]
pub enum N {
    Float(f64),
    Int(i32),
    Uint(u32),
    BigInt(i64),
    BigUint(u64),
}

#[cfg(feature = "serde")]
impl From<&serde_json::Value> for AnyType {
    fn from(value: &serde_json::Value) -> Self {
        match value {
            serde_json::Value::Null => Self::Null,
            serde_json::Value::Bool(val) => Self::Boolean(*val),
            serde_json::Value::Number(number) => {
                if number.is_u64() {
                    let num = number.as_u64().unwrap_or(0);
                    if num <= u32::MAX as u64 {
                        return Self::Number(N::Uint(num as u32));
                    }
                    return Self::Number(N::BigUint(num));
                }
                if number.is_i64() {
                    let num = number.as_i64().unwrap_or(0);
                    if num <= i32::MAX as i64 && num >= i32::MIN as i64 {
                        return Self::Number(N::Int(num as i32));
                    }
                    return Self::Number(N::BigInt(number.as_i64().unwrap()));
                }
                if number.is_f64() {
                    return Self::Number(N::Float(number.as_f64().unwrap()));
                }
                return Self::Number(N::Float(0.0));
            }
            serde_json::Value::String(str) => Self::String(str.to_owned()),
            serde_json::Value::Array(values) => Self::List(Box::new(
                values.iter().map(|v| Self::from(v)).collect::<Vec<Self>>(),
            )),
            serde_json::Value::Object(map) => {
                let mut hm = HashMap::<String, Self>::with_capacity(map.len());
                for (key, value) in map {
                    hm.insert(key.to_owned(), Self::from(value));
                }
                Self::Object(Box::new(hm))
            }
        }
    }
}

#[cfg(feature = "serde")]
impl From<serde_json::Value> for AnyType {
    fn from(value: serde_json::Value) -> Self {
        match value {
            serde_json::Value::Null => Self::Null,
            serde_json::Value::Bool(val) => Self::Boolean(val),
            serde_json::Value::Number(number) => {
                if number.is_u64() {
                    let num = number.as_u64().unwrap_or(0);
                    if num <= u32::MAX as u64 {
                        return Self::Number(N::Uint(num as u32));
                    }
                    return Self::Number(N::BigUint(num));
                }
                if number.is_i64() {
                    let num = number.as_i64().unwrap_or(0);
                    if num <= i32::MAX as i64 && num >= i32::MIN as i64 {
                        return Self::Number(N::Int(num as i32));
                    }
                    return Self::Number(N::BigInt(number.as_i64().unwrap()));
                }
                if number.is_f64() {
                    return Self::Number(N::Float(number.as_f64().unwrap()));
                }
                return Self::Number(N::Float(0.0));
            }
            serde_json::Value::String(str) => Self::String(str),
            serde_json::Value::Array(values) => {
                let mut elements = Vec::<Self>::with_capacity(values.len());
                for val in values {
                    elements.push(Self::from(val));
                }
                Self::List(Box::new(elements))
            }
            serde_json::Value::Object(map) => {
                let mut hm = HashMap::<String, Self>::with_capacity(map.len());
                for (key, value) in map {
                    hm.insert(key.to_owned(), Self::from(value));
                }
                Self::Object(Box::new(hm))
            }
        }
    }
}

#[cfg(test)]
mod test {
    use std::collections::HashMap;

    use crate::any_type::{AnyType, N};

    #[test]
    fn test_convert_serde_json_value() {
        let test_cases = [(
            serde_json::json!({
                "string": "hello world",
                "boolean": true,
                "float64": 4.6,
                "int32": -15,
                "uint32": 15,
                "null": null,
                "list": [true, false, false],
                "object": {
                    "foo": "foo"
                }

            }),
            AnyType::Object(Box::new(HashMap::from([
                (
                    String::from("string"),
                    AnyType::String(String::from("hello world")),
                ),
                (String::from("boolean"), AnyType::Boolean(true)),
                (String::from("float64"), AnyType::Number(N::Float(4.6))),
                (String::from("int32"), AnyType::Number(N::Int(-15))),
                (String::from("uint32"), AnyType::Number(N::Uint(15))),
                (String::from("null"), AnyType::Null),
                (
                    String::from("list"),
                    AnyType::List(Box::new(vec![
                        AnyType::Boolean(true),
                        AnyType::Boolean(false),
                        AnyType::Boolean(false),
                    ])),
                ),
                (
                    String::from("object"),
                    AnyType::Object(Box::new(HashMap::<String, AnyType>::from([(
                        String::from("foo"),
                        AnyType::String(String::from("foo")),
                    )]))),
                ),
            ]))),
        )];
        for (input, expected_output) in test_cases {
            let output_from_borrowed = AnyType::from(&input);
            let output_from_owned = AnyType::from(input);
            assert_eq!(&output_from_owned, &output_from_borrowed);
            assert_eq!(&output_from_owned, &expected_output);
        }
    }
}
