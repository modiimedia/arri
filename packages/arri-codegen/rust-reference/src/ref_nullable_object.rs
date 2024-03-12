#![allow(dead_code, unused_variables)]

use std::str::FromStr;

use arri_client::{
    chrono::{DateTime, FixedOffset},
    serde_json::{self},
    ArriModel,
};

// IGNORE BEFORE //

#[derive(Debug, PartialEq, Clone)]
pub struct NullableObject {
    pub any: Option<serde_json::Value>,
    pub string: Option<String>,
    pub boolean: Option<bool>,
    pub float32: Option<f32>,
    pub float64: Option<f64>,
    pub int8: Option<i8>,
    pub uint8: Option<u8>,
    pub int16: Option<i16>,
    pub uint16: Option<u16>,
    pub int32: Option<i32>,
    pub uint32: Option<u32>,
    pub int64: Option<i64>,
    pub uint64: Option<u64>,
    pub timestamp: Option<DateTime<FixedOffset>>,
    pub r#enum: Option<NullableObjectEnum>,
    pub string_array: Option<Vec<String>>,
}

impl ArriModel for NullableObject {
    fn new() -> Self {
        Self {
            any: None,
            string: None,
            boolean: None,
            float32: None,
            float64: None,
            int8: None,
            uint8: None,
            int16: None,
            uint16: None,
            int32: None,
            uint32: None,
            int64: None,
            uint64: None,
            timestamp: None,
            r#enum: None,
            string_array: None,
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let any = match val.get("any") {
                    Some(any_val) => Some(any_val.to_owned()),
                    _ => None,
                };
                let string = match val.get("string") {
                    Some(serde_json::Value::String(string_val)) => Some(string_val.to_owned()),
                    _ => None,
                };
                let boolean = match val.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => Some(boolean_val.to_owned()),
                    _ => None,
                };
                let float32 = match val.get("float32") {
                    Some(serde_json::Value::Number(float32_val)) => {
                        Some(float32_val.as_f64().unwrap_or(0.0) as f32)
                    }
                    _ => None,
                };
                let float64 = match val.get("float64") {
                    Some(serde_json::Value::Number(float64_val)) => {
                        Some(float64_val.as_f64().unwrap_or(0.0))
                    }
                    _ => None,
                };
                let int8 = match val.get("int8") {
                    Some(serde_json::Value::Number(int8_val)) => {
                        Some(i8::try_from(int8_val.as_i64().unwrap_or(0)).unwrap_or(0))
                    }
                    _ => None,
                };
                let uint8 = match val.get("uint8") {
                    Some(serde_json::Value::Number(uint8_val)) => {
                        Some(u8::try_from(uint8_val.as_i64().unwrap_or(0)).unwrap_or(0))
                    }
                    _ => None,
                };
                let int16 = match val.get("int16") {
                    Some(serde_json::Value::Number(int16_val)) => {
                        Some(i16::try_from(int16_val.as_i64().unwrap_or(0)).unwrap_or(0))
                    }
                    _ => None,
                };
                let uint16 = match val.get("uint16") {
                    Some(serde_json::Value::Number(uint16_val)) => {
                        Some(u16::try_from(uint16_val.as_i64().unwrap_or(0)).unwrap_or(0))
                    }
                    _ => None,
                };
                let int32 = match val.get("int32") {
                    Some(serde_json::Value::Number(int32_val)) => {
                        Some(i32::try_from(int32_val.as_i64().unwrap_or(0)).unwrap_or(0))
                    }
                    _ => None,
                };
                let uint32 = match val.get("uint32") {
                    Some(serde_json::Value::Number(uint32_val)) => {
                        Some(u32::try_from(uint32_val.as_i64().unwrap_or(0)).unwrap_or(0))
                    }
                    _ => None,
                };
                let int64 = match val.get("int64") {
                    Some(serde_json::Value::String(int64_val)) => {
                        Some(int64_val.parse::<i64>().unwrap_or(0))
                    }
                    _ => None,
                };
                let uint64 = match val.get("uint64") {
                    Some(serde_json::Value::String(uint64_val)) => {
                        Some(uint64_val.parse::<u64>().unwrap_or(0))
                    }
                    _ => None,
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => Some(
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default()),
                    ),
                    _ => None,
                };
                let r#enum = match val.get("enum") {
                    Some(r#enum_val) => Some(NullableObjectEnum::from_json(r#enum_val.to_owned())),
                    _ => None,
                };
                let string_array = match val.get("stringArray") {
                    Some(serde_json::Value::Array(string_array_val)) => {
                        let mut string_array_val_result: Vec<String> = Vec::new();
                        for string_array_val_item in string_array_val {
                            string_array_val_result.push(match Some(string_array_val_item) {
                                Some(serde_json::Value::String(string_array_val_item_val)) => {
                                    string_array_val_item_val.to_owned()
                                }
                                _ => "".to_string(),
                            });
                        }
                        Some(string_array_val_result)
                    }
                    _ => None,
                };

                Self {
                    any,
                    string,
                    boolean,
                    float32,
                    float64,
                    int8,
                    uint8,
                    int16,
                    uint16,
                    int32,
                    uint32,
                    int64,
                    uint64,
                    timestamp,
                    r#enum,
                    string_array,
                }
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
        let mut output = "{".to_string();
        let key_count = 16;
        output.push_str("\"any\":");
        match &self.any {
            Some(any_val) => output.push_str(
                serde_json::to_string(any_val)
                    .unwrap_or("null".to_string())
                    .as_str(),
            ),
            _ => output.push_str("null"),
        };
        output.push_str(",\"string\":");
        match &self.string {
            Some(string_val) => output.push_str(
                format!(
                    "\"{}\"",
                    string_val.replace("\n", "\\n").replace("\"", "\\\"")
                )
                .as_str(),
            ),

            _ => output.push_str("null"),
        };
        output.push_str(",\"boolean\":");
        match &self.boolean {
            Some(boolean_val) => output.push_str(boolean_val.to_string().as_str()),
            _ => output.push_str("null"),
        };
        output.push_str(",\"float32\":");
        match &self.float32 {
            Some(float32_val) => output.push_str(float32_val.to_string().as_str()),
            _ => output.push_str("null"),
        };
        output.push_str(",\"float64\":");
        match &self.float64 {
            Some(float64_val) => output.push_str(float64_val.to_string().as_str()),
            _ => output.push_str("null"),
        };
        output.push_str(",\"int8\":");
        match &self.int8 {
            Some(int8_val) => output.push_str(int8_val.to_string().as_str()),
            _ => output.push_str("null"),
        };
        output.push_str(",\"uint8\":");
        match &self.uint8 {
            Some(uint8_val) => output.push_str(uint8_val.to_string().as_str()),
            _ => output.push_str("null"),
        };
        output.push_str(",\"int16\":");
        match &self.int16 {
            Some(int16_val) => output.push_str(int16_val.to_string().as_str()),
            _ => output.push_str("null"),
        };
        output.push_str(",\"uint16\":");
        match &self.uint16 {
            Some(uint16_val) => output.push_str(uint16_val.to_string().as_str()),
            _ => output.push_str("null"),
        };
        output.push_str(",\"int32\":");
        match &self.int32 {
            Some(int32_val) => output.push_str(int32_val.to_string().as_str()),
            _ => output.push_str("null"),
        };
        output.push_str(",\"uint32\":");
        match &self.uint32 {
            Some(uint32_val) => output.push_str(uint32_val.to_string().as_str()),
            _ => output.push_str("null"),
        };
        output.push_str(",\"int64\":");
        match &self.int64 {
            Some(int64_val) => output.push_str(format!("\"{}\"", int64_val.to_string()).as_str()),
            _ => output.push_str("null"),
        };
        output.push_str(",\"uint64\":");
        match &self.uint64 {
            Some(uint64_val) => output.push_str(format!("\"{}\"", uint64_val.to_string()).as_str()),
            _ => output.push_str("null"),
        };
        output.push_str(",\"timestamp\":");
        match &self.timestamp {
            Some(timestamp_val) => {
                output.push_str(format!("\"{}\"", timestamp_val.to_rfc3339()).as_str())
            }
            _ => output.push_str("null"),
        };
        output.push_str(",\"enum\":");
        match &self.r#enum {
            Some(r#enum_val) => output.push_str(r#enum_val.to_json_string().as_str()),
            _ => output.push_str("null"),
        };
        output.push_str(",\"stringArray\":");
        match &self.string_array {
            Some(string_array_val) => {
                output.push('[');
                let mut string_array_val_index = 0;
                for string_array_val_item in string_array_val {
                    if string_array_val_index != 0 {
                        output.push(',');
                    }
                    output.push_str(
                        format!(
                            "\"{}\"",
                            string_array_val_item
                                .replace("\n", "\\n")
                                .replace("\"", "\\\"")
                        )
                        .as_str(),
                    );
                    string_array_val_index += 1;
                }
                output.push(']');
            }
            _ => output.push_str("null"),
        };
        output.push('}');
        output
    }

    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        match &self.any {
            Some(any_val) => parts.push(format!(
                "any={}",
                serde_json::to_string(any_val).unwrap_or("null".to_string())
            )),
            _ => parts.push("any=null".to_string()),
        };
        match &self.string {
            Some(string_val) => parts.push(format!("string={}", string_val)),
            _ => parts.push("string=null".to_string()),
        };
        match &self.boolean {
            Some(boolean_val) => parts.push(format!("boolean={}", boolean_val)),
            _ => parts.push("boolean=null".to_string()),
        };
        match &self.float32 {
            Some(float32_val) => parts.push(format!("float32={}", float32_val)),
            _ => parts.push("float32=null".to_string()),
        };
        match &self.float64 {
            Some(float64_val) => parts.push(format!("float64={}", float64_val)),
            _ => parts.push("float64=null".to_string()),
        };
        match &self.int8 {
            Some(int8_val) => parts.push(format!("int8={}", int8_val)),
            _ => parts.push("int8=null".to_string()),
        };
        match &self.uint8 {
            Some(uint8_val) => parts.push(format!("uint8={}", uint8_val)),
            _ => parts.push("uint8=null".to_string()),
        };
        match &self.int16 {
            Some(int16_val) => parts.push(format!("int16={}", int16_val)),
            _ => parts.push("int16=null".to_string()),
        };
        match &self.uint16 {
            Some(uint16_val) => parts.push(format!("uint16={}", uint16_val)),
            _ => parts.push("uint16=null".to_string()),
        };
        match &self.int32 {
            Some(int32_val) => parts.push(format!("int32={}", int32_val)),
            _ => parts.push("int32=null".to_string()),
        };
        match &self.uint32 {
            Some(uint32_val) => parts.push(format!("uint32={}", uint32_val)),
            _ => parts.push("uint32=null".to_string()),
        };
        match &self.int64 {
            Some(int64_val) => parts.push(format!("int64={}", int64_val)),
            _ => parts.push("int64=null".to_string()),
        };
        match &self.uint64 {
            Some(uint64_val) => parts.push(format!("uint64={}", uint64_val)),
            _ => parts.push("uint64=null".to_string()),
        };
        match &self.timestamp {
            Some(timestamp_val) => parts.push(format!("timestamp={}", timestamp_val.to_rfc3339())),
            _ => parts.push("timestamp=null".to_string()),
        };
        match &self.r#enum {
            Some(r#enum_val) => parts.push(format!("enum={}", r#enum_val.to_query_params_string())),
            _ => parts.push("enum=null".to_string()),
        };
        match &self.string_array {
            Some(string_array_val) => {
                let mut string_array_val_output = "stringArray=[".to_string();
                let mut string_array_val_index = 0;
                for string_array_val_item in string_array_val {
                    if string_array_val_index != 0 {
                        string_array_val_output.push(',');
                    }
                    string_array_val_output.push_str(
                        format!(
                            "\"{}\"",
                            string_array_val_item
                                .replace("\n", "\\n")
                                .replace("\"", "\\\"")
                        )
                        .as_str(),
                    );
                    string_array_val_index += 1;
                }
                parts.push(format!("stringArray={}", string_array_val_output));
            }
            _ => parts.push("stringArray=null".to_string()),
        };
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub enum NullableObjectEnum {
    A,
    B,
}

impl ArriModel for NullableObjectEnum {
    fn new() -> Self {
        Self::A
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::String(input_val) => match input_val.as_str() {
                "A" => Self::A,
                "B" => Self::B,
                _ => Self::A,
            },
            _ => Self::A,
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
            Self::A => format!("\"{}\"", "A"),
            Self::B => format!("\"{}\"", "B"),
        }
    }

    fn to_query_params_string(&self) -> String {
        match &self {
            Self::A => "A".to_string(),
            Self::B => "B".to_string(),
        }
    }
}
