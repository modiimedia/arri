use std::{
    str::FromStr,
    sync::{Arc, RwLock},
    time::{Duration, Instant},
};

use arri_core::{
    errors::ArriError,
    headers::SharableHeaderMap,
    message::{ContentType, HttpMethod},
    stream_event::StreamEvent,
};
use async_trait::async_trait;
use reqwest::header::HeaderValue;
use serde_json::from_str;

use crate::dispatcher::{EventStream, EventStreamController, OnEventClosure, TransportDispatcher};

#[derive(Debug, Clone)]
pub struct HttpDispatcher {
    http_client: reqwest::Client,
    options: HttpDispatcherOptions,
}

#[derive(Debug, Clone)]
pub struct HttpDispatcherOptions {
    pub base_url: String,
    pub timeout: Option<u32>,
    pub retry: Option<u32>,
    pub retry_delay: Option<u32>,
    pub retry_error_codes: Option<Vec<u32>>,
}

impl HttpDispatcher {
    pub fn new(client: Option<reqwest::Client>, options: HttpDispatcherOptions) -> Self {
        HttpDispatcher {
            http_client: client.unwrap_or(reqwest::Client::new()),
            options: options,
        }
    }
}

#[async_trait]
impl TransportDispatcher for HttpDispatcher {
    fn transport_id(&self) -> String {
        "http".to_string()
    }

    async fn dispatch_rpc(
        &self,
        call: crate::rpc_call::RpcCall<'_>,
    ) -> Result<(ContentType, Vec<u8>), ArriError> {
        let method = match call.method.unwrap_or(HttpMethod::Post) {
            HttpMethod::Get => reqwest::Method::GET,
            HttpMethod::Post => reqwest::Method::POST,
            HttpMethod::Put => reqwest::Method::PUT,
            HttpMethod::Patch => reqwest::Method::PATCH,
            HttpMethod::Delete => reqwest::Method::DELETE,
        };
        let mut is_using_query_string = false;
        let url_string = if method == reqwest::Method::GET && call.query_params.is_some() {
            is_using_query_string = true;
            format!(
                "{}{}?{}",
                &self.options.base_url,
                call.path,
                call.query_params.unwrap(),
            )
        } else {
            format!("{}{}", &self.options.base_url, call.path)
        };
        let url = reqwest::Url::from_str(&url_string);
        if url.is_err() {
            return Err(ArriError::new(
                0,
                format!("invalid url: {}", url_string),
                None,
                None,
            ));
        }
        let mut headers = reqwest::header::HeaderMap::new();
        {
            let custom_headers = call.custom_headers.read();
            match custom_headers {
                Ok(custom_headers) => {
                    for (key, val) in custom_headers.iter() {
                        headers.append(
                            *key,
                            HeaderValue::from_str(val.to_owned().as_str()).unwrap(),
                        );
                    }
                }
                Err(err) => {
                    return Err(ArriError::new(
                        0,
                        format!("Error reading custom headers. {:?}", err),
                        None,
                        None,
                    ))
                }
            }
        }
        headers.insert("req-id", HeaderValue::from_str(&call.req_id).unwrap());
        headers.insert("rpc-name", HeaderValue::from_str(&call.rpc_name).unwrap());
        match call.client_version {
            Some(client_version) => {
                headers.insert(
                    "client-version",
                    HeaderValue::from_str(&client_version).unwrap(),
                );
            }
            None => {}
        }
        let has_content_type = call.content_type.is_some();
        let content_type = call.content_type.unwrap_or(ContentType::Json);
        if has_content_type {
            match &content_type {
                ContentType::Json => {
                    headers.insert(
                        "content-type",
                        HeaderValue::from_str(&content_type.serial_value().as_str()).unwrap(),
                    );
                }
            }
        }
        let req: Result<reqwest::Request, reqwest::Error> = if is_using_query_string {
            self.http_client
                .request(method, url.unwrap())
                .headers(headers)
                .build()
        } else {
            let body = match call.data {
                Some(data) => match &content_type {
                    ContentType::Json => data,
                },
                None => Vec::new(),
            };
            self.http_client
                .request(method, url.unwrap())
                .headers(headers)
                .body(body)
                .build()
        };
        if req.is_err() {
            let err = req.unwrap_err();
            return Err(ArriError::new(
                0,
                format!("Error building http request: {}", err),
                None,
                None,
            ));
        }

        let result = self.http_client.execute(req.unwrap()).await;
        if result.is_err() {
            todo!()
        }
        let result = result.unwrap();
        let status = result.status().as_u16();
        if status < 200 || status >= 299 {
            return Err(error_message_from_response(result).await);
        }
        let content_type = ContentType::from_serial_value(
            result
                .headers()
                .get("content-type")
                .unwrap_or(&HeaderValue::from_static("application/json"))
                .to_str()
                .unwrap_or("application/json")
                .to_string(),
        )
        .unwrap_or(ContentType::Json);
        let res_body = result.bytes().await;
        match res_body {
            Ok(res_body) => Ok((content_type, res_body.to_vec())),
            Err(err) => Err(ArriError::new(
                0,
                format!("expected to received response from server. {:?}", err),
                Some(content_type),
                None,
            )),
        }
    }

    async fn dispatch_output_stream_rpc(
        &self,
        call: crate::rpc_call::RpcCall<'_>,
        on_event: &mut OnEventClosure<'_, (ContentType, Vec<u8>)>,
        stream_controller: Option<&mut EventStreamController>,
        max_retry_count: Option<u64>,
        max_retry_interval: Option<u64>,
    ) {
        let mut url = self.options.base_url.clone();
        url.push_str(&call.path);
        let controller = match stream_controller {
            Some(c) => c,
            None => &mut EventStreamController::new(),
        };
        let mut es = EventSource {
            dispatcher: self,
            client_version: call.client_version.unwrap_or("".to_string()),
            url: url,
            method: match call.method.unwrap_or(arri_core::message::HttpMethod::Post) {
                arri_core::message::HttpMethod::Get => reqwest::Method::GET,
                arri_core::message::HttpMethod::Post => reqwest::Method::POST,
                arri_core::message::HttpMethod::Put => reqwest::Method::PUT,
                arri_core::message::HttpMethod::Patch => reqwest::Method::PATCH,
                arri_core::message::HttpMethod::Delete => reqwest::Method::DELETE,
            },
            body: call.data,
            headers: call.custom_headers,
            retry_count: 0,
            retry_interval: 0,
            max_retry_interval: max_retry_interval.unwrap_or(30000),
            max_retry_count: max_retry_count,
            controller: controller,
        };
        es.listen(on_event).await;
    }

    // fn clone_box(&self) -> Box<dyn TransportDispatcher> {
    //     todo!()
    // }
}

async fn error_message_from_response(res: reqwest::Response) -> ArriError {
    let headers = res.headers();
    let content_type = ContentType::from_serial_value(
        headers
            .get("content-type")
            .unwrap_or(&HeaderValue::from_str("application/json").unwrap())
            .to_str()
            .unwrap_or("application/json")
            .to_owned(),
    )
    .unwrap_or(ContentType::Json);
    let err_code: u32 = headers
        .get("err-code")
        .unwrap_or(&HeaderValue::from_str("0").unwrap())
        .to_str()
        .unwrap_or("0")
        .parse()
        .unwrap_or(0);
    let err_msg = headers
        .get("err-msg")
        .unwrap_or(&HeaderValue::from_str("").unwrap())
        .to_str()
        .unwrap_or("")
        .to_owned();
    ArriError::new(
        err_code,
        err_msg,
        Some(content_type),
        match res.bytes().await {
            Ok(bytes) => Some(bytes.to_vec()),
            Err(_err) => None,
        },
    )
}

pub enum SseEvent<T> {
    Message(T),
    Error(ArriError),
    Open,
    Close,
}

#[derive(Clone)]
pub struct SseController {
    is_aborted: bool,
}

impl SseController {
    pub fn new() -> Self {
        Self { is_aborted: false }
    }
    pub fn abort(&mut self) {
        self.is_aborted = true;
    }
}

fn wait(duration: Duration) {
    let start = Instant::now();
    while start.elapsed().as_millis() < duration.as_millis() {
        // keep waiting
    }
}

#[derive(Debug)]
pub struct EventSource<'a, 'b> {
    pub dispatcher: &'a HttpDispatcher,
    pub url: String,
    pub method: reqwest::Method,
    pub body: Option<Vec<u8>>,
    pub client_version: String,
    pub headers: &'a Arc<RwLock<SharableHeaderMap>>,
    pub retry_count: u64,
    pub retry_interval: u64,
    pub max_retry_interval: u64,
    pub max_retry_count: Option<u64>,
    pub controller: &'b mut EventStreamController,
}

enum SseAction {
    Retry,
    Abort,
}

impl<'a, 'b> EventSource<'a, 'b> {
    async fn send_request(
        &mut self,
        on_event: &mut OnEventClosure<'_, (ContentType, Vec<u8>)>,
    ) -> SseAction {
        let mut headers = reqwest::header::HeaderMap::new();
        {
            let unlocked = self.headers.read().unwrap();
            for (key, value) in unlocked.iter() {
                match reqwest::header::HeaderValue::from_str(value) {
                    Ok(header_val) => {
                        headers.insert(*key, header_val);
                    }
                    Err(error) => {
                        println!("Invalid header value: {:?}", error);
                    }
                }
            }
        }
        if !self.client_version.is_empty() {
            headers.insert(
                "client-version",
                reqwest::header::HeaderValue::from_str(&self.client_version).unwrap(),
            );
        }

        let response = match &self.body {
            Some(body) => {
                self.dispatcher
                    .http_client
                    .request(self.method.clone(), self.url.clone())
                    .headers(headers)
                    .body(body.to_owned())
                    .send()
                    .await
            }
            None => {
                self.dispatcher
                    .http_client
                    .request(self.method.clone(), self.url.clone())
                    .headers(headers)
                    .send()
                    .await
            }
        };
        if self.controller.is_aborted {
            return SseAction::Abort;
        }
        if !response.is_ok() {
            on_event(
                StreamEvent::Error(ArriError::new(0, "".to_string(), None, None)),
                self.controller,
            );
            if self.controller.is_aborted {
                return SseAction::Abort;
            }
            return SseAction::Retry;
        }
        let mut ok_response = response.unwrap();
        let content_type = ContentType::from_serial_value(
            ok_response
                .headers()
                .get("Content-Type")
                .unwrap_or(&HeaderValue::from_str("application/json").unwrap())
                .to_str()
                .unwrap_or("application/json")
                .to_owned(),
        )
        .unwrap_or(ContentType::Json);
        // TODO: use this header to setup a heartbeat watcher
        // that will reset whenever a message is received
        let _heartbeat_ms = match ok_response.headers().get("heartbeat-interval") {
            Some(val) => from_str::<u64>(val.to_str().unwrap_or("0")).unwrap_or(0),
            None => 0,
        };

        on_event(StreamEvent::Start, self.controller);
        if self.controller.is_aborted {
            return SseAction::Abort;
        }
        let status = ok_response.status().as_u16();
        if status < 200 || status >= 300 {
            let err = error_message_from_response(ok_response).await;
            on_event(StreamEvent::Error(err), self.controller);
            if self.controller.is_aborted {
                return SseAction::Abort;
            }
            return SseAction::Retry;
        }
        self.retry_count = 0;
        let mut pending_data: String = "".to_string();
        while let Some(chunk) = ok_response.chunk().await.unwrap_or_default() {
            if self.controller.is_aborted {
                return SseAction::Abort;
            }
            let chunk_vec = chunk.to_vec();
            let data = std::str::from_utf8(chunk_vec.as_slice());
            match data {
                Ok(text) => {
                    if !text.ends_with("\n\n") {
                        pending_data.push_str(text);
                        continue;
                    }
                    let msg_text = format!("{}{}", pending_data, text);
                    let (messages, left_over) = sse_message_list_from_string(msg_text, false);
                    pending_data = left_over;
                    for message in messages {
                        let event = message.event.unwrap_or("".to_string());
                        match event.as_str() {
                            "end" | "done" => {
                                on_event(StreamEvent::End, self.controller);
                                return SseAction::Abort;
                            }
                            "message" | "data" | "" => {
                                on_event(
                                    StreamEvent::Data((
                                        content_type.clone(),
                                        message.data.as_bytes().to_vec(),
                                    )),
                                    self.controller,
                                );
                                if self.controller.is_aborted {
                                    return SseAction::Abort;
                                }
                            }
                            _ => {}
                        }
                    }
                }
                _ => {}
            }
        }
        if self.controller.is_aborted {
            return SseAction::Abort;
        }
        return SseAction::Retry;
    }
}

#[async_trait]
impl<'a, 'b> EventStream for EventSource<'a, 'b> {
    async fn listen(&mut self, mut on_event: &mut OnEventClosure<'_, (ContentType, Vec<u8>)>) {
        loop {
            match &self.max_retry_count {
                Some(max_retry_count) => {
                    if &self.retry_count > max_retry_count {
                        return;
                    }
                }
                None => {}
            }
            if self.retry_count > 5 {
                if self.retry_interval == 0 {
                    self.retry_interval = 2;
                } else {
                    self.retry_interval = if self.retry_interval * 2 > self.max_retry_interval {
                        self.max_retry_interval
                    } else {
                        self.retry_interval * 2
                    };
                }
            }
            if self.retry_interval > 0 {
                wait(Duration::from_millis(self.retry_interval.clone()));
            }
            let result = self.send_request(&mut on_event).await;
            match result {
                SseAction::Retry => {
                    self.retry_count += 1;
                }
                SseAction::Abort => {
                    return;
                }
            }
        }
    }
}

fn sse_message_list_from_string(input: String, debug: bool) -> (Vec<SseMessage>, String) {
    let mut messages: Vec<SseMessage> = Vec::new();
    let mut id: Option<String> = None;
    let mut event: Option<String> = None;
    let mut data: Option<String> = None;
    let mut retry: Option<i32> = None;
    let mut line = "".to_string();
    let mut pending_index = 0;
    let mut previous_char: Option<char> = None;
    let mut ignore_next_newline = false;
    let chars = input.chars();
    let mut peekable = chars.peekable().enumerate();
    while let Some((index, char)) = peekable.next() {
        match char {
            '\r' => {
                let is_message_end = previous_char == Some('\n') || previous_char == Some('\r');
                ignore_next_newline = true;
                let parsed_result = parse_sse_line(line.as_str(), debug.clone());
                match parsed_result {
                    ParseSseLineResult::Id(id_val) => {
                        id = Some(id_val);
                    }
                    ParseSseLineResult::Event(event_val) => {
                        event = Some(event_val);
                    }
                    ParseSseLineResult::Data(data_val) => {
                        data = Some(data_val);
                    }
                    ParseSseLineResult::Retry(retry_val) => {
                        retry = Some(retry_val);
                    }
                    ParseSseLineResult::Nothing => {}
                }
                line = "".to_string();
                if is_message_end {
                    if data.is_some() {
                        messages.push(SseMessage {
                            id: id.clone(),
                            data: data.unwrap().clone(),
                            event: event.clone(),
                            retry: retry.clone(),
                        });
                    };
                    id = None;
                    data = None;
                    event = None;
                    retry = None;
                    let next_char = peekable.next();
                    pending_index = match next_char {
                        Some((next_char_index, next_char_value)) => match next_char_value {
                            '\n' => next_char_index + 1,
                            '\r' => next_char_index + 1,
                            _ => {
                                line.push(next_char_value);
                                next_char_index
                            }
                        },
                        _ => index,
                    };
                }
            }
            '\n' => 'newline: {
                if ignore_next_newline {
                    ignore_next_newline = false;
                    break 'newline;
                }
                let is_end = previous_char == Some('\n');
                let parsed_result = parse_sse_line(line.as_str(), debug.clone());
                match parsed_result {
                    ParseSseLineResult::Id(id_val) => {
                        id = Some(id_val);
                    }
                    ParseSseLineResult::Event(event_val) => {
                        event = Some(event_val);
                    }
                    ParseSseLineResult::Data(data_val) => {
                        data = Some(data_val);
                    }
                    ParseSseLineResult::Retry(retry_val) => {
                        retry = Some(retry_val);
                    }
                    ParseSseLineResult::Nothing => {}
                };
                line = "".to_string();
                if is_end {
                    if data.is_some() {
                        messages.push(SseMessage {
                            id: id.clone(),
                            data: data.unwrap().clone(),
                            event: event.clone(),
                            retry: retry.clone(),
                        });
                    };
                    id = None;
                    data = None;
                    event = None;
                    retry = None;
                    pending_index = index + 1;
                }
            }
            _ => {
                ignore_next_newline = false;
                line.push(char);
            }
        }
        previous_char = Some(char);
    }

    return (messages, input[pending_index..].to_string());
}

fn parse_sse_line(input: &str, debug: bool) -> ParseSseLineResult {
    if debug {
        println!("PARSING_LINE: {:?}", input);
    }
    if input.starts_with("data:") {
        return ParseSseLineResult::Data(input[5..].trim().to_string());
    };
    if input.starts_with("id:") {
        return ParseSseLineResult::Id(input[3..].trim().to_string());
    };
    if input.starts_with("event:") {
        return ParseSseLineResult::Event(input[6..].trim().to_string());
    };
    if input.starts_with("retry:") {
        let val = input[6..].trim().parse::<i32>();
        match val {
            Ok(val) => {
                return ParseSseLineResult::Retry(val);
            }
            _ => {}
        };
    };
    ParseSseLineResult::Nothing
}

#[derive(Debug, Clone, PartialEq)]
enum ParseSseLineResult {
    Id(String),
    Event(String),
    Data(String),
    Retry(i32),
    Nothing,
}

#[derive(Debug, Clone, PartialEq)]
pub struct SseMessage {
    id: Option<String>,
    event: Option<String>,
    data: String,
    retry: Option<i32>,
}

impl SseMessage {
    fn new() -> Self {
        Self {
            id: None,
            event: None,
            data: String::from(""),
            retry: None,
        }
    }

    fn multiple_from_string(input: String) -> (Vec<Self>, String) {
        sse_message_list_from_string(input, false)
    }
}

#[cfg(test)]
mod parsing_and_serialization_tests {
    use crate::dispatcher_http::{sse_message_list_from_string, SseEvent, SseMessage};
    fn get_test_data() -> (Vec<String>, Vec<SseMessage>, String) {
        (
            vec![
                "id: 1".to_string(),
                "data: hello world".to_string(),
                "".to_string(),
                "data: hello world".to_string(),
                "retry: 100".to_string(),
                "".to_string(),
                "id: 4".to_string(),
            ],
            vec![
                SseMessage {
                    id: Some("1".to_string()),
                    data: "hello world".to_string(),
                    event: None,
                    retry: None,
                },
                SseMessage {
                    id: None,
                    data: "hello world".to_string(),
                    event: None,
                    retry: Some(100),
                },
            ],
            "id: 4".to_string(),
        )
    }

    #[test]
    fn sse_message_list_from_string_lf_test() {
        let (lines, expected_msgs, expected_leftover) = get_test_data();
        let input = lines.join("\n");
        let (messages, leftover) = sse_message_list_from_string(input, false);
        assert_eq!(messages, expected_msgs);
        assert_eq!(leftover, expected_leftover);
    }
    #[test]
    fn sse_message_list_from_string_crlf_test() {
        let (lines, expected_msgs, expected_leftover) = get_test_data();
        let input = lines.join("\r\n");
        let (messages, leftover) = sse_message_list_from_string(input, false);
        assert_eq!(messages, expected_msgs);
        assert_eq!(leftover, expected_leftover);
    }
    #[test]
    fn sse_message_list_from_string_cr_test() {
        let (lines, expected_msgs, expected_leftover) = get_test_data();
        let input = lines.join("\r");
        let (messages, leftover) = sse_message_list_from_string(input, false);
        assert_eq!(messages, expected_msgs);
        assert_eq!(leftover, expected_leftover);
    }

    fn get_invalid_msg_data() -> (Vec<String>, Vec<SseMessage>, String) {
        (
            vec![
                "".to_string(),
                ":".to_string(),
                "hello world".to_string(),
                "hi".to_string(),
                "hi".to_string(),
                "".to_string(),
                "data: hello world".to_string(),
                "".to_string(),
                ":".to_string(),
                ":".to_string(),
                "".to_string(),
                "data: hello world".to_string(),
                "".to_string(),
                "".to_string(),
                "event: data".to_string(),
            ],
            vec![
                SseMessage {
                    id: None,
                    event: None,
                    data: "hello world".to_string(),
                    retry: None,
                },
                SseMessage {
                    id: None,
                    event: None,
                    data: "hello world".to_string(),
                    retry: None,
                },
            ],
            "event: data".to_string(),
        )
    }

    #[test]
    fn skip_invalid_lines_test() {
        let (lines, expected_messages, expected_leftover) = get_invalid_msg_data();
        let delimiters = vec!["\n", "\r\n", "\r"];
        for delimiter in delimiters {
            let (messages, leftover) = sse_message_list_from_string(lines.join(delimiter), false);
            assert_eq!(messages, expected_messages);
            assert_eq!(leftover, expected_leftover);
        }
    }

    #[test]
    fn parsing_different_message_types() {
        let lines = vec![
            "data: hello world".to_string(),
            "".to_string(),
            "event: heartbeat  ".to_string(),
            "data:  ".to_string(),
            "".to_string(),
            "".to_string(),
            "id: foo".to_string(),
            "event: end".to_string(),
            "data: stream has ended".to_string(),
            "retry: 15".to_string(),
            "".to_string(),
            "id: foo".to_string(),
        ];
        let expected_messages = vec![
            SseMessage {
                id: None,
                data: "hello world".to_string(),
                event: None,
                retry: None,
            },
            SseMessage {
                id: None,
                data: "".to_string(),
                event: Some("heartbeat".to_string()),
                retry: None,
            },
            SseMessage {
                id: Some("foo".to_string()),
                event: Some("end".to_string()),
                data: "stream has ended".to_string(),
                retry: Some(15),
            },
        ];
        let expected_leftovers = "id: foo".to_string();
        let (messages, leftovers) = SseMessage::multiple_from_string(lines.join("\n"));
        assert_eq!(messages, expected_messages);
        assert_eq!(leftovers, expected_leftovers);
    }
}
