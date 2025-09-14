use std::future::Future;

use arri_core::{errors::ArriError, stream_event::StreamEvent};

use crate::{model::ArriClientModel, rpc_call::RpcCall};

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

pub trait TransportDispatcher: Clone {
    fn transport_id(&self) -> String;

    fn dispatch_rpc<TIn: ArriClientModel, TOut: ArriClientModel>(
        &self,
        call: RpcCall<'_, TIn>,
    ) -> impl std::future::Future<Output = Result<TOut, ArriError>>;
    fn dispatch_event_stream_rpc<TIn: ArriClientModel, TOut: ArriClientModel, TOnEvent>(
        &self,
        call: RpcCall<'_, TIn>,
        on_event: &mut TOnEvent,
        stream_controller: Option<&mut EventStreamController>,
    ) where
        TOnEvent: FnMut(StreamEvent<TOut>, &mut EventStreamController);
}

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

pub trait EventStream {
    fn listen<T: ArriClientModel, OnEvent>(
        &mut self,
        on_event: &mut OnEvent,
    ) -> impl Future<Output = ()>
    where
        OnEvent: FnMut(StreamEvent<T>, &mut EventStreamController);
}

enum SseAction {
    Retry,
    Abort,
}
