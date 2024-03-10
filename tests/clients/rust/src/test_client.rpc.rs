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
        output.push_str("\"hello\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.hello.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("hello={}", &self.hello));
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct AdaptersTypeboxAdapterParams {
    pub string: String,
    pub boolean: bool,
    pub integer: serde_json::Value,
    pub number: f64,
    pub enum_field: serde_json::Value,
    pub object: AdaptersTypeboxAdapterParamsObject,
    pub array: serde_json::Value,
    pub optional_string: Option<String>,
}

impl ArriModel for AdaptersTypeboxAdapterParams {
    fn new() -> Self {
        Self {
            string: "".to_string(),
            boolean: false,
            integer: serde_json::Value::Null,
            number: 0.0,
            enum_field: serde_json::Value::Null,
            object: AdaptersTypeboxAdapterParamsObject::new(),
            array: serde_json::Value::Null,
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
                    Some(serde_json::Value::Bool(boolean_val)) => boolean_val,
                    _ => false,
                };
                let integer = match val {
                    Some(serde_json::Value(integer_val)) => integer_val,
                    _ => serde_json::Value::Null,
                };
                let number = match val {
                    Some(serde_json::Value::number(number_val)) => number_val.as_f64(),
                    _ => 0.0,
                };
                let enum_field = match val {
                    Some(serde_json::Value(enum_field_val)) => enum_field_val,
                    _ => serde_json::Value::Null,
                };
                let object = match val {
                    Some(serde_json::Value(object_val)) => {
                        AdaptersTypeboxAdapterParamsObject.from_json(object_val)
                    }
                    _ => AdaptersTypeboxAdapterParamsObject::new(),
                };
                let array = match val {
                    Some(serde_json::Value(array_val)) => array_val,
                    _ => serde_json::Value::Null,
                };
                let optional_string = match val.get("optionalString") {
                    Some(serde_json::Value(optional_string_val)) => {
                        match optional_string_val.get("optionalString") {
                            Some(serde_json::Value::String(optional_string_val)) => {
                                Some(optional_string_val.to_owned())
                            }
                            _ => None,
                        }
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
        output.push_str("\"string\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.string.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push_str(",\"boolean\":");
        output.push_str(&self.boolean.to_string().as_str());
        output.push_str(",\"integer\":");
        output.push_str(
            match &self.integer.get("integer") {
                Some(integer_val) => match serde_json::to_string(integer_val) {
                    Ok(integer_val_result) => integer_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"number\":");
        output.push_str(&self.number.to_string().as_str());
        output.push_str(",\"enumField\":");
        output.push_str(
            match &self.enum_field.get("enumField") {
                Some(enum_field_val) => match serde_json::to_string(enum_field_val) {
                    Ok(enum_field_val_result) => enum_field_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"object\":");
        output.push_str(object.to_json_string().as_str());
        output.push_str(",\"array\":");
        output.push_str(
            match &self.array.get("array") {
                Some(array_val) => match serde_json::to_string(array_val) {
                    Ok(array_val_result) => array_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        match &self.optional_string {
            Some(optional_string_val) => {
                output.push_str(",\"optionalString\":");
                output.push_str(
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
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("string={}", &self.string));
        parts.push(format!("boolean={}", &self.boolean));
        parts.push(format!(
            "integer={}",
            match serde_json::to_string(&self.integer) {
                Ok(integer_val) => integer_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!("number={}", &self.number.to_string()));
        parts.push(format!(
            "enumField={}",
            match serde_json::to_string(&self.enum_field) {
                Ok(enum_field_val) => enum_field_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "object={}",
            AdaptersTypeboxAdapterParamsObject.to_query_params_string()
        ));
        parts.push(format!(
            "array={}",
            match serde_json::to_string(&self.array) {
                Ok(array_val) => array_val,
                _ => "".to_string(),
            }
        ));
        match &self.optional_string {
            Some(optional_string_val) => {
                parts.push(format!("optionalString={}", optional_string_val));
            }
            _ => {}
        };
        parts.join("&")
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
        output.push_str("\"message\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.message.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("message={}", &self.message));
        parts.join("&")
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
        output.push_str("\"deprecatedField\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self
                    .deprecated_field
                    .replace("\n", "\\n")
                    .replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("deprecatedField={}", &self.deprecated_field));
        parts.join("&")
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
    pub uint8: serde_json::Value,
    pub int16: serde_json::Value,
    pub uint16: serde_json::Value,
    pub int32: serde_json::Value,
    pub uint32: serde_json::Value,
    pub int64: serde_json::Value,
    pub uint64: serde_json::Value,
    pub enumerator: serde_json::Value,
    pub array: serde_json::Value,
    pub object: ObjectWithEveryTypeObject,
    pub record: serde_json::Value,
    pub discriminator: serde_json::Value,
    pub nested_object: ObjectWithEveryTypeNestedObject,
    pub nested_array: serde_json::Value,
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
            uint8: serde_json::Value::Null,
            int16: serde_json::Value::Null,
            uint16: serde_json::Value::Null,
            int32: serde_json::Value::Null,
            uint32: serde_json::Value::Null,
            int64: serde_json::Value::Null,
            uint64: serde_json::Value::Null,
            enumerator: serde_json::Value::Null,
            array: serde_json::Value::Null,
            object: ObjectWithEveryTypeObject::new(),
            record: serde_json::Value::Null,
            discriminator: serde_json::Value::Null,
            nested_object: ObjectWithEveryTypeNestedObject::new(),
            nested_array: serde_json::Value::Null,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let any = match val {
                    Some(serde_json::Value(any_val)) => any_val,
                    _ => serde_json::Value::Null,
                };
                let boolean = match val.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => boolean_val,
                    _ => false,
                };
                let string = match val.get("string") {
                    Some(serde_json::Value::String(string_val)) => string_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        match DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val.as_str()) {
                            Ok(timestamp_val_result) => timestamp_val_result,
                            _ => DateTime::default(),
                        }
                    }
                    _ => DateTime::default(),
                };
                let float32 = match val {
                    Some(serde_json::Value::Number(float32_val)) => {
                        match f32::try_from(float32_val.as_f64().unwrap_or(0.0)) {
                            Ok(float32_val_result) => float32_val_result,
                            _ => 0.0,
                        }
                    }
                    _ => 0.0,
                };
                let float64 = match val {
                    Some(serde_json::Value::number(float64_val)) => float64_val.as_f64(),
                    _ => 0.0,
                };
                let int8 = match val {
                    Some(serde_json::Value::number(int8_val)) => {
                        int8_val.as_i64().try_into::<i8>().unwrap_or(0)
                    }
                    _ => 0,
                };
                let uint8 = match val {
                    Some(serde_json::Value(uint8_val)) => uint8_val,
                    _ => serde_json::Value::Null,
                };
                let int16 = match val {
                    Some(serde_json::Value(int16_val)) => int16_val,
                    _ => serde_json::Value::Null,
                };
                let uint16 = match val {
                    Some(serde_json::Value(uint16_val)) => uint16_val,
                    _ => serde_json::Value::Null,
                };
                let int32 = match val {
                    Some(serde_json::Value(int32_val)) => int32_val,
                    _ => serde_json::Value::Null,
                };
                let uint32 = match val {
                    Some(serde_json::Value(uint32_val)) => uint32_val,
                    _ => serde_json::Value::Null,
                };
                let int64 = match val {
                    Some(serde_json::Value(int64_val)) => int64_val,
                    _ => serde_json::Value::Null,
                };
                let uint64 = match val {
                    Some(serde_json::Value(uint64_val)) => uint64_val,
                    _ => serde_json::Value::Null,
                };
                let enumerator = match val {
                    Some(serde_json::Value(enumerator_val)) => enumerator_val,
                    _ => serde_json::Value::Null,
                };
                let array = match val {
                    Some(serde_json::Value(array_val)) => array_val,
                    _ => serde_json::Value::Null,
                };
                let object = match val {
                    Some(serde_json::Value(object_val)) => {
                        ObjectWithEveryTypeObject.from_json(object_val)
                    }
                    _ => ObjectWithEveryTypeObject::new(),
                };
                let record = match val {
                    Some(serde_json::Value(record_val)) => record_val,
                    _ => serde_json::Value::Null,
                };
                let discriminator = match val {
                    Some(serde_json::Value(discriminator_val)) => discriminator_val,
                    _ => serde_json::Value::Null,
                };
                let nested_object = match val {
                    Some(serde_json::Value(nested_object_val)) => {
                        ObjectWithEveryTypeNestedObject.from_json(nested_object_val)
                    }
                    _ => ObjectWithEveryTypeNestedObject::new(),
                };
                let nested_array = match val {
                    Some(serde_json::Value(nested_array_val)) => nested_array_val,
                    _ => serde_json::Value::Null,
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
            match &self.any.get("any") {
                Some(any_val) => match serde_json::to_string(any_val) {
                    Ok(any_val_result) => any_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"boolean\":");
        output.push_str(&self.boolean.to_string().as_str());
        output.push_str(",\"string\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.string.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push_str(",\"timestamp\":");
        output.push_str(format!("\"{}\"", &self.timestamp.to_rfc3339()).as_str());
        output.push_str(",\"float32\":");
        output.push_str(&self.float32.to_string().as_str());
        output.push_str(",\"float64\":");
        output.push_str(&self.float64.to_string().as_str());
        output.push_str(",\"int8\":");
        output.push_str(int8_val.to_string().as_str());
        output.push_str(",\"uint8\":");
        output.push_str(
            match &self.uint8.get("uint8") {
                Some(uint8_val) => match serde_json::to_string(uint8_val) {
                    Ok(uint8_val_result) => uint8_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"int16\":");
        output.push_str(
            match &self.int16.get("int16") {
                Some(int16_val) => match serde_json::to_string(int16_val) {
                    Ok(int16_val_result) => int16_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"uint16\":");
        output.push_str(
            match &self.uint16.get("uint16") {
                Some(uint16_val) => match serde_json::to_string(uint16_val) {
                    Ok(uint16_val_result) => uint16_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"int32\":");
        output.push_str(
            match &self.int32.get("int32") {
                Some(int32_val) => match serde_json::to_string(int32_val) {
                    Ok(int32_val_result) => int32_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"uint32\":");
        output.push_str(
            match &self.uint32.get("uint32") {
                Some(uint32_val) => match serde_json::to_string(uint32_val) {
                    Ok(uint32_val_result) => uint32_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"int64\":");
        output.push_str(
            match &self.int64.get("int64") {
                Some(int64_val) => match serde_json::to_string(int64_val) {
                    Ok(int64_val_result) => int64_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"uint64\":");
        output.push_str(
            match &self.uint64.get("uint64") {
                Some(uint64_val) => match serde_json::to_string(uint64_val) {
                    Ok(uint64_val_result) => uint64_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"enumerator\":");
        output.push_str(
            match &self.enumerator.get("enumerator") {
                Some(enumerator_val) => match serde_json::to_string(enumerator_val) {
                    Ok(enumerator_val_result) => enumerator_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"array\":");
        output.push_str(
            match &self.array.get("array") {
                Some(array_val) => match serde_json::to_string(array_val) {
                    Ok(array_val_result) => array_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"object\":");
        output.push_str(object.to_json_string().as_str());
        output.push_str(",\"record\":");
        output.push_str(
            match &self.record.get("record") {
                Some(record_val) => match serde_json::to_string(record_val) {
                    Ok(record_val_result) => record_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"discriminator\":");
        output.push_str(
            match &self.discriminator.get("discriminator") {
                Some(discriminator_val) => match serde_json::to_string(discriminator_val) {
                    Ok(discriminator_val_result) => discriminator_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"nestedObject\":");
        output.push_str(nested_object.to_json_string().as_str());
        output.push_str(",\"nestedArray\":");
        output.push_str(
            match &self.nested_array.get("nestedArray") {
                Some(nested_array_val) => match serde_json::to_string(nested_array_val) {
                    Ok(nested_array_val_result) => nested_array_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!(
            "any={}",
            match serde_json::to_string(&self.any) {
                Ok(any_val) => any_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!("boolean={}", &self.boolean));
        parts.push(format!("string={}", &self.string));
        parts.push(format!("timestamp={}", &self.timestamp.to_rfc3339()));
        parts.push(format!("float32={}", &self.float32.to_string()));
        parts.push(format!("float64={}", &self.float64.to_string()));
        parts.push(format!("int8={}", int8_val.to_string(),));
        parts.push(format!(
            "uint8={}",
            match serde_json::to_string(&self.uint8) {
                Ok(uint8_val) => uint8_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "int16={}",
            match serde_json::to_string(&self.int16) {
                Ok(int16_val) => int16_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "uint16={}",
            match serde_json::to_string(&self.uint16) {
                Ok(uint16_val) => uint16_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "int32={}",
            match serde_json::to_string(&self.int32) {
                Ok(int32_val) => int32_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "uint32={}",
            match serde_json::to_string(&self.uint32) {
                Ok(uint32_val) => uint32_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "int64={}",
            match serde_json::to_string(&self.int64) {
                Ok(int64_val) => int64_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "uint64={}",
            match serde_json::to_string(&self.uint64) {
                Ok(uint64_val) => uint64_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "enumerator={}",
            match serde_json::to_string(&self.enumerator) {
                Ok(enumerator_val) => enumerator_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "array={}",
            match serde_json::to_string(&self.array) {
                Ok(array_val) => array_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "object={}",
            ObjectWithEveryTypeObject.to_query_params_string()
        ));
        parts.push(format!(
            "record={}",
            match serde_json::to_string(&self.record) {
                Ok(record_val) => record_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "discriminator={}",
            match serde_json::to_string(&self.discriminator) {
                Ok(discriminator_val) => discriminator_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "nestedObject={}",
            ObjectWithEveryTypeNestedObject.to_query_params_string()
        ));
        parts.push(format!(
            "nestedArray={}",
            match serde_json::to_string(&self.nested_array) {
                Ok(nested_array_val) => nested_array_val,
                _ => "".to_string(),
            }
        ));
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryNullableType {
    pub any: Option<serde_json::Value>,
    pub boolean: Option<bool>,
    pub string: Option<String>,
    pub timestamp: Some<DateTime<FixedOffset>>,
    pub float32: Option<f32>,
    pub float64: Option<f64>,
    pub int8: Option<i8>,
    pub uint8: Option<serde_json::Value>,
    pub int16: Option<serde_json::Value>,
    pub uint16: Option<serde_json::Value>,
    pub int32: Option<serde_json::Value>,
    pub uint32: Option<serde_json::Value>,
    pub int64: Option<serde_json::Value>,
    pub uint64: Option<serde_json::Value>,
    pub enumerator: Option<serde_json::Value>,
    pub array: Option<serde_json::Value>,
    pub object: ObjectWithEveryNullableTypeObject,
    pub record: Option<serde_json::Value>,
    pub discriminator: Option<serde_json::Value>,
    pub nested_object: ObjectWithEveryNullableTypeNestedObject,
    pub nested_array: Option<serde_json::Value>,
}

impl ArriModel for ObjectWithEveryNullableType {
    fn new() -> Self {
        Self {
            any: None(),
            boolean: None(),
            string: None,
            timestamp: None(),
            float32: None,
            float64: None,
            int8: None,
            uint8: None(),
            int16: None(),
            uint16: None(),
            int32: None(),
            uint32: None(),
            int64: None(),
            uint64: None(),
            enumerator: None(),
            array: None(),
            object: ObjectWithEveryNullableTypeObject::new(),
            record: None(),
            discriminator: None(),
            nested_object: ObjectWithEveryNullableTypeNestedObject::new(),
            nested_array: None(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let any = match val {
                    Some(serde_json::Value(any_val)) => Some(any_val),
                    _ => None(),
                };
                let boolean = match val.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => Some(boolean_val),
                    _ => None(),
                };
                let string = match val.get("string") {
                    Some(serde_json::Value::String(string_val)) => Some(string_val.to_owned()),
                    _ => None,
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        match DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val.as_str()) {
                            Ok(timestamp_val_result) => Some(timestamp_val_result),
                            _ => None(),
                        }
                    }
                    _ => None(),
                };
                let float32 = match val {
                    Some(serde_json::Value::Number(float32_val)) => {
                        match f32::try_from(float32_val.as_f64().unwrap_or(0.0)) {
                            Ok(float32_val_result) => Some(float32_val_result),
                            _ => None,
                        }
                    }
                    _ => None,
                };
                let float64 = match val {
                    Some(serde_json::Value::number(float64_val)) => Some(float64_val.as_f64()),
                    _ => None,
                };
                let int8 = match val {
                    Some(serde_json::Value::number(int8_val)) => {
                        Some(int8_val.as_i64().try_into::<i8>().unwrap_or(0))
                    }
                    _ => None,
                };
                let uint8 = match val {
                    Some(serde_json::Value(uint8_val)) => Some(uint8_val),
                    _ => None(),
                };
                let int16 = match val {
                    Some(serde_json::Value(int16_val)) => Some(int16_val),
                    _ => None(),
                };
                let uint16 = match val {
                    Some(serde_json::Value(uint16_val)) => Some(uint16_val),
                    _ => None(),
                };
                let int32 = match val {
                    Some(serde_json::Value(int32_val)) => Some(int32_val),
                    _ => None(),
                };
                let uint32 = match val {
                    Some(serde_json::Value(uint32_val)) => Some(uint32_val),
                    _ => None(),
                };
                let int64 = match val {
                    Some(serde_json::Value(int64_val)) => Some(int64_val),
                    _ => None(),
                };
                let uint64 = match val {
                    Some(serde_json::Value(uint64_val)) => Some(uint64_val),
                    _ => None(),
                };
                let enumerator = match val {
                    Some(serde_json::Value(enumerator_val)) => Some(enumerator_val),
                    _ => None(),
                };
                let array = match val {
                    Some(serde_json::Value(array_val)) => Some(array_val),
                    _ => None(),
                };
                let object = match val {
                    Some(serde_json::Value(object_val)) => {
                        ObjectWithEveryNullableTypeObject.from_json(object_val)
                    }
                    _ => None(),
                };
                let record = match val {
                    Some(serde_json::Value(record_val)) => Some(record_val),
                    _ => None(),
                };
                let discriminator = match val {
                    Some(serde_json::Value(discriminator_val)) => Some(discriminator_val),
                    _ => None(),
                };
                let nested_object = match val {
                    Some(serde_json::Value(nested_object_val)) => {
                        ObjectWithEveryNullableTypeNestedObject.from_json(nested_object_val)
                    }
                    _ => None(),
                };
                let nested_array = match val {
                    Some(serde_json::Value(nested_array_val)) => Some(nested_array_val),
                    _ => None(),
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
            match &self.any.get("any") {
                Some(any_val) => match serde_json::to_string(any_val) {
                    Ok(any_val_result) => any_val_result,
                    _ => None,
                },
                _ => None,
            }
            .as_str(),
        );
        output.push_str(",\"boolean\":");
        output.push_str(
            format!(match &self.boolean {
                Some(boolean_val) => boolean_val.to_string(),
                None => "null".to_string(),
            })
            .as_str(),
        );
        output.push_str(",\"string\":");
        output.push_str(
            match &self.string {
                Some(string_val) => string_val.replace("\n", "\\n").replace("\"", "\\\""),
                None => "null".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"timestamp\":");
        output.push_str(
            match &self.timestamp {
                Some(timestamp_val) => timestamp_val.to_rfc3339(),
            }
            .as_str(),
        );
        output.push_str(",\"float32\":");
        output.push_str(
            match &self.float32 {
                Some(float32_val) => float32.to_string(),
                _ => "null".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"float64\":");
        output.push_str(
            match &self.float64 {
                Some(float64_val) => float64_val.to_string(),
                _ => "null".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"int8\":");
        output.push_str(
            match &self.int8 {
                Some(int8_val) => int8_val.to_string(),
                _ => int8_val.to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"uint8\":");
        output.push_str(
            match &self.uint8.get("uint8") {
                Some(uint8_val) => match serde_json::to_string(uint8_val) {
                    Ok(uint8_val_result) => uint8_val_result,
                    _ => None,
                },
                _ => None,
            }
            .as_str(),
        );
        output.push_str(",\"int16\":");
        output.push_str(
            match &self.int16.get("int16") {
                Some(int16_val) => match serde_json::to_string(int16_val) {
                    Ok(int16_val_result) => int16_val_result,
                    _ => None,
                },
                _ => None,
            }
            .as_str(),
        );
        output.push_str(",\"uint16\":");
        output.push_str(
            match &self.uint16.get("uint16") {
                Some(uint16_val) => match serde_json::to_string(uint16_val) {
                    Ok(uint16_val_result) => uint16_val_result,
                    _ => None,
                },
                _ => None,
            }
            .as_str(),
        );
        output.push_str(",\"int32\":");
        output.push_str(
            match &self.int32.get("int32") {
                Some(int32_val) => match serde_json::to_string(int32_val) {
                    Ok(int32_val_result) => int32_val_result,
                    _ => None,
                },
                _ => None,
            }
            .as_str(),
        );
        output.push_str(",\"uint32\":");
        output.push_str(
            match &self.uint32.get("uint32") {
                Some(uint32_val) => match serde_json::to_string(uint32_val) {
                    Ok(uint32_val_result) => uint32_val_result,
                    _ => None,
                },
                _ => None,
            }
            .as_str(),
        );
        output.push_str(",\"int64\":");
        output.push_str(
            match &self.int64.get("int64") {
                Some(int64_val) => match serde_json::to_string(int64_val) {
                    Ok(int64_val_result) => int64_val_result,
                    _ => None,
                },
                _ => None,
            }
            .as_str(),
        );
        output.push_str(",\"uint64\":");
        output.push_str(
            match &self.uint64.get("uint64") {
                Some(uint64_val) => match serde_json::to_string(uint64_val) {
                    Ok(uint64_val_result) => uint64_val_result,
                    _ => None,
                },
                _ => None,
            }
            .as_str(),
        );
        output.push_str(",\"enumerator\":");
        output.push_str(
            match &self.enumerator.get("enumerator") {
                Some(enumerator_val) => match serde_json::to_string(enumerator_val) {
                    Ok(enumerator_val_result) => enumerator_val_result,
                    _ => None,
                },
                _ => None,
            }
            .as_str(),
        );
        output.push_str(",\"array\":");
        output.push_str(
            match &self.array.get("array") {
                Some(array_val) => match serde_json::to_string(array_val) {
                    Ok(array_val_result) => array_val_result,
                    _ => None,
                },
                _ => None,
            }
            .as_str(),
        );
        output.push_str(",\"object\":");
        output.push_str(
            match &self.object {
                Some(object_val) => ObjectWithEveryNullableTypeObject.to_json_string(),
                _ => "null".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"record\":");
        output.push_str(
            match &self.record.get("record") {
                Some(record_val) => match serde_json::to_string(record_val) {
                    Ok(record_val_result) => record_val_result,
                    _ => None,
                },
                _ => None,
            }
            .as_str(),
        );
        output.push_str(",\"discriminator\":");
        output.push_str(
            match &self.discriminator.get("discriminator") {
                Some(discriminator_val) => match serde_json::to_string(discriminator_val) {
                    Ok(discriminator_val_result) => discriminator_val_result,
                    _ => None,
                },
                _ => None,
            }
            .as_str(),
        );
        output.push_str(",\"nestedObject\":");
        output.push_str(
            match &self.nested_object {
                Some(nested_object_val) => ObjectWithEveryNullableTypeNestedObject.to_json_string(),
                _ => "null".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"nestedArray\":");
        output.push_str(
            match &self.nested_array.get("nestedArray") {
                Some(nested_array_val) => match serde_json::to_string(nested_array_val) {
                    Ok(nested_array_val_result) => nested_array_val_result,
                    _ => None,
                },
                _ => None,
            }
            .as_str(),
        );
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!(
            "any={}",
            match &self.any {
                Some(any_val) => match serde_json::to_string(any_val) {
                    Ok(any_val_result) => any_val_result,
                    _ => "null".to_string(),
                },
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "boolean={}",
            match &self.boolean {
                Some(boolean_val) => boolean_val,
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "string={}",
            match &self.string {
                Some(string_val) => string_val,
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "timestamp={}",
            match &self.timestamp {
                Some(timestamp_val) => timestamp_val.to_rfc3339(),
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "float32={}",
            match &self.float32 {
                Some(float32_val) => float32.to_string(),
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "float64={}",
            match &self.float64 {
                Some(float64_val) => float64_val.to_string(),
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "int8={}",
            match &self.int8 {
                Some(int8_val) => int8_val.to_string(),
                _ => int8_val.to_string(),
            }
        ));
        parts.push(format!(
            "uint8={}",
            match &self.uint8 {
                Some(uint8_val) => match serde_json::to_string(uint8_val) {
                    Ok(uint8_val_result) => uint8_val_result,
                    _ => "null".to_string(),
                },
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "int16={}",
            match &self.int16 {
                Some(int16_val) => match serde_json::to_string(int16_val) {
                    Ok(int16_val_result) => int16_val_result,
                    _ => "null".to_string(),
                },
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "uint16={}",
            match &self.uint16 {
                Some(uint16_val) => match serde_json::to_string(uint16_val) {
                    Ok(uint16_val_result) => uint16_val_result,
                    _ => "null".to_string(),
                },
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "int32={}",
            match &self.int32 {
                Some(int32_val) => match serde_json::to_string(int32_val) {
                    Ok(int32_val_result) => int32_val_result,
                    _ => "null".to_string(),
                },
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "uint32={}",
            match &self.uint32 {
                Some(uint32_val) => match serde_json::to_string(uint32_val) {
                    Ok(uint32_val_result) => uint32_val_result,
                    _ => "null".to_string(),
                },
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "int64={}",
            match &self.int64 {
                Some(int64_val) => match serde_json::to_string(int64_val) {
                    Ok(int64_val_result) => int64_val_result,
                    _ => "null".to_string(),
                },
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "uint64={}",
            match &self.uint64 {
                Some(uint64_val) => match serde_json::to_string(uint64_val) {
                    Ok(uint64_val_result) => uint64_val_result,
                    _ => "null".to_string(),
                },
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "enumerator={}",
            match &self.enumerator {
                Some(enumerator_val) => match serde_json::to_string(enumerator_val) {
                    Ok(enumerator_val_result) => enumerator_val_result,
                    _ => "null".to_string(),
                },
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "array={}",
            match &self.array {
                Some(array_val) => match serde_json::to_string(array_val) {
                    Ok(array_val_result) => array_val_result,
                    _ => "null".to_string(),
                },
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "object={}",
            match &self.object {
                Some(serde_json::Value(object_val)) =>
                    ObjectWithEveryNullableTypeObject.to_query_params_string(),
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "record={}",
            match &self.record {
                Some(record_val) => match serde_json::to_string(record_val) {
                    Ok(record_val_result) => record_val_result,
                    _ => "null".to_string(),
                },
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "discriminator={}",
            match &self.discriminator {
                Some(discriminator_val) => match serde_json::to_string(discriminator_val) {
                    Ok(discriminator_val_result) => discriminator_val_result,
                    _ => "null".to_string(),
                },
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "nestedObject={}",
            match &self.nested_object {
                Some(serde_json::Value(nested_object_val)) =>
                    ObjectWithEveryNullableTypeNestedObject.to_query_params_string(),
                _ => "null".to_string(),
            }
        ));
        parts.push(format!(
            "nestedArray={}",
            match &self.nested_array {
                Some(nested_array_val) => match serde_json::to_string(nested_array_val) {
                    Ok(nested_array_val_result) => nested_array_val_result,
                    _ => "null".to_string(),
                },
                _ => "null".to_string(),
            }
        ));
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ObjectWithEveryOptionalType {
    pub any: Option<serde_json::Value>,
    pub boolean: Option<bool>,
    pub string: Option<String>,
    pub timestamp: Option<DateTime<FixedOffset>>,
    pub float32: Option<f32>,
    pub float64: Option<Option<f64>>,
    pub int8: Option<Option<i8>>,
    pub uint8: Option<serde_json::Value>,
    pub int16: Option<serde_json::Value>,
    pub uint16: Option<serde_json::Value>,
    pub int32: Option<serde_json::Value>,
    pub uint32: Option<serde_json::Value>,
    pub int64: Option<serde_json::Value>,
    pub uint64: Option<serde_json::Value>,
    pub enumerator: Option<serde_json::Value>,
    pub array: Option<serde_json::Value>,
    pub object: Option<ObjectWithEveryOptionalTypeObject>,
    pub record: Option<serde_json::Value>,
    pub discriminator: Option<serde_json::Value>,
    pub nested_object: Option<ObjectWithEveryOptionalTypeNestedObject>,
    pub nested_array: Option<serde_json::Value>,
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
                    Some(serde_json::Value(any_val)) => match any_val {
                        Some(serde_json::Value(any_val)) => Some(any_val),
                        _ => None,
                    },
                    _ => None,
                };
                let boolean = match val.get("boolean") {
                    Some(serde_json::Value(boolean_val)) => match boolean_val.get("boolean") {
                        Some(serde_json::Value::Bool(boolean_val)) => Some(boolean_val),
                        _ => None,
                    },
                    _ => None,
                };
                let string = match val.get("string") {
                    Some(serde_json::Value(string_val)) => match string_val.get("string") {
                        Some(serde_json::Value::String(string_val)) => Some(string_val.to_owned()),
                        _ => None,
                    },
                    _ => None,
                };
                let timestamp = match val.get("timestamp") {
                    Some(serde_json::Value(timestamp_val)) => {
                        match timestamp_val.get("timestamp") {
                            Some(serde_json::Value::String(timestamp_val)) => {
                                match DateTime::<FixedOffset>::parse_from_rfc3339(
                                    timestamp_val.as_str(),
                                ) {
                                    Ok(timestamp_val_result) => Some(timestamp_val_result),
                                    _ => None,
                                }
                            }
                            _ => None,
                        }
                    }
                    _ => None,
                };
                let float32 = match val.get("float32") {
                    Some(serde_json::Value(float32_val)) => match float32_val {
                        Some(serde_json::Value::Number(float32_val)) => {
                            match f32::try_from(float32_val.as_f64().unwrap_or(0.0)) {
                                Ok(float32_val_result) => Some(float32_val_result),
                                _ => None,
                            }
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let float64 = match val.get("float64") {
                    Some(serde_json::Value(float64_val)) => match float64_val {
                        Some(serde_json::Value::number(float64_val)) => Some(float64_val.as_f64()),
                        _ => None,
                    },
                    _ => None,
                };
                let int8 = match val.get("int8") {
                    Some(serde_json::Value(int8_val)) => match int8_val {
                        Some(serde_json::Value::number(int8_val)) => {
                            Some(int8_val.as_i64().try_into::<i8>().unwrap_or(0))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let uint8 = match val.get("uint8") {
                    Some(serde_json::Value(uint8_val)) => match uint8_val {
                        Some(serde_json::Value(uint8_val)) => Some(uint8_val),
                        _ => None,
                    },
                    _ => None,
                };
                let int16 = match val.get("int16") {
                    Some(serde_json::Value(int16_val)) => match int16_val {
                        Some(serde_json::Value(int16_val)) => Some(int16_val),
                        _ => None,
                    },
                    _ => None,
                };
                let uint16 = match val.get("uint16") {
                    Some(serde_json::Value(uint16_val)) => match uint16_val {
                        Some(serde_json::Value(uint16_val)) => Some(uint16_val),
                        _ => None,
                    },
                    _ => None,
                };
                let int32 = match val.get("int32") {
                    Some(serde_json::Value(int32_val)) => match int32_val {
                        Some(serde_json::Value(int32_val)) => Some(int32_val),
                        _ => None,
                    },
                    _ => None,
                };
                let uint32 = match val.get("uint32") {
                    Some(serde_json::Value(uint32_val)) => match uint32_val {
                        Some(serde_json::Value(uint32_val)) => Some(uint32_val),
                        _ => None,
                    },
                    _ => None,
                };
                let int64 = match val.get("int64") {
                    Some(serde_json::Value(int64_val)) => match int64_val {
                        Some(serde_json::Value(int64_val)) => Some(int64_val),
                        _ => None,
                    },
                    _ => None,
                };
                let uint64 = match val.get("uint64") {
                    Some(serde_json::Value(uint64_val)) => match uint64_val {
                        Some(serde_json::Value(uint64_val)) => Some(uint64_val),
                        _ => None,
                    },
                    _ => None,
                };
                let enumerator = match val.get("enumerator") {
                    Some(serde_json::Value(enumerator_val)) => match enumerator_val {
                        Some(serde_json::Value(enumerator_val)) => Some(enumerator_val),
                        _ => None,
                    },
                    _ => None,
                };
                let array = match val.get("array") {
                    Some(serde_json::Value(array_val)) => match array_val {
                        Some(serde_json::Value(array_val)) => Some(array_val),
                        _ => None,
                    },
                    _ => None,
                };
                let object = match val.get("object") {
                    Some(serde_json::Value(object_val)) => match object_val {
                        Some(serde_json::Value(object_val)) => {
                            ObjectWithEveryOptionalTypeObject.from_json(object_val)
                        }
                        _ => ObjectWithEveryOptionalTypeObject::new(),
                    },
                    _ => None,
                };
                let record = match val.get("record") {
                    Some(serde_json::Value(record_val)) => match record_val {
                        Some(serde_json::Value(record_val)) => Some(record_val),
                        _ => None,
                    },
                    _ => None,
                };
                let discriminator = match val.get("discriminator") {
                    Some(serde_json::Value(discriminator_val)) => match discriminator_val {
                        Some(serde_json::Value(discriminator_val)) => Some(discriminator_val),
                        _ => None,
                    },
                    _ => None,
                };
                let nested_object = match val.get("nestedObject") {
                    Some(serde_json::Value(nested_object_val)) => match nested_object_val {
                        Some(serde_json::Value(nested_object_val)) => {
                            ObjectWithEveryOptionalTypeNestedObject.from_json(nested_object_val)
                        }
                        _ => ObjectWithEveryOptionalTypeNestedObject::new(),
                    },
                    _ => None,
                };
                let nested_array = match val.get("nestedArray") {
                    Some(serde_json::Value(nested_array_val)) => match nested_array_val {
                        Some(serde_json::Value(nested_array_val)) => Some(nested_array_val),
                        _ => None,
                    },
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
        match &self.any {
            Some(any_val) => {
                if (key_count == 0) {
                    output.push_str("\"any\":");
                } else {
                    output.push_str(",\"any\":");
                }
                output.push_str(
                    match any_val.get("any") {
                        Some(any_val) => match serde_json::to_string(any_val) {
                            Ok(any_val_result) => any_val_result,
                            _ => "".to_string(),
                        },
                        _ => "".to_string(),
                    }
                    .as_str(),
                );
                key_count += 1;
            }
            _ => {}
        };
        match &self.boolean {
            Some(boolean_val) => {
                if (key_count == 0) {
                    output.push_str("\"boolean\":");
                } else {
                    output.push_str(",\"boolean\":");
                }
                output.push_str(boolean_val.to_string().as_str());
                key_count += 1;
            }
            _ => {}
        };
        match &self.string {
            Some(string_val) => {
                if (key_count == 0) {
                    output.push_str("\"string\":");
                } else {
                    output.push_str(",\"string\":");
                }
                output.push_str(
                    format!(
                        "\"{}\"",
                        string_val.replace("\n", "\\n").replace("\"", "\\\"")
                    )
                    .as_str(),
                );
                key_count += 1;
            }
            _ => {}
        };
        match &self.timestamp {
            Some(timestamp_val) => {
                if (key_count == 0) {
                    output.push_str("\"timestamp\":");
                } else {
                    output.push_str(",\"timestamp\":");
                }
                output.push_str(format!("\"{}\"", timestamp_val.to_rfc3339()).as_str());
                key_count += 1;
            }
            _ => {}
        };
        match &self.float32 {
            Some(float32_val) => {
                if (key_count == 0) {
                    output.push_str("\"float32\":");
                } else {
                    output.push_str(",\"float32\":");
                }
                output.push_str(float32_val.to_string().as_str());
                key_count += 1;
            }
            _ => {}
        };
        match &self.float64 {
            Some(float64_val) => {
                if (key_count == 0) {
                    output.push_str("\"float64\":");
                } else {
                    output.push_str(",\"float64\":");
                }
                output.push_str(
                    match float64_val {
                        Some(float64_val) => float64_val.to_string(),
                        _ => "null".to_string(),
                    }
                    .as_str(),
                );
                key_count += 1;
            }
            _ => {}
        };
        match &self.int8 {
            Some(int8_val) => {
                if (key_count == 0) {
                    output.push_str("\"int8\":");
                } else {
                    output.push_str(",\"int8\":");
                }
                output.push_str(int8_val.to_string().as_str());
                key_count += 1;
            }
            _ => {}
        };
        match &self.uint8 {
            Some(uint8_val) => {
                if (key_count == 0) {
                    output.push_str("\"uint8\":");
                } else {
                    output.push_str(",\"uint8\":");
                }
                output.push_str(
                    match uint8_val.get("uint8") {
                        Some(uint8_val) => match serde_json::to_string(uint8_val) {
                            Ok(uint8_val_result) => uint8_val_result,
                            _ => "".to_string(),
                        },
                        _ => "".to_string(),
                    }
                    .as_str(),
                );
                key_count += 1;
            }
            _ => {}
        };
        match &self.int16 {
            Some(int16_val) => {
                if (key_count == 0) {
                    output.push_str("\"int16\":");
                } else {
                    output.push_str(",\"int16\":");
                }
                output.push_str(
                    match int16_val.get("int16") {
                        Some(int16_val) => match serde_json::to_string(int16_val) {
                            Ok(int16_val_result) => int16_val_result,
                            _ => "".to_string(),
                        },
                        _ => "".to_string(),
                    }
                    .as_str(),
                );
                key_count += 1;
            }
            _ => {}
        };
        match &self.uint16 {
            Some(uint16_val) => {
                if (key_count == 0) {
                    output.push_str("\"uint16\":");
                } else {
                    output.push_str(",\"uint16\":");
                }
                output.push_str(
                    match uint16_val.get("uint16") {
                        Some(uint16_val) => match serde_json::to_string(uint16_val) {
                            Ok(uint16_val_result) => uint16_val_result,
                            _ => "".to_string(),
                        },
                        _ => "".to_string(),
                    }
                    .as_str(),
                );
                key_count += 1;
            }
            _ => {}
        };
        match &self.int32 {
            Some(int32_val) => {
                if (key_count == 0) {
                    output.push_str("\"int32\":");
                } else {
                    output.push_str(",\"int32\":");
                }
                output.push_str(
                    match int32_val.get("int32") {
                        Some(int32_val) => match serde_json::to_string(int32_val) {
                            Ok(int32_val_result) => int32_val_result,
                            _ => "".to_string(),
                        },
                        _ => "".to_string(),
                    }
                    .as_str(),
                );
                key_count += 1;
            }
            _ => {}
        };
        match &self.uint32 {
            Some(uint32_val) => {
                if (key_count == 0) {
                    output.push_str("\"uint32\":");
                } else {
                    output.push_str(",\"uint32\":");
                }
                output.push_str(
                    match uint32_val.get("uint32") {
                        Some(uint32_val) => match serde_json::to_string(uint32_val) {
                            Ok(uint32_val_result) => uint32_val_result,
                            _ => "".to_string(),
                        },
                        _ => "".to_string(),
                    }
                    .as_str(),
                );
                key_count += 1;
            }
            _ => {}
        };
        match &self.int64 {
            Some(int64_val) => {
                if (key_count == 0) {
                    output.push_str("\"int64\":");
                } else {
                    output.push_str(",\"int64\":");
                }
                output.push_str(
                    match int64_val.get("int64") {
                        Some(int64_val) => match serde_json::to_string(int64_val) {
                            Ok(int64_val_result) => int64_val_result,
                            _ => "".to_string(),
                        },
                        _ => "".to_string(),
                    }
                    .as_str(),
                );
                key_count += 1;
            }
            _ => {}
        };
        match &self.uint64 {
            Some(uint64_val) => {
                if (key_count == 0) {
                    output.push_str("\"uint64\":");
                } else {
                    output.push_str(",\"uint64\":");
                }
                output.push_str(
                    match uint64_val.get("uint64") {
                        Some(uint64_val) => match serde_json::to_string(uint64_val) {
                            Ok(uint64_val_result) => uint64_val_result,
                            _ => "".to_string(),
                        },
                        _ => "".to_string(),
                    }
                    .as_str(),
                );
                key_count += 1;
            }
            _ => {}
        };
        match &self.enumerator {
            Some(enumerator_val) => {
                if (key_count == 0) {
                    output.push_str("\"enumerator\":");
                } else {
                    output.push_str(",\"enumerator\":");
                }
                output.push_str(
                    match enumerator_val.get("enumerator") {
                        Some(enumerator_val) => match serde_json::to_string(enumerator_val) {
                            Ok(enumerator_val_result) => enumerator_val_result,
                            _ => "".to_string(),
                        },
                        _ => "".to_string(),
                    }
                    .as_str(),
                );
                key_count += 1;
            }
            _ => {}
        };
        match &self.array {
            Some(array_val) => {
                if (key_count == 0) {
                    output.push_str("\"array\":");
                } else {
                    output.push_str(",\"array\":");
                }
                output.push_str(
                    match array_val.get("array") {
                        Some(array_val) => match serde_json::to_string(array_val) {
                            Ok(array_val_result) => array_val_result,
                            _ => "".to_string(),
                        },
                        _ => "".to_string(),
                    }
                    .as_str(),
                );
                key_count += 1;
            }
            _ => {}
        };
        match &self.object {
            Some(object_val) => {
                if (key_count == 0) {
                    output.push_str("\"object\":");
                } else {
                    output.push_str(",\"object\":");
                }
                output.push_str(object.to_json_string().as_str());
                key_count += 1;
            }
            _ => {}
        };
        match &self.record {
            Some(record_val) => {
                if (key_count == 0) {
                    output.push_str("\"record\":");
                } else {
                    output.push_str(",\"record\":");
                }
                output.push_str(
                    match record_val.get("record") {
                        Some(record_val) => match serde_json::to_string(record_val) {
                            Ok(record_val_result) => record_val_result,
                            _ => "".to_string(),
                        },
                        _ => "".to_string(),
                    }
                    .as_str(),
                );
                key_count += 1;
            }
            _ => {}
        };
        match &self.discriminator {
            Some(discriminator_val) => {
                if (key_count == 0) {
                    output.push_str("\"discriminator\":");
                } else {
                    output.push_str(",\"discriminator\":");
                }
                output.push_str(
                    match discriminator_val.get("discriminator") {
                        Some(discriminator_val) => match serde_json::to_string(discriminator_val) {
                            Ok(discriminator_val_result) => discriminator_val_result,
                            _ => "".to_string(),
                        },
                        _ => "".to_string(),
                    }
                    .as_str(),
                );
                key_count += 1;
            }
            _ => {}
        };
        match &self.nested_object {
            Some(nested_object_val) => {
                if (key_count == 0) {
                    output.push_str("\"nestedObject\":");
                } else {
                    output.push_str(",\"nestedObject\":");
                }
                output.push_str(nested_object.to_json_string().as_str());
                key_count += 1;
            }
            _ => {}
        };
        match &self.nested_array {
            Some(nested_array_val) => {
                if (key_count == 0) {
                    output.push_str("\"nestedArray\":");
                } else {
                    output.push_str(",\"nestedArray\":");
                }
                output.push_str(
                    match nested_array_val.get("nestedArray") {
                        Some(nested_array_val) => match serde_json::to_string(nested_array_val) {
                            Ok(nested_array_val_result) => nested_array_val_result,
                            _ => "".to_string(),
                        },
                        _ => "".to_string(),
                    }
                    .as_str(),
                );
                key_count += 1;
            }
            _ => {}
        };
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        match &self.any {
            Some(any_val) => {
                parts.push(format!(
                    "any={}",
                    match serde_json::to_string(any_val) {
                        Ok(any_val) => any_val,
                        _ => "".to_string(),
                    }
                ));
            }
            _ => {}
        };
        match &self.boolean {
            Some(boolean_val) => {
                parts.push(format!("boolean={}", boolean_val));
            }
            _ => {}
        };
        match &self.string {
            Some(string_val) => {
                parts.push(format!("string={}", string_val));
            }
            _ => {}
        };
        match &self.timestamp {
            Some(timestamp_val) => {
                parts.push(format!("timestamp={}", timestamp_val.to_rfc3339()));
            }
            _ => {}
        };
        match &self.float32 {
            Some(float32_val) => {
                parts.push(format!("float32={}", float32_val.to_string()));
            }
            _ => {}
        };
        match &self.float64 {
            Some(float64_val) => {
                parts.push(format!("float64={}", float64_val.to_string()));
            }
            _ => {}
        };
        match &self.int8 {
            Some(int8_val) => {
                parts.push(format!("int8={}", int8_val.to_string(),));
            }
            _ => {}
        };
        match &self.uint8 {
            Some(uint8_val) => {
                parts.push(format!(
                    "uint8={}",
                    match serde_json::to_string(uint8_val) {
                        Ok(uint8_val) => uint8_val,
                        _ => "".to_string(),
                    }
                ));
            }
            _ => {}
        };
        match &self.int16 {
            Some(int16_val) => {
                parts.push(format!(
                    "int16={}",
                    match serde_json::to_string(int16_val) {
                        Ok(int16_val) => int16_val,
                        _ => "".to_string(),
                    }
                ));
            }
            _ => {}
        };
        match &self.uint16 {
            Some(uint16_val) => {
                parts.push(format!(
                    "uint16={}",
                    match serde_json::to_string(uint16_val) {
                        Ok(uint16_val) => uint16_val,
                        _ => "".to_string(),
                    }
                ));
            }
            _ => {}
        };
        match &self.int32 {
            Some(int32_val) => {
                parts.push(format!(
                    "int32={}",
                    match serde_json::to_string(int32_val) {
                        Ok(int32_val) => int32_val,
                        _ => "".to_string(),
                    }
                ));
            }
            _ => {}
        };
        match &self.uint32 {
            Some(uint32_val) => {
                parts.push(format!(
                    "uint32={}",
                    match serde_json::to_string(uint32_val) {
                        Ok(uint32_val) => uint32_val,
                        _ => "".to_string(),
                    }
                ));
            }
            _ => {}
        };
        match &self.int64 {
            Some(int64_val) => {
                parts.push(format!(
                    "int64={}",
                    match serde_json::to_string(int64_val) {
                        Ok(int64_val) => int64_val,
                        _ => "".to_string(),
                    }
                ));
            }
            _ => {}
        };
        match &self.uint64 {
            Some(uint64_val) => {
                parts.push(format!(
                    "uint64={}",
                    match serde_json::to_string(uint64_val) {
                        Ok(uint64_val) => uint64_val,
                        _ => "".to_string(),
                    }
                ));
            }
            _ => {}
        };
        match &self.enumerator {
            Some(enumerator_val) => {
                parts.push(format!(
                    "enumerator={}",
                    match serde_json::to_string(enumerator_val) {
                        Ok(enumerator_val) => enumerator_val,
                        _ => "".to_string(),
                    }
                ));
            }
            _ => {}
        };
        match &self.array {
            Some(array_val) => {
                parts.push(format!(
                    "array={}",
                    match serde_json::to_string(array_val) {
                        Ok(array_val) => array_val,
                        _ => "".to_string(),
                    }
                ));
            }
            _ => {}
        };
        match &self.object {
            Some(object_val) => {
                parts.push(format!(
                    "object={}",
                    ObjectWithEveryOptionalTypeObject.to_query_params_string()
                ));
            }
            _ => {}
        };
        match &self.record {
            Some(record_val) => {
                parts.push(format!(
                    "record={}",
                    match serde_json::to_string(record_val) {
                        Ok(record_val) => record_val,
                        _ => "".to_string(),
                    }
                ));
            }
            _ => {}
        };
        match &self.discriminator {
            Some(discriminator_val) => {
                parts.push(format!(
                    "discriminator={}",
                    match serde_json::to_string(discriminator_val) {
                        Ok(discriminator_val) => discriminator_val,
                        _ => "".to_string(),
                    }
                ));
            }
            _ => {}
        };
        match &self.nested_object {
            Some(nested_object_val) => {
                parts.push(format!(
                    "nestedObject={}",
                    ObjectWithEveryOptionalTypeNestedObject.to_query_params_string()
                ));
            }
            _ => {}
        };
        match &self.nested_array {
            Some(nested_array_val) => {
                parts.push(format!(
                    "nestedArray={}",
                    match serde_json::to_string(nested_array_val) {
                        Ok(nested_array_val) => nested_array_val,
                        _ => "".to_string(),
                    }
                ));
            }
            _ => {}
        };
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct AutoReconnectParams {
    pub message_count: serde_json::Value,
}

impl ArriModel for AutoReconnectParams {
    fn new() -> Self {
        Self {
            message_count: serde_json::Value::Null,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let message_count = match val {
                    Some(serde_json::Value(message_count_val)) => message_count_val,
                    _ => serde_json::Value::Null,
                };
                Self { message_count }
            }
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
        output.push_str("\"messageCount\":");
        output.push_str(
            match &self.message_count.get("messageCount") {
                Some(message_count_val) => match serde_json::to_string(message_count_val) {
                    Ok(message_count_val_result) => message_count_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!(
            "messageCount={}",
            match serde_json::to_string(&self.message_count) {
                Ok(message_count_val) => message_count_val,
                _ => "".to_string(),
            }
        ));
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct AutoReconnectResponse {
    pub count: serde_json::Value,
    pub message: String,
}

impl ArriModel for AutoReconnectResponse {
    fn new() -> Self {
        Self {
            count: serde_json::Value::Null,
            message: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let count = match val {
                    Some(serde_json::Value(count_val)) => count_val,
                    _ => serde_json::Value::Null,
                };
                let message = match val.get("message") {
                    Some(serde_json::Value::String(message_val)) => message_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { count, message }
            }
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
        output.push_str("\"count\":");
        output.push_str(
            match &self.count.get("count") {
                Some(count_val) => match serde_json::to_string(count_val) {
                    Ok(count_val_result) => count_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"message\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.message.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!(
            "count={}",
            match serde_json::to_string(&self.count) {
                Ok(count_val) => count_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!("message={}", &self.message));
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct StreamConnectionErrorTestParams {
    pub status_code: serde_json::Value,
    pub status_message: String,
}

impl ArriModel for StreamConnectionErrorTestParams {
    fn new() -> Self {
        Self {
            status_code: serde_json::Value::Null,
            status_message: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let status_code = match val {
                    Some(serde_json::Value(status_code_val)) => status_code_val,
                    _ => serde_json::Value::Null,
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
        output.push_str("\"statusCode\":");
        output.push_str(
            match &self.status_code.get("statusCode") {
                Some(status_code_val) => match serde_json::to_string(status_code_val) {
                    Ok(status_code_val_result) => status_code_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"statusMessage\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self
                    .status_message
                    .replace("\n", "\\n")
                    .replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!(
            "statusCode={}",
            match serde_json::to_string(&self.status_code) {
                Ok(status_code_val) => status_code_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!("statusMessage={}", &self.status_message));
        parts.join("&")
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
        output.push_str("\"message\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.message.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("message={}", &self.message));
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct StreamLargeObjectsResponse {
    pub numbers: serde_json::Value,
    pub objects: serde_json::Value,
}

impl ArriModel for StreamLargeObjectsResponse {
    fn new() -> Self {
        Self {
            numbers: serde_json::Value::Null,
            objects: serde_json::Value::Null,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let numbers = match val {
                    Some(serde_json::Value(numbers_val)) => numbers_val,
                    _ => serde_json::Value::Null,
                };
                let objects = match val {
                    Some(serde_json::Value(objects_val)) => objects_val,
                    _ => serde_json::Value::Null,
                };
                Self { numbers, objects }
            }
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
        output.push_str("\"numbers\":");
        output.push_str(
            match &self.numbers.get("numbers") {
                Some(numbers_val) => match serde_json::to_string(numbers_val) {
                    Ok(numbers_val_result) => numbers_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"objects\":");
        output.push_str(
            match &self.objects.get("objects") {
                Some(objects_val) => match serde_json::to_string(objects_val) {
                    Ok(objects_val_result) => objects_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!(
            "numbers={}",
            match serde_json::to_string(&self.numbers) {
                Ok(numbers_val) => numbers_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "objects={}",
            match serde_json::to_string(&self.objects) {
                Ok(objects_val) => objects_val,
                _ => "".to_string(),
            }
        ));
        parts.join("&")
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
        output.push_str("\"channelId\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.channel_id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("channelId={}", &self.channel_id));
        parts.join("&")
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
        output.push_str("\"postId\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.post_id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("postId={}", &self.post_id));
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct Post {
    pub id: String,
    pub title: String,
    pub r#type: serde_json::Value,
    pub description: Option<String>,
    pub content: String,
    pub tags: serde_json::Value,
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
            r#type: serde_json::Value::Null,
            description: None,
            content: "".to_string(),
            tags: serde_json::Value::Null,
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
                let r#type = match val {
                    Some(serde_json::Value(r#type_val)) => r#type_val,
                    _ => serde_json::Value::Null,
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
                let tags = match val {
                    Some(serde_json::Value(tags_val)) => tags_val,
                    _ => serde_json::Value::Null,
                };
                let author_id = match val.get("authorId") {
                    Some(serde_json::Value::String(author_id_val)) => author_id_val.to_owned(),
                    _ => "".to_string(),
                };
                let author = match val {
                    Some(serde_json::Value(author_val)) => Author.from_json(author_val),
                    _ => Author::new(),
                };
                let created_at = match val.get("createdAt") {
                    Some(serde_json::Value::String(created_at_val)) => {
                        match DateTime::<FixedOffset>::parse_from_rfc3339(created_at_val.as_str()) {
                            Ok(created_at_val_result) => created_at_val_result,
                            _ => DateTime::default(),
                        }
                    }
                    _ => DateTime::default(),
                };
                let updated_at = match val.get("updatedAt") {
                    Some(serde_json::Value::String(updated_at_val)) => {
                        match DateTime::<FixedOffset>::parse_from_rfc3339(updated_at_val.as_str()) {
                            Ok(updated_at_val_result) => updated_at_val_result,
                            _ => DateTime::default(),
                        }
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
        output.push_str("\"id\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push_str(",\"title\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.title.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push_str(",\"type\":");
        output.push_str(
            match &self.r#type.get("type") {
                Some(r#type_val) => match serde_json::to_string(r#type_val) {
                    Ok(r#type_val_result) => r#type_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"description\":");
        output.push_str(
            match &self.description {
                Some(description_val) => description_val.replace("\n", "\\n").replace("\"", "\\\""),
                None => "null".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"content\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.content.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push_str(",\"tags\":");
        output.push_str(
            match &self.tags.get("tags") {
                Some(tags_val) => match serde_json::to_string(tags_val) {
                    Ok(tags_val_result) => tags_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"authorId\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.author_id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push_str(",\"author\":");
        output.push_str(author.to_json_string().as_str());
        output.push_str(",\"createdAt\":");
        output.push_str(format!("\"{}\"", &self.created_at.to_rfc3339()).as_str());
        output.push_str(",\"updatedAt\":");
        output.push_str(format!("\"{}\"", &self.updated_at.to_rfc3339()).as_str());
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("id={}", &self.id));
        parts.push(format!("title={}", &self.title));
        parts.push(format!(
            "type={}",
            match serde_json::to_string(&self.r#type) {
                Ok(r#type_val) => r#type_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "description={}",
            match &self.description {
                Some(description_val) => description_val,
                _ => "null".to_string(),
            }
        ));
        parts.push(format!("content={}", &self.content));
        parts.push(format!(
            "tags={}",
            match serde_json::to_string(&self.tags) {
                Ok(tags_val) => tags_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!("authorId={}", &self.author_id));
        parts.push(format!("author={}", Author.to_query_params_string()));
        parts.push(format!("createdAt={}", &self.created_at.to_rfc3339()));
        parts.push(format!("updatedAt={}", &self.updated_at.to_rfc3339()));
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct PostListParams {
    pub limit: i8,
    pub r#type: Option<serde_json::Value>,
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
                let limit = match val {
                    Some(serde_json::Value::number(limit_val)) => {
                        limit_val.as_i64().try_into::<i8>().unwrap_or(0)
                    }
                    _ => 0,
                };
                let r#type = match val.get("type") {
                    Some(serde_json::Value(r#type_val)) => match r#type_val {
                        Some(serde_json::Value(r#type_val)) => Some(r#type_val),
                        _ => None,
                    },
                    _ => None,
                };
                Self { limit, r#type }
            }
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
        output.push_str("\"limit\":");
        output.push_str(limit_val.to_string().as_str());
        match &self.r#type {
            Some(r#type_val) => {
                output.push_str(",\"type\":");
                output.push_str(
                    match r#type_val.get("type") {
                        Some(r#type_val) => match serde_json::to_string(r#type_val) {
                            Ok(r#type_val_result) => r#type_val_result,
                            _ => "".to_string(),
                        },
                        _ => "".to_string(),
                    }
                    .as_str(),
                );
            }
            _ => {}
        };
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("limit={}", limit_val.to_string(),));
        match &self.r#type {
            Some(r#type_val) => {
                parts.push(format!(
                    "type={}",
                    match serde_json::to_string(r#type_val) {
                        Ok(r#type_val) => r#type_val,
                        _ => "".to_string(),
                    }
                ));
            }
            _ => {}
        };
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct PostListResponse {
    pub total: serde_json::Value,
    pub items: serde_json::Value,
}

impl ArriModel for PostListResponse {
    fn new() -> Self {
        Self {
            total: serde_json::Value::Null,
            items: serde_json::Value::Null,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let total = match val {
                    Some(serde_json::Value(total_val)) => total_val,
                    _ => serde_json::Value::Null,
                };
                let items = match val {
                    Some(serde_json::Value(items_val)) => items_val,
                    _ => serde_json::Value::Null,
                };
                Self { total, items }
            }
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
        output.push_str("\"total\":");
        output.push_str(
            match &self.total.get("total") {
                Some(total_val) => match serde_json::to_string(total_val) {
                    Ok(total_val_result) => total_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"items\":");
        output.push_str(
            match &self.items.get("items") {
                Some(items_val) => match serde_json::to_string(items_val) {
                    Ok(items_val_result) => items_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!(
            "total={}",
            match serde_json::to_string(&self.total) {
                Ok(total_val) => total_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "items={}",
            match serde_json::to_string(&self.items) {
                Ok(items_val) => items_val,
                _ => "".to_string(),
            }
        ));
        parts.join("&")
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
                    Some(serde_json::Value::Bool(success_val)) => success_val,
                    _ => false,
                };
                let message = match val.get("message") {
                    Some(serde_json::Value::String(message_val)) => message_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { success, message }
            }
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
        output.push_str("\"success\":");
        output.push_str(&self.success.to_string().as_str());
        output.push_str(",\"message\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.message.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("success={}", &self.success));
        parts.push(format!("message={}", &self.message));
        parts.join("&")
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
                let data = match val {
                    Some(serde_json::Value(data_val)) => UpdatePostParamsData.from_json(data_val),
                    _ => UpdatePostParamsData::new(),
                };
                Self { post_id, data }
            }
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
        output.push_str("\"postId\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.post_id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push_str(",\"data\":");
        output.push_str(data.to_json_string().as_str());
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("postId={}", &self.post_id));
        parts.push(format!(
            "data={}",
            UpdatePostParamsData.to_query_params_string()
        ));
        parts.join("&")
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
        output.push_str("\"id\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push_str(",\"version\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.version.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("id={}", &self.id));
        parts.push(format!("version={}", &self.version));
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct Annotation {
    pub annotation_id: AnnotationId,
    pub associated_id: AssociatedId,
    pub annotation_type: serde_json::Value,
    pub annotation_type_version: serde_json::Value,
    pub metadata: serde_json::Value,
    pub box_type_range: AnnotationBoxTypeRange,
}

impl ArriModel for Annotation {
    fn new() -> Self {
        Self {
            annotation_id: AnnotationId::new(),
            associated_id: AssociatedId::new(),
            annotation_type: serde_json::Value::Null,
            annotation_type_version: serde_json::Value::Null,
            metadata: serde_json::Value::Null,
            box_type_range: AnnotationBoxTypeRange::new(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let annotation_id = match val {
                    Some(serde_json::Value(annotation_id_val)) => {
                        AnnotationId.from_json(annotation_id_val)
                    }
                    _ => AnnotationId::new(),
                };
                let associated_id = match val {
                    Some(serde_json::Value(associated_id_val)) => {
                        AssociatedId.from_json(associated_id_val)
                    }
                    _ => AssociatedId::new(),
                };
                let annotation_type = match val {
                    Some(serde_json::Value(annotation_type_val)) => annotation_type_val,
                    _ => serde_json::Value::Null,
                };
                let annotation_type_version = match val {
                    Some(serde_json::Value(annotation_type_version_val)) => {
                        annotation_type_version_val
                    }
                    _ => serde_json::Value::Null,
                };
                let metadata = match val {
                    Some(serde_json::Value(metadata_val)) => metadata_val,
                    _ => serde_json::Value::Null,
                };
                let box_type_range = match val {
                    Some(serde_json::Value(box_type_range_val)) => {
                        AnnotationBoxTypeRange.from_json(box_type_range_val)
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
        output.push_str("\"annotation_id\":");
        output.push_str(annotation_id.to_json_string().as_str());
        output.push_str(",\"associated_id\":");
        output.push_str(associated_id.to_json_string().as_str());
        output.push_str(",\"annotation_type\":");
        output.push_str(
            match &self.annotation_type.get("annotation_type") {
                Some(annotation_type_val) => match serde_json::to_string(annotation_type_val) {
                    Ok(annotation_type_val_result) => annotation_type_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"annotation_type_version\":");
        output.push_str(
            match &self.annotation_type_version.get("annotation_type_version") {
                Some(annotation_type_version_val) => {
                    match serde_json::to_string(annotation_type_version_val) {
                        Ok(annotation_type_version_val_result) => {
                            annotation_type_version_val_result
                        }
                        _ => "".to_string(),
                    }
                }
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"metadata\":");
        output.push_str(
            match &self.metadata.get("metadata") {
                Some(metadata_val) => match serde_json::to_string(metadata_val) {
                    Ok(metadata_val_result) => metadata_val_result,
                    _ => "".to_string(),
                },
                _ => "".to_string(),
            }
            .as_str(),
        );
        output.push_str(",\"box_type_range\":");
        output.push_str(box_type_range.to_json_string().as_str());
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!(
            "annotation_id={}",
            AnnotationId.to_query_params_string()
        ));
        parts.push(format!(
            "associated_id={}",
            AssociatedId.to_query_params_string()
        ));
        parts.push(format!(
            "annotation_type={}",
            match serde_json::to_string(&self.annotation_type) {
                Ok(annotation_type_val) => annotation_type_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "annotation_type_version={}",
            match serde_json::to_string(&self.annotation_type_version) {
                Ok(annotation_type_version_val) => annotation_type_version_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "metadata={}",
            match serde_json::to_string(&self.metadata) {
                Ok(metadata_val) => metadata_val,
                _ => "".to_string(),
            }
        ));
        parts.push(format!(
            "box_type_range={}",
            AnnotationBoxTypeRange.to_query_params_string()
        ));
        parts.join("&")
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
                let data = match val {
                    Some(serde_json::Value(data_val)) => UpdateAnnotationData.from_json(data_val),
                    _ => UpdateAnnotationData::new(),
                };
                Self {
                    annotation_id,
                    annotation_id_version,
                    data,
                }
            }
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
        output.push_str("\"annotation_id\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self
                    .annotation_id
                    .replace("\n", "\\n")
                    .replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push_str(",\"annotation_id_version\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self
                    .annotation_id_version
                    .replace("\n", "\\n")
                    .replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push_str(",\"data\":");
        output.push_str(data.to_json_string().as_str());
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("annotation_id={}", &self.annotation_id));
        parts.push(format!(
            "annotation_id_version={}",
            &self.annotation_id_version
        ));
        parts.push(format!(
            "data={}",
            UpdateAnnotationData.to_query_params_string()
        ));
        parts.join("&")
    }
}
