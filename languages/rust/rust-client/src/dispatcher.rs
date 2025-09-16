use std::fmt::Debug;

use arri_core::{errors::ArriError, message::ContentType, stream_event::StreamEvent};
use async_trait::async_trait;

use crate::rpc_call::RpcCall;

pub fn resolve_dispatcher(
    transports: Vec<String>,
    default_transport: Option<String>,
    transport: Option<String>,
) -> Option<String> {
    if transports.is_empty() {
        return None;
    }
    if transport.is_some() {
        let transport = transport.unwrap();
        if transports.contains(&transport) {
            return Some(transport);
        }
    }

    if default_transport.is_some() {
        let default_transport = default_transport.clone().unwrap();
        if transports.contains(&default_transport) {
            return Some(default_transport);
        }
    }
    None
}

#[async_trait]
pub trait TransportDispatcher: Clone + Send + Sync + Debug {
    fn transport_id(&self) -> String;

    async fn dispatch_rpc(&self, call: RpcCall<'_>) -> Result<(ContentType, Vec<u8>), ArriError>;
    async fn dispatch_output_stream_rpc(
        &self,
        call: RpcCall<'_>,
        on_event: &mut OnEventClosure<'_, (ContentType, Vec<u8>)>,
        stream_controller: Option<&mut EventStreamController>,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    );

    // fn clone_box(&self) -> Box<dyn TransportDispatcher>;
}

// impl Clone for Box<dyn TransportDispatcher> {
//     fn clone(&self) -> Box<dyn TransportDispatcher> {
//         self.clone_box()
//     }
// }

pub type OnEventClosure<'a, T> = dyn FnMut(StreamEvent<T>, &mut EventStreamController) + Send + 'a;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct EventStreamController {
    pub is_aborted: bool,
}

impl EventStreamController {
    pub fn new() -> Self {
        Self { is_aborted: false }
    }
    pub fn abort(&mut self) {
        self.is_aborted = true;
    }
}

#[async_trait]
pub trait EventStream {
    async fn listen(&mut self, on_event: &mut OnEventClosure<'_, (ContentType, Vec<u8>)>);
}

enum SseAction {
    Retry,
    Abort,
}

#[cfg(test)]
pub mod dispatcher_tests {
    // use crate::dispatcher::TransportDispatcher;

    // #[test]
    // fn dispatcher_is_dyn_compatible() {
    //     fn get_dispatcher() -> Box<dyn TransportDispatcher> {
    //         todo!()
    //     }
    // }
}
