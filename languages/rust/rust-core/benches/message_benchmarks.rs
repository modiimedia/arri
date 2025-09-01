use arri_core::{
    headers::HeaderMap,
    message::{ContentType, Message},
};
use criterion::{Criterion, criterion_group, criterion_main};
use std::{fs, hint::black_box};

fn encode_invocation_message_benchmark(c: &mut Criterion) {
    let message = Message::Invocation {
        req_id: "12345".to_string(),
        rpc_name: "foo.Foo".to_string(),
        content_type: Some(ContentType::Json),
        client_version: None,
        custom_headers: HeaderMap::from_iter([("foo".to_string(), "bar".to_string())]),
        http_method: None,
        path: None,
        body: Some(
            "{\"message\":\"hello world\"}"
                .to_string()
                .as_bytes()
                .to_vec(),
        ),
    };
    c.bench_function("encode_invocation_message", |b| {
        b.iter(|| {
            black_box(message.encode());
        });
    });
}

fn encode_ok_message_benchmark(c: &mut Criterion) {
    let message = Message::Ok {
        req_id: "12345".to_string(),
        content_type: Some(ContentType::Json),
        custom_headers: HeaderMap::from_iter([("foo".to_string(), "bar".to_string())]),
        body: Some(
            "{\"message\":\"hello world\"}"
                .to_string()
                .as_bytes()
                .to_vec(),
        ),
    };
    c.bench_function("encode_ok_message", |b| {
        b.iter(|| {
            black_box(message.encode());
        });
    });
}

fn decode_invocation_message_benchmark(c: &mut Criterion) {
    let encoded_message =
        fs::read("../../../tests/test-files/InvocationMessage_WithBody.txt").unwrap();
    c.bench_function("decode_invocation_message", |b| {
        b.iter(|| {
            black_box(Message::decode(&encoded_message).unwrap());
        });
    });
}

fn decode_ok_message_benchmark(c: &mut Criterion) {
    let encoded_message = fs::read("../../../tests/test-files/OkMessage_WithBody.txt").unwrap();
    c.bench_function("decode_ok_message", |b| {
        b.iter(|| {
            black_box(Message::decode(&encoded_message).unwrap());
        });
    });
}

criterion_group!(
    benches,
    encode_invocation_message_benchmark,
    encode_ok_message_benchmark,
    decode_invocation_message_benchmark,
    decode_ok_message_benchmark,
);
criterion_main!(benches);
