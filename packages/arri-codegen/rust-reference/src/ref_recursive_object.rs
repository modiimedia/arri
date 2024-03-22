#![allow(dead_code, unused_assignments)]

use arri_client::{serde_json, ArriModel};
use std::str::FromStr;

// IGNORE BEFORE //

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
        let mut _json_output_ = "{".to_string();
        _json_output_.push_str("\"left\":");
        match &self.left {
            Some(left_val) => {
                _json_output_.push_str(left_val.to_json_string().as_str());
            }
            _ => _json_output_.push_str("null"),
        }
        _json_output_.push_str(",\"right\":");
        match &self.right {
            Some(right_val) => {
                _json_output_.push_str(right_val.to_json_string().as_str());
            }
            _ => _json_output_.push_str("null"),
        }
        _json_output_.push("}");
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut query_parts: Vec<String> = Vec::new();
        match &self.left {
            Some(left_val) => {
                query_parts.push(format!("left={}", left_val.to_query_params_string()));
            }
            _ => {
                query_parts.push("left=null".to_string());
            }
        }
        match &self.right {
            Some(right_val) => {
                query_parts.push(format!("right={}", right_val.to_query_params_string()));
            }
            _ => {
                query_parts.push("right=null".to_string());
            }
        }
    }
}
