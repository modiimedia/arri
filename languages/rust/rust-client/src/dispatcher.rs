use arri_core::{errors::ArriError, stream_event::StreamEvent};

use crate::{model::ArriClientModel, rpc_call::RpcCall};

pub trait TransportDispatcher {
    fn transport_id(&self) -> String;

    fn dispatch_rpc<
        TIn: ArriClientModel + std::marker::Copy + std::marker::Send + std::marker::Sync,
        TOut: ArriClientModel + std::marker::Copy + std::marker::Send + std::marker::Sync,
    >(
        &self,
        call: RpcCall<TIn>,
    ) -> impl std::future::Future<Output = Result<TOut, ArriError>>;

    fn dispatch_event_stream_rpc<
        TIn: ArriClientModel + std::marker::Copy + std::marker::Send + std::marker::Sync,
        TOut: ArriClientModel + std::marker::Copy + std::marker::Send + std::marker::Sync,
        TOnEvent,
    >(
        &self,
        call: RpcCall<TIn>,
        on_event: &mut TOnEvent,
    ) where
        TOnEvent: FnMut(StreamEvent<TOut>, EventStreamController) -> Result<(), ArriError>;
}

// pub struct EventStream {
//     pub headers: Arc<RwLock<SharableHeaderMap>>,
//     pub client_version: String,
//     pub retry_count: u64,
//     pub retry_interval: u64,
//     pub max_retry_interval: u64,
//     pub max_retry_count: Option<u64>,
// }

pub struct EventStreamController {
    is_aborted: bool,
}

impl EventStreamController {
    pub fn new() -> Self {
        Self { is_aborted: false }
    }
    pub fn abort(&mut self) {
        self.is_aborted = true;
    }
}

pub trait EventStream {
    async fn listen<T: ArriClientModel, OnEvent>(&mut self, on_event: &mut OnEvent)
    where
        OnEvent: FnMut(StreamEvent<T>, EventStreamController);
}

enum SseAction {
    Retry,
    Abort,
}
