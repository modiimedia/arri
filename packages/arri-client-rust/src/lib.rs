use std::str::FromStr;

pub use async_trait::{self};
pub use chrono::{self};
pub use reqwest::{self, StatusCode};
pub use serde_json::{self};

pub struct ArriClientConfig {
    pub client: reqwest::Client,
    pub base_url: String,
    pub headers: reqwest::header::HeaderMap,
}

pub struct ArriRequestOptions<'a> {
    pub client: &'a reqwest::Client,
    pub url: String,
    pub method: reqwest::Method,
    pub headers: &'a reqwest::header::HeaderMap,
}

pub struct ArriParsedRequestOptions<'a> {
    pub client: &'a reqwest::Client,
    pub url: String,
    pub method: reqwest::Method,
    pub headers: &'a reqwest::header::HeaderMap,
}

#[derive(Debug)]
pub struct ArriRequestError {
    pub status_code: u16,
    pub status_message: String,
    pub stack: Option<String>,
    pub data: Option<serde_json::Value>,
}

trait ArriRequestErrorMethods {
    fn from_response_data(status: u16, body: String) -> Self;
}

impl ArriRequestErrorMethods for ArriRequestError {
    fn from_response_data(status: u16, body: String) -> Self {
        let mut err = Self::from_json_string(body.to_owned());
        if err.status_code == 0 {
            err.status_code = status.to_owned();
        }
        if err.status_message.is_empty() {
            err.status_message = status_message_from_status_code(err.status_code);
        }
        err
    }
}

impl ArriModel for ArriRequestError {
    fn new() -> Self {
        Self {
            status_code: 0,
            status_message: "".to_string(),
            stack: None,
            data: None,
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let status_code = match val.get("statusCode") {
                    Some(serde_json::Value::Number(status_code_val)) => {
                        u16::try_from(status_code_val.to_owned().as_u64().unwrap_or_default())
                            .unwrap_or(0)
                    }
                    _ => 0,
                };
                let status_message = match val.get("statusMessage") {
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
                    status_code,
                    status_message,
                    stack,
                    data,
                }
            }
            _ => Self::new(),
        }
    }

    fn from_json_string(input: String) -> Self {
        match serde_json::Value::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }

    fn to_json_string(&self) -> String {
        todo!()
    }

    fn to_query_params_string(&self) -> String {
        todo!()
    }
}

pub async fn arri_request<'a>(
    opts: ArriRequestOptions<'a>,
    params: Option<impl ArriModel>,
) -> Result<reqwest::Response, ArriRequestError> {
    let response: Result<reqwest::Response, reqwest::Error>;
    match opts.method {
        reqwest::Method::GET => {
            let mut final_url = opts.url.clone();
            match params {
                Some(val) => final_url = format!("{final_url}?${}", val.to_query_params_string()),
                None => {}
            }
            response = opts
                .client
                .get(final_url)
                .headers(opts.headers.to_owned())
                .send()
                .await;
        }
        reqwest::Method::POST => {
            let builder = opts
                .client
                .post(opts.url.clone())
                .headers(opts.headers.to_owned());
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
                .client
                .put(opts.url.clone())
                .headers(opts.headers.to_owned());
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
                .client
                .patch(opts.url.clone())
                .headers(opts.headers.to_owned());
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
                .client
                .delete(opts.url.clone())
                .headers(opts.headers.to_owned());
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
            return Err(ArriRequestError {
                status_code: err.status().unwrap_or(StatusCode::default()).as_u16(),
                status_message: format!("Error requesting \"{}\"", opts.url),
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
        "".to_string()
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
) -> Result<TResponse, ArriRequestError> {
    let result = arri_request(
        ArriRequestOptions {
            method: opts.method,
            url: opts.url,
            client: opts.client,
            headers: opts.headers,
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
        return Err(ArriRequestError::from_response_data(
            status,
            body.unwrap_or_default(),
        ));
    }
    match body {
        Ok(text) => return Ok(parser(text)),
        Err(err) => {
            return Err(ArriRequestError {
                status_code: status,
                status_message: "Expected server to return plaintext".to_string(),
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
