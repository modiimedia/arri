#![allow(
    dead_code,
    unused_imports,
    unused_variables,
    unconditional_recursion,
    deprecated
)]
use arri_client::{
    chrono::{DateTime, FixedOffset},
    parsed_arri_request, reqwest, serde_json,
    sse::{parsed_arri_sse_request, ArriParsedSseRequestOptions, SseEvent},
    utils::{serialize_date_time, serialize_string},
    ArriClientConfig, ArriClientService, ArriEnum, ArriModel, ArriParsedRequestOptions,
    ArriServerError, EmptyArriModel,
};
use std::collections::BTreeMap;

pub struct ExampleClient {
    config: ArriClientConfig,
    pub books: ExampleClientBooksService,
}

impl ArriClientService for ExampleClient {
    fn create(config: ArriClientConfig) -> Self {
        Self {
            config: config.clone(),
            books: ExampleClientBooksService::create(config.clone()),
        }
    }
}

impl ExampleClient {
    pub async fn send_object(
        self: &Self,
        params: NestedObject,
    ) -> Result<NestedObject, ArriServerError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self.config.http_client,
                url: format!("{}/send-object", &self.config.base_url),
                method: reqwest::Method::POST,
                headers: self.config.headers,
                client_version: "20".to_string(),
            },
            Some(params),
            |body| return NestedObject::from_json_string(body),
        )
        .await
    }
}

pub struct ExampleClientBooksService {
    config: ArriClientConfig,
}

impl ArriClientService for ExampleClientBooksService {
    fn create(config: ArriClientConfig) -> Self {
        Self { config: config }
    }
}

impl ExampleClientBooksService {
    pub async fn get_book(self: &Self, params: BookParams) -> Result<Book, ArriServerError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self.config.http_client,
                url: format!("{}/books/get-book", &self.config.base_url),
                method: reqwest::Method::GET,
                headers: self.config.headers,
                client_version: "20".to_string(),
            },
            Some(params),
            |body| return Book::from_json_string(body),
        )
        .await
    }
    pub async fn create_book(self: &Self, params: Book) -> Result<Book, ArriServerError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self.config.http_client,
                url: format!("{}/books/create-book", &self.config.base_url),
                method: reqwest::Method::POST,
                headers: self.config.headers,
                client_version: "20".to_string(),
            },
            Some(params),
            |body| return Book::from_json_string(body),
        )
        .await
    }
    pub async fn watch_book<OnEvent>(
        self: &Self,
        params: BookParams,
        on_event: OnEvent,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) where
        OnEvent: Fn(SseEvent<Book>) -> (),
    {
        parsed_arri_sse_request(
            ArriParsedSseRequestOptions {
                client: &self.config.http_client,
                url: format!("{}/books/watch-book", &self.config.base_url),
                method: reqwest::Method::GET,
                headers: self.config.headers,
                client_version: "20".to_string(),
                max_retry_count: max_retry_count,
                max_retry_interval: max_retry_interval,
            },
            Some(params),
            on_event,
        )
        .await;
    }
}

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
            serde_json::Value::Object(_val_) => {
                let id = match _val_.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let name = match _val_.get("name") {
                    Some(serde_json::Value::String(name_val)) => name_val.to_owned(),
                    _ => "".to_string(),
                };
                let created_at = match _val_.get("createdAt") {
                    Some(serde_json::Value::String(created_at_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(created_at_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                let updated_at = match _val_.get("updatedAt") {
                    Some(serde_json::Value::String(updated_at_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(updated_at_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                Self {
                    id,
                    name,
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
        _json_output_.push_str("\"id\":");
        _json_output_.push_str(serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"name\":");
        _json_output_.push_str(serialize_string(&self.name).as_str());
        _json_output_.push_str(",\"createdAt\":");
        _json_output_.push_str(serialize_date_time(&self.created_at, true).as_str());
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
            serde_json::Value::Object(_val_) => {
                let book_id = match _val_.get("bookId") {
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
        _json_output_
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
            serde_json::Value::Object(_val_) => {
                let id = match _val_.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let content = match _val_.get("content") {
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
        Self {
            string: "".to_string(),
            boolean: false,
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
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
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
                    Some(serde_json::Value::String(enum_val)) => {
                        Enumerator::from_string(enum_val.to_owned())
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
                        for array_val_element in array_val {
                            array_val_result.push(match Some(array_val_element) {
                                Some(serde_json::Value::Bool(array_val_element_val)) => {
                                    array_val_element_val.to_owned()
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
                        for (_key_, _value_) in record_val.into_iter() {
                            record_val_result.insert(
                                _key_.to_owned(),
                                match Some(_value_.to_owned()) {
                                    Some(serde_json::Value::Bool(value_val)) => {
                                        value_val.to_owned()
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
                    Some(discriminator_val) => match discriminator_val {
                        serde_json::Value::Object(_) => {
                            Discriminator::from_json(discriminator_val.to_owned())
                        }
                        _ => Discriminator::new(),
                    },
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
        _json_output_.push_str(&self.boolean.to_string().as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(serialize_date_time(&self.timestamp, true).as_str());
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
        _json_output_.push_str(",\"enum\":");
        _json_output_.push_str(format!("\"{}\"", &self.r#enum.serial_value()).as_str());
        _json_output_.push_str(",\"object\":");
        _json_output_.push_str(&self.object.to_json_string().as_str());
        _json_output_.push_str(",\"array\":");
        _json_output_.push('[');
        for (_index_, _element_) in self.array.iter().enumerate() {
            if _index_ != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(_element_.to_string().as_str());
        }
        _json_output_.push(']');
        _json_output_.push_str(",\"record\":");
        _json_output_.push('{');
        for (_index_, (_key_, _value_)) in self.record.iter().enumerate() {
            if _index_ != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(format!("\"{}\":", _key_).as_str());
            _json_output_.push_str(_value_.to_string().as_str());
        }
        _json_output_.push('}');
        _json_output_.push_str(",\"discriminator\":");
        _json_output_.push_str(&self.discriminator.to_json_string().as_str());
        _json_output_.push_str(",\"any\":");
        _json_output_.push_str(
            serde_json::to_string(&self.any)
                .unwrap_or("null".to_string())
                .as_str(),
        );
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("string={}", &self.string));
        _query_parts_.push(format!("boolean={}", &self.boolean));
        _query_parts_.push(format!(
            "timestamp={}",
            serialize_date_time(&self.timestamp, false)
        ));
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
        _query_parts_.push(format!("enum={}", &self.r#enum.serial_value()));
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryType/object.");
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /ObjectWithEveryType/array.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryType/record.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryType/discriminator.");
        println!("[WARNING] cannot serialize any's to query params. Skipping field at /ObjectWithEveryType/any.");
        _query_parts_.join("&")
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
                                DateTime::<FixedOffset>::parse_from_rfc3339(date_val)
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
            Self::A { id } => {
                _json_output_.push_str("\"typeName\":\"A\"");
                _json_output_.push_str(",\"id\":");
                _json_output_.push_str(serialize_string(id).as_str());
            }
            Self::B { id, name } => {
                _json_output_.push_str("\"typeName\":\"B\"");
                _json_output_.push_str(",\"id\":");
                _json_output_.push_str(serialize_string(id).as_str());
                _json_output_.push_str(",\"name\":");
                _json_output_.push_str(serialize_string(name).as_str());
            }
            Self::C { id, name, date } => {
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
            Self::A { id } => {
                _query_parts_.push(format!("typeName=A"));
                _query_parts_.push(format!("id={}", id));
            }
            Self::B { id, name } => {
                _query_parts_.push(format!("typeName=B"));
                _query_parts_.push(format!("id={}", id));
                _query_parts_.push(format!("name={}", name));
            }
            Self::C { id, name, date } => {
                _query_parts_.push(format!("typeName=C"));
                _query_parts_.push(format!("id={}", id));
                _query_parts_.push(format!("name={}", name));
                _query_parts_.push(format!("date={}", serialize_date_time(date, false)));
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithOptionalFields {
    pub string: Option<String>,
    pub boolean: Option<bool>,
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
    pub r#enum: Option<Enumerator>,
    pub object: Option<NestedObject>,
    pub array: Option<Vec<bool>>,
    pub record: Option<BTreeMap<String, bool>>,
    pub discriminator: Option<Discriminator>,
    pub any: Option<serde_json::Value>,
}

impl ArriModel for ObjectWithOptionalFields {
    fn new() -> Self {
        Self {
            string: None,
            boolean: None,
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
            r#enum: None,
            object: None,
            array: None,
            record: None,
            discriminator: None,
            any: None,
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let string = match _val_.get("string") {
                    Some(serde_json::Value::String(string_val)) => Some(string_val.to_owned()),
                    _ => None,
                };
                let boolean = match _val_.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => Some(boolean_val.to_owned()),
                    _ => None,
                };
                let timestamp = match _val_.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        match DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val) {
                            Ok(timestamp_val_result) => Some(timestamp_val_result),
                            Err(_) => None,
                        }
                    }
                    _ => None,
                };
                let float32 = match _val_.get("float32") {
                    Some(serde_json::Value::Number(float32_val)) => match float32_val.as_f64() {
                        Some(float32_val_result) => Some(float32_val_result as f32),
                        _ => None,
                    },
                    _ => None,
                };
                let float64 = match _val_.get("float64") {
                    Some(serde_json::Value::Number(float64_val)) => match float64_val.as_f64() {
                        Some(float64_val_result) => Some(float64_val_result),
                        _ => None,
                    },
                    _ => None,
                };
                let int8 = match _val_.get("int8") {
                    Some(serde_json::Value::Number(int8_val)) => match int8_val.as_i64() {
                        Some(int8_val_result) => match i8::try_from(int8_val_result) {
                            Ok(int8_val_result_val) => Some(int8_val_result_val),
                            Err(_) => None,
                        },
                        _ => None,
                    },
                    _ => None,
                };
                let uint8 = match _val_.get("uint8") {
                    Some(serde_json::Value::Number(uint8_val)) => match uint8_val.as_u64() {
                        Some(uint8_val_result) => match u8::try_from(uint8_val_result) {
                            Ok(uint8_val_result_val) => Some(uint8_val_result_val),
                            Err(_) => None,
                        },
                        _ => None,
                    },
                    _ => None,
                };
                let int16 = match _val_.get("int16") {
                    Some(serde_json::Value::Number(int16_val)) => match int16_val.as_i64() {
                        Some(int16_val_result) => match i16::try_from(int16_val_result) {
                            Ok(int16_val_result_val) => Some(int16_val_result_val),
                            Err(_) => None,
                        },
                        _ => None,
                    },
                    _ => None,
                };
                let uint16 = match _val_.get("uint16") {
                    Some(serde_json::Value::Number(uint16_val)) => match uint16_val.as_u64() {
                        Some(uint16_val_result) => match u16::try_from(uint16_val_result) {
                            Ok(uint16_val_result_val) => Some(uint16_val_result_val),
                            Err(_) => None,
                        },
                        _ => None,
                    },
                    _ => None,
                };
                let int32 = match _val_.get("int32") {
                    Some(serde_json::Value::Number(int32_val)) => match int32_val.as_i64() {
                        Some(int32_val_result) => match i32::try_from(int32_val_result) {
                            Ok(int32_val_result_val) => Some(int32_val_result_val),
                            Err(_) => None,
                        },
                        _ => None,
                    },
                    _ => None,
                };
                let uint32 = match _val_.get("uint32") {
                    Some(serde_json::Value::Number(uint32_val)) => match uint32_val.as_u64() {
                        Some(uint32_val_result) => match u32::try_from(uint32_val_result) {
                            Ok(uint32_val_result_val) => Some(uint32_val_result_val),
                            Err(_) => None,
                        },
                        _ => None,
                    },
                    _ => None,
                };
                let int64 = match _val_.get("int64") {
                    Some(serde_json::Value::String(int64_val)) => match int64_val.parse::<i64>() {
                        Ok(int64_val_result) => Some(int64_val_result),
                        Err(_) => None,
                    },
                    _ => None,
                };
                let uint64 = match _val_.get("uint64") {
                    Some(serde_json::Value::String(uint64_val)) => {
                        match uint64_val.parse::<u64>() {
                            Ok(uint64_val_result) => Some(uint64_val_result),
                            Err(_) => None,
                        }
                    }
                    _ => None,
                };
                let r#enum = match _val_.get("enum") {
                    Some(serde_json::Value::String(enum_val)) => {
                        Some(Enumerator::from_string(enum_val.to_owned()))
                    }
                    _ => None,
                };
                let object = match _val_.get("object") {
                    Some(object_val) => match object_val {
                        serde_json::Value::Object(_) => {
                            Some(NestedObject::from_json(object_val.to_owned()))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let array = match _val_.get("array") {
                    Some(serde_json::Value::Array(array_val)) => {
                        let mut array_val_result: Vec<bool> = Vec::new();
                        for array_val_element in array_val {
                            array_val_result.push(match Some(array_val_element) {
                                Some(serde_json::Value::Bool(array_val_element_val)) => {
                                    array_val_element_val.to_owned()
                                }
                                _ => false,
                            });
                        }
                        Some(array_val_result)
                    }
                    _ => None,
                };
                let record = match _val_.get("record") {
                    Some(serde_json::Value::Object(record_val)) => {
                        let mut record_val_result: BTreeMap<String, bool> = BTreeMap::new();
                        for (_key_, _value_) in record_val.into_iter() {
                            record_val_result.insert(
                                _key_.to_owned(),
                                match Some(_value_.to_owned()) {
                                    Some(serde_json::Value::Bool(value_val)) => {
                                        value_val.to_owned()
                                    }
                                    _ => false,
                                },
                            );
                        }
                        Some(record_val_result)
                    }
                    _ => None,
                };
                let discriminator = match _val_.get("discriminator") {
                    Some(discriminator_val) => match discriminator_val {
                        serde_json::Value::Object(_) => {
                            Some(Discriminator::from_json(discriminator_val.to_owned()))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let any = match _val_.get("any") {
                    Some(any_val) => Some(any_val.to_owned()),
                    _ => None,
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
        let mut _has_keys_ = false;
        match &self.string {
            Some(string_val) => {
                _json_output_.push_str("\"string\":");
                _json_output_.push_str(serialize_string(string_val).as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.boolean {
            Some(boolean_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"boolean\":");
                _json_output_.push_str(boolean_val.to_string().as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.timestamp {
            Some(timestamp_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"timestamp\":");
                _json_output_.push_str(serialize_date_time(timestamp_val, true).as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.float32 {
            Some(float32_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"float32\":");
                _json_output_.push_str(float32_val.to_string().as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.float64 {
            Some(float64_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"float64\":");
                _json_output_.push_str(float64_val.to_string().as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.int8 {
            Some(int8_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"int8\":");
                _json_output_.push_str(int8_val.to_string().as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.uint8 {
            Some(uint8_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"uint8\":");
                _json_output_.push_str(uint8_val.to_string().as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.int16 {
            Some(int16_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"int16\":");
                _json_output_.push_str(int16_val.to_string().as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.uint16 {
            Some(uint16_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"uint16\":");
                _json_output_.push_str(uint16_val.to_string().as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.int32 {
            Some(int32_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"int32\":");
                _json_output_.push_str(int32_val.to_string().as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.uint32 {
            Some(uint32_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"uint32\":");
                _json_output_.push_str(uint32_val.to_string().as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.int64 {
            Some(int64_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"int64\":");
                _json_output_.push_str(format!("\"{}\"", int64_val).as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.uint64 {
            Some(uint64_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"uint64\":");
                _json_output_.push_str(format!("\"{}\"", uint64_val).as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.r#enum {
            Some(enum_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"enum\":");
                _json_output_.push_str(format!("\"{}\"", enum_val.serial_value()).as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.object {
            Some(object_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"object\":");
                _json_output_.push_str(object_val.to_json_string().as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.array {
            Some(array_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"array\":");
                _json_output_.push('[');
                for (_index_, _element_) in array_val.iter().enumerate() {
                    if _index_ != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(_element_.to_string().as_str());
                }
                _json_output_.push(']');
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.record {
            Some(record_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"record\":");
                _json_output_.push('{');
                for (_index_, (_key_, _value_)) in record_val.iter().enumerate() {
                    if _index_ != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(format!("\"{}\":", _key_).as_str());
                    _json_output_.push_str(_value_.to_string().as_str());
                }
                _json_output_.push('}');
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.discriminator {
            Some(discriminator_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"discriminator\":");
                _json_output_.push_str(discriminator_val.to_json_string().as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.any {
            Some(any_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"any\":");
                _json_output_.push_str(
                    serde_json::to_string(any_val)
                        .unwrap_or("null".to_string())
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
        match &self.string {
            Some(string_val) => {
                _query_parts_.push(format!("string={}", string_val));
            }
            _ => {}
        };
        match &self.boolean {
            Some(boolean_val) => {
                _query_parts_.push(format!("boolean={}", boolean_val));
            }
            _ => {}
        };
        match &self.timestamp {
            Some(timestamp_val) => {
                _query_parts_.push(format!(
                    "timestamp={}",
                    serialize_date_time(timestamp_val, false)
                ));
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
        match &self.r#enum {
            Some(enum_val) => {
                _query_parts_.push(format!("enum={}", enum_val.serial_value()));
            }
            _ => {}
        };
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithOptionalFields/object.");
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /ObjectWithOptionalFields/array.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithOptionalFields/record.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithOptionalFields/discriminator.");
        println!("[WARNING] cannot serialize any's to query params. Skipping field at /ObjectWithOptionalFields/any.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithNullableFields {
    pub string: Option<String>,
    pub boolean: Option<bool>,
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
    pub r#enum: Option<Enumerator>,
    pub object: Option<NestedObject>,
    pub array: Option<Vec<bool>>,
    pub record: Option<BTreeMap<String, bool>>,
    pub discriminator: Option<Discriminator>,
    pub any: serde_json::Value,
}

impl ArriModel for ObjectWithNullableFields {
    fn new() -> Self {
        Self {
            string: None,
            boolean: None,
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
            r#enum: None,
            object: None,
            array: None,
            record: None,
            discriminator: None,
            any: serde_json::Value::Null,
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let string = match _val_.get("string") {
                    Some(serde_json::Value::String(string_val)) => Some(string_val.to_owned()),
                    _ => None,
                };
                let boolean = match _val_.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => Some(boolean_val.to_owned()),
                    _ => None,
                };
                let timestamp = match _val_.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        match DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val) {
                            Ok(timestamp_val_result) => Some(timestamp_val_result),
                            Err(_) => None,
                        }
                    }
                    _ => None,
                };
                let float32 = match _val_.get("float32") {
                    Some(serde_json::Value::Number(float32_val)) => match float32_val.as_f64() {
                        Some(float32_val_result) => Some(float32_val_result as f32),
                        _ => None,
                    },
                    _ => None,
                };
                let float64 = match _val_.get("float64") {
                    Some(serde_json::Value::Number(float64_val)) => match float64_val.as_f64() {
                        Some(float64_val_result) => Some(float64_val_result),
                        _ => None,
                    },
                    _ => None,
                };
                let int8 = match _val_.get("int8") {
                    Some(serde_json::Value::Number(int8_val)) => match int8_val.as_i64() {
                        Some(int8_val_result) => match i8::try_from(int8_val_result) {
                            Ok(int8_val_result_val) => Some(int8_val_result_val),
                            Err(_) => None,
                        },
                        _ => None,
                    },
                    _ => None,
                };
                let uint8 = match _val_.get("uint8") {
                    Some(serde_json::Value::Number(uint8_val)) => match uint8_val.as_u64() {
                        Some(uint8_val_result) => match u8::try_from(uint8_val_result) {
                            Ok(uint8_val_result_val) => Some(uint8_val_result_val),
                            Err(_) => None,
                        },
                        _ => None,
                    },
                    _ => None,
                };
                let int16 = match _val_.get("int16") {
                    Some(serde_json::Value::Number(int16_val)) => match int16_val.as_i64() {
                        Some(int16_val_result) => match i16::try_from(int16_val_result) {
                            Ok(int16_val_result_val) => Some(int16_val_result_val),
                            Err(_) => None,
                        },
                        _ => None,
                    },
                    _ => None,
                };
                let uint16 = match _val_.get("uint16") {
                    Some(serde_json::Value::Number(uint16_val)) => match uint16_val.as_u64() {
                        Some(uint16_val_result) => match u16::try_from(uint16_val_result) {
                            Ok(uint16_val_result_val) => Some(uint16_val_result_val),
                            Err(_) => None,
                        },
                        _ => None,
                    },
                    _ => None,
                };
                let int32 = match _val_.get("int32") {
                    Some(serde_json::Value::Number(int32_val)) => match int32_val.as_i64() {
                        Some(int32_val_result) => match i32::try_from(int32_val_result) {
                            Ok(int32_val_result_val) => Some(int32_val_result_val),
                            Err(_) => None,
                        },
                        _ => None,
                    },
                    _ => None,
                };
                let uint32 = match _val_.get("uint32") {
                    Some(serde_json::Value::Number(uint32_val)) => match uint32_val.as_u64() {
                        Some(uint32_val_result) => match u32::try_from(uint32_val_result) {
                            Ok(uint32_val_result_val) => Some(uint32_val_result_val),
                            Err(_) => None,
                        },
                        _ => None,
                    },
                    _ => None,
                };
                let int64 = match _val_.get("int64") {
                    Some(serde_json::Value::String(int64_val)) => match int64_val.parse::<i64>() {
                        Ok(int64_val_result) => Some(int64_val_result),
                        Err(_) => None,
                    },
                    _ => None,
                };
                let uint64 = match _val_.get("uint64") {
                    Some(serde_json::Value::String(uint64_val)) => {
                        match uint64_val.parse::<u64>() {
                            Ok(uint64_val_result) => Some(uint64_val_result),
                            Err(_) => None,
                        }
                    }
                    _ => None,
                };
                let r#enum = match _val_.get("enum") {
                    Some(serde_json::Value::String(enum_val)) => {
                        Some(Enumerator::from_string(enum_val.to_owned()))
                    }
                    _ => None,
                };
                let object = match _val_.get("object") {
                    Some(object_val) => match object_val {
                        serde_json::Value::Object(_) => {
                            Some(NestedObject::from_json(object_val.to_owned()))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let array = match _val_.get("array") {
                    Some(serde_json::Value::Array(array_val)) => {
                        let mut array_val_result: Vec<bool> = Vec::new();
                        for array_val_element in array_val {
                            array_val_result.push(match Some(array_val_element) {
                                Some(serde_json::Value::Bool(array_val_element_val)) => {
                                    array_val_element_val.to_owned()
                                }
                                _ => false,
                            });
                        }
                        Some(array_val_result)
                    }
                    _ => None,
                };
                let record = match _val_.get("record") {
                    Some(serde_json::Value::Object(record_val)) => {
                        let mut record_val_result: BTreeMap<String, bool> = BTreeMap::new();
                        for (_key_, _value_) in record_val.into_iter() {
                            record_val_result.insert(
                                _key_.to_owned(),
                                match Some(_value_.to_owned()) {
                                    Some(serde_json::Value::Bool(value_val)) => {
                                        value_val.to_owned()
                                    }
                                    _ => false,
                                },
                            );
                        }
                        Some(record_val_result)
                    }
                    _ => None,
                };
                let discriminator = match _val_.get("discriminator") {
                    Some(discriminator_val) => match discriminator_val {
                        serde_json::Value::Object(_) => {
                            Some(Discriminator::from_json(discriminator_val.to_owned()))
                        }
                        _ => None,
                    },
                    _ => None,
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
        match &self.string {
            Some(string_val) => {
                _json_output_.push_str(serialize_string(string_val).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"boolean\":");
        match &self.boolean {
            Some(boolean_val) => {
                _json_output_.push_str(boolean_val.to_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"timestamp\":");
        match &self.timestamp {
            Some(timestamp_val) => {
                _json_output_.push_str(serialize_date_time(timestamp_val, true).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"float32\":");
        match &self.float32 {
            Some(float32_val) => {
                _json_output_.push_str(float32_val.to_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"float64\":");
        match &self.float64 {
            Some(float64_val) => {
                _json_output_.push_str(float64_val.to_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"int8\":");
        match &self.int8 {
            Some(int8_val) => {
                _json_output_.push_str(int8_val.to_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"uint8\":");
        match &self.uint8 {
            Some(uint8_val) => {
                _json_output_.push_str(uint8_val.to_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"int16\":");
        match &self.int16 {
            Some(int16_val) => {
                _json_output_.push_str(int16_val.to_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"uint16\":");
        match &self.uint16 {
            Some(uint16_val) => {
                _json_output_.push_str(uint16_val.to_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"int32\":");
        match &self.int32 {
            Some(int32_val) => {
                _json_output_.push_str(int32_val.to_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"uint32\":");
        match &self.uint32 {
            Some(uint32_val) => {
                _json_output_.push_str(uint32_val.to_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"int64\":");
        match &self.int64 {
            Some(int64_val) => {
                _json_output_.push_str(format!("\"{}\"", int64_val).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"uint64\":");
        match &self.uint64 {
            Some(uint64_val) => {
                _json_output_.push_str(format!("\"{}\"", uint64_val).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"enum\":");
        match &self.r#enum {
            Some(enum_val) => {
                _json_output_.push_str(format!("\"{}\"", enum_val.serial_value()).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"object\":");
        match &self.object {
            Some(object_val) => {
                _json_output_.push_str(object_val.to_json_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"array\":");
        match &self.array {
            Some(array_val) => {
                _json_output_.push('[');
                for (_index_, _element_) in array_val.iter().enumerate() {
                    if _index_ != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(_element_.to_string().as_str());
                }
                _json_output_.push(']');
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"record\":");
        match &self.record {
            Some(record_val) => {
                _json_output_.push('{');
                for (_index_, (_key_, _value_)) in record_val.iter().enumerate() {
                    if _index_ != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(format!("\"{}\":", _key_).as_str());
                    _json_output_.push_str(_value_.to_string().as_str());
                }
                _json_output_.push('}');
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"discriminator\":");
        match &self.discriminator {
            Some(discriminator_val) => {
                _json_output_.push_str(discriminator_val.to_json_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"any\":");
        _json_output_.push_str(
            serde_json::to_string(&self.any)
                .unwrap_or("null".to_string())
                .as_str(),
        );
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self.string {
            Some(string_val) => {
                _query_parts_.push(format!("string={}", string_val));
            }
            _ => {
                _query_parts_.push("string=null".to_string());
            }
        };
        match &self.boolean {
            Some(boolean_val) => {
                _query_parts_.push(format!("boolean={}", boolean_val));
            }
            _ => {
                _query_parts_.push("boolean=null".to_string());
            }
        };
        match &self.timestamp {
            Some(timestamp_val) => {
                _query_parts_.push(format!(
                    "timestamp={}",
                    serialize_date_time(timestamp_val, false)
                ));
            }
            _ => {
                _query_parts_.push("timestamp=null".to_string());
            }
        };
        match &self.float32 {
            Some(float32_val) => {
                _query_parts_.push(format!("float32={}", float32_val));
            }
            _ => {
                _query_parts_.push("float32=null".to_string());
            }
        };
        match &self.float64 {
            Some(float64_val) => {
                _query_parts_.push(format!("float64={}", float64_val));
            }
            _ => {
                _query_parts_.push("float64=null".to_string());
            }
        };
        match &self.int8 {
            Some(int8_val) => {
                _query_parts_.push(format!("int8={}", int8_val));
            }
            _ => {
                _query_parts_.push("int8=null".to_string());
            }
        };
        match &self.uint8 {
            Some(uint8_val) => {
                _query_parts_.push(format!("uint8={}", uint8_val));
            }
            _ => {
                _query_parts_.push("uint8=null".to_string());
            }
        };
        match &self.int16 {
            Some(int16_val) => {
                _query_parts_.push(format!("int16={}", int16_val));
            }
            _ => {
                _query_parts_.push("int16=null".to_string());
            }
        };
        match &self.uint16 {
            Some(uint16_val) => {
                _query_parts_.push(format!("uint16={}", uint16_val));
            }
            _ => {
                _query_parts_.push("uint16=null".to_string());
            }
        };
        match &self.int32 {
            Some(int32_val) => {
                _query_parts_.push(format!("int32={}", int32_val));
            }
            _ => {
                _query_parts_.push("int32=null".to_string());
            }
        };
        match &self.uint32 {
            Some(uint32_val) => {
                _query_parts_.push(format!("uint32={}", uint32_val));
            }
            _ => {
                _query_parts_.push("uint32=null".to_string());
            }
        };
        match &self.int64 {
            Some(int64_val) => {
                _query_parts_.push(format!("int64={}", int64_val));
            }
            _ => {
                _query_parts_.push("int64=null".to_string());
            }
        };
        match &self.uint64 {
            Some(uint64_val) => {
                _query_parts_.push(format!("uint64={}", uint64_val));
            }
            _ => {
                _query_parts_.push("uint64=null".to_string());
            }
        };
        match &self.r#enum {
            Some(enum_val) => {
                _query_parts_.push(format!("enum={}", enum_val.serial_value()));
            }
            _ => {
                _query_parts_.push("enum=null".to_string());
            }
        };
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithNullableFields/object.");
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /ObjectWithNullableFields/array.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithNullableFields/record.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithNullableFields/discriminator.");
        println!("[WARNING] cannot serialize any's to query params. Skipping field at /ObjectWithNullableFields/any.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct RecursiveObject {
    pub left: Option<Box<RecursiveObject>>,
    pub right: Option<Box<RecursiveObject>>,
}

impl ArriModel for RecursiveObject {
    fn new() -> Self {
        Self {
            left: None,
            right: None,
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let left = match _val_.get("left") {
                    Some(left_val) => match left_val {
                        serde_json::Value::Object(_) => {
                            Some(Box::new(RecursiveObject::from_json(left_val.to_owned())))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let right = match _val_.get("right") {
                    Some(right_val) => match right_val {
                        serde_json::Value::Object(_) => {
                            Some(Box::new(RecursiveObject::from_json(right_val.to_owned())))
                        }
                        _ => None,
                    },
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
        _json_output_.push_str("\"left\":");
        match &self.left {
            Some(left_val) => {
                _json_output_.push_str(left_val.to_json_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"right\":");
        match &self.right {
            Some(right_val) => {
                _json_output_.push_str(right_val.to_json_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /RecursiveObject/left.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /RecursiveObject/right.");
        _query_parts_.join("&")
    }
}
