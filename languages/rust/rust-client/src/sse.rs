#![allow(dead_code)]
use reqwest::Response;
use serde_json::json;
use std::{collections::HashMap, marker::PhantomData};

use crate::{ArriModel, ArriRequestErrorMethods, ArriServerError};

pub struct ArriParsedSseRequestOptions<'a> {
    pub client: &'a reqwest::Client,
    pub client_version: String,
    pub url: String,
    pub method: reqwest::Method,
    pub headers: fn() -> HashMap<&'static str, &'static str>,
}

pub enum SseEvent<T> {
    Message {
        id: Option<String>,
        data: T,
        retry: Option<i32>,
    },
    Error {
        error: ArriServerError,
    },
    Open,
    Close,
}

pub async fn parsed_arri_sse_request<'a, T: ArriModel, OnEvent>(
    options: ArriParsedSseRequestOptions<'a>,
    params: Option<impl ArriModel>,
    on_event: OnEvent,
) where
    OnEvent: Fn(SseEvent<T>),
{
    arri_sse_request(
        ArriSseRequestOptions {
            http_client: options.client,
            client_version: options.client_version,
            url: options.url,
            method: options.method,
            headers: options.headers,
        },
        params,
        |evt| {
            let parsed_event = match evt {
                SseEvent::Message { id, data, retry } => SseEvent::Message {
                    id: id,
                    data: T::from_json_string(data),
                    retry: retry,
                },
                SseEvent::Error { error } => SseEvent::Error { error: error },
                SseEvent::Open => SseEvent::Open,
                SseEvent::Close => SseEvent::Close,
            };
            on_event(parsed_event);
        },
    )
    .await;
}

pub struct ArriSseRequestOptions<'a> {
    http_client: &'a reqwest::Client,
    url: String,
    method: reqwest::Method,
    client_version: String,
    headers: fn() -> HashMap<&'static str, &'static str>,
}

pub struct ArriSseHooks<T: ArriModel, OnMessage, OnError, OnOpen, OnClose>
where
    OnMessage: Fn(T),
    OnError: Fn(ArriServerError),
    OnOpen: Fn(&Response),
    OnClose: Fn(&Response),
{
    pub on_message: OnMessage,
    pub on_error: Option<OnError>,
    pub on_open: Option<OnOpen>,
    pub on_close: Option<OnClose>,
    _phantom: PhantomData<T>,
}

fn hashmap_to_header_map<'a>(input: HashMap<&'static str, String>) -> reqwest::header::HeaderMap {
    let mut headers = reqwest::header::HeaderMap::new();
    for (key, value) in input {
        match reqwest::header::HeaderValue::from_str(value.as_str()) {
            Ok(header_val) => {
                headers.insert(key, header_val);
            }
            Err(_) => todo!(),
        }
    }
    headers
}

pub async fn arri_sse_request<'a, OnEvent>(
    options: ArriSseRequestOptions<'a>,
    params: Option<impl ArriModel>,
    on_event: OnEvent,
) -> ()
where
    OnEvent: Fn(SseEvent<String>),
{
    let query_string: Option<String>;
    let json_body: Option<String>;
    let mut headers = reqwest::header::HeaderMap::new();
    let header_input = (options.headers)();
    for (key, value) in header_input {
        match reqwest::header::HeaderValue::from_str(value) {
            Ok(header_val) => {
                headers.insert(key, header_val);
            }
            Err(error) => {
                println!("Invalid header value: {:?}", error);
            }
        }
    }
    if !options.client_version.is_empty() {
        headers.insert(
            "client-version",
            reqwest::header::HeaderValue::from_str(&options.client_version).unwrap(),
        );
    }
    match params {
        Some(val) => match options.method {
            reqwest::Method::GET => {
                query_string = Some(val.to_query_params_string());
                json_body = None;
            }
            _ => {
                query_string = None;
                json_body = Some(val.to_json_string());
            }
        },
        None => {
            query_string = None;
            json_body = None;
        }
    }

    let url = match query_string {
        Some(val) => format!("{}?{}", options.url, val),
        None => options.url,
    };

    let response = match json_body {
        Some(body) => {
            options
                .http_client
                .request(options.method, url)
                .headers(headers)
                .body(body)
                .send()
                .await
        }
        None => {
            options
                .http_client
                .request(options.method, url)
                .headers(headers)
                .send()
                .await
        }
    };

    if !response.is_ok() {
        on_event(SseEvent::Error {
            error: ArriServerError::new(),
        });
        return;
    }
    let mut ok_response = response.unwrap();
    on_event(SseEvent::Open);
    let status = ok_response.status().as_u16();
    if status < 200 || status >= 300 {
        let body = ok_response.text().await.unwrap_or_default();
        on_event(SseEvent::Error {
            error: ArriServerError::from_response_data(status, body),
        });
        return;
    }
    let mut pending_data: String = "".to_string();
    while let Some(chunk) = ok_response.chunk().await.unwrap_or_default() {
        let chunk_vec = chunk.to_vec();
        let data = std::str::from_utf8(chunk_vec.as_slice());
        match data {
            Ok(text) => {
                if !text.ends_with("\n\n") {
                    pending_data.push_str(text);
                    continue;
                }
                let msg_text = format!("{}{}", pending_data, text);
                let (messages, left_over) = sse_messages_from_string(msg_text);
                pending_data = left_over;
                for message in messages {
                    let event = message.event.unwrap_or("".to_string());
                    match event.as_str() {
                        "done" => {
                            on_event(SseEvent::Close);
                            break;
                        }
                        "message" => {
                            on_event(SseEvent::Message {
                                id: message.id,
                                data: message.data,
                                retry: message.retry,
                            });
                        }
                        _ => {}
                    }
                }
            }
            _ => {}
        }
        println!("Chunk: {:?}", chunk);
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct SseMessage {
    id: Option<String>,
    event: Option<String>,
    data: String,
    retry: Option<i32>,
}

pub trait SeeMessageMethods {
    fn new() -> Self;
    fn from_string(input: String) -> Self;
}

impl SeeMessageMethods for SseMessage {
    fn new() -> Self {
        Self {
            id: None,
            event: None,
            data: String::from(""),
            retry: None,
        }
    }
    fn from_string(input: String) -> Self {
        let parts = input.split("\n");
        let mut id: Option<String> = None;
        let mut event: Option<String> = None;
        let mut data = String::from("");
        let mut retry: Option<i32> = None;
        for part in parts {
            let trimmed = part.trim();
            if trimmed.starts_with("id:") {
                let sub_str = &trimmed[4..trimmed.len()];
                id = Some(sub_str.trim().to_string());
                continue;
            }
            if trimmed.starts_with("event:") {
                let sub_str = &trimmed[6..trimmed.len()];
                event = Some(sub_str.trim().to_string());
                continue;
            }
            if trimmed.starts_with("data:") {
                let sub_str = &trimmed[5..trimmed.len()];
                data = sub_str.trim().to_string();
                continue;
            }
            if trimmed.starts_with("retry:") {
                let sub_str = &trimmed[6..trimmed.len()];
                let result = json!(sub_str.trim());
                match result {
                    serde_json::Value::Number(val) => {
                        retry = Some(
                            i32::try_from(val.as_i64().unwrap_or_default()).unwrap_or_default(),
                        );
                    }
                    serde_json::Value::String(val) => match val.parse::<i32>() {
                        Ok(int_val) => {
                            retry = Some(int_val);
                        }
                        Err(_) => {}
                    },
                    _ => retry = None,
                }
            }
        }
        Self {
            id,
            event,
            data,
            retry,
        }
    }
}

struct ParsedSseMessage<T: ArriModel> {
    pub id: Option<String>,
    pub event: Option<String>,
    pub data: T,
    pub retry: Option<i32>,
}

impl<T: ArriModel> SeeMessageMethods for ParsedSseMessage<T> {
    fn new() -> Self {
        Self {
            id: None,
            event: None,
            data: T::new(),
            retry: None,
        }
    }
    fn from_string(input: String) -> Self {
        let message = SseMessage::from_string(input);
        Self {
            id: message.id,
            event: message.event,
            data: T::from_json_string(message.data),
            retry: message.retry,
        }
    }
}

fn sse_messages_from_string(input: String) -> (Vec<SseMessage>, String) {
    let mut parts = input.split("\n\n").peekable();
    let mut left_over = "";
    let mut messages: Vec<SseMessage> = Vec::new();
    while let Some(part) = parts.next() {
        if parts.peek().is_none() {
            left_over = part;
            continue;
        }
        let msg = SseMessage::from_string(part.to_string());
        messages.push(msg);
    }
    (messages, left_over.to_string())
}
#[cfg(test)]
mod parsing_and_serialization_tests {
    use crate::sse::SseMessage;

    use super::sse_messages_from_string;

    #[test]
    fn sse_messages_from_string_test() {
        let input = "
data: hello world

event: message
data: {\"message\": \"hello world\"}

id: 1
event: message
data: hello world again
retry: 200

data: hello world
"
        .to_string();
        let (messages, left_over) = sse_messages_from_string(input);
        assert_eq!(messages.len().clone(), 3);
        assert_eq!(left_over, "data: hello world\n".to_string());
        assert_eq!(
            messages.clone(),
            vec![
                SseMessage {
                    id: None,
                    event: None,
                    data: "hello world".to_string(),
                    retry: None,
                },
                SseMessage {
                    id: None,
                    event: Some("message".to_string()),
                    data: "{\"message\": \"hello world\"}".to_string(),
                    retry: None,
                },
                SseMessage {
                    id: Some("1".to_string()),
                    event: Some("message".to_string()),
                    data: "hello world again".to_string(),
                    retry: Some(200)
                },
            ]
        );
    }
}
