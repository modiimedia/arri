use std::collections::BTreeMap;

pub enum HttpMethod {
    Get,
    Post,
    Put,
    Patch,
    Delete,
}

pub enum ContentType {
    Json,
}

impl ContentType {
    pub fn from_serial_value(input: String) -> Result<Self, String> {
        match input.as_str() {
            "application/json" => Ok(ContentType::Json),
            _ => Err("Error".to_string()),
        }
    }

    pub fn serial_value(&self) -> String {
        match &self {
            ContentType::Json => "application/json".to_string(),
        }
    }
}

pub enum Message {
    Unknown,
    InvocationMessage {
        req_id: String,
        rpc_name: String,
        content_type: Option<ContentType>,
        client_version: Option<String>,
        custom_headers: BTreeMap<String, String>,
        http_method: Option<HttpMethod>,
        path: Option<String>,
        body: Option<Vec<u8>>,
    },
    OkMessage {
        req_id: String,
        content_type: Option<ContentType>,
        custom_headers: BTreeMap<String, String>,
        body: Option<Vec<u8>>,
    },
    ErrorMessage {
        req_id: String,
        code: u32,
        message: String,
        content_type: Option<ContentType>,
        custom_headers: BTreeMap<String, String>,
        body: Option<Vec<u8>>,
    },
    HeartbeatMessage {
        heartbeat_interval: Option<u32>,
    },
    ConnectionStartMessage {
        heartbeat_interval: Option<u32>,
    },
    StreamDataMessage {
        req_id: String,
        msg_id: Option<String>,
        body: Option<Vec<u8>>,
    },
    StreamEndMessage {
        req_id: String,
        reason: Option<String>,
    },
    StreamCancelMessage {
        req_id: String,
        reason: Option<String>,
    },
}

impl Message {
    pub fn unwrap_req_id(&self) -> Option<&String> {
        match self {
            Message::Unknown {} => None,
            Message::InvocationMessage { req_id, .. } => Some(req_id),
            Message::OkMessage { req_id, .. } => Some(req_id),
            Message::ErrorMessage { req_id, .. } => Some(req_id),
            Message::HeartbeatMessage { .. } => None,
            Message::ConnectionStartMessage { .. } => None,
            Message::StreamDataMessage { req_id, .. } => Some(req_id),
            Message::StreamEndMessage { req_id, .. } => Some(req_id),
            Message::StreamCancelMessage { req_id, .. } => Some(req_id),
        }
    }

    pub fn decode_bytes(bytes: Vec<u8>) -> Result<Self, String> {
        todo!()
    }

    pub fn encode(&self) -> Vec<u8> {
        match self {
            Message::Unknown => Vec::new(),
            Message::InvocationMessage {
                req_id,
                rpc_name,
                content_type,
                client_version,
                custom_headers,
                body,
                ..
            } => {
                let mut output: Vec<u8> = Vec::new();
                output.extend_from_slice(format!("ARRIRPC/0.0.8 {}\n", rpc_name).as_bytes());
                match content_type {
                    Some(val) => {
                        output.extend_from_slice(
                            format!("content-type: {}\n", val.serial_value()).as_bytes(),
                        );
                    }
                    None => {}
                }
                output.extend_from_slice(format!("req-id: {}\n", req_id).as_bytes());
                match client_version {
                    Some(val) => {
                        output.extend_from_slice(format!("client-version: {}\n", val).as_bytes());
                    }
                    None => {}
                }
                for (key, value) in custom_headers {
                    output.extend_from_slice(format!("{}: {}\n", key, value).as_bytes());
                }
                output.extend_from_slice("\n".as_bytes());
                match body {
                    Some(body) => output.extend_from_slice(body),
                    None => {}
                }
                output
            }
            Message::OkMessage {
                req_id,
                content_type,
                custom_headers,
                body,
            } => todo!(),
            Message::ErrorMessage {
                req_id,
                code,
                message,
                content_type,
                custom_headers,
                body,
            } => todo!(),
            Message::HeartbeatMessage { heartbeat_interval } => todo!(),
            Message::ConnectionStartMessage { heartbeat_interval } => todo!(),
            Message::StreamDataMessage {
                req_id,
                msg_id,
                body,
            } => todo!(),
            Message::StreamEndMessage { req_id, reason } => todo!(),
            Message::StreamCancelMessage { req_id, reason } => todo!(),
        }
    }
}

#[cfg(test)]
mod message_tests {
    use std::{
        collections::{BTreeMap, btree_map},
        fs::{self, read_to_string},
        str::from_utf8,
    };

    use crate::messages::{ContentType, Message};

    #[test]
    pub fn encode_invocation_message() {
        let w_body_file_path: String =
            "../../../tests/test-files/InvocationMessage_WithBody.txt".to_string();
        let w_body_file_contents = fs::read_to_string(w_body_file_path).unwrap();
        let w_body_message = Message::InvocationMessage {
            req_id: "12345".to_string(),
            rpc_name: "foo.fooFoo".to_string(),
            content_type: Some(ContentType::Json),
            client_version: Some("1.2.5".to_string()),
            custom_headers: BTreeMap::from([("foo".to_string(), "hello foo".to_string())]),
            http_method: None,
            path: None,
            body: Some("{\"message\":\"hello world\"}".as_bytes().to_vec()),
        };
        let w_body_output = String::from_utf8(w_body_message.encode());
        assert_eq!(
            w_body_output.unwrap_or("".to_string()),
            w_body_file_contents
        );

        let wo_body_file_path: String =
            "../../../tests/test-files/InvocationMessage_WithoutBody.txt".to_string();
        let wo_body_file_contents = fs::read_to_string(wo_body_file_path).unwrap();
        let wo_body_message = Message::InvocationMessage {
            req_id: "54321".to_string(),
            rpc_name: "foo.fooFoo".to_string(),
            content_type: Some(ContentType::Json),
            client_version: None,
            custom_headers: BTreeMap::from([
                ("foo".to_string(), "hello foo".to_string()),
                ("bar".to_string(), "hello bar".to_string()),
            ]),
            http_method: None,
            path: None,
            body: None,
        };
        let wo_body_output = String::from_utf8(wo_body_message.encode()).unwrap();
        assert_eq!(wo_body_output, wo_body_file_contents);
    }
}
