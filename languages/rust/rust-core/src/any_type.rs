use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq)]
pub enum AnyType {
    Boolean(bool),
    Number(f64),
    String(String),
    Object(Box<HashMap<String, AnyType>>),
    List(Box<Vec<AnyType>>),
}
