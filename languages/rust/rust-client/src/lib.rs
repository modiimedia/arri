pub mod sse;
pub mod utils;
pub use chrono::{self};
pub use reqwest::{self, StatusCode};
pub use serde_json::{self};
use std::{
    collections::HashMap,
    sync::{Arc, RwLock},
};

#[derive(Clone)]
pub struct ArriClientConfig {
    pub http_client: reqwest::Client,
    pub base_url: String,
    pub headers: HashMap<&'static str, String>,
}

#[derive(Clone)]
pub struct InternalArriClientConfig {
    pub http_client: reqwest::Client,
    pub base_url: String,
    pub headers: Arc<RwLock<HashMap<&'static str, String>>>,
}

pub trait ArriClientService {
    fn create(config: ArriClientConfig) -> Self;
    fn update_headers(&self, headers: HashMap<&'static str, String>);
}

impl InternalArriClientConfig {
    pub fn from(config: ArriClientConfig) -> Self {
        Self {
            http_client: config.http_client,
            base_url: config.base_url,
            headers: Arc::new(RwLock::new(config.headers)),
        }
    }
}

pub struct ArriRequestOptions<'a> {
    pub http_client: &'a reqwest::Client,
    pub url: String,
    pub method: reqwest::Method,
    pub headers: Arc<RwLock<HashMap<&'static str, String>>>,
    pub client_version: String,
}

pub struct ArriParsedRequestOptions<'a> {
    pub http_client: &'a reqwest::Client,
    pub url: String,
    pub method: reqwest::Method,
    pub headers: Arc<RwLock<HashMap<&'static str, String>>>,
    pub client_version: String,
}

#[derive(Debug)]
pub struct ArriError {
    pub code: u16,
    pub message: String,
    pub stack: Option<String>,
    pub data: Option<serde_json::Value>,
}

trait ArriRequestErrorMethods {
    fn from_response_data(status: u16, body: String) -> Self;
}

impl ArriRequestErrorMethods for ArriError {
    fn from_response_data(status: u16, body: String) -> Self {
        let mut err = Self::from_json_string(body.to_owned());
        if err.code == 0 {
            err.code = status.to_owned();
        }
        if err.message.is_empty() {
            err.message = status_message_from_status_code(err.code);
        }
        err
    }
}

impl ArriModel for ArriError {
    fn new() -> Self {
        Self {
            code: 0,
            message: "".to_string(),
            stack: None,
            data: None,
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let code = match val.get("code") {
                    Some(serde_json::Value::Number(status_code_val)) => {
                        u16::try_from(status_code_val.to_owned().as_u64().unwrap_or_default())
                            .unwrap_or(0)
                    }
                    _ => 0,
                };
                let message = match val.get("message") {
                    Some(serde_json::Value::String(status_message_val)) => {
                        status_message_val.to_owned()
                    }
                    _ => "Unknown error".to_string(),
                };
                let stack = match val.get("stack") {
                    Some(serde_json::Value::String(stack_val)) => Some(stack_val.to_owned()),
                    _ => None,
                };
                let data = match val.get("data") {
                    Some(data_val) => Some(data_val.to_owned()),
                    _ => None,
                };

                Self {
                    code,
                    message,
                    stack,
                    data,
                }
            }
            _ => Self::new(),
        }
    }

    fn from_json_string(input: String) -> Self {
        match serde_json::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }

    fn to_json_string(&self) -> String {
        let mut result = "{".to_string();
        result.push_str("\"code\":");
        result.push_str(format!("{}", &self.code).as_str());
        result.push_str(",\"message\":");
        result.push_str(
            format!(
                "\"{}\"",
                &self.message.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        match &self.stack {
            Some(val) => {
                result.push_str(",\"stack\":");
                result.push_str(
                    format!("\"{}\"", val.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
            }
            _ => {}
        }
        match &self.data {
            Some(val) => {
                result.push_str(",\"data\":");
                result.push_str(
                    serde_json::to_string(val)
                        .unwrap_or("null".to_string())
                        .as_str(),
                )
            }
            _ => {}
        }
        result
    }

    fn to_query_params_string(&self) -> String {
        let mut query_parts: Vec<String> = Vec::new();
        query_parts.push(format!("code={}", &self.code));
        query_parts.push(format!("message={}", &self.message));
        match &self.stack {
            Some(stack) => {
                query_parts.push(format!("stack={}", stack));
            }
            _ => {}
        }
        match &self.data {
            Some(data) => {
                query_parts.push(format!(
                    "data={}",
                    serde_json::to_string(data).unwrap_or("null".to_string())
                ));
            }
            _ => {}
        }
        query_parts.join("&")
    }
}

pub async fn arri_request<'a>(
    opts: ArriRequestOptions<'a>,
    params: Option<impl ArriModel>,
) -> Result<reqwest::Response, ArriError> {
    let response: Result<reqwest::Response, reqwest::Error>;
    let mut headers: HashMap<&str, String> = HashMap::new();
    {
        let unlocked = opts.headers.read().unwrap();
        for (key, val) in unlocked.iter() {
            headers.insert(*key, val.clone().to_owned());
        }
    }
    match headers.get("Accept") {
        Some(_) => {}
        None => {
            headers.insert("Accept", "application/json".to_string());
        }
    }
    if !opts.client_version.is_empty() {
        headers.insert("client-version", opts.client_version);
    }
    if opts.method != reqwest::Method::GET && opts.method != reqwest::Method::HEAD {
        headers.insert("Content-Type", "application/json".to_string());
    }
    let mut final_headers = reqwest::header::HeaderMap::new();
    for (key, value) in headers {
        match reqwest::header::HeaderValue::from_str(value.as_str()) {
            Ok(header_val) => {
                final_headers.insert(key, header_val);
            }
            Err(_) => {
                println!(
                    "WARNING: Received invalid header value. key: \"{}\", value: \"{}\"",
                    key, value,
                );
            }
        }
    }
    match opts.method {
        reqwest::Method::GET => {
            let mut final_url = opts.url.clone();
            match params {
                Some(val) => final_url = format!("{final_url}?{}", val.to_query_params_string()),
                None => {}
            }
            response = opts
                .http_client
                .get(final_url)
                .headers(final_headers)
                .send()
                .await;
        }
        reqwest::Method::POST => {
            let builder = opts
                .http_client
                .post(opts.url.clone())
                .headers(final_headers);
            match params {
                Some(val) => {
                    response = builder.body(val.to_json_string()).send().await;
                }
                None => {
                    response = builder.send().await;
                }
            }
        }
        reqwest::Method::PUT => {
            let builder = opts
                .http_client
                .put(opts.url.clone())
                .headers(final_headers);
            match params {
                Some(val) => {
                    response = builder.body(val.to_json_string()).send().await;
                }
                None => {
                    response = builder.send().await;
                }
            }
        }
        reqwest::Method::PATCH => {
            let builder = opts
                .http_client
                .patch(opts.url.clone())
                .headers(final_headers);
            match params {
                Some(val) => {
                    response = builder.body(val.to_json_string()).send().await;
                }
                None => {
                    response = builder.send().await;
                }
            }
        }
        reqwest::Method::DELETE => {
            let builder = opts
                .http_client
                .delete(opts.url.clone())
                .headers(final_headers);
            match params {
                Some(val) => {
                    response = builder.body(val.to_json_string()).send().await;
                }
                None => {
                    response = builder.send().await;
                }
            }
        }
        _ => panic!("Unsupported method"),
    };
    match response {
        Ok(res) => return Ok(res),
        Err(err) => {
            return Err(ArriError {
                code: err.status().unwrap_or(StatusCode::default()).as_u16(),
                message: format!("Error requesting \"{}\"", opts.url),
                stack: None,
                data: None,
            })
        }
    }
}

pub trait ArriModel {
    fn new() -> Self;
    fn from_json(input: serde_json::Value) -> Self;
    fn from_json_string(input: String) -> Self;
    fn to_json_string(&self) -> String;
    fn to_query_params_string(&self) -> String;
}

pub trait ArriEnum {
    fn default() -> Self;
    fn from_string(input: String) -> Self;
    fn serial_value(&self) -> String;
}

#[derive(Debug, Clone)]
pub struct EmptyArriModel {}
impl ArriModel for EmptyArriModel {
    fn new() -> Self {
        Self {}
    }

    fn from_json(_: serde_json::Value) -> Self {
        Self {}
    }

    fn from_json_string(_: String) -> Self {
        Self {}
    }

    fn to_json_string(&self) -> String {
        "{}".to_string()
    }

    fn to_query_params_string(&self) -> String {
        "".to_string()
    }
}
pub trait ArriService {
    fn new() -> Self;
}

pub async fn parsed_arri_request<'a, TResponse>(
    opts: ArriParsedRequestOptions<'a>,
    params: Option<impl ArriModel>,
    parser: fn(body: String) -> TResponse,
) -> Result<TResponse, ArriError> {
    let result = arri_request(
        ArriRequestOptions {
            method: opts.method,
            url: opts.url,
            http_client: opts.http_client,
            headers: opts.headers,
            client_version: opts.client_version,
        },
        params,
    )
    .await;
    if result.is_err() {
        return Err(result.unwrap_err());
    }
    let response = result.unwrap();
    let status = response.status().as_u16();
    let body: Result<String, reqwest::Error> = response.text().await;
    if status >= 300 || status < 200 {
        return Err(ArriError::from_response_data(
            status,
            body.unwrap_or_default(),
        ));
    }
    match body {
        Ok(text) => return Ok(parser(text)),
        Err(err) => {
            return Err(ArriError {
                code: status,
                message: "Expected server to return plaintext".to_string(),
                stack: None,
                data: Some(serde_json::Value::String(err.to_string())),
            })
        }
    }
}

fn status_message_from_status_code(status_code: u16) -> String {
    match status_code {
        100 => String::from("Continue"),
        101 => String::from("Switching Protocols"),
        102 => String::from("Processing"),
        103 => String::from("Early Hints"),
        200 => String::from("OK"),
        201 => String::from("Created"),
        202 => String::from("Accepted"),
        203 => String::from("Non-Authoritative Information"),
        204 => String::from("No Content"),
        205 => String::from("Reset Content"),
        206 => String::from("Partial Content"),
        207 => String::from("Multi-Status"),
        208 => String::from("Already Reported"),
        226 => String::from("IM Used"),
        300 => String::from("Multiple Choices"),
        301 => String::from("Moved Permanently"),
        302 => String::from("Found"),
        303 => String::from("See Other"),
        304 => String::from("Not Modified"),
        305 => String::from("Use Proxy"),
        306 => String::from("unused"),
        307 => String::from("Temporary Redirect"),
        308 => String::from("Permanent Redirect"),
        400 => String::from("Bad Request"),
        401 => String::from("Unauthorized"),
        402 => String::from("Payment Required"),
        403 => String::from("Forbidden"),
        404 => String::from("Not Found"),
        405 => String::from("Method Not Allowed"),
        406 => String::from("Not Acceptable"),
        407 => String::from("Proxy Authentication Required"),
        408 => String::from("Request Timeout"),
        409 => String::from("Conflict"),
        410 => String::from("Gone"),
        411 => String::from("Length Required"),
        412 => String::from("Precondition Failed"),
        413 => String::from("Payload Too Large"),
        414 => String::from("URI Too Long"),
        415 => String::from("Unsupported Media Type"),
        416 => String::from("Range Not Satisfiable"),
        417 => String::from("Expectation Failed"),
        418 => String::from("I'm a teapot"),
        421 => String::from("Misdirected Request"),
        422 => String::from("Unprocessable Content"),
        423 => String::from("Locked"),
        424 => String::from("Failed Dependency"),
        425 => String::from("Too Early"),
        426 => String::from("Upgrade Required"),
        428 => String::from("Too Many Requests"),
        431 => String::from("Request Header Fields Too Large"),
        451 => String::from("Unavailable For Legal Reasons"),
        500 => String::from("Internal Server Error"),
        501 => String::from("Not Implemented"),
        502 => String::from("Bad Gateway"),
        503 => String::from("Service Unavailable"),
        504 => String::from("Gateway Timeout"),
        505 => String::from("HTTP Version Not Supported"),
        506 => String::from("Variant Also Negotiates"),
        507 => String::from("Insufficient Storage"),
        508 => String::from("Loop Detected"),
        510 => String::from("Not Extended"),
        511 => String::from("Network Authentication Required"),
        _ => String::from("Unknown Error"),
    }
}
