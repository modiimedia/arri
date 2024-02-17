use reqwest::{self, StatusCode};
pub use serde_json::{self};

pub struct ArriRequestOptions {
    pub client: reqwest::Client,
    pub url: String,
    pub method: reqwest::Method,
    pub headers: reqwest::header::HeaderMap,
}

pub struct ArriParsedRequestOptions<TParams: ArriModel> {
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
    pub data: Option<serde_json::Value>,
}

pub async fn arri_request(
    opts: ArriRequestOptions,
    params: Option<&impl ArriModel>,
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
                .headers(opts.headers)
                .send()
                .await;
        }
        reqwest::Method::POST => {
            let builder = opts.client.post(opts.url.clone()).headers(opts.headers);
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
            let builder = opts.client.put(opts.url.clone()).headers(opts.headers);
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
            let builder = opts.client.patch(opts.url.clone()).headers(opts.headers);
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
            let builder = opts.client.delete(opts.url.clone()).headers(opts.headers);
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
                stack: String::from(""),
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

pub async fn parsed_arri_request<TResponse: ArriModel, TParams: ArriModel>(
    opts: ArriParsedRequestOptions<TParams>,
    params: Option<&impl ArriModel>,
    parser: fn(body: String) -> Result<TResponse, ArriRequestError>,
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
    let body = response.text().await;
    match body {
        Ok(text) => return parser(text),
        Err(_err) => {
            return Err(ArriRequestError {
                status_code: status,
                status_message: "Error parsing response from server".to_string(),
                stack: "".to_string(),
                data: Some(serde_json::Value::String(_err.to_string())),
            })
        }
    }
}
