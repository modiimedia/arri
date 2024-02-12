use reqwest::{self, StatusCode};
use serde_json::json;
use std::{
    collections::{hash_map, BTreeMap, HashMap},
    iter::Map,
    str::FromStr,
};

fn main() {
    println!("Hello, world!");
}

pub struct ArriRequestOptions {
    pub client: reqwest::Client,
    pub url: String,
    pub method: reqwest::Method,
    pub params: Option<serde_json::Value>,
    pub headers: reqwest::header::HeaderMap,
}

pub struct ArriParsedRequestOptions<TParams: ToJson> {
    pub client: reqwest::Client,
    pub url: String,
    pub method: reqwest::Method,
    pub params: Option<TParams>,
    pub headers: reqwest::header::HeaderMap,
}

#[derive(Debug)]
pub struct ArriRequestError {
    pub status_code: u16,
    pub status_message: String,
    pub stack: String,
    pub data: serde_json::Value,
}

pub async fn arri_request(opts: ArriRequestOptions) -> Result<reqwest::Response, ArriRequestError> {
    let payload = &opts.params;
    let response: Result<reqwest::Response, reqwest::Error>;
    match opts.method {
        reqwest::Method::GET => {
            let builder = opts.client.get(opts.url.clone()).headers(opts.headers);
            match payload {
                Some(val) => {
                    response = builder.form(val).send().await;
                }
                None => {
                    response = builder.send().await;
                }
            }
        }
        reqwest::Method::POST => {
            let builder = opts.client.post(opts.url.clone()).headers(opts.headers);
            match payload {
                Some(val) => {
                    response = builder.body(val.to_string()).send().await;
                }
                None => {
                    response = builder.send().await;
                }
            }
        }
        reqwest::Method::PUT => {
            let builder = opts.client.put(opts.url.clone()).headers(opts.headers);
            match payload {
                Some(val) => {
                    response = builder.body(val.to_string()).send().await;
                }
                None => {
                    response = builder.send().await;
                }
            }
        }
        reqwest::Method::PATCH => {
            let builder = opts.client.patch(opts.url.clone()).headers(opts.headers);
            match payload {
                Some(val) => {
                    response = builder.body(val.to_string()).send().await;
                }
                None => {
                    response = builder.send().await;
                }
            }
        }
        reqwest::Method::DELETE => {
            let builder = opts.client.delete(opts.url.clone()).headers(opts.headers);
            match payload {
                Some(val) => {
                    response = builder.body(val.to_string()).send().await;
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
                stack: String::from(""),
                data: json!(err.to_string()),
            })
        }
    }
}

pub trait ToJson {
    fn to_json(&self) -> serde_json::Value;
}

pub async fn parsed_arri_request<TResponse: ToJson, TParams: ToJson>(
    opts: ArriParsedRequestOptions<TParams>,
    parser: fn(body: String) -> TResponse,
) -> Result<TResponse, ArriRequestError> {
    let result = arri_request(ArriRequestOptions {
        method: opts.method,
        url: opts.url,
        params: match opts.params {
            Some(val) => Some(val.to_json()),
            None => None,
        },
        client: opts.client,
        headers: opts.headers,
    })
    .await;
    if result.is_err() {
        return Err(result.unwrap_err());
    }
    let response = result.unwrap();
    let status = response.status().as_u16();
    let body = response.text().await;
    match body {
        Ok(text) => return Ok(parser(text)),
        Err(err) => {
            return Err(ArriRequestError {
                status_code: status,
                status_message: "Error parsing response from server".to_string(),
                stack: "".to_string(),
                data: json!(err.to_string()),
            })
        }
    }
}
