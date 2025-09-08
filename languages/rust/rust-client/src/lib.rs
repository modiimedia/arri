pub mod dispatcher;
pub mod dispatcher_http;
pub mod model;
pub mod rpc_call;
pub mod utils;
pub use arri_core;
use arri_core::headers::SharableHeaderMap;
pub use chrono::{self};
pub use reqwest::{self, StatusCode};
pub use serde_json::{self};
use std::sync::{Arc, RwLock};

#[derive(Clone)]
pub struct ArriClientConfig {
    pub http_client: reqwest::Client,
    pub base_url: String,
    pub headers: SharableHeaderMap,
}

#[derive(Clone)]
pub struct InternalArriClientConfig {
    pub http_client: reqwest::Client,
    pub base_url: String,
    pub headers: Arc<RwLock<SharableHeaderMap>>,
}

pub trait ArriClientService {
    fn create(config: ArriClientConfig) -> Self;
    fn update_headers(&self, headers: SharableHeaderMap);
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

// pub struct ArriRequestOptions<'a> {
//     pub http_client: &'a reqwest::Client,
//     pub url: String,
//     pub method: reqwest::Method,
//     pub headers: Arc<RwLock<HashMap<&'static str, String>>>,
//     pub client_version: String,
// }

// pub struct ArriParsedRequestOptions<'a> {
//     pub http_client: &'a reqwest::Client,
//     pub url: String,
//     pub method: reqwest::Method,
//     pub headers: Arc<RwLock<HashMap<&'static str, String>>>,
//     pub client_version: String,
// }

// trait ArriRequestErrorMethods {
//     fn from_response_data(status: u16, body: String) -> Self;
// }

// impl ArriRequestErrorMethods for ArriError {
//     fn from_response_data(status: u16, body: String) -> Self {
//         let mut err = Self::from_json_string(body.to_owned());
//         if err.code == 0 {
//             err.code = status.to_owned();
//         }
//         if err.message.is_empty() {
//             err.message = status_message_from_status_code(err.code);
//         }
//         err
//     }
// }

// pub async fn arri_request<'a>(
//     opts: ArriRequestOptions<'a>,
//     params: Option<impl model::ArriModel>,
// ) -> Result<reqwest::Response, ArriError> {
//     let response: Result<reqwest::Response, reqwest::Error>;
//     let mut headers: HashMap<&str, String> = HashMap::new();
//     {
//         let unlocked = opts.headers.read().unwrap();
//         for (key, val) in unlocked.iter() {
//             headers.insert(*key, val.clone().to_owned());
//         }
//     }
//     match headers.get("Accept") {
//         Some(_) => {}
//         None => {
//             headers.insert("Accept", "application/json".to_string());
//         }
//     }
//     if !opts.client_version.is_empty() {
//         headers.insert("client-version", opts.client_version);
//     }
//     if opts.method != reqwest::Method::GET && opts.method != reqwest::Method::HEAD {
//         headers.insert("Content-Type", "application/json".to_string());
//     }
//     let mut final_headers = reqwest::header::HeaderMap::new();
//     for (key, value) in headers {
//         match reqwest::header::HeaderValue::from_str(value.as_str()) {
//             Ok(header_val) => {
//                 final_headers.insert(key, header_val);
//             }
//             Err(_) => {
//                 println!(
//                     "WARNING: Received invalid header value. key: \"{}\", value: \"{}\"",
//                     key, value,
//                 );
//             }
//         }
//     }
//     match opts.method {
//         reqwest::Method::GET => {
//             let mut final_url = opts.url.clone();
//             match params {
//                 Some(val) => final_url = format!("{final_url}?{}", val.to_query_params_string()),
//                 None => {}
//             }
//             response = opts
//                 .http_client
//                 .get(final_url)
//                 .headers(final_headers)
//                 .send()
//                 .await;
//         }
//         reqwest::Method::POST => {
//             let builder = opts
//                 .http_client
//                 .post(opts.url.clone())
//                 .headers(final_headers);
//             match params {
//                 Some(val) => {
//                     response = builder.body(val.to_json_string()).send().await;
//                 }
//                 None => {
//                     response = builder.send().await;
//                 }
//             }
//         }
//         reqwest::Method::PUT => {
//             let builder = opts
//                 .http_client
//                 .put(opts.url.clone())
//                 .headers(final_headers);
//             match params {
//                 Some(val) => {
//                     response = builder.body(val.to_json_string()).send().await;
//                 }
//                 None => {
//                     response = builder.send().await;
//                 }
//             }
//         }
//         reqwest::Method::PATCH => {
//             let builder = opts
//                 .http_client
//                 .patch(opts.url.clone())
//                 .headers(final_headers);
//             match params {
//                 Some(val) => {
//                     response = builder.body(val.to_json_string()).send().await;
//                 }
//                 None => {
//                     response = builder.send().await;
//                 }
//             }
//         }
//         reqwest::Method::DELETE => {
//             let builder = opts
//                 .http_client
//                 .delete(opts.url.clone())
//                 .headers(final_headers);
//             match params {
//                 Some(val) => {
//                     response = builder.body(val.to_json_string()).send().await;
//                 }
//                 None => {
//                     response = builder.send().await;
//                 }
//             }
//         }
//         _ => panic!("Unsupported method"),
//     };
//     match response {
//         Ok(res) => return Ok(res),
//         Err(err) => {
//             return Err(ArriError {
//                 code: err.status().unwrap_or(StatusCode::default()).as_u16(),
//                 message: format!("Error requesting \"{}\"", opts.url),
//                 stack: None,
//                 data: None,
//             })
//         }
//     }
// }

// pub async fn parsed_arri_request<'a, TResponse>(
//     opts: ArriParsedRequestOptions<'a>,
//     params: Option<impl ArriModel>,
//     parser: fn(body: String) -> TResponse,
// ) -> Result<TResponse, ArriError> {
//     let result = arri_request(
//         ArriRequestOptions {
//             method: opts.method,
//             url: opts.url,
//             http_client: opts.http_client,
//             headers: opts.headers,
//             client_version: opts.client_version,
//         },
//         params,
//     )
//     .await;
//     if result.is_err() {
//         return Err(result.unwrap_err());
//     }
//     let response = result.unwrap();
//     let status = response.status().as_u16();
//     let body: Result<String, reqwest::Error> = response.text().await;
//     if status >= 300 || status < 200 {
//         return Err(ArriError::from_response_data(
//             status,
//             body.unwrap_or_default(),
//         ));
//     }
//     match body {
//         Ok(text) => return Ok(parser(text)),
//         Err(err) => {
//             return Err(ArriError {
//                 code: status,
//                 message: "Expected server to return plaintext".to_string(),
//                 stack: None,
//                 data: Some(serde_json::Value::String(err.to_string())),
//             })
//         }
//     }
// }
