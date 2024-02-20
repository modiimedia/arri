use reqwest::{header::HeaderMap, Response};
use serde_json::json;
use std::{marker::PhantomData, thread};

use crate::{ArriModel, ArriRequestError, ArriRequestErrorMethods};

pub struct ParsedArriSseRequestOptions<
    'a,
    TData,
    OnData,
    OnError,
    OnConnectionError,
    OnOpen,
    OnClose,
> where
    OnData: Fn(TData),
    OnError: Fn(ArriRequestError),
    OnConnectionError: Fn(ArriRequestError),
    OnOpen: Fn(&Response),
    OnClose: Fn(&Response),
{
    pub client: &'a reqwest::Client,
    pub url: String,
    pub method: reqwest::Method,
    pub headers: &'a HeaderMap,
    pub on_data: Option<OnData>,
    pub on_error: Option<OnError>,
    pub on_connection_error: Option<OnConnectionError>,
    pub on_open: Option<OnOpen>,
    pub on_close: Option<OnClose>,
    _phantom_data_store: PhantomData<TData>,
}

pub fn handle_data<TData>(data: String, parser: fn(String) -> TData, on_data: fn(TData)) {
    on_data(parser(data));
}

pub async fn parsed_arri_sse_request<
    'a,
    TData: ArriModel,
    OnData,
    OnError,
    OnConnectionError,
    OnOpen,
    OnClose,
>(
    options: ParsedArriSseRequestOptions<
        'a,
        TData,
        OnData,
        OnError,
        OnConnectionError,
        OnOpen,
        OnClose,
    >,
    params: Option<impl ArriModel>,
) where
    OnData: Fn(TData),
    OnError: Fn(ArriRequestError),
    OnConnectionError: Fn(ArriRequestError),
    OnOpen: Fn(&Response),
    OnClose: Fn(&Response),
{
    arri_sse_request(
        ArriSseRequestOptions {
            client: options.client,
            url: options.url,
            method: options.method,
            headers: options.headers,
            on_data: |input| match &options.on_data {
                Some(func) => func(TData::from_json_string(input)),
                None => {}
            },
            on_error: |err| match &options.on_error {
                Some(func) => func(err),
                None => {}
            },
            on_connection_error: |err| match &options.on_connection_error {
                Some(func) => func(err),
                None => {}
            },
            on_close: |res| match &options.on_close {
                Some(func) => func(res),
                None => {}
            },
            on_open: |res| match &options.on_open {
                Some(func) => func(res),
                None => {}
            },
        },
        params,
    )
    .await
}

pub struct ArriSseRequestOptions<'a, OnData, OnError, OnConnectionError, OnOpen, OnClose>
where
    OnData: Fn(String),
    OnError: Fn(ArriRequestError),
    OnConnectionError: Fn(ArriRequestError),
    OnOpen: Fn(&Response),
    OnClose: Fn(&Response),
{
    client: &'a reqwest::Client,
    url: String,
    method: reqwest::Method,
    headers: &'a HeaderMap,
    on_data: OnData,
    on_error: OnError,
    on_connection_error: OnConnectionError,
    on_open: OnOpen,
    on_close: OnClose,
}

pub async fn arri_sse_request<'a, OnData, OnError, OnConnectionError, OnOpen, OnClose>(
    options: ArriSseRequestOptions<'a, OnData, OnError, OnConnectionError, OnOpen, OnClose>,
    params: Option<impl ArriModel>,
) -> ()
where
    OnData: Fn(String),
    OnError: Fn(ArriRequestError),
    OnConnectionError: Fn(ArriRequestError),
    OnOpen: Fn(&Response),
    OnClose: Fn(&Response),
{
    let query_string: Option<String>;
    let json_body: Option<String>;

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

    thread::spawn(|| {
        let response = match json_body {
            Some(body) => options
                .client
                .request(options.method, url)
                .headers(options.headers.to_owned())
                .body(body)
                .send(),
            None => options
                .client
                .request(options.method, url)
                .headers(options.headers.to_owned())
                .send(),
        };

        if !response.is_ok() {
            (options.on_connection_error)(ArriRequestError::new());
            return;
        }
        let mut ok_response = response.unwrap();
        (options.on_open)(&ok_response);
        let status = ok_response.status().as_u16();
        if status < 200 || status >= 300 {
            let body = ok_response.text().await.unwrap_or_default();
            (options.on_connection_error)(ArriRequestError::from_response_data(status, body));
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
                    pending_data = String::from("");
                    let messages = sse_messages_from_string(msg_text);
                    for message in messages {
                        let event = message.event.unwrap_or("".to_string());
                        match event.as_str() {
                            "error" => {
                                (options.on_error)(ArriRequestError::from_json_string(
                                    message.data,
                                ));
                            }
                            "done" => {
                                (options.on_close)(&ok_response);
                                break;
                            }
                            _ => {
                                (options.on_data)(message.data);
                            }
                        }
                    }
                }
                _ => {}
            }
            println!("Chunk: {:?}", chunk);
        }
    });
}

#[derive(Debug, Clone)]
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
                let sub_str = &trimmed[3..trimmed.len()];
                id = Some(sub_str.trim().to_string());
                continue;
            }
            if trimmed.starts_with("event:") {
                let sub_str = &trimmed[5..trimmed.len()];
                event = Some(sub_str.trim().to_string());
                continue;
            }
            if trimmed.starts_with("data:") {
                let sub_str = &trimmed[4..trimmed.len()];
                data = sub_str.trim().to_string();
                continue;
            }
            if trimmed.starts_with("retry:") {
                let sub_str = &trimmed[5..trimmed.len()];
                let result = json!(sub_str.trim());
                match result {
                    serde_json::Value::Number(val) => {
                        retry = Some(
                            i32::try_from(val.as_i64().unwrap_or_default()).unwrap_or_default(),
                        );
                    }
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
    id: Option<String>,
    event: Option<String>,
    data: T,
    retry: Option<i32>,
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

fn sse_messages_from_string(input: String) -> Vec<SseMessage> {
    let parts = input.split("\n\n");
    let mut messages: Vec<SseMessage> = Vec::new();
    for part in parts {
        let msg = SseMessage::from_string(part.to_string());
        messages.push(msg);
    }
    messages
}
