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

    pub fn encode(&self) -> String {
        match self {
            Message::Unknown => "".to_string(),
            Message::InvocationMessage {
                req_id,
                rpc_name,
                content_type,
                client_version,
                custom_headers,
                http_method,
                path,
                body,
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
                output.push_str("req-id: ");
                output.push_str(&req_id);
                output.push('\n');
                match client_version {
                    Some(val) => {
                        output.push_str("client-version: ");
                        output.push_str(&val);
                        output.push('\n');
                    }
                    None => todo!(),
                }
                for (key, value) in custom_headers {
                    output.push_str(&format!("{}: {}\n", key, value));
                }
                output.push('\n');

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
