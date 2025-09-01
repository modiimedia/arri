use std::str::FromStr;

use arri_core::{
    errors::ArriError,
    message::{ContentType, Message},
};
use reqwest::{header::HeaderValue, StatusCode};
use serde_json::json;

use crate::dispatcher::TransportDispatcher;

pub struct HttpDispatcher {
    reqwest_client: reqwest::Client,
    options: HttpDispatcherOptions,
}

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
            reqwest_client: client.unwrap_or(reqwest::Client::new()),
            options: options,
        }
    }
}

impl TransportDispatcher for HttpDispatcher {
    fn transport_id(&self) -> String {
        "http".to_string()
    }

    async fn dispatch_rpc<
        TIn: crate::model::ArriClientModel + std::marker::Send + std::marker::Sync + std::marker::Copy,
        TOut: crate::model::ArriClientModel + std::marker::Send + std::marker::Sync + std::marker::Copy,
    >(
        &self,
        call: crate::rpc_call::RpcCall<TIn>,
    ) -> Result<TOut, arri_core::errors::ArriError> {
        let method = match call.method.unwrap_or(arri_core::message::HttpMethod::Post) {
            arri_core::message::HttpMethod::Get => reqwest::Method::GET,
            arri_core::message::HttpMethod::Post => reqwest::Method::POST,
            arri_core::message::HttpMethod::Put => reqwest::Method::PUT,
            arri_core::message::HttpMethod::Patch => reqwest::Method::PATCH,
            arri_core::message::HttpMethod::Delete => reqwest::Method::DELETE,
        };
        let url_string = if method == reqwest::Method::GET && call.data.is_some() {
            format!(
                "{}{}?{}",
                &self.options.base_url,
                call.path,
                &call.data.unwrap().to_query_params_string()
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
        let body = match call.data {
            Some(data) => match &content_type {
                ContentType::Json => data.to_json_string().into_bytes(),
            },
            None => Vec::new(),
        };
        let req = self
            .reqwest_client
            .request(method, url.unwrap())
            .headers(headers)
            .body(body);
        let result = self.reqwest_client.execute(req).await;
        if result.is_err() {
            todo!()
        }
        let result = result.unwrap();
        let status = result.status().as_u16();
        if status < 200 || status >= 299 {
            todo!("Return error")
        }
        let json_text = result.text().await;
        if json_text.is_err() {
            return Err(ArriError::new(
                0,
                "expected server to respond with json string".to_string(),
                Some(json!(json_text.unwrap_err().to_string())),
                None,
            ));
        }
        let json_text = json_text.unwrap();
        Ok(TOut::from_json_string(json_text))
    }
}

fn error_message_from_response(res: &reqwest::Response) -> ArriError {
    let headers = res.headers();
    let content_type = ContentType::from_serial_value(
        headers
            .get("content-type")
            .unwrap_or(HeaderValue::from_str("application/json").unwrap())
            .to_str()
            .unwrap_or("application/json"),
    )
    .unwrap_or(ContentType::Json);
    let req_id = headers
        .get("req-id")
        .unwrap_or(HeaderValue::from_str("").unwrap())
        .to_str()
        .unwrap_or("");
    let err_code: u32 = headers
        .get("err-code")
        .unwrap_or(HeaderValue::from_str("0").unwrap())
        .to_str()
        .unwrap_or("0")
        .parse()
        .unwrap_or(0);
    let err_msg = headers
        .get("err-msg")
        .unwrap_or(HeaderValue::from_str("").unwrap())
        .to_str()
        .unwrap_or("");
    return ArriError::new(err_code, err_msg, data, trace);
}
