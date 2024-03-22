#![allow(dead_code, unused_assignments)]
use arri_client::{serde_json, ArriModel};

// IGNORE BEFORE //

#[derive(Debug, PartialEq, Clone)]
pub struct BinaryTree {
    pub left: Option<Box<BinaryTree>>,
    pub right: Option<Box<BinaryTree>>,
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
        match serde_json::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }

    fn to_json_string(&self) -> String {
        let mut _json_output_ = "{".to_string();
        let _key_count_ = 2;
        _json_output_.push_str("\"left\":");
        match &self.left {
            Some(left_val) => _json_output_.push_str(left_val.to_json_string().as_str()),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"right\":");
        match &self.right {
            Some(right_val) => _json_output_.push_str(right_val.to_json_string().as_str()),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self.left {
            Some(left_val) => {
                _query_parts_.push(format!("left={}", left_val.to_query_params_string()))
            }

            _ => _query_parts_.push("left=null".to_string()),
        };
        match &self.right {
            Some(right_val) => {
                _query_parts_.push(format!("right={}", right_val.to_query_params_string()))
            }
            _ => _query_parts_.push("right=null".to_string()),
        };
        _query_parts_.join("&")
    }
}
