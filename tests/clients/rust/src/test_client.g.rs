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
    pub nested: TestClientTestsNestedService,
}

impl ArriClientService for TestClientTestsService {
    fn create(config: ArriClientConfig) -> Self {
        Self {
            _config: InternalArriClientConfig::from(config.clone()),
            nested: TestClientTestsNestedService::create(config),
        }
    }
    fn update_headers(&self, headers: HashMap<&'static str, String>) {
        let mut unwrapped_headers = self._config.headers.write().unwrap();
        *unwrapped_headers = headers.clone();
        self.nested.update_headers(headers);
    }
}

impl TestClientTestsService {
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
    pub async fn send_object_with_kebab_case_keys(
        &self,
        params: ObjectWithKebabCaseKeys,
    ) -> Result<ObjectWithKebabCaseKeys, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/send-object-with-kebab-case-keys",
                    &self._config.base_url
                ),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| return ObjectWithKebabCaseKeys::from_json_string(body),
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
    pub async fn send_recursive_union_adjacent(
        &self,
        params: RecursiveUnionAdjacent,
    ) -> Result<RecursiveUnionAdjacent, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/send-recursive-union-adjacent",
                    &self._config.base_url
                ),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| return RecursiveUnionAdjacent::from_json_string(body),
        )
        .await
    }
    pub async fn send_recursive_union_external(
        &self,
        params: RecursiveUnionExternal,
    ) -> Result<RecursiveUnionExternal, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/send-recursive-union-external",
                    &self._config.base_url
                ),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| return RecursiveUnionExternal::from_json_string(body),
        )
        .await
    }
    pub async fn send_recursive_union_internal(
        &self,
        params: RecursiveUnionInternal,
    ) -> Result<RecursiveUnionInternal, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/send-recursive-union-internal",
                    &self._config.base_url
                ),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| return RecursiveUnionInternal::from_json_string(body),
        )
        .await
    }
    /// GET requests send params through url query params. Only internally tagged unions can be represented this way.
    pub async fn send_union_internal_get_request(
        &self,
        params: UnionInternalGetRequest,
    ) -> Result<UnionInternalGetRequest, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/send-union-internal-get-request",
                    &self._config.base_url
                ),
                method: reqwest::Method::GET,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| return UnionInternalGetRequest::from_json_string(body),
        )
        .await
    }
    /// Union variants with no fields, only optional fields, a mix of required, optional, and nullable fields, and nested fields.
    pub async fn send_union_variant_shapes(
        &self,
        params: UnionVariantShapes,
    ) -> Result<UnionVariantShapes, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/send-union-variant-shapes",
                    &self._config.base_url
                ),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| return UnionVariantShapes::from_json_string(body),
        )
        .await
    }
    /// Union variants of every value type, nested unions, and names that are reserved words in many languages.
    pub async fn send_union_variant_types(
        &self,
        params: UnionVariantTypes,
    ) -> Result<UnionVariantTypes, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/send-union-variant-types",
                    &self._config.base_url
                ),
                method: reqwest::Method::POST,
                headers: self._config.headers.clone(),
                client_version: "10".to_string(),
            },
            Some(params),
            |body| return UnionVariantTypes::from_json_string(body),
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
                method: reqwest::Method::POST,
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
                method: reqwest::Method::POST,
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
        params: StreamHeartbeatDetectionTestParams,
        on_event: &mut OnEvent,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) where
        OnEvent: FnMut(SseEvent<StreamHeartbeatDetectionTestResponse>, &mut SseController)
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
                method: reqwest::Method::POST,
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
                method: reqwest::Method::POST,
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
                method: reqwest::Method::POST,
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
                method: reqwest::Method::POST,
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
                method: reqwest::Method::POST,
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
pub struct TestClientTestsNestedService {
    _config: InternalArriClientConfig,
}

impl ArriClientService for TestClientTestsNestedService {
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

impl TestClientTestsNestedService {
    pub async fn empty_params_get_request(&self) -> Result<DefaultPayload, ArriError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                http_client: &self._config.http_client,
                url: format!(
                    "{}/rpcs/tests/nested/empty-params-get-request",
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
                    "{}/rpcs/tests/nested/empty-params-post-request",
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
                    "{}/rpcs/tests/nested/empty-response-get-request",
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
                    "{}/rpcs/tests/nested/empty-response-post-request",
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
                method: reqwest::Method::POST,
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
        _query_parts_.push(format!("hello={}", encode_query_component(&self.hello)));
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
        _query_parts_.push(format!("message={}", encode_query_component(&self.message)));
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
        _query_parts_.push(format!(
            "deprecatedField={}",
            encode_query_component(&self.deprecated_field)
        ));
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
                _query_parts_.push("type=EMPTY".to_string());
            }
            Self::NotEmpty { foo, bar, baz } => {
                _query_parts_.push("type=NOT_EMPTY".to_string());
                _query_parts_.push(format!("foo={}", encode_query_component(foo)));
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
        _query_parts_.push(format!("message={}", encode_query_component(&self.message)));
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
    pub union_external: ObjectWithEveryTypeUnionExternal,
    pub union_internal: ObjectWithEveryTypeUnionInternal,
    pub union_adjacent: ObjectWithEveryTypeUnionAdjacent,
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
            union_external: ObjectWithEveryTypeUnionExternal::new(),
            union_internal: ObjectWithEveryTypeUnionInternal::new(),
            union_adjacent: ObjectWithEveryTypeUnionAdjacent::new(),
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
                let union_external = match _val_.get("unionExternal") {
                    Some(union_external_val) => match union_external_val {
                        serde_json::Value::Object(_) => {
                            ObjectWithEveryTypeUnionExternal::from_json(
                                union_external_val.to_owned(),
                            )
                        }
                        _ => ObjectWithEveryTypeUnionExternal::new(),
                    },
                    _ => ObjectWithEveryTypeUnionExternal::new(),
                };
                let union_internal = match _val_.get("unionInternal") {
                    Some(union_internal_val) => match union_internal_val {
                        serde_json::Value::Object(_) => {
                            ObjectWithEveryTypeUnionInternal::from_json(
                                union_internal_val.to_owned(),
                            )
                        }
                        _ => ObjectWithEveryTypeUnionInternal::new(),
                    },
                    _ => ObjectWithEveryTypeUnionInternal::new(),
                };
                let union_adjacent = match _val_.get("unionAdjacent") {
                    Some(union_adjacent_val) => match union_adjacent_val {
                        serde_json::Value::Object(_) => {
                            ObjectWithEveryTypeUnionAdjacent::from_json(
                                union_adjacent_val.to_owned(),
                            )
                        }
                        _ => ObjectWithEveryTypeUnionAdjacent::new(),
                    },
                    _ => ObjectWithEveryTypeUnionAdjacent::new(),
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
                    union_external,
                    union_internal,
                    union_adjacent,
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
        _json_output_.push_str(",\"unionExternal\":");
        _json_output_.push_str(&self.union_external.to_json_string().as_str());
        _json_output_.push_str(",\"unionInternal\":");
        _json_output_.push_str(&self.union_internal.to_json_string().as_str());
        _json_output_.push_str(",\"unionAdjacent\":");
        _json_output_.push_str(&self.union_adjacent.to_json_string().as_str());
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
        _query_parts_.push(format!("string={}", encode_query_component(&self.string)));
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
            "enumerator={}",
            encode_query_component(&&self.enumerator.serial_value())
        ));
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /ObjectWithEveryType/array.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryType/object.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryType/record.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithEveryType/unionExternal.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithEveryType/unionInternal.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithEveryType/unionAdjacent.");
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
        _query_parts_.push(format!("string={}", encode_query_component(&self.string)));
        _query_parts_.push(format!("boolean={}", &self.boolean));
        _query_parts_.push(format!(
            "timestamp={}",
            encode_query_component(&serialize_date_time(&self.timestamp, false))
        ));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ObjectWithEveryTypeUnionExternal {
    Object(ObjectWithEveryTypeUnionExternalObjectValue),
    Array(Vec<String>),
    Boolean(bool),
    NullableTimestamp(Option<DateTime<FixedOffset>>),
}

impl ArriModel for ObjectWithEveryTypeUnionExternal {
    fn new() -> Self {
        Self::Object(ObjectWithEveryTypeUnionExternalObjectValue::new())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                if _val_.contains_key("object") {
                    let value = match _val_.get("object") {
                        Some(value_val) => ObjectWithEveryTypeUnionExternalObjectValue::from_json(
                            value_val.to_owned(),
                        ),
                        _ => ObjectWithEveryTypeUnionExternalObjectValue::new(),
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
        println!("[WARNING] cannot serialize unions to query params. Skipping ObjectWithEveryTypeUnionExternal.");
        "".to_string()
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithEveryTypeUnionExternalObjectValue {
    pub id: String,
    pub content: String,
}

impl ArriModel for ObjectWithEveryTypeUnionExternalObjectValue {
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
pub enum ObjectWithEveryTypeUnionInternal {
    Rectangle { width: f64, height: f64 },
    Circle { radius: f64 },
}

impl ArriModel for ObjectWithEveryTypeUnionInternal {
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
pub enum ObjectWithEveryTypeUnionAdjacent {
    Object(ObjectWithEveryTypeUnionAdjacentObjectData),
    Array(Vec<String>),
    Boolean(bool),
    NullableTimestamp(Option<DateTime<FixedOffset>>),
}

impl ArriModel for ObjectWithEveryTypeUnionAdjacent {
    fn new() -> Self {
        Self::Object(ObjectWithEveryTypeUnionAdjacentObjectData::new())
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
                            Some(data_val) => {
                                ObjectWithEveryTypeUnionAdjacentObjectData::from_json(
                                    data_val.to_owned(),
                                )
                            }
                            _ => ObjectWithEveryTypeUnionAdjacentObjectData::new(),
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
        println!("[WARNING] cannot serialize unions to query params. Skipping ObjectWithEveryTypeUnionAdjacent.");
        "".to_string()
    }
}

impl ObjectWithEveryTypeUnionAdjacent {
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
pub struct ObjectWithEveryTypeUnionAdjacentObjectData {
    pub id: String,
    pub content: String,
}

impl ArriModel for ObjectWithEveryTypeUnionAdjacentObjectData {
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
        _query_parts_.push(format!("id={}", encode_query_component(&self.id)));
        _query_parts_.push(format!(
            "timestamp={}",
            encode_query_component(&serialize_date_time(&self.timestamp, false))
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
        _query_parts_.push(format!("id={}", encode_query_component(&self.id)));
        _query_parts_.push(format!(
            "timestamp={}",
            encode_query_component(&serialize_date_time(&self.timestamp, false))
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
        _query_parts_.push(format!("id={}", encode_query_component(&self.id)));
        _query_parts_.push(format!(
            "timestamp={}",
            encode_query_component(&serialize_date_time(&self.timestamp, false))
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
        _query_parts_.push(format!("id={}", encode_query_component(&self.id)));
        _query_parts_.push(format!(
            "timestamp={}",
            encode_query_component(&serialize_date_time(&self.timestamp, false))
        ));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithKebabCaseKeys {
    pub created_at: DateTime<FixedOffset>,
    pub display_name: String,
    pub phone_number: Option<String>,
    pub external_event: Option<ObjectWithKebabCaseKeysExternalEvent>,
    pub internal_event: ObjectWithKebabCaseKeysInternalEvent,
    pub adjacent_event: ObjectWithKebabCaseKeysAdjacentEvent,
    pub email_address: Option<String>,
    pub is_admin: Option<bool>,
}

impl ArriModel for ObjectWithKebabCaseKeys {
    fn new() -> Self {
        Self {
            created_at: DateTime::default(),
            display_name: "".to_string(),
            phone_number: None,
            external_event: None,
            internal_event: ObjectWithKebabCaseKeysInternalEvent::new(),
            adjacent_event: ObjectWithKebabCaseKeysAdjacentEvent::new(),
            email_address: None,
            is_admin: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let created_at = match _val_.get("created-at") {
                    Some(serde_json::Value::String(created_at_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(created_at_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                let display_name = match _val_.get("display-name") {
                    Some(serde_json::Value::String(display_name_val)) => {
                        display_name_val.to_owned()
                    }
                    _ => "".to_string(),
                };
                let phone_number = match _val_.get("phone-number") {
                    Some(serde_json::Value::String(phone_number_val)) => {
                        Some(phone_number_val.to_owned())
                    }
                    _ => None,
                };
                let external_event = match _val_.get("external-event") {
                    Some(external_event_val) => match external_event_val {
                        serde_json::Value::Object(_) => {
                            Some(ObjectWithKebabCaseKeysExternalEvent::from_json(
                                external_event_val.to_owned(),
                            ))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let internal_event = match _val_.get("internal-event") {
                    Some(internal_event_val) => match internal_event_val {
                        serde_json::Value::Object(_) => {
                            ObjectWithKebabCaseKeysInternalEvent::from_json(
                                internal_event_val.to_owned(),
                            )
                        }
                        _ => ObjectWithKebabCaseKeysInternalEvent::new(),
                    },
                    _ => ObjectWithKebabCaseKeysInternalEvent::new(),
                };
                let adjacent_event = match _val_.get("adjacent-event") {
                    Some(adjacent_event_val) => match adjacent_event_val {
                        serde_json::Value::Object(_) => {
                            ObjectWithKebabCaseKeysAdjacentEvent::from_json(
                                adjacent_event_val.to_owned(),
                            )
                        }
                        _ => ObjectWithKebabCaseKeysAdjacentEvent::new(),
                    },
                    _ => ObjectWithKebabCaseKeysAdjacentEvent::new(),
                };
                let email_address = match _val_.get("email-address") {
                    Some(serde_json::Value::String(email_address_val)) => {
                        Some(email_address_val.to_owned())
                    }
                    _ => None,
                };
                let is_admin = match _val_.get("is-admin") {
                    Some(serde_json::Value::Bool(is_admin_val)) => Some(is_admin_val.to_owned()),
                    _ => None,
                };
                Self {
                    created_at,
                    display_name,
                    phone_number,
                    external_event,
                    internal_event,
                    adjacent_event,
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

        _json_output_.push_str("\"created-at\":");
        _json_output_.push_str(serialize_date_time(&self.created_at, true).as_str());
        _json_output_.push_str(",\"display-name\":");
        _json_output_.push_str(serialize_string(&self.display_name).as_str());
        _json_output_.push_str(",\"phone-number\":");
        match &self.phone_number {
            Some(phone_number_val) => {
                _json_output_.push_str(serialize_string(phone_number_val).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"external-event\":");
        match &self.external_event {
            Some(external_event_val) => {
                _json_output_.push_str(external_event_val.to_json_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"internal-event\":");
        _json_output_.push_str(&self.internal_event.to_json_string().as_str());
        _json_output_.push_str(",\"adjacent-event\":");
        _json_output_.push_str(&self.adjacent_event.to_json_string().as_str());
        match &self.email_address {
            Some(email_address_val) => {
                _json_output_.push_str(",\"email-address\":");
                _json_output_.push_str(serialize_string(email_address_val).as_str())
            }
            _ => {}
        };
        match &self.is_admin {
            Some(is_admin_val) => {
                _json_output_.push_str(",\"is-admin\":");
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
            "created-at={}",
            encode_query_component(&serialize_date_time(&self.created_at, false))
        ));
        _query_parts_.push(format!(
            "display-name={}",
            encode_query_component(&self.display_name)
        ));
        match &self.phone_number {
            Some(phone_number_val) => {
                _query_parts_.push(format!(
                    "phone-number={}",
                    encode_query_component(phone_number_val)
                ));
            }
            _ => {
                _query_parts_.push("phone-number=null".to_string());
            }
        };
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithKebabCaseKeys/external-event.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithKebabCaseKeys/internal-event.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithKebabCaseKeys/adjacent-event.");
        match &self.email_address {
            Some(email_address_val) => {
                _query_parts_.push(format!(
                    "email-address={}",
                    encode_query_component(email_address_val)
                ));
            }
            _ => {}
        };
        match &self.is_admin {
            Some(is_admin_val) => {
                _query_parts_.push(format!("is-admin={}", is_admin_val));
            }
            _ => {}
        };
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ObjectWithKebabCaseKeysExternalEvent {
    UserCreated(ObjectWithKebabCaseKeysExternalEventUserCreatedValue),
    UserUpdated(ObjectWithKebabCaseKeysExternalEventUserUpdatedValue),
    UserDeleted(ObjectWithKebabCaseKeysExternalEventUserDeletedValue),
}

impl ArriModel for ObjectWithKebabCaseKeysExternalEvent {
    fn new() -> Self {
        Self::UserCreated(ObjectWithKebabCaseKeysExternalEventUserCreatedValue::new())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                if _val_.contains_key("user-created") {
                    let value = match _val_.get("user-created") {
                        Some(value_val) => {
                            ObjectWithKebabCaseKeysExternalEventUserCreatedValue::from_json(
                                value_val.to_owned(),
                            )
                        }
                        _ => ObjectWithKebabCaseKeysExternalEventUserCreatedValue::new(),
                    };
                    return Self::UserCreated(value);
                }
                if _val_.contains_key("user-updated") {
                    let value = match _val_.get("user-updated") {
                        Some(value_val) => {
                            ObjectWithKebabCaseKeysExternalEventUserUpdatedValue::from_json(
                                value_val.to_owned(),
                            )
                        }
                        _ => ObjectWithKebabCaseKeysExternalEventUserUpdatedValue::new(),
                    };
                    return Self::UserUpdated(value);
                }
                if _val_.contains_key("user-deleted") {
                    let value = match _val_.get("user-deleted") {
                        Some(value_val) => {
                            ObjectWithKebabCaseKeysExternalEventUserDeletedValue::from_json(
                                value_val.to_owned(),
                            )
                        }
                        _ => ObjectWithKebabCaseKeysExternalEventUserDeletedValue::new(),
                    };
                    return Self::UserDeleted(value);
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
            Self::UserCreated(value) => {
                _json_output_.push_str("\"user-created\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
            Self::UserUpdated(value) => {
                _json_output_.push_str("\"user-updated\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
            Self::UserDeleted(value) => {
                _json_output_.push_str("\"user-deleted\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping ObjectWithKebabCaseKeysExternalEvent.");
        "".to_string()
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithKebabCaseKeysExternalEventUserCreatedValue {
    pub user_id: String,
}

impl ArriModel for ObjectWithKebabCaseKeysExternalEventUserCreatedValue {
    fn new() -> Self {
        Self {
            user_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let user_id = match _val_.get("user-id") {
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

        _json_output_.push_str("\"user-id\":");
        _json_output_.push_str(serialize_string(&self.user_id).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("user-id={}", encode_query_component(&self.user_id)));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithKebabCaseKeysExternalEventUserUpdatedValue {
    pub user_id: String,
}

impl ArriModel for ObjectWithKebabCaseKeysExternalEventUserUpdatedValue {
    fn new() -> Self {
        Self {
            user_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let user_id = match _val_.get("user-id") {
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

        _json_output_.push_str("\"user-id\":");
        _json_output_.push_str(serialize_string(&self.user_id).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("user-id={}", encode_query_component(&self.user_id)));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithKebabCaseKeysExternalEventUserDeletedValue {
    pub user_id: String,
}

impl ArriModel for ObjectWithKebabCaseKeysExternalEventUserDeletedValue {
    fn new() -> Self {
        Self {
            user_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let user_id = match _val_.get("user-id") {
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

        _json_output_.push_str("\"user-id\":");
        _json_output_.push_str(serialize_string(&self.user_id).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("user-id={}", encode_query_component(&self.user_id)));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ObjectWithKebabCaseKeysInternalEvent {
    UserCreated {
        user_id: String,
    },
    UserUpdated {
        user_id: String,
        updated_at: Option<DateTime<FixedOffset>>,
    },
}

impl ArriModel for ObjectWithKebabCaseKeysInternalEvent {
    fn new() -> Self {
        Self::UserCreated {
            user_id: "".to_string(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let event_type = match _val_.get("event-type") {
                    Some(serde_json::Value::String(event_type_val)) => event_type_val.to_owned(),
                    _ => "".to_string(),
                };
                match event_type.as_str() {
                    "user-created" => {
                        let user_id = match _val_.get("user-id") {
                            Some(serde_json::Value::String(user_id_val)) => user_id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::UserCreated { user_id }
                    }
                    "user-updated" => {
                        let user_id = match _val_.get("user-id") {
                            Some(serde_json::Value::String(user_id_val)) => user_id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let updated_at = match _val_.get("updated-at") {
                            Some(serde_json::Value::String(updated_at_val)) => {
                                match DateTime::<FixedOffset>::parse_from_rfc3339(updated_at_val) {
                                    Ok(updated_at_val_result) => Some(updated_at_val_result),
                                    Err(_) => None,
                                }
                            }
                            _ => None,
                        };
                        Self::UserUpdated {
                            user_id,
                            updated_at,
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
            Self::UserCreated { user_id } => {
                _json_output_.push_str("\"event-type\":\"user-created\"");
                _json_output_.push_str(",\"user-id\":");
                _json_output_.push_str(serialize_string(user_id).as_str());
            }
            Self::UserUpdated {
                user_id,
                updated_at,
            } => {
                _json_output_.push_str("\"event-type\":\"user-updated\"");
                _json_output_.push_str(",\"user-id\":");
                _json_output_.push_str(serialize_string(user_id).as_str());
                match updated_at {
                    Some(updated_at_val) => {
                        _json_output_.push_str(",\"updated-at\":");
                        _json_output_.push_str(serialize_date_time(updated_at_val, true).as_str());
                    }
                    _ => {}
                };
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self {
            Self::UserCreated { user_id } => {
                _query_parts_.push("event-type=user-created".to_string());
                _query_parts_.push(format!("user-id={}", encode_query_component(user_id)));
            }
            Self::UserUpdated {
                user_id,
                updated_at,
            } => {
                _query_parts_.push("event-type=user-updated".to_string());
                _query_parts_.push(format!("user-id={}", encode_query_component(user_id)));
                match updated_at {
                    Some(updated_at_val) => {
                        _query_parts_.push(format!(
                            "updated-at={}",
                            encode_query_component(&serialize_date_time(updated_at_val, false))
                        ));
                    }
                    _ => {}
                };
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ObjectWithKebabCaseKeysAdjacentEvent {
    UserCreated(ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData),
    UserUpdated(String),
}

impl ArriModel for ObjectWithKebabCaseKeysAdjacentEvent {
    fn new() -> Self {
        Self::UserCreated(ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData::new())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let event_type = match _val_.get("event-type") {
                    Some(serde_json::Value::String(event_type_val)) => event_type_val.to_owned(),
                    _ => "".to_string(),
                };
                match event_type.as_str() {
                    "user-created" => {
                        let event_data = match _val_.get("event-data") {
                            Some(event_data_val) => {
                                ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData::from_json(
                                    event_data_val.to_owned(),
                                )
                            }
                            _ => ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData::new(),
                        };
                        Self::UserCreated(event_data)
                    }
                    "user-updated" => {
                        let event_data = match _val_.get("event-data") {
                            Some(serde_json::Value::String(event_data_val)) => {
                                event_data_val.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        Self::UserUpdated(event_data)
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
            Self::UserCreated(event_data) => {
                _json_output_.push_str("\"event-type\":\"user-created\",\"event-data\":");
                _json_output_.push_str(event_data.to_json_string().as_str());
            }
            Self::UserUpdated(event_data) => {
                _json_output_.push_str("\"event-type\":\"user-updated\",\"event-data\":");
                _json_output_.push_str(serialize_string(event_data).as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping ObjectWithKebabCaseKeysAdjacentEvent.");
        "".to_string()
    }
}

impl ObjectWithKebabCaseKeysAdjacentEvent {
    pub fn event_type(&self) -> &'static str {
        match &self {
            Self::UserCreated(_) => "user-created",
            Self::UserUpdated(_) => "user-updated",
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData {
    pub user_id: String,
}

impl ArriModel for ObjectWithKebabCaseKeysAdjacentEventUserCreatedEventData {
    fn new() -> Self {
        Self {
            user_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let user_id = match _val_.get("user-id") {
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

        _json_output_.push_str("\"user-id\":");
        _json_output_.push_str(serialize_string(&self.user_id).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("user-id={}", encode_query_component(&self.user_id)));
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
    pub union_external: Option<ObjectWithEveryNullableTypeUnionExternal>,
    pub union_internal: Option<ObjectWithEveryNullableTypeUnionInternal>,
    pub union_adjacent: Option<ObjectWithEveryNullableTypeUnionAdjacent>,
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
            union_external: None,
            union_internal: None,
            union_adjacent: None,
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
                let union_external = match _val_.get("unionExternal") {
                    Some(union_external_val) => match union_external_val {
                        serde_json::Value::Object(_) => {
                            Some(ObjectWithEveryNullableTypeUnionExternal::from_json(
                                union_external_val.to_owned(),
                            ))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let union_internal = match _val_.get("unionInternal") {
                    Some(union_internal_val) => match union_internal_val {
                        serde_json::Value::Object(_) => {
                            Some(ObjectWithEveryNullableTypeUnionInternal::from_json(
                                union_internal_val.to_owned(),
                            ))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let union_adjacent = match _val_.get("unionAdjacent") {
                    Some(union_adjacent_val) => match union_adjacent_val {
                        serde_json::Value::Object(_) => {
                            Some(ObjectWithEveryNullableTypeUnionAdjacent::from_json(
                                union_adjacent_val.to_owned(),
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
                    union_external,
                    union_internal,
                    union_adjacent,
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
                _query_parts_.push(format!("string={}", encode_query_component(string_val)));
            }
            _ => {
                _query_parts_.push("string=null".to_string());
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
        match &self.enumerator {
            Some(enumerator_val) => {
                _query_parts_.push(format!(
                    "enumerator={}",
                    encode_query_component(&enumerator_val.serial_value())
                ));
            }
            _ => {
                _query_parts_.push("enumerator=null".to_string());
            }
        };
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /ObjectWithEveryNullableType/array.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryNullableType/object.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryNullableType/record.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithEveryNullableType/unionExternal.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithEveryNullableType/unionInternal.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithEveryNullableType/unionAdjacent.");
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
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ObjectWithEveryNullableTypeUnionExternal {
    Object(ObjectWithEveryNullableTypeUnionExternalObjectValue),
    Array(Vec<String>),
    Boolean(bool),
    NullableTimestamp(Option<DateTime<FixedOffset>>),
}

impl ArriModel for ObjectWithEveryNullableTypeUnionExternal {
    fn new() -> Self {
        Self::Object(ObjectWithEveryNullableTypeUnionExternalObjectValue::new())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                if _val_.contains_key("object") {
                    let value = match _val_.get("object") {
                        Some(value_val) => {
                            ObjectWithEveryNullableTypeUnionExternalObjectValue::from_json(
                                value_val.to_owned(),
                            )
                        }
                        _ => ObjectWithEveryNullableTypeUnionExternalObjectValue::new(),
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
        println!("[WARNING] cannot serialize unions to query params. Skipping ObjectWithEveryNullableTypeUnionExternal.");
        "".to_string()
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithEveryNullableTypeUnionExternalObjectValue {
    pub id: String,
    pub content: String,
}

impl ArriModel for ObjectWithEveryNullableTypeUnionExternalObjectValue {
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
pub enum ObjectWithEveryNullableTypeUnionInternal {
    Rectangle { width: f64, height: f64 },
    Circle { radius: f64 },
}

impl ArriModel for ObjectWithEveryNullableTypeUnionInternal {
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
pub enum ObjectWithEveryNullableTypeUnionAdjacent {
    Object(ObjectWithEveryNullableTypeUnionAdjacentObjectData),
    Array(Vec<String>),
    Boolean(bool),
    NullableTimestamp(Option<DateTime<FixedOffset>>),
}

impl ArriModel for ObjectWithEveryNullableTypeUnionAdjacent {
    fn new() -> Self {
        Self::Object(ObjectWithEveryNullableTypeUnionAdjacentObjectData::new())
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
                            Some(data_val) => {
                                ObjectWithEveryNullableTypeUnionAdjacentObjectData::from_json(
                                    data_val.to_owned(),
                                )
                            }
                            _ => ObjectWithEveryNullableTypeUnionAdjacentObjectData::new(),
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
        println!("[WARNING] cannot serialize unions to query params. Skipping ObjectWithEveryNullableTypeUnionAdjacent.");
        "".to_string()
    }
}

impl ObjectWithEveryNullableTypeUnionAdjacent {
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
pub struct ObjectWithEveryNullableTypeUnionAdjacentObjectData {
    pub id: String,
    pub content: String,
}

impl ArriModel for ObjectWithEveryNullableTypeUnionAdjacentObjectData {
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
                _query_parts_.push(format!("id={}", encode_query_component(id_val)));
            }
            _ => {
                _query_parts_.push("id=null".to_string());
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
                _query_parts_.push(format!("id={}", encode_query_component(id_val)));
            }
            _ => {
                _query_parts_.push("id=null".to_string());
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
                _query_parts_.push(format!("id={}", encode_query_component(id_val)));
            }
            _ => {
                _query_parts_.push("id=null".to_string());
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
                _query_parts_.push(format!("id={}", encode_query_component(id_val)));
            }
            _ => {
                _query_parts_.push("id=null".to_string());
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
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithPascalCaseKeys {
    pub created_at: DateTime<FixedOffset>,
    pub display_name: String,
    pub phone_number: Option<String>,
    pub external_event: Option<ObjectWithPascalCaseKeysExternalEvent>,
    pub internal_event: ObjectWithPascalCaseKeysInternalEvent,
    pub adjacent_event: ObjectWithPascalCaseKeysAdjacentEvent,
    pub email_address: Option<String>,
    pub is_admin: Option<bool>,
}

impl ArriModel for ObjectWithPascalCaseKeys {
    fn new() -> Self {
        Self {
            created_at: DateTime::default(),
            display_name: "".to_string(),
            phone_number: None,
            external_event: None,
            internal_event: ObjectWithPascalCaseKeysInternalEvent::new(),
            adjacent_event: ObjectWithPascalCaseKeysAdjacentEvent::new(),
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
                let external_event = match _val_.get("ExternalEvent") {
                    Some(external_event_val) => match external_event_val {
                        serde_json::Value::Object(_) => {
                            Some(ObjectWithPascalCaseKeysExternalEvent::from_json(
                                external_event_val.to_owned(),
                            ))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let internal_event = match _val_.get("InternalEvent") {
                    Some(internal_event_val) => match internal_event_val {
                        serde_json::Value::Object(_) => {
                            ObjectWithPascalCaseKeysInternalEvent::from_json(
                                internal_event_val.to_owned(),
                            )
                        }
                        _ => ObjectWithPascalCaseKeysInternalEvent::new(),
                    },
                    _ => ObjectWithPascalCaseKeysInternalEvent::new(),
                };
                let adjacent_event = match _val_.get("AdjacentEvent") {
                    Some(adjacent_event_val) => match adjacent_event_val {
                        serde_json::Value::Object(_) => {
                            ObjectWithPascalCaseKeysAdjacentEvent::from_json(
                                adjacent_event_val.to_owned(),
                            )
                        }
                        _ => ObjectWithPascalCaseKeysAdjacentEvent::new(),
                    },
                    _ => ObjectWithPascalCaseKeysAdjacentEvent::new(),
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
                    external_event,
                    internal_event,
                    adjacent_event,
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
        _json_output_.push_str(",\"ExternalEvent\":");
        match &self.external_event {
            Some(external_event_val) => {
                _json_output_.push_str(external_event_val.to_json_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"InternalEvent\":");
        _json_output_.push_str(&self.internal_event.to_json_string().as_str());
        _json_output_.push_str(",\"AdjacentEvent\":");
        _json_output_.push_str(&self.adjacent_event.to_json_string().as_str());
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
            encode_query_component(&serialize_date_time(&self.created_at, false))
        ));
        _query_parts_.push(format!(
            "DisplayName={}",
            encode_query_component(&self.display_name)
        ));
        match &self.phone_number {
            Some(phone_number_val) => {
                _query_parts_.push(format!(
                    "PhoneNumber={}",
                    encode_query_component(phone_number_val)
                ));
            }
            _ => {
                _query_parts_.push("PhoneNumber=null".to_string());
            }
        };
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithPascalCaseKeys/ExternalEvent.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithPascalCaseKeys/InternalEvent.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithPascalCaseKeys/AdjacentEvent.");
        match &self.email_address {
            Some(email_address_val) => {
                _query_parts_.push(format!(
                    "EmailAddress={}",
                    encode_query_component(email_address_val)
                ));
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
pub enum ObjectWithPascalCaseKeysExternalEvent {
    UserCreated(ObjectWithPascalCaseKeysExternalEventUserCreatedValue),
    UserUpdated(ObjectWithPascalCaseKeysExternalEventUserUpdatedValue),
    UserDeleted(ObjectWithPascalCaseKeysExternalEventUserDeletedValue),
}

impl ArriModel for ObjectWithPascalCaseKeysExternalEvent {
    fn new() -> Self {
        Self::UserCreated(ObjectWithPascalCaseKeysExternalEventUserCreatedValue::new())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                if _val_.contains_key("UserCreated") {
                    let value = match _val_.get("UserCreated") {
                        Some(value_val) => {
                            ObjectWithPascalCaseKeysExternalEventUserCreatedValue::from_json(
                                value_val.to_owned(),
                            )
                        }
                        _ => ObjectWithPascalCaseKeysExternalEventUserCreatedValue::new(),
                    };
                    return Self::UserCreated(value);
                }
                if _val_.contains_key("UserUpdated") {
                    let value = match _val_.get("UserUpdated") {
                        Some(value_val) => {
                            ObjectWithPascalCaseKeysExternalEventUserUpdatedValue::from_json(
                                value_val.to_owned(),
                            )
                        }
                        _ => ObjectWithPascalCaseKeysExternalEventUserUpdatedValue::new(),
                    };
                    return Self::UserUpdated(value);
                }
                if _val_.contains_key("UserDeleted") {
                    let value = match _val_.get("UserDeleted") {
                        Some(value_val) => {
                            ObjectWithPascalCaseKeysExternalEventUserDeletedValue::from_json(
                                value_val.to_owned(),
                            )
                        }
                        _ => ObjectWithPascalCaseKeysExternalEventUserDeletedValue::new(),
                    };
                    return Self::UserDeleted(value);
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
            Self::UserCreated(value) => {
                _json_output_.push_str("\"UserCreated\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
            Self::UserUpdated(value) => {
                _json_output_.push_str("\"UserUpdated\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
            Self::UserDeleted(value) => {
                _json_output_.push_str("\"UserDeleted\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping ObjectWithPascalCaseKeysExternalEvent.");
        "".to_string()
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithPascalCaseKeysExternalEventUserCreatedValue {
    pub user_id: String,
}

impl ArriModel for ObjectWithPascalCaseKeysExternalEventUserCreatedValue {
    fn new() -> Self {
        Self {
            user_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let user_id = match _val_.get("UserId") {
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

        _json_output_.push_str("\"UserId\":");
        _json_output_.push_str(serialize_string(&self.user_id).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("UserId={}", encode_query_component(&self.user_id)));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithPascalCaseKeysExternalEventUserUpdatedValue {
    pub user_id: String,
}

impl ArriModel for ObjectWithPascalCaseKeysExternalEventUserUpdatedValue {
    fn new() -> Self {
        Self {
            user_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let user_id = match _val_.get("UserId") {
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

        _json_output_.push_str("\"UserId\":");
        _json_output_.push_str(serialize_string(&self.user_id).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("UserId={}", encode_query_component(&self.user_id)));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithPascalCaseKeysExternalEventUserDeletedValue {
    pub user_id: String,
}

impl ArriModel for ObjectWithPascalCaseKeysExternalEventUserDeletedValue {
    fn new() -> Self {
        Self {
            user_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let user_id = match _val_.get("UserId") {
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

        _json_output_.push_str("\"UserId\":");
        _json_output_.push_str(serialize_string(&self.user_id).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("UserId={}", encode_query_component(&self.user_id)));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ObjectWithPascalCaseKeysInternalEvent {
    UserCreated {
        user_id: String,
    },
    UserUpdated {
        user_id: String,
        updated_at: Option<DateTime<FixedOffset>>,
    },
}

impl ArriModel for ObjectWithPascalCaseKeysInternalEvent {
    fn new() -> Self {
        Self::UserCreated {
            user_id: "".to_string(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let event_type = match _val_.get("EventType") {
                    Some(serde_json::Value::String(event_type_val)) => event_type_val.to_owned(),
                    _ => "".to_string(),
                };
                match event_type.as_str() {
                    "UserCreated" => {
                        let user_id = match _val_.get("UserId") {
                            Some(serde_json::Value::String(user_id_val)) => user_id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::UserCreated { user_id }
                    }
                    "UserUpdated" => {
                        let user_id = match _val_.get("UserId") {
                            Some(serde_json::Value::String(user_id_val)) => user_id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let updated_at = match _val_.get("UpdatedAt") {
                            Some(serde_json::Value::String(updated_at_val)) => {
                                match DateTime::<FixedOffset>::parse_from_rfc3339(updated_at_val) {
                                    Ok(updated_at_val_result) => Some(updated_at_val_result),
                                    Err(_) => None,
                                }
                            }
                            _ => None,
                        };
                        Self::UserUpdated {
                            user_id,
                            updated_at,
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
            Self::UserCreated { user_id } => {
                _json_output_.push_str("\"EventType\":\"UserCreated\"");
                _json_output_.push_str(",\"UserId\":");
                _json_output_.push_str(serialize_string(user_id).as_str());
            }
            Self::UserUpdated {
                user_id,
                updated_at,
            } => {
                _json_output_.push_str("\"EventType\":\"UserUpdated\"");
                _json_output_.push_str(",\"UserId\":");
                _json_output_.push_str(serialize_string(user_id).as_str());
                match updated_at {
                    Some(updated_at_val) => {
                        _json_output_.push_str(",\"UpdatedAt\":");
                        _json_output_.push_str(serialize_date_time(updated_at_val, true).as_str());
                    }
                    _ => {}
                };
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self {
            Self::UserCreated { user_id } => {
                _query_parts_.push("EventType=UserCreated".to_string());
                _query_parts_.push(format!("UserId={}", encode_query_component(user_id)));
            }
            Self::UserUpdated {
                user_id,
                updated_at,
            } => {
                _query_parts_.push("EventType=UserUpdated".to_string());
                _query_parts_.push(format!("UserId={}", encode_query_component(user_id)));
                match updated_at {
                    Some(updated_at_val) => {
                        _query_parts_.push(format!(
                            "UpdatedAt={}",
                            encode_query_component(&serialize_date_time(updated_at_val, false))
                        ));
                    }
                    _ => {}
                };
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ObjectWithPascalCaseKeysAdjacentEvent {
    UserCreated(ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData),
    UserUpdated(String),
}

impl ArriModel for ObjectWithPascalCaseKeysAdjacentEvent {
    fn new() -> Self {
        Self::UserCreated(ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData::new())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let event_type = match _val_.get("EventType") {
                    Some(serde_json::Value::String(event_type_val)) => event_type_val.to_owned(),
                    _ => "".to_string(),
                };
                match event_type.as_str() {
                    "UserCreated" => {
                        let event_data = match _val_.get("EventData") {
                            Some(event_data_val) => {
                                ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData::from_json(
                                    event_data_val.to_owned(),
                                )
                            }
                            _ => ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData::new(),
                        };
                        Self::UserCreated(event_data)
                    }
                    "UserUpdated" => {
                        let event_data = match _val_.get("EventData") {
                            Some(serde_json::Value::String(event_data_val)) => {
                                event_data_val.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        Self::UserUpdated(event_data)
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
            Self::UserCreated(event_data) => {
                _json_output_.push_str("\"EventType\":\"UserCreated\",\"EventData\":");
                _json_output_.push_str(event_data.to_json_string().as_str());
            }
            Self::UserUpdated(event_data) => {
                _json_output_.push_str("\"EventType\":\"UserUpdated\",\"EventData\":");
                _json_output_.push_str(serialize_string(event_data).as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping ObjectWithPascalCaseKeysAdjacentEvent.");
        "".to_string()
    }
}

impl ObjectWithPascalCaseKeysAdjacentEvent {
    pub fn event_type(&self) -> &'static str {
        match &self {
            Self::UserCreated(_) => "UserCreated",
            Self::UserUpdated(_) => "UserUpdated",
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData {
    pub user_id: String,
}

impl ArriModel for ObjectWithPascalCaseKeysAdjacentEventUserCreatedEventData {
    fn new() -> Self {
        Self {
            user_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let user_id = match _val_.get("UserId") {
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

        _json_output_.push_str("\"UserId\":");
        _json_output_.push_str(serialize_string(&self.user_id).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("UserId={}", encode_query_component(&self.user_id)));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithSnakeCaseKeys {
    pub created_at: DateTime<FixedOffset>,
    pub display_name: String,
    pub phone_number: Option<String>,
    pub external_event: Option<ObjectWithSnakeCaseKeysExternalEvent>,
    pub internal_event: ObjectWithSnakeCaseKeysInternalEvent,
    pub adjacent_event: ObjectWithSnakeCaseKeysAdjacentEvent,
    pub email_address: Option<String>,
    pub is_admin: Option<bool>,
}

impl ArriModel for ObjectWithSnakeCaseKeys {
    fn new() -> Self {
        Self {
            created_at: DateTime::default(),
            display_name: "".to_string(),
            phone_number: None,
            external_event: None,
            internal_event: ObjectWithSnakeCaseKeysInternalEvent::new(),
            adjacent_event: ObjectWithSnakeCaseKeysAdjacentEvent::new(),
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
                let external_event = match _val_.get("external_event") {
                    Some(external_event_val) => match external_event_val {
                        serde_json::Value::Object(_) => {
                            Some(ObjectWithSnakeCaseKeysExternalEvent::from_json(
                                external_event_val.to_owned(),
                            ))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let internal_event = match _val_.get("internal_event") {
                    Some(internal_event_val) => match internal_event_val {
                        serde_json::Value::Object(_) => {
                            ObjectWithSnakeCaseKeysInternalEvent::from_json(
                                internal_event_val.to_owned(),
                            )
                        }
                        _ => ObjectWithSnakeCaseKeysInternalEvent::new(),
                    },
                    _ => ObjectWithSnakeCaseKeysInternalEvent::new(),
                };
                let adjacent_event = match _val_.get("adjacent_event") {
                    Some(adjacent_event_val) => match adjacent_event_val {
                        serde_json::Value::Object(_) => {
                            ObjectWithSnakeCaseKeysAdjacentEvent::from_json(
                                adjacent_event_val.to_owned(),
                            )
                        }
                        _ => ObjectWithSnakeCaseKeysAdjacentEvent::new(),
                    },
                    _ => ObjectWithSnakeCaseKeysAdjacentEvent::new(),
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
                    external_event,
                    internal_event,
                    adjacent_event,
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
        _json_output_.push_str(",\"external_event\":");
        match &self.external_event {
            Some(external_event_val) => {
                _json_output_.push_str(external_event_val.to_json_string().as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"internal_event\":");
        _json_output_.push_str(&self.internal_event.to_json_string().as_str());
        _json_output_.push_str(",\"adjacent_event\":");
        _json_output_.push_str(&self.adjacent_event.to_json_string().as_str());
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
            encode_query_component(&serialize_date_time(&self.created_at, false))
        ));
        _query_parts_.push(format!(
            "display_name={}",
            encode_query_component(&self.display_name)
        ));
        match &self.phone_number {
            Some(phone_number_val) => {
                _query_parts_.push(format!(
                    "phone_number={}",
                    encode_query_component(phone_number_val)
                ));
            }
            _ => {
                _query_parts_.push("phone_number=null".to_string());
            }
        };
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithSnakeCaseKeys/external_event.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithSnakeCaseKeys/internal_event.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithSnakeCaseKeys/adjacent_event.");
        match &self.email_address {
            Some(email_address_val) => {
                _query_parts_.push(format!(
                    "email_address={}",
                    encode_query_component(email_address_val)
                ));
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
pub enum ObjectWithSnakeCaseKeysExternalEvent {
    UserCreated(ObjectWithSnakeCaseKeysExternalEventUserCreatedValue),
    UserUpdated(ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue),
    UserDeleted(ObjectWithSnakeCaseKeysExternalEventUserDeletedValue),
}

impl ArriModel for ObjectWithSnakeCaseKeysExternalEvent {
    fn new() -> Self {
        Self::UserCreated(ObjectWithSnakeCaseKeysExternalEventUserCreatedValue::new())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                if _val_.contains_key("user_created") {
                    let value = match _val_.get("user_created") {
                        Some(value_val) => {
                            ObjectWithSnakeCaseKeysExternalEventUserCreatedValue::from_json(
                                value_val.to_owned(),
                            )
                        }
                        _ => ObjectWithSnakeCaseKeysExternalEventUserCreatedValue::new(),
                    };
                    return Self::UserCreated(value);
                }
                if _val_.contains_key("user_updated") {
                    let value = match _val_.get("user_updated") {
                        Some(value_val) => {
                            ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue::from_json(
                                value_val.to_owned(),
                            )
                        }
                        _ => ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue::new(),
                    };
                    return Self::UserUpdated(value);
                }
                if _val_.contains_key("user_deleted") {
                    let value = match _val_.get("user_deleted") {
                        Some(value_val) => {
                            ObjectWithSnakeCaseKeysExternalEventUserDeletedValue::from_json(
                                value_val.to_owned(),
                            )
                        }
                        _ => ObjectWithSnakeCaseKeysExternalEventUserDeletedValue::new(),
                    };
                    return Self::UserDeleted(value);
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
            Self::UserCreated(value) => {
                _json_output_.push_str("\"user_created\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
            Self::UserUpdated(value) => {
                _json_output_.push_str("\"user_updated\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
            Self::UserDeleted(value) => {
                _json_output_.push_str("\"user_deleted\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping ObjectWithSnakeCaseKeysExternalEvent.");
        "".to_string()
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithSnakeCaseKeysExternalEventUserCreatedValue {
    pub user_id: String,
}

impl ArriModel for ObjectWithSnakeCaseKeysExternalEventUserCreatedValue {
    fn new() -> Self {
        Self {
            user_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let user_id = match _val_.get("user_id") {
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

        _json_output_.push_str("\"user_id\":");
        _json_output_.push_str(serialize_string(&self.user_id).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("user_id={}", encode_query_component(&self.user_id)));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue {
    pub user_id: String,
}

impl ArriModel for ObjectWithSnakeCaseKeysExternalEventUserUpdatedValue {
    fn new() -> Self {
        Self {
            user_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let user_id = match _val_.get("user_id") {
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

        _json_output_.push_str("\"user_id\":");
        _json_output_.push_str(serialize_string(&self.user_id).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("user_id={}", encode_query_component(&self.user_id)));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithSnakeCaseKeysExternalEventUserDeletedValue {
    pub user_id: String,
}

impl ArriModel for ObjectWithSnakeCaseKeysExternalEventUserDeletedValue {
    fn new() -> Self {
        Self {
            user_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let user_id = match _val_.get("user_id") {
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

        _json_output_.push_str("\"user_id\":");
        _json_output_.push_str(serialize_string(&self.user_id).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("user_id={}", encode_query_component(&self.user_id)));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ObjectWithSnakeCaseKeysInternalEvent {
    UserCreated {
        user_id: String,
    },
    UserUpdated {
        user_id: String,
        updated_at: Option<DateTime<FixedOffset>>,
    },
}

impl ArriModel for ObjectWithSnakeCaseKeysInternalEvent {
    fn new() -> Self {
        Self::UserCreated {
            user_id: "".to_string(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let event_type = match _val_.get("event_type") {
                    Some(serde_json::Value::String(event_type_val)) => event_type_val.to_owned(),
                    _ => "".to_string(),
                };
                match event_type.as_str() {
                    "user_created" => {
                        let user_id = match _val_.get("user_id") {
                            Some(serde_json::Value::String(user_id_val)) => user_id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::UserCreated { user_id }
                    }
                    "user_updated" => {
                        let user_id = match _val_.get("user_id") {
                            Some(serde_json::Value::String(user_id_val)) => user_id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let updated_at = match _val_.get("updated_at") {
                            Some(serde_json::Value::String(updated_at_val)) => {
                                match DateTime::<FixedOffset>::parse_from_rfc3339(updated_at_val) {
                                    Ok(updated_at_val_result) => Some(updated_at_val_result),
                                    Err(_) => None,
                                }
                            }
                            _ => None,
                        };
                        Self::UserUpdated {
                            user_id,
                            updated_at,
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
            Self::UserCreated { user_id } => {
                _json_output_.push_str("\"event_type\":\"user_created\"");
                _json_output_.push_str(",\"user_id\":");
                _json_output_.push_str(serialize_string(user_id).as_str());
            }
            Self::UserUpdated {
                user_id,
                updated_at,
            } => {
                _json_output_.push_str("\"event_type\":\"user_updated\"");
                _json_output_.push_str(",\"user_id\":");
                _json_output_.push_str(serialize_string(user_id).as_str());
                match updated_at {
                    Some(updated_at_val) => {
                        _json_output_.push_str(",\"updated_at\":");
                        _json_output_.push_str(serialize_date_time(updated_at_val, true).as_str());
                    }
                    _ => {}
                };
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self {
            Self::UserCreated { user_id } => {
                _query_parts_.push("event_type=user_created".to_string());
                _query_parts_.push(format!("user_id={}", encode_query_component(user_id)));
            }
            Self::UserUpdated {
                user_id,
                updated_at,
            } => {
                _query_parts_.push("event_type=user_updated".to_string());
                _query_parts_.push(format!("user_id={}", encode_query_component(user_id)));
                match updated_at {
                    Some(updated_at_val) => {
                        _query_parts_.push(format!(
                            "updated_at={}",
                            encode_query_component(&serialize_date_time(updated_at_val, false))
                        ));
                    }
                    _ => {}
                };
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ObjectWithSnakeCaseKeysAdjacentEvent {
    UserCreated(ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData),
    UserUpdated(String),
}

impl ArriModel for ObjectWithSnakeCaseKeysAdjacentEvent {
    fn new() -> Self {
        Self::UserCreated(ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData::new())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let event_type = match _val_.get("event_type") {
                    Some(serde_json::Value::String(event_type_val)) => event_type_val.to_owned(),
                    _ => "".to_string(),
                };
                match event_type.as_str() {
                    "user_created" => {
                        let event_data = match _val_.get("event_data") {
                            Some(event_data_val) => {
                                ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData::from_json(
                                    event_data_val.to_owned(),
                                )
                            }
                            _ => ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData::new(),
                        };
                        Self::UserCreated(event_data)
                    }
                    "user_updated" => {
                        let event_data = match _val_.get("event_data") {
                            Some(serde_json::Value::String(event_data_val)) => {
                                event_data_val.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        Self::UserUpdated(event_data)
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
            Self::UserCreated(event_data) => {
                _json_output_.push_str("\"event_type\":\"user_created\",\"event_data\":");
                _json_output_.push_str(event_data.to_json_string().as_str());
            }
            Self::UserUpdated(event_data) => {
                _json_output_.push_str("\"event_type\":\"user_updated\",\"event_data\":");
                _json_output_.push_str(serialize_string(event_data).as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping ObjectWithSnakeCaseKeysAdjacentEvent.");
        "".to_string()
    }
}

impl ObjectWithSnakeCaseKeysAdjacentEvent {
    pub fn event_type(&self) -> &'static str {
        match &self {
            Self::UserCreated(_) => "user_created",
            Self::UserUpdated(_) => "user_updated",
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData {
    pub user_id: String,
}

impl ArriModel for ObjectWithSnakeCaseKeysAdjacentEventUserCreatedEventData {
    fn new() -> Self {
        Self {
            user_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let user_id = match _val_.get("user_id") {
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

        _json_output_.push_str("\"user_id\":");
        _json_output_.push_str(serialize_string(&self.user_id).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("user_id={}", encode_query_component(&self.user_id)));
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
    pub union_external: Option<ObjectWithEveryOptionalTypeUnionExternal>,
    pub union_internal: Option<ObjectWithEveryOptionalTypeUnionInternal>,
    pub union_adjacent: Option<ObjectWithEveryOptionalTypeUnionAdjacent>,
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
            union_external: None,
            union_internal: None,
            union_adjacent: None,
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
                let union_external = match _val_.get("unionExternal") {
                    Some(union_external_val) => match union_external_val {
                        serde_json::Value::Object(_) => {
                            Some(ObjectWithEveryOptionalTypeUnionExternal::from_json(
                                union_external_val.to_owned(),
                            ))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let union_internal = match _val_.get("unionInternal") {
                    Some(union_internal_val) => match union_internal_val {
                        serde_json::Value::Object(_) => {
                            Some(ObjectWithEveryOptionalTypeUnionInternal::from_json(
                                union_internal_val.to_owned(),
                            ))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let union_adjacent = match _val_.get("unionAdjacent") {
                    Some(union_adjacent_val) => match union_adjacent_val {
                        serde_json::Value::Object(_) => {
                            Some(ObjectWithEveryOptionalTypeUnionAdjacent::from_json(
                                union_adjacent_val.to_owned(),
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
                    union_external,
                    union_internal,
                    union_adjacent,
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
                _query_parts_.push(format!("string={}", encode_query_component(string_val)));
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
        match &self.enumerator {
            Some(enumerator_val) => {
                _query_parts_.push(format!(
                    "enumerator={}",
                    encode_query_component(&enumerator_val.serial_value())
                ));
            }
            _ => {}
        };
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /ObjectWithEveryOptionalType/array.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryOptionalType/object.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryOptionalType/record.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithEveryOptionalType/unionExternal.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithEveryOptionalType/unionInternal.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /ObjectWithEveryOptionalType/unionAdjacent.");
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
        _query_parts_.push(format!("string={}", encode_query_component(&self.string)));
        _query_parts_.push(format!("boolean={}", &self.boolean));
        _query_parts_.push(format!(
            "timestamp={}",
            encode_query_component(&serialize_date_time(&self.timestamp, false))
        ));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum ObjectWithEveryOptionalTypeUnionExternal {
    Object(ObjectWithEveryOptionalTypeUnionExternalObjectValue),
    Array(Vec<String>),
    Boolean(bool),
    NullableTimestamp(Option<DateTime<FixedOffset>>),
}

impl ArriModel for ObjectWithEveryOptionalTypeUnionExternal {
    fn new() -> Self {
        Self::Object(ObjectWithEveryOptionalTypeUnionExternalObjectValue::new())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                if _val_.contains_key("object") {
                    let value = match _val_.get("object") {
                        Some(value_val) => {
                            ObjectWithEveryOptionalTypeUnionExternalObjectValue::from_json(
                                value_val.to_owned(),
                            )
                        }
                        _ => ObjectWithEveryOptionalTypeUnionExternalObjectValue::new(),
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
        println!("[WARNING] cannot serialize unions to query params. Skipping ObjectWithEveryOptionalTypeUnionExternal.");
        "".to_string()
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct ObjectWithEveryOptionalTypeUnionExternalObjectValue {
    pub id: String,
    pub content: String,
}

impl ArriModel for ObjectWithEveryOptionalTypeUnionExternalObjectValue {
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
pub enum ObjectWithEveryOptionalTypeUnionInternal {
    Rectangle { width: f64, height: f64 },
    Circle { radius: f64 },
}

impl ArriModel for ObjectWithEveryOptionalTypeUnionInternal {
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
pub enum ObjectWithEveryOptionalTypeUnionAdjacent {
    Object(ObjectWithEveryOptionalTypeUnionAdjacentObjectData),
    Array(Vec<String>),
    Boolean(bool),
    NullableTimestamp(Option<DateTime<FixedOffset>>),
}

impl ArriModel for ObjectWithEveryOptionalTypeUnionAdjacent {
    fn new() -> Self {
        Self::Object(ObjectWithEveryOptionalTypeUnionAdjacentObjectData::new())
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
                            Some(data_val) => {
                                ObjectWithEveryOptionalTypeUnionAdjacentObjectData::from_json(
                                    data_val.to_owned(),
                                )
                            }
                            _ => ObjectWithEveryOptionalTypeUnionAdjacentObjectData::new(),
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
        println!("[WARNING] cannot serialize unions to query params. Skipping ObjectWithEveryOptionalTypeUnionAdjacent.");
        "".to_string()
    }
}

impl ObjectWithEveryOptionalTypeUnionAdjacent {
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
pub struct ObjectWithEveryOptionalTypeUnionAdjacentObjectData {
    pub id: String,
    pub content: String,
}

impl ArriModel for ObjectWithEveryOptionalTypeUnionAdjacentObjectData {
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
        _query_parts_.push(format!("id={}", encode_query_component(&self.id)));
        _query_parts_.push(format!(
            "timestamp={}",
            encode_query_component(&serialize_date_time(&self.timestamp, false))
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
        _query_parts_.push(format!("id={}", encode_query_component(&self.id)));
        _query_parts_.push(format!(
            "timestamp={}",
            encode_query_component(&serialize_date_time(&self.timestamp, false))
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
        _query_parts_.push(format!("id={}", encode_query_component(&self.id)));
        _query_parts_.push(format!(
            "timestamp={}",
            encode_query_component(&serialize_date_time(&self.timestamp, false))
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
        _query_parts_.push(format!("id={}", encode_query_component(&self.id)));
        _query_parts_.push(format!(
            "timestamp={}",
            encode_query_component(&serialize_date_time(&self.timestamp, false))
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
        _query_parts_.push(format!("value={}", encode_query_component(&self.value)));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum RecursiveUnionAdjacent {
    Child(Box<RecursiveUnionAdjacent>),
    /// an array of child nodes
    Children(Vec<Box<RecursiveUnionAdjacent>>),
    /// Text node
    Text(String),
    /// Shape node
    Shape(RecursiveUnionAdjacentShapeData),
}

impl ArriModel for RecursiveUnionAdjacent {
    fn new() -> Self {
        Self::Children(Vec::new())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let kind = match _val_.get("kind") {
                    Some(serde_json::Value::String(kind_val)) => kind_val.to_owned(),
                    _ => "".to_string(),
                };
                match kind.as_str() {
                    "child" => {
                        let data = match _val_.get("data") {
                            Some(data_val) => match data_val {
                                serde_json::Value::Object(_) => {
                                    Box::new(RecursiveUnionAdjacent::from_json(data_val.to_owned()))
                                }
                                _ => {
                                    Box::new(RecursiveUnionAdjacent::from_json(data_val.to_owned()))
                                }
                            },
                            _ => Box::new(RecursiveUnionAdjacent::new()),
                        };
                        Self::Child(data)
                    }
                    "children" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::Array(data_val)) => {
                                let mut data_val_result: Vec<Box<RecursiveUnionAdjacent>> =
                                    Vec::new();
                                for data_val_element in data_val {
                                    data_val_result.push(match Some(data_val_element) {
                                        Some(data_val_element_val) => match data_val_element_val {
                                            serde_json::Value::Object(_) => {
                                                Box::new(RecursiveUnionAdjacent::from_json(
                                                    data_val_element_val.to_owned(),
                                                ))
                                            }
                                            _ => Box::new(RecursiveUnionAdjacent::from_json(
                                                data_val_element_val.to_owned(),
                                            )),
                                        },
                                        _ => Box::new(RecursiveUnionAdjacent::new()),
                                    });
                                }
                                data_val_result
                            }
                            _ => Vec::new(),
                        };
                        Self::Children(data)
                    }
                    "text" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::String(data_val)) => data_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::Text(data)
                    }
                    "shape" => {
                        let data = match _val_.get("data") {
                            Some(data_val) => {
                                RecursiveUnionAdjacentShapeData::from_json(data_val.to_owned())
                            }
                            _ => RecursiveUnionAdjacentShapeData::new(),
                        };
                        Self::Shape(data)
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
            Self::Child(data) => {
                _json_output_.push_str("\"kind\":\"child\",\"data\":");
                _json_output_.push_str(data.to_json_string().as_str());
            }
            Self::Children(data) => {
                _json_output_.push_str("\"kind\":\"children\",\"data\":");
                _json_output_.push('[');
                for (_index_, _element_) in data.iter().enumerate() {
                    if _index_ != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(_element_.to_json_string().as_str());
                }
                _json_output_.push(']');
            }
            Self::Text(data) => {
                _json_output_.push_str("\"kind\":\"text\",\"data\":");
                _json_output_.push_str(serialize_string(data).as_str());
            }
            Self::Shape(data) => {
                _json_output_.push_str("\"kind\":\"shape\",\"data\":");
                _json_output_.push_str(data.to_json_string().as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!(
            "[WARNING] cannot serialize unions to query params. Skipping RecursiveUnionAdjacent."
        );
        "".to_string()
    }
}

impl RecursiveUnionAdjacent {
    pub fn kind(&self) -> &'static str {
        match &self {
            Self::Child(_) => "child",
            Self::Children(_) => "children",
            Self::Text(_) => "text",
            Self::Shape(_) => "shape",
        }
    }
}

/// Shape node
#[derive(Clone, Debug, PartialEq)]
pub struct RecursiveUnionAdjacentShapeData {
    pub width: f64,
    pub height: f64,
    pub color: String,
}

impl ArriModel for RecursiveUnionAdjacentShapeData {
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
        _query_parts_.push(format!("color={}", encode_query_component(&self.color)));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum RecursiveUnionExternal {
    Child(Box<RecursiveUnionExternal>),
    /// an array of child nodes
    Children(Vec<Box<RecursiveUnionExternal>>),
    /// Text node
    Text(String),
    /// Shape node
    Shape(RecursiveUnionExternalShapeValue),
}

impl ArriModel for RecursiveUnionExternal {
    fn new() -> Self {
        Self::Children(Vec::new())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                if _val_.contains_key("child") {
                    let value = match _val_.get("child") {
                        Some(value_val) => match value_val {
                            serde_json::Value::Object(_) => {
                                Box::new(RecursiveUnionExternal::from_json(value_val.to_owned()))
                            }
                            _ => Box::new(RecursiveUnionExternal::from_json(value_val.to_owned())),
                        },
                        _ => Box::new(RecursiveUnionExternal::new()),
                    };
                    return Self::Child(value);
                }
                if _val_.contains_key("children") {
                    let value = match _val_.get("children") {
                        Some(serde_json::Value::Array(value_val)) => {
                            let mut value_val_result: Vec<Box<RecursiveUnionExternal>> = Vec::new();
                            for value_val_element in value_val {
                                value_val_result.push(match Some(value_val_element) {
                                    Some(value_val_element_val) => match value_val_element_val {
                                        serde_json::Value::Object(_) => {
                                            Box::new(RecursiveUnionExternal::from_json(
                                                value_val_element_val.to_owned(),
                                            ))
                                        }
                                        _ => Box::new(RecursiveUnionExternal::from_json(
                                            value_val_element_val.to_owned(),
                                        )),
                                    },
                                    _ => Box::new(RecursiveUnionExternal::new()),
                                });
                            }
                            value_val_result
                        }
                        _ => Vec::new(),
                    };
                    return Self::Children(value);
                }
                if _val_.contains_key("text") {
                    let value = match _val_.get("text") {
                        Some(serde_json::Value::String(value_val)) => value_val.to_owned(),
                        _ => "".to_string(),
                    };
                    return Self::Text(value);
                }
                if _val_.contains_key("shape") {
                    let value = match _val_.get("shape") {
                        Some(value_val) => {
                            RecursiveUnionExternalShapeValue::from_json(value_val.to_owned())
                        }
                        _ => RecursiveUnionExternalShapeValue::new(),
                    };
                    return Self::Shape(value);
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
            Self::Child(value) => {
                _json_output_.push_str("\"child\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
            Self::Children(value) => {
                _json_output_.push_str("\"children\":");
                _json_output_.push('[');
                for (_index_, _element_) in value.iter().enumerate() {
                    if _index_ != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(_element_.to_json_string().as_str());
                }
                _json_output_.push(']');
            }
            Self::Text(value) => {
                _json_output_.push_str("\"text\":");
                _json_output_.push_str(serialize_string(value).as_str());
            }
            Self::Shape(value) => {
                _json_output_.push_str("\"shape\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!(
            "[WARNING] cannot serialize unions to query params. Skipping RecursiveUnionExternal."
        );
        "".to_string()
    }
}

/// Shape node
#[derive(Clone, Debug, PartialEq)]
pub struct RecursiveUnionExternalShapeValue {
    pub width: f64,
    pub height: f64,
    pub color: String,
}

impl ArriModel for RecursiveUnionExternalShapeValue {
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
        _query_parts_.push(format!("color={}", encode_query_component(&self.color)));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum RecursiveUnionInternal {
    Child {
        data: Box<RecursiveUnionInternal>,
    },
    Children {
        /// an array of child nodes
        data: Vec<Box<RecursiveUnionInternal>>,
    },
    Text {
        /// Text node
        data: String,
    },
    Shape {
        /// Shape node
        data: RecursiveUnionInternalDataShape,
    },
}

impl ArriModel for RecursiveUnionInternal {
    fn new() -> Self {
        Self::Children { data: Vec::new() }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let kind = match _val_.get("kind") {
                    Some(serde_json::Value::String(kind_val)) => kind_val.to_owned(),
                    _ => "".to_string(),
                };
                match kind.as_str() {
                    "child" => {
                        let data = match _val_.get("data") {
                            Some(data_val) => match data_val {
                                serde_json::Value::Object(_) => {
                                    Box::new(RecursiveUnionInternal::from_json(data_val.to_owned()))
                                }
                                _ => {
                                    Box::new(RecursiveUnionInternal::from_json(data_val.to_owned()))
                                }
                            },
                            _ => Box::new(RecursiveUnionInternal::new()),
                        };
                        Self::Child { data }
                    }
                    "children" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::Array(data_val)) => {
                                let mut data_val_result: Vec<Box<RecursiveUnionInternal>> =
                                    Vec::new();
                                for data_val_element in data_val {
                                    data_val_result.push(match Some(data_val_element) {
                                        Some(data_val_element_val) => match data_val_element_val {
                                            serde_json::Value::Object(_) => {
                                                Box::new(RecursiveUnionInternal::from_json(
                                                    data_val_element_val.to_owned(),
                                                ))
                                            }
                                            _ => Box::new(RecursiveUnionInternal::from_json(
                                                data_val_element_val.to_owned(),
                                            )),
                                        },
                                        _ => Box::new(RecursiveUnionInternal::new()),
                                    });
                                }
                                data_val_result
                            }
                            _ => Vec::new(),
                        };
                        Self::Children { data }
                    }
                    "text" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::String(data_val)) => data_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::Text { data }
                    }
                    "shape" => {
                        let data = match _val_.get("data") {
                            Some(data_val) => {
                                RecursiveUnionInternalDataShape::from_json(data_val.to_owned())
                            }
                            _ => RecursiveUnionInternalDataShape::new(),
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
                _json_output_.push_str("\"kind\":\"child\"");
                _json_output_.push_str(",\"data\":");
                _json_output_.push_str(data.to_json_string().as_str());
            }
            Self::Children { data } => {
                _json_output_.push_str("\"kind\":\"children\"");
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
                _json_output_.push_str("\"kind\":\"text\"");
                _json_output_.push_str(",\"data\":");
                _json_output_.push_str(serialize_string(data).as_str());
            }
            Self::Shape { data } => {
                _json_output_.push_str("\"kind\":\"shape\"");
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
                _query_parts_.push("kind=child".to_string());
                println!("[WARNING] cannot serialize nested objects to query params. Skipping field at RecursiveUnionInternal/data.");
            }
            Self::Children { data } => {
                _query_parts_.push("kind=children".to_string());
                println!("[WARNING] cannot serialize arrays to query params. Skipping field at RecursiveUnionInternal/data.");
            }
            Self::Text { data } => {
                _query_parts_.push("kind=text".to_string());
                _query_parts_.push(format!("data={}", encode_query_component(data)));
            }
            Self::Shape { data } => {
                _query_parts_.push("kind=shape".to_string());
                println!("[WARNING] cannot serialize nested objects to query params. Skipping field at RecursiveUnionInternal/data.");
            }
        }
        _query_parts_.join("&")
    }
}

/// Shape node
#[derive(Clone, Debug, PartialEq)]
pub struct RecursiveUnionInternalDataShape {
    pub width: f64,
    pub height: f64,
    pub color: String,
}

impl ArriModel for RecursiveUnionInternalDataShape {
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
        _query_parts_.push(format!("color={}", encode_query_component(&self.color)));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionInternalGetRequest {
    WithFields {
        string: String,
        nullable_string: Option<String>,
        float64: f64,
        int64: i64,
        boolean: bool,
        timestamp: DateTime<FixedOffset>,
        nullable_enum: Option<UnionInternalGetRequestNullableEnumWithFields>,
        optional_string: Option<String>,
    },
    Empty {},
}

impl ArriModel for UnionInternalGetRequest {
    fn new() -> Self {
        Self::WithFields {
            string: "".to_string(),
            nullable_string: None,
            float64: 0.0,
            int64: 0,
            boolean: false,
            timestamp: DateTime::default(),
            nullable_enum: None,
            optional_string: None,
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let kind = match _val_.get("kind") {
                    Some(serde_json::Value::String(kind_val)) => kind_val.to_owned(),
                    _ => "".to_string(),
                };
                match kind.as_str() {
                    "with-fields" => {
                        let string = match _val_.get("string") {
                            Some(serde_json::Value::String(string_val)) => string_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let nullable_string = match _val_.get("nullableString") {
                            Some(serde_json::Value::String(nullable_string_val)) => {
                                Some(nullable_string_val.to_owned())
                            }
                            _ => None,
                        };
                        let float64 = match _val_.get("float64") {
                            Some(serde_json::Value::Number(float64_val)) => {
                                float64_val.as_f64().unwrap_or(0.0)
                            }
                            _ => 0.0,
                        };
                        let int64 = match _val_.get("int64") {
                            Some(serde_json::Value::String(int64_val)) => {
                                int64_val.parse::<i64>().unwrap_or(0)
                            }
                            _ => 0,
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
                        let nullable_enum = match _val_.get("nullableEnum") {
                            Some(serde_json::Value::String(nullable_enum_val)) => {
                                Some(UnionInternalGetRequestNullableEnumWithFields::from_string(
                                    nullable_enum_val.to_owned(),
                                ))
                            }
                            _ => None,
                        };
                        let optional_string = match _val_.get("optionalString") {
                            Some(serde_json::Value::String(optional_string_val)) => {
                                Some(optional_string_val.to_owned())
                            }
                            _ => None,
                        };
                        Self::WithFields {
                            string,
                            nullable_string,
                            float64,
                            int64,
                            boolean,
                            timestamp,
                            nullable_enum,
                            optional_string,
                        }
                    }
                    "empty" => Self::Empty {},
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
            Self::WithFields {
                string,
                nullable_string,
                float64,
                int64,
                boolean,
                timestamp,
                nullable_enum,
                optional_string,
            } => {
                _json_output_.push_str("\"kind\":\"with-fields\"");
                _json_output_.push_str(",\"string\":");
                _json_output_.push_str(serialize_string(string).as_str());
                _json_output_.push_str(",\"nullableString\":");
                match nullable_string {
                    Some(nullable_string_val) => {
                        _json_output_.push_str(serialize_string(nullable_string_val).as_str());
                    }
                    _ => {
                        _json_output_.push_str("null");
                    }
                };
                _json_output_.push_str(",\"float64\":");
                _json_output_.push_str(float64.to_string().as_str());
                _json_output_.push_str(",\"int64\":");
                _json_output_.push_str(format!("\"{}\"", int64).as_str());
                _json_output_.push_str(",\"boolean\":");
                _json_output_.push_str(boolean.to_string().as_str());
                _json_output_.push_str(",\"timestamp\":");
                _json_output_.push_str(serialize_date_time(timestamp, true).as_str());
                _json_output_.push_str(",\"nullableEnum\":");
                match nullable_enum {
                    Some(nullable_enum_val) => {
                        _json_output_
                            .push_str(format!("\"{}\"", nullable_enum_val.serial_value()).as_str());
                    }
                    _ => {
                        _json_output_.push_str("null");
                    }
                };
                match optional_string {
                    Some(optional_string_val) => {
                        _json_output_.push_str(",\"optionalString\":");
                        _json_output_.push_str(serialize_string(optional_string_val).as_str());
                    }
                    _ => {}
                };
            }
            Self::Empty {} => {
                _json_output_.push_str("\"kind\":\"empty\"");
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self {
            Self::WithFields {
                string,
                nullable_string,
                float64,
                int64,
                boolean,
                timestamp,
                nullable_enum,
                optional_string,
            } => {
                _query_parts_.push("kind=with-fields".to_string());
                _query_parts_.push(format!("string={}", encode_query_component(string)));
                match nullable_string {
                    Some(nullable_string_val) => {
                        _query_parts_.push(format!(
                            "nullableString={}",
                            encode_query_component(nullable_string_val)
                        ));
                    }
                    _ => {
                        _query_parts_.push("nullableString=null".to_string());
                    }
                };
                _query_parts_.push(format!("float64={}", float64));
                _query_parts_.push(format!("int64={}", int64));
                _query_parts_.push(format!("boolean={}", boolean));
                _query_parts_.push(format!(
                    "timestamp={}",
                    encode_query_component(&serialize_date_time(timestamp, false))
                ));
                match nullable_enum {
                    Some(nullable_enum_val) => {
                        _query_parts_.push(format!(
                            "nullableEnum={}",
                            encode_query_component(&nullable_enum_val.serial_value())
                        ));
                    }
                    _ => {
                        _query_parts_.push("nullableEnum=null".to_string());
                    }
                };
                match optional_string {
                    Some(optional_string_val) => {
                        _query_parts_.push(format!(
                            "optionalString={}",
                            encode_query_component(optional_string_val)
                        ));
                    }
                    _ => {}
                };
            }
            Self::Empty {} => {
                _query_parts_.push("kind=empty".to_string());
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionInternalGetRequestNullableEnumWithFields {
    A,
    B,
}

impl ArriEnum for UnionInternalGetRequestNullableEnumWithFields {
    fn default() -> Self {
        UnionInternalGetRequestNullableEnumWithFields::A
    }
    fn from_string(input: String) -> Self {
        match input.as_str() {
            "A" => Self::A,
            "B" => Self::B,
            _ => Self::default(),
        }
    }
    fn serial_value(&self) -> String {
        match &self {
            UnionInternalGetRequestNullableEnumWithFields::A => "A".to_string(),
            UnionInternalGetRequestNullableEnumWithFields::B => "B".to_string(),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct UnionVariantShapes {
    pub internal: UnionVariantShapesInternal,
    pub external: UnionVariantShapesExternal,
    pub adjacent: UnionVariantShapesAdjacent,
}

impl ArriModel for UnionVariantShapes {
    fn new() -> Self {
        Self {
            internal: UnionVariantShapesInternal::new(),
            external: UnionVariantShapesExternal::new(),
            adjacent: UnionVariantShapesAdjacent::new(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let internal = match _val_.get("internal") {
                    Some(internal_val) => match internal_val {
                        serde_json::Value::Object(_) => {
                            UnionVariantShapesInternal::from_json(internal_val.to_owned())
                        }
                        _ => UnionVariantShapesInternal::new(),
                    },
                    _ => UnionVariantShapesInternal::new(),
                };
                let external = match _val_.get("external") {
                    Some(external_val) => match external_val {
                        serde_json::Value::Object(_) => {
                            UnionVariantShapesExternal::from_json(external_val.to_owned())
                        }
                        _ => UnionVariantShapesExternal::new(),
                    },
                    _ => UnionVariantShapesExternal::new(),
                };
                let adjacent = match _val_.get("adjacent") {
                    Some(adjacent_val) => match adjacent_val {
                        serde_json::Value::Object(_) => {
                            UnionVariantShapesAdjacent::from_json(adjacent_val.to_owned())
                        }
                        _ => UnionVariantShapesAdjacent::new(),
                    },
                    _ => UnionVariantShapesAdjacent::new(),
                };
                Self {
                    internal,
                    external,
                    adjacent,
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

        _json_output_.push_str("\"internal\":");
        _json_output_.push_str(&self.internal.to_json_string().as_str());
        _json_output_.push_str(",\"external\":");
        _json_output_.push_str(&self.external.to_json_string().as_str());
        _json_output_.push_str(",\"adjacent\":");
        _json_output_.push_str(&self.adjacent.to_json_string().as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /UnionVariantShapes/internal.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /UnionVariantShapes/external.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /UnionVariantShapes/adjacent.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantShapesInternal {
    Empty {},
    AllOptional {
        first: Option<String>,
        second: Option<i32>,
    },
    Mixed {
        required: String,
        nullable: Option<String>,
        optional: Option<String>,
    },
    Nested {
        array: Vec<UnionVariantShapesInternalArrayElement>,
        record: BTreeMap<String, i64>,
        object: UnionVariantShapesInternalObjectNested,
    },
}

impl ArriModel for UnionVariantShapesInternal {
    fn new() -> Self {
        Self::Empty {}
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let kind = match _val_.get("kind") {
                    Some(serde_json::Value::String(kind_val)) => kind_val.to_owned(),
                    _ => "".to_string(),
                };
                match kind.as_str() {
                    "empty" => Self::Empty {},
                    "all-optional" => {
                        let first = match _val_.get("first") {
                            Some(serde_json::Value::String(first_val)) => {
                                Some(first_val.to_owned())
                            }
                            _ => None,
                        };
                        let second = match _val_.get("second") {
                            Some(serde_json::Value::Number(second_val)) => {
                                match second_val.as_i64() {
                                    Some(second_val_result) => {
                                        match i32::try_from(second_val_result) {
                                            Ok(second_val_result_val) => {
                                                Some(second_val_result_val)
                                            }
                                            Err(_) => None,
                                        }
                                    }
                                    _ => None,
                                }
                            }
                            _ => None,
                        };
                        Self::AllOptional { first, second }
                    }
                    "mixed" => {
                        let required = match _val_.get("required") {
                            Some(serde_json::Value::String(required_val)) => {
                                required_val.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        let nullable = match _val_.get("nullable") {
                            Some(serde_json::Value::String(nullable_val)) => {
                                Some(nullable_val.to_owned())
                            }
                            _ => None,
                        };
                        let optional = match _val_.get("optional") {
                            Some(serde_json::Value::String(optional_val)) => {
                                Some(optional_val.to_owned())
                            }
                            _ => None,
                        };
                        Self::Mixed {
                            required,
                            nullable,
                            optional,
                        }
                    }
                    "nested" => {
                        let array = match _val_.get("array") {
                            Some(serde_json::Value::Array(array_val)) => {
                                let mut array_val_result: Vec<
                                    UnionVariantShapesInternalArrayElement,
                                > = Vec::new();
                                for array_val_element in array_val {
                                    array_val_result.push(match Some(array_val_element) {
                                        Some(array_val_element_val) => {
                                            UnionVariantShapesInternalArrayElement::from_json(
                                                array_val_element_val.to_owned(),
                                            )
                                        }
                                        _ => UnionVariantShapesInternalArrayElement::new(),
                                    });
                                }
                                array_val_result
                            }
                            _ => Vec::new(),
                        };
                        let record = match _val_.get("record") {
                            Some(serde_json::Value::Object(record_val)) => {
                                let mut record_val_result: BTreeMap<String, i64> = BTreeMap::new();
                                for (_key_, _value_) in record_val.into_iter() {
                                    record_val_result.insert(
                                        _key_.to_owned(),
                                        match Some(_value_.to_owned()) {
                                            Some(serde_json::Value::String(value_val)) => {
                                                value_val.parse::<i64>().unwrap_or(0)
                                            }
                                            _ => 0,
                                        },
                                    );
                                }
                                record_val_result
                            }
                            _ => BTreeMap::new(),
                        };
                        let object = match _val_.get("object") {
                            Some(object_val) => UnionVariantShapesInternalObjectNested::from_json(
                                object_val.to_owned(),
                            ),
                            _ => UnionVariantShapesInternalObjectNested::new(),
                        };
                        Self::Nested {
                            array,
                            record,
                            object,
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
            Self::Empty {} => {
                _json_output_.push_str("\"kind\":\"empty\"");
            }
            Self::AllOptional { first, second } => {
                _json_output_.push_str("\"kind\":\"all-optional\"");
                match first {
                    Some(first_val) => {
                        _json_output_.push_str(",\"first\":");
                        _json_output_.push_str(serialize_string(first_val).as_str());
                    }
                    _ => {}
                };
                match second {
                    Some(second_val) => {
                        _json_output_.push_str(",\"second\":");
                        _json_output_.push_str(second_val.to_string().as_str());
                    }
                    _ => {}
                };
            }
            Self::Mixed {
                required,
                nullable,
                optional,
            } => {
                _json_output_.push_str("\"kind\":\"mixed\"");
                _json_output_.push_str(",\"required\":");
                _json_output_.push_str(serialize_string(required).as_str());
                _json_output_.push_str(",\"nullable\":");
                match nullable {
                    Some(nullable_val) => {
                        _json_output_.push_str(serialize_string(nullable_val).as_str());
                    }
                    _ => {
                        _json_output_.push_str("null");
                    }
                };
                match optional {
                    Some(optional_val) => {
                        _json_output_.push_str(",\"optional\":");
                        _json_output_.push_str(serialize_string(optional_val).as_str());
                    }
                    _ => {}
                };
            }
            Self::Nested {
                array,
                record,
                object,
            } => {
                _json_output_.push_str("\"kind\":\"nested\"");
                _json_output_.push_str(",\"array\":");
                _json_output_.push('[');
                for (_index_, _element_) in array.iter().enumerate() {
                    if _index_ != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(_element_.to_json_string().as_str());
                }
                _json_output_.push(']');
                _json_output_.push_str(",\"record\":");
                _json_output_.push('{');
                for (_index_, (_key_, _value_)) in record.iter().enumerate() {
                    if _index_ != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(format!("{}:", serialize_string(_key_)).as_str());
                    _json_output_.push_str(format!("\"{}\"", _value_).as_str());
                }
                _json_output_.push('}');
                _json_output_.push_str(",\"object\":");
                _json_output_.push_str(object.to_json_string().as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self {
            Self::Empty {} => {
                _query_parts_.push("kind=empty".to_string());
            }
            Self::AllOptional { first, second } => {
                _query_parts_.push("kind=all-optional".to_string());
                match first {
                    Some(first_val) => {
                        _query_parts_.push(format!("first={}", encode_query_component(first_val)));
                    }
                    _ => {}
                };
                match second {
                    Some(second_val) => {
                        _query_parts_.push(format!("second={}", second_val));
                    }
                    _ => {}
                };
            }
            Self::Mixed {
                required,
                nullable,
                optional,
            } => {
                _query_parts_.push("kind=mixed".to_string());
                _query_parts_.push(format!("required={}", encode_query_component(required)));
                match nullable {
                    Some(nullable_val) => {
                        _query_parts_
                            .push(format!("nullable={}", encode_query_component(nullable_val)));
                    }
                    _ => {
                        _query_parts_.push("nullable=null".to_string());
                    }
                };
                match optional {
                    Some(optional_val) => {
                        _query_parts_
                            .push(format!("optional={}", encode_query_component(optional_val)));
                    }
                    _ => {}
                };
            }
            Self::Nested {
                array,
                record,
                object,
            } => {
                _query_parts_.push("kind=nested".to_string());
                println!("[WARNING] cannot serialize arrays to query params. Skipping field at /UnionVariantShapes/internal/array.");
                println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /UnionVariantShapes/internal/record.");
                println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /UnionVariantShapes/internal/object.");
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct UnionVariantShapesInternalArrayElement {
    pub id: String,
}

impl ArriModel for UnionVariantShapesInternalArrayElement {
    fn new() -> Self {
        Self { id: "".to_string() }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let id = match _val_.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { id }
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
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", encode_query_component(&self.id)));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct UnionVariantShapesInternalObjectNested {
    pub timestamp: DateTime<FixedOffset>,
}

impl ArriModel for UnionVariantShapesInternalObjectNested {
    fn new() -> Self {
        Self {
            timestamp: DateTime::default(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let timestamp = match _val_.get("timestamp") {
                    Some(serde_json::Value::String(timestamp_val)) => {
                        DateTime::<FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(DateTime::default())
                    }
                    _ => DateTime::default(),
                };
                Self { timestamp }
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

        _json_output_.push_str("\"timestamp\":");
        _json_output_.push_str(serialize_date_time(&self.timestamp, true).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!(
            "timestamp={}",
            encode_query_component(&serialize_date_time(&self.timestamp, false))
        ));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantShapesExternal {
    Empty(UnionVariantShapesExternalEmptyValue),
    AllOptional(UnionVariantShapesExternalAllOptionalValue),
    Mixed(UnionVariantShapesExternalMixedValue),
}

impl ArriModel for UnionVariantShapesExternal {
    fn new() -> Self {
        Self::Empty(UnionVariantShapesExternalEmptyValue::new())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                if _val_.contains_key("empty") {
                    let value = match _val_.get("empty") {
                        Some(value_val) => {
                            UnionVariantShapesExternalEmptyValue::from_json(value_val.to_owned())
                        }
                        _ => UnionVariantShapesExternalEmptyValue::new(),
                    };
                    return Self::Empty(value);
                }
                if _val_.contains_key("all-optional") {
                    let value = match _val_.get("all-optional") {
                        Some(value_val) => UnionVariantShapesExternalAllOptionalValue::from_json(
                            value_val.to_owned(),
                        ),
                        _ => UnionVariantShapesExternalAllOptionalValue::new(),
                    };
                    return Self::AllOptional(value);
                }
                if _val_.contains_key("mixed") {
                    let value = match _val_.get("mixed") {
                        Some(value_val) => {
                            UnionVariantShapesExternalMixedValue::from_json(value_val.to_owned())
                        }
                        _ => UnionVariantShapesExternalMixedValue::new(),
                    };
                    return Self::Mixed(value);
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
            Self::Empty(value) => {
                _json_output_.push_str("\"empty\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
            Self::AllOptional(value) => {
                _json_output_.push_str("\"all-optional\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
            Self::Mixed(value) => {
                _json_output_.push_str("\"mixed\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping UnionVariantShapesExternal.");
        "".to_string()
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct UnionVariantShapesExternalEmptyValue {}

impl ArriModel for UnionVariantShapesExternalEmptyValue {
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

#[derive(Clone, Debug, PartialEq)]
pub struct UnionVariantShapesExternalAllOptionalValue {
    pub first: Option<String>,
    pub second: Option<i32>,
}

impl ArriModel for UnionVariantShapesExternalAllOptionalValue {
    fn new() -> Self {
        Self {
            first: None,
            second: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let first = match _val_.get("first") {
                    Some(serde_json::Value::String(first_val)) => Some(first_val.to_owned()),
                    _ => None,
                };
                let second = match _val_.get("second") {
                    Some(serde_json::Value::Number(second_val)) => match second_val.as_i64() {
                        Some(second_val_result) => match i32::try_from(second_val_result) {
                            Ok(second_val_result_val) => Some(second_val_result_val),
                            Err(_) => None,
                        },
                        _ => None,
                    },
                    _ => None,
                };
                Self { first, second }
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
        match &self.first {
            Some(first_val) => {
                _json_output_.push_str("\"first\":");
                _json_output_.push_str(serialize_string(first_val).as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.second {
            Some(second_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"second\":");
                _json_output_.push_str(second_val.to_string().as_str());
            }
            _ => {}
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self.first {
            Some(first_val) => {
                _query_parts_.push(format!("first={}", encode_query_component(first_val)));
            }
            _ => {}
        };
        match &self.second {
            Some(second_val) => {
                _query_parts_.push(format!("second={}", second_val));
            }
            _ => {}
        };
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct UnionVariantShapesExternalMixedValue {
    pub required: String,
    pub nullable: Option<String>,
    pub optional: Option<String>,
}

impl ArriModel for UnionVariantShapesExternalMixedValue {
    fn new() -> Self {
        Self {
            required: "".to_string(),
            nullable: None,
            optional: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let required = match _val_.get("required") {
                    Some(serde_json::Value::String(required_val)) => required_val.to_owned(),
                    _ => "".to_string(),
                };
                let nullable = match _val_.get("nullable") {
                    Some(serde_json::Value::String(nullable_val)) => Some(nullable_val.to_owned()),
                    _ => None,
                };
                let optional = match _val_.get("optional") {
                    Some(serde_json::Value::String(optional_val)) => Some(optional_val.to_owned()),
                    _ => None,
                };
                Self {
                    required,
                    nullable,
                    optional,
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

        _json_output_.push_str("\"required\":");
        _json_output_.push_str(serialize_string(&self.required).as_str());
        _json_output_.push_str(",\"nullable\":");
        match &self.nullable {
            Some(nullable_val) => {
                _json_output_.push_str(serialize_string(nullable_val).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        match &self.optional {
            Some(optional_val) => {
                _json_output_.push_str(",\"optional\":");
                _json_output_.push_str(serialize_string(optional_val).as_str())
            }
            _ => {}
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!(
            "required={}",
            encode_query_component(&self.required)
        ));
        match &self.nullable {
            Some(nullable_val) => {
                _query_parts_.push(format!("nullable={}", encode_query_component(nullable_val)));
            }
            _ => {
                _query_parts_.push("nullable=null".to_string());
            }
        };
        match &self.optional {
            Some(optional_val) => {
                _query_parts_.push(format!("optional={}", encode_query_component(optional_val)));
            }
            _ => {}
        };
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantShapesAdjacent {
    Empty(UnionVariantShapesAdjacentEmptyData),
    AllOptional(UnionVariantShapesAdjacentAllOptionalData),
    Mixed(UnionVariantShapesAdjacentMixedData),
}

impl ArriModel for UnionVariantShapesAdjacent {
    fn new() -> Self {
        Self::Empty(UnionVariantShapesAdjacentEmptyData::new())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let kind = match _val_.get("kind") {
                    Some(serde_json::Value::String(kind_val)) => kind_val.to_owned(),
                    _ => "".to_string(),
                };
                match kind.as_str() {
                    "empty" => {
                        let data = match _val_.get("data") {
                            Some(data_val) => {
                                UnionVariantShapesAdjacentEmptyData::from_json(data_val.to_owned())
                            }
                            _ => UnionVariantShapesAdjacentEmptyData::new(),
                        };
                        Self::Empty(data)
                    }
                    "all-optional" => {
                        let data = match _val_.get("data") {
                            Some(data_val) => UnionVariantShapesAdjacentAllOptionalData::from_json(
                                data_val.to_owned(),
                            ),
                            _ => UnionVariantShapesAdjacentAllOptionalData::new(),
                        };
                        Self::AllOptional(data)
                    }
                    "mixed" => {
                        let data = match _val_.get("data") {
                            Some(data_val) => {
                                UnionVariantShapesAdjacentMixedData::from_json(data_val.to_owned())
                            }
                            _ => UnionVariantShapesAdjacentMixedData::new(),
                        };
                        Self::Mixed(data)
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
            Self::Empty(data) => {
                _json_output_.push_str("\"kind\":\"empty\",\"data\":");
                _json_output_.push_str(data.to_json_string().as_str());
            }
            Self::AllOptional(data) => {
                _json_output_.push_str("\"kind\":\"all-optional\",\"data\":");
                _json_output_.push_str(data.to_json_string().as_str());
            }
            Self::Mixed(data) => {
                _json_output_.push_str("\"kind\":\"mixed\",\"data\":");
                _json_output_.push_str(data.to_json_string().as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping UnionVariantShapesAdjacent.");
        "".to_string()
    }
}

impl UnionVariantShapesAdjacent {
    pub fn kind(&self) -> &'static str {
        match &self {
            Self::Empty(_) => "empty",
            Self::AllOptional(_) => "all-optional",
            Self::Mixed(_) => "mixed",
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct UnionVariantShapesAdjacentEmptyData {}

impl ArriModel for UnionVariantShapesAdjacentEmptyData {
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

#[derive(Clone, Debug, PartialEq)]
pub struct UnionVariantShapesAdjacentAllOptionalData {
    pub first: Option<String>,
    pub second: Option<i32>,
}

impl ArriModel for UnionVariantShapesAdjacentAllOptionalData {
    fn new() -> Self {
        Self {
            first: None,
            second: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let first = match _val_.get("first") {
                    Some(serde_json::Value::String(first_val)) => Some(first_val.to_owned()),
                    _ => None,
                };
                let second = match _val_.get("second") {
                    Some(serde_json::Value::Number(second_val)) => match second_val.as_i64() {
                        Some(second_val_result) => match i32::try_from(second_val_result) {
                            Ok(second_val_result_val) => Some(second_val_result_val),
                            Err(_) => None,
                        },
                        _ => None,
                    },
                    _ => None,
                };
                Self { first, second }
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
        match &self.first {
            Some(first_val) => {
                _json_output_.push_str("\"first\":");
                _json_output_.push_str(serialize_string(first_val).as_str());
                _has_keys_ = true;
            }
            _ => {}
        };
        match &self.second {
            Some(second_val) => {
                if _has_keys_ {
                    _json_output_.push(',');
                }
                _json_output_.push_str("\"second\":");
                _json_output_.push_str(second_val.to_string().as_str());
            }
            _ => {}
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self.first {
            Some(first_val) => {
                _query_parts_.push(format!("first={}", encode_query_component(first_val)));
            }
            _ => {}
        };
        match &self.second {
            Some(second_val) => {
                _query_parts_.push(format!("second={}", second_val));
            }
            _ => {}
        };
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct UnionVariantShapesAdjacentMixedData {
    pub required: String,
    pub nullable: Option<String>,
    pub optional: Option<String>,
}

impl ArriModel for UnionVariantShapesAdjacentMixedData {
    fn new() -> Self {
        Self {
            required: "".to_string(),
            nullable: None,
            optional: None,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let required = match _val_.get("required") {
                    Some(serde_json::Value::String(required_val)) => required_val.to_owned(),
                    _ => "".to_string(),
                };
                let nullable = match _val_.get("nullable") {
                    Some(serde_json::Value::String(nullable_val)) => Some(nullable_val.to_owned()),
                    _ => None,
                };
                let optional = match _val_.get("optional") {
                    Some(serde_json::Value::String(optional_val)) => Some(optional_val.to_owned()),
                    _ => None,
                };
                Self {
                    required,
                    nullable,
                    optional,
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

        _json_output_.push_str("\"required\":");
        _json_output_.push_str(serialize_string(&self.required).as_str());
        _json_output_.push_str(",\"nullable\":");
        match &self.nullable {
            Some(nullable_val) => {
                _json_output_.push_str(serialize_string(nullable_val).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        match &self.optional {
            Some(optional_val) => {
                _json_output_.push_str(",\"optional\":");
                _json_output_.push_str(serialize_string(optional_val).as_str())
            }
            _ => {}
        };
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!(
            "required={}",
            encode_query_component(&self.required)
        ));
        match &self.nullable {
            Some(nullable_val) => {
                _query_parts_.push(format!("nullable={}", encode_query_component(nullable_val)));
            }
            _ => {
                _query_parts_.push("nullable=null".to_string());
            }
        };
        match &self.optional {
            Some(optional_val) => {
                _query_parts_.push(format!("optional={}", encode_query_component(optional_val)));
            }
            _ => {}
        };
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct UnionVariantTypes {
    pub external: UnionVariantTypesExternal,
    pub adjacent: UnionVariantTypesAdjacent,
    pub internal: UnionVariantTypesInternal,
}

impl ArriModel for UnionVariantTypes {
    fn new() -> Self {
        Self {
            external: UnionVariantTypesExternal::new(),
            adjacent: UnionVariantTypesAdjacent::new(),
            internal: UnionVariantTypesInternal::new(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let external = match _val_.get("external") {
                    Some(external_val) => match external_val {
                        serde_json::Value::Object(_) => {
                            UnionVariantTypesExternal::from_json(external_val.to_owned())
                        }
                        _ => UnionVariantTypesExternal::new(),
                    },
                    _ => UnionVariantTypesExternal::new(),
                };
                let adjacent = match _val_.get("adjacent") {
                    Some(adjacent_val) => match adjacent_val {
                        serde_json::Value::Object(_) => {
                            UnionVariantTypesAdjacent::from_json(adjacent_val.to_owned())
                        }
                        _ => UnionVariantTypesAdjacent::new(),
                    },
                    _ => UnionVariantTypesAdjacent::new(),
                };
                let internal = match _val_.get("internal") {
                    Some(internal_val) => match internal_val {
                        serde_json::Value::Object(_) => {
                            UnionVariantTypesInternal::from_json(internal_val.to_owned())
                        }
                        _ => UnionVariantTypesInternal::new(),
                    },
                    _ => UnionVariantTypesInternal::new(),
                };
                Self {
                    external,
                    adjacent,
                    internal,
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

        _json_output_.push_str("\"external\":");
        _json_output_.push_str(&self.external.to_json_string().as_str());
        _json_output_.push_str(",\"adjacent\":");
        _json_output_.push_str(&self.adjacent.to_json_string().as_str());
        _json_output_.push_str(",\"internal\":");
        _json_output_.push_str(&self.internal.to_json_string().as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /UnionVariantTypes/external.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /UnionVariantTypes/adjacent.");
        println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /UnionVariantTypes/internal.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantTypesExternal {
    String(String),
    Int64(i64),
    Uint64(u64),
    Float64(f64),
    Enumerator(UnionVariantTypesExternalEnumeratorValue),
    Record(BTreeMap<String, String>),
    Any(serde_json::Value),
    NullableString(Option<String>),
    NullableArray(Option<Vec<String>>),
    ExternalUnion(UnionVariantTypesExternalExternalUnionValue),
    InternalUnion(UnionVariantTypesExternalInternalUnionValue),
    AdjacentUnion(UnionVariantTypesExternalAdjacentUnionValue),
    Class(String),
    Default(String),
}

impl ArriModel for UnionVariantTypesExternal {
    fn new() -> Self {
        Self::String("".to_string())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                if _val_.contains_key("string") {
                    let value = match _val_.get("string") {
                        Some(serde_json::Value::String(value_val)) => value_val.to_owned(),
                        _ => "".to_string(),
                    };
                    return Self::String(value);
                }
                if _val_.contains_key("int64") {
                    let value = match _val_.get("int64") {
                        Some(serde_json::Value::String(value_val)) => {
                            value_val.parse::<i64>().unwrap_or(0)
                        }
                        _ => 0,
                    };
                    return Self::Int64(value);
                }
                if _val_.contains_key("uint64") {
                    let value = match _val_.get("uint64") {
                        Some(serde_json::Value::String(value_val)) => {
                            value_val.parse::<u64>().unwrap_or(0)
                        }
                        _ => 0,
                    };
                    return Self::Uint64(value);
                }
                if _val_.contains_key("float64") {
                    let value = match _val_.get("float64") {
                        Some(serde_json::Value::Number(value_val)) => {
                            value_val.as_f64().unwrap_or(0.0)
                        }
                        _ => 0.0,
                    };
                    return Self::Float64(value);
                }
                if _val_.contains_key("enumerator") {
                    let value = match _val_.get("enumerator") {
                        Some(serde_json::Value::String(value_val)) => {
                            UnionVariantTypesExternalEnumeratorValue::from_string(
                                value_val.to_owned(),
                            )
                        }
                        _ => UnionVariantTypesExternalEnumeratorValue::default(),
                    };
                    return Self::Enumerator(value);
                }
                if _val_.contains_key("record") {
                    let value = match _val_.get("record") {
                        Some(serde_json::Value::Object(value_val)) => {
                            let mut value_val_result: BTreeMap<String, String> = BTreeMap::new();
                            for (_key_, _value_) in value_val.into_iter() {
                                value_val_result.insert(
                                    _key_.to_owned(),
                                    match Some(_value_.to_owned()) {
                                        Some(serde_json::Value::String(value_val)) => {
                                            value_val.to_owned()
                                        }
                                        _ => "".to_string(),
                                    },
                                );
                            }
                            value_val_result
                        }
                        _ => BTreeMap::new(),
                    };
                    return Self::Record(value);
                }
                if _val_.contains_key("any") {
                    let value = match _val_.get("any") {
                        Some(value_val) => value_val.to_owned(),
                        _ => serde_json::Value::Null,
                    };
                    return Self::Any(value);
                }
                if _val_.contains_key("nullableString") {
                    let value = match _val_.get("nullableString") {
                        Some(serde_json::Value::String(value_val)) => Some(value_val.to_owned()),
                        _ => None,
                    };
                    return Self::NullableString(value);
                }
                if _val_.contains_key("nullableArray") {
                    let value = match _val_.get("nullableArray") {
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
                            Some(value_val_result)
                        }
                        _ => None,
                    };
                    return Self::NullableArray(value);
                }
                if _val_.contains_key("externalUnion") {
                    let value = match _val_.get("externalUnion") {
                        Some(value_val) => match value_val {
                            serde_json::Value::Object(_) => {
                                UnionVariantTypesExternalExternalUnionValue::from_json(
                                    value_val.to_owned(),
                                )
                            }
                            _ => UnionVariantTypesExternalExternalUnionValue::new(),
                        },
                        _ => UnionVariantTypesExternalExternalUnionValue::new(),
                    };
                    return Self::ExternalUnion(value);
                }
                if _val_.contains_key("internalUnion") {
                    let value = match _val_.get("internalUnion") {
                        Some(value_val) => match value_val {
                            serde_json::Value::Object(_) => {
                                UnionVariantTypesExternalInternalUnionValue::from_json(
                                    value_val.to_owned(),
                                )
                            }
                            _ => UnionVariantTypesExternalInternalUnionValue::new(),
                        },
                        _ => UnionVariantTypesExternalInternalUnionValue::new(),
                    };
                    return Self::InternalUnion(value);
                }
                if _val_.contains_key("adjacentUnion") {
                    let value = match _val_.get("adjacentUnion") {
                        Some(value_val) => match value_val {
                            serde_json::Value::Object(_) => {
                                UnionVariantTypesExternalAdjacentUnionValue::from_json(
                                    value_val.to_owned(),
                                )
                            }
                            _ => UnionVariantTypesExternalAdjacentUnionValue::new(),
                        },
                        _ => UnionVariantTypesExternalAdjacentUnionValue::new(),
                    };
                    return Self::AdjacentUnion(value);
                }
                if _val_.contains_key("class") {
                    let value = match _val_.get("class") {
                        Some(serde_json::Value::String(value_val)) => value_val.to_owned(),
                        _ => "".to_string(),
                    };
                    return Self::Class(value);
                }
                if _val_.contains_key("default") {
                    let value = match _val_.get("default") {
                        Some(serde_json::Value::String(value_val)) => value_val.to_owned(),
                        _ => "".to_string(),
                    };
                    return Self::Default(value);
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
            Self::String(value) => {
                _json_output_.push_str("\"string\":");
                _json_output_.push_str(serialize_string(value).as_str());
            }
            Self::Int64(value) => {
                _json_output_.push_str("\"int64\":");
                _json_output_.push_str(format!("\"{}\"", value).as_str());
            }
            Self::Uint64(value) => {
                _json_output_.push_str("\"uint64\":");
                _json_output_.push_str(format!("\"{}\"", value).as_str());
            }
            Self::Float64(value) => {
                _json_output_.push_str("\"float64\":");
                _json_output_.push_str(value.to_string().as_str());
            }
            Self::Enumerator(value) => {
                _json_output_.push_str("\"enumerator\":");
                _json_output_.push_str(format!("\"{}\"", value.serial_value()).as_str());
            }
            Self::Record(value) => {
                _json_output_.push_str("\"record\":");
                _json_output_.push('{');
                for (_index_, (_key_, _value_)) in value.iter().enumerate() {
                    if _index_ != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(format!("{}:", serialize_string(_key_)).as_str());
                    _json_output_.push_str(serialize_string(_value_).as_str());
                }
                _json_output_.push('}');
            }
            Self::Any(value) => {
                _json_output_.push_str("\"any\":");
                _json_output_.push_str(
                    serde_json::to_string(value)
                        .unwrap_or("null".to_string())
                        .as_str(),
                );
            }
            Self::NullableString(value) => {
                _json_output_.push_str("\"nullableString\":");
                match value {
                    Some(value_val) => {
                        _json_output_.push_str(serialize_string(value_val).as_str());
                    }
                    _ => {
                        _json_output_.push_str("null");
                    }
                };
            }
            Self::NullableArray(value) => {
                _json_output_.push_str("\"nullableArray\":");
                match value {
                    Some(value_val) => {
                        _json_output_.push('[');
                        for (_index_, _element_) in value_val.iter().enumerate() {
                            if _index_ != 0 {
                                _json_output_.push(',');
                            }
                            _json_output_.push_str(serialize_string(_element_).as_str());
                        }
                        _json_output_.push(']');
                    }
                    _ => {
                        _json_output_.push_str("null");
                    }
                };
            }
            Self::ExternalUnion(value) => {
                _json_output_.push_str("\"externalUnion\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
            Self::InternalUnion(value) => {
                _json_output_.push_str("\"internalUnion\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
            Self::AdjacentUnion(value) => {
                _json_output_.push_str("\"adjacentUnion\":");
                _json_output_.push_str(value.to_json_string().as_str());
            }
            Self::Class(value) => {
                _json_output_.push_str("\"class\":");
                _json_output_.push_str(serialize_string(value).as_str());
            }
            Self::Default(value) => {
                _json_output_.push_str("\"default\":");
                _json_output_.push_str(serialize_string(value).as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping UnionVariantTypesExternal.");
        "".to_string()
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantTypesExternalEnumeratorValue {
    A,
    B,
}

impl ArriEnum for UnionVariantTypesExternalEnumeratorValue {
    fn default() -> Self {
        UnionVariantTypesExternalEnumeratorValue::A
    }
    fn from_string(input: String) -> Self {
        match input.as_str() {
            "A" => Self::A,
            "B" => Self::B,
            _ => Self::default(),
        }
    }
    fn serial_value(&self) -> String {
        match &self {
            UnionVariantTypesExternalEnumeratorValue::A => "A".to_string(),
            UnionVariantTypesExternalEnumeratorValue::B => "B".to_string(),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantTypesExternalExternalUnionValue {
    Text(String),
}

impl ArriModel for UnionVariantTypesExternalExternalUnionValue {
    fn new() -> Self {
        Self::Text("".to_string())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                if _val_.contains_key("text") {
                    let value = match _val_.get("text") {
                        Some(serde_json::Value::String(value_val)) => value_val.to_owned(),
                        _ => "".to_string(),
                    };
                    return Self::Text(value);
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
            Self::Text(value) => {
                _json_output_.push_str("\"text\":");
                _json_output_.push_str(serialize_string(value).as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping UnionVariantTypesExternalExternalUnionValue.");
        "".to_string()
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantTypesExternalInternalUnionValue {
    Circle { radius: f64 },
}

impl ArriModel for UnionVariantTypesExternalInternalUnionValue {
    fn new() -> Self {
        Self::Circle { radius: 0.0 }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let shape = match _val_.get("shape") {
                    Some(serde_json::Value::String(shape_val)) => shape_val.to_owned(),
                    _ => "".to_string(),
                };
                match shape.as_str() {
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
            Self::Circle { radius } => {
                _query_parts_.push("shape=circle".to_string());
                _query_parts_.push(format!("radius={}", radius));
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantTypesExternalAdjacentUnionValue {
    Text(String),
}

impl ArriModel for UnionVariantTypesExternalAdjacentUnionValue {
    fn new() -> Self {
        Self::Text("".to_string())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let kind = match _val_.get("kind") {
                    Some(serde_json::Value::String(kind_val)) => kind_val.to_owned(),
                    _ => "".to_string(),
                };
                match kind.as_str() {
                    "text" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::String(data_val)) => data_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::Text(data)
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
            Self::Text(data) => {
                _json_output_.push_str("\"kind\":\"text\",\"data\":");
                _json_output_.push_str(serialize_string(data).as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping UnionVariantTypesExternalAdjacentUnionValue.");
        "".to_string()
    }
}

impl UnionVariantTypesExternalAdjacentUnionValue {
    pub fn kind(&self) -> &'static str {
        match &self {
            Self::Text(_) => "text",
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantTypesAdjacent {
    String(String),
    Int64(i64),
    Uint64(u64),
    Float64(f64),
    Enumerator(UnionVariantTypesAdjacentEnumeratorData),
    Record(BTreeMap<String, String>),
    Any(serde_json::Value),
    NullableString(Option<String>),
    NullableArray(Option<Vec<String>>),
    ExternalUnion(UnionVariantTypesAdjacentExternalUnionData),
    InternalUnion(UnionVariantTypesAdjacentInternalUnionData),
    AdjacentUnion(UnionVariantTypesAdjacentAdjacentUnionData),
    Class(String),
    Default(String),
}

impl ArriModel for UnionVariantTypesAdjacent {
    fn new() -> Self {
        Self::String("".to_string())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let kind = match _val_.get("kind") {
                    Some(serde_json::Value::String(kind_val)) => kind_val.to_owned(),
                    _ => "".to_string(),
                };
                match kind.as_str() {
                    "string" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::String(data_val)) => data_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::String(data)
                    }
                    "int64" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::String(data_val)) => {
                                data_val.parse::<i64>().unwrap_or(0)
                            }
                            _ => 0,
                        };
                        Self::Int64(data)
                    }
                    "uint64" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::String(data_val)) => {
                                data_val.parse::<u64>().unwrap_or(0)
                            }
                            _ => 0,
                        };
                        Self::Uint64(data)
                    }
                    "float64" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::Number(data_val)) => {
                                data_val.as_f64().unwrap_or(0.0)
                            }
                            _ => 0.0,
                        };
                        Self::Float64(data)
                    }
                    "enumerator" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::String(data_val)) => {
                                UnionVariantTypesAdjacentEnumeratorData::from_string(
                                    data_val.to_owned(),
                                )
                            }
                            _ => UnionVariantTypesAdjacentEnumeratorData::default(),
                        };
                        Self::Enumerator(data)
                    }
                    "record" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::Object(data_val)) => {
                                let mut data_val_result: BTreeMap<String, String> = BTreeMap::new();
                                for (_key_, _value_) in data_val.into_iter() {
                                    data_val_result.insert(
                                        _key_.to_owned(),
                                        match Some(_value_.to_owned()) {
                                            Some(serde_json::Value::String(value_val)) => {
                                                value_val.to_owned()
                                            }
                                            _ => "".to_string(),
                                        },
                                    );
                                }
                                data_val_result
                            }
                            _ => BTreeMap::new(),
                        };
                        Self::Record(data)
                    }
                    "any" => {
                        let data = match _val_.get("data") {
                            Some(data_val) => data_val.to_owned(),
                            _ => serde_json::Value::Null,
                        };
                        Self::Any(data)
                    }
                    "nullableString" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::String(data_val)) => Some(data_val.to_owned()),
                            _ => None,
                        };
                        Self::NullableString(data)
                    }
                    "nullableArray" => {
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
                                Some(data_val_result)
                            }
                            _ => None,
                        };
                        Self::NullableArray(data)
                    }
                    "externalUnion" => {
                        let data = match _val_.get("data") {
                            Some(data_val) => match data_val {
                                serde_json::Value::Object(_) => {
                                    UnionVariantTypesAdjacentExternalUnionData::from_json(
                                        data_val.to_owned(),
                                    )
                                }
                                _ => UnionVariantTypesAdjacentExternalUnionData::new(),
                            },
                            _ => UnionVariantTypesAdjacentExternalUnionData::new(),
                        };
                        Self::ExternalUnion(data)
                    }
                    "internalUnion" => {
                        let data = match _val_.get("data") {
                            Some(data_val) => match data_val {
                                serde_json::Value::Object(_) => {
                                    UnionVariantTypesAdjacentInternalUnionData::from_json(
                                        data_val.to_owned(),
                                    )
                                }
                                _ => UnionVariantTypesAdjacentInternalUnionData::new(),
                            },
                            _ => UnionVariantTypesAdjacentInternalUnionData::new(),
                        };
                        Self::InternalUnion(data)
                    }
                    "adjacentUnion" => {
                        let data = match _val_.get("data") {
                            Some(data_val) => match data_val {
                                serde_json::Value::Object(_) => {
                                    UnionVariantTypesAdjacentAdjacentUnionData::from_json(
                                        data_val.to_owned(),
                                    )
                                }
                                _ => UnionVariantTypesAdjacentAdjacentUnionData::new(),
                            },
                            _ => UnionVariantTypesAdjacentAdjacentUnionData::new(),
                        };
                        Self::AdjacentUnion(data)
                    }
                    "class" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::String(data_val)) => data_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::Class(data)
                    }
                    "default" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::String(data_val)) => data_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::Default(data)
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
            Self::String(data) => {
                _json_output_.push_str("\"kind\":\"string\",\"data\":");
                _json_output_.push_str(serialize_string(data).as_str());
            }
            Self::Int64(data) => {
                _json_output_.push_str("\"kind\":\"int64\",\"data\":");
                _json_output_.push_str(format!("\"{}\"", data).as_str());
            }
            Self::Uint64(data) => {
                _json_output_.push_str("\"kind\":\"uint64\",\"data\":");
                _json_output_.push_str(format!("\"{}\"", data).as_str());
            }
            Self::Float64(data) => {
                _json_output_.push_str("\"kind\":\"float64\",\"data\":");
                _json_output_.push_str(data.to_string().as_str());
            }
            Self::Enumerator(data) => {
                _json_output_.push_str("\"kind\":\"enumerator\",\"data\":");
                _json_output_.push_str(format!("\"{}\"", data.serial_value()).as_str());
            }
            Self::Record(data) => {
                _json_output_.push_str("\"kind\":\"record\",\"data\":");
                _json_output_.push('{');
                for (_index_, (_key_, _value_)) in data.iter().enumerate() {
                    if _index_ != 0 {
                        _json_output_.push(',');
                    }
                    _json_output_.push_str(format!("{}:", serialize_string(_key_)).as_str());
                    _json_output_.push_str(serialize_string(_value_).as_str());
                }
                _json_output_.push('}');
            }
            Self::Any(data) => {
                _json_output_.push_str("\"kind\":\"any\",\"data\":");
                _json_output_.push_str(
                    serde_json::to_string(data)
                        .unwrap_or("null".to_string())
                        .as_str(),
                );
            }
            Self::NullableString(data) => {
                _json_output_.push_str("\"kind\":\"nullableString\",\"data\":");
                match data {
                    Some(data_val) => {
                        _json_output_.push_str(serialize_string(data_val).as_str());
                    }
                    _ => {
                        _json_output_.push_str("null");
                    }
                };
            }
            Self::NullableArray(data) => {
                _json_output_.push_str("\"kind\":\"nullableArray\",\"data\":");
                match data {
                    Some(data_val) => {
                        _json_output_.push('[');
                        for (_index_, _element_) in data_val.iter().enumerate() {
                            if _index_ != 0 {
                                _json_output_.push(',');
                            }
                            _json_output_.push_str(serialize_string(_element_).as_str());
                        }
                        _json_output_.push(']');
                    }
                    _ => {
                        _json_output_.push_str("null");
                    }
                };
            }
            Self::ExternalUnion(data) => {
                _json_output_.push_str("\"kind\":\"externalUnion\",\"data\":");
                _json_output_.push_str(data.to_json_string().as_str());
            }
            Self::InternalUnion(data) => {
                _json_output_.push_str("\"kind\":\"internalUnion\",\"data\":");
                _json_output_.push_str(data.to_json_string().as_str());
            }
            Self::AdjacentUnion(data) => {
                _json_output_.push_str("\"kind\":\"adjacentUnion\",\"data\":");
                _json_output_.push_str(data.to_json_string().as_str());
            }
            Self::Class(data) => {
                _json_output_.push_str("\"kind\":\"class\",\"data\":");
                _json_output_.push_str(serialize_string(data).as_str());
            }
            Self::Default(data) => {
                _json_output_.push_str("\"kind\":\"default\",\"data\":");
                _json_output_.push_str(serialize_string(data).as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping UnionVariantTypesAdjacent.");
        "".to_string()
    }
}

impl UnionVariantTypesAdjacent {
    pub fn kind(&self) -> &'static str {
        match &self {
            Self::String(_) => "string",
            Self::Int64(_) => "int64",
            Self::Uint64(_) => "uint64",
            Self::Float64(_) => "float64",
            Self::Enumerator(_) => "enumerator",
            Self::Record(_) => "record",
            Self::Any(_) => "any",
            Self::NullableString(_) => "nullableString",
            Self::NullableArray(_) => "nullableArray",
            Self::ExternalUnion(_) => "externalUnion",
            Self::InternalUnion(_) => "internalUnion",
            Self::AdjacentUnion(_) => "adjacentUnion",
            Self::Class(_) => "class",
            Self::Default(_) => "default",
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantTypesAdjacentEnumeratorData {
    A,
    B,
}

impl ArriEnum for UnionVariantTypesAdjacentEnumeratorData {
    fn default() -> Self {
        UnionVariantTypesAdjacentEnumeratorData::A
    }
    fn from_string(input: String) -> Self {
        match input.as_str() {
            "A" => Self::A,
            "B" => Self::B,
            _ => Self::default(),
        }
    }
    fn serial_value(&self) -> String {
        match &self {
            UnionVariantTypesAdjacentEnumeratorData::A => "A".to_string(),
            UnionVariantTypesAdjacentEnumeratorData::B => "B".to_string(),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantTypesAdjacentExternalUnionData {
    Text(String),
}

impl ArriModel for UnionVariantTypesAdjacentExternalUnionData {
    fn new() -> Self {
        Self::Text("".to_string())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                if _val_.contains_key("text") {
                    let value = match _val_.get("text") {
                        Some(serde_json::Value::String(value_val)) => value_val.to_owned(),
                        _ => "".to_string(),
                    };
                    return Self::Text(value);
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
            Self::Text(value) => {
                _json_output_.push_str("\"text\":");
                _json_output_.push_str(serialize_string(value).as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping UnionVariantTypesAdjacentExternalUnionData.");
        "".to_string()
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantTypesAdjacentInternalUnionData {
    Circle { radius: f64 },
}

impl ArriModel for UnionVariantTypesAdjacentInternalUnionData {
    fn new() -> Self {
        Self::Circle { radius: 0.0 }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let shape = match _val_.get("shape") {
                    Some(serde_json::Value::String(shape_val)) => shape_val.to_owned(),
                    _ => "".to_string(),
                };
                match shape.as_str() {
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
            Self::Circle { radius } => {
                _query_parts_.push("shape=circle".to_string());
                _query_parts_.push(format!("radius={}", radius));
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantTypesAdjacentAdjacentUnionData {
    Text(String),
}

impl ArriModel for UnionVariantTypesAdjacentAdjacentUnionData {
    fn new() -> Self {
        Self::Text("".to_string())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let kind = match _val_.get("kind") {
                    Some(serde_json::Value::String(kind_val)) => kind_val.to_owned(),
                    _ => "".to_string(),
                };
                match kind.as_str() {
                    "text" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::String(data_val)) => data_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::Text(data)
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
            Self::Text(data) => {
                _json_output_.push_str("\"kind\":\"text\",\"data\":");
                _json_output_.push_str(serialize_string(data).as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping UnionVariantTypesAdjacentAdjacentUnionData.");
        "".to_string()
    }
}

impl UnionVariantTypesAdjacentAdjacentUnionData {
    pub fn kind(&self) -> &'static str {
        match &self {
            Self::Text(_) => "text",
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantTypesInternal {
    Class {
        r#for: String,
        default: String,
    },
    Default {
        class: String,
        internal_union: UnionVariantTypesInternalInternalUnionDefault,
        adjacent_union: UnionVariantTypesInternalAdjacentUnionDefault,
        external_union: UnionVariantTypesInternalExternalUnionDefault,
    },
}

impl ArriModel for UnionVariantTypesInternal {
    fn new() -> Self {
        Self::Class {
            r#for: "".to_string(),
            default: "".to_string(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let kind = match _val_.get("kind") {
                    Some(serde_json::Value::String(kind_val)) => kind_val.to_owned(),
                    _ => "".to_string(),
                };
                match kind.as_str() {
                    "class" => {
                        let r#for = match _val_.get("for") {
                            Some(serde_json::Value::String(for_val)) => for_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let default = match _val_.get("default") {
                            Some(serde_json::Value::String(default_val)) => default_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::Class { r#for, default }
                    }
                    "default" => {
                        let class = match _val_.get("class") {
                            Some(serde_json::Value::String(class_val)) => class_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let internal_union = match _val_.get("internalUnion") {
                            Some(internal_union_val) => match internal_union_val {
                                serde_json::Value::Object(_) => {
                                    UnionVariantTypesInternalInternalUnionDefault::from_json(
                                        internal_union_val.to_owned(),
                                    )
                                }
                                _ => UnionVariantTypesInternalInternalUnionDefault::new(),
                            },
                            _ => UnionVariantTypesInternalInternalUnionDefault::new(),
                        };
                        let adjacent_union = match _val_.get("adjacentUnion") {
                            Some(adjacent_union_val) => match adjacent_union_val {
                                serde_json::Value::Object(_) => {
                                    UnionVariantTypesInternalAdjacentUnionDefault::from_json(
                                        adjacent_union_val.to_owned(),
                                    )
                                }
                                _ => UnionVariantTypesInternalAdjacentUnionDefault::new(),
                            },
                            _ => UnionVariantTypesInternalAdjacentUnionDefault::new(),
                        };
                        let external_union = match _val_.get("externalUnion") {
                            Some(external_union_val) => match external_union_val {
                                serde_json::Value::Object(_) => {
                                    UnionVariantTypesInternalExternalUnionDefault::from_json(
                                        external_union_val.to_owned(),
                                    )
                                }
                                _ => UnionVariantTypesInternalExternalUnionDefault::new(),
                            },
                            _ => UnionVariantTypesInternalExternalUnionDefault::new(),
                        };
                        Self::Default {
                            class,
                            internal_union,
                            adjacent_union,
                            external_union,
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
            Self::Class { r#for, default } => {
                _json_output_.push_str("\"kind\":\"class\"");
                _json_output_.push_str(",\"for\":");
                _json_output_.push_str(serialize_string(r#for).as_str());
                _json_output_.push_str(",\"default\":");
                _json_output_.push_str(serialize_string(default).as_str());
            }
            Self::Default {
                class,
                internal_union,
                adjacent_union,
                external_union,
            } => {
                _json_output_.push_str("\"kind\":\"default\"");
                _json_output_.push_str(",\"class\":");
                _json_output_.push_str(serialize_string(class).as_str());
                _json_output_.push_str(",\"internalUnion\":");
                _json_output_.push_str(internal_union.to_json_string().as_str());
                _json_output_.push_str(",\"adjacentUnion\":");
                _json_output_.push_str(adjacent_union.to_json_string().as_str());
                _json_output_.push_str(",\"externalUnion\":");
                _json_output_.push_str(external_union.to_json_string().as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self {
            Self::Class { r#for, default } => {
                _query_parts_.push("kind=class".to_string());
                _query_parts_.push(format!("for={}", encode_query_component(r#for)));
                _query_parts_.push(format!("default={}", encode_query_component(default)));
            }
            Self::Default {
                class,
                internal_union,
                adjacent_union,
                external_union,
            } => {
                _query_parts_.push("kind=default".to_string());
                _query_parts_.push(format!("class={}", encode_query_component(class)));
                println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /UnionVariantTypes/internal/internalUnion.");
                println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /UnionVariantTypes/internal/adjacentUnion.");
                println!("[WARNING] cannot serialize nested unions to query params. Skipping field at /UnionVariantTypes/internal/externalUnion.");
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantTypesInternalInternalUnionDefault {
    Circle { radius: f64 },
}

impl ArriModel for UnionVariantTypesInternalInternalUnionDefault {
    fn new() -> Self {
        Self::Circle { radius: 0.0 }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let shape = match _val_.get("shape") {
                    Some(serde_json::Value::String(shape_val)) => shape_val.to_owned(),
                    _ => "".to_string(),
                };
                match shape.as_str() {
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
            Self::Circle { radius } => {
                _query_parts_.push("shape=circle".to_string());
                _query_parts_.push(format!("radius={}", radius));
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantTypesInternalAdjacentUnionDefault {
    Text(String),
}

impl ArriModel for UnionVariantTypesInternalAdjacentUnionDefault {
    fn new() -> Self {
        Self::Text("".to_string())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let kind = match _val_.get("kind") {
                    Some(serde_json::Value::String(kind_val)) => kind_val.to_owned(),
                    _ => "".to_string(),
                };
                match kind.as_str() {
                    "text" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::String(data_val)) => data_val.to_owned(),
                            _ => "".to_string(),
                        };
                        Self::Text(data)
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
            Self::Text(data) => {
                _json_output_.push_str("\"kind\":\"text\",\"data\":");
                _json_output_.push_str(serialize_string(data).as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping UnionVariantTypesInternalAdjacentUnionDefault.");
        "".to_string()
    }
}

impl UnionVariantTypesInternalAdjacentUnionDefault {
    pub fn kind(&self) -> &'static str {
        match &self {
            Self::Text(_) => "text",
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum UnionVariantTypesInternalExternalUnionDefault {
    Text(String),
}

impl ArriModel for UnionVariantTypesInternalExternalUnionDefault {
    fn new() -> Self {
        Self::Text("".to_string())
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                if _val_.contains_key("text") {
                    let value = match _val_.get("text") {
                        Some(serde_json::Value::String(value_val)) => value_val.to_owned(),
                        _ => "".to_string(),
                    };
                    return Self::Text(value);
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
            Self::Text(value) => {
                _json_output_.push_str("\"text\":");
                _json_output_.push_str(serialize_string(value).as_str());
            }
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping UnionVariantTypesInternalExternalUnionDefault.");
        "".to_string()
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
        _query_parts_.push(format!("message={}", encode_query_component(&self.message)));
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
        _query_parts_.push(format!(
            "statusMessage={}",
            encode_query_component(&self.status_message)
        ));
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
        _query_parts_.push(format!("message={}", encode_query_component(&self.message)));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct StreamHeartbeatDetectionTestParams {
    pub heartbeat_enabled: bool,
}

impl ArriModel for StreamHeartbeatDetectionTestParams {
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
pub struct StreamHeartbeatDetectionTestResponse {
    pub message: String,
}

impl ArriModel for StreamHeartbeatDetectionTestResponse {
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
        _query_parts_.push(format!("message={}", encode_query_component(&self.message)));
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
        _query_parts_.push(format!("id={}", encode_query_component(&self.id)));
        _query_parts_.push(format!("name={}", encode_query_component(&self.name)));
        _query_parts_.push(format!("email={}", encode_query_component(&self.email)));
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
        _query_parts_.push(format!(
            "channelId={}",
            encode_query_component(&self.channel_id)
        ));
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
                _query_parts_.push("messageType=TEXT".to_string());
                _query_parts_.push(format!("id={}", encode_query_component(id)));
                _query_parts_.push(format!("channelId={}", encode_query_component(channel_id)));
                _query_parts_.push(format!("userId={}", encode_query_component(user_id)));
                _query_parts_.push(format!(
                    "date={}",
                    encode_query_component(&serialize_date_time(date, false))
                ));
                _query_parts_.push(format!("text={}", encode_query_component(text)));
            }
            Self::Image {
                id,
                channel_id,
                user_id,
                date,
                image,
            } => {
                _query_parts_.push("messageType=IMAGE".to_string());
                _query_parts_.push(format!("id={}", encode_query_component(id)));
                _query_parts_.push(format!("channelId={}", encode_query_component(channel_id)));
                _query_parts_.push(format!("userId={}", encode_query_component(user_id)));
                _query_parts_.push(format!(
                    "date={}",
                    encode_query_component(&serialize_date_time(date, false))
                ));
                _query_parts_.push(format!("image={}", encode_query_component(image)));
            }
            Self::Url {
                id,
                channel_id,
                user_id,
                date,
                url,
            } => {
                _query_parts_.push("messageType=URL".to_string());
                _query_parts_.push(format!("id={}", encode_query_component(id)));
                _query_parts_.push(format!("channelId={}", encode_query_component(channel_id)));
                _query_parts_.push(format!("userId={}", encode_query_component(user_id)));
                _query_parts_.push(format!(
                    "date={}",
                    encode_query_component(&serialize_date_time(date, false))
                ));
                _query_parts_.push(format!("url={}", encode_query_component(url)));
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
        _query_parts_.push(format!("message={}", encode_query_component(&self.message)));
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
        _query_parts_.push(format!("userId={}", encode_query_component(&self.user_id)));
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
        _query_parts_.push(format!("id={}", encode_query_component(&self.id)));
        _query_parts_.push(format!(
            "role={}",
            encode_query_component(&&self.role.serial_value())
        ));
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /UsersWatchUserResponse/photo.");
        _query_parts_.push(format!(
            "createdAt={}",
            encode_query_component(&serialize_date_time(&self.created_at, false))
        ));
        _query_parts_.push(format!("numFollowers={}", &self.num_followers));
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /UsersWatchUserResponse/settings.");
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /UsersWatchUserResponse/recentNotifications.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /UsersWatchUserResponse/bookmarks.");
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /UsersWatchUserResponse/metadata.");
        println!("[WARNING] cannot serialize arrays to query params. Skipping field at /UsersWatchUserResponse/randomList.");
        match &self.bio {
            Some(bio_val) => {
                _query_parts_.push(format!("bio={}", encode_query_component(bio_val)));
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
        _query_parts_.push(format!("url={}", encode_query_component(&self.url)));
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
            encode_query_component(&&self.preferred_theme.serial_value())
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
                _query_parts_.push("notificationType=POST_LIKE".to_string());
                _query_parts_.push(format!("postId={}", encode_query_component(post_id)));
                _query_parts_.push(format!("userId={}", encode_query_component(user_id)));
            }
            Self::PostComment {
                post_id,
                user_id,
                comment_text,
            } => {
                _query_parts_.push("notificationType=POST_COMMENT".to_string());
                _query_parts_.push(format!("postId={}", encode_query_component(post_id)));
                _query_parts_.push(format!("userId={}", encode_query_component(user_id)));
                _query_parts_.push(format!(
                    "commentText={}",
                    encode_query_component(comment_text)
                ));
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
        _query_parts_.push(format!("postId={}", encode_query_component(&self.post_id)));
        _query_parts_.push(format!("userId={}", encode_query_component(&self.user_id)));
        _query_parts_.join("&")
    }
}
