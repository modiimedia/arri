use std::collections::HashMap;

#[derive(Debug, Default, Clone, PartialEq)]
pub enum AnyType {
    Boolean(bool),
    Number(NumberType),
    String(String),
    Object(Box<HashMap<String, AnyType>>),
    List(Box<Vec<AnyType>>),
    #[default]
    Null,
}

#[derive(Debug, Clone, PartialEq)]
pub enum NumberType {
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
                    return Self::Number(NumberType::BigUint(number.as_u64().unwrap()));
                }
                if number.is_i64() {
                    return Self::Number(NumberType::BigInt(number.as_i64().unwrap()));
                }
                if number.is_f64() {
                    return Self::Number(NumberType::Float(number.as_f64().unwrap()));
                }
                return Self::Number(NumberType::Float(0.0));
            }
            serde_json::Value::String(_) => todo!(),
            serde_json::Value::Array(values) => todo!(),
            serde_json::Value::Object(map) => todo!(),
        }
    }
}
