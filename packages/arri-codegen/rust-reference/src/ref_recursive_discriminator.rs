#![allow(dead_code, unused_assignments)]
use arri_client::{serde_json, ArriModel};

// IGNORE BEFORE //

#[derive(Debug, PartialEq, Clone)]
enum RecursiveUnion {
    Text { data: String },
    Shape { data: RecursiveUnionShapeData },
    Child { data: Box<RecursiveUnion> },
    Children { data: Vec<Box<RecursiveUnion>> },
}

impl ArriModel for RecursiveUnion {
    fn new() -> Self {
        Self::Text {
            data: "".to_string(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => match val.get("type") {
                Some(serde_json::Value::String(type_val)) => match type_val.as_str() {
                    "TEXT" => {
                        let data = match val.get("data") {
                            Some(serde_json::Value::String(data_val)) => data_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::Text { data }
                    }
                    "SHAPE" => {
                        let data = match val.get("data") {
                            Some(data_val) => {
                                RecursiveUnionShapeData::from_json(data_val.to_owned())
                            }
                            _ => RecursiveUnionShapeData::new(),
                        };
                        Self::Shape { data }
                    }
                    "CHILD" => {
                        let data = match val.get("data") {
                            Some(data_val) => {
                                Box::new(RecursiveUnion::from_json(data_val.to_owned()))
                            }
                            _ => Box::new(RecursiveUnion::new()),
                        };
                        Self::Child { data }
                    }
                    "CHILDREN" => {
                        let data = match val.get("data") {
                            Some(serde_json::Value::Array(data_val)) => {
                                let mut data_val_result: Vec<Box<RecursiveUnion>> = Vec::new();
                                for data_val_item in data_val {
                                    data_val_result.push(Box::new(RecursiveUnion::from_json(
                                        data_val_item.to_owned(),
                                    )));
                                }
                                data_val_result
                            }
                            _ => Vec::new(),
                        };
                        Self::Children { data }
                    }
                    _ => Self::new(),
                },
                _ => Self::new(),
            },
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
        match &self {
            Self::Text { data } => {
                let mut _json_output_ = "{".to_string();
                let _key_count_ = 2;
                _json_output_.push_str("\"type\":\"TEXT\"");
                _json_output_.push_str(",\"data\":");
                _json_output_.push_str(format!("\"{}\"", data).as_str());
                _json_output_.push('}');
                _json_output_
            }
            Self::Shape { data } => {
                let mut _json_output_ = "{".to_string();
                let _key_count_ = 2;
                _json_output_.push_str("\"type\":\"SHAPE\"");
                _json_output_.push_str(",\"data\":");
                _json_output_.push_str(data.to_json_string().as_str());
                _json_output_.push('}');
                _json_output_
            }
            Self::Child { data } => {
                let mut _json_output_ = "{".to_string();
                let _key_count_ = 2;
                _json_output_.push_str("\"type\":\"CHILD\"");
                _json_output_.push_str(",\"data\":");
                _json_output_.push_str(data.to_json_string().as_str());
                _json_output_
            }
            Self::Children { data } => {
                let mut _json_output_ = "{".to_string();
                let _key_count_ = 2;
                _json_output_.push_str("\"type\":\"CHILDREN\"");
                _json_output_.push_str(",\"data\":");
                _json_output_.push('[');
                let mut data_index = 0;
                for data_item in data {
                    if data_index != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(data_item.to_json_string().as_str());
                    data_index += 1;
                }
                _json_output_.push(']');
                _json_output_
            }
        }
    }

    fn to_query_params_string(&self) -> String {
        match &self {
            RecursiveUnion::Text { data } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=TEXT".to_string());
                _query_parts_.push(format!("data={}", data));
                _query_parts_.join("&")
            }
            RecursiveUnion::Shape { data } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=SHAPE".to_string());
                _query_parts_.push(format!("data={}", data.to_query_params_string()));
                _query_parts_.join("&")
            }
            RecursiveUnion::Child { data } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=CHILD".to_string());
                _query_parts_.push(format!("data={}", data.to_query_params_string()));
                _query_parts_.join("&")
            }
            RecursiveUnion::Children { data } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=CHILDREN".to_string());
                let mut data_output = "children=[".to_string();
                let mut data_index = 0;
                for data_item in data {
                    if data_index != 0 {
                        data_output.push(',');
                    }
                    data_output.push_str(data_item.to_query_params_string().as_str());
                    data_index += 1;
                }
                _query_parts_.push(data_output);
                _query_parts_.join("&")
            }
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
struct RecursiveUnionShapeData {
    width: f64,
    height: f64,
    color: String,
}

impl ArriModel for RecursiveUnionShapeData {
    fn new() -> Self {
        Self {
            width: 0.0,
            height: 0.0,
            color: "".to_string(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let width = match val.get("width") {
                    Some(serde_json::Value::Number(width_val)) => {
                        width_val.as_f64().unwrap_or(0.0).to_owned()
                    }
                    _ => 0.0,
                };
                let height = match val.get("height") {
                    Some(serde_json::Value::Number(height_val)) => {
                        height_val.as_f64().unwrap_or(0.0).to_owned()
                    }
                    _ => 0.0,
                };
                let color = match val.get("color") {
                    Some(serde_json::Value::String(color_val)) => color_val.to_owned(),
                    _ => "".to_string(),
                };
                Self {
                    width,
                    height,
                    color,
                }
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
        let _key_count_ = 3;
        _json_output_.push_str("\"width\":");
        _json_output_.push_str(&self.width.to_string().as_str());
        _json_output_.push_str(",\"height\":");
        _json_output_.push_str(&self.height.to_string().as_str());
        _json_output_.push_str(",\"color\":");
        _json_output_.push_str(format!("\"{}\"", &self.color).as_str());
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("width={}", &self.width));
        _query_parts_.push(format!("height={}", &self.height));
        _query_parts_.push(format!("color={}", &self.color));
        _query_parts_.join("&")
    }
}
