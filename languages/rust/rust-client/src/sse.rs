#![allow(dead_code)]
use std::{
    collections::HashMap,
    sync::{Arc, RwLock},
    time::{Duration, Instant},
};

use serde_json::from_str;

pub struct ArriParsedSseRequestOptions<'a> {
    pub client: &'a reqwest::Client,
    pub client_version: String,
    pub url: String,
    pub method: reqwest::Method,
    pub headers: Arc<RwLock<HashMap<&'static str, String>>>,
    // Defaults to None
    pub max_retry_count: Option<u64>,
    // Max delay time in ms. defaults to Some(30000).
    pub max_retry_interval: Option<u64>,
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

pub async fn parsed_arri_sse_request<'a, T: ArriModel, OnEvent>(
    options: ArriParsedSseRequestOptions<'a>,
    params: Option<impl ArriModel + Clone + std::marker::Send>,
    on_event: &mut OnEvent,
) where
    T: ArriModel + std::marker::Send + std::marker::Sync,
    OnEvent: FnMut(SseEvent<T>, &mut SseController) + std::marker::Send + std::marker::Sync,
{
    let mut es = EventSource {
        http_client: &options.client,
        url: options.url,
        method: options.method,
        client_version: options.client_version,
        headers: options.headers,
        retry_count: 0,
        retry_interval: 0,
        max_retry_interval: options.max_retry_interval.unwrap_or(30000),
        max_retry_count: options.max_retry_count,
    };
    es.listen(params, on_event).await
}

fn wait(duration: Duration) {
    let start = Instant::now();
    while start.elapsed().as_millis() < duration.as_millis() {
        // keep waiting
    }
}

#[derive(Debug)]
pub struct EventSource<'a> {
    pub http_client: &'a reqwest::Client,
    pub url: String,
    pub method: reqwest::Method,
    pub client_version: String,
    pub headers: Arc<RwLock<HashMap<&'static str, String>>>,
    pub retry_count: u64,
    pub retry_interval: u64,
    pub max_retry_interval: u64,
    pub max_retry_count: Option<u64>,
}

enum SseAction {
    Retry,
    Abort,
}

impl<'a> EventSource<'a> {
    async fn listen<T: ArriModel, OnEvent>(
        &mut self,
        params: Option<impl ArriModel + Clone>,
        on_event: &mut OnEvent,
    ) where
        OnEvent: FnMut(SseEvent<T>, &mut SseController),
    {
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
            let result = self.send_request(params.clone(), on_event).await;
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
    async fn send_request<T: ArriModel, OnEvent>(
        &mut self,
        params: Option<impl ArriModel + Clone>,
        on_event: &mut OnEvent,
    ) -> SseAction
    where
        OnEvent: FnMut(SseEvent<T>, &mut SseController),
    {
        let mut controller = SseController::new();
        let query_string: Option<String>;
        let json_body: Option<String>;
        let mut headers = reqwest::header::HeaderMap::new();
        {
            let unlocked = self.headers.read().unwrap();
            for (key, value) in unlocked.iter() {
                match reqwest::header::HeaderValue::from_str(value) {
                    Ok(header_val) => {
                        headers.insert(key.to_owned(), header_val);
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
        match params.clone() {
            Some(val) => match self.method {
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
            Some(val) => format!("{}?{}", self.url.clone(), val),
            None => self.url.clone(),
        };

        let response = match json_body {
            Some(body) => {
                self.http_client
                    .request(self.method.clone(), url.clone())
                    .headers(headers)
                    .body(body)
                    .send()
                    .await
            }
            None => {
                self.http_client
                    .request(self.method.clone(), url.clone())
                    .headers(headers)
                    .send()
                    .await
            }
        };
        if controller.is_aborted {
            return SseAction::Abort;
        }

        if !response.is_ok() {
            on_event(SseEvent::Error(ArriError::new()), &mut controller);
            if controller.is_aborted {
                return SseAction::Abort;
            }
            return SseAction::Retry;
        }
        let mut ok_response = response.unwrap();

        // TODO: use this header to setup a heartbeat watcher
        // that will reset whenever a message is received
        let _heartbeat_ms = match ok_response.headers().get("heartbeat-interval") {
            Some(val) => from_str::<u64>(val.to_str().unwrap_or("0")).unwrap_or(0),
            None => 0,
        };

        on_event(SseEvent::Open, &mut controller);
        if controller.is_aborted {
            return SseAction::Abort;
        }
        let status = ok_response.status().as_u16();
        if status < 200 || status >= 300 {
            let body = ok_response.text().await.unwrap_or_default();
            on_event(
                SseEvent::Error(ArriError::from_response_data(status, body)),
                &mut controller,
            );
            if controller.is_aborted {
                return SseAction::Abort;
            }
            return SseAction::Retry;
        }
        self.retry_count = 0;
        let mut pending_data: String = "".to_string();
        while let Some(chunk) = ok_response.chunk().await.unwrap_or_default() {
            if controller.is_aborted {
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
                            "done" => {
                                on_event(SseEvent::Close, &mut controller);
                                return SseAction::Abort;
                            }
                            "message" => {
                                on_event(
                                    SseEvent::Message(T::from_json_string(message.data)),
                                    &mut controller,
                                );
                                if controller.is_aborted {
                                    return SseAction::Abort;
                                }
                            }
                            "" => on_event(
                                SseEvent::Message(T::from_json_string(message.data)),
                                &mut controller,
                            ),
                            _ => {}
                        }
                    }
                }
                _ => {}
            }
        }
        if controller.is_aborted {
            return SseAction::Abort;
        }
        return SseAction::Retry;
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

pub trait SeeMessageMethods {
    fn new() -> Self;
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
}

impl<T: ArriModel> ParsedSseMessage<T> {
    fn from_sse_message(message: SseMessage) -> Self {
        Self {
            id: message.id,
            event: message.event,
            data: T::from_json_string(message.data),
            retry: message.retry,
        }
    }
}

#[cfg(test)]
mod parsing_and_serialization_tests {
    use crate::sse::{sse_message_list_from_string, SseMessage};
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
}
