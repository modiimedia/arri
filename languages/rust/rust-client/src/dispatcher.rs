use arri_core::errors::ArriError;

use crate::{model::ArriClientModel, rpc_call::RpcCall};

pub trait TransportDispatcher {
    fn transport_id(&self) -> String;
    async fn dispatch_rpc<
        TIn: ArriClientModel + std::marker::Copy + std::marker::Send + std::marker::Sync,
        TOut: ArriClientModel + std::marker::Copy + std::marker::Send + std::marker::Sync,
    >(
        &self,
        call: RpcCall<TIn>,
    ) -> Result<TOut, ArriError>;
}
