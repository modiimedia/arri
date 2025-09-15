use arri_core::{errors::ArriError, message::ContentType};
use async_trait::async_trait;

use crate::{
    dispatcher::{EventStreamController, OnEventClosure, TransportDispatcher},
    rpc_call::RpcCall,
};

#[derive(Debug, Clone)]
pub struct WsDispatcher {
    pub http_client: reqwest::Client,
}

impl WsDispatcher {
    pub fn new(client: Option<reqwest::Client>) -> Self {
        todo!();
    }
}

#[async_trait]
impl TransportDispatcher for WsDispatcher {
    fn transport_id(&self) -> String {
        todo!()
    }

    async fn dispatch_rpc(&self, call: RpcCall<'_>) -> Result<(ContentType, Vec<u8>), ArriError> {
        todo!()
    }

    async fn dispatch_output_stream_rpc(
        &self,
        call: RpcCall<'_>,
        on_event: Box<OnEventClosure<'_, Vec<u8>>>,
        stream_controller: Option<&mut EventStreamController>,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) {
        todo!()
    }

    fn clone_box(&self) -> Box<dyn TransportDispatcher> {
        todo!()
    }
}
