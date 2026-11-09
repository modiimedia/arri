#![allow(
    dead_code,
    unused_imports,
    unused_variables,
    unconditional_recursion,
    deprecated,
    clippy::all
)]
use arri_client::{
    chrono::{DateTime, FixedOffset},
    parsed_arri_request,
    reqwest::{self, Request},
    serde_json::{self, Map},
    sse::{parsed_arri_sse_request, ArriParsedSseRequestOptions, SseController, SseEvent},
    utils::{encode_query_component, serialize_date_time, serialize_string},
    ArriClientConfig, ArriClientService, ArriEnum, ArriError, ArriModel, ArriParsedRequestOptions,
    EmptyArriModel, InternalArriClientConfig,
};
use std::collections::{BTreeMap, HashMap};

#[derive(Clone)]
pub struct ExampleClient {
    _config: InternalArriClientConfig,
    pub books: ExampleClientBooksService,
}

impl ArriClientService for ExampleClient {
    fn create(config: ArriClientConfig) -> Self {
        Self {
            _config: InternalArriClientConfig::from(config.clone()),
            books: ExampleClientBooksService::create(config),
        }
    }
    fn update_headers(&self, headers: HashMap<&'static str, String>) {
        let mut unwrapped_headers = self._config.headers.write().unwrap();
        *unwrapped_headers = headers.clone();
        self.books.update_headers(headers);
    }
}

impl ExampleClient {
    pub async fn send_object(&self, params: NestedObject) -> Result<NestedObject, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!("{}/send-object", &self._config.base_url),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "20".to_string(),
            },
            Some(params),
            |body| return NestedObject::from_json_string(body),
        )
        .await
    }
}

#[derive(Clone)]
pub struct ExampleClientBooksService {
    _config: InternalArriClientConfig,
}

impl ArriClientService for ExampleClientBooksService {
    fn create(config: ArriClientConfig) -> Self {
        Self {
            _config: InternalArriClientConfig::from(config),
        }
    }
    fn update_headers(&self, headers: HashMap<&'static str, String>) {
        let mut unwrapped_headers = self._config.headers.write().unwrap();
        *unwrapped_headers = headers.clone();
    }
}

impl ExampleClientBooksService {
    /// Get a book
    pub async fn get_book(&self, params: BookParams) -> Result<Book, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!("{}/books/get-book", &self._config.base_url),
                method: reqwest::Method::GET,
                headers: self._config.headers.clone(),
                client_version: "20".to_string(),
            },
            Some(params),
            |body| return Book::from_json_string(body),
        )
        .await
    }
    /// Create a book
    #[deprecated]
    pub async fn create_book(&self, params: Book) -> Result<Book, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!("{}/books/create-book", &self._config.base_url),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "20".to_string(),
            },
            Some(params),
            |body| return Book::from_json_string(body),
        )
        .await
    }
    #[deprecated]
    pub async fn watch_book<OnEvent>(
        &self,
        params: BookParams,
        on_event: &mut OnEvent,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) where
        OnEvent: FnMut(SseEvent<Book>, &mut SseController) + std::marker::Send + std::marker::Sync,
    {
        parsed_arri_sse_request(
            ArriParsedSseRequestOptions {
                client: &self._config.http_client,
                url: format!("{}/books/watch-book", &self._config.base_url),
                method: reqwest::Method::GET,
                headers: self._config.headers.clone(),
                client_version: "20".to_string(),
                max_retry_count,
                max_retry_interval,
            },
            Some(params),
            on_event,
        )
        .await;
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct EmptyObject {}

impl ArriModel for EmptyObject {
    fn new() -> Self {
        Self {}
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => Self {},
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

        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();

        _query_parts_.join("&")
    }
}

/// This is a book
#[derive(Clone, Debug, PartialEq)]
pub struct Book {
    /// The book ID
    pub id: String,
    /// The book title
    pub name: String,
    /// When the book was created
    #[deprecated]
    pub created_at: DateTime<FixedOffset>,
    #[deprecated]
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
        _query_parts_.push(format!("id={}", encode_query_component(&self.id)));
        _query_parts_.push(format!("name={}", encode_query_component(&self.name)));
        _query_parts_.push(format!(
            "createdAt={}",
            encode_query_component(&serialize_date_time(&self.created_at, false))
        ));
        _query_parts_.push(format!(
            "updatedAt={}",
            encode_query_component(&serialize_date_time(&self.updated_at, false))
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
        _query_parts_.push(format!("bookId={}", encode_query_component(&self.book_id)));
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
        _query_parts_.push(format!("id={}", encode_query_component(&self.id)));
        _query_parts_.push(format!("content={}", encode_query_component(&self.content)));
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
    pub union_external: UnionExternal,
    pub union_internal: UnionInternal,
    pub union_adjacent: UnionAdjacent,
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
            union_external: UnionExternal::new(),
            union_internal: UnionInternal::new(),
            union_adjacent: UnionAdjacent::new(),
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
                let union_external = match _val_.get("unionExternal") {
                    Some(union_external_val) => match union_external_val {
                        serde_json::Value::Object(_) => {
                            UnionExternal::from_json(union_external_val.to_owned())
                        }
                        _ => UnionExternal::new(),
                    },
                    _ => UnionExternal::new(),
                };
                let union_internal = match _val_.get("unionInternal") {
                    Some(union_internal_val) => match union_internal_val {
                        serde_json::Value::Object(_) => {
                            UnionInternal::from_json(union_internal_val.to_owned())
                        }
                        _ => UnionInternal::new(),
                    },
                    _ => UnionInternal::new(),
                };
                let union_adjacent = match _val_.get("unionAdjacent") {
                    Some(union_adjacent_val) => match union_adjacent_val {
                        serde_json::Value::Object(_) => {
                            UnionAdjacent::from_json(union_adjacent_val.to_owned())
                        }
                        _ => UnionAdjacent::new(),
                    },
                    _ => UnionAdjacent::new(),
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
                    union_external,
                    union_internal,
                    union_adjacent,
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
            _json_output_.push_str(format!("{}:", serialize_string(_key_)).as_str());
            _json_output_.push_str(_value_.to_string().as_str());
        }
        _json_output_.push('}');
        _json_output_.push_str(",\"unionExternal\":");
        _json_output_.push_str(&self.union_external.to_json_string().as_str());
        _json_output_.push_str(",\"unionInternal\":");
        _json_output_.push_str(&self.union_internal.to_json_string().as_str());
        _json_output_.push_str(",\"unionAdjacent\":");
        _json_output_.push_str(&self.union_adjacent.to_json_string().as_str());
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
        _query_parts_.push(format!("string={}", encode_query_component(&self.string)));
        _query_parts_.push(format!("boolean={}", &self.boolean));
        _query_parts_.push(format!(
            "timestamp={}",
            encode_query_component(&serialize_date_time(&self.timestamp, false))
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
        _query_parts_.push(format!(
            "enum={}",
            encode_query_component(&&self.r#enum.serial_value())
        ));
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryType/object.");
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /ObjectWithEveryType/array.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryType/record.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithEveryType/unionExternal.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithEveryType/unionInternal.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithEveryType/unionAdjacent.");
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
pub enum UnionExternal {
    Object(NestedObject),
    Array(Vec<String>),
    Boolean(bool),
    NullableTimestamp(Option<DateTime<FixedOffset>>),
}

impl ArriModel for UnionExternal {
    fn new() -> Self {
        Self::Object(NestedObject::new())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                if _val_.contains_key("object") {
                    let value = match _val_.get("object") {
                        Some(value_val) => NestedObject::from_json(value_val.to_owned()),
                        _ => NestedObject::new(),
                    };
                    return Self::Object(value);
                }
                if _val_.contains_key("array") {
                    let value = match _val_.get("array") {
                        Some(serde_json::Value::Array(value_val)) => {
                            let mut value_val_result: Vec<String> = Vec::new();
                            for value_val_element in value_val {
                                value_val_result.push(match Some(value_val_element) {
                                    Some(serde_json::Value::String(value_val_element_val)) => {
                                        value_val_element_val.to_owned()
                                    }
                                    _ => "".to_string(),
                                });
                            }
                            value_val_result
                        }
                        _ => Vec::new(),
                    };
                    return Self::Array(value);
                }
                if _val_.contains_key("boolean") {
                    let value = match _val_.get("boolean") {
                        Some(serde_json::Value::Bool(value_val)) => value_val.to_owned(),
                        _ => false,
                    };
                    return Self::Boolean(value);
                }
                if _val_.contains_key("nullable-timestamp") {
                    let value = match _val_.get("nullable-timestamp") {
                        Some(serde_json::Value::String(value_val)) => {
                            match DateTime::<FixedOffset>::parse_from_rfc3339(value_val) {
                                Ok(value_val_result) => Some(value_val_result),
                                Err(_) => None,
                            }
                        }
                        _ => None,
                    };
                    return Self::NullableTimestamp(value);
                }
                Self::new()
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
            Self::Object(value) => {
                _json_output_.push_str("\"object\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
            Self::Array(value) => {
                _json_output_.push_str("\"array\":");
                _json_output_.push('[');
                for (_index_, _element_) in value.iter().enumerate() {
                    if _index_ != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(serialize_string(_element_).as_str());
                }
                _json_output_.push(']');
            }
            Self::Boolean(value) => {
                _json_output_.push_str("\"boolean\":");
                _json_output_.push_str(value.to_string().as_str());
            }
            Self::NullableTimestamp(value) => {
                _json_output_.push_str("\"nullable-timestamp\":");
                match value {
                    Some(value_val) => {
                        _json_output_.push_str(serialize_date_time(value_val, true).as_str());
                    }
                    _ => {
                        _json_output_.push_str("null");
                    }
                };
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping UnionExternal.");
        "".to_string()
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionInternal {
    Rectangle { width: f64, height: f64 },
    Circle { radius: f64 },
}

impl ArriModel for UnionInternal {
    fn new() -> Self {
        Self::Rectangle {
            width: 0.0,
            height: 0.0,
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let shape = match _val_.get("shape") {
                    Some(serde_json::Value::String(shape_val)) => shape_val.to_owned(),
                    _ => "".to_string(),
                };
                match shape.as_str() {
                    "rectangle" => {
                        let width = match _val_.get("width") {
                            Some(serde_json::Value::Number(width_val)) => {
                                width_val.as_f64().unwrap_or(0.0)
                            }
                            _ => 0.0,
                        };
                        let height = match _val_.get("height") {
                            Some(serde_json::Value::Number(height_val)) => {
                                height_val.as_f64().unwrap_or(0.0)
                            }
                            _ => 0.0,
                        };
                        Self::Rectangle { width, height }
                    }
                    "circle" => {
                        let radius = match _val_.get("radius") {
                            Some(serde_json::Value::Number(radius_val)) => {
                                radius_val.as_f64().unwrap_or(0.0)
                            }
                            _ => 0.0,
                        };
                        Self::Circle { radius }
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
            Self::Rectangle { width, height } => {
                _json_output_.push_str("\"shape\":\"rectangle\"");
                _json_output_.push_str(",\"width\":");
                _json_output_.push_str(width.to_string().as_str());
                _json_output_.push_str(",\"height\":");
                _json_output_.push_str(height.to_string().as_str());
            }
            Self::Circle { radius } => {
                _json_output_.push_str("\"shape\":\"circle\"");
                _json_output_.push_str(",\"radius\":");
                _json_output_.push_str(radius.to_string().as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self {
            Self::Rectangle { width, height } => {
                _query_parts_.push("shape=rectangle".to_string());
                _query_parts_.push(format!("width={}", width));
                _query_parts_.push(format!("height={}", height));
            }
            Self::Circle { radius } => {
                _query_parts_.push("shape=circle".to_string());
                _query_parts_.push(format!("radius={}", radius));
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionAdjacent {
    Object(NestedObject),
    Array(Vec<String>),
    Boolean(bool),
    NullableTimestamp(Option<DateTime<FixedOffset>>),
}

impl ArriModel for UnionAdjacent {
    fn new() -> Self {
        Self::Object(NestedObject::new())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let kind = match _val_.get("kind") {
                    Some(serde_json::Value::String(kind_val)) => kind_val.to_owned(),
                    _ => "".to_string(),
                };
                match kind.as_str() {
                    "object" => {
                        let data = match _val_.get("data") {
                            Some(data_val) => NestedObject::from_json(data_val.to_owned()),
                            _ => NestedObject::new(),
                        };
                        Self::Object(data)
                    }
                    "array" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::Array(data_val)) => {
                                let mut data_val_result: Vec<String> = Vec::new();
                                for data_val_element in data_val {
                                    data_val_result.push(match Some(data_val_element) {
                                        Some(serde_json::Value::String(data_val_element_val)) => {
                                            data_val_element_val.to_owned()
                                        }
                                        _ => "".to_string(),
                                    });
                                }
                                data_val_result
                            }
                            _ => Vec::new(),
                        };
                        Self::Array(data)
                    }
                    "boolean" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::Bool(data_val)) => data_val.to_owned(),
                            _ => false,
                        };
                        Self::Boolean(data)
                    }
                    "nullable-timestamp" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::String(data_val)) => {
                                match DateTime::<FixedOffset>::parse_from_rfc3339(data_val) {
                                    Ok(data_val_result) => Some(data_val_result),
                                    Err(_) => None,
                                }
                            }
                            _ => None,
                        };
                        Self::NullableTimestamp(data)
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
            Self::Object(data) => {
                _json_output_.push_str("\"kind\":\"object\",\"data\":");
                _json_output_.push_str(data.to_json_string().as_str());
            }
            Self::Array(data) => {
                _json_output_.push_str("\"kind\":\"array\",\"data\":");
                _json_output_.push('[');
                for (_index_, _element_) in data.iter().enumerate() {
                    if _index_ != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(serialize_string(_element_).as_str());
                }
                _json_output_.push(']');
            }
            Self::Boolean(data) => {
                _json_output_.push_str("\"kind\":\"boolean\",\"data\":");
                _json_output_.push_str(data.to_string().as_str());
            }
            Self::NullableTimestamp(data) => {
                _json_output_.push_str("\"kind\":\"nullable-timestamp\",\"data\":");
                match data {
                    Some(data_val) => {
                        _json_output_.push_str(serialize_date_time(data_val, true).as_str());
                    }
                    _ => {
                        _json_output_.push_str("null");
                    }
                };
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping UnionAdjacent.");
        "".to_string()
    }
}

impl UnionAdjacent {
    pub fn kind(&self) -> &'static str {
        match &self {
            Self::Object(_) => "object",
            Self::Array(_) => "array",
            Self::Boolean(_) => "boolean",
            Self::NullableTimestamp(_) => "nullable-timestamp",
        }
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
    pub union_external: Option<UnionExternal>,
    pub union_internal: Option<UnionInternal>,
    pub union_adjacent: Option<UnionAdjacent>,
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
            union_external: None,
            union_internal: None,
            union_adjacent: None,
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
                let union_external = match _val_.get("unionExternal") {
                    Some(union_external_val) => match union_external_val {
                        serde_json::Value::Object(_) => {
                            Some(UnionExternal::from_json(union_external_val.to_owned()))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let union_internal = match _val_.get("unionInternal") {
                    Some(union_internal_val) => match union_internal_val {
                        serde_json::Value::Object(_) => {
                            Some(UnionInternal::from_json(union_internal_val.to_owned()))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let union_adjacent = match _val_.get("unionAdjacent") {
                    Some(union_adjacent_val) => match union_adjacent_val {
                        serde_json::Value::Object(_) => {
                            Some(UnionAdjacent::from_json(union_adjacent_val.to_owned()))
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
                    union_external,
                    union_internal,
                    union_adjacent,
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
                    _json_output_.push_str(format!("{}:", serialize_string(_key_)).as_str());
                    _json_output_.push_str(_value_.to_string().as_str());
                }
                _json_output_.push('}');
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.union_external {
            Some(union_external_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"unionExternal\":");
                _json_output_.push_str(union_external_val.to_json_string().as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.union_internal {
            Some(union_internal_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"unionInternal\":");
                _json_output_.push_str(union_internal_val.to_json_string().as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.union_adjacent {
            Some(union_adjacent_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"unionAdjacent\":");
                _json_output_.push_str(union_adjacent_val.to_json_string().as_str());
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
                _query_parts_.push(format!("string={}", encode_query_component(string_val)));
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
                    encode_query_component(&serialize_date_time(timestamp_val, false))
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
                _query_parts_.push(format!(
                    "enum={}",
                    encode_query_component(&enum_val.serial_value())
                ));
            }
            _ => {}
        };
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithOptionalFields/object.");
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /ObjectWithOptionalFields/array.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithOptionalFields/record.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithOptionalFields/unionExternal.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithOptionalFields/unionInternal.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithOptionalFields/unionAdjacent.");
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
    pub union_external: Option<UnionExternal>,
    pub union_internal: Option<UnionInternal>,
    pub union_adjacent: Option<UnionAdjacent>,
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
            union_external: None,
            union_internal: None,
            union_adjacent: None,
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
                let union_external = match _val_.get("unionExternal") {
                    Some(union_external_val) => match union_external_val {
                        serde_json::Value::Object(_) => {
                            Some(UnionExternal::from_json(union_external_val.to_owned()))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let union_internal = match _val_.get("unionInternal") {
                    Some(union_internal_val) => match union_internal_val {
                        serde_json::Value::Object(_) => {
                            Some(UnionInternal::from_json(union_internal_val.to_owned()))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let union_adjacent = match _val_.get("unionAdjacent") {
                    Some(union_adjacent_val) => match union_adjacent_val {
                        serde_json::Value::Object(_) => {
                            Some(UnionAdjacent::from_json(union_adjacent_val.to_owned()))
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
                    union_external,
                    union_internal,
                    union_adjacent,
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
                    _json_output_.push_str(format!("{}:", serialize_string(_key_)).as_str());
                    _json_output_.push_str(_value_.to_string().as_str());
                }
                _json_output_.push('}');
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"unionExternal\":");
        match &self.union_external {
            Some(union_external_val) => {
                _json_output_.push_str(union_external_val.to_json_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"unionInternal\":");
        match &self.union_internal {
            Some(union_internal_val) => {
                _json_output_.push_str(union_internal_val.to_json_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"unionAdjacent\":");
        match &self.union_adjacent {
            Some(union_adjacent_val) => {
                _json_output_.push_str(union_adjacent_val.to_json_string().as_str());
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
                _query_parts_.push(format!("string={}", encode_query_component(string_val)));
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
                    encode_query_component(&serialize_date_time(timestamp_val, false))
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
                _query_parts_.push(format!(
                    "enum={}",
                    encode_query_component(&enum_val.serial_value())
                ));
            }
            _ => {
                _query_parts_.push("enum=null".to_string());
            }
        };
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithNullableFields/object.");
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /ObjectWithNullableFields/array.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithNullableFields/record.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithNullableFields/unionExternal.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithNullableFields/unionInternal.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithNullableFields/unionAdjacent.");
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

#[derive(Clone, Debug, PartialEq)]
pub enum LegacyDiscriminator {
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

impl ArriModel for LegacyDiscriminator {
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
                _query_parts_.push("typeName=A".to_string());
                _query_parts_.push(format!("id={}", encode_query_component(id)));
            }
            Self::B { id, name } => {
                _query_parts_.push("typeName=B".to_string());
                _query_parts_.push(format!("id={}", encode_query_component(id)));
                _query_parts_.push(format!("name={}", encode_query_component(name)));
            }
            Self::C { id, name, date } => {
                _query_parts_.push("typeName=C".to_string());
                _query_parts_.push(format!("id={}", encode_query_component(id)));
                _query_parts_.push(format!("name={}", encode_query_component(name)));
                _query_parts_.push(format!(
                    "date={}",
                    encode_query_component(&serialize_date_time(date, false))
                ));
            }
        }
        _query_parts_.join("&")
    }
}
