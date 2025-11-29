use std::sync::{Arc, RwLock};

use arri_client::{
    dispatcher::TransportDispatcher,
    dispatcher_http::{HttpDispatcher, HttpDispatcherOptions},
    rpc_call::RpcCall,
};
use arri_core::{
    headers::{HeaderMap, SharableHeaderMap},
    message::HttpMethod,
};

#[tokio::test]
async fn heartbeat_test() {
    let dispatcher = HttpDispatcher::new(
        None,
        HttpDispatcherOptions {
            base_url: "http://localhost:2020".to_string(),
            timeout: None,
            retry: None,
            retry_delay: None,
            retry_error_codes: None,
        },
    );
    let headers = Arc::new(RwLock::new(SharableHeaderMap::new()));
    let call = RpcCall::new(
        "heartbeatTest".to_string(),
        "/heartbeat-test".to_string(),
        Some("heartbeatEnabled=false".to_string()),
        Some(HttpMethod::Get),
        Some("22".to_string()),
        None,
        &headers,
        None,
    );

    let mut msg_count = 0;
    let mut start_count = 0;
    dispatcher
        .dispatch_output_stream_rpc(
            call,
            &mut |event, controller| match event {
                arri_core::stream_event::StreamEvent::Data(_) => {
                    msg_count += 1;
                    if msg_count >= 15 {
                        controller.abort();
                    }
                }
                arri_core::stream_event::StreamEvent::Error(arri_error) => {
                    panic!("{}", arri_error);
                }
                arri_core::stream_event::StreamEvent::Start => {
                    start_count += 1;
                }
                arri_core::stream_event::StreamEvent::End => {}
                arri_core::stream_event::StreamEvent::Cancel => {}
            },
            None,
            None,
            None,
        )
        .await;
    assert_eq!(start_count, 3);
    assert_eq!(msg_count, 15);
}
