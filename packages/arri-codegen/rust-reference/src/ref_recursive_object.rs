use arri_client::{serde_json, ArriModel};
use std::str::FromStr;

#[derive(Debug, PartialEq, Clone)]
pub struct BinaryTree {
    left: Option<Box<BinaryTree>>,
    right: Option<Box<BinaryTree>>,
}

impl ArriModel for BinaryTree {
    fn new() -> Self {
        Self {
            left: None,
            right: None,
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let left = match val.get("left") {
                    Some(left_val) => Some(Box::new(BinaryTree::from_json(left_val.to_owned()))),
                    _ => None,
                };
                let right = match val.get("right") {
                    Some(right_val) => Some(Box::new(BinaryTree::from_json(right_val.to_owned()))),
                    _ => None,
                };
                Self { left, right }
            }
            _ => Self::new(),
        }
    }

    fn from_json_string(input: String) -> Self {
        match serde_json::Value::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }

    fn to_json_string(&self) -> String {
        todo!()
    }

    fn to_query_params_string(&self) -> String {
        todo!()
    }
}
