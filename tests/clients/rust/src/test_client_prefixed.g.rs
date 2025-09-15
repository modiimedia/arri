#![allow(
    dead_code,
    unused_imports,
    unused_variables,
    unconditional_recursion,
    deprecated
)]
use arri_client::{
    arri_core::{self},
    chrono::{self},
    dispatcher::OnEventClosure,
    model::ArriClientEnum,
    serde_json::{self},
    utils::{self},
};

#[derive(Clone)]
pub struct TestClientPrefixed<TDispatcher: arri_client::dispatcher::TransportDispatcher> {
    _headers: std::sync::Arc<std::sync::RwLock<arri_core::headers::SharableHeaderMap>>,
    _dispatcher: TDispatcher,
    _content_type: arri_core::message::ContentType,
}

impl<TDispatcher: arri_client::dispatcher::TransportDispatcher>
    arri_client::ArriClientService<TDispatcher> for TestClientPrefixed<TDispatcher>
{
    fn create(config: arri_client::ArriClientConfig<TDispatcher>) -> Self {
        Self {
            _headers: std::sync::Arc::new(std::sync::RwLock::new(config.headers.clone())),
            _dispatcher: config.dispatcher.clone(),
            _content_type: config.content_type.clone(),
        }
    }
    fn update_headers(&self, headers: arri_core::headers::SharableHeaderMap) {
        let mut unwrapped_headers = self._headers.write().unwrap();
        *unwrapped_headers = headers.clone();
    }
}

impl<TDispatcher: arri_client::dispatcher::TransportDispatcher> TestClientPrefixed<TDispatcher> {
    pub async fn empty_params_get_request(
        &self,
    ) -> Result<FooDefaultPayload, arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                0,
                format!("emptyParamsGetRequest doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                None,
                None,
            ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "emptyParamsGetRequest".to_string(),
            "/rpcs/tests/empty-params-get-request".to_string(),
            Some(arri_core::message::HttpMethod::Get),
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            None::<arri_client::model::EmptyArriClientModel>,
        );
        self._dispatcher
            .dispatch_rpc::<arri_client::model::EmptyArriClientModel, FooDefaultPayload>(call)
            .await
    }
    pub async fn empty_params_post_request(
        &self,
    ) -> Result<FooDefaultPayload, arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                0,
                format!("emptyParamsPostRequest doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                None,
                None,
            ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "emptyParamsPostRequest".to_string(),
            "/rpcs/tests/empty-params-post-request".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            None::<arri_client::model::EmptyArriClientModel>,
        );
        self._dispatcher
            .dispatch_rpc::<arri_client::model::EmptyArriClientModel, FooDefaultPayload>(call)
            .await
    }
    pub async fn empty_response_get_request(
        &self,
        input: FooDefaultPayload,
    ) -> Result<(), arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                0,
                format!("emptyResponseGetRequest doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                None,
                None,
            ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "emptyResponseGetRequest".to_string(),
            "/rpcs/tests/empty-response-get-request".to_string(),
            Some(arri_core::message::HttpMethod::Get),
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            Some(input),
        );
        let result = self
            ._dispatcher
            .dispatch_rpc::<FooDefaultPayload, arri_client::model::EmptyArriClientModel>(call)
            .await;
        match result {
            Ok(_) => Ok(()),
            Err(err) => Err(err),
        }
    }
    pub async fn empty_response_post_request(
        &self,
        input: FooDefaultPayload,
    ) -> Result<(), arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                0,
                format!("emptyResponsePostRequest doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                None,
                None,
            ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "emptyResponsePostRequest".to_string(),
            "/rpcs/tests/empty-response-post-request".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            Some(input),
        );
        let result = self
            ._dispatcher
            .dispatch_rpc::<FooDefaultPayload, arri_client::model::EmptyArriClientModel>(call)
            .await;
        match result {
            Ok(_) => Ok(()),
            Err(err) => Err(err),
        }
    }
    /// If the target language supports it. Generated code should mark this procedure as deprecated.
    #[deprecated]
    pub async fn deprecated_rpc(
        &self,
        input: FooDeprecatedRpcParams,
    ) -> Result<(), arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                0,
                format!("deprecatedRpc doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                None,
                None,
            ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "deprecatedRpc".to_string(),
            "/rpcs/tests/deprecated-rpc".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            Some(input),
        );
        let result = self
            ._dispatcher
            .dispatch_rpc::<FooDeprecatedRpcParams, arri_client::model::EmptyArriClientModel>(call)
            .await;
        match result {
            Ok(_) => Ok(()),
            Err(err) => Err(err),
        }
    }
    pub async fn send_discriminator_with_empty_object(
        &self,
        input: FooDiscriminatorWithEmptyObject,
    ) -> Result<FooDiscriminatorWithEmptyObject, arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                0,
                format!("sendDiscriminatorWithEmptyObject doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                None,
                None,
            ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "sendDiscriminatorWithEmptyObject".to_string(),
            "/rpcs/tests/send-discriminator-with-empty-object".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            Some(input),
        );
        self._dispatcher
            .dispatch_rpc::<FooDiscriminatorWithEmptyObject, FooDiscriminatorWithEmptyObject>(call)
            .await
    }
    pub async fn send_error(
        &self,
        input: FooSendErrorParams,
    ) -> Result<(), arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                0,
                format!("sendError doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                None,
                None,
            ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "sendError".to_string(),
            "/rpcs/tests/send-error".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            Some(input),
        );
        let result = self
            ._dispatcher
            .dispatch_rpc::<FooSendErrorParams, arri_client::model::EmptyArriClientModel>(call)
            .await;
        match result {
            Ok(_) => Ok(()),
            Err(err) => Err(err),
        }
    }
    pub async fn send_object(
        &self,
        input: FooObjectWithEveryType,
    ) -> Result<FooObjectWithEveryType, arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                0,
                format!("sendObject doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                None,
                None,
            ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "sendObject".to_string(),
            "/rpcs/tests/send-object".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            Some(input),
        );
        self._dispatcher
            .dispatch_rpc::<FooObjectWithEveryType, FooObjectWithEveryType>(call)
            .await
    }
    pub async fn send_object_with_nullable_fields(
        &self,
        input: FooObjectWithEveryNullableType,
    ) -> Result<FooObjectWithEveryNullableType, arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                0,
                format!("sendObjectWithNullableFields doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                None,
                None,
            ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "sendObjectWithNullableFields".to_string(),
            "/rpcs/tests/send-object-with-nullable-fields".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            Some(input),
        );
        self._dispatcher
            .dispatch_rpc::<FooObjectWithEveryNullableType, FooObjectWithEveryNullableType>(call)
            .await
    }
    pub async fn send_object_with_pascal_case_keys(
        &self,
        input: FooObjectWithPascalCaseKeys,
    ) -> Result<FooObjectWithPascalCaseKeys, arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                0,
                format!("sendObjectWithPascalCaseKeys doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                None,
                None,
            ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "sendObjectWithPascalCaseKeys".to_string(),
            "/rpcs/tests/send-object-with-pascal-case-keys".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            Some(input),
        );
        self._dispatcher
            .dispatch_rpc::<FooObjectWithPascalCaseKeys, FooObjectWithPascalCaseKeys>(call)
            .await
    }
    pub async fn send_object_with_snake_case_keys(
        &self,
        input: FooObjectWithSnakeCaseKeys,
    ) -> Result<FooObjectWithSnakeCaseKeys, arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                0,
                format!("sendObjectWithSnakeCaseKeys doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                None,
                None,
            ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "sendObjectWithSnakeCaseKeys".to_string(),
            "/rpcs/tests/send-object-with-snake-case-keys".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            Some(input),
        );
        self._dispatcher
            .dispatch_rpc::<FooObjectWithSnakeCaseKeys, FooObjectWithSnakeCaseKeys>(call)
            .await
    }
    pub async fn send_partial_object(
        &self,
        input: FooObjectWithEveryOptionalType,
    ) -> Result<FooObjectWithEveryOptionalType, arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                0,
                format!("sendPartialObject doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                None,
                None,
            ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "sendPartialObject".to_string(),
            "/rpcs/tests/send-partial-object".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            Some(input),
        );
        self._dispatcher
            .dispatch_rpc::<FooObjectWithEveryOptionalType, FooObjectWithEveryOptionalType>(call)
            .await
    }
    pub async fn send_recursive_object(
        &self,
        input: FooRecursiveObject,
    ) -> Result<FooRecursiveObject, arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                0,
                format!("sendRecursiveObject doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                None,
                None,
            ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "sendRecursiveObject".to_string(),
            "/rpcs/tests/send-recursive-object".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            Some(input),
        );
        self._dispatcher
            .dispatch_rpc::<FooRecursiveObject, FooRecursiveObject>(call)
            .await
    }
    pub async fn send_recursive_union(
        &self,
        input: FooRecursiveUnion,
    ) -> Result<FooRecursiveUnion, arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                0,
                format!("sendRecursiveUnion doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                None,
                None,
            ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "sendRecursiveUnion".to_string(),
            "/rpcs/tests/send-recursive-union".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            Some(input),
        );
        self._dispatcher
            .dispatch_rpc::<FooRecursiveUnion, FooRecursiveUnion>(call)
            .await
    }
    pub async fn stream_auto_reconnect(
        &self,
        input: FooAutoReconnectParams,
        on_event: &mut OnEventClosure<'_, FooAutoReconnectResponse>,
        controller: Option<&mut arri_client::dispatcher::EventStreamController>,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) -> Result<(), arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                    0,
                    format!("streamAutoReconnect doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                    None,
                    None,
                ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "streamAutoReconnect".to_string(),
            "/rpcs/tests/stream-auto-reconnect".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            Some(input),
        );
        self._dispatcher
            .dispatch_output_stream_rpc::<FooAutoReconnectParams, FooAutoReconnectResponse>(
                call, on_event, controller, None, None,
            )
            .await;
        Ok(())
    }
    /// This route will always return an error. The client should automatically retry with exponential backoff.
    pub async fn stream_connection_error_test(
        &self,
        input: FooStreamConnectionErrorTestParams,
        on_event: &mut OnEventClosure<'_, FooStreamConnectionErrorTestResponse>,
        controller: Option<&mut arri_client::dispatcher::EventStreamController>,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) -> Result<(), arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                    0,
                    format!("streamConnectionErrorTest doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                    None,
                    None,
                ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "streamConnectionErrorTest".to_string(),
            "/rpcs/tests/stream-connection-error-test".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            Some(input),
        );
        self._dispatcher
                .dispatch_output_stream_rpc::<FooStreamConnectionErrorTestParams, FooStreamConnectionErrorTestResponse>(call, on_event, controller, None, None)
                .await;
        Ok(())
    }
    /// Test to ensure that the client can handle receiving streams of large objects. When objects are large messages will sometimes get sent in chunks. Meaning you have to handle receiving a partial message
    pub async fn stream_large_objects(
        &self,

        on_event: &mut OnEventClosure<'_, FooStreamLargeObjectsResponse>,
        controller: Option<&mut arri_client::dispatcher::EventStreamController>,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) -> Result<(), arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                    0,
                    format!("streamLargeObjects doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                    None,
                    None,
                ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "streamLargeObjects".to_string(),
            "/rpcs/tests/stream-large-objects".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            None::<arri_client::model::EmptyArriClientModel>,
        );
        self._dispatcher
                .dispatch_output_stream_rpc::<arri_client::model::EmptyArriClientModel, FooStreamLargeObjectsResponse>(call, on_event, controller, None, None)
                .await;
        Ok(())
    }
    pub async fn stream_messages(
        &self,
        input: FooChatMessageParams,
        on_event: &mut OnEventClosure<'_, FooChatMessage>,
        controller: Option<&mut arri_client::dispatcher::EventStreamController>,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) -> Result<(), arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                    0,
                    format!("streamMessages doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                    None,
                    None,
                ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "streamMessages".to_string(),
            "/rpcs/tests/stream-messages".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            Some(input),
        );
        self._dispatcher
            .dispatch_output_stream_rpc::<FooChatMessageParams, FooChatMessage>(
                call, on_event, controller, None, None,
            )
            .await;
        Ok(())
    }
    pub async fn stream_retry_with_new_credentials(
        &self,

        on_event: &mut OnEventClosure<'_, FooTestsStreamRetryWithNewCredentialsResponse>,
        controller: Option<&mut arri_client::dispatcher::EventStreamController>,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) -> Result<(), arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                    0,
                    format!("streamRetryWithNewCredentials doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                    None,
                    None,
                ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "streamRetryWithNewCredentials".to_string(),
            "/rpcs/tests/stream-retry-with-new-credentials".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            None::<arri_client::model::EmptyArriClientModel>,
        );
        self._dispatcher
                .dispatch_output_stream_rpc::<arri_client::model::EmptyArriClientModel, FooTestsStreamRetryWithNewCredentialsResponse>(call, on_event, controller, None, None)
                .await;
        Ok(())
    }
    /// When the client receives the 'done' event, it should close the connection and NOT reconnect
    pub async fn stream_ten_events_then_end(
        &self,

        on_event: &mut OnEventClosure<'_, FooChatMessage>,
        controller: Option<&mut arri_client::dispatcher::EventStreamController>,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) -> Result<(), arri_core::errors::ArriError> {
        let available_transports = vec!["http", "ws"];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                    0,
                    format!("streamTenEventsThenEnd doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                    None,
                    None,
                ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "streamTenEventsThenEnd".to_string(),
            "/rpcs/tests/stream-ten-events-then-end".to_string(),
            None,
            Some("10".to_string()),
            Some(self._content_type.clone()),
            &self._headers,
            None::<arri_client::model::EmptyArriClientModel>,
        );
        self._dispatcher
            .dispatch_output_stream_rpc::<arri_client::model::EmptyArriClientModel, FooChatMessage>(
                call, on_event, controller, None, None,
            )
            .await;
        Ok(())
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct FooManuallyAddedModel {
    pub hello: String,
}

impl arri_client::model::ArriClientModel for FooManuallyAddedModel {
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
        _json_output_.push_str(utils::serialize_string(&self.hello).as_str());
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
pub struct FooDefaultPayload {
    pub message: String,
}

impl arri_client::model::ArriClientModel for FooDefaultPayload {
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
        _json_output_.push_str(utils::serialize_string(&self.message).as_str());
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
pub struct FooDeprecatedRpcParams {
    #[deprecated]
    pub deprecated_field: String,
}

impl arri_client::model::ArriClientModel for FooDeprecatedRpcParams {
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
        _json_output_.push_str(utils::serialize_string(&self.deprecated_field).as_str());
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
pub enum FooDiscriminatorWithEmptyObject {
    Empty {},
    NotEmpty { foo: String, bar: f64, baz: bool },
}

impl arri_client::model::ArriClientModel for FooDiscriminatorWithEmptyObject {
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
                _json_output_.push_str(utils::serialize_string(foo).as_str());
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
pub struct FooSendErrorParams {
    pub code: u16,
    pub message: String,
}

impl arri_client::model::ArriClientModel for FooSendErrorParams {
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
        _json_output_.push_str(utils::serialize_string(&self.message).as_str());
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
pub struct FooObjectWithEveryType {
    pub any: serde_json::Value,
    pub boolean: bool,
    pub string: String,
    pub timestamp: chrono::DateTime<chrono::FixedOffset>,
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
    pub enumerator: FooObjectWithEveryTypeEnumerator,
    pub array: Vec<bool>,
    pub object: FooObjectWithEveryTypeObject,
    pub record: std::collections::BTreeMap<String, u64>,
    pub discriminator: FooObjectWithEveryTypeDiscriminator,
    pub nested_object: FooObjectWithEveryTypeNestedObject,
    pub nested_array: Vec<Vec<FooObjectWithEveryTypeNestedArrayElementElement>>,
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryType {
    fn new() -> Self {
        Self {
            any: serde_json::Value::Null,
            boolean: false,
            string: "".to_string(),
            timestamp: chrono::DateTime::default(),
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
            enumerator: FooObjectWithEveryTypeEnumerator::default(),
            array: Vec::new(),
            object: FooObjectWithEveryTypeObject::new(),
            record: std::collections::BTreeMap::new(),
            discriminator: FooObjectWithEveryTypeDiscriminator::new(),
            nested_object: FooObjectWithEveryTypeNestedObject::new(),
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
                        chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(chrono::DateTime::default())
                    }
                    _ => chrono::DateTime::default(),
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
                        FooObjectWithEveryTypeEnumerator::from_string(enumerator_val.to_owned())
                    }
                    _ => FooObjectWithEveryTypeEnumerator::default(),
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
                    Some(object_val) => {
                        FooObjectWithEveryTypeObject::from_json(object_val.to_owned())
                    }
                    _ => FooObjectWithEveryTypeObject::new(),
                };
                let record = match _val_.get("record") {
                    Some(serde_json::Value::Object(record_val)) => {
                        let mut record_val_result: std::collections::BTreeMap<String, u64> =
                            std::collections::BTreeMap::new();
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
                    _ => std::collections::BTreeMap::new(),
                };
                let discriminator = match _val_.get("discriminator") {
                    Some(discriminator_val) => match discriminator_val {
                        serde_json::Value::Object(_) => {
                            FooObjectWithEveryTypeDiscriminator::from_json(
                                discriminator_val.to_owned(),
                            )
                        }
                        _ => FooObjectWithEveryTypeDiscriminator::new(),
                    },
                    _ => FooObjectWithEveryTypeDiscriminator::new(),
                };
                let nested_object = match _val_.get("nestedObject") {
                    Some(nested_object_val) => {
                        FooObjectWithEveryTypeNestedObject::from_json(nested_object_val.to_owned())
                    }
                    _ => FooObjectWithEveryTypeNestedObject::new(),
                };
                let nested_array = match _val_.get("nestedArray") {
                    Some(serde_json::Value::Array(nested_array_val)) => {
                        let mut nested_array_val_result: Vec<
                            Vec<FooObjectWithEveryTypeNestedArrayElementElement>,
                        > = Vec::new();
                        for nested_array_val_element in nested_array_val {
                            nested_array_val_result.push(match Some(nested_array_val_element) {
                Some(serde_json::Value::Array(nested_array_val_element_val)) => {
                    let mut nested_array_val_element_val_result: Vec<FooObjectWithEveryTypeNestedArrayElementElement> = Vec::new();
                    for nested_array_val_element_val_element in nested_array_val_element_val {
                        nested_array_val_element_val_result.push(match Some(nested_array_val_element_val_element) {
                Some(nested_array_val_element_val_element_val) => FooObjectWithEveryTypeNestedArrayElementElement::from_json(nested_array_val_element_val_element_val.to_owned()),
                _ => FooObjectWithEveryTypeNestedArrayElementElement::new(),
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
        _json_output_.push_str(utils::serialize_string(&self.string).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(utils::serialize_date_time(&self.timestamp, true).as_str());
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
            _json_output_.push_str(format!("{}:", utils::serialize_string(_key_)).as_str());
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
            utils::serialize_date_time(&self.timestamp, false)
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
pub enum FooObjectWithEveryTypeEnumerator {
    A,
    B,
    C,
}

impl arri_client::model::ArriClientEnum for FooObjectWithEveryTypeEnumerator {
    fn default() -> Self {
        FooObjectWithEveryTypeEnumerator::A
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
            FooObjectWithEveryTypeEnumerator::A => "A".to_string(),
            FooObjectWithEveryTypeEnumerator::B => "B".to_string(),
            FooObjectWithEveryTypeEnumerator::C => "C".to_string(),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct FooObjectWithEveryTypeObject {
    pub string: String,
    pub boolean: bool,
    pub timestamp: chrono::DateTime<chrono::FixedOffset>,
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryTypeObject {
    fn new() -> Self {
        Self {
            string: "".to_string(),
            boolean: false,
            timestamp: chrono::DateTime::default(),
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
                        chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(chrono::DateTime::default())
                    }
                    _ => chrono::DateTime::default(),
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
        _json_output_.push_str(utils::serialize_string(&self.string).as_str());
        _json_output_.push_str(",\"boolean\":");
        _json_output_.push_str(&self.boolean.to_string().as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(utils::serialize_date_time(&self.timestamp, true).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("string={}", &self.string));
        _query_parts_.push(format!("boolean={}", &self.boolean));
        _query_parts_.push(format!(
            "timestamp={}",
            utils::serialize_date_time(&self.timestamp, false)
        ));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum FooObjectWithEveryTypeDiscriminator {
    A { title: String },
    B { title: String, description: String },
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryTypeDiscriminator {
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
                _json_output_.push_str(utils::serialize_string(title).as_str());
            }
            Self::B { title, description } => {
                _json_output_.push_str("\"type\":\"B\"");
                _json_output_.push_str(",\"title\":");
                _json_output_.push_str(utils::serialize_string(title).as_str());
                _json_output_.push_str(",\"description\":");
                _json_output_.push_str(utils::serialize_string(description).as_str());
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
pub struct FooObjectWithEveryTypeNestedObject {
    pub id: String,
    pub timestamp: chrono::DateTime<chrono::FixedOffset>,
    pub data: FooObjectWithEveryTypeNestedObjectData,
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryTypeNestedObject {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: chrono::DateTime::default(),
            data: FooObjectWithEveryTypeNestedObjectData::new(),
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
                        chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(chrono::DateTime::default())
                    }
                    _ => chrono::DateTime::default(),
                };
                let data = match _val_.get("data") {
                    Some(data_val) => {
                        FooObjectWithEveryTypeNestedObjectData::from_json(data_val.to_owned())
                    }
                    _ => FooObjectWithEveryTypeNestedObjectData::new(),
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
        _json_output_.push_str(utils::serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(utils::serialize_date_time(&self.timestamp, true).as_str());
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
            utils::serialize_date_time(&self.timestamp, false)
        ));
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryTypeNestedObject/data.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct FooObjectWithEveryTypeNestedObjectData {
    pub id: String,
    pub timestamp: chrono::DateTime<chrono::FixedOffset>,
    pub data: FooObjectWithEveryTypeNestedObjectDataData,
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryTypeNestedObjectData {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: chrono::DateTime::default(),
            data: FooObjectWithEveryTypeNestedObjectDataData::new(),
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
                        chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(chrono::DateTime::default())
                    }
                    _ => chrono::DateTime::default(),
                };
                let data = match _val_.get("data") {
                    Some(data_val) => {
                        FooObjectWithEveryTypeNestedObjectDataData::from_json(data_val.to_owned())
                    }
                    _ => FooObjectWithEveryTypeNestedObjectDataData::new(),
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
        _json_output_.push_str(utils::serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(utils::serialize_date_time(&self.timestamp, true).as_str());
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
            utils::serialize_date_time(&self.timestamp, false)
        ));
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryTypeNestedObjectData/data.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct FooObjectWithEveryTypeNestedObjectDataData {
    pub id: String,
    pub timestamp: chrono::DateTime<chrono::FixedOffset>,
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryTypeNestedObjectDataData {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: chrono::DateTime::default(),
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
                        chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(chrono::DateTime::default())
                    }
                    _ => chrono::DateTime::default(),
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
        _json_output_.push_str(utils::serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(utils::serialize_date_time(&self.timestamp, true).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!(
            "timestamp={}",
            utils::serialize_date_time(&self.timestamp, false)
        ));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct FooObjectWithEveryTypeNestedArrayElementElement {
    pub id: String,
    pub timestamp: chrono::DateTime<chrono::FixedOffset>,
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryTypeNestedArrayElementElement {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: chrono::DateTime::default(),
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
                        chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(chrono::DateTime::default())
                    }
                    _ => chrono::DateTime::default(),
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
        _json_output_.push_str(utils::serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(utils::serialize_date_time(&self.timestamp, true).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!(
            "timestamp={}",
            utils::serialize_date_time(&self.timestamp, false)
        ));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct FooObjectWithEveryNullableType {
    pub any: serde_json::Value,
    pub boolean: Option<bool>,
    pub string: Option<String>,
    pub timestamp: Option<chrono::DateTime<chrono::FixedOffset>>,
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
    pub enumerator: Option<FooObjectWithEveryNullableTypeEnumerator>,
    pub array: Option<Vec<Option<bool>>>,
    pub object: Option<FooObjectWithEveryNullableTypeObject>,
    pub record: Option<std::collections::BTreeMap<String, Option<u64>>>,
    pub discriminator: Option<FooObjectWithEveryNullableTypeDiscriminator>,
    pub nested_object: Option<FooObjectWithEveryNullableTypeNestedObject>,
    pub nested_array:
        Option<Vec<Option<Vec<Option<FooObjectWithEveryNullableTypeNestedArrayElementElement>>>>>,
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryNullableType {
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
                        match chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(
                            timestamp_val,
                        ) {
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
                        Some(FooObjectWithEveryNullableTypeEnumerator::from_string(
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
                            FooObjectWithEveryNullableTypeObject::from_json(object_val.to_owned()),
                        ),
                        _ => None,
                    },
                    _ => None,
                };
                let record = match _val_.get("record") {
                    Some(serde_json::Value::Object(record_val)) => {
                        let mut record_val_result: std::collections::BTreeMap<String, Option<u64>> =
                            std::collections::BTreeMap::new();
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
                            Some(FooObjectWithEveryNullableTypeDiscriminator::from_json(
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
                            Some(FooObjectWithEveryNullableTypeNestedObject::from_json(
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
                                Vec<
                                    Option<FooObjectWithEveryNullableTypeNestedArrayElementElement>,
                                >,
                            >,
                        > = Vec::new();
                        for nested_array_val_element in nested_array_val {
                            nested_array_val_result.push(match Some(nested_array_val_element) {
                    Some(serde_json::Value::Array(nested_array_val_element_val)) => {
                        let mut nested_array_val_element_val_result: Vec<Option<FooObjectWithEveryNullableTypeNestedArrayElementElement>> = Vec::new();
                        for nested_array_val_element_val_element in nested_array_val_element_val {
                            nested_array_val_element_val_result.push(match Some(nested_array_val_element_val_element) {
                    Some(nested_array_val_element_val_element_val) => match nested_array_val_element_val_element_val {
                        serde_json::Value::Object(_) => {
                            Some(FooObjectWithEveryNullableTypeNestedArrayElementElement::from_json(nested_array_val_element_val_element_val.to_owned()))
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
                _json_output_.push_str(utils::serialize_string(string_val).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"timestamp\":");
        match &self.timestamp {
            Some(timestamp_val) => {
                _json_output_.push_str(utils::serialize_date_time(timestamp_val, true).as_str());
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
                    _json_output_.push_str(format!("{}:", utils::serialize_string(_key_)).as_str());
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
                    utils::serialize_date_time(timestamp_val, false)
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
pub enum FooObjectWithEveryNullableTypeEnumerator {
    A,
    B,
    C,
}

impl arri_client::model::ArriClientEnum for FooObjectWithEveryNullableTypeEnumerator {
    fn default() -> Self {
        FooObjectWithEveryNullableTypeEnumerator::A
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
            FooObjectWithEveryNullableTypeEnumerator::A => "A".to_string(),
            FooObjectWithEveryNullableTypeEnumerator::B => "B".to_string(),
            FooObjectWithEveryNullableTypeEnumerator::C => "C".to_string(),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct FooObjectWithEveryNullableTypeObject {
    pub string: Option<String>,
    pub boolean: Option<bool>,
    pub timestamp: Option<chrono::DateTime<chrono::FixedOffset>>,
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryNullableTypeObject {
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
                        match chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(
                            timestamp_val,
                        ) {
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
                _json_output_.push_str(utils::serialize_string(string_val).as_str());
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
                _json_output_.push_str(utils::serialize_date_time(timestamp_val, true).as_str());
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
                    utils::serialize_date_time(timestamp_val, false)
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
pub enum FooObjectWithEveryNullableTypeDiscriminator {
    A {
        title: Option<String>,
    },
    B {
        title: Option<String>,
        description: Option<String>,
    },
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryNullableTypeDiscriminator {
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
                        _json_output_.push_str(utils::serialize_string(title_val).as_str());
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
                        _json_output_.push_str(utils::serialize_string(title_val).as_str());
                    }
                    _ => {
                        _json_output_.push_str("null");
                    }
                };
                _json_output_.push_str(",\"description\":");
                match description {
                    Some(description_val) => {
                        _json_output_.push_str(utils::serialize_string(description_val).as_str());
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
pub struct FooObjectWithEveryNullableTypeNestedObject {
    pub id: Option<String>,
    pub timestamp: Option<chrono::DateTime<chrono::FixedOffset>>,
    pub data: Option<FooObjectWithEveryNullableTypeNestedObjectData>,
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryNullableTypeNestedObject {
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
                        match chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(
                            timestamp_val,
                        ) {
                            Ok(timestamp_val_result) => Some(timestamp_val_result),
                            Err(_) => None,
                        }
                    }
                    _ => None,
                };
                let data = match _val_.get("data") {
                    Some(data_val) => match data_val {
                        serde_json::Value::Object(_) => {
                            Some(FooObjectWithEveryNullableTypeNestedObjectData::from_json(
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
                _json_output_.push_str(utils::serialize_string(id_val).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"timestamp\":");
        match &self.timestamp {
            Some(timestamp_val) => {
                _json_output_.push_str(utils::serialize_date_time(timestamp_val, true).as_str());
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
                    utils::serialize_date_time(timestamp_val, false)
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
pub struct FooObjectWithEveryNullableTypeNestedObjectData {
    pub id: Option<String>,
    pub timestamp: Option<chrono::DateTime<chrono::FixedOffset>>,
    pub data: Option<FooObjectWithEveryNullableTypeNestedObjectDataData>,
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryNullableTypeNestedObjectData {
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
                        match chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(
                            timestamp_val,
                        ) {
                            Ok(timestamp_val_result) => Some(timestamp_val_result),
                            Err(_) => None,
                        }
                    }
                    _ => None,
                };
                let data = match _val_.get("data") {
                    Some(data_val) => match data_val {
                        serde_json::Value::Object(_) => Some(
                            FooObjectWithEveryNullableTypeNestedObjectDataData::from_json(
                                data_val.to_owned(),
                            ),
                        ),
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
                _json_output_.push_str(utils::serialize_string(id_val).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"timestamp\":");
        match &self.timestamp {
            Some(timestamp_val) => {
                _json_output_.push_str(utils::serialize_date_time(timestamp_val, true).as_str());
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
                    utils::serialize_date_time(timestamp_val, false)
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
pub struct FooObjectWithEveryNullableTypeNestedObjectDataData {
    pub id: Option<String>,
    pub timestamp: Option<chrono::DateTime<chrono::FixedOffset>>,
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryNullableTypeNestedObjectDataData {
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
                        match chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(
                            timestamp_val,
                        ) {
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
                _json_output_.push_str(utils::serialize_string(id_val).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"timestamp\":");
        match &self.timestamp {
            Some(timestamp_val) => {
                _json_output_.push_str(utils::serialize_date_time(timestamp_val, true).as_str());
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
                    utils::serialize_date_time(timestamp_val, false)
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
pub struct FooObjectWithEveryNullableTypeNestedArrayElementElement {
    pub id: Option<String>,
    pub timestamp: Option<chrono::DateTime<chrono::FixedOffset>>,
}

impl arri_client::model::ArriClientModel
    for FooObjectWithEveryNullableTypeNestedArrayElementElement
{
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
                        match chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(
                            timestamp_val,
                        ) {
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
                _json_output_.push_str(utils::serialize_string(id_val).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        _json_output_.push_str(",\"timestamp\":");
        match &self.timestamp {
            Some(timestamp_val) => {
                _json_output_.push_str(utils::serialize_date_time(timestamp_val, true).as_str());
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
                    utils::serialize_date_time(timestamp_val, false)
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
pub struct FooObjectWithPascalCaseKeys {
    pub created_at: chrono::DateTime<chrono::FixedOffset>,
    pub display_name: String,
    pub phone_number: Option<String>,
    pub email_address: Option<String>,
    pub is_admin: Option<bool>,
}

impl arri_client::model::ArriClientModel for FooObjectWithPascalCaseKeys {
    fn new() -> Self {
        Self {
            created_at: chrono::DateTime::default(),
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
                        chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(created_at_val)
                            .unwrap_or(chrono::DateTime::default())
                    }
                    _ => chrono::DateTime::default(),
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
        _json_output_.push_str(utils::serialize_date_time(&self.created_at, true).as_str());
        _json_output_.push_str(",\"DisplayName\":");
        _json_output_.push_str(utils::serialize_string(&self.display_name).as_str());
        _json_output_.push_str(",\"PhoneNumber\":");
        match &self.phone_number {
            Some(phone_number_val) => {
                _json_output_.push_str(utils::serialize_string(phone_number_val).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        match &self.email_address {
            Some(email_address_val) => {
                _json_output_.push_str(",\"EmailAddress\":");
                _json_output_.push_str(utils::serialize_string(email_address_val).as_str())
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
            utils::serialize_date_time(&self.created_at, false)
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
pub struct FooObjectWithSnakeCaseKeys {
    pub created_at: chrono::DateTime<chrono::FixedOffset>,
    pub display_name: String,
    pub phone_number: Option<String>,
    pub email_address: Option<String>,
    pub is_admin: Option<bool>,
}

impl arri_client::model::ArriClientModel for FooObjectWithSnakeCaseKeys {
    fn new() -> Self {
        Self {
            created_at: chrono::DateTime::default(),
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
                        chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(created_at_val)
                            .unwrap_or(chrono::DateTime::default())
                    }
                    _ => chrono::DateTime::default(),
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
        _json_output_.push_str(utils::serialize_date_time(&self.created_at, true).as_str());
        _json_output_.push_str(",\"display_name\":");
        _json_output_.push_str(utils::serialize_string(&self.display_name).as_str());
        _json_output_.push_str(",\"phone_number\":");
        match &self.phone_number {
            Some(phone_number_val) => {
                _json_output_.push_str(utils::serialize_string(phone_number_val).as_str());
            }
            _ => {
                _json_output_.push_str("null");
            }
        };
        match &self.email_address {
            Some(email_address_val) => {
                _json_output_.push_str(",\"email_address\":");
                _json_output_.push_str(utils::serialize_string(email_address_val).as_str())
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
            utils::serialize_date_time(&self.created_at, false)
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
pub struct FooObjectWithEveryOptionalType {
    pub any: Option<serde_json::Value>,
    pub boolean: Option<bool>,
    pub string: Option<String>,
    pub timestamp: Option<chrono::DateTime<chrono::FixedOffset>>,
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
    pub enumerator: Option<FooObjectWithEveryOptionalTypeEnumerator>,
    pub array: Option<Vec<bool>>,
    pub object: Option<FooObjectWithEveryOptionalTypeObject>,
    pub record: Option<std::collections::BTreeMap<String, u64>>,
    pub discriminator: Option<FooObjectWithEveryOptionalTypeDiscriminator>,
    pub nested_object: Option<FooObjectWithEveryOptionalTypeNestedObject>,
    pub nested_array: Option<Vec<Vec<FooObjectWithEveryOptionalTypeNestedArrayElementElement>>>,
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryOptionalType {
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
                        match chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(
                            timestamp_val,
                        ) {
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
                        Some(FooObjectWithEveryOptionalTypeEnumerator::from_string(
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
                            FooObjectWithEveryOptionalTypeObject::from_json(object_val.to_owned()),
                        ),
                        _ => None,
                    },
                    _ => None,
                };
                let record = match _val_.get("record") {
                    Some(serde_json::Value::Object(record_val)) => {
                        let mut record_val_result: std::collections::BTreeMap<String, u64> =
                            std::collections::BTreeMap::new();
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
                            Some(FooObjectWithEveryOptionalTypeDiscriminator::from_json(
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
                            Some(FooObjectWithEveryOptionalTypeNestedObject::from_json(
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
                            Vec<FooObjectWithEveryOptionalTypeNestedArrayElementElement>,
                        > = Vec::new();
                        for nested_array_val_element in nested_array_val {
                            nested_array_val_result.push(match Some(nested_array_val_element) {
                Some(serde_json::Value::Array(nested_array_val_element_val)) => {
                    let mut nested_array_val_element_val_result: Vec<FooObjectWithEveryOptionalTypeNestedArrayElementElement> = Vec::new();
                    for nested_array_val_element_val_element in nested_array_val_element_val {
                        nested_array_val_element_val_result.push(match Some(nested_array_val_element_val_element) {
                Some(nested_array_val_element_val_element_val) => FooObjectWithEveryOptionalTypeNestedArrayElementElement::from_json(nested_array_val_element_val_element_val.to_owned()),
                _ => FooObjectWithEveryOptionalTypeNestedArrayElementElement::new(),
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
                _json_output_.push_str(utils::serialize_string(string_val).as_str());
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
                _json_output_.push_str(utils::serialize_date_time(timestamp_val, true).as_str());
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
                    _json_output_.push_str(format!("{}:", utils::serialize_string(_key_)).as_str());
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
                    utils::serialize_date_time(timestamp_val, false)
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
pub enum FooObjectWithEveryOptionalTypeEnumerator {
    A,
    B,
    C,
}

impl arri_client::model::ArriClientEnum for FooObjectWithEveryOptionalTypeEnumerator {
    fn default() -> Self {
        FooObjectWithEveryOptionalTypeEnumerator::A
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
            FooObjectWithEveryOptionalTypeEnumerator::A => "A".to_string(),
            FooObjectWithEveryOptionalTypeEnumerator::B => "B".to_string(),
            FooObjectWithEveryOptionalTypeEnumerator::C => "C".to_string(),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct FooObjectWithEveryOptionalTypeObject {
    pub string: String,
    pub boolean: bool,
    pub timestamp: chrono::DateTime<chrono::FixedOffset>,
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryOptionalTypeObject {
    fn new() -> Self {
        Self {
            string: "".to_string(),
            boolean: false,
            timestamp: chrono::DateTime::default(),
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
                        chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(chrono::DateTime::default())
                    }
                    _ => chrono::DateTime::default(),
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
        _json_output_.push_str(utils::serialize_string(&self.string).as_str());
        _json_output_.push_str(",\"boolean\":");
        _json_output_.push_str(&self.boolean.to_string().as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(utils::serialize_date_time(&self.timestamp, true).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("string={}", &self.string));
        _query_parts_.push(format!("boolean={}", &self.boolean));
        _query_parts_.push(format!(
            "timestamp={}",
            utils::serialize_date_time(&self.timestamp, false)
        ));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum FooObjectWithEveryOptionalTypeDiscriminator {
    A { title: String },
    B { title: String, description: String },
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryOptionalTypeDiscriminator {
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
                _json_output_.push_str(utils::serialize_string(title).as_str());
            }
            Self::B { title, description } => {
                _json_output_.push_str("\"type\":\"B\"");
                _json_output_.push_str(",\"title\":");
                _json_output_.push_str(utils::serialize_string(title).as_str());
                _json_output_.push_str(",\"description\":");
                _json_output_.push_str(utils::serialize_string(description).as_str());
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
pub struct FooObjectWithEveryOptionalTypeNestedObject {
    pub id: String,
    pub timestamp: chrono::DateTime<chrono::FixedOffset>,
    pub data: FooObjectWithEveryOptionalTypeNestedObjectData,
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryOptionalTypeNestedObject {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: chrono::DateTime::default(),
            data: FooObjectWithEveryOptionalTypeNestedObjectData::new(),
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
                        chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(chrono::DateTime::default())
                    }
                    _ => chrono::DateTime::default(),
                };
                let data = match _val_.get("data") {
                    Some(data_val) => FooObjectWithEveryOptionalTypeNestedObjectData::from_json(
                        data_val.to_owned(),
                    ),
                    _ => FooObjectWithEveryOptionalTypeNestedObjectData::new(),
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
        _json_output_.push_str(utils::serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(utils::serialize_date_time(&self.timestamp, true).as_str());
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
            utils::serialize_date_time(&self.timestamp, false)
        ));
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryOptionalTypeNestedObject/data.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct FooObjectWithEveryOptionalTypeNestedObjectData {
    pub id: String,
    pub timestamp: chrono::DateTime<chrono::FixedOffset>,
    pub data: FooObjectWithEveryOptionalTypeNestedObjectDataData,
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryOptionalTypeNestedObjectData {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: chrono::DateTime::default(),
            data: FooObjectWithEveryOptionalTypeNestedObjectDataData::new(),
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
                        chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(chrono::DateTime::default())
                    }
                    _ => chrono::DateTime::default(),
                };
                let data = match _val_.get("data") {
                    Some(data_val) => {
                        FooObjectWithEveryOptionalTypeNestedObjectDataData::from_json(
                            data_val.to_owned(),
                        )
                    }
                    _ => FooObjectWithEveryOptionalTypeNestedObjectDataData::new(),
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
        _json_output_.push_str(utils::serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(utils::serialize_date_time(&self.timestamp, true).as_str());
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
            utils::serialize_date_time(&self.timestamp, false)
        ));
        println!("[WARNING] cannot serialize nested objects to query params. Skipping field at /ObjectWithEveryOptionalTypeNestedObjectData/data.");
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct FooObjectWithEveryOptionalTypeNestedObjectDataData {
    pub id: String,
    pub timestamp: chrono::DateTime<chrono::FixedOffset>,
}

impl arri_client::model::ArriClientModel for FooObjectWithEveryOptionalTypeNestedObjectDataData {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: chrono::DateTime::default(),
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
                        chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(chrono::DateTime::default())
                    }
                    _ => chrono::DateTime::default(),
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
        _json_output_.push_str(utils::serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(utils::serialize_date_time(&self.timestamp, true).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!(
            "timestamp={}",
            utils::serialize_date_time(&self.timestamp, false)
        ));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct FooObjectWithEveryOptionalTypeNestedArrayElementElement {
    pub id: String,
    pub timestamp: chrono::DateTime<chrono::FixedOffset>,
}

impl arri_client::model::ArriClientModel
    for FooObjectWithEveryOptionalTypeNestedArrayElementElement
{
    fn new() -> Self {
        Self {
            id: "".to_string(),
            timestamp: chrono::DateTime::default(),
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
                        chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(timestamp_val)
                            .unwrap_or(chrono::DateTime::default())
                    }
                    _ => chrono::DateTime::default(),
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
        _json_output_.push_str(utils::serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"timestamp\":");
        _json_output_.push_str(utils::serialize_date_time(&self.timestamp, true).as_str());
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        _query_parts_.push(format!("id={}", &self.id));
        _query_parts_.push(format!(
            "timestamp={}",
            utils::serialize_date_time(&self.timestamp, false)
        ));
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct FooRecursiveObject {
    pub left: Option<Box<FooRecursiveObject>>,
    pub right: Option<Box<FooRecursiveObject>>,
    pub value: String,
}

impl arri_client::model::ArriClientModel for FooRecursiveObject {
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
                            Some(Box::new(FooRecursiveObject::from_json(left_val.to_owned())))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let right = match _val_.get("right") {
                    Some(right_val) => match right_val {
                        serde_json::Value::Object(_) => Some(Box::new(
                            FooRecursiveObject::from_json(right_val.to_owned()),
                        )),
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
        _json_output_.push_str(utils::serialize_string(&self.value).as_str());
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
pub enum FooRecursiveUnion {
    /// Child node
    Child { data: Box<FooRecursiveUnion> },
    /// List of children node
    Children { data: Vec<Box<FooRecursiveUnion>> },
    /// Text node
    Text { data: String },
    /// Shape node
    Shape { data: FooRecursiveUnionDataShape },
}

impl arri_client::model::ArriClientModel for FooRecursiveUnion {
    fn new() -> Self {
        Self::Child {
            data: Box::new(FooRecursiveUnion::new()),
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
                                    Box::new(FooRecursiveUnion::from_json(data_val.to_owned()))
                                }
                                _ => Box::new(FooRecursiveUnion::from_json(data_val.to_owned())),
                            },
                            _ => Box::new(FooRecursiveUnion::new()),
                        };
                        Self::Child { data }
                    }
                    "CHILDREN" => {
                        let data = match _val_.get("data") {
                            Some(serde_json::Value::Array(data_val)) => {
                                let mut data_val_result: Vec<Box<FooRecursiveUnion>> = Vec::new();
                                for data_val_element in data_val {
                                    data_val_result.push(match Some(data_val_element) {
                                        Some(data_val_element_val) => match data_val_element_val {
                                            serde_json::Value::Object(_) => {
                                                Box::new(FooRecursiveUnion::from_json(
                                                    data_val_element_val.to_owned(),
                                                ))
                                            }
                                            _ => Box::new(FooRecursiveUnion::from_json(
                                                data_val_element_val.to_owned(),
                                            )),
                                        },
                                        _ => Box::new(FooRecursiveUnion::new()),
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
                                FooRecursiveUnionDataShape::from_json(data_val.to_owned())
                            }
                            _ => FooRecursiveUnionDataShape::new(),
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
                _json_output_.push_str(utils::serialize_string(data).as_str());
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
pub struct FooRecursiveUnionDataShape {
    pub width: f64,
    pub height: f64,
    pub color: String,
}

impl arri_client::model::ArriClientModel for FooRecursiveUnionDataShape {
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
        _json_output_.push_str(utils::serialize_string(&self.color).as_str());
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
pub struct FooAutoReconnectParams {
    pub message_count: u8,
}

impl arri_client::model::ArriClientModel for FooAutoReconnectParams {
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
pub struct FooAutoReconnectResponse {
    pub count: u8,
    pub message: String,
}

impl arri_client::model::ArriClientModel for FooAutoReconnectResponse {
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
        _json_output_.push_str(utils::serialize_string(&self.message).as_str());
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
pub struct FooStreamConnectionErrorTestParams {
    pub status_code: i32,
    pub status_message: String,
}

impl arri_client::model::ArriClientModel for FooStreamConnectionErrorTestParams {
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
        _json_output_.push_str(utils::serialize_string(&self.status_message).as_str());
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
pub struct FooStreamConnectionErrorTestResponse {
    pub message: String,
}

impl arri_client::model::ArriClientModel for FooStreamConnectionErrorTestResponse {
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
        _json_output_.push_str(utils::serialize_string(&self.message).as_str());
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
pub struct FooStreamLargeObjectsResponse {
    pub numbers: Vec<f64>,
    pub objects: Vec<FooStreamLargeObjectsResponseObjectsElement>,
}

impl arri_client::model::ArriClientModel for FooStreamLargeObjectsResponse {
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
                        let mut objects_val_result: Vec<
                            FooStreamLargeObjectsResponseObjectsElement,
                        > = Vec::new();
                        for objects_val_element in objects_val {
                            objects_val_result.push(match Some(objects_val_element) {
                                Some(objects_val_element_val) => {
                                    FooStreamLargeObjectsResponseObjectsElement::from_json(
                                        objects_val_element_val.to_owned(),
                                    )
                                }
                                _ => FooStreamLargeObjectsResponseObjectsElement::new(),
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
pub struct FooStreamLargeObjectsResponseObjectsElement {
    pub id: String,
    pub name: String,
    pub email: String,
}

impl arri_client::model::ArriClientModel for FooStreamLargeObjectsResponseObjectsElement {
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
        _json_output_.push_str(utils::serialize_string(&self.id).as_str());
        _json_output_.push_str(",\"name\":");
        _json_output_.push_str(utils::serialize_string(&self.name).as_str());
        _json_output_.push_str(",\"email\":");
        _json_output_.push_str(utils::serialize_string(&self.email).as_str());
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
pub struct FooChatMessageParams {
    pub channel_id: String,
}

impl arri_client::model::ArriClientModel for FooChatMessageParams {
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
        _json_output_.push_str(utils::serialize_string(&self.channel_id).as_str());
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
pub enum FooChatMessage {
    Text {
        id: String,
        channel_id: String,
        user_id: String,
        date: chrono::DateTime<chrono::FixedOffset>,
        text: String,
    },
    Image {
        id: String,
        channel_id: String,
        user_id: String,
        date: chrono::DateTime<chrono::FixedOffset>,
        image: String,
    },
    Url {
        id: String,
        channel_id: String,
        user_id: String,
        date: chrono::DateTime<chrono::FixedOffset>,
        url: String,
    },
}

impl arri_client::model::ArriClientModel for FooChatMessage {
    fn new() -> Self {
        Self::Text {
            id: "".to_string(),
            channel_id: "".to_string(),
            user_id: "".to_string(),
            date: chrono::DateTime::default(),
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
                                chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(
                                    date_val,
                                )
                                .unwrap_or(chrono::DateTime::default())
                            }
                            _ => chrono::DateTime::default(),
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
                                chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(
                                    date_val,
                                )
                                .unwrap_or(chrono::DateTime::default())
                            }
                            _ => chrono::DateTime::default(),
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
                                chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(
                                    date_val,
                                )
                                .unwrap_or(chrono::DateTime::default())
                            }
                            _ => chrono::DateTime::default(),
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
                _json_output_.push_str(utils::serialize_string(id).as_str());
                _json_output_.push_str(",\"channelId\":");
                _json_output_.push_str(utils::serialize_string(channel_id).as_str());
                _json_output_.push_str(",\"userId\":");
                _json_output_.push_str(utils::serialize_string(user_id).as_str());
                _json_output_.push_str(",\"date\":");
                _json_output_.push_str(utils::serialize_date_time(date, true).as_str());
                _json_output_.push_str(",\"text\":");
                _json_output_.push_str(utils::serialize_string(text).as_str());
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
                _json_output_.push_str(utils::serialize_string(id).as_str());
                _json_output_.push_str(",\"channelId\":");
                _json_output_.push_str(utils::serialize_string(channel_id).as_str());
                _json_output_.push_str(",\"userId\":");
                _json_output_.push_str(utils::serialize_string(user_id).as_str());
                _json_output_.push_str(",\"date\":");
                _json_output_.push_str(utils::serialize_date_time(date, true).as_str());
                _json_output_.push_str(",\"image\":");
                _json_output_.push_str(utils::serialize_string(image).as_str());
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
                _json_output_.push_str(utils::serialize_string(id).as_str());
                _json_output_.push_str(",\"channelId\":");
                _json_output_.push_str(utils::serialize_string(channel_id).as_str());
                _json_output_.push_str(",\"userId\":");
                _json_output_.push_str(utils::serialize_string(user_id).as_str());
                _json_output_.push_str(",\"date\":");
                _json_output_.push_str(utils::serialize_date_time(date, true).as_str());
                _json_output_.push_str(",\"url\":");
                _json_output_.push_str(utils::serialize_string(url).as_str());
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
                _query_parts_.push(format!("date={}", utils::serialize_date_time(date, false)));
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
                _query_parts_.push(format!("date={}", utils::serialize_date_time(date, false)));
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
                _query_parts_.push(format!("date={}", utils::serialize_date_time(date, false)));
                _query_parts_.push(format!("url={}", url));
            }
        }
        _query_parts_.join("&")
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct FooTestsStreamRetryWithNewCredentialsResponse {
    pub message: String,
}

impl arri_client::model::ArriClientModel for FooTestsStreamRetryWithNewCredentialsResponse {
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
        _json_output_.push_str(utils::serialize_string(&self.message).as_str());
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
pub struct FooUsersWatchUserParams {
    pub user_id: String,
}

impl arri_client::model::ArriClientModel for FooUsersWatchUserParams {
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
        _json_output_.push_str(utils::serialize_string(&self.user_id).as_str());
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
pub struct FooUsersWatchUserResponse {
    pub id: String,
    pub role: FooUsersWatchUserResponseRole,
    /// A profile picture
    pub photo: Option<FooUserPhoto>,
    pub created_at: chrono::DateTime<chrono::FixedOffset>,
    pub num_followers: i32,
    pub settings: FooUserSettings,
    pub recent_notifications: Vec<FooUsersWatchUserResponseRecentNotificationsElement>,
    pub bookmarks: std::collections::BTreeMap<String, FooUsersWatchUserResponseBookmarksValue>,
    pub metadata: std::collections::BTreeMap<String, serde_json::Value>,
    pub random_list: Vec<serde_json::Value>,
    pub bio: Option<String>,
}

impl arri_client::model::ArriClientModel for FooUsersWatchUserResponse {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            role: FooUsersWatchUserResponseRole::default(),
            photo: None,
            created_at: chrono::DateTime::default(),
            num_followers: 0,
            settings: FooUserSettings::new(),
            recent_notifications: Vec::new(),
            bookmarks: std::collections::BTreeMap::new(),
            metadata: std::collections::BTreeMap::new(),
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
                        FooUsersWatchUserResponseRole::from_string(role_val.to_owned())
                    }
                    _ => FooUsersWatchUserResponseRole::default(),
                };
                let photo = match _val_.get("photo") {
                    Some(photo_val) => match photo_val {
                        serde_json::Value::Object(_) => {
                            Some(FooUserPhoto::from_json(photo_val.to_owned()))
                        }
                        _ => None,
                    },
                    _ => None,
                };
                let created_at = match _val_.get("createdAt") {
                    Some(serde_json::Value::String(created_at_val)) => {
                        chrono::DateTime::<chrono::FixedOffset>::parse_from_rfc3339(created_at_val)
                            .unwrap_or(chrono::DateTime::default())
                    }
                    _ => chrono::DateTime::default(),
                };
                let num_followers = match _val_.get("numFollowers") {
                    Some(serde_json::Value::Number(num_followers_val)) => {
                        i32::try_from(num_followers_val.as_i64().unwrap_or(0)).unwrap_or(0)
                    }
                    _ => 0,
                };
                let settings = match _val_.get("settings") {
                    Some(settings_val) => FooUserSettings::from_json(settings_val.to_owned()),
                    _ => FooUserSettings::new(),
                };
                let recent_notifications = match _val_.get("recentNotifications") {
                    Some(serde_json::Value::Array(recent_notifications_val)) => {
                        let mut recent_notifications_val_result: Vec<
                            FooUsersWatchUserResponseRecentNotificationsElement,
                        > = Vec::new();
                        for recent_notifications_val_element in recent_notifications_val {
                            recent_notifications_val_result.push(match Some(recent_notifications_val_element) {
                Some(recent_notifications_val_element_val) => match recent_notifications_val_element_val {
                    serde_json::Value::Object(_) => {
                        FooUsersWatchUserResponseRecentNotificationsElement::from_json(recent_notifications_val_element_val.to_owned())
                    }
                    _ => FooUsersWatchUserResponseRecentNotificationsElement::new(),
                },
                _ => FooUsersWatchUserResponseRecentNotificationsElement::new(),
            });
                        }
                        recent_notifications_val_result
                    }
                    _ => Vec::new(),
                };
                let bookmarks = match _val_.get("bookmarks") {
                    Some(serde_json::Value::Object(bookmarks_val)) => {
                        let mut bookmarks_val_result: std::collections::BTreeMap<
                            String,
                            FooUsersWatchUserResponseBookmarksValue,
                        > = std::collections::BTreeMap::new();
                        for (_key_, _value_) in bookmarks_val.into_iter() {
                            bookmarks_val_result.insert(
                                _key_.to_owned(),
                                match Some(_value_.to_owned()) {
                                    Some(value_val) => {
                                        FooUsersWatchUserResponseBookmarksValue::from_json(
                                            value_val.to_owned(),
                                        )
                                    }
                                    _ => FooUsersWatchUserResponseBookmarksValue::new(),
                                },
                            );
                        }
                        bookmarks_val_result
                    }
                    _ => std::collections::BTreeMap::new(),
                };
                let metadata = match _val_.get("metadata") {
                    Some(serde_json::Value::Object(metadata_val)) => {
                        let mut metadata_val_result: std::collections::BTreeMap<
                            String,
                            serde_json::Value,
                        > = std::collections::BTreeMap::new();
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
                    _ => std::collections::BTreeMap::new(),
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
        _json_output_.push_str(utils::serialize_string(&self.id).as_str());
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
        _json_output_.push_str(utils::serialize_date_time(&self.created_at, true).as_str());
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
            _json_output_.push_str(format!("{}:", utils::serialize_string(_key_)).as_str());
            _json_output_.push_str(_value_.to_json_string().as_str());
        }
        _json_output_.push('}');
        _json_output_.push_str(",\"metadata\":");
        _json_output_.push('{');
        for (_index_, (_key_, _value_)) in self.metadata.iter().enumerate() {
            if _index_ != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(format!("{}:", utils::serialize_string(_key_)).as_str());
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
                _json_output_.push_str(utils::serialize_string(bio_val).as_str())
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
            utils::serialize_date_time(&self.created_at, false)
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
pub enum FooUsersWatchUserResponseRole {
    Standard,
    Admin,
}

impl arri_client::model::ArriClientEnum for FooUsersWatchUserResponseRole {
    fn default() -> Self {
        FooUsersWatchUserResponseRole::Standard
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
            FooUsersWatchUserResponseRole::Standard => "standard".to_string(),
            FooUsersWatchUserResponseRole::Admin => "admin".to_string(),
        }
    }
}

/// A profile picture
#[derive(Clone, Debug, PartialEq)]
pub struct FooUserPhoto {
    pub url: String,
    pub width: f64,
    pub height: f64,
    pub bytes: i64,
    /// When the photo was last updated in nanoseconds
    pub nanoseconds: u64,
}

impl arri_client::model::ArriClientModel for FooUserPhoto {
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
        _json_output_.push_str(utils::serialize_string(&self.url).as_str());
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
pub struct FooUserSettings {
    pub notifications_enabled: bool,
    pub preferred_theme: FooUserSettingsPreferredTheme,
}

impl arri_client::model::ArriClientModel for FooUserSettings {
    fn new() -> Self {
        Self {
            notifications_enabled: false,
            preferred_theme: FooUserSettingsPreferredTheme::default(),
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
                        FooUserSettingsPreferredTheme::from_string(preferred_theme_val.to_owned())
                    }
                    _ => FooUserSettingsPreferredTheme::default(),
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
pub enum FooUserSettingsPreferredTheme {
    DarkMode,
    LightMode,
    System,
}

impl arri_client::model::ArriClientEnum for FooUserSettingsPreferredTheme {
    fn default() -> Self {
        FooUserSettingsPreferredTheme::DarkMode
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
            FooUserSettingsPreferredTheme::DarkMode => "dark-mode".to_string(),
            FooUserSettingsPreferredTheme::LightMode => "light-mode".to_string(),
            FooUserSettingsPreferredTheme::System => "system".to_string(),
        }
    }
}

#[derive(Clone, Debug, PartialEq)]
pub enum FooUsersWatchUserResponseRecentNotificationsElement {
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

impl arri_client::model::ArriClientModel for FooUsersWatchUserResponseRecentNotificationsElement {
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
                _json_output_.push_str(utils::serialize_string(post_id).as_str());
                _json_output_.push_str(",\"userId\":");
                _json_output_.push_str(utils::serialize_string(user_id).as_str());
            }
            Self::PostComment {
                post_id,
                user_id,
                comment_text,
            } => {
                _json_output_.push_str("\"notificationType\":\"POST_COMMENT\"");
                _json_output_.push_str(",\"postId\":");
                _json_output_.push_str(utils::serialize_string(post_id).as_str());
                _json_output_.push_str(",\"userId\":");
                _json_output_.push_str(utils::serialize_string(user_id).as_str());
                _json_output_.push_str(",\"commentText\":");
                _json_output_.push_str(utils::serialize_string(comment_text).as_str());
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
pub struct FooUsersWatchUserResponseBookmarksValue {
    pub post_id: String,
    pub user_id: String,
}

impl arri_client::model::ArriClientModel for FooUsersWatchUserResponseBookmarksValue {
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
        _json_output_.push_str(utils::serialize_string(&self.post_id).as_str());
        _json_output_.push_str(",\"userId\":");
        _json_output_.push_str(utils::serialize_string(&self.user_id).as_str());
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
