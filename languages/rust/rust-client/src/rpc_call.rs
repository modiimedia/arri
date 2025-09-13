use std::sync::{Arc, RwLock};

use arri_core::{
    headers::{HeaderMap, SharableHeaderMap},
    message::{ContentType, HttpMethod, Message},
};

use crate::model::ArriClientModel;

pub struct RpcCall<'a, T: ArriClientModel> {
    pub rpc_name: String,
    pub req_id: String,
    pub path: String,
    pub method: Option<HttpMethod>,
    pub client_version: Option<String>,
    pub content_type: Option<ContentType>,
    pub custom_headers: &'a Arc<RwLock<SharableHeaderMap>>,
    pub data: Option<T>,
}

impl<'a, T: ArriClientModel> RpcCall<'a, T> {
    pub fn new(
        rpc_name: String,
        path: String,
        method: Option<HttpMethod>,
        client_version: Option<String>,
        content_type: Option<ContentType>,
        custom_headers: &'a Arc<RwLock<SharableHeaderMap>>,
        data: Option<T>,
    ) -> Self {
        Self {
            rpc_name: rpc_name,
            req_id: ulid::Ulid::new().to_string(),
            path: path,
            method: method,
            client_version: client_version,
            content_type: content_type,
            custom_headers: custom_headers,
            data: data,
        }
    }

    pub fn to_message(&self) -> Result<Message, String> {
        let content_type = self.content_type.clone();
        let mut custom_headers = HeaderMap::new();
        {
            let headers = self.custom_headers.read();
            if headers.is_err() {
                return Err(headers.unwrap_err().to_string());
            }
            let headers = headers.unwrap().clone();
            for (key, value) in headers {
                custom_headers.insert(key.to_lowercase().as_str(), value.clone().as_str());
            }
        }
        Ok(Message::Invocation {
            req_id: self.req_id.clone(),
            rpc_name: self.rpc_name.clone(),
            content_type: content_type.clone(),
            client_version: self.client_version.clone(),
            custom_headers: custom_headers,
            http_method: self.method.clone(),
            path: Some(self.path.clone()),
            body: match &self.data {
                Some(data) => match content_type.unwrap_or(ContentType::Json) {
                    ContentType::Json => Some(data.to_json_string().as_bytes().to_vec()),
                },
                None => None,
            },
        })
    }
}
