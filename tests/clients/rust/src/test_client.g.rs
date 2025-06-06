#![allow(
    dead_code,
    unused_imports,
    unused_variables,
    unconditional_recursion,
    deprecated
)]
use arri_client::{
    chrono::{DateTime, FixedOffset},
    parsed_arri_request,
    reqwest::{self, Request},
    serde_json::{self, Map},
    sse::{parsed_arri_sse_request, ArriParsedSseRequestOptions, SseController, SseEvent},
    utils::{serialize_date_time, serialize_string},
    ArriClientConfig, ArriClientService, ArriEnum, ArriError, ArriModel, ArriParsedRequestOptions,
    EmptyArriModel, InternalArriClientConfig,
};
use std::collections::{BTreeMap, HashMap};

#[derive(Clone)]
pub struct TestClient {
    _config: InternalArriClientConfig,
    pub tests: TestClientTestsService,
    pub users: TestClientUsersService,
}

impl ArriClientService for TestClient {
    fn create(config: ArriClientConfig) -> Self {
        Self {
            _config: InternalArriClientConfig::from(config.clone()),
            tests: TestClientTestsService::create(config.clone()),
            users: TestClientUsersService::create(config),
        }
    }
    fn update_headers(&self, headers: HashMap<&'static str, String>) {
        let mut unwrapped_headers = self._config.headers.write().unwrap();
        *unwrapped_headers = headers.clone();
        self.tests.update_headers(headers.clone());
        self.users.update_headers(headers);
    }
}

impl TestClient {}

#[derive(Clone)]
pub struct TestClientTestsService {
    _config: InternalArriClientConfig,
}

impl ArriClientService for TestClientTestsService {
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

impl TestClientTestsService {
    pub async fn empty_params_get_request(&self) -> Result<DefaultPayload, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/empty-params-get-request",
                    &self._config.base_url
                ),
                method: reqwest::Method::GET,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            None::<EmptyArriModel>,
            |body| return DefaultPayload::from_json_string(body),
        )
        .await
    }
    pub async fn empty_params_post_request(&self) -> Result<DefaultPayload, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/empty-params-post-request",
                    &self._config.base_url
                ),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            None::<EmptyArriModel>,
            |body| return DefaultPayload::from_json_string(body),
        )
        .await
    }
    pub async fn empty_response_get_request(
        &self,
        params: DefaultPayload,
    ) -> Result<(), ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/empty-response-get-request",
                    &self._config.base_url
                ),
                method: reqwest::Method::GET,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| {},
        )
        .await
    }
    pub async fn empty_response_post_request(
        &self,
        params: DefaultPayload,
    ) -> Result<(), ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/empty-response-post-request",
                    &self._config.base_url
                ),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| {},
        )
        .await
    }
    /// If the target language supports it. Generated code should mark this procedure as deprecated.
    #[deprecated]
    pub async fn deprecated_rpc(&self, params: DeprecatedRpcParams) -> Result<(), ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!("{}/rpcs/tests/deprecated-rpc", &self._config.base_url),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| {},
        )
        .await
    }
    pub async fn send_discriminator_with_empty_object(
        &self,
        params: DiscriminatorWithEmptyObject,
    ) -> Result<DiscriminatorWithEmptyObject, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/send-discriminator-with-empty-object",
                    &self._config.base_url
                ),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| return DiscriminatorWithEmptyObject::from_json_string(body),
        )
        .await
    }
    pub async fn send_error(&self, params: SendErrorParams) -> Result<(), ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!("{}/rpcs/tests/send-error", &self._config.base_url),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| {},
        )
        .await
    }
    pub async fn send_object(
        &self,
        params: ObjectWithEveryType,
    ) -> Result<ObjectWithEveryType, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!("{}/rpcs/tests/send-object", &self._config.base_url),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| return ObjectWithEveryType::from_json_string(body),
        )
        .await
    }
    pub async fn send_object_with_nullable_fields(
        &self,
        params: ObjectWithEveryNullableType,
    ) -> Result<ObjectWithEveryNullableType, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/send-object-with-nullable-fields",
                    &self._config.base_url
                ),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| return ObjectWithEveryNullableType::from_json_string(body),
        )
        .await
    }
    pub async fn send_object_with_pascal_case_keys(
        &self,
        params: ObjectWithPascalCaseKeys,
    ) -> Result<ObjectWithPascalCaseKeys, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/send-object-with-pascal-case-keys",
                    &self._config.base_url
                ),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| return ObjectWithPascalCaseKeys::from_json_string(body),
        )
        .await
    }
    pub async fn send_object_with_snake_case_keys(
        &self,
        params: ObjectWithSnakeCaseKeys,
    ) -> Result<ObjectWithSnakeCaseKeys, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/send-object-with-snake-case-keys",
                    &self._config.base_url
                ),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| return ObjectWithSnakeCaseKeys::from_json_string(body),
        )
        .await
    }
    pub async fn send_partial_object(
        &self,
        params: ObjectWithEveryOptionalType,
    ) -> Result<ObjectWithEveryOptionalType, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!("{}/rpcs/tests/send-partial-object", &self._config.base_url),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| return ObjectWithEveryOptionalType::from_json_string(body),
        )
        .await
    }
    pub async fn send_recursive_object(
        &self,
        params: RecursiveObject,
    ) -> Result<RecursiveObject, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/send-recursive-object",
                    &self._config.base_url
                ),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| return RecursiveObject::from_json_string(body),
        )
        .await
    }
    pub async fn send_recursive_union(
        &self,
        params: RecursiveUnion,
    ) -> Result<RecursiveUnion, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!("{}/rpcs/tests/send-recursive-union", &self._config.base_url),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| return RecursiveUnion::from_json_string(body),
        )
        .await
    }
    pub async fn stream_auto_reconnect<OnEvent>(
        &self,
        params: AutoReconnectParams,
        on_event: &mut OnEvent,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) where
        OnEvent: FnMut(SseEvent<AutoReconnectResponse>, &mut SseController)
            + std::marker::Send
            + std::marker::Sync,
    {
        parsed_arri_sse_request(
            ArriParsedSseRequestOptions {
                client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/stream-auto-reconnect",
                    &self._config.base_url
                ),
                method: reqwest::Method::GET,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
                max_retry_count,
                max_retry_interval,
            },
            Some(params),
            on_event,
        )
        .await;
    }
    /// This route will always return an error. The client should automatically retry with exponential backoff.
    pub async fn stream_connection_error_test<OnEvent>(
        &self,
        params: StreamConnectionErrorTestParams,
        on_event: &mut OnEvent,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) where
        OnEvent: FnMut(SseEvent<StreamConnectionErrorTestResponse>, &mut SseController)
            + std::marker::Send
            + std::marker::Sync,
    {
        parsed_arri_sse_request(
            ArriParsedSseRequestOptions {
                client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/stream-connection-error-test",
                    &self._config.base_url
                ),
                method: reqwest::Method::GET,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
                max_retry_count,
                max_retry_interval,
            },
            Some(params),
            on_event,
        )
        .await;
    }
    /// Sends 5 messages quickly then starts sending messages slowly (1s) after that.
    /// When heartbeat is enabled the client should keep the connection alive regardless of the slowdown of messages.
    /// When heartbeat is disabled the client should open a new connection sometime after receiving the 5th message.
    pub async fn stream_heartbeat_detection_test<OnEvent>(
        &self,
        params: TestsStreamHeartbeatDetectionTestParams,
        on_event: &mut OnEvent,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) where
        OnEvent: FnMut(SseEvent<TestsStreamHeartbeatDetectionTestResponse>, &mut SseController)
            + std::marker::Send
            + std::marker::Sync,
    {
        parsed_arri_sse_request(
            ArriParsedSseRequestOptions {
                client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/stream-heartbeat-detection-test",
                    &self._config.base_url
                ),
                method: reqwest::Method::GET,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
                max_retry_count,
                max_retry_interval,
            },
            Some(params),
            on_event,
        )
        .await;
    }
    /// Test to ensure that the client can handle receiving streams of large objects. When objects are large messages will sometimes get sent in chunks. Meaning you have to handle receiving a partial message
    pub async fn stream_large_objects<OnEvent>(
        &self,

        on_event: &mut OnEvent,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) where
        OnEvent: FnMut(SseEvent<StreamLargeObjectsResponse>, &mut SseController)
            + std::marker::Send
            + std::marker::Sync,
    {
        parsed_arri_sse_request(
            ArriParsedSseRequestOptions {
                client: &self._config.http_client,
                url: format!("{}/rpcs/tests/stream-large-objects", &self._config.base_url),
                method: reqwest::Method::GET,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
                max_retry_count,
                max_retry_interval,
            },
            None::<EmptyArriModel>,
            on_event,
        )
        .await;
    }
    pub async fn stream_messages<OnEvent>(
        &self,
        params: ChatMessageParams,
        on_event: &mut OnEvent,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) where
        OnEvent: FnMut(SseEvent<ChatMessage>, &mut SseController)
            + std::marker::Send
            + std::marker::Sync,
    {
        parsed_arri_sse_request(
            ArriParsedSseRequestOptions {
                client: &self._config.http_client,
                url: format!("{}/rpcs/tests/stream-messages", &self._config.base_url),
                method: reqwest::Method::GET,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
                max_retry_count,
                max_retry_interval,
            },
            Some(params),
            on_event,
        )
        .await;
    }
    pub async fn stream_retry_with_new_credentials<OnEvent>(
        &self,

        on_event: &mut OnEvent,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) where
        OnEvent: FnMut(SseEvent<TestsStreamRetryWithNewCredentialsResponse>, &mut SseController)
            + std::marker::Send
            + std::marker::Sync,
    {
        parsed_arri_sse_request(
            ArriParsedSseRequestOptions {
                client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/stream-retry-with-new-credentials",
                    &self._config.base_url
                ),
                method: reqwest::Method::GET,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
                max_retry_count,
                max_retry_interval,
            },
            None::<EmptyArriModel>,
            on_event,
        )
        .await;
    }
    /// When the client receives the 'done' event, it should close the connection and NOT reconnect
    pub async fn stream_ten_events_then_end<OnEvent>(
        &self,

        on_event: &mut OnEvent,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) where
        OnEvent: FnMut(SseEvent<ChatMessage>, &mut SseController)
            + std::marker::Send
            + std::marker::Sync,
    {
        parsed_arri_sse_request(
            ArriParsedSseRequestOptions {
                client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/stream-ten-events-then-end",
                    &self._config.base_url
                ),
                method: reqwest::Method::GET,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
                max_retry_count,
                max_retry_interval,
            },
            None::<EmptyArriModel>,
            on_event,
        )
        .await;
    }
}

#[derive(Clone)]
pub struct TestClientUsersService {
    _config: InternalArriClientConfig,
}

impl ArriClientService for TestClientUsersService {
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

impl TestClientUsersService {
    pub async fn watch_user<OnEvent>(
        &self,
        params: UsersWatchUserParams,
        on_event: &mut OnEvent,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) where
        OnEvent: FnMut(SseEvent<UsersWatchUserResponse>, &mut SseController)
            + std::marker::Send
            + std::marker::Sync,
    {
        parsed_arri_sse_request(
            ArriParsedSseRequestOptions {
                client: &self._config.http_client,
                url: format!("{}/rpcs/users/watch-user", &self._config.base_url),
                method: reqwest::Method::GET,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
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
            serde_json::Value::Object(_val_) => {
                let hello = match _val_.get("hello") {
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

        _json_output_.push_str("\"hello\":");
        _json_output_.push_str(serialize_string(&self.hello).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("hello={}", &self.hello));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
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
            serde_json::Value::Object(_val_) => {
                let message = match _val_.get("message") {
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

        _json_output_.push_str("\"message\":");
        _json_output_.push_str(serialize_string(&self.message).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("message={}", &self.message));
        _query_parts_.join("&")
    }
}

#[deprecated]
#[derive(Clone, Debug, PartialEq)]
pub struct DeprecatedRpcParams {
    #[deprecated]
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
            serde_json::Value::Object(_val_) => {
                let deprecated_field = match _val_.get("deprecatedField") {
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

        _json_output_.push_str("\"deprecatedField\":");
        _json_output_.push_str(serialize_string(&self.deprecated_field).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("deprecatedField={}", &self.deprecated_field));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum DiscriminatorWithEmptyObject {
    Empty {},
    NotEmpty { foo: String, bar: f64, baz: bool },
}

impl ArriModel for DiscriminatorWithEmptyObject {
    fn new() -> Self {
        Self::Empty {}
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let r#type = match _val_.get("type") {
                    Some(serde_json::Value::String(r#type_val)) => r#type_val.to_owned(),
                    _ => "".to_string(),
                };
                match r#type.as_str() {
                    "EMPTY" => Self::Empty {},
                    "NOT_EMPTY" => {
                        let foo = match _val_.get("foo") {
                            Some(serde_json::Value::String(foo_val)) => foo_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let bar = match _val_.get("bar") {
                            Some(serde_json::Value::Number(bar_val)) => {
                                bar_val.as_f64().unwrap_or(0.0)
                            }
                            _ => 0.0,
                        };
                        let baz = match _val_.get("baz") {
                            Some(serde_json::Value::Bool(baz_val)) => baz_val.to_owned(),
                            _ => false,
                        };
                        Self::NotEmpty { foo, bar, baz }
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
            Self::Empty {} => {
                _json_output_.push_str("\"type\":\"EMPTY\"");
            }
            Self::NotEmpty { foo, bar, baz } => {
                _json_output_.push_str("\"type\":\"NOT_EMPTY\"");
                _json_output_.push_str(",\"foo\":");
                _json_output_.push_str(serialize_string(foo).as_str());
                _json_output_.push_str(",\"bar\":");
                _json_output_.push_str(bar.to_string().as_str());
                _json_output_.push_str(",\"baz\":");
                _json_output_.push_str(baz.to_string().as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self {
            Self::Empty {} => {
                _query_parts_.push(format!("type=EMPTY"));
            }
            Self::NotEmpty { foo, bar, baz } => {
                _query_parts_.push(format!("type=NOT_EMPTY"));
                _query_parts_.push(format!("foo={}", foo));
                _query_parts_.push(format!("bar={}", bar));
                _query_parts_.push(format!("baz={}", baz));
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct SendErrorParams {
    pub code: u16,
    pub message: String,
}

impl ArriModel for SendErrorParams {
    fn new() -> Self {
        Self {
            code: 0,
            message: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let code = match _val_.get("code") {
                    Some(serde_json::Value::Number(code_val)) => {
                        u16::try_from(code_val.as_u64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let message = match _val_.get("message") {
                    Some(serde_json::Value::String(message_val)) => message_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { code, message }
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

        _json_output_.push_str("\"code\":");
        _json_output_.push_str(&self.code.to_string().as_str());
        _json_output_.push_str(",\"message\":");
        _json_output_.push_str(serialize_string(&self.message).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("code={}", &self.code));
        _query_parts_.push(format!("message={}", &self.message));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
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
    pub record: BTreeMap<String, u64>,
    pub discriminator: ObjectWithEveryTypeDiscriminator,
    pub nested_object: ObjectWithEveryTypeNestedObject,
    pub nested_array: Vec<Vec<ObjectWithEveryTypeNestedArrayElementElement>>,
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
            enumerator: ObjectWithEveryTypeEnumerator::default(),
            array: Vec::new(),
            object: ObjectWithEveryTypeObject::new(),
            record: BTreeMap::new(),
            discriminator: ObjectWithEveryTypeDiscriminator::new(),
            nested_object: ObjectWithEveryTypeNestedObject::new(),
            nested_array: Vec::new(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let any = match _val_.get("any") {
                    Some(any_val) => any_val.to_owned(),
                    _ => serde_json::Value::Null,
                };
                let boolean = match _val_.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => boolean_val.to_owned(),
                    _ => false,
                };
                let string = match _val_.get("string") {
                    Some(serde_json::Value::String(string_val)) => string_val.to_owned(),
                    _ => "".to_string(),
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
                let enumerator = match _val_.get("enumerator") {
                    Some(serde_json::Value::String(enumerator_val)) => {
                        ObjectWithEveryTypeEnumerator::from_string(enumerator_val.to_owned())
                    }
                    _ => ObjectWithEveryTypeEnumerator::default(),
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
                let object = match _val_.get("object") {
                    Some(object_val) => ObjectWithEveryTypeObject::from_json(object_val.to_owned()),
                    _ => ObjectWithEveryTypeObject::new(),
                };
                let record = match _val_.get("record") {
                    Some(serde_json::Value::Object(record_val)) => {
                        let mut record_val_result: BTreeMap<String, u64> = BTreeMap::new();
                        for (_key_, _value_) in record_val.into_iter() {
                            record_val_result.insert(
                                _key_.to_owned(),
                                match Some(_value_.to_owned()) {
                                    Some(serde_json::Value::String(value_val)) => {
                                        value_val.parse::<u64>().unwrap_or(0)
                                    }
                                    _ => 0,
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
                            ObjectWithEveryTypeDiscriminator::from_json(
                                discriminator_val.to_owned(),
                            )
                        }
                        _ => ObjectWithEveryTypeDiscriminator::new(),
                    },
                    _ => ObjectWithEveryTypeDiscriminator::new(),
                };
                let nested_object = match _val_.get("nestedObject") {
                    Some(nested_object_val) => {
                        ObjectWithEveryTypeNestedObject::from_json(nested_object_val.to_owned())
                    }
                    _ => ObjectWithEveryTypeNestedObject::new(),
                };
                let nested_array = match _val_.get("nestedArray") {
                    Some(serde_json::Value::Array(nested_array_val)) => {
                        let mut nested_array_val_result: Vec<
                            Vec<ObjectWithEveryTypeNestedArrayElementElement>,
                        > = Vec::new();
                        for nested_array_val_element in nested_array_val {
                            nested_array_val_result.push(match Some(nested_array_val_element) {
                Some(serde_json::Value::Array(nested_array_val_element_val)) => {
                    let mut nested_array_val_element_val_result: Vec<ObjectWithEveryTypeNestedArrayElementElement> = Vec::new();
                    for nested_array_val_element_val_element in nested_array_val_element_val {
                        nested_array_val_element_val_result.push(match Some(nested_array_val_element_val_element) {
                Some(nested_array_val_element_val_element_val) => ObjectWithEveryTypeNestedArrayElementElement::from_json(nested_array_val_element_val_element_val.to_owned()),
                _ => ObjectWithEveryTypeNestedArrayElementElement::new(),
            });
                    }
                    nested_array_val_element_val_result
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

        _json_output_.push_str("\"any\":");
        _json_output_.push_str(
            serde_json::to_string(&self.any)
                .unwrap_or("null".to_string())
                .as_str(),
        );
        _json_output_.push_str(",\"boolean\":");
        _json_output_.push_str(&self.boolean.to_string().as_str());
        _json_output_.push_str(",\"string\":");
        _json_output_.push_str(serialize_string(&self.string).as_str());
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
        _json_output_.push_str(",\"enumerator\":");
        _json_output_.push_str(format!("\"{}\"", &self.enumerator.serial_value()).as_str());
        _json_output_.push_str(",\"array\":");
        _json_output_.push('[');
        for (_index_, _element_) in self.array.iter().enumerate() {
            if _index_ != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(_element_.to_string().as_str());
        }
        _json_output_.push(']');
        _json_output_.push_str(",\"object\":");
        _json_output_.push_str(&self.object.to_json_string().as_str());
        _json_output_.push_str(",\"record\":");
        _json_output_.push('{');
        for (_index_, (_key_, _value_)) in self.record.iter().enumerate() {
            if _index_ != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(format!("{}:", serialize_string(_key_)).as_str());
            _json_output_.push_str(format!("\"{}\"", _value_).as_str());
        }
        _json_output_.push('}');
        _json_output_.push_str(",\"discriminator\":");
        _json_output_.push_str(&self.discriminator.to_json_string().as_str());
        _json_output_.push_str(",\"nestedObject\":");
        _json_output_.push_str(&self.nested_object.to_json_string().as_str());
        _json_output_.push_str(",\"nestedArray\":");
        _json_output_.push('[');
        for (_index_, _element_) in self.nested_array.iter().enumerate() {
            if _index_ != 0 {
                _json_output_.push(',');
            }
            _json_output_.push('[');
            for (_index_, _element_) in _element_.iter().enumerate() {
                if _index_ != 0 {
                    _json_output_.push(',');
                }
                _json_output_.push_str(_element_.to_json_string().as_str());
            }
            _json_output_.push(']');
        }
        _json_output_.push(']');
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        println!("[WARNING] cannot serialize any's to query params. Skipping field at /ObjectWithEveryType/any.");
        _query_parts_.push(format!("boolean={}", &self.boolean));
        _query_parts_.push(format!("string={}", &self.string));
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
        _query_parts_.push(format!("enumerator={}", &self.enumerator.serial_value()));
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /ObjectWithEveryType/array.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryType/object.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryType/record.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryType/discriminator.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryType/nestedObject.");
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /ObjectWithEveryType/nestedArray.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ObjectWithEveryTypeEnumerator {
    A,
    B,
    C,
}

impl ArriEnum for ObjectWithEveryTypeEnumerator {
    fn default() -> Self {
        ObjectWithEveryTypeEnumerator::A
    }
    fn from_string(input: String) -> Self {
        match input.as_str() {
            "A" => Self::A,
            "B" => Self::B,
            "C" => Self::C,
            _ => Self::default(),
        }
    }
    fn serial_value(&self) -> String {
        match &self {
            ObjectWithEveryTypeEnumerator::A => "A".to_string(),
            ObjectWithEveryTypeEnumerator::B => "B".to_string(),
            ObjectWithEveryTypeEnumerator::C => "C".to_string(),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
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

        _json_output_.push_str("\"string\":");
        _json_output_.push_str(serialize_string(&self.string).as_str());
        _json_output_.push_str(",\"boolean\":");
        _json_output_.push_str(&self.boolean.to_string().as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(serialize_date_time(&self.timestamp, true).as_str());
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
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ObjectWithEveryTypeDiscriminator {
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
            serde_json::Value::Object(_val_) => {
                let r#type = match _val_.get("type") {
                    Some(serde_json::Value::String(r#type_val)) => r#type_val.to_owned(),
                    _ => "".to_string(),
                };
                match r#type.as_str() {
                    "A" => {
                        let title = match _val_.get("title") {
                            Some(serde_json::Value::String(title_val)) => title_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::A { title }
                    }
                    "B" => {
                        let title = match _val_.get("title") {
                            Some(serde_json::Value::String(title_val)) => title_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let description = match _val_.get("description") {
                            Some(serde_json::Value::String(description_val)) => {
                                description_val.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        Self::B { title, description }
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
            Self::A { title } => {
                _json_output_.push_str("\"type\":\"A\"");
                _json_output_.push_str(",\"title\":");
                _json_output_.push_str(serialize_string(title).as_str());
            }
            Self::B { title, description } => {
                _json_output_.push_str("\"type\":\"B\"");
                _json_output_.push_str(",\"title\":");
                _json_output_.push_str(serialize_string(title).as_str());
                _json_output_.push_str(",\"description\":");
                _json_output_.push_str(serialize_string(description).as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self {
            Self::A { title } => {
                _query_parts_.push(format!("type=A"));
                _query_parts_.push(format!("title={}", title));
            }
            Self::B { title, description } => {
                _query_parts_.push(format!("type=B"));
                _query_parts_.push(format!("title={}", title));
                _query_parts_.push(format!("description={}", description));
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
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
            serde_json::Value::Object(_val_) => {
                let id = match _val_.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match _val_.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                let data = match _val_.get("data") {
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

        _json_output_.push_str("\"id\":");
        _json_output_.push_str(serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(serialize_date_time(&self.timestamp, true).as_str());
        _json_output_.push_str(",\"data\":");
        _json_output_.push_str(&self.data.to_json_string().as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!(
            "timestamp={}",
            serialize_date_time(&self.timestamp, false)
        ));
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryTypeNestedObject/data.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
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
            serde_json::Value::Object(_val_) => {
                let id = match _val_.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match _val_.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                let data = match _val_.get("data") {
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

        _json_output_.push_str("\"id\":");
        _json_output_.push_str(serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(serialize_date_time(&self.timestamp, true).as_str());
        _json_output_.push_str(",\"data\":");
        _json_output_.push_str(&self.data.to_json_string().as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!(
            "timestamp={}",
            serialize_date_time(&self.timestamp, false)
        ));
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryTypeNestedObjectData/data.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
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
            serde_json::Value::Object(_val_) => {
                let id = match _val_.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match _val_.get("timestamp") {
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

        _json_output_.push_str("\"id\":");
        _json_output_.push_str(serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(serialize_date_time(&self.timestamp, true).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!(
            "timestamp={}",
            serialize_date_time(&self.timestamp, false)
        ));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithEveryTypeNestedArrayElementElement {
    pub id: String,
    pub timestamp: DateTime<FixedOffset>,
}

impl ArriModel for ObjectWithEveryTypeNestedArrayElementElement {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: DateTime::default(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let id = match _val_.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match _val_.get("timestamp") {
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

        _json_output_.push_str("\"id\":");
        _json_output_.push_str(serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(serialize_date_time(&self.timestamp, true).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!(
            "timestamp={}",
            serialize_date_time(&self.timestamp, false)
        ));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithEveryNullableType {
    pub any: serde_json::Value,
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
    pub record: Option<BTreeMap<String, Option<u64>>>,
    pub discriminator: Option<ObjectWithEveryNullableTypeDiscriminator>,
    pub nested_object: Option<ObjectWithEveryNullableTypeNestedObject>,
    pub nested_array:
        Option<Vec<Option<Vec<Option<ObjectWithEveryNullableTypeNestedArrayElementElement>>>>>,
}

impl ArriModel for ObjectWithEveryNullableType {
    fn new() -> Self {
        Self {
            any: serde_json::Value::Null,
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
            serde_json::Value::Object(_val_) => {
                let any = match _val_.get("any") {
                    Some(any_val) => any_val.to_owned(),
                    _ => serde_json::Value::Null,
                };
                let boolean = match _val_.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => Some(boolean_val.to_owned()),
                    _ => None,
                };
                let string = match _val_.get("string") {
                    Some(serde_json::Value::String(string_val)) => Some(string_val.to_owned()),
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
                let enumerator = match _val_.get("enumerator") {
                    Some(serde_json::Value::String(enumerator_val)) => {
                        Some(ObjectWithEveryNullableTypeEnumerator::from_string(
                            enumerator_val.to_owned(),
                        ))
                    }
                    _ => None,
                };
                let array = match _val_.get("array") {
                    Some(serde_json::Value::Array(array_val)) => {
                        let mut array_val_result: Vec<Option<bool>> = Vec::new();
                        for array_val_element in array_val {
                            array_val_result.push(match Some(array_val_element) {
                                Some(serde_json::Value::Bool(array_val_element_val)) => {
                                    Some(array_val_element_val.to_owned())
                                }
                                _ => None,
                            });
                        }
                        Some(array_val_result)
                    }
                    _ => None,
                };
                let object = match _val_.get("object") {
                    Some(object_val) => match object_val {
                        serde_json::Value::Object(_) => Some(
                            ObjectWithEveryNullableTypeObject::from_json(object_val.to_owned()),
                        ),
                        _ => None,
                    },
                    _ => None,
                };
                let record = match _val_.get("record") {
                    Some(serde_json::Value::Object(record_val)) => {
                        let mut record_val_result: BTreeMap<String, Option<u64>> = BTreeMap::new();
                        for (_key_, _value_) in record_val.into_iter() {
                            record_val_result.insert(
                                _key_.to_owned(),
                                match Some(_value_.to_owned()) {
                                    Some(serde_json::Value::String(value_val)) => {
                                        match value_val.parse::<u64>() {
                                            Ok(value_val_result) => Some(value_val_result),
                                            Err(_) => None,
                                        }
                                    }
                                    _ => None,
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
                            Some(ObjectWithEveryNullableTypeDiscriminator::from_json(
                                discriminator_val.to_owned(),
                            ))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let nested_object = match _val_.get("nestedObject") {
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
                let nested_array = match _val_.get("nestedArray") {
                    Some(serde_json::Value::Array(nested_array_val)) => {
                        let mut nested_array_val_result: Vec<
                            Option<
                                Vec<Option<ObjectWithEveryNullableTypeNestedArrayElementElement>>,
                            >,
                        > = Vec::new();
                        for nested_array_val_element in nested_array_val {
                            nested_array_val_result.push(match Some(nested_array_val_element) {
                    Some(serde_json::Value::Array(nested_array_val_element_val)) => {
                        let mut nested_array_val_element_val_result: Vec<Option<ObjectWithEveryNullableTypeNestedArrayElementElement>> = Vec::new();
                        for nested_array_val_element_val_element in nested_array_val_element_val {
                            nested_array_val_element_val_result.push(match Some(nested_array_val_element_val_element) {
                    Some(nested_array_val_element_val_element_val) => match nested_array_val_element_val_element_val {
                        serde_json::Value::Object(_) => {
                            Some(ObjectWithEveryNullableTypeNestedArrayElementElement::from_json(nested_array_val_element_val_element_val.to_owned()))
                        }
                        _ => None,
                    },
                    _ => None,
                });
                        }
                        Some(nested_array_val_element_val_result)
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

        _json_output_.push_str("\"any\":");
        _json_output_.push_str(
            serde_json::to_string(&self.any)
                .unwrap_or("null".to_string())
                .as_str(),
        );
        _json_output_.push_str(",\"boolean\":");
        match &self.boolean {
            Some(boolean_val) => {
                _json_output_.push_str(boolean_val.to_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"string\":");
        match &self.string {
            Some(string_val) => {
                _json_output_.push_str(serialize_string(string_val).as_str());
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
        _json_output_.push_str(",\"enumerator\":");
        match &self.enumerator {
            Some(enumerator_val) => {
                _json_output_.push_str(format!("\"{}\"", enumerator_val.serial_value()).as_str());
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
                    match _element_ {
                        Some(_element_val_) => {
                            _json_output_.push_str(_element_val_.to_string().as_str());
                        }
                        _ => {
                            _json_output_.push_str("null");
                        }
                    };
                }
                _json_output_.push(']');
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
        _json_output_.push_str(",\"record\":");
        match &self.record {
            Some(record_val) => {
                _json_output_.push('{');
                for (_index_, (_key_, _value_)) in record_val.iter().enumerate() {
                    if _index_ != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(format!("{}:", serialize_string(_key_)).as_str());
                    match _value_ {
                        Some(value_val) => {
                            _json_output_.push_str(format!("\"{}\"", value_val).as_str());
                        }
                        _ => {
                            _json_output_.push_str("null");
                        }
                    }
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
        _json_output_.push_str(",\"nestedObject\":");
        match &self.nested_object {
            Some(nested_object_val) => {
                _json_output_.push_str(nested_object_val.to_json_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"nestedArray\":");
        match &self.nested_array {
            Some(nested_array_val) => {
                _json_output_.push('[');
                for (_index_, _element_) in nested_array_val.iter().enumerate() {
                    if _index_ != 0 {
                        _json_output_.push(',');
                    }
                    match _element_ {
                        Some(_element_val_) => {
                            _json_output_.push('[');
                            for (_index_, _element_) in _element_val_.iter().enumerate() {
                                if _index_ != 0 {
                                    _json_output_.push(',');
                                }
                                match _element_ {
                                    Some(_element_val_) => {
                                        _json_output_
                                            .push_str(_element_val_.to_json_string().as_str());
                                    }
                                    _ => {
                                        _json_output_.push_str("null");
                                    }
                                };
                            }
                            _json_output_.push(']');
                        }
                        _ => {
                            _json_output_.push_str("null");
                        }
                    };
                }
                _json_output_.push(']');
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
        println!("[WARNING] cannot serialize any's to query params. Skipping field at /ObjectWithEveryNullableType/any.");
        match &self.boolean {
            Some(boolean_val) => {
                _query_parts_.push(format!("boolean={}", boolean_val));
            }
            _ => {
                _query_parts_.push("boolean=null".to_string());
            }
        };
        match &self.string {
            Some(string_val) => {
                _query_parts_.push(format!("string={}", string_val));
            }
            _ => {
                _query_parts_.push("string=null".to_string());
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
        match &self.enumerator {
            Some(enumerator_val) => {
                _query_parts_.push(format!("enumerator={}", enumerator_val.serial_value()));
            }
            _ => {
                _query_parts_.push("enumerator=null".to_string());
            }
        };
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /ObjectWithEveryNullableType/array.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryNullableType/object.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryNullableType/record.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryNullableType/discriminator.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryNullableType/nestedObject.");
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /ObjectWithEveryNullableType/nestedArray.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ObjectWithEveryNullableTypeEnumerator {
    A,
    B,
    C,
}

impl ArriEnum for ObjectWithEveryNullableTypeEnumerator {
    fn default() -> Self {
        ObjectWithEveryNullableTypeEnumerator::A
    }
    fn from_string(input: String) -> Self {
        match input.as_str() {
            "A" => Self::A,
            "B" => Self::B,
            "C" => Self::C,
            _ => Self::default(),
        }
    }
    fn serial_value(&self) -> String {
        match &self {
            ObjectWithEveryNullableTypeEnumerator::A => "A".to_string(),
            ObjectWithEveryNullableTypeEnumerator::B => "B".to_string(),
            ObjectWithEveryNullableTypeEnumerator::C => "C".to_string(),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
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
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ObjectWithEveryNullableTypeDiscriminator {
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
            serde_json::Value::Object(_val_) => {
                let r#type = match _val_.get("type") {
                    Some(serde_json::Value::String(r#type_val)) => r#type_val.to_owned(),
                    _ => "".to_string(),
                };
                match r#type.as_str() {
                    "A" => {
                        let title = match _val_.get("title") {
                            Some(serde_json::Value::String(title_val)) => {
                                Some(title_val.to_owned())
                            }
                            _ => None,
                        };
                        Self::A { title }
                    }
                    "B" => {
                        let title = match _val_.get("title") {
                            Some(serde_json::Value::String(title_val)) => {
                                Some(title_val.to_owned())
                            }
                            _ => None,
                        };
                        let description = match _val_.get("description") {
                            Some(serde_json::Value::String(description_val)) => {
                                Some(description_val.to_owned())
                            }
                            _ => None,
                        };
                        Self::B { title, description }
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
            Self::A { title } => {
                _json_output_.push_str("\"type\":\"A\"");
                _json_output_.push_str(",\"title\":");
                match title {
                    Some(title_val) => {
                        _json_output_.push_str(serialize_string(title_val).as_str());
                    }
                    _ => {
                        _json_output_.push_str("null");
                    }
                };
            }
            Self::B { title, description } => {
                _json_output_.push_str("\"type\":\"B\"");
                _json_output_.push_str(",\"title\":");
                match title {
                    Some(title_val) => {
                        _json_output_.push_str(serialize_string(title_val).as_str());
                    }
                    _ => {
                        _json_output_.push_str("null");
                    }
                };
                _json_output_.push_str(",\"description\":");
                match description {
                    Some(description_val) => {
                        _json_output_.push_str(serialize_string(description_val).as_str());
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
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self {
            Self::A { title } => {
                _query_parts_.push(format!("type=A"));
                match title {
                    Some(title_val) => {
                        _query_parts_.push(format!("title={}", title_val));
                    }
                    _ => {
                        _query_parts_.push("title=null".to_string());
                    }
                };
            }
            Self::B { title, description } => {
                _query_parts_.push(format!("type=B"));
                match title {
                    Some(title_val) => {
                        _query_parts_.push(format!("title={}", title_val));
                    }
                    _ => {
                        _query_parts_.push("title=null".to_string());
                    }
                };
                match description {
                    Some(description_val) => {
                        _query_parts_.push(format!("description={}", description_val));
                    }
                    _ => {
                        _query_parts_.push("description=null".to_string());
                    }
                };
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
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
            serde_json::Value::Object(_val_) => {
                let id = match _val_.get("id") {
                    Some(serde_json::Value::String(id_val)) => Some(id_val.to_owned()),
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
                let data = match _val_.get("data") {
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

        _json_output_.push_str("\"id\":");
        match &self.id {
            Some(id_val) => {
                _json_output_.push_str(serialize_string(id_val).as_str());
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
        _json_output_.push_str(",\"data\":");
        match &self.data {
            Some(data_val) => {
                _json_output_.push_str(data_val.to_json_string().as_str());
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
        match &self.id {
            Some(id_val) => {
                _query_parts_.push(format!("id={}", id_val));
            }
            _ => {
                _query_parts_.push("id=null".to_string());
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
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryNullableTypeNestedObject/data.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
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
            serde_json::Value::Object(_val_) => {
                let id = match _val_.get("id") {
                    Some(serde_json::Value::String(id_val)) => Some(id_val.to_owned()),
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
                let data = match _val_.get("data") {
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

        _json_output_.push_str("\"id\":");
        match &self.id {
            Some(id_val) => {
                _json_output_.push_str(serialize_string(id_val).as_str());
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
        _json_output_.push_str(",\"data\":");
        match &self.data {
            Some(data_val) => {
                _json_output_.push_str(data_val.to_json_string().as_str());
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
        match &self.id {
            Some(id_val) => {
                _query_parts_.push(format!("id={}", id_val));
            }
            _ => {
                _query_parts_.push("id=null".to_string());
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
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryNullableTypeNestedObjectData/data.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
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
            serde_json::Value::Object(_val_) => {
                let id = match _val_.get("id") {
                    Some(serde_json::Value::String(id_val)) => Some(id_val.to_owned()),
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

        _json_output_.push_str("\"id\":");
        match &self.id {
            Some(id_val) => {
                _json_output_.push_str(serialize_string(id_val).as_str());
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
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self.id {
            Some(id_val) => {
                _query_parts_.push(format!("id={}", id_val));
            }
            _ => {
                _query_parts_.push("id=null".to_string());
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
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithEveryNullableTypeNestedArrayElementElement {
    pub id: Option<String>,
    pub timestamp: Option<DateTime<FixedOffset>>,
}

impl ArriModel for ObjectWithEveryNullableTypeNestedArrayElementElement {
    fn new() -> Self {
        Self {
            id: None,
            timestamp: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let id = match _val_.get("id") {
                    Some(serde_json::Value::String(id_val)) => Some(id_val.to_owned()),
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

        _json_output_.push_str("\"id\":");
        match &self.id {
            Some(id_val) => {
                _json_output_.push_str(serialize_string(id_val).as_str());
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
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self.id {
            Some(id_val) => {
                _query_parts_.push(format!("id={}", id_val));
            }
            _ => {
                _query_parts_.push("id=null".to_string());
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
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithPascalCaseKeys {
    pub created_at: DateTime<FixedOffset>,
    pub display_name: String,
    pub phone_number: Option<String>,
    pub email_address: Option<String>,
    pub is_admin: Option<bool>,
}

impl ArriModel for ObjectWithPascalCaseKeys {
    fn new() -> Self {
        Self {
            created_at: DateTime::default(),
            display_name: "".to_string(),
            phone_number: None,
            email_address: None,
            is_admin: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let created_at = match _val_.get("CreatedAt") {
                    Some(serde_json::Value::String(created_at_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(created_at_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                let display_name = match _val_.get("DisplayName") {
                    Some(serde_json::Value::String(display_name_val)) => {
                        display_name_val.to_owned()
                    }
                    _ => "".to_string(),
                };
                let phone_number = match _val_.get("PhoneNumber") {
                    Some(serde_json::Value::String(phone_number_val)) => {
                        Some(phone_number_val.to_owned())
                    }
                    _ => None,
                };
                let email_address = match _val_.get("EmailAddress") {
                    Some(serde_json::Value::String(email_address_val)) => {
                        Some(email_address_val.to_owned())
                    }
                    _ => None,
                };
                let is_admin = match _val_.get("IsAdmin") {
                    Some(serde_json::Value::Bool(is_admin_val)) => Some(is_admin_val.to_owned()),
                    _ => None,
                };
                Self {
                    created_at,
                    display_name,
                    phone_number,
                    email_address,
                    is_admin,
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

        _json_output_.push_str("\"CreatedAt\":");
        _json_output_.push_str(serialize_date_time(&self.created_at, true).as_str());
        _json_output_.push_str(",\"DisplayName\":");
        _json_output_.push_str(serialize_string(&self.display_name).as_str());
        _json_output_.push_str(",\"PhoneNumber\":");
        match &self.phone_number {
            Some(phone_number_val) => {
                _json_output_.push_str(serialize_string(phone_number_val).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        match &self.email_address {
            Some(email_address_val) => {
                _json_output_.push_str(",\"EmailAddress\":");
                _json_output_.push_str(serialize_string(email_address_val).as_str())
            }
            _ => {}
        };
        match &self.is_admin {
            Some(is_admin_val) => {
                _json_output_.push_str(",\"IsAdmin\":");
                _json_output_.push_str(is_admin_val.to_string().as_str())
            }
            _ => {}
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!(
            "CreatedAt={}",
            serialize_date_time(&self.created_at, false)
        ));
        _query_parts_.push(format!("DisplayName={}", &self.display_name));
        match &self.phone_number {
            Some(phone_number_val) => {
                _query_parts_.push(format!("PhoneNumber={}", phone_number_val));
            }
            _ => {
                _query_parts_.push("PhoneNumber=null".to_string());
            }
        };
        match &self.email_address {
            Some(email_address_val) => {
                _query_parts_.push(format!("EmailAddress={}", email_address_val));
            }
            _ => {}
        };
        match &self.is_admin {
            Some(is_admin_val) => {
                _query_parts_.push(format!("IsAdmin={}", is_admin_val));
            }
            _ => {}
        };
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithSnakeCaseKeys {
    pub created_at: DateTime<FixedOffset>,
    pub display_name: String,
    pub phone_number: Option<String>,
    pub email_address: Option<String>,
    pub is_admin: Option<bool>,
}

impl ArriModel for ObjectWithSnakeCaseKeys {
    fn new() -> Self {
        Self {
            created_at: DateTime::default(),
            display_name: "".to_string(),
            phone_number: None,
            email_address: None,
            is_admin: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let created_at = match _val_.get("created_at") {
                    Some(serde_json::Value::String(created_at_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(created_at_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                let display_name = match _val_.get("display_name") {
                    Some(serde_json::Value::String(display_name_val)) => {
                        display_name_val.to_owned()
                    }
                    _ => "".to_string(),
                };
                let phone_number = match _val_.get("phone_number") {
                    Some(serde_json::Value::String(phone_number_val)) => {
                        Some(phone_number_val.to_owned())
                    }
                    _ => None,
                };
                let email_address = match _val_.get("email_address") {
                    Some(serde_json::Value::String(email_address_val)) => {
                        Some(email_address_val.to_owned())
                    }
                    _ => None,
                };
                let is_admin = match _val_.get("is_admin") {
                    Some(serde_json::Value::Bool(is_admin_val)) => Some(is_admin_val.to_owned()),
                    _ => None,
                };
                Self {
                    created_at,
                    display_name,
                    phone_number,
                    email_address,
                    is_admin,
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

        _json_output_.push_str("\"created_at\":");
        _json_output_.push_str(serialize_date_time(&self.created_at, true).as_str());
        _json_output_.push_str(",\"display_name\":");
        _json_output_.push_str(serialize_string(&self.display_name).as_str());
        _json_output_.push_str(",\"phone_number\":");
        match &self.phone_number {
            Some(phone_number_val) => {
                _json_output_.push_str(serialize_string(phone_number_val).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        match &self.email_address {
            Some(email_address_val) => {
                _json_output_.push_str(",\"email_address\":");
                _json_output_.push_str(serialize_string(email_address_val).as_str())
            }
            _ => {}
        };
        match &self.is_admin {
            Some(is_admin_val) => {
                _json_output_.push_str(",\"is_admin\":");
                _json_output_.push_str(is_admin_val.to_string().as_str())
            }
            _ => {}
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!(
            "created_at={}",
            serialize_date_time(&self.created_at, false)
        ));
        _query_parts_.push(format!("display_name={}", &self.display_name));
        match &self.phone_number {
            Some(phone_number_val) => {
                _query_parts_.push(format!("phone_number={}", phone_number_val));
            }
            _ => {
                _query_parts_.push("phone_number=null".to_string());
            }
        };
        match &self.email_address {
            Some(email_address_val) => {
                _query_parts_.push(format!("email_address={}", email_address_val));
            }
            _ => {}
        };
        match &self.is_admin {
            Some(is_admin_val) => {
                _query_parts_.push(format!("is_admin={}", is_admin_val));
            }
            _ => {}
        };
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
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
    pub record: Option<BTreeMap<String, u64>>,
    pub discriminator: Option<ObjectWithEveryOptionalTypeDiscriminator>,
    pub nested_object: Option<ObjectWithEveryOptionalTypeNestedObject>,
    pub nested_array: Option<Vec<Vec<ObjectWithEveryOptionalTypeNestedArrayElementElement>>>,
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
            serde_json::Value::Object(_val_) => {
                let any = match _val_.get("any") {
                    Some(any_val) => Some(any_val.to_owned()),
                    _ => None,
                };
                let boolean = match _val_.get("boolean") {
                    Some(serde_json::Value::Bool(boolean_val)) => Some(boolean_val.to_owned()),
                    _ => None,
                };
                let string = match _val_.get("string") {
                    Some(serde_json::Value::String(string_val)) => Some(string_val.to_owned()),
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
                let enumerator = match _val_.get("enumerator") {
                    Some(serde_json::Value::String(enumerator_val)) => {
                        Some(ObjectWithEveryOptionalTypeEnumerator::from_string(
                            enumerator_val.to_owned(),
                        ))
                    }
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
                let object = match _val_.get("object") {
                    Some(object_val) => match object_val {
                        serde_json::Value::Object(_) => Some(
                            ObjectWithEveryOptionalTypeObject::from_json(object_val.to_owned()),
                        ),
                        _ => None,
                    },
                    _ => None,
                };
                let record = match _val_.get("record") {
                    Some(serde_json::Value::Object(record_val)) => {
                        let mut record_val_result: BTreeMap<String, u64> = BTreeMap::new();
                        for (_key_, _value_) in record_val.into_iter() {
                            record_val_result.insert(
                                _key_.to_owned(),
                                match Some(_value_.to_owned()) {
                                    Some(serde_json::Value::String(value_val)) => {
                                        value_val.parse::<u64>().unwrap_or(0)
                                    }
                                    _ => 0,
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
                            Some(ObjectWithEveryOptionalTypeDiscriminator::from_json(
                                discriminator_val.to_owned(),
                            ))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let nested_object = match _val_.get("nestedObject") {
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
                let nested_array = match _val_.get("nestedArray") {
                    Some(serde_json::Value::Array(nested_array_val)) => {
                        let mut nested_array_val_result: Vec<
                            Vec<ObjectWithEveryOptionalTypeNestedArrayElementElement>,
                        > = Vec::new();
                        for nested_array_val_element in nested_array_val {
                            nested_array_val_result.push(match Some(nested_array_val_element) {
                Some(serde_json::Value::Array(nested_array_val_element_val)) => {
                    let mut nested_array_val_element_val_result: Vec<ObjectWithEveryOptionalTypeNestedArrayElementElement> = Vec::new();
                    for nested_array_val_element_val_element in nested_array_val_element_val {
                        nested_array_val_element_val_result.push(match Some(nested_array_val_element_val_element) {
                Some(nested_array_val_element_val_element_val) => ObjectWithEveryOptionalTypeNestedArrayElementElement::from_json(nested_array_val_element_val_element_val.to_owned()),
                _ => ObjectWithEveryOptionalTypeNestedArrayElementElement::new(),
            });
                    }
                    nested_array_val_element_val_result
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
        let mut _has_keys_ = false;
        match &self.any {
            Some(any_val) => {
                _json_output_.push_str("\"any\":");
                _json_output_.push_str(
                    serde_json::to_string(any_val)
                        .unwrap_or("null".to_string())
                        .as_str(),
                );
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
        match &self.string {
            Some(string_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"string\":");
                _json_output_.push_str(serialize_string(string_val).as_str());
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
        match &self.enumerator {
            Some(enumerator_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"enumerator\":");
                _json_output_.push_str(format!("\"{}\"", enumerator_val.serial_value()).as_str());
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
                    _json_output_.push_str(format!("\"{}\"", _value_).as_str());
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
        match &self.nested_object {
            Some(nested_object_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"nestedObject\":");
                _json_output_.push_str(nested_object_val.to_json_string().as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.nested_array {
            Some(nested_array_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"nestedArray\":");
                _json_output_.push('[');
                for (_index_, _element_) in nested_array_val.iter().enumerate() {
                    if _index_ != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push('[');
                    for (_index_, _element_) in _element_.iter().enumerate() {
                        if _index_ != 0 {
                            _json_output_.push(',');
                        }
                        _json_output_.push_str(_element_.to_json_string().as_str());
                    }
                    _json_output_.push(']');
                }
                _json_output_.push(']');
            }
            _ => {}
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        println!("[WARNING] cannot serialize any's to query params. Skipping field at /ObjectWithEveryOptionalType/any.");
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
        match &self.enumerator {
            Some(enumerator_val) => {
                _query_parts_.push(format!("enumerator={}", enumerator_val.serial_value()));
            }
            _ => {}
        };
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /ObjectWithEveryOptionalType/array.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryOptionalType/object.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryOptionalType/record.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryOptionalType/discriminator.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryOptionalType/nestedObject.");
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /ObjectWithEveryOptionalType/nestedArray.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ObjectWithEveryOptionalTypeEnumerator {
    A,
    B,
    C,
}

impl ArriEnum for ObjectWithEveryOptionalTypeEnumerator {
    fn default() -> Self {
        ObjectWithEveryOptionalTypeEnumerator::A
    }
    fn from_string(input: String) -> Self {
        match input.as_str() {
            "A" => Self::A,
            "B" => Self::B,
            "C" => Self::C,
            _ => Self::default(),
        }
    }
    fn serial_value(&self) -> String {
        match &self {
            ObjectWithEveryOptionalTypeEnumerator::A => "A".to_string(),
            ObjectWithEveryOptionalTypeEnumerator::B => "B".to_string(),
            ObjectWithEveryOptionalTypeEnumerator::C => "C".to_string(),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
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

        _json_output_.push_str("\"string\":");
        _json_output_.push_str(serialize_string(&self.string).as_str());
        _json_output_.push_str(",\"boolean\":");
        _json_output_.push_str(&self.boolean.to_string().as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(serialize_date_time(&self.timestamp, true).as_str());
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
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ObjectWithEveryOptionalTypeDiscriminator {
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
            serde_json::Value::Object(_val_) => {
                let r#type = match _val_.get("type") {
                    Some(serde_json::Value::String(r#type_val)) => r#type_val.to_owned(),
                    _ => "".to_string(),
                };
                match r#type.as_str() {
                    "A" => {
                        let title = match _val_.get("title") {
                            Some(serde_json::Value::String(title_val)) => title_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::A { title }
                    }
                    "B" => {
                        let title = match _val_.get("title") {
                            Some(serde_json::Value::String(title_val)) => title_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let description = match _val_.get("description") {
                            Some(serde_json::Value::String(description_val)) => {
                                description_val.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        Self::B { title, description }
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
            Self::A { title } => {
                _json_output_.push_str("\"type\":\"A\"");
                _json_output_.push_str(",\"title\":");
                _json_output_.push_str(serialize_string(title).as_str());
            }
            Self::B { title, description } => {
                _json_output_.push_str("\"type\":\"B\"");
                _json_output_.push_str(",\"title\":");
                _json_output_.push_str(serialize_string(title).as_str());
                _json_output_.push_str(",\"description\":");
                _json_output_.push_str(serialize_string(description).as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self {
            Self::A { title } => {
                _query_parts_.push(format!("type=A"));
                _query_parts_.push(format!("title={}", title));
            }
            Self::B { title, description } => {
                _query_parts_.push(format!("type=B"));
                _query_parts_.push(format!("title={}", title));
                _query_parts_.push(format!("description={}", description));
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
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
            serde_json::Value::Object(_val_) => {
                let id = match _val_.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match _val_.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                let data = match _val_.get("data") {
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

        _json_output_.push_str("\"id\":");
        _json_output_.push_str(serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(serialize_date_time(&self.timestamp, true).as_str());
        _json_output_.push_str(",\"data\":");
        _json_output_.push_str(&self.data.to_json_string().as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!(
            "timestamp={}",
            serialize_date_time(&self.timestamp, false)
        ));
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryOptionalTypeNestedObject/data.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
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
            serde_json::Value::Object(_val_) => {
                let id = match _val_.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match _val_.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                let data = match _val_.get("data") {
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

        _json_output_.push_str("\"id\":");
        _json_output_.push_str(serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(serialize_date_time(&self.timestamp, true).as_str());
        _json_output_.push_str(",\"data\":");
        _json_output_.push_str(&self.data.to_json_string().as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!(
            "timestamp={}",
            serialize_date_time(&self.timestamp, false)
        ));
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryOptionalTypeNestedObjectData/data.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
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
            serde_json::Value::Object(_val_) => {
                let id = match _val_.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match _val_.get("timestamp") {
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

        _json_output_.push_str("\"id\":");
        _json_output_.push_str(serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(serialize_date_time(&self.timestamp, true).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!(
            "timestamp={}",
            serialize_date_time(&self.timestamp, false)
        ));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithEveryOptionalTypeNestedArrayElementElement {
    pub id: String,
    pub timestamp: DateTime<FixedOffset>,
}

impl ArriModel for ObjectWithEveryOptionalTypeNestedArrayElementElement {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: DateTime::default(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let id = match _val_.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let timestamp = match _val_.get("timestamp") {
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

        _json_output_.push_str("\"id\":");
        _json_output_.push_str(serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(serialize_date_time(&self.timestamp, true).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!(
            "timestamp={}",
            serialize_date_time(&self.timestamp, false)
        ));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
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
                let value = match _val_.get("value") {
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
        _json_output_.push_str(",\"value\":");
        _json_output_.push_str(serialize_string(&self.value).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /RecursiveObject/left.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /RecursiveObject/right.");
        _query_parts_.push(format!("value={}", &self.value));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum RecursiveUnion {
    /// Child node
    Child { data: Box<RecursiveUnion> },
    /// List of children node
    Children { data: Vec<Box<RecursiveUnion>> },
    /// Text node
    Text { data: String },
    /// Shape node
    Shape { data: RecursiveUnionDataShape },
}

impl ArriModel for RecursiveUnion {
    fn new() -> Self {
        Self::Child {
            data: Box::new(RecursiveUnion::new()),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let r#type = match _val_.get("type") {
                    Some(serde_json::Value::String(r#type_val)) => r#type_val.to_owned(),
                    _ => "".to_string(),
                };
                match r#type.as_str() {
                    "CHILD" => {
                        let data = match _val_.get("data") {
                            Some(data_val) => match data_val {
                                serde_json::Value::Object(_) => {
                                    Box::new(RecursiveUnion::from_json(data_val.to_owned()))
                                }
                                _ => Box::new(RecursiveUnion::from_json(data_val.to_owned())),
                            },
                            _ => Box::new(RecursiveUnion::new()),
                        };
                        Self::Child { data }
                    }
                    "CHILDREN" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::Array(data_val)) => {
                                let mut data_val_result: Vec<Box<RecursiveUnion>> = Vec::new();
                                for data_val_element in data_val {
                                    data_val_result.push(match Some(data_val_element) {
                                        Some(data_val_element_val) => match data_val_element_val {
                                            serde_json::Value::Object(_) => {
                                                Box::new(RecursiveUnion::from_json(
                                                    data_val_element_val.to_owned(),
                                                ))
                                            }
                                            _ => Box::new(RecursiveUnion::from_json(
                                                data_val_element_val.to_owned(),
                                            )),
                                        },
                                        _ => Box::new(RecursiveUnion::new()),
                                    });
                                }
                                data_val_result
                            }
                            _ => Vec::new(),
                        };
                        Self::Children { data }
                    }
                    "TEXT" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::String(data_val)) => data_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::Text { data }
                    }
                    "SHAPE" => {
                        let data = match _val_.get("data") {
                            Some(data_val) => {
                                RecursiveUnionDataShape::from_json(data_val.to_owned())
                            }
                            _ => RecursiveUnionDataShape::new(),
                        };
                        Self::Shape { data }
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
            Self::Child { data } => {
                _json_output_.push_str("\"type\":\"CHILD\"");
                _json_output_.push_str(",\"data\":");
                _json_output_.push_str(data.to_json_string().as_str());
            }
            Self::Children { data } => {
                _json_output_.push_str("\"type\":\"CHILDREN\"");
                _json_output_.push_str(",\"data\":");
                _json_output_.push('[');
                for (_index_, _element_) in data.iter().enumerate() {
                    if _index_ != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(_element_.to_json_string().as_str());
                }
                _json_output_.push(']');
            }
            Self::Text { data } => {
                _json_output_.push_str("\"type\":\"TEXT\"");
                _json_output_.push_str(",\"data\":");
                _json_output_.push_str(serialize_string(data).as_str());
            }
            Self::Shape { data } => {
                _json_output_.push_str("\"type\":\"SHAPE\"");
                _json_output_.push_str(",\"data\":");
                _json_output_.push_str(data.to_json_string().as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self {
            Self::Child { data } => {
                _query_parts_.push(format!("type=CHILD"));
                println!("[WARNING] cannot serialize nested objects to query params. Skipping field at RecursiveUnion/data.");
            }
            Self::Children { data } => {
                _query_parts_.push(format!("type=CHILDREN"));
                println!("[WARNING] cannot serialize arrays to query params. Skipping field at RecursiveUnion/data.");
            }
            Self::Text { data } => {
                _query_parts_.push(format!("type=TEXT"));
                _query_parts_.push(format!("data={}", data));
            }
            Self::Shape { data } => {
                _query_parts_.push(format!("type=SHAPE"));
                println!("[WARNING] cannot serialize nested objects to query params. Skipping field at RecursiveUnion/data.");
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct RecursiveUnionDataShape {
    pub width: f64,
    pub height: f64,
    pub color: String,
}

impl ArriModel for RecursiveUnionDataShape {
    fn new() -> Self {
        Self {
            width: 0.0,
            height: 0.0,
            color: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let width = match _val_.get("width") {
                    Some(serde_json::Value::Number(width_val)) => width_val.as_f64().unwrap_or(0.0),
                    _ => 0.0,
                };
                let height = match _val_.get("height") {
                    Some(serde_json::Value::Number(height_val)) => {
                        height_val.as_f64().unwrap_or(0.0)
                    }
                    _ => 0.0,
                };
                let color = match _val_.get("color") {
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

        _json_output_.push_str("\"width\":");
        _json_output_.push_str(&self.width.to_string().as_str());
        _json_output_.push_str(",\"height\":");
        _json_output_.push_str(&self.height.to_string().as_str());
        _json_output_.push_str(",\"color\":");
        _json_output_.push_str(serialize_string(&self.color).as_str());
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

#[derive(Clone, Debug, PartialEq)]
pub struct AutoReconnectParams {
    pub message_count: u8,
}

impl ArriModel for AutoReconnectParams {
    fn new() -> Self {
        Self { message_count: 0 }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let message_count = match _val_.get("messageCount") {
                    Some(serde_json::Value::Number(message_count_val)) => {
                        u8::try_from(message_count_val.as_u64().unwrap_or(0)).unwrap_or(0)
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

#[derive(Clone, Debug, PartialEq)]
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
            serde_json::Value::Object(_val_) => {
                let count = match _val_.get("count") {
                    Some(serde_json::Value::Number(count_val)) => {
                        u8::try_from(count_val.as_u64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let message = match _val_.get("message") {
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

        _json_output_.push_str("\"count\":");
        _json_output_.push_str(&self.count.to_string().as_str());
        _json_output_.push_str(",\"message\":");
        _json_output_.push_str(serialize_string(&self.message).as_str());
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

#[derive(Clone, Debug, PartialEq)]
pub struct StreamConnectionErrorTestParams {
    pub status_code: i32,
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
            serde_json::Value::Object(_val_) => {
                let status_code = match _val_.get("statusCode") {
                    Some(serde_json::Value::Number(status_code_val)) => {
                        i32::try_from(status_code_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let status_message = match _val_.get("statusMessage") {
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

        _json_output_.push_str("\"statusCode\":");
        _json_output_.push_str(&self.status_code.to_string().as_str());
        _json_output_.push_str(",\"statusMessage\":");
        _json_output_.push_str(serialize_string(&self.status_message).as_str());
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

#[derive(Clone, Debug, PartialEq)]
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
            serde_json::Value::Object(_val_) => {
                let message = match _val_.get("message") {
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

        _json_output_.push_str("\"message\":");
        _json_output_.push_str(serialize_string(&self.message).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("message={}", &self.message));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct TestsStreamHeartbeatDetectionTestParams {
    pub heartbeat_enabled: bool,
}

impl ArriModel for TestsStreamHeartbeatDetectionTestParams {
    fn new() -> Self {
        Self {
            heartbeat_enabled: false,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let heartbeat_enabled = match _val_.get("heartbeatEnabled") {
                    Some(serde_json::Value::Bool(heartbeat_enabled_val)) => {
                        heartbeat_enabled_val.to_owned()
                    }
                    _ => false,
                };
                Self { heartbeat_enabled }
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

        _json_output_.push_str("\"heartbeatEnabled\":");
        _json_output_.push_str(&self.heartbeat_enabled.to_string().as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("heartbeatEnabled={}", &self.heartbeat_enabled));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct TestsStreamHeartbeatDetectionTestResponse {
    pub message: String,
}

impl ArriModel for TestsStreamHeartbeatDetectionTestResponse {
    fn new() -> Self {
        Self {
            message: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let message = match _val_.get("message") {
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

        _json_output_.push_str("\"message\":");
        _json_output_.push_str(serialize_string(&self.message).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("message={}", &self.message));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct StreamLargeObjectsResponse {
    pub numbers: Vec<f64>,
    pub objects: Vec<StreamLargeObjectsResponseObjectsElement>,
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
            serde_json::Value::Object(_val_) => {
                let numbers = match _val_.get("numbers") {
                    Some(serde_json::Value::Array(numbers_val)) => {
                        let mut numbers_val_result: Vec<f64> = Vec::new();
                        for numbers_val_element in numbers_val {
                            numbers_val_result.push(match Some(numbers_val_element) {
                                Some(serde_json::Value::Number(numbers_val_element_val)) => {
                                    numbers_val_element_val.as_f64().unwrap_or(0.0)
                                }
                                _ => 0.0,
                            });
                        }
                        numbers_val_result
                    }
                    _ => Vec::new(),
                };
                let objects = match _val_.get("objects") {
                    Some(serde_json::Value::Array(objects_val)) => {
                        let mut objects_val_result: Vec<StreamLargeObjectsResponseObjectsElement> =
                            Vec::new();
                        for objects_val_element in objects_val {
                            objects_val_result.push(match Some(objects_val_element) {
                                Some(objects_val_element_val) => {
                                    StreamLargeObjectsResponseObjectsElement::from_json(
                                        objects_val_element_val.to_owned(),
                                    )
                                }
                                _ => StreamLargeObjectsResponseObjectsElement::new(),
                            });
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

        _json_output_.push_str("\"numbers\":");
        _json_output_.push('[');
        for (_index_, _element_) in self.numbers.iter().enumerate() {
            if _index_ != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(_element_.to_string().as_str());
        }
        _json_output_.push(']');
        _json_output_.push_str(",\"objects\":");
        _json_output_.push('[');
        for (_index_, _element_) in self.objects.iter().enumerate() {
            if _index_ != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(_element_.to_json_string().as_str());
        }
        _json_output_.push(']');
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /StreamLargeObjectsResponse/numbers.");
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /StreamLargeObjectsResponse/objects.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct StreamLargeObjectsResponseObjectsElement {
    pub id: String,
    pub name: String,
    pub email: String,
}

impl ArriModel for StreamLargeObjectsResponseObjectsElement {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            name: "".to_string(),
            email: "".to_string(),
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
                let email = match _val_.get("email") {
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

        _json_output_.push_str("\"id\":");
        _json_output_.push_str(serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"name\":");
        _json_output_.push_str(serialize_string(&self.name).as_str());
        _json_output_.push_str(",\"email\":");
        _json_output_.push_str(serialize_string(&self.email).as_str());
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

#[derive(Clone, Debug, PartialEq)]
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
            serde_json::Value::Object(_val_) => {
                let channel_id = match _val_.get("channelId") {
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

        _json_output_.push_str("\"channelId\":");
        _json_output_.push_str(serialize_string(&self.channel_id).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("channelId={}", &self.channel_id));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ChatMessage {
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
            serde_json::Value::Object(_val_) => {
                let message_type = match _val_.get("messageType") {
                    Some(serde_json::Value::String(message_type_val)) => {
                        message_type_val.to_owned()
                    }
                    _ => "".to_string(),
                };
                match message_type.as_str() {
                    "TEXT" => {
                        let id = match _val_.get("id") {
                            Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let channel_id = match _val_.get("channelId") {
                            Some(serde_json::Value::String(channel_id_val)) => {
                                channel_id_val.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        let user_id = match _val_.get("userId") {
                            Some(serde_json::Value::String(user_id_val)) => user_id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let date = match _val_.get("date") {
                            Some(serde_json::Value::String(date_val)) => {
                                DateTime::<FixedOffset>::parse_from_rfc3339(date_val)
                                    .unwrap_or(DateTime::default())
                            }
                            _ => DateTime::default(),
                        };
                        let text = match _val_.get("text") {
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
                        let id = match _val_.get("id") {
                            Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let channel_id = match _val_.get("channelId") {
                            Some(serde_json::Value::String(channel_id_val)) => {
                                channel_id_val.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        let user_id = match _val_.get("userId") {
                            Some(serde_json::Value::String(user_id_val)) => user_id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let date = match _val_.get("date") {
                            Some(serde_json::Value::String(date_val)) => {
                                DateTime::<FixedOffset>::parse_from_rfc3339(date_val)
                                    .unwrap_or(DateTime::default())
                            }
                            _ => DateTime::default(),
                        };
                        let image = match _val_.get("image") {
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
                        let id = match _val_.get("id") {
                            Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let channel_id = match _val_.get("channelId") {
                            Some(serde_json::Value::String(channel_id_val)) => {
                                channel_id_val.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        let user_id = match _val_.get("userId") {
                            Some(serde_json::Value::String(user_id_val)) => user_id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let date = match _val_.get("date") {
                            Some(serde_json::Value::String(date_val)) => {
                                DateTime::<FixedOffset>::parse_from_rfc3339(date_val)
                                    .unwrap_or(DateTime::default())
                            }
                            _ => DateTime::default(),
                        };
                        let url = match _val_.get("url") {
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
            Self::Text {
                id,
                channel_id,
                user_id,
                date,
                text,
            } => {
                _json_output_.push_str("\"messageType\":\"TEXT\"");
                _json_output_.push_str(",\"id\":");
                _json_output_.push_str(serialize_string(id).as_str());
                _json_output_.push_str(",\"channelId\":");
                _json_output_.push_str(serialize_string(channel_id).as_str());
                _json_output_.push_str(",\"userId\":");
                _json_output_.push_str(serialize_string(user_id).as_str());
                _json_output_.push_str(",\"date\":");
                _json_output_.push_str(serialize_date_time(date, true).as_str());
                _json_output_.push_str(",\"text\":");
                _json_output_.push_str(serialize_string(text).as_str());
            }
            Self::Image {
                id,
                channel_id,
                user_id,
                date,
                image,
            } => {
                _json_output_.push_str("\"messageType\":\"IMAGE\"");
                _json_output_.push_str(",\"id\":");
                _json_output_.push_str(serialize_string(id).as_str());
                _json_output_.push_str(",\"channelId\":");
                _json_output_.push_str(serialize_string(channel_id).as_str());
                _json_output_.push_str(",\"userId\":");
                _json_output_.push_str(serialize_string(user_id).as_str());
                _json_output_.push_str(",\"date\":");
                _json_output_.push_str(serialize_date_time(date, true).as_str());
                _json_output_.push_str(",\"image\":");
                _json_output_.push_str(serialize_string(image).as_str());
            }
            Self::Url {
                id,
                channel_id,
                user_id,
                date,
                url,
            } => {
                _json_output_.push_str("\"messageType\":\"URL\"");
                _json_output_.push_str(",\"id\":");
                _json_output_.push_str(serialize_string(id).as_str());
                _json_output_.push_str(",\"channelId\":");
                _json_output_.push_str(serialize_string(channel_id).as_str());
                _json_output_.push_str(",\"userId\":");
                _json_output_.push_str(serialize_string(user_id).as_str());
                _json_output_.push_str(",\"date\":");
                _json_output_.push_str(serialize_date_time(date, true).as_str());
                _json_output_.push_str(",\"url\":");
                _json_output_.push_str(serialize_string(url).as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self {
            Self::Text {
                id,
                channel_id,
                user_id,
                date,
                text,
            } => {
                _query_parts_.push(format!("messageType=TEXT"));
                _query_parts_.push(format!("id={}", id));
                _query_parts_.push(format!("channelId={}", channel_id));
                _query_parts_.push(format!("userId={}", user_id));
                _query_parts_.push(format!("date={}", serialize_date_time(date, false)));
                _query_parts_.push(format!("text={}", text));
            }
            Self::Image {
                id,
                channel_id,
                user_id,
                date,
                image,
            } => {
                _query_parts_.push(format!("messageType=IMAGE"));
                _query_parts_.push(format!("id={}", id));
                _query_parts_.push(format!("channelId={}", channel_id));
                _query_parts_.push(format!("userId={}", user_id));
                _query_parts_.push(format!("date={}", serialize_date_time(date, false)));
                _query_parts_.push(format!("image={}", image));
            }
            Self::Url {
                id,
                channel_id,
                user_id,
                date,
                url,
            } => {
                _query_parts_.push(format!("messageType=URL"));
                _query_parts_.push(format!("id={}", id));
                _query_parts_.push(format!("channelId={}", channel_id));
                _query_parts_.push(format!("userId={}", user_id));
                _query_parts_.push(format!("date={}", serialize_date_time(date, false)));
                _query_parts_.push(format!("url={}", url));
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct TestsStreamRetryWithNewCredentialsResponse {
    pub message: String,
}

impl ArriModel for TestsStreamRetryWithNewCredentialsResponse {
    fn new() -> Self {
        Self {
            message: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let message = match _val_.get("message") {
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

        _json_output_.push_str("\"message\":");
        _json_output_.push_str(serialize_string(&self.message).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("message={}", &self.message));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct UsersWatchUserParams {
    pub user_id: String,
}

impl ArriModel for UsersWatchUserParams {
    fn new() -> Self {
        Self {
            user_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let user_id = match _val_.get("userId") {
                    Some(serde_json::Value::String(user_id_val)) => user_id_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { user_id }
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

        _json_output_.push_str("\"userId\":");
        _json_output_.push_str(serialize_string(&self.user_id).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("userId={}", &self.user_id));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct UsersWatchUserResponse {
    pub id: String,
    pub role: UsersWatchUserResponseRole,
    /// A profile picture
    pub photo: Option<UserPhoto>,
    pub created_at: DateTime<FixedOffset>,
    pub num_followers: i32,
    pub settings: UserSettings,
    pub recent_notifications: Vec<UsersWatchUserResponseRecentNotificationsElement>,
    pub bookmarks: BTreeMap<String, UsersWatchUserResponseBookmarksValue>,
    pub metadata: BTreeMap<String, serde_json::Value>,
    pub random_list: Vec<serde_json::Value>,
    pub bio: Option<String>,
}

impl ArriModel for UsersWatchUserResponse {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            role: UsersWatchUserResponseRole::default(),
            photo: None,
            created_at: DateTime::default(),
            num_followers: 0,
            settings: UserSettings::new(),
            recent_notifications: Vec::new(),
            bookmarks: BTreeMap::new(),
            metadata: BTreeMap::new(),
            random_list: Vec::new(),
            bio: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let id = match _val_.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let role = match _val_.get("role") {
                    Some(serde_json::Value::String(role_val)) => {
                        UsersWatchUserResponseRole::from_string(role_val.to_owned())
                    }
                    _ => UsersWatchUserResponseRole::default(),
                };
                let photo = match _val_.get("photo") {
                    Some(photo_val) => match photo_val {
                        serde_json::Value::Object(_) => {
                            Some(UserPhoto::from_json(photo_val.to_owned()))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let created_at = match _val_.get("createdAt") {
                    Some(serde_json::Value::String(created_at_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(created_at_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                let num_followers = match _val_.get("numFollowers") {
                    Some(serde_json::Value::Number(num_followers_val)) => {
                        i32::try_from(num_followers_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let settings = match _val_.get("settings") {
                    Some(settings_val) => UserSettings::from_json(settings_val.to_owned()),
                    _ => UserSettings::new(),
                };
                let recent_notifications = match _val_.get("recentNotifications") {
                    Some(serde_json::Value::Array(recent_notifications_val)) => {
                        let mut recent_notifications_val_result: Vec<
                            UsersWatchUserResponseRecentNotificationsElement,
                        > = Vec::new();
                        for recent_notifications_val_element in recent_notifications_val {
                            recent_notifications_val_result.push(match Some(recent_notifications_val_element) {
                Some(recent_notifications_val_element_val) => match recent_notifications_val_element_val {
                    serde_json::Value::Object(_) => {
                        UsersWatchUserResponseRecentNotificationsElement::from_json(recent_notifications_val_element_val.to_owned())
                    }
                    _ => UsersWatchUserResponseRecentNotificationsElement::new(),
                },
                _ => UsersWatchUserResponseRecentNotificationsElement::new(),
            });
                        }
                        recent_notifications_val_result
                    }
                    _ => Vec::new(),
                };
                let bookmarks = match _val_.get("bookmarks") {
                    Some(serde_json::Value::Object(bookmarks_val)) => {
                        let mut bookmarks_val_result: BTreeMap<
                            String,
                            UsersWatchUserResponseBookmarksValue,
                        > = BTreeMap::new();
                        for (_key_, _value_) in bookmarks_val.into_iter() {
                            bookmarks_val_result.insert(
                                _key_.to_owned(),
                                match Some(_value_.to_owned()) {
                                    Some(value_val) => {
                                        UsersWatchUserResponseBookmarksValue::from_json(
                                            value_val.to_owned(),
                                        )
                                    }
                                    _ => UsersWatchUserResponseBookmarksValue::new(),
                                },
                            );
                        }
                        bookmarks_val_result
                    }
                    _ => BTreeMap::new(),
                };
                let metadata = match _val_.get("metadata") {
                    Some(serde_json::Value::Object(metadata_val)) => {
                        let mut metadata_val_result: BTreeMap<String, serde_json::Value> =
                            BTreeMap::new();
                        for (_key_, _value_) in metadata_val.into_iter() {
                            metadata_val_result.insert(
                                _key_.to_owned(),
                                match Some(_value_.to_owned()) {
                                    Some(value_val) => value_val.to_owned(),
                                    _ => serde_json::Value::Null,
                                },
                            );
                        }
                        metadata_val_result
                    }
                    _ => BTreeMap::new(),
                };
                let random_list = match _val_.get("randomList") {
                    Some(serde_json::Value::Array(random_list_val)) => {
                        let mut random_list_val_result: Vec<serde_json::Value> = Vec::new();
                        for random_list_val_element in random_list_val {
                            random_list_val_result.push(match Some(random_list_val_element) {
                                Some(random_list_val_element_val) => {
                                    random_list_val_element_val.to_owned()
                                }
                                _ => serde_json::Value::Null,
                            });
                        }
                        random_list_val_result
                    }
                    _ => Vec::new(),
                };
                let bio = match _val_.get("bio") {
                    Some(serde_json::Value::String(bio_val)) => Some(bio_val.to_owned()),
                    _ => None,
                };
                Self {
                    id,
                    role,
                    photo,
                    created_at,
                    num_followers,
                    settings,
                    recent_notifications,
                    bookmarks,
                    metadata,
                    random_list,
                    bio,
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
        _json_output_.push_str(",\"role\":");
        _json_output_.push_str(format!("\"{}\"", &self.role.serial_value()).as_str());
        _json_output_.push_str(",\"photo\":");
        match &self.photo {
            Some(photo_val) => {
                _json_output_.push_str(photo_val.to_json_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"createdAt\":");
        _json_output_.push_str(serialize_date_time(&self.created_at, true).as_str());
        _json_output_.push_str(",\"numFollowers\":");
        _json_output_.push_str(&self.num_followers.to_string().as_str());
        _json_output_.push_str(",\"settings\":");
        _json_output_.push_str(&self.settings.to_json_string().as_str());
        _json_output_.push_str(",\"recentNotifications\":");
        _json_output_.push('[');
        for (_index_, _element_) in self.recent_notifications.iter().enumerate() {
            if _index_ != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(_element_.to_json_string().as_str());
        }
        _json_output_.push(']');
        _json_output_.push_str(",\"bookmarks\":");
        _json_output_.push('{');
        for (_index_, (_key_, _value_)) in self.bookmarks.iter().enumerate() {
            if _index_ != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(format!("{}:", serialize_string(_key_)).as_str());
            _json_output_.push_str(_value_.to_json_string().as_str());
        }
        _json_output_.push('}');
        _json_output_.push_str(",\"metadata\":");
        _json_output_.push('{');
        for (_index_, (_key_, _value_)) in self.metadata.iter().enumerate() {
            if _index_ != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(format!("{}:", serialize_string(_key_)).as_str());
            _json_output_.push_str(
                serde_json::to_string(_value_)
                    .unwrap_or("null".to_string())
                    .as_str(),
            );
        }
        _json_output_.push('}');
        _json_output_.push_str(",\"randomList\":");
        _json_output_.push('[');
        for (_index_, _element_) in self.random_list.iter().enumerate() {
            if _index_ != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(
                serde_json::to_string(_element_)
                    .unwrap_or("null".to_string())
                    .as_str(),
            );
        }
        _json_output_.push(']');
        match &self.bio {
            Some(bio_val) => {
                _json_output_.push_str(",\"bio\":");
                _json_output_.push_str(serialize_string(bio_val).as_str())
            }
            _ => {}
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!("role={}", &self.role.serial_value()));
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /UsersWatchUserResponse/photo.");
        _query_parts_.push(format!(
            "createdAt={}",
            serialize_date_time(&self.created_at, false)
        ));
        _query_parts_.push(format!("numFollowers={}", &self.num_followers));
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /UsersWatchUserResponse/settings.");
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /UsersWatchUserResponse/recentNotifications.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /UsersWatchUserResponse/bookmarks.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /UsersWatchUserResponse/metadata.");
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /UsersWatchUserResponse/randomList.");
        match &self.bio {
            Some(bio_val) => {
                _query_parts_.push(format!("bio={}", bio_val));
            }
            _ => {}
        };
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UsersWatchUserResponseRole {
    Standard,
    Admin,
}

impl ArriEnum for UsersWatchUserResponseRole {
    fn default() -> Self {
        UsersWatchUserResponseRole::Standard
    }
    fn from_string(input: String) -> Self {
        match input.as_str() {
            "standard" => Self::Standard,
            "admin" => Self::Admin,
            _ => Self::default(),
        }
    }
    fn serial_value(&self) -> String {
        match &self {
            UsersWatchUserResponseRole::Standard => "standard".to_string(),
            UsersWatchUserResponseRole::Admin => "admin".to_string(),
        }
    }
}

/// A profile picture
#[derive(Clone, Debug, PartialEq)]
pub struct UserPhoto {
    pub url: String,
    pub width: f64,
    pub height: f64,
    pub bytes: i64,
    /// When the photo was last updated in nanoseconds
    pub nanoseconds: u64,
}

impl ArriModel for UserPhoto {
    fn new() -> Self {
        Self {
            url: "".to_string(),
            width: 0.0,
            height: 0.0,
            bytes: 0,
            nanoseconds: 0,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let url = match _val_.get("url") {
                    Some(serde_json::Value::String(url_val)) => url_val.to_owned(),
                    _ => "".to_string(),
                };
                let width = match _val_.get("width") {
                    Some(serde_json::Value::Number(width_val)) => width_val.as_f64().unwrap_or(0.0),
                    _ => 0.0,
                };
                let height = match _val_.get("height") {
                    Some(serde_json::Value::Number(height_val)) => {
                        height_val.as_f64().unwrap_or(0.0)
                    }
                    _ => 0.0,
                };
                let bytes = match _val_.get("bytes") {
                    Some(serde_json::Value::String(bytes_val)) => {
                        bytes_val.parse::<i64>().unwrap_or(0)
                    }
                    _ => 0,
                };
                let nanoseconds = match _val_.get("nanoseconds") {
                    Some(serde_json::Value::String(nanoseconds_val)) => {
                        nanoseconds_val.parse::<u64>().unwrap_or(0)
                    }
                    _ => 0,
                };
                Self {
                    url,
                    width,
                    height,
                    bytes,
                    nanoseconds,
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

        _json_output_.push_str("\"url\":");
        _json_output_.push_str(serialize_string(&self.url).as_str());
        _json_output_.push_str(",\"width\":");
        _json_output_.push_str(&self.width.to_string().as_str());
        _json_output_.push_str(",\"height\":");
        _json_output_.push_str(&self.height.to_string().as_str());
        _json_output_.push_str(",\"bytes\":");
        _json_output_.push_str(format!("\"{}\"", &self.bytes).as_str());
        _json_output_.push_str(",\"nanoseconds\":");
        _json_output_.push_str(format!("\"{}\"", &self.nanoseconds).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("url={}", &self.url));
        _query_parts_.push(format!("width={}", &self.width));
        _query_parts_.push(format!("height={}", &self.height));
        _query_parts_.push(format!("bytes={}", &self.bytes));
        _query_parts_.push(format!("nanoseconds={}", &self.nanoseconds));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct UserSettings {
    pub notifications_enabled: bool,
    pub preferred_theme: UserSettingsPreferredTheme,
}

impl ArriModel for UserSettings {
    fn new() -> Self {
        Self {
            notifications_enabled: false,
            preferred_theme: UserSettingsPreferredTheme::default(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let notifications_enabled = match _val_.get("notificationsEnabled") {
                    Some(serde_json::Value::Bool(notifications_enabled_val)) => {
                        notifications_enabled_val.to_owned()
                    }
                    _ => false,
                };
                let preferred_theme = match _val_.get("preferredTheme") {
                    Some(serde_json::Value::String(preferred_theme_val)) => {
                        UserSettingsPreferredTheme::from_string(preferred_theme_val.to_owned())
                    }
                    _ => UserSettingsPreferredTheme::default(),
                };
                Self {
                    notifications_enabled,
                    preferred_theme,
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

        _json_output_.push_str("\"notificationsEnabled\":");
        _json_output_.push_str(&self.notifications_enabled.to_string().as_str());
        _json_output_.push_str(",\"preferredTheme\":");
        _json_output_.push_str(format!("\"{}\"", &self.preferred_theme.serial_value()).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!(
            "notificationsEnabled={}",
            &self.notifications_enabled
        ));
        _query_parts_.push(format!(
            "preferredTheme={}",
            &self.preferred_theme.serial_value()
        ));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UserSettingsPreferredTheme {
    DarkMode,
    LightMode,
    System,
}

impl ArriEnum for UserSettingsPreferredTheme {
    fn default() -> Self {
        UserSettingsPreferredTheme::DarkMode
    }
    fn from_string(input: String) -> Self {
        match input.as_str() {
            "dark-mode" => Self::DarkMode,
            "light-mode" => Self::LightMode,
            "system" => Self::System,
            _ => Self::default(),
        }
    }
    fn serial_value(&self) -> String {
        match &self {
            UserSettingsPreferredTheme::DarkMode => "dark-mode".to_string(),
            UserSettingsPreferredTheme::LightMode => "light-mode".to_string(),
            UserSettingsPreferredTheme::System => "system".to_string(),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UsersWatchUserResponseRecentNotificationsElement {
    PostLike {
        post_id: String,
        user_id: String,
    },
    PostComment {
        post_id: String,
        user_id: String,
        comment_text: String,
    },
}

impl ArriModel for UsersWatchUserResponseRecentNotificationsElement {
    fn new() -> Self {
        Self::PostLike {
            post_id: "".to_string(),
            user_id: "".to_string(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let notification_type = match _val_.get("notificationType") {
                    Some(serde_json::Value::String(notification_type_val)) => {
                        notification_type_val.to_owned()
                    }
                    _ => "".to_string(),
                };
                match notification_type.as_str() {
                    "POST_LIKE" => {
                        let post_id = match _val_.get("postId") {
                            Some(serde_json::Value::String(post_id_val)) => post_id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let user_id = match _val_.get("userId") {
                            Some(serde_json::Value::String(user_id_val)) => user_id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::PostLike { post_id, user_id }
                    }
                    "POST_COMMENT" => {
                        let post_id = match _val_.get("postId") {
                            Some(serde_json::Value::String(post_id_val)) => post_id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let user_id = match _val_.get("userId") {
                            Some(serde_json::Value::String(user_id_val)) => user_id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let comment_text = match _val_.get("commentText") {
                            Some(serde_json::Value::String(comment_text_val)) => {
                                comment_text_val.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        Self::PostComment {
                            post_id,
                            user_id,
                            comment_text,
                        }
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
            Self::PostLike { post_id, user_id } => {
                _json_output_.push_str("\"notificationType\":\"POST_LIKE\"");
                _json_output_.push_str(",\"postId\":");
                _json_output_.push_str(serialize_string(post_id).as_str());
                _json_output_.push_str(",\"userId\":");
                _json_output_.push_str(serialize_string(user_id).as_str());
            }
            Self::PostComment {
                post_id,
                user_id,
                comment_text,
            } => {
                _json_output_.push_str("\"notificationType\":\"POST_COMMENT\"");
                _json_output_.push_str(",\"postId\":");
                _json_output_.push_str(serialize_string(post_id).as_str());
                _json_output_.push_str(",\"userId\":");
                _json_output_.push_str(serialize_string(user_id).as_str());
                _json_output_.push_str(",\"commentText\":");
                _json_output_.push_str(serialize_string(comment_text).as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self {
            Self::PostLike { post_id, user_id } => {
                _query_parts_.push(format!("notificationType=POST_LIKE"));
                _query_parts_.push(format!("postId={}", post_id));
                _query_parts_.push(format!("userId={}", user_id));
            }
            Self::PostComment {
                post_id,
                user_id,
                comment_text,
            } => {
                _query_parts_.push(format!("notificationType=POST_COMMENT"));
                _query_parts_.push(format!("postId={}", post_id));
                _query_parts_.push(format!("userId={}", user_id));
                _query_parts_.push(format!("commentText={}", comment_text));
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct UsersWatchUserResponseBookmarksValue {
    pub post_id: String,
    pub user_id: String,
}

impl ArriModel for UsersWatchUserResponseBookmarksValue {
    fn new() -> Self {
        Self {
            post_id: "".to_string(),
            user_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let post_id = match _val_.get("postId") {
                    Some(serde_json::Value::String(post_id_val)) => post_id_val.to_owned(),
                    _ => "".to_string(),
                };
                let user_id = match _val_.get("userId") {
                    Some(serde_json::Value::String(user_id_val)) => user_id_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { post_id, user_id }
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

        _json_output_.push_str("\"postId\":");
        _json_output_.push_str(serialize_string(&self.post_id).as_str());
        _json_output_.push_str(",\"userId\":");
        _json_output_.push_str(serialize_string(&self.user_id).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("postId={}", &self.post_id));
        _query_parts_.push(format!("userId={}", &self.user_id));
        _query_parts_.join("&")
    }
}
