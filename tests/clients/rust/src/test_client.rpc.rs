#![allow(dead_code)]
use arri_client::{
    async_trait::async_trait,
    chrono::{DateTime, FixedOffset},
    parsed_arri_request,
    reqwest::Method,
    serde_json::{self},
    ArriClientConfig, ArriError, ArriModel, ArriParsedRequestOptions, ArriService, EmptyArriModel,
};
use std::{collections::HashMap, str::FromStr};

#[derive(Debug, PartialEq, Clone)]
pub struct TestsAdaptersManuallyAddedModel {
    pub hello: String,
}

impl ArriModel for TestsAdaptersManuallyAddedModel {
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
pub struct DefaultPayload {
    pub message: String,
}

impl ArriModel for DefaultPayload {
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
pub struct TypeBoxObject {
    pub string: String,
    pub boolean: bool,
    pub integer: i32,
    pub number: f64,
    pub enum_field: TypeBoxObjectEnumField,
    pub object: TypeBoxObjectObject,
    pub array: Vec<bool>,
    pub optional_string: Option<String>,
}

impl ArriModel for TypeBoxObject {
    fn new() -> Self {
        Self {
            string: "".to_string(),
            boolean: false,
            integer: 0,
            number: 0.0,
            enum_field: TypeBoxObjectEnumField::A,
            object: TypeBoxObjectObject::new(),
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
                        TypeBoxObjectEnumField::from_json(enum_field_val.to_owned())
                    }
                    _ => TypeBoxObjectEnumField::A,
                };
                let object = match val.get("object") {
                    Some(object_val) => TypeBoxObjectObject::from_json(object_val.to_owned()),
                    _ => TypeBoxObjectObject::new(),
                };
                let array = match val.get("array") {
                    Some(serde_json::Value::Array(array_val)) => {
                        let mut array_val_result: Vec<bool> = Vec::new();
                        for array_val_item in array_val {
                            array_val_result.push(match array_val_item {
                                serde_json::Value::Bool(array_val_item_val) => {
                                    array_val_item_val.to_owned()
                                }
                                _ => false,
                            });
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
        array_output.push(']');
        _query_parts_.push(array_output);
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
pub enum TypeBoxObjectEnumField {
    A,
    B,
    C,
}

impl ArriModel for TypeBoxObjectEnumField {
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
pub struct TypeBoxObjectObject {
    pub string: String,
}

impl ArriModel for TypeBoxObjectObject {
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
    pub record: HashMap<String, bool>,
    pub discriminator: ObjectWithEveryTypeDiscriminator,
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
            record: HashMap::new(),
            discriminator: ObjectWithEveryTypeDiscriminator::new(),
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
                            array_val_result.push(match array_val_item {
                                serde_json::Value::Bool(array_val_item_val) => {
                                    array_val_item_val.to_owned()
                                }
                                _ => false,
                            });
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
                    Some(serde_json::Value::Object(record_val)) => {
                        let mut record_result: HashMap<String, bool> = HashMap::new();
                        for (record_key, record_key_val) in record_val {
                            record_result.insert(
                                record_key.to_owned(),
                                match record_key_val {
                                    serde_json::Value::Bool(record_key_val_val) => {
                                        record_key_val_val.to_owned()
                                    }
                                    _ => false,
                                },
                            );
                        }
                        record_result
                    }
                    _ => HashMap::new(),
                };
                let discriminator = match val.get("discriminator") {
                    Some(discriminator_val) => {
                        ObjectWithEveryTypeDiscriminator::from_json(discriminator_val.to_owned())
                    }
                    _ => ObjectWithEveryTypeDiscriminator::new(),
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
                            nested_array_val_result.push(match nested_array_val_item {
                                serde_json::Value::Array(nested_array_val_item_val) => {
                                    let mut nested_array_val_item_val_result: Vec<
                                        ObjectWithEveryType_i_,
                                    > = Vec::new();
                                    for nested_array_val_item_val_item in nested_array_val_item_val
                                    {
                                        nested_array_val_item_val_result.push(
                                            ObjectWithEveryType_i_::from_json(
                                                nested_array_val_item_val_item.to_owned(),
                                            ),
                                        );
                                    }
                                    nested_array_val_item_val_result
                                }
                                _ => Vec::new(),
                            });
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
        _json_output_.push('{');
        let mut record_index = 0;
        for (record_key, record_val) in &self.record {
            if record_index != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(format!("\"{}\":", record_key).as_str());
            _json_output_.push_str(record_val.to_string().as_str());
            record_index += 1;
        }
        _json_output_.push('}');
        _json_output_.push_str(",\"discriminator\":");
        _json_output_.push_str(&self.discriminator.to_json_string().as_str());
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
        array_output.push(']');
        _query_parts_.push(array_output);
        _query_parts_.push(format!("object={}", &self.object.to_query_params_string()));
        println!("Error at ObjectWithEveryType/record. Nested objects cannot be serialized to query params.");
        _query_parts_.push(format!(
            "discriminator={}",
            &self.discriminator.to_query_params_string()
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
        nested_array_output.push(']');
        _query_parts_.push(nested_array_output);
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
enum ObjectWithEveryTypeDiscriminator {
    A { title: String },
    B { title: String, description: String },
}

impl ArriModel for ObjectWithEveryTypeDiscriminator {
    fn new() -> Self {
        Self::A {
            title: "".to_string(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => match val.get("type") {
                Some(serde_json::Value::String(r#type_val)) => match r#type_val.as_str() {
                    "A" => {
                        let title = match val.get("title") {
                            Some(serde_json::Value::String(title_val)) => title_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::A { title }
                    }
                    "B" => {
                        let title = match val.get("title") {
                            Some(serde_json::Value::String(title_val)) => title_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let description = match val.get("description") {
                            Some(serde_json::Value::String(description_val)) => {
                                description_val.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        Self::B { title, description }
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
            Self::A { title } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"type\":\"A\"");
                _json_output_.push_str(",\"title\":");
                _json_output_.push_str(
                    format!("\"{}\"", title.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
                _json_output_.push('}');
                _json_output_
            }
            Self::B { title, description } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"type\":\"B\"");
                _json_output_.push_str(",\"title\":");
                _json_output_.push_str(
                    format!("\"{}\"", title.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
                _json_output_.push_str(",\"description\":");
                _json_output_.push_str(
                    format!(
                        "\"{}\"",
                        description.replace("\n", "\\n").replace("\"", "\\\"")
                    )
                    .as_str(),
                );
                _json_output_.push('}');
                _json_output_
            }
        }
    }

    fn to_query_params_string(&self) -> String {
        match &self {
            Self::A { title } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=A".to_string());
                _query_parts_.push(format!("title={}", title));
                _query_parts_.join("&")
            }
            Self::B { title, description } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=B".to_string());
                _query_parts_.push(format!("title={}", title));
                _query_parts_.push(format!("description={}", description));
                _query_parts_.join("&")
            }
        }
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
    pub record: Option<HashMap<String, Option<bool>>>,
    pub discriminator: Option<ObjectWithEveryNullableTypeDiscriminator>,
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
                            array_val_result.push(match array_val_item {
                                serde_json::Value::Bool(array_val_item_val) => {
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
                    Some(serde_json::Value::Object(record_val)) => {
                        let mut record_result: HashMap<String, Option<bool>> = HashMap::new();
                        for (record_key, record_key_val) in record_val {
                            record_result.insert(
                                record_key.to_owned(),
                                match record_key_val {
                                    serde_json::Value::Bool(record_key_val_val) => {
                                        Some(record_key_val_val.to_owned())
                                    }
                                    _ => None,
                                },
                            );
                        }
                        Some(record_result)
                    }
                    _ => None,
                };
                let discriminator = match val.get("discriminator") {
                    Some(discriminator_val) => match discriminator_val {
                        serde_json::Value::Object(_) => {
                            Some(ObjectWithEveryNullableTypeDiscriminator::from_json(
                                discriminator_val.to_owned(),
                            ))
                        }
                        _ => None,
                    },
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
                            nested_array_val_result.push(match nested_array_val_item {
                                Some(serde_json::Value::Array(nested_array_val_item_val)) => {
                                    let mut nested_array_val_item_val_result: Vec<
                                        Option<ObjectWithEveryNullableType_i_>,
                                    > = Vec::new();
                                    for nested_array_val_item_val_item in nested_array_val_item_val
                                    {
                                        nested_array_val_item_val_result
                                            .push(match nested_array_val_item_val_item {
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
            Some(record_val) => {
                _json_output_.push('{');
                let mut record_val_index = 0;
                for (record_val_key, record_val_val) in record_val {
                    if record_val_index != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(format!("\"{}\":", record_val_key).as_str());
                    match record_val_val {
                        Some(record_val) => _json_output_.push_str(record_val.to_string().as_str()),
                        _ => _json_output_.push_str("null"),
                    };
                    record_val_index += 1;
                }
                _json_output_.push('}');
            }
            _ => _json_output_.push_str("null"),
        };
        _json_output_.push_str(",\"discriminator\":");
        match &self.discriminator {
            Some(discriminator_val) => {
                _json_output_.push_str(discriminator_val.to_json_string().as_str())
            }
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
                array_val_output.push(']');
                _query_parts_.push(array_val_output);
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
        println!("Error at ObjectWithEveryNullableType/record. Nested objects cannot be serialized to query params.");
        _query_parts_.push(format!(
            "discriminator={}",
            match &self.discriminator {
                Some(discriminator_val) => discriminator_val.to_query_params_string(),
                _ => "null".to_string(),
            }
        ));
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
                nested_array_val_output.push(']');
                _query_parts_.push(nested_array_val_output);
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
enum ObjectWithEveryNullableTypeDiscriminator {
    A {
        title: Option<String>,
    },
    B {
        title: Option<String>,
        description: Option<String>,
    },
}

impl ArriModel for ObjectWithEveryNullableTypeDiscriminator {
    fn new() -> Self {
        Self::A { title: None }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => match val.get("type") {
                Some(serde_json::Value::String(r#type_val)) => match r#type_val.as_str() {
                    "A" => {
                        let title = match val.get("title") {
                            Some(serde_json::Value::String(title_val)) => {
                                Some(title_val.to_owned())
                            }
                            _ => None,
                        };
                        Self::A { title }
                    }
                    "B" => {
                        let title = match val.get("title") {
                            Some(serde_json::Value::String(title_val)) => {
                                Some(title_val.to_owned())
                            }
                            _ => None,
                        };
                        let description = match val.get("description") {
                            Some(serde_json::Value::String(description_val)) => {
                                Some(description_val.to_owned())
                            }
                            _ => None,
                        };
                        Self::B { title, description }
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
            Self::A { title } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"type\":\"A\"");
                _json_output_.push_str(",\"title\":");
                match title {
                    Some(title_val) => _json_output_.push_str(
                        format!(
                            "\"{}\"",
                            title_val.replace("\n", "\\n").replace("\"", "\\\"")
                        )
                        .as_str(),
                    ),
                    _ => _json_output_.push_str("null"),
                };
                _json_output_.push('}');
                _json_output_
            }
            Self::B { title, description } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"type\":\"B\"");
                _json_output_.push_str(",\"title\":");
                match title {
                    Some(title_val) => _json_output_.push_str(
                        format!(
                            "\"{}\"",
                            title_val.replace("\n", "\\n").replace("\"", "\\\"")
                        )
                        .as_str(),
                    ),
                    _ => _json_output_.push_str("null"),
                };
                _json_output_.push_str(",\"description\":");
                match description {
                    Some(description_val) => _json_output_.push_str(
                        format!(
                            "\"{}\"",
                            description_val.replace("\n", "\\n").replace("\"", "\\\"")
                        )
                        .as_str(),
                    ),
                    _ => _json_output_.push_str("null"),
                };
                _json_output_.push('}');
                _json_output_
            }
        }
    }

    fn to_query_params_string(&self) -> String {
        match &self {
            Self::A { title } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=A".to_string());
                match title {
                    Some(title_val) => _query_parts_.push(format!("title={}", title_val)),
                    _ => _query_parts_.push("title=null".to_string()),
                };
                _query_parts_.join("&")
            }
            Self::B { title, description } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=B".to_string());
                match title {
                    Some(title_val) => _query_parts_.push(format!("title={}", title_val)),
                    _ => _query_parts_.push("title=null".to_string()),
                };
                match description {
                    Some(description_val) => {
                        _query_parts_.push(format!("description={}", description_val))
                    }
                    _ => _query_parts_.push("description=null".to_string()),
                };
                _query_parts_.join("&")
            }
        }
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
    pub record: Option<HashMap<String, bool>>,
    pub discriminator: Option<ObjectWithEveryOptionalTypeDiscriminator>,
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
                            array_val_result.push(match array_val_item {
                                serde_json::Value::Bool(array_val_item_val) => {
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
                    Some(serde_json::Value::Object(record_val)) => {
                        let mut record_result: HashMap<String, bool> = HashMap::new();
                        for (record_key, record_key_val) in record_val {
                            record_result.insert(
                                record_key.to_owned(),
                                match record_key_val {
                                    serde_json::Value::Bool(record_key_val_val) => {
                                        record_key_val_val.to_owned()
                                    }
                                    _ => false,
                                },
                            );
                        }
                        Some(record_result)
                    }
                    _ => None,
                };
                let discriminator = match val.get("discriminator") {
                    Some(discriminator_val) => match discriminator_val {
                        serde_json::Value::Object(_) => {
                            Some(ObjectWithEveryOptionalTypeDiscriminator::from_json(
                                discriminator_val.to_owned(),
                            ))
                        }
                        _ => None,
                    },
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
                            nested_array_val_result.push(match nested_array_val_item {
                                serde_json::Value::Array(nested_array_val_item_val) => {
                                    let mut nested_array_val_item_val_result: Vec<
                                        ObjectWithEveryOptionalType_i_,
                                    > = Vec::new();
                                    for nested_array_val_item_val_item in nested_array_val_item_val
                                    {
                                        nested_array_val_item_val_result.push(
                                            ObjectWithEveryOptionalType_i_::from_json(
                                                nested_array_val_item_val_item.to_owned(),
                                            ),
                                        );
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
                _json_output_.push('{');
                let mut record_index = 0;
                for (record_key, record_val) in record_val {
                    if record_index != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(format!("\"{}\":", record_key).as_str());
                    _json_output_.push_str(record_val.to_string().as_str());
                    record_index += 1;
                }
                _json_output_.push('}');
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
                _json_output_.push_str(discriminator_val.to_json_string().as_str());
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
                array_val_output.push(']');
                _query_parts_.push(array_val_output);
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
                println!("Error at ObjectWithEveryOptionalType/record. Nested objects cannot be serialized to query params.");
            }
            _ => {}
        };
        match &self.discriminator {
            Some(discriminator_val) => {
                _query_parts_.push(format!(
                    "discriminator={}",
                    discriminator_val.to_query_params_string()
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
                nested_array_val_output.push(']');
                _query_parts_.push(nested_array_val_output);
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
enum ObjectWithEveryOptionalTypeDiscriminator {
    A { title: String },
    B { title: String, description: String },
}

impl ArriModel for ObjectWithEveryOptionalTypeDiscriminator {
    fn new() -> Self {
        Self::A {
            title: "".to_string(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => match val.get("type") {
                Some(serde_json::Value::String(r#type_val)) => match r#type_val.as_str() {
                    "A" => {
                        let title = match val.get("title") {
                            Some(serde_json::Value::String(title_val)) => title_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::A { title }
                    }
                    "B" => {
                        let title = match val.get("title") {
                            Some(serde_json::Value::String(title_val)) => title_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let description = match val.get("description") {
                            Some(serde_json::Value::String(description_val)) => {
                                description_val.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        Self::B { title, description }
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
            Self::A { title } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"type\":\"A\"");
                _json_output_.push_str(",\"title\":");
                _json_output_.push_str(
                    format!("\"{}\"", title.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
                _json_output_.push('}');
                _json_output_
            }
            Self::B { title, description } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"type\":\"B\"");
                _json_output_.push_str(",\"title\":");
                _json_output_.push_str(
                    format!("\"{}\"", title.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
                _json_output_.push_str(",\"description\":");
                _json_output_.push_str(
                    format!(
                        "\"{}\"",
                        description.replace("\n", "\\n").replace("\"", "\\\"")
                    )
                    .as_str(),
                );
                _json_output_.push('}');
                _json_output_
            }
        }
    }

    fn to_query_params_string(&self) -> String {
        match &self {
            Self::A { title } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=A".to_string());
                _query_parts_.push(format!("title={}", title));
                _query_parts_.join("&")
            }
            Self::B { title, description } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=B".to_string());
                _query_parts_.push(format!("title={}", title));
                _query_parts_.push(format!("description={}", description));
                _query_parts_.join("&")
            }
        }
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
pub struct RecursiveObject {
    pub left: Option<Box<RecursiveObject>>,
    pub right: Option<Box<RecursiveObject>>,
    pub value: String,
}

impl ArriModel for RecursiveObject {
    fn new() -> Self {
        Self {
            left: None,
            right: None,
            value: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let left = match val.get("left") {
                    Some(left_val) => {
                        Some(Box::new(RecursiveObject::from_json(left_val.to_owned())))
                    }
                    _ => None,
                };
                let right = match val.get("right") {
                    Some(right_val) => {
                        Some(Box::new(RecursiveObject::from_json(right_val.to_owned())))
                    }
                    _ => None,
                };
                let value = match val.get("value") {
                    Some(serde_json::Value::String(value_val)) => value_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { left, right, value }
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
        _json_output_.push_str(",\"value\":");
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.value.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
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
        _query_parts_.push(format!("value={}", &self.value));
        _query_parts_.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
enum RecursiveUnion {
    Child { data: Box<RecursiveUnion> },
    Children { data: Vec<Box<RecursiveUnion>> },
    Text { data: String },
    Shape { data: RecursiveUnionShapeData },
}

impl ArriModel for RecursiveUnion {
    fn new() -> Self {
        Self::Child {
            data: Box::new(RecursiveUnion::new()),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => match val.get("type") {
                Some(serde_json::Value::String(r#type_val)) => match r#type_val.as_str() {
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
            Self::Child { data } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"type\":\"CHILD\"");
                _json_output_.push_str(",\"data\":");
                _json_output_.push_str(data.to_json_string().as_str());
                _json_output_.push('}');
                _json_output_
            }
            Self::Children { data } => {
                let mut _json_output_ = "{".to_string();
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
                _json_output_.push('}');
                _json_output_
            }
            Self::Text { data } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"type\":\"TEXT\"");
                _json_output_.push_str(",\"data\":");
                _json_output_.push_str(
                    format!("\"{}\"", data.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
                _json_output_.push('}');
                _json_output_
            }
            Self::Shape { data } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"type\":\"SHAPE\"");
                _json_output_.push_str(",\"data\":");
                _json_output_.push_str(data.to_json_string().as_str());
                _json_output_.push('}');
                _json_output_
            }
        }
    }

    fn to_query_params_string(&self) -> String {
        match &self {
            Self::Child { data } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=CHILD".to_string());
                _query_parts_.push(format!("data={}", data.to_query_params_string()));
                _query_parts_.join("&")
            }
            Self::Children { data } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=CHILDREN".to_string());
                let mut data_output = "data=[".to_string();
                let mut data_index = 0;
                for data_item in data {
                    if data_index != 0 {
                        data_output.push(',');
                    }
                    data_output.push_str(data_item.to_json_string().as_str());
                    data_index += 1;
                }
                data_output.push(']');
                _query_parts_.push(data_output);
                _query_parts_.join("&")
            }
            Self::Text { data } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=TEXT".to_string());
                _query_parts_.push(format!("data={}", data));
                _query_parts_.join("&")
            }
            Self::Shape { data } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=SHAPE".to_string());
                _query_parts_.push(format!("data={}", data.to_query_params_string()));
                _query_parts_.join("&")
            }
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct RecursiveUnionShapeData {
    pub width: f64,
    pub height: f64,
    pub color: String,
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
                    Some(serde_json::Value::Number(width_val)) => width_val.as_f64().unwrap_or(0.0),
                    _ => 0.0,
                };
                let height = match val.get("height") {
                    Some(serde_json::Value::Number(height_val)) => {
                        height_val.as_f64().unwrap_or(0.0)
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
        _json_output_.push_str(
            format!(
                "\"{}\"",
                &self.color.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
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
                            numbers_val_result.push(match numbers_val_item {
                                serde_json::Value::Number(numbers_val_item_val) => {
                                    numbers_val_item_val.as_f64().unwrap_or(0.0)
                                }
                                _ => 0.0,
                            });
                        }
                        numbers_val_result
                    }
                    _ => Vec::new(),
                };
                let objects = match val.get("objects") {
                    Some(serde_json::Value::Array(objects_val)) => {
                        let mut objects_val_result: Vec<StreamLargeObjectsResponse_i_> = Vec::new();
                        for objects_val_item in objects_val {
                            objects_val_result.push(StreamLargeObjectsResponse_i_::from_json(
                                objects_val_item.to_owned(),
                            ));
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
        numbers_output.push(']');
        _query_parts_.push(numbers_output);
        let mut objects_output = "objects=[".to_string();
        let mut objects_index = 0;
        for objects_item in &self.objects {
            if objects_index != 0 {
                objects_output.push(',');
            }
            objects_output.push_str(objects_item.to_json_string().as_str());
            objects_index += 1;
        }
        objects_output.push(']');
        _query_parts_.push(objects_output);
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
enum ChatMessage {
    Text {
        id: String,
        channel_id: String,
        user_id: String,
        date: DateTime<FixedOffset>,
        text: String,
    },
    Image {
        id: String,
        channel_id: String,
        user_id: String,
        date: DateTime<FixedOffset>,
        image: String,
    },
    Url {
        id: String,
        channel_id: String,
        user_id: String,
        date: DateTime<FixedOffset>,
        url: String,
    },
}

impl ArriModel for ChatMessage {
    fn new() -> Self {
        Self::Text {
            id: "".to_string(),
            channel_id: "".to_string(),
            user_id: "".to_string(),
            date: DateTime::default(),
            text: "".to_string(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => match val.get("messageType") {
                Some(serde_json::Value::String(message_type_val)) => {
                    match message_type_val.as_str() {
                        "TEXT" => {
                            let id = match val.get("id") {
                                Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                                _ => "".to_string(),
                            };
                            let channel_id = match val.get("channelId") {
                                Some(serde_json::Value::String(channel_id_val)) => {
                                    channel_id_val.to_owned()
                                }
                                _ => "".to_string(),
                            };
                            let user_id = match val.get("userId") {
                                Some(serde_json::Value::String(user_id_val)) => {
                                    user_id_val.to_owned()
                                }
                                _ => "".to_string(),
                            };
                            let date = match val.get("date") {
                                Some(serde_json::Value::String(date_val)) => {
                                    DateTime::<FixedOffset>::parse_from_rfc3339(date_val)
                                        .unwrap_or(DateTime::default())
                                }
                                _ => DateTime::default(),
                            };
                            let text = match val.get("text") {
                                Some(serde_json::Value::String(text_val)) => text_val.to_owned(),
                                _ => "".to_string(),
                            };
                            Self::Text {
                                id,
                                channel_id,
                                user_id,
                                date,
                                text,
                            }
                        }
                        "IMAGE" => {
                            let id = match val.get("id") {
                                Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                                _ => "".to_string(),
                            };
                            let channel_id = match val.get("channelId") {
                                Some(serde_json::Value::String(channel_id_val)) => {
                                    channel_id_val.to_owned()
                                }
                                _ => "".to_string(),
                            };
                            let user_id = match val.get("userId") {
                                Some(serde_json::Value::String(user_id_val)) => {
                                    user_id_val.to_owned()
                                }
                                _ => "".to_string(),
                            };
                            let date = match val.get("date") {
                                Some(serde_json::Value::String(date_val)) => {
                                    DateTime::<FixedOffset>::parse_from_rfc3339(date_val)
                                        .unwrap_or(DateTime::default())
                                }
                                _ => DateTime::default(),
                            };
                            let image = match val.get("image") {
                                Some(serde_json::Value::String(image_val)) => image_val.to_owned(),
                                _ => "".to_string(),
                            };
                            Self::Image {
                                id,
                                channel_id,
                                user_id,
                                date,
                                image,
                            }
                        }
                        "URL" => {
                            let id = match val.get("id") {
                                Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                                _ => "".to_string(),
                            };
                            let channel_id = match val.get("channelId") {
                                Some(serde_json::Value::String(channel_id_val)) => {
                                    channel_id_val.to_owned()
                                }
                                _ => "".to_string(),
                            };
                            let user_id = match val.get("userId") {
                                Some(serde_json::Value::String(user_id_val)) => {
                                    user_id_val.to_owned()
                                }
                                _ => "".to_string(),
                            };
                            let date = match val.get("date") {
                                Some(serde_json::Value::String(date_val)) => {
                                    DateTime::<FixedOffset>::parse_from_rfc3339(date_val)
                                        .unwrap_or(DateTime::default())
                                }
                                _ => DateTime::default(),
                            };
                            let url = match val.get("url") {
                                Some(serde_json::Value::String(url_val)) => url_val.to_owned(),
                                _ => "".to_string(),
                            };
                            Self::Url {
                                id,
                                channel_id,
                                user_id,
                                date,
                                url,
                            }
                        }
                        _ => Self::new(),
                    }
                }
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
            Self::Text {
                id,
                channel_id,
                user_id,
                date,
                text,
            } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"messageType\":\"TEXT\"");
                _json_output_.push_str(",\"id\":");
                _json_output_.push_str(
                    format!("\"{}\"", id.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
                _json_output_.push_str(",\"channelId\":");
                _json_output_.push_str(
                    format!(
                        "\"{}\"",
                        channel_id.replace("\n", "\\n").replace("\"", "\\\"")
                    )
                    .as_str(),
                );
                _json_output_.push_str(",\"userId\":");
                _json_output_.push_str(
                    format!("\"{}\"", user_id.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
                _json_output_.push_str(",\"date\":");
                _json_output_.push_str(format!("\"{}\"", date.to_rfc3339()).as_str());
                _json_output_.push_str(",\"text\":");
                _json_output_.push_str(
                    format!("\"{}\"", text.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
                _json_output_.push('}');
                _json_output_
            }
            Self::Image {
                id,
                channel_id,
                user_id,
                date,
                image,
            } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"messageType\":\"IMAGE\"");
                _json_output_.push_str(",\"id\":");
                _json_output_.push_str(
                    format!("\"{}\"", id.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
                _json_output_.push_str(",\"channelId\":");
                _json_output_.push_str(
                    format!(
                        "\"{}\"",
                        channel_id.replace("\n", "\\n").replace("\"", "\\\"")
                    )
                    .as_str(),
                );
                _json_output_.push_str(",\"userId\":");
                _json_output_.push_str(
                    format!("\"{}\"", user_id.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
                _json_output_.push_str(",\"date\":");
                _json_output_.push_str(format!("\"{}\"", date.to_rfc3339()).as_str());
                _json_output_.push_str(",\"image\":");
                _json_output_.push_str(
                    format!("\"{}\"", image.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
                _json_output_.push('}');
                _json_output_
            }
            Self::Url {
                id,
                channel_id,
                user_id,
                date,
                url,
            } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"messageType\":\"URL\"");
                _json_output_.push_str(",\"id\":");
                _json_output_.push_str(
                    format!("\"{}\"", id.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
                _json_output_.push_str(",\"channelId\":");
                _json_output_.push_str(
                    format!(
                        "\"{}\"",
                        channel_id.replace("\n", "\\n").replace("\"", "\\\"")
                    )
                    .as_str(),
                );
                _json_output_.push_str(",\"userId\":");
                _json_output_.push_str(
                    format!("\"{}\"", user_id.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
                _json_output_.push_str(",\"date\":");
                _json_output_.push_str(format!("\"{}\"", date.to_rfc3339()).as_str());
                _json_output_.push_str(",\"url\":");
                _json_output_.push_str(
                    format!("\"{}\"", url.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
                _json_output_.push('}');
                _json_output_
            }
        }
    }

    fn to_query_params_string(&self) -> String {
        match &self {
            Self::Text {
                id,
                channel_id,
                user_id,
                date,
                text,
            } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("messageType=TEXT".to_string());
                _query_parts_.push(format!("id={}", id));
                _query_parts_.push(format!("channelId={}", channel_id));
                _query_parts_.push(format!("userId={}", user_id));
                _query_parts_.push(format!("date={}", date.to_rfc3339()));
                _query_parts_.push(format!("text={}", text));
                _query_parts_.join("&")
            }
            Self::Image {
                id,
                channel_id,
                user_id,
                date,
                image,
            } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("messageType=IMAGE".to_string());
                _query_parts_.push(format!("id={}", id));
                _query_parts_.push(format!("channelId={}", channel_id));
                _query_parts_.push(format!("userId={}", user_id));
                _query_parts_.push(format!("date={}", date.to_rfc3339()));
                _query_parts_.push(format!("image={}", image));
                _query_parts_.join("&")
            }
            Self::Url {
                id,
                channel_id,
                user_id,
                date,
                url,
            } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("messageType=URL".to_string());
                _query_parts_.push(format!("id={}", id));
                _query_parts_.push(format!("channelId={}", channel_id));
                _query_parts_.push(format!("userId={}", user_id));
                _query_parts_.push(format!("date={}", date.to_rfc3339()));
                _query_parts_.push(format!("url={}", url));
                _query_parts_.join("&")
            }
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct TestsAdaptersTestsStreamRetryWithNewCredentialsResponse {
    pub message: String,
}

impl ArriModel for TestsAdaptersTestsStreamRetryWithNewCredentialsResponse {
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
enum WsMessageParams {
    CreateEntity { entity_id: String, x: f64, y: f64 },
    UpdateEntity { entity_id: String, x: f64, y: f64 },
    Disconnect { reason: String },
}

impl ArriModel for WsMessageParams {
    fn new() -> Self {
        Self::CreateEntity {
            entity_id: "".to_string(),
            x: 0.0,
            y: 0.0,
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => match val.get("type") {
                Some(serde_json::Value::String(r#type_val)) => match r#type_val.as_str() {
                    "CREATE_ENTITY" => {
                        let entity_id = match val.get("entityId") {
                            Some(serde_json::Value::String(entity_id_val)) => {
                                entity_id_val.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        let x = match val.get("x") {
                            Some(serde_json::Value::Number(x_val)) => x_val.as_f64().unwrap_or(0.0),
                            _ => 0.0,
                        };
                        let y = match val.get("y") {
                            Some(serde_json::Value::Number(y_val)) => y_val.as_f64().unwrap_or(0.0),
                            _ => 0.0,
                        };
                        Self::CreateEntity { entity_id, x, y }
                    }
                    "UPDATE_ENTITY" => {
                        let entity_id = match val.get("entityId") {
                            Some(serde_json::Value::String(entity_id_val)) => {
                                entity_id_val.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        let x = match val.get("x") {
                            Some(serde_json::Value::Number(x_val)) => x_val.as_f64().unwrap_or(0.0),
                            _ => 0.0,
                        };
                        let y = match val.get("y") {
                            Some(serde_json::Value::Number(y_val)) => y_val.as_f64().unwrap_or(0.0),
                            _ => 0.0,
                        };
                        Self::UpdateEntity { entity_id, x, y }
                    }
                    "DISCONNECT" => {
                        let reason = match val.get("reason") {
                            Some(serde_json::Value::String(reason_val)) => reason_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::Disconnect { reason }
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
            Self::CreateEntity { entity_id, x, y } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"type\":\"CREATE_ENTITY\"");
                _json_output_.push_str(",\"entityId\":");
                _json_output_.push_str(
                    format!(
                        "\"{}\"",
                        entity_id.replace("\n", "\\n").replace("\"", "\\\"")
                    )
                    .as_str(),
                );
                _json_output_.push_str(",\"x\":");
                _json_output_.push_str(x.to_string().as_str());
                _json_output_.push_str(",\"y\":");
                _json_output_.push_str(y.to_string().as_str());
                _json_output_.push('}');
                _json_output_
            }
            Self::UpdateEntity { entity_id, x, y } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"type\":\"UPDATE_ENTITY\"");
                _json_output_.push_str(",\"entityId\":");
                _json_output_.push_str(
                    format!(
                        "\"{}\"",
                        entity_id.replace("\n", "\\n").replace("\"", "\\\"")
                    )
                    .as_str(),
                );
                _json_output_.push_str(",\"x\":");
                _json_output_.push_str(x.to_string().as_str());
                _json_output_.push_str(",\"y\":");
                _json_output_.push_str(y.to_string().as_str());
                _json_output_.push('}');
                _json_output_
            }
            Self::Disconnect { reason } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"type\":\"DISCONNECT\"");
                _json_output_.push_str(",\"reason\":");
                _json_output_.push_str(
                    format!("\"{}\"", reason.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
                _json_output_.push('}');
                _json_output_
            }
        }
    }

    fn to_query_params_string(&self) -> String {
        match &self {
            Self::CreateEntity { entity_id, x, y } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=CREATE_ENTITY".to_string());
                _query_parts_.push(format!("entityId={}", entity_id));
                _query_parts_.push(format!("x={}", x));
                _query_parts_.push(format!("y={}", y));
                _query_parts_.join("&")
            }
            Self::UpdateEntity { entity_id, x, y } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=UPDATE_ENTITY".to_string());
                _query_parts_.push(format!("entityId={}", entity_id));
                _query_parts_.push(format!("x={}", x));
                _query_parts_.push(format!("y={}", y));
                _query_parts_.join("&")
            }
            Self::Disconnect { reason } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=DISCONNECT".to_string());
                _query_parts_.push(format!("reason={}", reason));
                _query_parts_.join("&")
            }
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
enum WsMessageResponse {
    EntityCreated { entity_id: String, x: f64, y: f64 },
    EntityUpdated { entity_id: String, x: f64, y: f64 },
}

impl ArriModel for WsMessageResponse {
    fn new() -> Self {
        Self::EntityCreated {
            entity_id: "".to_string(),
            x: 0.0,
            y: 0.0,
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => match val.get("type") {
                Some(serde_json::Value::String(r#type_val)) => match r#type_val.as_str() {
                    "ENTITY_CREATED" => {
                        let entity_id = match val.get("entityId") {
                            Some(serde_json::Value::String(entity_id_val)) => {
                                entity_id_val.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        let x = match val.get("x") {
                            Some(serde_json::Value::Number(x_val)) => x_val.as_f64().unwrap_or(0.0),
                            _ => 0.0,
                        };
                        let y = match val.get("y") {
                            Some(serde_json::Value::Number(y_val)) => y_val.as_f64().unwrap_or(0.0),
                            _ => 0.0,
                        };
                        Self::EntityCreated { entity_id, x, y }
                    }
                    "ENTITY_UPDATED" => {
                        let entity_id = match val.get("entityId") {
                            Some(serde_json::Value::String(entity_id_val)) => {
                                entity_id_val.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        let x = match val.get("x") {
                            Some(serde_json::Value::Number(x_val)) => x_val.as_f64().unwrap_or(0.0),
                            _ => 0.0,
                        };
                        let y = match val.get("y") {
                            Some(serde_json::Value::Number(y_val)) => y_val.as_f64().unwrap_or(0.0),
                            _ => 0.0,
                        };
                        Self::EntityUpdated { entity_id, x, y }
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
            Self::EntityCreated { entity_id, x, y } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"type\":\"ENTITY_CREATED\"");
                _json_output_.push_str(",\"entityId\":");
                _json_output_.push_str(
                    format!(
                        "\"{}\"",
                        entity_id.replace("\n", "\\n").replace("\"", "\\\"")
                    )
                    .as_str(),
                );
                _json_output_.push_str(",\"x\":");
                _json_output_.push_str(x.to_string().as_str());
                _json_output_.push_str(",\"y\":");
                _json_output_.push_str(y.to_string().as_str());
                _json_output_.push('}');
                _json_output_
            }
            Self::EntityUpdated { entity_id, x, y } => {
                let mut _json_output_ = "{".to_string();
                _json_output_.push_str("\"type\":\"ENTITY_UPDATED\"");
                _json_output_.push_str(",\"entityId\":");
                _json_output_.push_str(
                    format!(
                        "\"{}\"",
                        entity_id.replace("\n", "\\n").replace("\"", "\\\"")
                    )
                    .as_str(),
                );
                _json_output_.push_str(",\"x\":");
                _json_output_.push_str(x.to_string().as_str());
                _json_output_.push_str(",\"y\":");
                _json_output_.push_str(y.to_string().as_str());
                _json_output_.push('}');
                _json_output_
            }
        }
    }

    fn to_query_params_string(&self) -> String {
        match &self {
            Self::EntityCreated { entity_id, x, y } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=ENTITY_CREATED".to_string());
                _query_parts_.push(format!("entityId={}", entity_id));
                _query_parts_.push(format!("x={}", x));
                _query_parts_.push(format!("y={}", y));
                _query_parts_.join("&")
            }
            Self::EntityUpdated { entity_id, x, y } => {
                let mut _query_parts_: Vec<String> = Vec::new();
                _query_parts_.push("type=ENTITY_UPDATED".to_string());
                _query_parts_.push(format!("entityId={}", entity_id));
                _query_parts_.push(format!("x={}", x));
                _query_parts_.push(format!("y={}", y));
                _query_parts_.join("&")
            }
        }
    }
}
