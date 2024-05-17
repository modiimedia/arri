use std::collections::BTreeMap;

use arri_client::{
    chrono::{DateTime, FixedOffset},
    serde_json::{self},
    utils::{serialize_date_time, serialize_string},
    ArriEnum, ArriModel,
};

#[derive(Clone, Debug, PartialEq)]
pub struct Book {
    pub id: String,
    pub name: String,
    pub created_at: DateTime<FixedOffset>,
    pub updated_at: DateTime<FixedOffset>,
}

impl ArriModel for Book {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            name: "".to_string(),
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
                return Self {
                    id,
                    name,
                    created_at,
                    updated_at,
                };
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
        _json_output_.push_str("\"id\":");
        _json_output_.push_str(serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"name\":");
        _json_output_.push_str(serialize_string(&self.name).as_str());
        _json_output_.push_str(",\"createdAt\":");
        _json_output_.push_str(serialize_date_time(&self.updated_at, true).as_str());
        _json_output_.push_str(",\"updatedAt\":");
        _json_output_.push_str(serialize_date_time(&self.updated_at, true).as_str());
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!("name={}", &self.name));
        _query_parts_.push(format!(
            "createdAt={}",
            serialize_date_time(&self.created_at, false)
        ));
        _query_parts_.push(format!(
            "updatedAt={}",
            serialize_date_time(&self.updated_at, false)
        ));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct BookParams {
    pub book_id: String,
}

impl ArriModel for BookParams {
    fn new() -> Self {
        Self {
            book_id: "".to_string(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let book_id = match val.get("bookId") {
                    Some(serde_json::Value::String(book_id_val)) => book_id_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { book_id }
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
        _json_output_.push_str("\"bookId\":");
        _json_output_.push_str(serialize_string(&self.book_id).as_str());
        _json_output_.push('}');
        return _json_output_;
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("bookId={}", &self.book_id));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct NestedObject {
    pub id: String,
    pub content: String,
}

impl ArriModel for NestedObject {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            content: "".to_string(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let content = match val.get("content") {
                    Some(serde_json::Value::String(content_val)) => content_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { id, content }
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
        _json_output_.push_str("\"id\":");
        _json_output_.push_str(serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"content\":");
        _json_output_.push_str(serialize_string(&self.content).as_str());
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!("content={}", &self.content));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithEveryType {
    pub string: String,
    pub boolean: bool,
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
    pub r#enum: Enumerator,
    pub object: NestedObject,
    pub array: Vec<bool>,
    pub record: BTreeMap<String, bool>,
    pub discriminator: Discriminator,
    pub any: serde_json::Value,
}

impl ArriModel for ObjectWithEveryType {
    fn new() -> Self {
        ObjectWithEveryType {
            string: "".to_string(),
            boolean: false,
            timestamp: DateTime::default(),
            float32: 0.0,
            float64: 0.0,
            int8: 0,
            uint8: 0u8,
            int16: 0,
            uint16: 0,
            int32: 0,
            uint32: 0,
            int64: 0,
            uint64: 0,
            r#enum: Enumerator::default(),
            object: NestedObject::new(),
            array: Vec::new(),
            record: BTreeMap::new(),
            discriminator: Discriminator::new(),
            any: serde_json::Value::Null,
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let string = match _val_.get("string") {
                    Some(serde_json::Value::String(string_val)) => string_val.to_owned(),
                    _ => "".to_string(),
                };
                let boolean = match _val_.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => boolean_val.to_owned(),
                    _ => false,
                };
                let timestamp = match _val_.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::parse_from_rfc3339(timestamp_val).unwrap_or_default()
                    }
                    _ => DateTime::default(),
                };
                let float32 = match _val_.get("float32") {
                    Some(serde_json::Value::Number(float32_val)) => {
                        float32_val.as_f64().unwrap_or(0.0) as f32
                    }
                    _ => 0.0,
                };
                let float64 = match _val_.get("float64") {
                    Some(serde_json::Value::Number(float64_val)) => {
                        float64_val.as_f64().unwrap_or(0.0)
                    }
                    _ => 0.0,
                };
                let int8 = match _val_.get("int8") {
                    Some(serde_json::Value::Number(int8_val)) => {
                        i8::try_from(int8_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let uint8 = match _val_.get("uint8") {
                    Some(serde_json::Value::Number(uint8_val)) => {
                        u8::try_from(uint8_val.as_u64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let int16 = match _val_.get("int16") {
                    Some(serde_json::Value::Number(int16_val)) => {
                        i16::try_from(int16_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let uint16 = match _val_.get("uint16") {
                    Some(serde_json::Value::Number(uint16_val)) => {
                        u16::try_from(uint16_val.as_u64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let int32 = match _val_.get("int32") {
                    Some(serde_json::Value::Number(int32_val)) => {
                        i32::try_from(int32_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let uint32 = match _val_.get("uint32") {
                    Some(serde_json::Value::Number(uint32_val)) => {
                        u32::try_from(uint32_val.as_u64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let int64 = match _val_.get("int64") {
                    Some(serde_json::Value::String(int64_val)) => {
                        int64_val.parse::<i64>().unwrap_or(0)
                    }
                    _ => 0,
                };
                let uint64 = match _val_.get("uint64") {
                    Some(serde_json::Value::String(uint64_val)) => {
                        uint64_val.parse::<u64>().unwrap_or(0)
                    }
                    _ => 0,
                };
                let r#enum = match _val_.get("enum") {
                    Some(serde_json::Value::String(r#enum_val)) => {
                        Enumerator::from_string(r#enum_val.to_owned())
                    }
                    _ => Enumerator::default(),
                };
                let object = match _val_.get("object") {
                    Some(object_val) => NestedObject::from_json(object_val.to_owned()),
                    _ => NestedObject::new(),
                };
                let array = match _val_.get("array") {
                    Some(serde_json::Value::Array(array_val)) => {
                        let mut array_val_result: Vec<bool> = Vec::new();
                        for array_val_result_item in array_val {
                            array_val_result.push(match Some(array_val_result_item) {
                                Some(serde_json::Value::Bool(array_val_result_item_val)) => {
                                    array_val_result_item_val.to_owned()
                                }
                                _ => false,
                            });
                        }
                        array_val_result
                    }
                    _ => Vec::new(),
                };
                let record = match _val_.get("record") {
                    Some(serde_json::Value::Object(record_val)) => {
                        let mut record_val_result: BTreeMap<String, bool> = BTreeMap::new();
                        for (record_val_entry_key, record_val_entry_val) in record_val.into_iter() {
                            record_val_result.insert(
                                record_val_entry_key.to_owned(),
                                match Some(record_val_entry_val.to_owned()) {
                                    Some(serde_json::Value::Bool(record_val_entry_val_val)) => {
                                        record_val_entry_val_val.to_owned()
                                    }
                                    _ => false,
                                },
                            );
                        }
                        record_val_result
                    }
                    _ => BTreeMap::new(),
                };
                let discriminator = match _val_.get("discriminator") {
                    Some(discriminator_val) => {
                        Discriminator::from_json(discriminator_val.to_owned())
                    }
                    _ => Discriminator::new(),
                };
                let any = match _val_.get("any") {
                    Some(any_val) => any_val.to_owned(),
                    _ => serde_json::Value::Null,
                };

                Self {
                    string,
                    boolean,
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
                    r#enum,
                    object,
                    array,
                    record,
                    discriminator,
                    any,
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
        _json_output_.push_str("\"string\":");
        _json_output_.push_str(serialize_string(&self.string).as_str());
        _json_output_.push_str(",\"boolean\":");
        _json_output_.push_str(&self.boolean.to_string());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(serialize_date_time(&self.timestamp, true).as_str());
        _json_output_.push_str(",\"float32\":");
        _json_output_.push_str(&self.float32.to_string());
        _json_output_.push_str(",\"float64\":");
        _json_output_.push_str(&self.float64.to_string());
        _json_output_.push_str(",\"int8\":");
        _json_output_.push_str(&self.int8.to_string());
        _json_output_.push_str(",\"uint8\":");
        _json_output_.push_str(&self.uint8.to_string());
        _json_output_.push_str(",\"int16\":");
        _json_output_.push_str(&self.int16.to_string());
        _json_output_.push_str(",\"uint16\":");
        _json_output_.push_str(&self.uint16.to_string());
        _json_output_.push_str(",\"int32\":");
        _json_output_.push_str(&self.int32.to_string());
        _json_output_.push_str(",\"uint32\":");
        _json_output_.push_str(&self.uint32.to_string());
        _json_output_.push_str(",\"int64\":");
        _json_output_.push_str(format!("\"{}\"", &self.int64).as_str());
        _json_output_.push_str(",\"uint64\":");
        _json_output_.push_str(format!("\"{}\"", &self.uint64).as_str());
        _json_output_.push_str(",\"enum\":");
        _json_output_.push_str(format!("\"{}\"", &self.r#enum.serial_value()).as_str());
        _json_output_.push_str(",\"object\":");
        _json_output_.push_str(&self.object.to_json_string());
        _json_output_.push_str(",\"array\":");
        _json_output_.push('[');
        for (i, element) in self.array.iter().enumerate() {
            if i != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(&element.to_string())
        }
        _json_output_.push(']');
        _json_output_.push_str(",\"record\":");
        _json_output_.push('{');
        for (i, (key, entry)) in self.record.iter().enumerate() {
            if i != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(format!("\"{}\":", key).as_str());
            _json_output_.push_str(&entry.to_string())
        }
        _json_output_.push('}');
        _json_output_.push_str(",\"discriminator\":");
        _json_output_.push_str(&self.discriminator.to_json_string().as_str());
        _json_output_.push_str(",\"any\":");
        _json_output_.push_str(
            serde_json::to_string(&self.any.to_owned())
                .unwrap_or("null".to_string())
                .as_str(),
        );
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        todo!()
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum Enumerator {
    Foo,
    Bar,
    Baz,
}

impl ArriEnum for Enumerator {
    fn default() -> Self {
        Enumerator::Foo
    }

    fn from_string(input: String) -> Self {
        match input.as_str() {
            "FOO" => Self::Foo,
            "BAR" => Self::Bar,
            "BAZ" => Self::Baz,
            _ => Self::default(),
        }
    }

    fn serial_value(&self) -> String {
        match &self {
            Enumerator::Foo => "FOO".to_string(),
            Enumerator::Bar => "BAR".to_string(),
            Enumerator::Baz => "BAZ".to_string(),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum Discriminator {
    A {
        id: String,
    },
    B {
        id: String,
        name: String,
    },
    C {
        id: String,
        name: String,
        date: DateTime<FixedOffset>,
    },
}

impl ArriModel for Discriminator {
    fn new() -> Self {
        Self::A { id: "".to_string() }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let type_name = match _val_.get("typeName") {
                    Some(serde_json::Value::String(type_name_val)) => type_name_val.to_owned(),
                    _ => "".to_string(),
                };
                match type_name.as_str() {
                    "A" => {
                        let id = match _val_.get("id") {
                            Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::A { id }
                    }
                    "B" => {
                        let id = match _val_.get("id") {
                            Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let name = match _val_.get("name") {
                            Some(serde_json::Value::String(name_val)) => name_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::B { id, name }
                    }
                    "C" => {
                        let id = match _val_.get("id") {
                            Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let name = match _val_.get("name") {
                            Some(serde_json::Value::String(name_val)) => name_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let date = match _val_.get("date") {
                            Some(serde_json::Value::String(date_val)) => {
                                DateTime::parse_from_rfc3339(date_val)
                                    .unwrap_or(DateTime::default())
                            }
                            _ => DateTime::default(),
                        };
                        Self::C { id, name, date }
                    }
                    _ => Self::new(),
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
        match &self {
            Discriminator::A { id } => {
                _json_output_.push_str("\"typeName\":\"A\"");
                _json_output_.push_str(",\"id\":");
                _json_output_.push_str(serialize_string(id).as_str());
            }
            Discriminator::B { id, name } => {
                _json_output_.push_str("\"typeName\":\"B\"");
                _json_output_.push_str(",\"id\":");
                _json_output_.push_str(serialize_string(id).as_str());
                _json_output_.push_str(",\"name\":");
                _json_output_.push_str(serialize_string(name).as_str());
            }
            Discriminator::C { id, name, date } => {
                _json_output_.push_str("\"typeName\":\"C\"");
                _json_output_.push_str(",\"id\":");
                _json_output_.push_str(serialize_string(id).as_str());
                _json_output_.push_str(",\"name\":");
                _json_output_.push_str(serialize_string(name).as_str());
                _json_output_.push_str(",\"date\":");
                _json_output_.push_str(serialize_date_time(date, true).as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self {
            Discriminator::A { id } => {
                _query_parts_.push(format!("typeName=A"));
                _query_parts_.push(format!("id={}", id));
            }
            Discriminator::B { id, name } => {
                _query_parts_.push(format!("typeName=B"));
                _query_parts_.push(format!("id={}", id));
                _query_parts_.push(format!("name={}", name));
            }
            Discriminator::C { id, name, date } => {
                _query_parts_.push(format!("typeName=C"));
                _query_parts_.push(format!("id={}", id));
                _query_parts_.push(format!("name={}", name));
                _query_parts_.push(format!("date={}", serialize_date_time(date, false)));
            }
        }
        _query_parts_.join("&")
    }
}
