use std::str::FromStr;

use arri_client::{
    chrono::{DateTime, FixedOffset},
    serde_json::{self},
    ArriModel,
};

// IGNORE BEFORE //

pub struct CompleteObject {
    pub any: serde_json::Value,
    pub string: String,
    pub boolean: bool,
    pub float32: f32,
    pub float64: f64,
    pub int8: i8,
    pub uint8: u8,
    pub int16: i16,
    pub uint16: u16,
    pub int32: i32,
    pub uint32: u32,
    pub int64: i64,
    pub uint64: u64,
    pub timestamp: DateTime<FixedOffset>,
    pub r#enum: CompleteObjectEnum,
    pub string_array: Vec<String>,
}

impl ArriModel for CompleteObject {
    fn new() -> Self {
        Self {
            any: serde_json::Value::Null,
            string: "".to_string(),
            boolean: false,
            float32: 0.0,
            float64: 0.0,
            int8: 0,
            uint8: 0,
            int16: 0,
            uint16: 0,
            int32: 0,
            uint32: 0,
            int64: 0,
            uint64: 0,
            timestamp: DateTime::default(),
            r#enum: CompleteObjectEnum::A,
            string_array: Vec::new(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let any = match val.get("any") {
                    Some(any_val) => any_val.to_owned(),
                    _ => serde_json::Value::Null,
                };
                let string = match val.get("string") {
                    Some(serde_json::Value::String(string_val)) => string_val.to_owned(),
                    _ => "".to_string(),
                };
                let boolean = match val.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => boolean_val.to_owned(),
                    _ => false,
                };
                let float32 = match val.get("float32") {
                    Some(serde_json::Value::Number(float32_val)) => {
                        float32_val.as_f64().unwrap_or(0.0) as f32
                    }
                    _ => 0.0,
                };
                let float64 = match val.get("float64") {
                    Some(serde_json::Value::Number(float64_val)) => {
                        float64_val.as_f64().unwrap_or(0.0)
                    }
                    _ => 0.0,
                };
                let int8 = match val.get("int8") {
                    Some(serde_json::Value::Number(int8_val)) => {
                        i8::try_from(int8_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let uint8 = match val.get("uint8") {
                    Some(serde_json::Value::Number(uint8_val)) => {
                        u8::try_from(uint8_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let int16 = match val.get("int16") {
                    Some(serde_json::Value::Number(int16_val)) => {
                        i16::try_from(int16_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let uint16 = match val.get("uint16") {
                    Some(serde_json::Value::Number(uint16_val)) => {
                        u16::try_from(uint16_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let int32 = match val.get("int32") {
                    Some(serde_json::Value::Number(int32_val)) => {
                        i32::try_from(int32_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let uint32 = match val.get("uint32") {
                    Some(serde_json::Value::Number(uint32_val)) => {
                        u32::try_from(uint32_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let int64 = match val.get("int64") {
                    Some(serde_json::Value::String(int64_val)) => {
                        int64_val.parse::<i64>().unwrap_or(0)
                    }
                    _ => 0,
                };
                let uint64 = match val.get("uint64") {
                    Some(serde_json::Value::String(uint64_val)) => {
                        uint64_val.parse::<u64>().unwrap_or(0)
                    }
                    _ => 0,
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                let r#enum = match val.get("enum") {
                    Some(serde_json::Value::String(r#enum_val)) => match r#enum_val.as_str() {
                        "A" => CompleteObjectEnum::A,
                        "B" => CompleteObjectEnum::B,
                        _ => CompleteObjectEnum::A,
                    },
                    _ => CompleteObjectEnum::A,
                };
                let string_array = match val.get("stringArray") {
                    Some(serde_json::Value::Array(string_array_val)) => {
                        let mut string_array_val_result: Vec<String> = Vec::new();
                        for string_array_val_item in string_array_val {
                            match string_array_val_item {
                                serde_json::Value::String(string_array_val_item_val) => {
                                    string_array_val_result
                                        .push(string_array_val_item_val.to_owned())
                                }
                                _ => {}
                            }
                        }
                        string_array_val_result
                    }
                    _ => Vec::new(),
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
        output.push_str("\"any\":");
        output.push_str(
            serde_json::to_string(&self.any)
                .unwrap_or("\"\"".to_string())
                .as_str(),
        );
        output.push_str(",\"string\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.string.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push_str(",\"boolean\":");
        output.push_str(format!("{}", &self.boolean.to_string()).as_str());
        output.push_str(",\"float32\":");
        output.push_str(format!("{}", &self.float32.to_string()).as_str());
        output.push_str(",\"float64\":");
        output.push_str(format!("{}", &self.float64.to_string()).as_str());
        output.push_str(",\"int8\":");
        output.push_str(format!("{}", &self.int8.to_string()).as_str());
        output.push_str(",\"uint8\":");
        output.push_str(format!("{}", &self.uint8.to_string()).as_str());
        output.push_str(",\"int16\":");
        output.push_str(format!("{}", &self.int16.to_string()).as_str());
        output.push_str(",\"uint16\":");
        output.push_str(format!("{}", &self.uint16.to_string()).as_str());
        output.push_str(",\"int32\":");
        output.push_str(format!("{}", &self.int32.to_string()).as_str());
        output.push_str(",\"uint32\":");
        output.push_str(format!("{}", &self.uint32.to_string()).as_str());
        output.push_str(",\"int64\":");
        output.push_str(format!("\"{}\"", &self.int64.to_string()).as_str());
        output.push_str(",\"uint64\":");
        output.push_str(format!("\"{}\"", &self.uint64.to_string()).as_str());
        output.push_str(",\"timestamp\":");
        output.push_str(format!("\"{}\"", &self.timestamp.to_rfc3339()).as_str());
        output.push_str(",\"enum\":");
        output.push_str(format!("\"{}\"", &self.r#enum.to_json_string()).as_str());
        output.push_str(",\"stringArray\":");
        output.push('[');
        for (i, string_array_el) in self.string_array.iter().enumerate() {
            if i != 0 {
                output.push(',');
            }
            output.push_str(format!("\"{}\"", string_array_el).as_str());
        }
        output.push(']');
        output.push('}');
        output
    }

    fn to_query_params_string(&self) -> String {
        todo!()
    }
}

pub enum CompleteObjectEnum {
    A,
    B,
}

impl ArriModel for CompleteObjectEnum {
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
            Self::A => "A".to_string(),
            Self::B => "B".to_string(),
        }
    }

    fn to_query_params_string(&self) -> String {
        match &self {
            Self::A => "A".to_string(),
            Self::B => "B".to_string(),
        }
    }
}
