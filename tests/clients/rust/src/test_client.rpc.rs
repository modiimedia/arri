#![allow(dead_code)]
use arri_client::{
    async_trait::async_trait,
    chrono::{DateTime, FixedOffset},
    parsed_arri_request,
    reqwest::Method,
    serde_json::{self},
    ArriClientConfig, ArriModel, ArriParsedRequestOptions, ArriRequestError, ArriService,
    EmptyArriModel,
};
use std::{collections::HashMap, str::FromStr};

#[derive(Debug, PartialEq, Clone)]
pub struct ManuallyAddedModel {
    pub hello: String,
}

impl ArriModel for ManuallyAddedModel {
    fn new() -> Self {
        Self {
            hello: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let hello = match val.get("hello") {
                    Some(serde_json::Value::String(hello_val)) => hello_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { hello }
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
        let _key_count_ = 1;
        _json_output_.push_str("\"hello\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.hello.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("hello={}", &self.hello));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct AdaptersTypeboxAdapterParams {
    pub string: String,
    pub boolean: bool,
    pub integer: i32,
    pub number: f64,
    pub enum_field: AdaptersTypeboxAdapterParamsEnumField,
    pub object: AdaptersTypeboxAdapterParamsObject,
    pub array: Vec<bool>,
    pub optional_string: Option<String>,
}

impl ArriModel for AdaptersTypeboxAdapterParams {
    fn new() -> Self {
        Self {
            string: "".to_string(),
            boolean: false,
            integer: 0,
            number: 0.0,
            enum_field: AdaptersTypeboxAdapterParamsEnumField::A,
            object: AdaptersTypeboxAdapterParamsObject::new(),
            array: Vec::new(),
            optional_string: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let string = match val.get("string") {
                    Some(serde_json::Value::String(string_val)) => string_val.to_owned(),
                    _ => "".to_string(),
                };
                let boolean = match val.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => boolean_val.to_owned(),
                    _ => false,
                };
                let integer = match val.get("integer") {
                    Some(serde_json::Value::Number(integer_val)) => {
                        i32::try_from(integer_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let number = match val.get("number") {
                    Some(serde_json::Value::Number(number_val)) => {
                        number_val.as_f64().unwrap_or(0.0)
                    }
                    _ => 0.0,
                };
                let enum_field = match val.get("enumField") {
                    Some(enum_field_val) => {
                        AdaptersTypeboxAdapterParamsEnumField::from_json(enum_field_val.to_owned())
                    }
                    _ => AdaptersTypeboxAdapterParamsEnumField::A,
                };
                let object = match val.get("object") {
                    Some(object_val) => {
                        AdaptersTypeboxAdapterParamsObject::from_json(object_val.to_owned())
                    }
                    _ => AdaptersTypeboxAdapterParamsObject::new(),
                };
                let array = match val.get("array") {
                    Some(serde_json::Value::Array(array_val)) => {
                        let mut array_val_result: Vec<bool> = Vec::new();
                        for array_val_item in array_val {
                            array_val_result.push(match Some(array_val_item) {
                                Some(serde_json::Value::Bool(array_val_item_val)) => {
                                    array_val_item_val.to_owned()
                                }
                                _ => false,
                            })
                        }
                        array_val_result
                    }
                    _ => Vec::new(),
                };
                let optional_string = match val.get("optionalString") {
                    Some(serde_json::Value::String(optional_string_val)) => {
                        Some(optional_string_val.to_owned())
                    }
                    _ => None,
                };
                Self {
                    string,
                    boolean,
                    integer,
                    number,
                    enum_field,
                    object,
                    array,
                    optional_string,
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
        let _key_count_ = 7;
        _json_output_.push_str("\"string\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.string.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"boolean\":");
        _json_output_.push_str(&self.boolean.to_string().as_str());
        _json_output_.push_str(",\"integer\":");
        _json_output_.push_str(&self.integer.to_string().as_str());
        _json_output_.push_str(",\"number\":");
        _json_output_.push_str(&self.number.to_string().as_str());
        _json_output_.push_str(",\"enumField\":");
        _json_output_.push_str(&self.enum_field.to_json_string().as_str());
        _json_output_.push_str(",\"object\":");
        _json_output_.push_str(&self.object.to_json_string().as_str());
        _json_output_.push_str(",\"array\":");
        _json_output_.push('[');
        let mut array_index = 0;
        for array_item in &self.array {
            if array_index != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(array_item.to_string().as_str());
            array_index += 1;
        }
        _json_output_.push(']');
        match &self.optional_string {
            Some(optional_string_val) => {
                _json_output_.push_str(",\"optionalString\":");
                _json_output_.push_str(
                    format!(
                        "\"{}\"",
                        optional_string_val
                            .replace("\n", "\\n")
                            .replace("\"", "\\\"")
                    )
                    .as_str(),
                );
            }
            _ => {}
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("string={}", &self.string));
        _query_parts_.push(format!("boolean={}", &self.boolean));
        _query_parts_.push(format!("integer={}", &self.integer));
        _query_parts_.push(format!("number={}", &self.number));
        _query_parts_.push(format!(
            "enumField={}",
            &self.enum_field.to_query_params_string()
        ));
        _query_parts_.push(format!("object={}", &self.object.to_query_params_string()));
        let mut array_output = "array=[".to_string();
        let mut array_index = 0;
        for array_item in &self.array {
            if array_index != 0 {
                array_output.push(',');
            }
            array_output.push_str(array_item.to_string().as_str());
            array_index += 1;
        }
        _query_parts_.push(format!("array={}", array_output));
        match &self.optional_string {
            Some(optional_string_val) => {
                _query_parts_.push(format!("optionalString={}", optional_string_val));
            }
            _ => {}
        };
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub enum AdaptersTypeboxAdapterParamsEnumField {
    A,
    B,
    C,
}

impl ArriModel for AdaptersTypeboxAdapterParamsEnumField {
    fn new() -> Self {
        Self::A
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::String(input_val) => match input_val.as_str() {
                "A" => Self::A,
                "B" => Self::B,
                "C" => Self::C,
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
            Self::C => format!("\"{}\"", "C"),
        }
    }
    fn to_query_params_string(&self) -> String {
        match &self {
            Self::A => "A".to_string(),
            Self::B => "B".to_string(),
            Self::C => "C".to_string(),
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct AdaptersTypeboxAdapterParamsObject {
    pub string: String,
}

impl ArriModel for AdaptersTypeboxAdapterParamsObject {
    fn new() -> Self {
        Self {
            string: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let string = match val.get("string") {
                    Some(serde_json::Value::String(string_val)) => string_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { string }
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
        let _key_count_ = 1;
        _json_output_.push_str("\"string\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.string.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("string={}", &self.string));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct AdaptersTypeboxAdapterResponse {
    pub message: String,
}

impl ArriModel for AdaptersTypeboxAdapterResponse {
    fn new() -> Self {
        Self {
            message: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let message = match val.get("message") {
                    Some(serde_json::Value::String(message_val)) => message_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { message }
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
        let _key_count_ = 1;
        _json_output_.push_str("\"message\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.message.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("message={}", &self.message));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct DeprecatedRpcParams {
    pub deprecated_field: String,
}

impl ArriModel for DeprecatedRpcParams {
    fn new() -> Self {
        Self {
            deprecated_field: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let deprecated_field = match val.get("deprecatedField") {
                    Some(serde_json::Value::String(deprecated_field_val)) => {
                        deprecated_field_val.to_owned()
                    }
                    _ => "".to_string(),
                };
                Self { deprecated_field }
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
        let _key_count_ = 1;
        _json_output_.push_str("\"deprecatedField\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self
                    .deprecated_field
                    .replace("\n", "\\n")
                    .replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("deprecatedField={}", &self.deprecated_field));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryType {
    pub any: serde_json::Value,
    pub boolean: bool,
    pub string: String,
    pub timestamp: DateTime<FixedOffset>,
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
    pub enumerator: ObjectWithEveryTypeEnumerator,
    pub array: Vec<bool>,
    pub object: ObjectWithEveryTypeObject,
    pub record: serde_json::Value,
    pub discriminator: serde_json::Value,
    pub nested_object: ObjectWithEveryTypeNestedObject,
    pub nested_array: Vec<Vec<ObjectWithEveryType_i_>>,
}

impl ArriModel for ObjectWithEveryType {
    fn new() -> Self {
        Self {
            any: serde_json::Value::Null,
            boolean: false,
            string: "".to_string(),
            timestamp: DateTime::default(),
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
            enumerator: ObjectWithEveryTypeEnumerator::A,
            array: Vec::new(),
            object: ObjectWithEveryTypeObject::new(),
            record: serde_json::Value::Null,
            discriminator: serde_json::Value::Null,
            nested_object: ObjectWithEveryTypeNestedObject::new(),
            nested_array: Vec::new(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let any = match val.get("any") {
                    Some(any_val) => any_val.to_owned(),
                    _ => serde_json::Value::Null,
                };
                let boolean = match val.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => boolean_val.to_owned(),
                    _ => false,
                };
                let string = match val.get("string") {
                    Some(serde_json::Value::String(string_val)) => string_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
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
                let enumerator = match val.get("enumerator") {
                    Some(enumerator_val) => {
                        ObjectWithEveryTypeEnumerator::from_json(enumerator_val.to_owned())
                    }
                    _ => ObjectWithEveryTypeEnumerator::A,
                };
                let array = match val.get("array") {
                    Some(serde_json::Value::Array(array_val)) => {
                        let mut array_val_result: Vec<bool> = Vec::new();
                        for array_val_item in array_val {
                            array_val_result.push(match Some(array_val_item) {
                                Some(serde_json::Value::Bool(array_val_item_val)) => {
                                    array_val_item_val.to_owned()
                                }
                                _ => false,
                            })
                        }
                        array_val_result
                    }
                    _ => Vec::new(),
                };
                let object = match val.get("object") {
                    Some(object_val) => ObjectWithEveryTypeObject::from_json(object_val.to_owned()),
                    _ => ObjectWithEveryTypeObject::new(),
                };
                let record = match val.get("record") {
                    Some(record_val) => record_val.to_owned(),
                    _ => serde_json::Value::Null,
                };
                let discriminator = match val.get("discriminator") {
                    Some(discriminator_val) => discriminator_val.to_owned(),
                    _ => serde_json::Value::Null,
                };
                let nested_object = match val.get("nestedObject") {
                    Some(nested_object_val) => {
                        ObjectWithEveryTypeNestedObject::from_json(nested_object_val.to_owned())
                    }
                    _ => ObjectWithEveryTypeNestedObject::new(),
                };
                let nested_array = match val.get("nestedArray") {
                    Some(serde_json::Value::Array(nested_array_val)) => {
                        let mut nested_array_val_result: Vec<Vec<ObjectWithEveryType_i_>> =
                            Vec::new();
                        for nested_array_val_item in nested_array_val {
                            nested_array_val_result.push(match Some(nested_array_val_item) {
                                Some(serde_json::Value::Array(nested_array_val_item_val)) => {
                                    let mut nested_array_val_item_val_result: Vec<
                                        ObjectWithEveryType_i_,
                                    > = Vec::new();
                                    for nested_array_val_item_val_item in nested_array_val_item_val
                                    {
                                        nested_array_val_item_val_result.push(
                                            match Some(nested_array_val_item_val_item) {
                                                Some(nested_array_val_item_val_item_val) => {
                                                    ObjectWithEveryType_i_::from_json(
                                                        nested_array_val_item_val_item_val
                                                            .to_owned(),
                                                    )
                                                }
                                                _ => ObjectWithEveryType_i_::new(),
                                            },
                                        )
                                    }
                                    nested_array_val_item_val_result
                                }
                                _ => Vec::new(),
                            })
                        }
                        nested_array_val_result
                    }
                    _ => Vec::new(),
                };
                Self {
                    any,
                    boolean,
                    string,
                    timestamp,
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
                    enumerator,
                    array,
                    object,
                    record,
                    discriminator,
                    nested_object,
                    nested_array,
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
        let _key_count_ = 21;
        _json_output_.push_str("\"any\":");
        _json_output_.push_str(
            serde_json::to_string(&self.any)
                .unwrap_or("\"null\"".to_string())
                .as_str(),
        );
        _json_output_.push_str(",\"boolean\":");
        _json_output_.push_str(&self.boolean.to_string().as_str());
        _json_output_.push_str(",\"string\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.string.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(format!("\"{}\"", &self.timestamp.to_rfc3339()).as_str());
        _json_output_.push_str(",\"float32\":");
        _json_output_.push_str(&self.float32.to_string().as_str());
        _json_output_.push_str(",\"float64\":");
        _json_output_.push_str(&self.float64.to_string().as_str());
        _json_output_.push_str(",\"int8\":");
        _json_output_.push_str(&self.int8.to_string().as_str());
        _json_output_.push_str(",\"uint8\":");
        _json_output_.push_str(&self.uint8.to_string().as_str());
        _json_output_.push_str(",\"int16\":");
        _json_output_.push_str(&self.int16.to_string().as_str());
        _json_output_.push_str(",\"uint16\":");
        _json_output_.push_str(&self.uint16.to_string().as_str());
        _json_output_.push_str(",\"int32\":");
        _json_output_.push_str(&self.int32.to_string().as_str());
        _json_output_.push_str(",\"uint32\":");
        _json_output_.push_str(&self.uint32.to_string().as_str());
        _json_output_.push_str(",\"int64\":");
        _json_output_.push_str(format!("\"{}\"", &self.int64).as_str());
        _json_output_.push_str(",\"uint64\":");
        _json_output_.push_str(format!("\"{}\"", &self.uint64).as_str());
        _json_output_.push_str(",\"enumerator\":");
        _json_output_.push_str(&self.enumerator.to_json_string().as_str());
        _json_output_.push_str(",\"array\":");
        _json_output_.push('[');
        let mut array_index = 0;
        for array_item in &self.array {
            if array_index != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(array_item.to_string().as_str());
            array_index += 1;
        }
        _json_output_.push(']');
        _json_output_.push_str(",\"object\":");
        _json_output_.push_str(&self.object.to_json_string().as_str());
        _json_output_.push_str(",\"record\":");
        _json_output_.push_str(
            serde_json::to_string(&self.record)
                .unwrap_or("\"null\"".to_string())
                .as_str(),
        );
        _json_output_.push_str(",\"discriminator\":");
        _json_output_.push_str(
            serde_json::to_string(&self.discriminator)
                .unwrap_or("\"null\"".to_string())
                .as_str(),
        );
        _json_output_.push_str(",\"nestedObject\":");
        _json_output_.push_str(&self.nested_object.to_json_string().as_str());
        _json_output_.push_str(",\"nestedArray\":");
        _json_output_.push('[');
        let mut nested_array_index = 0;
        for nested_array_item in &self.nested_array {
            if nested_array_index != 0 {
                _json_output_.push(',');
            }
            _json_output_.push('[');
            let mut nested_array_item_index = 0;
            for nested_array_item_item in nested_array_item {
                if nested_array_item_index != 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str(nested_array_item_item.to_json_string().as_str());
                nested_array_item_index += 1;
            }
            _json_output_.push(']');
            nested_array_index += 1;
        }
        _json_output_.push(']');
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!(
            "any={}",
            serde_json::to_string(&self.any).unwrap_or("null".to_string())
        ));
        _query_parts_.push(format!("boolean={}", &self.boolean));
        _query_parts_.push(format!("string={}", &self.string));
        _query_parts_.push(format!("timestamp={}", &self.timestamp.to_rfc3339()));
        _query_parts_.push(format!("float32={}", &self.float32));
        _query_parts_.push(format!("float64={}", &self.float64));
        _query_parts_.push(format!("int8={}", &self.int8));
        _query_parts_.push(format!("uint8={}", &self.uint8));
        _query_parts_.push(format!("int16={}", &self.int16));
        _query_parts_.push(format!("uint16={}", &self.uint16));
        _query_parts_.push(format!("int32={}", &self.int32));
        _query_parts_.push(format!("uint32={}", &self.uint32));
        _query_parts_.push(format!("int64={}", &self.int64));
        _query_parts_.push(format!("uint64={}", &self.uint64));
        _query_parts_.push(format!(
            "enumerator={}",
            &self.enumerator.to_query_params_string()
        ));
        let mut array_output = "array=[".to_string();
        let mut array_index = 0;
        for array_item in &self.array {
            if array_index != 0 {
                array_output.push(',');
            }
            array_output.push_str(array_item.to_string().as_str());
            array_index += 1;
        }
        _query_parts_.push(format!("array={}", array_output));
        _query_parts_.push(format!("object={}", &self.object.to_query_params_string()));
        _query_parts_.push(format!(
            "record={}",
            serde_json::to_string(&self.record).unwrap_or("null".to_string())
        ));
        _query_parts_.push(format!(
            "discriminator={}",
            serde_json::to_string(&self.discriminator).unwrap_or("null".to_string())
        ));
        _query_parts_.push(format!(
            "nestedObject={}",
            &self.nested_object.to_query_params_string()
        ));
        let mut nested_array_output = "nestedArray=[".to_string();
        let mut nested_array_index = 0;
        for nested_array_item in &self.nested_array {
            if nested_array_index != 0 {
                nested_array_output.push(',');
            }
            nested_array_output.push('[');
            let mut nested_array_item_index = 0;
            for nested_array_item_item in nested_array_item {
                if nested_array_item_index != 0 {
                    nested_array_output.push(',');
                }
                nested_array_output.push_str(nested_array_item_item.to_json_string().as_str());
                nested_array_item_index += 1;
            }
            nested_array_output.push(']');
            nested_array_index += 1;
        }
        _query_parts_.push(format!("nestedArray={}", nested_array_output));
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub enum ObjectWithEveryTypeEnumerator {
    A,
    B,
    C,
}

impl ArriModel for ObjectWithEveryTypeEnumerator {
    fn new() -> Self {
        Self::A
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::String(input_val) => match input_val.as_str() {
                "A" => Self::A,
                "B" => Self::B,
                "C" => Self::C,
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
            Self::C => format!("\"{}\"", "C"),
        }
    }
    fn to_query_params_string(&self) -> String {
        match &self {
            Self::A => "A".to_string(),
            Self::B => "B".to_string(),
            Self::C => "C".to_string(),
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryTypeObject {
    pub string: String,
    pub boolean: bool,
    pub timestamp: DateTime<FixedOffset>,
}

impl ArriModel for ObjectWithEveryTypeObject {
    fn new() -> Self {
        Self {
            string: "".to_string(),
            boolean: false,
            timestamp: DateTime::default(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let string = match val.get("string") {
                    Some(serde_json::Value::String(string_val)) => string_val.to_owned(),
                    _ => "".to_string(),
                };
                let boolean = match val.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => boolean_val.to_owned(),
                    _ => false,
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                Self {
                    string,
                    boolean,
                    timestamp,
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
        _json_output_.push_str("\"string\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.string.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"boolean\":");
        _json_output_.push_str(&self.boolean.to_string().as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(format!("\"{}\"", &self.timestamp.to_rfc3339()).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("string={}", &self.string));
        _query_parts_.push(format!("boolean={}", &self.boolean));
        _query_parts_.push(format!("timestamp={}", &self.timestamp.to_rfc3339()));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryTypeNestedObject {
    pub id: String,
    pub timestamp: DateTime<FixedOffset>,
    pub data: ObjectWithEveryTypeNestedObjectData,
}

impl ArriModel for ObjectWithEveryTypeNestedObject {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: DateTime::default(),
            data: ObjectWithEveryTypeNestedObjectData::new(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                let data = match val.get("data") {
                    Some(data_val) => {
                        ObjectWithEveryTypeNestedObjectData::from_json(data_val.to_owned())
                    }
                    _ => ObjectWithEveryTypeNestedObjectData::new(),
                };
                Self {
                    id,
                    timestamp,
                    data,
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
        _json_output_.push_str("\"id\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(format!("\"{}\"", &self.timestamp.to_rfc3339()).as_str());
        _json_output_.push_str(",\"data\":");
        _json_output_.push_str(&self.data.to_json_string().as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!("timestamp={}", &self.timestamp.to_rfc3339()));
        _query_parts_.push(format!("data={}", &self.data.to_query_params_string()));
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryTypeNestedObjectData {
    pub id: String,
    pub timestamp: DateTime<FixedOffset>,
    pub data: ObjectWithEveryTypeNestedObjectDataData,
}

impl ArriModel for ObjectWithEveryTypeNestedObjectData {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: DateTime::default(),
            data: ObjectWithEveryTypeNestedObjectDataData::new(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                let data = match val.get("data") {
                    Some(data_val) => {
                        ObjectWithEveryTypeNestedObjectDataData::from_json(data_val.to_owned())
                    }
                    _ => ObjectWithEveryTypeNestedObjectDataData::new(),
                };
                Self {
                    id,
                    timestamp,
                    data,
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
        _json_output_.push_str("\"id\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(format!("\"{}\"", &self.timestamp.to_rfc3339()).as_str());
        _json_output_.push_str(",\"data\":");
        _json_output_.push_str(&self.data.to_json_string().as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!("timestamp={}", &self.timestamp.to_rfc3339()));
        _query_parts_.push(format!("data={}", &self.data.to_query_params_string()));
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryTypeNestedObjectDataData {
    pub id: String,
    pub timestamp: DateTime<FixedOffset>,
}

impl ArriModel for ObjectWithEveryTypeNestedObjectDataData {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: DateTime::default(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                Self { id, timestamp }
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
        _json_output_.push_str("\"id\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(format!("\"{}\"", &self.timestamp.to_rfc3339()).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!("timestamp={}", &self.timestamp.to_rfc3339()));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryType_i_ {
    pub id: String,
    pub timestamp: DateTime<FixedOffset>,
}

impl ArriModel for ObjectWithEveryType_i_ {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: DateTime::default(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                Self { id, timestamp }
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
        _json_output_.push_str("\"id\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(format!("\"{}\"", &self.timestamp.to_rfc3339()).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!("timestamp={}", &self.timestamp.to_rfc3339()));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryNullableType {
    pub any: Option<serde_json::Value>,
    pub boolean: Option<bool>,
    pub string: Option<String>,
    pub timestamp: Option<DateTime<FixedOffset>>,
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
    pub enumerator: Option<ObjectWithEveryNullableTypeEnumerator>,
    pub array: Option<Vec<Option<bool>>>,
    pub object: Option<ObjectWithEveryNullableTypeObject>,
    pub record: Option<serde_json::Value>,
    pub discriminator: Option<serde_json::Value>,
    pub nested_object: Option<ObjectWithEveryNullableTypeNestedObject>,
    pub nested_array: Option<Vec<Option<Vec<Option<ObjectWithEveryNullableType_i_>>>>>,
}

impl ArriModel for ObjectWithEveryNullableType {
    fn new() -> Self {
        Self {
            any: None,
            boolean: None,
            string: None,
            timestamp: None,
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
            enumerator: None,
            array: None,
            object: None,
            record: None,
            discriminator: None,
            nested_object: None,
            nested_array: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let any = match val.get("any") {
                    Some(any_val) => Some(any_val.to_owned()),
                    _ => None,
                };
                let boolean = match val.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => Some(boolean_val.to_owned()),
                    _ => None,
                };
                let string = match val.get("string") {
                    Some(serde_json::Value::String(string_val)) => Some(string_val.to_owned()),
                    _ => None,
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => Some(
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default()),
                    ),
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
                let enumerator = match val.get("enumerator") {
                    Some(enumerator_val) => Some(ObjectWithEveryNullableTypeEnumerator::from_json(
                        enumerator_val.to_owned(),
                    )),
                    _ => None,
                };
                let array = match val.get("array") {
                    Some(serde_json::Value::Array(array_val)) => {
                        let mut array_val_result: Vec<Option<bool>> = Vec::new();
                        for array_val_item in array_val {
                            array_val_result.push(match Some(array_val_item) {
                                Some(serde_json::Value::Bool(array_val_item_val)) => {
                                    Some(array_val_item_val.to_owned())
                                }
                                _ => None,
                            });
                        }
                        Some(array_val_result)
                    }
                    _ => None,
                };
                let object = match val.get("object") {
                    Some(object_val) => match object_val {
                        serde_json::Value::Object(_) => Some(
                            ObjectWithEveryNullableTypeObject::from_json(object_val.to_owned()),
                        ),
                        _ => None,
                    },
                    _ => None,
                };
                let record = match val.get("record") {
                    Some(record_val) => Some(record_val.to_owned()),
                    _ => None,
                };
                let discriminator = match val.get("discriminator") {
                    Some(discriminator_val) => Some(discriminator_val.to_owned()),
                    _ => None,
                };
                let nested_object = match val.get("nestedObject") {
                    Some(nested_object_val) => match nested_object_val {
                        serde_json::Value::Object(_) => {
                            Some(ObjectWithEveryNullableTypeNestedObject::from_json(
                                nested_object_val.to_owned(),
                            ))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let nested_array = match val.get("nestedArray") {
                    Some(serde_json::Value::Array(nested_array_val)) => {
                        let mut nested_array_val_result: Vec<
                            Option<Vec<Option<ObjectWithEveryNullableType_i_>>>,
                        > = Vec::new();
                        for nested_array_val_item in nested_array_val {
                            nested_array_val_result.push(match Some(nested_array_val_item) {
                                Some(serde_json::Value::Array(nested_array_val_item_val)) => {
                                    let mut nested_array_val_item_val_result: Vec<
                                        Option<ObjectWithEveryNullableType_i_>,
                                    > = Vec::new();
                                    for nested_array_val_item_val_item in nested_array_val_item_val
                                    {
                                        nested_array_val_item_val_result
                                            .push(match Some(nested_array_val_item_val_item) {
                                            Some(nested_array_val_item_val_item_val) => {
                                                match nested_array_val_item_val_item_val {
                                                    serde_json::Value::Object(_) => Some(
                                                        ObjectWithEveryNullableType_i_::from_json(
                                                            nested_array_val_item_val_item_val
                                                                .to_owned(),
                                                        ),
                                                    ),
                                                    _ => None,
                                                }
                                            }
                                            _ => None,
                                        });
                                    }
                                    Some(nested_array_val_item_val_result)
                                }
                                _ => None,
                            });
                        }
                        Some(nested_array_val_result)
                    }
                    _ => None,
                };
                Self {
                    any,
                    boolean,
                    string,
                    timestamp,
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
                    enumerator,
                    array,
                    object,
                    record,
                    discriminator,
                    nested_object,
                    nested_array,
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
        let _key_count_ = 21;
        _json_output_.push_str("\"any\":");
        match &self.any {
            Some(any_val) => _json_output_.push_str(
                serde_json::to_string(any_val)
                    .unwrap_or("null".to_string())
                    .as_str(),
            ),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"boolean\":");
        match &self.boolean {
            Some(boolean_val) => _json_output_.push_str(boolean_val.to_string().as_str()),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"string\":");
        match &self.string {
            Some(string_val) => _json_output_.push_str(
                format!(
                    "\"{}\"",
                    string_val.replace("\n", "\\n").replace("\"", "\\\"")
                )
                .as_str(),
            ),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"timestamp\":");
        match &self.timestamp {
            Some(timestamp_val) => {
                _json_output_.push_str(format!("\"{}\"", timestamp_val.to_rfc3339()).as_str())
            }
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"float32\":");
        match &self.float32 {
            Some(float32_val) => _json_output_.push_str(float32_val.to_string().as_str()),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"float64\":");
        match &self.float64 {
            Some(float64_val) => _json_output_.push_str(float64_val.to_string().as_str()),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"int8\":");
        match &self.int8 {
            Some(int8_val) => _json_output_.push_str(int8_val.to_string().as_str()),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"uint8\":");
        match &self.uint8 {
            Some(uint8_val) => _json_output_.push_str(uint8_val.to_string().as_str()),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"int16\":");
        match &self.int16 {
            Some(int16_val) => _json_output_.push_str(int16_val.to_string().as_str()),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"uint16\":");
        match &self.uint16 {
            Some(uint16_val) => _json_output_.push_str(uint16_val.to_string().as_str()),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"int32\":");
        match &self.int32 {
            Some(int32_val) => _json_output_.push_str(int32_val.to_string().as_str()),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"uint32\":");
        match &self.uint32 {
            Some(uint32_val) => _json_output_.push_str(uint32_val.to_string().as_str()),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"int64\":");
        match &self.int64 {
            Some(int64_val) => {
                _json_output_.push_str(format!("\"{}\"", int64_val.to_string()).as_str())
            }
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"uint64\":");
        match &self.uint64 {
            Some(uint64_val) => {
                _json_output_.push_str(format!("\"{}\"", uint64_val.to_string()).as_str())
            }
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"enumerator\":");
        match &self.enumerator {
            Some(enumerator_val) => {
                _json_output_.push_str(enumerator_val.to_json_string().as_str())
            }
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"array\":");
        match &self.array {
            Some(array_val) => {
                _json_output_.push('[');
                let mut array_val_index = 0;
                for array_val_item in array_val {
                    if array_val_index != 0 {
                        _json_output_.push(',');
                    }
                    match array_val_item {
                        Some(array_val_item_val) => {
                            _json_output_.push_str(array_val_item_val.to_string().as_str())
                        }
                        _ => _json_output_.push_str("null"),
                    };
                    array_val_index += 1;
                }
                _json_output_.push(']');
            }
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"object\":");
        match &self.object {
            Some(object_val) => _json_output_.push_str(object_val.to_json_string().as_str()),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"record\":");
        match &self.record {
            Some(record_val) => _json_output_.push_str(
                serde_json::to_string(record_val)
                    .unwrap_or("null".to_string())
                    .as_str(),
            ),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"discriminator\":");
        match &self.discriminator {
            Some(discriminator_val) => _json_output_.push_str(
                serde_json::to_string(discriminator_val)
                    .unwrap_or("null".to_string())
                    .as_str(),
            ),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"nestedObject\":");
        match &self.nested_object {
            Some(nested_object_val) => {
                _json_output_.push_str(nested_object_val.to_json_string().as_str())
            }
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"nestedArray\":");
        match &self.nested_array {
            Some(nested_array_val) => {
                _json_output_.push('[');
                let mut nested_array_val_index = 0;
                for nested_array_val_item in nested_array_val {
                    if nested_array_val_index != 0 {
                        _json_output_.push(',');
                    }
                    match nested_array_val_item {
                        Some(nested_array_val_item_val) => {
                            _json_output_.push('[');
                            let mut nested_array_val_item_val_index = 0;
                            for nested_array_val_item_val_item in nested_array_val_item_val {
                                if nested_array_val_item_val_index != 0 {
                                    _json_output_.push(',');
                                }
                                match nested_array_val_item_val_item {
                                    Some(nested_array_val_item_val_item_val) => _json_output_
                                        .push_str(
                                            nested_array_val_item_val_item_val
                                                .to_json_string()
                                                .as_str(),
                                        ),
                                    _ => _json_output_.push_str("null"),
                                };
                                nested_array_val_item_val_index += 1;
                            }
                            _json_output_.push(']');
                        }
                        _ => _json_output_.push_str("null"),
                    };
                    nested_array_val_index += 1;
                }
                _json_output_.push(']');
            }
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self.any {
            Some(any_val) => _query_parts_.push(format!(
                "any={}",
                serde_json::to_string(any_val).unwrap_or("null".to_string())
            )),
            _ => _query_parts_.push("any=null".to_string()),
        };
        match &self.boolean {
            Some(boolean_val) => _query_parts_.push(format!("boolean={}", boolean_val)),
            _ => _query_parts_.push("boolean=null".to_string()),
        };
        match &self.string {
            Some(string_val) => _query_parts_.push(format!("string={}", string_val)),
            _ => _query_parts_.push("string=null".to_string()),
        };
        match &self.timestamp {
            Some(timestamp_val) => {
                _query_parts_.push(format!("timestamp={}", timestamp_val.to_rfc3339()))
            }
            _ => _query_parts_.push("timestamp=null".to_string()),
        };
        match &self.float32 {
            Some(float32_val) => _query_parts_.push(format!("float32={}", float32_val)),
            _ => _query_parts_.push("float32=null".to_string()),
        };
        match &self.float64 {
            Some(float64_val) => _query_parts_.push(format!("float64={}", float64_val)),
            _ => _query_parts_.push("float64=null".to_string()),
        };
        match &self.int8 {
            Some(int8_val) => _query_parts_.push(format!("int8={}", int8_val)),
            _ => _query_parts_.push("int8=null".to_string()),
        };
        match &self.uint8 {
            Some(uint8_val) => _query_parts_.push(format!("uint8={}", uint8_val)),
            _ => _query_parts_.push("uint8=null".to_string()),
        };
        match &self.int16 {
            Some(int16_val) => _query_parts_.push(format!("int16={}", int16_val)),
            _ => _query_parts_.push("int16=null".to_string()),
        };
        match &self.uint16 {
            Some(uint16_val) => _query_parts_.push(format!("uint16={}", uint16_val)),
            _ => _query_parts_.push("uint16=null".to_string()),
        };
        match &self.int32 {
            Some(int32_val) => _query_parts_.push(format!("int32={}", int32_val)),
            _ => _query_parts_.push("int32=null".to_string()),
        };
        match &self.uint32 {
            Some(uint32_val) => _query_parts_.push(format!("uint32={}", uint32_val)),
            _ => _query_parts_.push("uint32=null".to_string()),
        };
        match &self.int64 {
            Some(int64_val) => _query_parts_.push(format!("int64={}", int64_val)),
            _ => _query_parts_.push("int64=null".to_string()),
        };
        match &self.uint64 {
            Some(uint64_val) => _query_parts_.push(format!("uint64={}", uint64_val)),
            _ => _query_parts_.push("uint64=null".to_string()),
        };
        match &self.enumerator {
            Some(enumerator_val) => _query_parts_.push(format!(
                "enumerator={}",
                enumerator_val.to_query_params_string()
            )),
            _ => _query_parts_.push("enumerator=null".to_string()),
        };
        match &self.array {
            Some(array_val) => {
                let mut array_val_output = "array=[".to_string();
                let mut array_val_index = 0;
                for array_val_item in array_val {
                    if array_val_index != 0 {
                        array_val_output.push(',');
                    }
                    match array_val_item {
                        Some(array_val_item_val) => {
                            array_val_output.push_str(array_val_item_val.to_string().as_str())
                        }
                        _ => array_val_output.push_str("null"),
                    };
                    array_val_index += 1;
                }
                _query_parts_.push(format!("array={}", array_val_output));
            }
            _ => _query_parts_.push("array=null".to_string()),
        };
        _query_parts_.push(format!(
            "object={}",
            match &self.object {
                Some(object_val) => object_val.to_query_params_string(),
                _ => "null".to_string(),
            }
        ));
        match &self.record {
            Some(record_val) => _query_parts_.push(format!(
                "record={}",
                serde_json::to_string(record_val).unwrap_or("null".to_string())
            )),
            _ => _query_parts_.push("record=null".to_string()),
        };
        match &self.discriminator {
            Some(discriminator_val) => _query_parts_.push(format!(
                "discriminator={}",
                serde_json::to_string(discriminator_val).unwrap_or("null".to_string())
            )),
            _ => _query_parts_.push("discriminator=null".to_string()),
        };
        _query_parts_.push(format!(
            "nestedObject={}",
            match &self.nested_object {
                Some(nested_object_val) => nested_object_val.to_query_params_string(),
                _ => "null".to_string(),
            }
        ));
        match &self.nested_array {
            Some(nested_array_val) => {
                let mut nested_array_val_output = "nestedArray=[".to_string();
                let mut nested_array_val_index = 0;
                for nested_array_val_item in nested_array_val {
                    if nested_array_val_index != 0 {
                        nested_array_val_output.push(',');
                    }
                    match nested_array_val_item {
                        Some(nested_array_val_item_val) => {
                            nested_array_val_output.push('[');
                            let mut nested_array_val_item_val_index = 0;
                            for nested_array_val_item_val_item in nested_array_val_item_val {
                                if nested_array_val_item_val_index != 0 {
                                    nested_array_val_output.push(',');
                                }
                                match nested_array_val_item_val_item {
                                    Some(nested_array_val_item_val_item_val) => {
                                        nested_array_val_output.push_str(
                                            nested_array_val_item_val_item_val
                                                .to_json_string()
                                                .as_str(),
                                        )
                                    }
                                    _ => nested_array_val_output.push_str("null"),
                                };
                                nested_array_val_item_val_index += 1;
                            }
                            nested_array_val_output.push(']');
                        }
                        _ => nested_array_val_output.push_str("null"),
                    };
                    nested_array_val_index += 1;
                }
                _query_parts_.push(format!("nestedArray={}", nested_array_val_output));
            }
            _ => _query_parts_.push("nestedArray=null".to_string()),
        };
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub enum ObjectWithEveryNullableTypeEnumerator {
    A,
    B,
    C,
}

impl ArriModel for ObjectWithEveryNullableTypeEnumerator {
    fn new() -> Self {
        Self::A
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::String(input_val) => match input_val.as_str() {
                "A" => Self::A,
                "B" => Self::B,
                "C" => Self::C,
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
            Self::C => format!("\"{}\"", "C"),
        }
    }
    fn to_query_params_string(&self) -> String {
        match &self {
            Self::A => "A".to_string(),
            Self::B => "B".to_string(),
            Self::C => "C".to_string(),
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryNullableTypeObject {
    pub string: Option<String>,
    pub boolean: Option<bool>,
    pub timestamp: Option<DateTime<FixedOffset>>,
}

impl ArriModel for ObjectWithEveryNullableTypeObject {
    fn new() -> Self {
        Self {
            string: None,
            boolean: None,
            timestamp: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let string = match val.get("string") {
                    Some(serde_json::Value::String(string_val)) => Some(string_val.to_owned()),
                    _ => None,
                };
                let boolean = match val.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => Some(boolean_val.to_owned()),
                    _ => None,
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => Some(
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default()),
                    ),
                    _ => None,
                };
                Self {
                    string,
                    boolean,
                    timestamp,
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
        _json_output_.push_str("\"string\":");
        match &self.string {
            Some(string_val) => _json_output_.push_str(
                format!(
                    "\"{}\"",
                    string_val.replace("\n", "\\n").replace("\"", "\\\"")
                )
                .as_str(),
            ),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"boolean\":");
        match &self.boolean {
            Some(boolean_val) => _json_output_.push_str(boolean_val.to_string().as_str()),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"timestamp\":");
        match &self.timestamp {
            Some(timestamp_val) => {
                _json_output_.push_str(format!("\"{}\"", timestamp_val.to_rfc3339()).as_str())
            }
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self.string {
            Some(string_val) => _query_parts_.push(format!("string={}", string_val)),
            _ => _query_parts_.push("string=null".to_string()),
        };
        match &self.boolean {
            Some(boolean_val) => _query_parts_.push(format!("boolean={}", boolean_val)),
            _ => _query_parts_.push("boolean=null".to_string()),
        };
        match &self.timestamp {
            Some(timestamp_val) => {
                _query_parts_.push(format!("timestamp={}", timestamp_val.to_rfc3339()))
            }
            _ => _query_parts_.push("timestamp=null".to_string()),
        };
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryNullableTypeNestedObject {
    pub id: Option<String>,
    pub timestamp: Option<DateTime<FixedOffset>>,
    pub data: Option<ObjectWithEveryNullableTypeNestedObjectData>,
}

impl ArriModel for ObjectWithEveryNullableTypeNestedObject {
    fn new() -> Self {
        Self {
            id: None,
            timestamp: None,
            data: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => Some(id_val.to_owned()),
                    _ => None,
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => Some(
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default()),
                    ),
                    _ => None,
                };
                let data = match val.get("data") {
                    Some(data_val) => match data_val {
                        serde_json::Value::Object(_) => {
                            Some(ObjectWithEveryNullableTypeNestedObjectData::from_json(
                                data_val.to_owned(),
                            ))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                Self {
                    id,
                    timestamp,
                    data,
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
        _json_output_.push_str("\"id\":");
        match &self.id {
            Some(id_val) => _json_output_.push_str(
                format!("\"{}\"", id_val.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
            ),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"timestamp\":");
        match &self.timestamp {
            Some(timestamp_val) => {
                _json_output_.push_str(format!("\"{}\"", timestamp_val.to_rfc3339()).as_str())
            }
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"data\":");
        match &self.data {
            Some(data_val) => _json_output_.push_str(data_val.to_json_string().as_str()),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self.id {
            Some(id_val) => _query_parts_.push(format!("id={}", id_val)),
            _ => _query_parts_.push("id=null".to_string()),
        };
        match &self.timestamp {
            Some(timestamp_val) => {
                _query_parts_.push(format!("timestamp={}", timestamp_val.to_rfc3339()))
            }
            _ => _query_parts_.push("timestamp=null".to_string()),
        };
        _query_parts_.push(format!(
            "data={}",
            match &self.data {
                Some(data_val) => data_val.to_query_params_string(),
                _ => "null".to_string(),
            }
        ));
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryNullableTypeNestedObjectData {
    pub id: Option<String>,
    pub timestamp: Option<DateTime<FixedOffset>>,
    pub data: Option<ObjectWithEveryNullableTypeNestedObjectDataData>,
}

impl ArriModel for ObjectWithEveryNullableTypeNestedObjectData {
    fn new() -> Self {
        Self {
            id: None,
            timestamp: None,
            data: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => Some(id_val.to_owned()),
                    _ => None,
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => Some(
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default()),
                    ),
                    _ => None,
                };
                let data = match val.get("data") {
                    Some(data_val) => match data_val {
                        serde_json::Value::Object(_) => {
                            Some(ObjectWithEveryNullableTypeNestedObjectDataData::from_json(
                                data_val.to_owned(),
                            ))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                Self {
                    id,
                    timestamp,
                    data,
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
        _json_output_.push_str("\"id\":");
        match &self.id {
            Some(id_val) => _json_output_.push_str(
                format!("\"{}\"", id_val.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
            ),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"timestamp\":");
        match &self.timestamp {
            Some(timestamp_val) => {
                _json_output_.push_str(format!("\"{}\"", timestamp_val.to_rfc3339()).as_str())
            }
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"data\":");
        match &self.data {
            Some(data_val) => _json_output_.push_str(data_val.to_json_string().as_str()),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self.id {
            Some(id_val) => _query_parts_.push(format!("id={}", id_val)),
            _ => _query_parts_.push("id=null".to_string()),
        };
        match &self.timestamp {
            Some(timestamp_val) => {
                _query_parts_.push(format!("timestamp={}", timestamp_val.to_rfc3339()))
            }
            _ => _query_parts_.push("timestamp=null".to_string()),
        };
        _query_parts_.push(format!(
            "data={}",
            match &self.data {
                Some(data_val) => data_val.to_query_params_string(),
                _ => "null".to_string(),
            }
        ));
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryNullableTypeNestedObjectDataData {
    pub id: Option<String>,
    pub timestamp: Option<DateTime<FixedOffset>>,
}

impl ArriModel for ObjectWithEveryNullableTypeNestedObjectDataData {
    fn new() -> Self {
        Self {
            id: None,
            timestamp: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => Some(id_val.to_owned()),
                    _ => None,
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => Some(
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default()),
                    ),
                    _ => None,
                };
                Self { id, timestamp }
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
        _json_output_.push_str("\"id\":");
        match &self.id {
            Some(id_val) => _json_output_.push_str(
                format!("\"{}\"", id_val.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
            ),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"timestamp\":");
        match &self.timestamp {
            Some(timestamp_val) => {
                _json_output_.push_str(format!("\"{}\"", timestamp_val.to_rfc3339()).as_str())
            }
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self.id {
            Some(id_val) => _query_parts_.push(format!("id={}", id_val)),
            _ => _query_parts_.push("id=null".to_string()),
        };
        match &self.timestamp {
            Some(timestamp_val) => {
                _query_parts_.push(format!("timestamp={}", timestamp_val.to_rfc3339()))
            }
            _ => _query_parts_.push("timestamp=null".to_string()),
        };
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryNullableType_i_ {
    pub id: Option<String>,
    pub timestamp: Option<DateTime<FixedOffset>>,
}

impl ArriModel for ObjectWithEveryNullableType_i_ {
    fn new() -> Self {
        Self {
            id: None,
            timestamp: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => Some(id_val.to_owned()),
                    _ => None,
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => Some(
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default()),
                    ),
                    _ => None,
                };
                Self { id, timestamp }
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
        _json_output_.push_str("\"id\":");
        match &self.id {
            Some(id_val) => _json_output_.push_str(
                format!("\"{}\"", id_val.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
            ),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"timestamp\":");
        match &self.timestamp {
            Some(timestamp_val) => {
                _json_output_.push_str(format!("\"{}\"", timestamp_val.to_rfc3339()).as_str())
            }
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self.id {
            Some(id_val) => _query_parts_.push(format!("id={}", id_val)),
            _ => _query_parts_.push("id=null".to_string()),
        };
        match &self.timestamp {
            Some(timestamp_val) => {
                _query_parts_.push(format!("timestamp={}", timestamp_val.to_rfc3339()))
            }
            _ => _query_parts_.push("timestamp=null".to_string()),
        };
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryOptionalType {
    pub any: Option<serde_json::Value>,
    pub boolean: Option<bool>,
    pub string: Option<String>,
    pub timestamp: Option<DateTime<FixedOffset>>,
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
    pub enumerator: Option<ObjectWithEveryOptionalTypeEnumerator>,
    pub array: Option<Vec<bool>>,
    pub object: Option<ObjectWithEveryOptionalTypeObject>,
    pub record: Option<serde_json::Value>,
    pub discriminator: Option<serde_json::Value>,
    pub nested_object: Option<ObjectWithEveryOptionalTypeNestedObject>,
    pub nested_array: Option<Vec<Vec<ObjectWithEveryOptionalType_i_>>>,
}

impl ArriModel for ObjectWithEveryOptionalType {
    fn new() -> Self {
        Self {
            any: None,
            boolean: None,
            string: None,
            timestamp: None,
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
            enumerator: None,
            array: None,
            object: None,
            record: None,
            discriminator: None,
            nested_object: None,
            nested_array: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let any = match val.get("any") {
                    Some(any_val) => Some(any_val.to_owned()),
                    _ => None,
                };
                let boolean = match val.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => Some(boolean_val.to_owned()),
                    _ => None,
                };
                let string = match val.get("string") {
                    Some(serde_json::Value::String(string_val)) => Some(string_val.to_owned()),
                    _ => None,
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => Some(
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default()),
                    ),
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
                let enumerator = match val.get("enumerator") {
                    Some(enumerator_val) => Some(ObjectWithEveryOptionalTypeEnumerator::from_json(
                        enumerator_val.to_owned(),
                    )),
                    _ => None,
                };
                let array = match val.get("array") {
                    Some(serde_json::Value::Array(array_val)) => {
                        let mut array_val_result: Vec<bool> = Vec::new();
                        for array_val_item in array_val {
                            array_val_result.push(match Some(array_val_item) {
                                Some(serde_json::Value::Bool(array_val_item_val)) => {
                                    array_val_item_val.to_owned()
                                }
                                _ => false,
                            });
                        }
                        Some(array_val_result)
                    }
                    _ => None,
                };
                let object = match val.get("object") {
                    Some(object_val) => match object_val {
                        serde_json::Value::Object(_) => Some(
                            ObjectWithEveryOptionalTypeObject::from_json(object_val.to_owned()),
                        ),
                        _ => None,
                    },
                    _ => None,
                };
                let record = match val.get("record") {
                    Some(record_val) => Some(record_val.to_owned()),
                    _ => None,
                };
                let discriminator = match val.get("discriminator") {
                    Some(discriminator_val) => Some(discriminator_val.to_owned()),
                    _ => None,
                };
                let nested_object = match val.get("nestedObject") {
                    Some(nested_object_val) => match nested_object_val {
                        serde_json::Value::Object(_) => {
                            Some(ObjectWithEveryOptionalTypeNestedObject::from_json(
                                nested_object_val.to_owned(),
                            ))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let nested_array = match val.get("nestedArray") {
                    Some(serde_json::Value::Array(nested_array_val)) => {
                        let mut nested_array_val_result: Vec<Vec<ObjectWithEveryOptionalType_i_>> =
                            Vec::new();
                        for nested_array_val_item in nested_array_val {
                            nested_array_val_result.push(match Some(nested_array_val_item) {
                                Some(serde_json::Value::Array(nested_array_val_item_val)) => {
                                    let mut nested_array_val_item_val_result: Vec<
                                        ObjectWithEveryOptionalType_i_,
                                    > = Vec::new();
                                    for nested_array_val_item_val_item in nested_array_val_item_val
                                    {
                                        nested_array_val_item_val_result.push(
                                            match Some(nested_array_val_item_val_item) {
                                                Some(nested_array_val_item_val_item_val) => {
                                                    ObjectWithEveryOptionalType_i_::from_json(
                                                        nested_array_val_item_val_item_val
                                                            .to_owned(),
                                                    )
                                                }
                                                _ => ObjectWithEveryOptionalType_i_::new(),
                                            },
                                        )
                                    }
                                    nested_array_val_item_val_result
                                }
                                _ => Vec::new(),
                            });
                        }
                        Some(nested_array_val_result)
                    }
                    _ => None,
                };
                Self {
                    any,
                    boolean,
                    string,
                    timestamp,
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
                    enumerator,
                    array,
                    object,
                    record,
                    discriminator,
                    nested_object,
                    nested_array,
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
        let mut _key_count_ = 0;
        match &self.any {
            Some(any_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"any\":");
                _json_output_.push_str(
                    serde_json::to_string(any_val)
                        .unwrap_or("\"null\"".to_string())
                        .as_str(),
                );
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.boolean {
            Some(boolean_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"boolean\":");
                _json_output_.push_str(boolean_val.to_string().as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.string {
            Some(string_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"string\":");
                _json_output_.push_str(
                    format!(
                        "\"{}\"",
                        string_val.replace("\n", "\\n").replace("\"", "\\\"")
                    )
                    .as_str(),
                );
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.timestamp {
            Some(timestamp_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"timestamp\":");
                _json_output_.push_str(format!("\"{}\"", timestamp_val.to_rfc3339()).as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.float32 {
            Some(float32_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"float32\":");
                _json_output_.push_str(float32_val.to_string().as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.float64 {
            Some(float64_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"float64\":");
                _json_output_.push_str(float64_val.to_string().as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.int8 {
            Some(int8_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"int8\":");
                _json_output_.push_str(int8_val.to_string().as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.uint8 {
            Some(uint8_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"uint8\":");
                _json_output_.push_str(uint8_val.to_string().as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.int16 {
            Some(int16_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"int16\":");
                _json_output_.push_str(int16_val.to_string().as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.uint16 {
            Some(uint16_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"uint16\":");
                _json_output_.push_str(uint16_val.to_string().as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.int32 {
            Some(int32_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"int32\":");
                _json_output_.push_str(int32_val.to_string().as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.uint32 {
            Some(uint32_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"uint32\":");
                _json_output_.push_str(uint32_val.to_string().as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.int64 {
            Some(int64_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"int64\":");
                _json_output_.push_str(format!("\"{}\"", int64_val).as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.uint64 {
            Some(uint64_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"uint64\":");
                _json_output_.push_str(format!("\"{}\"", uint64_val).as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.enumerator {
            Some(enumerator_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"enumerator\":");
                _json_output_.push_str(enumerator_val.to_json_string().as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.array {
            Some(array_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"array\":");
                _json_output_.push('[');
                let mut array_val_index = 0;
                for array_val_item in array_val {
                    if array_val_index != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(array_val_item.to_string().as_str());
                    array_val_index += 1;
                }
                _json_output_.push(']');
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.object {
            Some(object_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"object\":");
                _json_output_.push_str(object_val.to_json_string().as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.record {
            Some(record_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"record\":");
                _json_output_.push_str(
                    serde_json::to_string(record_val)
                        .unwrap_or("\"null\"".to_string())
                        .as_str(),
                );
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.discriminator {
            Some(discriminator_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"discriminator\":");
                _json_output_.push_str(
                    serde_json::to_string(discriminator_val)
                        .unwrap_or("\"null\"".to_string())
                        .as_str(),
                );
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.nested_object {
            Some(nested_object_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"nestedObject\":");
                _json_output_.push_str(nested_object_val.to_json_string().as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.nested_array {
            Some(nested_array_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"nestedArray\":");
                _json_output_.push('[');
                let mut nested_array_val_index = 0;
                for nested_array_val_item in nested_array_val {
                    if nested_array_val_index != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push('[');
                    let mut nested_array_val_item_index = 0;
                    for nested_array_val_item_item in nested_array_val_item {
                        if nested_array_val_item_index != 0 {
                            _json_output_.push(',');
                        }
                        _json_output_
                            .push_str(nested_array_val_item_item.to_json_string().as_str());
                        nested_array_val_item_index += 1;
                    }
                    _json_output_.push(']');
                    nested_array_val_index += 1;
                }
                _json_output_.push(']');
                _key_count_ += 1;
            }
            _ => {}
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self.any {
            Some(any_val) => {
                _query_parts_.push(format!(
                    "any={}",
                    serde_json::to_string(any_val).unwrap_or("null".to_string())
                ));
            }
            _ => {}
        };
        match &self.boolean {
            Some(boolean_val) => {
                _query_parts_.push(format!("boolean={}", boolean_val));
            }
            _ => {}
        };
        match &self.string {
            Some(string_val) => {
                _query_parts_.push(format!("string={}", string_val));
            }
            _ => {}
        };
        match &self.timestamp {
            Some(timestamp_val) => {
                _query_parts_.push(format!("timestamp={}", timestamp_val.to_rfc3339()));
            }
            _ => {}
        };
        match &self.float32 {
            Some(float32_val) => {
                _query_parts_.push(format!("float32={}", float32_val));
            }
            _ => {}
        };
        match &self.float64 {
            Some(float64_val) => {
                _query_parts_.push(format!("float64={}", float64_val));
            }
            _ => {}
        };
        match &self.int8 {
            Some(int8_val) => {
                _query_parts_.push(format!("int8={}", int8_val));
            }
            _ => {}
        };
        match &self.uint8 {
            Some(uint8_val) => {
                _query_parts_.push(format!("uint8={}", uint8_val));
            }
            _ => {}
        };
        match &self.int16 {
            Some(int16_val) => {
                _query_parts_.push(format!("int16={}", int16_val));
            }
            _ => {}
        };
        match &self.uint16 {
            Some(uint16_val) => {
                _query_parts_.push(format!("uint16={}", uint16_val));
            }
            _ => {}
        };
        match &self.int32 {
            Some(int32_val) => {
                _query_parts_.push(format!("int32={}", int32_val));
            }
            _ => {}
        };
        match &self.uint32 {
            Some(uint32_val) => {
                _query_parts_.push(format!("uint32={}", uint32_val));
            }
            _ => {}
        };
        match &self.int64 {
            Some(int64_val) => {
                _query_parts_.push(format!("int64={}", int64_val));
            }
            _ => {}
        };
        match &self.uint64 {
            Some(uint64_val) => {
                _query_parts_.push(format!("uint64={}", uint64_val));
            }
            _ => {}
        };
        match &self.enumerator {
            Some(enumerator_val) => {
                _query_parts_.push(format!(
                    "enumerator={}",
                    enumerator_val.to_query_params_string()
                ));
            }
            _ => {}
        };
        match &self.array {
            Some(array_val) => {
                let mut array_val_output = "array=[".to_string();
                let mut array_val_index = 0;
                for array_val_item in array_val {
                    if array_val_index != 0 {
                        array_val_output.push(',');
                    }
                    array_val_output.push_str(array_val_item.to_string().as_str());
                    array_val_index += 1;
                }
                _query_parts_.push(format!("array={}", array_val_output));
            }
            _ => {}
        };
        match &self.object {
            Some(object_val) => {
                _query_parts_.push(format!("object={}", object_val.to_query_params_string()));
            }
            _ => {}
        };
        match &self.record {
            Some(record_val) => {
                _query_parts_.push(format!(
                    "record={}",
                    serde_json::to_string(record_val).unwrap_or("null".to_string())
                ));
            }
            _ => {}
        };
        match &self.discriminator {
            Some(discriminator_val) => {
                _query_parts_.push(format!(
                    "discriminator={}",
                    serde_json::to_string(discriminator_val).unwrap_or("null".to_string())
                ));
            }
            _ => {}
        };
        match &self.nested_object {
            Some(nested_object_val) => {
                _query_parts_.push(format!(
                    "nestedObject={}",
                    nested_object_val.to_query_params_string()
                ));
            }
            _ => {}
        };
        match &self.nested_array {
            Some(nested_array_val) => {
                let mut nested_array_val_output = "nestedArray=[".to_string();
                let mut nested_array_val_index = 0;
                for nested_array_val_item in nested_array_val {
                    if nested_array_val_index != 0 {
                        nested_array_val_output.push(',');
                    }
                    nested_array_val_output.push('[');
                    let mut nested_array_val_item_index = 0;
                    for nested_array_val_item_item in nested_array_val_item {
                        if nested_array_val_item_index != 0 {
                            nested_array_val_output.push(',');
                        }
                        nested_array_val_output
                            .push_str(nested_array_val_item_item.to_json_string().as_str());
                        nested_array_val_item_index += 1;
                    }
                    nested_array_val_output.push(']');
                    nested_array_val_index += 1;
                }
                _query_parts_.push(format!("nestedArray={}", nested_array_val_output));
            }
            _ => {}
        };
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub enum ObjectWithEveryOptionalTypeEnumerator {
    A,
    B,
    C,
}

impl ArriModel for ObjectWithEveryOptionalTypeEnumerator {
    fn new() -> Self {
        Self::A
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::String(input_val) => match input_val.as_str() {
                "A" => Self::A,
                "B" => Self::B,
                "C" => Self::C,
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
            Self::C => format!("\"{}\"", "C"),
        }
    }
    fn to_query_params_string(&self) -> String {
        match &self {
            Self::A => "A".to_string(),
            Self::B => "B".to_string(),
            Self::C => "C".to_string(),
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryOptionalTypeObject {
    pub string: String,
    pub boolean: bool,
    pub timestamp: DateTime<FixedOffset>,
}

impl ArriModel for ObjectWithEveryOptionalTypeObject {
    fn new() -> Self {
        Self {
            string: "".to_string(),
            boolean: false,
            timestamp: DateTime::default(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let string = match val.get("string") {
                    Some(serde_json::Value::String(string_val)) => string_val.to_owned(),
                    _ => "".to_string(),
                };
                let boolean = match val.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => boolean_val.to_owned(),
                    _ => false,
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                Self {
                    string,
                    boolean,
                    timestamp,
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
        _json_output_.push_str("\"string\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.string.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"boolean\":");
        _json_output_.push_str(&self.boolean.to_string().as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(format!("\"{}\"", &self.timestamp.to_rfc3339()).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("string={}", &self.string));
        _query_parts_.push(format!("boolean={}", &self.boolean));
        _query_parts_.push(format!("timestamp={}", &self.timestamp.to_rfc3339()));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryOptionalTypeNestedObject {
    pub id: String,
    pub timestamp: DateTime<FixedOffset>,
    pub data: ObjectWithEveryOptionalTypeNestedObjectData,
}

impl ArriModel for ObjectWithEveryOptionalTypeNestedObject {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: DateTime::default(),
            data: ObjectWithEveryOptionalTypeNestedObjectData::new(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                let data = match val.get("data") {
                    Some(data_val) => {
                        ObjectWithEveryOptionalTypeNestedObjectData::from_json(data_val.to_owned())
                    }
                    _ => ObjectWithEveryOptionalTypeNestedObjectData::new(),
                };
                Self {
                    id,
                    timestamp,
                    data,
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
        _json_output_.push_str("\"id\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(format!("\"{}\"", &self.timestamp.to_rfc3339()).as_str());
        _json_output_.push_str(",\"data\":");
        _json_output_.push_str(&self.data.to_json_string().as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!("timestamp={}", &self.timestamp.to_rfc3339()));
        _query_parts_.push(format!("data={}", &self.data.to_query_params_string()));
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryOptionalTypeNestedObjectData {
    pub id: String,
    pub timestamp: DateTime<FixedOffset>,
    pub data: ObjectWithEveryOptionalTypeNestedObjectDataData,
}

impl ArriModel for ObjectWithEveryOptionalTypeNestedObjectData {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: DateTime::default(),
            data: ObjectWithEveryOptionalTypeNestedObjectDataData::new(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                let data = match val.get("data") {
                    Some(data_val) => ObjectWithEveryOptionalTypeNestedObjectDataData::from_json(
                        data_val.to_owned(),
                    ),
                    _ => ObjectWithEveryOptionalTypeNestedObjectDataData::new(),
                };
                Self {
                    id,
                    timestamp,
                    data,
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
        _json_output_.push_str("\"id\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(format!("\"{}\"", &self.timestamp.to_rfc3339()).as_str());
        _json_output_.push_str(",\"data\":");
        _json_output_.push_str(&self.data.to_json_string().as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!("timestamp={}", &self.timestamp.to_rfc3339()));
        _query_parts_.push(format!("data={}", &self.data.to_query_params_string()));
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryOptionalTypeNestedObjectDataData {
    pub id: String,
    pub timestamp: DateTime<FixedOffset>,
}

impl ArriModel for ObjectWithEveryOptionalTypeNestedObjectDataData {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: DateTime::default(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                Self { id, timestamp }
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
        _json_output_.push_str("\"id\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(format!("\"{}\"", &self.timestamp.to_rfc3339()).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!("timestamp={}", &self.timestamp.to_rfc3339()));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryOptionalType_i_ {
    pub id: String,
    pub timestamp: DateTime<FixedOffset>,
}

impl ArriModel for ObjectWithEveryOptionalType_i_ {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: DateTime::default(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                Self { id, timestamp }
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
        _json_output_.push_str("\"id\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(format!("\"{}\"", &self.timestamp.to_rfc3339()).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!("timestamp={}", &self.timestamp.to_rfc3339()));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct AutoReconnectParams {
    pub message_count: u8,
}

impl ArriModel for AutoReconnectParams {
    fn new() -> Self {
        Self { message_count: 0 }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let message_count = match val.get("messageCount") {
                    Some(serde_json::Value::Number(message_count_val)) => {
                        u8::try_from(message_count_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                Self { message_count }
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
        let _key_count_ = 1;
        _json_output_.push_str("\"messageCount\":");
        _json_output_.push_str(&self.message_count.to_string().as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("messageCount={}", &self.message_count));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct AutoReconnectResponse {
    pub count: u8,
    pub message: String,
}

impl ArriModel for AutoReconnectResponse {
    fn new() -> Self {
        Self {
            count: 0,
            message: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let count = match val.get("count") {
                    Some(serde_json::Value::Number(count_val)) => {
                        u8::try_from(count_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let message = match val.get("message") {
                    Some(serde_json::Value::String(message_val)) => message_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { count, message }
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
        _json_output_.push_str("\"count\":");
        _json_output_.push_str(&self.count.to_string().as_str());
        _json_output_.push_str(",\"message\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.message.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("count={}", &self.count));
        _query_parts_.push(format!("message={}", &self.message));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct StreamConnectionErrorTestParams {
    pub status_code: u16,
    pub status_message: String,
}

impl ArriModel for StreamConnectionErrorTestParams {
    fn new() -> Self {
        Self {
            status_code: 0,
            status_message: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let status_code = match val.get("statusCode") {
                    Some(serde_json::Value::Number(status_code_val)) => {
                        u16::try_from(status_code_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let status_message = match val.get("statusMessage") {
                    Some(serde_json::Value::String(status_message_val)) => {
                        status_message_val.to_owned()
                    }
                    _ => "".to_string(),
                };
                Self {
                    status_code,
                    status_message,
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
        let _key_count_ = 2;
        _json_output_.push_str("\"statusCode\":");
        _json_output_.push_str(&self.status_code.to_string().as_str());
        _json_output_.push_str(",\"statusMessage\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self
                    .status_message
                    .replace("\n", "\\n")
                    .replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("statusCode={}", &self.status_code));
        _query_parts_.push(format!("statusMessage={}", &self.status_message));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct StreamConnectionErrorTestResponse {
    pub message: String,
}

impl ArriModel for StreamConnectionErrorTestResponse {
    fn new() -> Self {
        Self {
            message: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let message = match val.get("message") {
                    Some(serde_json::Value::String(message_val)) => message_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { message }
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
        let _key_count_ = 1;
        _json_output_.push_str("\"message\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.message.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("message={}", &self.message));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct StreamLargeObjectsResponse {
    pub numbers: Vec<f64>,
    pub objects: Vec<StreamLargeObjectsResponse_i_>,
}

impl ArriModel for StreamLargeObjectsResponse {
    fn new() -> Self {
        Self {
            numbers: Vec::new(),
            objects: Vec::new(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let numbers = match val.get("numbers") {
                    Some(serde_json::Value::Array(numbers_val)) => {
                        let mut numbers_val_result: Vec<f64> = Vec::new();
                        for numbers_val_item in numbers_val {
                            numbers_val_result.push(match Some(numbers_val_item) {
                                Some(serde_json::Value::Number(numbers_val_item_val)) => {
                                    numbers_val_item_val.as_f64().unwrap_or(0.0)
                                }
                                _ => 0.0,
                            })
                        }
                        numbers_val_result
                    }
                    _ => Vec::new(),
                };
                let objects = match val.get("objects") {
                    Some(serde_json::Value::Array(objects_val)) => {
                        let mut objects_val_result: Vec<StreamLargeObjectsResponse_i_> = Vec::new();
                        for objects_val_item in objects_val {
                            objects_val_result.push(match Some(objects_val_item) {
                                Some(objects_val_item_val) => {
                                    StreamLargeObjectsResponse_i_::from_json(
                                        objects_val_item_val.to_owned(),
                                    )
                                }
                                _ => StreamLargeObjectsResponse_i_::new(),
                            })
                        }
                        objects_val_result
                    }
                    _ => Vec::new(),
                };
                Self { numbers, objects }
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
        _json_output_.push_str("\"numbers\":");
        _json_output_.push('[');
        let mut numbers_index = 0;
        for numbers_item in &self.numbers {
            if numbers_index != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(numbers_item.to_string().as_str());
            numbers_index += 1;
        }
        _json_output_.push(']');
        _json_output_.push_str(",\"objects\":");
        _json_output_.push('[');
        let mut objects_index = 0;
        for objects_item in &self.objects {
            if objects_index != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(objects_item.to_json_string().as_str());
            objects_index += 1;
        }
        _json_output_.push(']');
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        let mut numbers_output = "numbers=[".to_string();
        let mut numbers_index = 0;
        for numbers_item in &self.numbers {
            if numbers_index != 0 {
                numbers_output.push(',');
            }
            numbers_output.push_str(numbers_item.to_string().as_str());
            numbers_index += 1;
        }
        _query_parts_.push(format!("numbers={}", numbers_output));
        let mut objects_output = "objects=[".to_string();
        let mut objects_index = 0;
        for objects_item in &self.objects {
            if objects_index != 0 {
                objects_output.push(',');
            }
            objects_output.push_str(objects_item.to_json_string().as_str());
            objects_index += 1;
        }
        _query_parts_.push(format!("objects={}", objects_output));
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub struct StreamLargeObjectsResponse_i_ {
    pub id: String,
    pub name: String,
    pub email: String,
}

impl ArriModel for StreamLargeObjectsResponse_i_ {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            name: "".to_string(),
            email: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let name = match val.get("name") {
                    Some(serde_json::Value::String(name_val)) => name_val.to_owned(),
                    _ => "".to_string(),
                };
                let email = match val.get("email") {
                    Some(serde_json::Value::String(email_val)) => email_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { id, name, email }
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
        _json_output_.push_str("\"id\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"name\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.name.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"email\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.email.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!("name={}", &self.name));
        _query_parts_.push(format!("email={}", &self.email));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ChatMessageParams {
    pub channel_id: String,
}

impl ArriModel for ChatMessageParams {
    fn new() -> Self {
        Self {
            channel_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let channel_id = match val.get("channelId") {
                    Some(serde_json::Value::String(channel_id_val)) => channel_id_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { channel_id }
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
        let _key_count_ = 1;
        _json_output_.push_str("\"channelId\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.channel_id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("channelId={}", &self.channel_id));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct PostParams {
    pub post_id: String,
}

impl ArriModel for PostParams {
    fn new() -> Self {
        Self {
            post_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let post_id = match val.get("postId") {
                    Some(serde_json::Value::String(post_id_val)) => post_id_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { post_id }
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
        let _key_count_ = 1;
        _json_output_.push_str("\"postId\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.post_id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("postId={}", &self.post_id));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct Post {
    pub id: String,
    pub title: String,
    pub r#type: PostType,
    pub description: Option<String>,
    pub content: String,
    pub tags: Vec<String>,
    pub author_id: String,
    pub author: Author,
    pub created_at: DateTime<FixedOffset>,
    pub updated_at: DateTime<FixedOffset>,
}

impl ArriModel for Post {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            title: "".to_string(),
            r#type: PostType::Text,
            description: None,
            content: "".to_string(),
            tags: Vec::new(),
            author_id: "".to_string(),
            author: Author::new(),
            created_at: DateTime::default(),
            updated_at: DateTime::default(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let title = match val.get("title") {
                    Some(serde_json::Value::String(title_val)) => title_val.to_owned(),
                    _ => "".to_string(),
                };
                let r#type = match val.get("type") {
                    Some(r#type_val) => PostType::from_json(r#type_val.to_owned()),
                    _ => PostType::Text,
                };
                let description = match val.get("description") {
                    Some(serde_json::Value::String(description_val)) => {
                        Some(description_val.to_owned())
                    }
                    _ => None,
                };
                let content = match val.get("content") {
                    Some(serde_json::Value::String(content_val)) => content_val.to_owned(),
                    _ => "".to_string(),
                };
                let tags = match val.get("tags") {
                    Some(serde_json::Value::Array(tags_val)) => {
                        let mut tags_val_result: Vec<String> = Vec::new();
                        for tags_val_item in tags_val {
                            tags_val_result.push(match Some(tags_val_item) {
                                Some(serde_json::Value::String(tags_val_item_val)) => {
                                    tags_val_item_val.to_owned()
                                }
                                _ => "".to_string(),
                            })
                        }
                        tags_val_result
                    }
                    _ => Vec::new(),
                };
                let author_id = match val.get("authorId") {
                    Some(serde_json::Value::String(author_id_val)) => author_id_val.to_owned(),
                    _ => "".to_string(),
                };
                let author = match val.get("author") {
                    Some(author_val) => Author::from_json(author_val.to_owned()),
                    _ => Author::new(),
                };
                let created_at = match val.get("createdAt") {
                    Some(serde_json::Value::String(created_at_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(created_at_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                let updated_at = match val.get("updatedAt") {
                    Some(serde_json::Value::String(updated_at_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(updated_at_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                Self {
                    id,
                    title,
                    r#type,
                    description,
                    content,
                    tags,
                    author_id,
                    author,
                    created_at,
                    updated_at,
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
        let _key_count_ = 10;
        _json_output_.push_str("\"id\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"title\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.title.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"type\":");
        _json_output_.push_str(&self.r#type.to_json_string().as_str());
        _json_output_.push_str(",\"description\":");
        match &self.description {
            Some(description_val) => _json_output_.push_str(
                format!(
                    "\"{}\"",
                    description_val.replace("\n", "\\n").replace("\"", "\\\"")
                )
                .as_str(),
            ),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"content\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.content.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"tags\":");
        _json_output_.push('[');
        let mut tags_index = 0;
        for tags_item in &self.tags {
            if tags_index != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(
                format!(
                    "\"{}\"",
                    tags_item.replace("\n", "\\n").replace("\"", "\\\"")
                )
                .as_str(),
            );
            tags_index += 1;
        }
        _json_output_.push(']');
        _json_output_.push_str(",\"authorId\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.author_id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"author\":");
        _json_output_.push_str(&self.author.to_json_string().as_str());
        _json_output_.push_str(",\"createdAt\":");
        _json_output_.push_str(format!("\"{}\"", &self.created_at.to_rfc3339()).as_str());
        _json_output_.push_str(",\"updatedAt\":");
        _json_output_.push_str(format!("\"{}\"", &self.updated_at.to_rfc3339()).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!("title={}", &self.title));
        _query_parts_.push(format!("type={}", &self.r#type.to_query_params_string()));
        match &self.description {
            Some(description_val) => _query_parts_.push(format!("description={}", description_val)),
            _ => _query_parts_.push("description=null".to_string()),
        };
        _query_parts_.push(format!("content={}", &self.content));
        let mut tags_output = "tags=[".to_string();
        let mut tags_index = 0;
        for tags_item in &self.tags {
            if tags_index != 0 {
                tags_output.push(',');
            }
            tags_output.push_str(
                format!(
                    "\"{}\"",
                    tags_item.replace("\n", "\\n").replace("\"", "\\\"")
                )
                .as_str(),
            );
            tags_index += 1;
        }
        _query_parts_.push(format!("tags={}", tags_output));
        _query_parts_.push(format!("authorId={}", &self.author_id));
        _query_parts_.push(format!("author={}", &self.author.to_query_params_string()));
        _query_parts_.push(format!("createdAt={}", &self.created_at.to_rfc3339()));
        _query_parts_.push(format!("updatedAt={}", &self.updated_at.to_rfc3339()));
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub enum PostType {
    Text,
    Image,
    Video,
}

impl ArriModel for PostType {
    fn new() -> Self {
        Self::Text
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::String(input_val) => match input_val.as_str() {
                "text" => Self::Text,
                "image" => Self::Image,
                "video" => Self::Video,
                _ => Self::Text,
            },
            _ => Self::Text,
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
            Self::Text => format!("\"{}\"", "text"),
            Self::Image => format!("\"{}\"", "image"),
            Self::Video => format!("\"{}\"", "video"),
        }
    }
    fn to_query_params_string(&self) -> String {
        match &self {
            Self::Text => "text".to_string(),
            Self::Image => "image".to_string(),
            Self::Video => "video".to_string(),
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct Author {
    pub id: String,
    pub name: String,
    pub bio: Option<String>,
    pub created_at: DateTime<FixedOffset>,
    pub updated_at: DateTime<FixedOffset>,
}

impl ArriModel for Author {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            name: "".to_string(),
            bio: None,
            created_at: DateTime::default(),
            updated_at: DateTime::default(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let name = match val.get("name") {
                    Some(serde_json::Value::String(name_val)) => name_val.to_owned(),
                    _ => "".to_string(),
                };
                let bio = match val.get("bio") {
                    Some(serde_json::Value::String(bio_val)) => Some(bio_val.to_owned()),
                    _ => None,
                };
                let created_at = match val.get("createdAt") {
                    Some(serde_json::Value::String(created_at_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(created_at_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                let updated_at = match val.get("updatedAt") {
                    Some(serde_json::Value::String(updated_at_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(updated_at_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                Self {
                    id,
                    name,
                    bio,
                    created_at,
                    updated_at,
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
        let _key_count_ = 5;
        _json_output_.push_str("\"id\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"name\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.name.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"bio\":");
        match &self.bio {
            Some(bio_val) => _json_output_.push_str(
                format!("\"{}\"", bio_val.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
            ),
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"createdAt\":");
        _json_output_.push_str(format!("\"{}\"", &self.created_at.to_rfc3339()).as_str());
        _json_output_.push_str(",\"updatedAt\":");
        _json_output_.push_str(format!("\"{}\"", &self.updated_at.to_rfc3339()).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!("name={}", &self.name));
        match &self.bio {
            Some(bio_val) => _query_parts_.push(format!("bio={}", bio_val)),
            _ => _query_parts_.push("bio=null".to_string()),
        };
        _query_parts_.push(format!("createdAt={}", &self.created_at.to_rfc3339()));
        _query_parts_.push(format!("updatedAt={}", &self.updated_at.to_rfc3339()));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct PostListParams {
    pub limit: i8,
    pub r#type: Option<PostType>,
}

impl ArriModel for PostListParams {
    fn new() -> Self {
        Self {
            limit: 0,
            r#type: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let limit = match val.get("limit") {
                    Some(serde_json::Value::Number(limit_val)) => {
                        i8::try_from(limit_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let r#type = match val.get("type") {
                    Some(r#type_val) => Some(PostType::from_json(r#type_val.to_owned())),
                    _ => None,
                };
                Self { limit, r#type }
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
        let _key_count_ = 1;
        _json_output_.push_str("\"limit\":");
        _json_output_.push_str(&self.limit.to_string().as_str());
        match &self.r#type {
            Some(r#type_val) => {
                _json_output_.push_str(",\"type\":");
                _json_output_.push_str(r#type_val.to_json_string().as_str());
            }
            _ => {}
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("limit={}", &self.limit));
        match &self.r#type {
            Some(r#type_val) => {
                _query_parts_.push(format!("type={}", r#type_val.to_query_params_string()));
            }
            _ => {}
        };
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct PostListResponse {
    pub total: i32,
    pub items: Vec<Post>,
}

impl ArriModel for PostListResponse {
    fn new() -> Self {
        Self {
            total: 0,
            items: Vec::new(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let total = match val.get("total") {
                    Some(serde_json::Value::Number(total_val)) => {
                        i32::try_from(total_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let items = match val.get("items") {
                    Some(serde_json::Value::Array(items_val)) => {
                        let mut items_val_result: Vec<Post> = Vec::new();
                        for items_val_item in items_val {
                            items_val_result.push(match Some(items_val_item) {
                                Some(items_val_item_val) => {
                                    Post::from_json(items_val_item_val.to_owned())
                                }
                                _ => Post::new(),
                            })
                        }
                        items_val_result
                    }
                    _ => Vec::new(),
                };
                Self { total, items }
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
        _json_output_.push_str("\"total\":");
        _json_output_.push_str(&self.total.to_string().as_str());
        _json_output_.push_str(",\"items\":");
        _json_output_.push('[');
        let mut items_index = 0;
        for items_item in &self.items {
            if items_index != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(items_item.to_json_string().as_str());
            items_index += 1;
        }
        _json_output_.push(']');
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("total={}", &self.total));
        let mut items_output = "items=[".to_string();
        let mut items_index = 0;
        for items_item in &self.items {
            if items_index != 0 {
                items_output.push(',');
            }
            items_output.push_str(items_item.to_json_string().as_str());
            items_index += 1;
        }
        _query_parts_.push(format!("items={}", items_output));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct LogPostEventResponse {
    pub success: bool,
    pub message: String,
}

impl ArriModel for LogPostEventResponse {
    fn new() -> Self {
        Self {
            success: false,
            message: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let success = match val.get("success") {
                    Some(serde_json::Value::Bool(success_val)) => success_val.to_owned(),
                    _ => false,
                };
                let message = match val.get("message") {
                    Some(serde_json::Value::String(message_val)) => message_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { success, message }
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
        _json_output_.push_str("\"success\":");
        _json_output_.push_str(&self.success.to_string().as_str());
        _json_output_.push_str(",\"message\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.message.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("success={}", &self.success));
        _query_parts_.push(format!("message={}", &self.message));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct UpdatePostParams {
    pub post_id: String,
    pub data: UpdatePostParamsData,
}

impl ArriModel for UpdatePostParams {
    fn new() -> Self {
        Self {
            post_id: "".to_string(),
            data: UpdatePostParamsData::new(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let post_id = match val.get("postId") {
                    Some(serde_json::Value::String(post_id_val)) => post_id_val.to_owned(),
                    _ => "".to_string(),
                };
                let data = match val.get("data") {
                    Some(data_val) => UpdatePostParamsData::from_json(data_val.to_owned()),
                    _ => UpdatePostParamsData::new(),
                };
                Self { post_id, data }
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
        _json_output_.push_str("\"postId\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.post_id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"data\":");
        _json_output_.push_str(&self.data.to_json_string().as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("postId={}", &self.post_id));
        _query_parts_.push(format!("data={}", &self.data.to_query_params_string()));
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub struct UpdatePostParamsData {
    pub title: Option<String>,
    pub description: Option<String>,
    pub content: Option<String>,
    pub tags: Option<Vec<String>>,
}

impl ArriModel for UpdatePostParamsData {
    fn new() -> Self {
        Self {
            title: None,
            description: None,
            content: None,
            tags: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let title = match val.get("title") {
                    Some(serde_json::Value::String(title_val)) => Some(title_val.to_owned()),
                    _ => None,
                };
                let description = match val.get("description") {
                    Some(serde_json::Value::String(description_val)) => {
                        Some(description_val.to_owned())
                    }
                    _ => None,
                };
                let content = match val.get("content") {
                    Some(serde_json::Value::String(content_val)) => Some(content_val.to_owned()),
                    _ => None,
                };
                let tags = match val.get("tags") {
                    Some(serde_json::Value::Array(tags_val)) => {
                        let mut tags_val_result: Vec<String> = Vec::new();
                        for tags_val_item in tags_val {
                            tags_val_result.push(match Some(tags_val_item) {
                                Some(serde_json::Value::String(tags_val_item_val)) => {
                                    tags_val_item_val.to_owned()
                                }
                                _ => "".to_string(),
                            });
                        }
                        Some(tags_val_result)
                    }
                    _ => None,
                };
                Self {
                    title,
                    description,
                    content,
                    tags,
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
        let mut _key_count_ = 0;
        match &self.title {
            Some(title_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"title\":");
                _json_output_.push_str(
                    format!(
                        "\"{}\"",
                        title_val.replace("\n", "\\n").replace("\"", "\\\"")
                    )
                    .as_str(),
                );
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.description {
            Some(description_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"description\":");
                match description_val {
                    Some(description_val) => _json_output_.push_str(
                        format!(
                            "\"{}\"",
                            description_val.replace("\n", "\\n").replace("\"", "\\\"")
                        )
                        .as_str(),
                    ),
                    _ => _json_output_.push_str("null"),
                };
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.content {
            Some(content_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"content\":");
                _json_output_.push_str(
                    format!(
                        "\"{}\"",
                        content_val.replace("\n", "\\n").replace("\"", "\\\"")
                    )
                    .as_str(),
                );
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.tags {
            Some(tags_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"tags\":");
                _json_output_.push('[');
                let mut tags_val_index = 0;
                for tags_val_item in tags_val {
                    if tags_val_index != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(
                        format!(
                            "\"{}\"",
                            tags_val_item.replace("\n", "\\n").replace("\"", "\\\"")
                        )
                        .as_str(),
                    );
                    tags_val_index += 1;
                }
                _json_output_.push(']');
                _key_count_ += 1;
            }
            _ => {}
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self.title {
            Some(title_val) => {
                _query_parts_.push(format!("title={}", title_val));
            }
            _ => {}
        };
        match &self.description {
            Some(description_val) => {
                match description_val {
                    Some(description_val) => {
                        _query_parts_.push(format!("description={}", description_val))
                    }
                    _ => _query_parts_.push("description=null".to_string()),
                };
            }
            _ => {}
        };
        match &self.content {
            Some(content_val) => {
                _query_parts_.push(format!("content={}", content_val));
            }
            _ => {}
        };
        match &self.tags {
            Some(tags_val) => {
                let mut tags_val_output = "tags=[".to_string();
                let mut tags_val_index = 0;
                for tags_val_item in tags_val {
                    if tags_val_index != 0 {
                        tags_val_output.push(',');
                    }
                    tags_val_output.push_str(
                        format!(
                            "\"{}\"",
                            tags_val_item.replace("\n", "\\n").replace("\"", "\\\"")
                        )
                        .as_str(),
                    );
                    tags_val_index += 1;
                }
                _query_parts_.push(format!("tags={}", tags_val_output));
            }
            _ => {}
        };
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct AnnotationId {
    pub id: String,
    pub version: String,
}

impl ArriModel for AnnotationId {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            version: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let version = match val.get("version") {
                    Some(serde_json::Value::String(version_val)) => version_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { id, version }
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
        _json_output_.push_str("\"id\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"version\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.version.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!("version={}", &self.version));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct Annotation {
    pub annotation_id: AnnotationId,
    pub associated_id: AssociatedId,
    pub annotation_type: AnnotationAnnotationType,
    pub annotation_type_version: u16,
    pub metadata: serde_json::Value,
    pub box_type_range: AnnotationBoxTypeRange,
}

impl ArriModel for Annotation {
    fn new() -> Self {
        Self {
            annotation_id: AnnotationId::new(),
            associated_id: AssociatedId::new(),
            annotation_type: AnnotationAnnotationType::AnnotationBoundingbox,
            annotation_type_version: 0,
            metadata: serde_json::Value::Null,
            box_type_range: AnnotationBoxTypeRange::new(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let annotation_id = match val.get("annotation_id") {
                    Some(annotation_id_val) => {
                        AnnotationId::from_json(annotation_id_val.to_owned())
                    }
                    _ => AnnotationId::new(),
                };
                let associated_id = match val.get("associated_id") {
                    Some(associated_id_val) => {
                        AssociatedId::from_json(associated_id_val.to_owned())
                    }
                    _ => AssociatedId::new(),
                };
                let annotation_type = match val.get("annotation_type") {
                    Some(annotation_type_val) => {
                        AnnotationAnnotationType::from_json(annotation_type_val.to_owned())
                    }
                    _ => AnnotationAnnotationType::AnnotationBoundingbox,
                };
                let annotation_type_version = match val.get("annotation_type_version") {
                    Some(serde_json::Value::Number(annotation_type_version_val)) => {
                        u16::try_from(annotation_type_version_val.as_i64().unwrap_or(0))
                            .unwrap_or(0)
                    }
                    _ => 0,
                };
                let metadata = match val.get("metadata") {
                    Some(metadata_val) => metadata_val.to_owned(),
                    _ => serde_json::Value::Null,
                };
                let box_type_range = match val.get("box_type_range") {
                    Some(box_type_range_val) => {
                        AnnotationBoxTypeRange::from_json(box_type_range_val.to_owned())
                    }
                    _ => AnnotationBoxTypeRange::new(),
                };
                Self {
                    annotation_id,
                    associated_id,
                    annotation_type,
                    annotation_type_version,
                    metadata,
                    box_type_range,
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
        let _key_count_ = 6;
        _json_output_.push_str("\"annotation_id\":");
        _json_output_.push_str(&self.annotation_id.to_json_string().as_str());
        _json_output_.push_str(",\"associated_id\":");
        _json_output_.push_str(&self.associated_id.to_json_string().as_str());
        _json_output_.push_str(",\"annotation_type\":");
        _json_output_.push_str(&self.annotation_type.to_json_string().as_str());
        _json_output_.push_str(",\"annotation_type_version\":");
        _json_output_.push_str(&self.annotation_type_version.to_string().as_str());
        _json_output_.push_str(",\"metadata\":");
        _json_output_.push_str(
            serde_json::to_string(&self.metadata)
                .unwrap_or("\"null\"".to_string())
                .as_str(),
        );
        _json_output_.push_str(",\"box_type_range\":");
        _json_output_.push_str(&self.box_type_range.to_json_string().as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!(
            "annotation_id={}",
            &self.annotation_id.to_query_params_string()
        ));
        _query_parts_.push(format!(
            "associated_id={}",
            &self.associated_id.to_query_params_string()
        ));
        _query_parts_.push(format!(
            "annotation_type={}",
            &self.annotation_type.to_query_params_string()
        ));
        _query_parts_.push(format!(
            "annotation_type_version={}",
            &self.annotation_type_version
        ));
        _query_parts_.push(format!(
            "metadata={}",
            serde_json::to_string(&self.metadata).unwrap_or("null".to_string())
        ));
        _query_parts_.push(format!(
            "box_type_range={}",
            &self.box_type_range.to_query_params_string()
        ));
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub struct AssociatedId {
    pub entity_type: AssociatedIdEntityType,
    pub id: String,
}

impl ArriModel for AssociatedId {
    fn new() -> Self {
        Self {
            entity_type: AssociatedIdEntityType::MovieId,
            id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let entity_type = match val.get("entity_type") {
                    Some(entity_type_val) => {
                        AssociatedIdEntityType::from_json(entity_type_val.to_owned())
                    }
                    _ => AssociatedIdEntityType::MovieId,
                };
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { entity_type, id }
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
        _json_output_.push_str("\"entity_type\":");
        _json_output_.push_str(&self.entity_type.to_json_string().as_str());
        _json_output_.push_str(",\"id\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!(
            "entity_type={}",
            &self.entity_type.to_query_params_string()
        ));
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub enum AssociatedIdEntityType {
    MovieId,
    ShowId,
}

impl ArriModel for AssociatedIdEntityType {
    fn new() -> Self {
        Self::MovieId
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::String(input_val) => match input_val.as_str() {
                "MOVIE_ID" => Self::MovieId,
                "SHOW_ID" => Self::ShowId,
                _ => Self::MovieId,
            },
            _ => Self::MovieId,
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
            Self::MovieId => format!("\"{}\"", "MOVIE_ID"),
            Self::ShowId => format!("\"{}\"", "SHOW_ID"),
        }
    }
    fn to_query_params_string(&self) -> String {
        match &self {
            Self::MovieId => "MOVIE_ID".to_string(),
            Self::ShowId => "SHOW_ID".to_string(),
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
pub enum AnnotationAnnotationType {
    AnnotationBoundingbox,
}

impl ArriModel for AnnotationAnnotationType {
    fn new() -> Self {
        Self::AnnotationBoundingbox
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::String(input_val) => match input_val.as_str() {
                "ANNOTATION_BOUNDINGBOX" => Self::AnnotationBoundingbox,
                _ => Self::AnnotationBoundingbox,
            },
            _ => Self::AnnotationBoundingbox,
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
            Self::AnnotationBoundingbox => format!("\"{}\"", "ANNOTATION_BOUNDINGBOX"),
        }
    }
    fn to_query_params_string(&self) -> String {
        match &self {
            Self::AnnotationBoundingbox => "ANNOTATION_BOUNDINGBOX".to_string(),
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct AnnotationBoxTypeRange {
    pub start_time_in_nano_sec: i64,
    pub end_time_in_nano_sec: u64,
}

impl ArriModel for AnnotationBoxTypeRange {
    fn new() -> Self {
        Self {
            start_time_in_nano_sec: 0,
            end_time_in_nano_sec: 0,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let start_time_in_nano_sec = match val.get("start_time_in_nano_sec") {
                    Some(serde_json::Value::String(start_time_in_nano_sec_val)) => {
                        start_time_in_nano_sec_val.parse::<i64>().unwrap_or(0)
                    }
                    _ => 0,
                };
                let end_time_in_nano_sec = match val.get("end_time_in_nano_sec") {
                    Some(serde_json::Value::String(end_time_in_nano_sec_val)) => {
                        end_time_in_nano_sec_val.parse::<u64>().unwrap_or(0)
                    }
                    _ => 0,
                };
                Self {
                    start_time_in_nano_sec,
                    end_time_in_nano_sec,
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
        let _key_count_ = 2;
        _json_output_.push_str("\"start_time_in_nano_sec\":");
        _json_output_.push_str(format!("\"{}\"", &self.start_time_in_nano_sec).as_str());
        _json_output_.push_str(",\"end_time_in_nano_sec\":");
        _json_output_.push_str(format!("\"{}\"", &self.end_time_in_nano_sec).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!(
            "start_time_in_nano_sec={}",
            &self.start_time_in_nano_sec
        ));
        _query_parts_.push(format!(
            "end_time_in_nano_sec={}",
            &self.end_time_in_nano_sec
        ));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct UpdateAnnotationParams {
    pub annotation_id: String,
    pub annotation_id_version: String,
    pub data: UpdateAnnotationData,
}

impl ArriModel for UpdateAnnotationParams {
    fn new() -> Self {
        Self {
            annotation_id: "".to_string(),
            annotation_id_version: "".to_string(),
            data: UpdateAnnotationData::new(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let annotation_id = match val.get("annotation_id") {
                    Some(serde_json::Value::String(annotation_id_val)) => {
                        annotation_id_val.to_owned()
                    }
                    _ => "".to_string(),
                };
                let annotation_id_version = match val.get("annotation_id_version") {
                    Some(serde_json::Value::String(annotation_id_version_val)) => {
                        annotation_id_version_val.to_owned()
                    }
                    _ => "".to_string(),
                };
                let data = match val.get("data") {
                    Some(data_val) => UpdateAnnotationData::from_json(data_val.to_owned()),
                    _ => UpdateAnnotationData::new(),
                };
                Self {
                    annotation_id,
                    annotation_id_version,
                    data,
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
        _json_output_.push_str("\"annotation_id\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self
                    .annotation_id
                    .replace("\n", "\\n")
                    .replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"annotation_id_version\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self
                    .annotation_id_version
                    .replace("\n", "\\n")
                    .replace("\"", "\\\"")
            )
            .as_str(),
        );
        _json_output_.push_str(",\"data\":");
        _json_output_.push_str(&self.data.to_json_string().as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("annotation_id={}", &self.annotation_id));
        _query_parts_.push(format!(
            "annotation_id_version={}",
            &self.annotation_id_version
        ));
        _query_parts_.push(format!("data={}", &self.data.to_query_params_string()));
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub struct UpdateAnnotationData {
    pub associated_id: Option<AssociatedId>,
    pub annotation_type: Option<UpdateAnnotationDataAnnotationType>,
    pub annotation_type_version: Option<u16>,
    pub metadata: Option<serde_json::Value>,
    pub box_type_range: Option<UpdateAnnotationDataBoxTypeRange>,
}

impl ArriModel for UpdateAnnotationData {
    fn new() -> Self {
        Self {
            associated_id: None,
            annotation_type: None,
            annotation_type_version: None,
            metadata: None,
            box_type_range: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let associated_id = match val.get("associated_id") {
                    Some(associated_id_val) => match associated_id_val {
                        serde_json::Value::Object(_) => {
                            Some(AssociatedId::from_json(associated_id_val.to_owned()))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let annotation_type = match val.get("annotation_type") {
                    Some(annotation_type_val) => {
                        Some(UpdateAnnotationDataAnnotationType::from_json(
                            annotation_type_val.to_owned(),
                        ))
                    }
                    _ => None,
                };
                let annotation_type_version = match val.get("annotation_type_version") {
                    Some(serde_json::Value::Number(annotation_type_version_val)) => Some(
                        u16::try_from(annotation_type_version_val.as_i64().unwrap_or(0))
                            .unwrap_or(0),
                    ),
                    _ => None,
                };
                let metadata = match val.get("metadata") {
                    Some(metadata_val) => Some(metadata_val.to_owned()),
                    _ => None,
                };
                let box_type_range = match val.get("box_type_range") {
                    Some(box_type_range_val) => match box_type_range_val {
                        serde_json::Value::Object(_) => {
                            Some(UpdateAnnotationDataBoxTypeRange::from_json(
                                box_type_range_val.to_owned(),
                            ))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                Self {
                    associated_id,
                    annotation_type,
                    annotation_type_version,
                    metadata,
                    box_type_range,
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
        let mut _key_count_ = 0;
        match &self.associated_id {
            Some(associated_id_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"associated_id\":");
                _json_output_.push_str(associated_id_val.to_json_string().as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.annotation_type {
            Some(annotation_type_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"annotation_type\":");
                _json_output_.push_str(annotation_type_val.to_json_string().as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.annotation_type_version {
            Some(annotation_type_version_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"annotation_type_version\":");
                _json_output_.push_str(annotation_type_version_val.to_string().as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.metadata {
            Some(metadata_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"metadata\":");
                _json_output_.push_str(
                    serde_json::to_string(metadata_val)
                        .unwrap_or("\"null\"".to_string())
                        .as_str(),
                );
                _key_count_ += 1;
            }
            _ => {}
        };
        match &self.box_type_range {
            Some(box_type_range_val) => {
                if _key_count_ > 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"box_type_range\":");
                _json_output_.push_str(box_type_range_val.to_json_string().as_str());
                _key_count_ += 1;
            }
            _ => {}
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self.associated_id {
            Some(associated_id_val) => {
                _query_parts_.push(format!(
                    "associated_id={}",
                    associated_id_val.to_query_params_string()
                ));
            }
            _ => {}
        };
        match &self.annotation_type {
            Some(annotation_type_val) => {
                _query_parts_.push(format!(
                    "annotation_type={}",
                    annotation_type_val.to_query_params_string()
                ));
            }
            _ => {}
        };
        match &self.annotation_type_version {
            Some(annotation_type_version_val) => {
                _query_parts_.push(format!(
                    "annotation_type_version={}",
                    annotation_type_version_val
                ));
            }
            _ => {}
        };
        match &self.metadata {
            Some(metadata_val) => {
                _query_parts_.push(format!(
                    "metadata={}",
                    serde_json::to_string(metadata_val).unwrap_or("null".to_string())
                ));
            }
            _ => {}
        };
        match &self.box_type_range {
            Some(box_type_range_val) => {
                _query_parts_.push(format!(
                    "box_type_range={}",
                    box_type_range_val.to_query_params_string()
                ));
            }
            _ => {}
        };
        _query_parts_.join("&")
    }
}
#[derive(Debug, PartialEq, Clone)]
pub enum UpdateAnnotationDataAnnotationType {
    AnnotationBoundingbox,
}

impl ArriModel for UpdateAnnotationDataAnnotationType {
    fn new() -> Self {
        Self::AnnotationBoundingbox
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::String(input_val) => match input_val.as_str() {
                "ANNOTATION_BOUNDINGBOX" => Self::AnnotationBoundingbox,
                _ => Self::AnnotationBoundingbox,
            },
            _ => Self::AnnotationBoundingbox,
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
            Self::AnnotationBoundingbox => format!("\"{}\"", "ANNOTATION_BOUNDINGBOX"),
        }
    }
    fn to_query_params_string(&self) -> String {
        match &self {
            Self::AnnotationBoundingbox => "ANNOTATION_BOUNDINGBOX".to_string(),
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct UpdateAnnotationDataBoxTypeRange {
    pub start_time_in_nano_sec: i64,
    pub end_time_in_nano_sec: u64,
}

impl ArriModel for UpdateAnnotationDataBoxTypeRange {
    fn new() -> Self {
        Self {
            start_time_in_nano_sec: 0,
            end_time_in_nano_sec: 0,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let start_time_in_nano_sec = match val.get("start_time_in_nano_sec") {
                    Some(serde_json::Value::String(start_time_in_nano_sec_val)) => {
                        start_time_in_nano_sec_val.parse::<i64>().unwrap_or(0)
                    }
                    _ => 0,
                };
                let end_time_in_nano_sec = match val.get("end_time_in_nano_sec") {
                    Some(serde_json::Value::String(end_time_in_nano_sec_val)) => {
                        end_time_in_nano_sec_val.parse::<u64>().unwrap_or(0)
                    }
                    _ => 0,
                };
                Self {
                    start_time_in_nano_sec,
                    end_time_in_nano_sec,
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
        let _key_count_ = 2;
        _json_output_.push_str("\"start_time_in_nano_sec\":");
        _json_output_.push_str(format!("\"{}\"", &self.start_time_in_nano_sec).as_str());
        _json_output_.push_str(",\"end_time_in_nano_sec\":");
        _json_output_.push_str(format!("\"{}\"", &self.end_time_in_nano_sec).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!(
            "start_time_in_nano_sec={}",
            &self.start_time_in_nano_sec
        ));
        _query_parts_.push(format!(
            "end_time_in_nano_sec={}",
            &self.end_time_in_nano_sec
        ));
        _query_parts_.join("&")
    }
}
