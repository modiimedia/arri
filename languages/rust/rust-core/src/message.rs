use crate::headers::HeaderMap;

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

static ARRI_VERSION: &'static str = "0.0.8";
static NEWLINE_BYTE: u8 = 10;

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
    Invocation {
        req_id: String,
        rpc_name: String,
        content_type: Option<ContentType>,
        client_version: Option<String>,
        custom_headers: HeaderMap,
        http_method: Option<HttpMethod>,
        path: Option<String>,
        body: Option<Vec<u8>>,
    },
    Ok {
        req_id: String,
        content_type: Option<ContentType>,
        custom_headers: HeaderMap,
        body: Option<Vec<u8>>,
    },
    Error {
        req_id: String,
        code: u32,
        message: String,
        content_type: Option<ContentType>,
        custom_headers: HeaderMap,
        body: Option<Vec<u8>>,
    },
    Heartbeat {
        heartbeat_interval: Option<u32>,
    },
    ConnectionStart {
        heartbeat_interval: Option<u32>,
    },
    StreamData {
        req_id: String,
        msg_id: Option<String>,
        body: Option<Vec<u8>>,
    },
    StreamEnd {
        req_id: String,
        reason: Option<String>,
    },
    StreamCancel {
        req_id: String,
        reason: Option<String>,
    },
}

impl Message {
    pub fn unwrap_req_id(&self) -> Option<String> {
        match self {
            Message::Unknown {} => None,
            Message::Invocation { req_id, .. } => Some(req_id.to_owned()),
            Message::Ok { req_id, .. } => Some(req_id.to_owned()),
            Message::Error { req_id, .. } => Some(req_id.to_owned()),
            Message::Heartbeat { .. } => None,
            Message::ConnectionStart { .. } => None,
            Message::StreamData { req_id, .. } => Some(req_id.to_owned()),
            Message::StreamEnd { req_id, .. } => Some(req_id.to_owned()),
            Message::StreamCancel { req_id, .. } => Some(req_id.to_owned()),
        }
    }

    pub fn decode(bytes: Vec<u8>) -> Result<Self, String> {
        todo!()
    }

    pub fn encode(&self) -> Vec<u8> {
        match self {
            Message::Unknown => Vec::new(),
            Message::Invocation {
                req_id,
                rpc_name,
                content_type,
                client_version,
                custom_headers,
                body,
                ..
            } => {
                let mut output: Vec<u8> = Vec::new();
                output.extend_from_slice(
                    format!("ARRIRPC/{} {}\n", ARRI_VERSION, rpc_name).as_bytes(),
                );
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
                output.push(NEWLINE_BYTE);
                match body {
                    Some(body) => output.extend_from_slice(body),
                    None => {}
                }
                output
            }
            Message::Ok {
                req_id,
                content_type,
                custom_headers,
                body,
            } => {
                let mut output: Vec<u8> = Vec::new();
                output.extend_from_slice(format!("ARRIRPC/{} OK\n", ARRI_VERSION).as_bytes());
                match content_type {
                    Some(val) => {
                        output.extend_from_slice(
                            format!("content-type: {}\n", val.serial_value()).as_bytes(),
                        );
                    }
                    None => {}
                }
                output.extend_from_slice(format!("req-id: {}\n", req_id).as_bytes());
                for (key, val) in custom_headers {
                    output
                        .extend_from_slice(format!("{}: {}\n", key.to_lowercase(), val).as_bytes());
                }
                output.push(NEWLINE_BYTE);
                match body {
                    Some(body) => output.extend(body),
                    None => {}
                }
                output
            }
            Message::Error {
                req_id,
                code,
                message,
                content_type,
                custom_headers,
                body,
            } => {
                let mut output: Vec<u8> = Vec::new();
                output.extend_from_slice(format!("ARRIRPC/{} ERROR\n", ARRI_VERSION).as_bytes());
                match content_type {
                    Some(val) => output.extend_from_slice(
                        format!("content-type: {}\n", val.serial_value()).as_bytes(),
                    ),
                    None => {}
                }
                output.extend_from_slice(format!("req-id: {}\n", req_id).as_bytes());
                output.extend_from_slice(format!("err-code: {}\n", code).as_bytes());
                output.extend_from_slice(format!("err-msg: {}\n", message).as_bytes());
                for (key, val) in custom_headers {
                    output.extend_from_slice(format!("{}: {}\n", key, val).as_bytes());
                }
                output.push(NEWLINE_BYTE);
                match body {
                    Some(body) => output.extend_from_slice(body),
                    None => {}
                }
                output
            }
            Message::Heartbeat { heartbeat_interval } => match heartbeat_interval {
                Some(heartbeat_interval) => format!(
                    "ARRIRPC/{} HEARTBEAT\nheartbeat-interval: {}\n\n",
                    ARRI_VERSION, heartbeat_interval,
                )
                .as_bytes()
                .to_vec(),
                None => format!("ARRIRPC/{} HEARTBEAT\n\n", ARRI_VERSION)
                    .as_bytes()
                    .to_vec(),
            },
            Message::ConnectionStart { heartbeat_interval } => match heartbeat_interval {
                Some(heartbeat_interval) => format!(
                    "ARRIRPC/{} CONNECTION_START\nheartbeat-interval: {}\n\n",
                    ARRI_VERSION, heartbeat_interval
                )
                .as_bytes()
                .to_vec(),
                None => format!("ARRIRPC/{} CONNECTION_START\n\n", ARRI_VERSION)
                    .as_bytes()
                    .to_vec(),
            },
            Message::StreamData {
                req_id,
                msg_id,
                body,
            } => {
                let mut output: Vec<u8> = Vec::new();
                output.extend_from_slice(
                    format!("ARRIRPC/{} STREAM_DATA\n", ARRI_VERSION).as_bytes(),
                );
                output.extend_from_slice(format!("req-id: {}\n", req_id).as_bytes());
                match msg_id {
                    Some(msg_id) => {
                        output.extend_from_slice(format!("msg-id: {}\n", msg_id).as_bytes());
                    }
                    None => {}
                }
                output.push(NEWLINE_BYTE);
                match body {
                    Some(body) => {
                        output.extend_from_slice(body);
                    }
                    None => {}
                }
                output
            }
            Message::StreamEnd { req_id, reason } => {
                let mut output: Vec<u8> = Vec::new();
                output
                    .extend_from_slice(format!("ARRIRPC/{} STREAM_END\n", ARRI_VERSION).as_bytes());
                output.extend_from_slice(format!("req-id: {}\n", req_id).as_bytes());
                match reason {
                    Some(reason) => {
                        output.extend_from_slice(format!("reason: {}\n", reason).as_bytes())
                    }
                    None => {}
                }
                output.push(NEWLINE_BYTE);
                output
            }
            Message::StreamCancel { req_id, reason } => {
                let mut output: Vec<u8> = Vec::new();
                output.extend_from_slice(
                    format!("ARRIRPC/{} STREAM_CANCEL\n", ARRI_VERSION).as_bytes(),
                );
                output.extend_from_slice(format!("req-id: {}\n", req_id).as_bytes());
                match reason {
                    Some(reason) => {
                        output.extend_from_slice(format!("reason: {}\n", reason).as_bytes())
                    }
                    None => {}
                }
                output.push(NEWLINE_BYTE);
                output
            }
        }
    }
}

#[cfg(test)]
mod message_tests {
    use std::fs::{self};

    use crate::{
        headers::HeaderMap,
        message::{ContentType, Message},
    };

    #[test]
    pub fn unwrap_msg_id() {
        let messages: Vec<Message> = vec![
            Message::Invocation {
                req_id: "1".to_string(),
                rpc_name: "foo".to_string(),
                content_type: None,
                client_version: None,
                custom_headers: HeaderMap::new(),
                http_method: None,
                path: None,
                body: None,
            },
            Message::Error {
                req_id: "2".to_string(),
                code: 11,
                message: "this is an error".to_string(),
                content_type: None,
                custom_headers: HeaderMap::new(),
                body: None,
            },
            Message::Ok {
                req_id: "3".to_string(),
                content_type: None,
                custom_headers: HeaderMap::new(),
                body: None,
            },
            Message::ConnectionStart {
                heartbeat_interval: None,
            },
            Message::Heartbeat {
                heartbeat_interval: None,
            },
            Message::StreamData {
                req_id: "6".to_string(),
                msg_id: None,
                body: None,
            },
            Message::StreamEnd {
                req_id: "7".to_string(),
                reason: None,
            },
            Message::StreamCancel {
                req_id: "8".to_string(),
                reason: None,
            },
        ];
        let expected_ids: Vec<String> = vec![
            "1".to_string(),
            "2".to_string(),
            "3".to_string(),
            "".to_string(),
            "".to_string(),
            "6".to_string(),
            "7".to_string(),
            "8".to_string(),
        ];
        let ids: Vec<String> = messages
            .iter()
            .map(|val| val.unwrap_req_id().unwrap_or("".to_string()))
            .collect();
        assert_eq!(ids, expected_ids);
    }

    #[test]
    pub fn encode_invocation_message() {
        let w_body_file_path: String =
            "../../../tests/test-files/InvocationMessage_WithBody.txt".to_string();
        let w_body_file_contents = fs::read_to_string(w_body_file_path).unwrap();
        let w_body_message = Message::Invocation {
            req_id: "12345".to_string(),
            rpc_name: "foo.fooFoo".to_string(),
            content_type: Some(ContentType::Json),
            client_version: Some("1.2.5".to_string()),
            custom_headers: HeaderMap::from_iter([("foo".to_string(), "hello foo".to_string())]),
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
        let wo_body_file_path_2: String =
            "../../../tests/test-files/InvocationMessage_WithoutBody2.txt".to_string();
        let wo_body_file_contents_2 = fs::read_to_string(wo_body_file_path_2).unwrap();

        let wo_body_message = Message::Invocation {
            req_id: "54321".to_string(),
            rpc_name: "foo.fooFoo".to_string(),
            content_type: Some(ContentType::Json),
            client_version: None,
            custom_headers: HeaderMap::from_iter([
                ("foo".to_string(), "hello foo".to_string()),
                ("bar".to_string(), "hello bar".to_string()),
            ]),
            http_method: None,
            path: None,
            body: None,
        };
        let wo_body_output = String::from_utf8(wo_body_message.encode()).unwrap();
        assert!(
            wo_body_output == wo_body_file_contents || wo_body_output == wo_body_file_contents_2
        );
    }

    #[test]
    pub fn encode_ok_message() {
        let wo_body_file_path = "../../../tests/test-files/OkMessage_WithoutBody.txt".to_string();
        let wo_body_file_contents = fs::read_to_string(wo_body_file_path).unwrap();
        let wo_body_message = Message::Ok {
            req_id: "54321".to_owned(),
            content_type: Some(ContentType::Json),
            custom_headers: HeaderMap::from_iter([("foo".to_string(), "foo".to_string())]),
            body: None,
        };
        let wo_body_output = String::from_utf8(wo_body_message.encode());
        assert_eq!(wo_body_output.unwrap(), wo_body_file_contents);

        let w_body_file_path = "../../../tests/test-files/OkMessage_WithBody.txt".to_string();
        let w_body_file_contents = fs::read_to_string(w_body_file_path).unwrap();
        let w_body_message = Message::Ok {
            req_id: "12345".to_string(),
            content_type: Some(ContentType::Json),
            custom_headers: HeaderMap::new(),
            body: Some("{\"message\":\"hello world\"}".as_bytes().to_vec()),
        };
        let w_body_output = String::from_utf8(w_body_message.encode()).unwrap();
        assert_eq!(w_body_output, w_body_file_contents);
    }

    #[test]
    pub fn encode_error_message() {
        let wo_body_file_path =
            "../../../tests/test-files/ErrorMessage_WithoutBody.txt".to_string();
        let wo_body_file_contents = fs::read_to_string(wo_body_file_path).unwrap();
        let wo_body_message = Message::Error {
            req_id: "12345".to_string(),
            code: 54321,
            message: "This is an error".to_string(),
            content_type: Some(ContentType::Json),
            custom_headers: HeaderMap::from_iter([("foo".to_string(), "foo".to_string())]),
            body: None,
        };
        let wo_body_output = String::from_utf8(wo_body_message.encode()).unwrap();
        assert_eq!(wo_body_output, wo_body_file_contents);

        let w_body_file_path = "../../../tests/test-files/ErrorMessage_WithBody.txt".to_string();
        let w_body_file_contents = fs::read_to_string(w_body_file_path).unwrap();
        let w_body_message = Message::Error {
            req_id: "12345".to_string(),
            code: 54321,
            message: "This is an error".to_string(),
            content_type: Some(ContentType::Json),
            custom_headers: HeaderMap::from_iter([("foo".to_string(), "foo".to_string())]),
            body: Some(
                "{\"data\":[],\"trace\":[\"foo\",\"bar\",\"baz\"]}"
                    .as_bytes()
                    .to_vec(),
            ),
        };
        let w_body_output = String::from_utf8(w_body_message.encode()).unwrap();
        assert_eq!(w_body_output, w_body_file_contents);
    }

    #[test]
    pub fn encode_heartbeat_message() {
        let wo_interval_file_path =
            "../../../tests/test-files/HeartbeatMessage_WithoutInterval.txt".to_string();
        let wo_interval_file_contents = fs::read_to_string(wo_interval_file_path).unwrap();
        let wo_interval_message = Message::Heartbeat {
            heartbeat_interval: None,
        };
        let wo_interval_output = String::from_utf8(wo_interval_message.encode()).unwrap();
        assert_eq!(wo_interval_output, wo_interval_file_contents);

        let w_interval_file_path =
            "../../../tests/test-files/HeartbeatMessage_WithInterval.txt".to_string();
        let w_interval_file_contents = fs::read_to_string(w_interval_file_path).unwrap();
        let w_interval_message = Message::Heartbeat {
            heartbeat_interval: Some(155),
        };
        let w_interval_output = String::from_utf8(w_interval_message.encode()).unwrap();
        assert_eq!(w_interval_output, w_interval_file_contents);
    }

    #[test]
    pub fn encode_connection_start_message() {
        let wo_interval_file_path =
            "../../../tests/test-files/ConnectionStartMessage_WithoutInterval.txt".to_string();
        let wo_interval_file_contents = fs::read_to_string(wo_interval_file_path).unwrap();
        let wo_interval_message = Message::ConnectionStart {
            heartbeat_interval: None,
        };
        let wo_interval_output = String::from_utf8(wo_interval_message.encode()).unwrap();
        assert_eq!(wo_interval_output, wo_interval_file_contents);

        let w_interval_file_path =
            "../../../tests/test-files/ConnectionStartMessage_WithInterval.txt".to_string();
        let w_interval_file_contents = fs::read_to_string(w_interval_file_path).unwrap();
        let w_interval_message = Message::ConnectionStart {
            heartbeat_interval: Some(255),
        };
        let w_interval_output = String::from_utf8(w_interval_message.encode()).unwrap();
        assert_eq!(w_interval_output, w_interval_file_contents);
    }

    #[test]
    pub fn encode_stream_data_message() {
        let file_path = "../../../tests/test-files/StreamDataMessage.txt".to_string();
        let file_contents = fs::read_to_string(file_path).unwrap();
        let message = Message::StreamData {
            req_id: "1515".to_string(),
            msg_id: Some("1".to_string()),
            body: Some("{\"message\":\"hello world\"}".as_bytes().to_vec()),
        };
        let output = String::from_utf8(message.encode()).unwrap();
        assert_eq!(output, file_contents);
    }

    #[test]
    pub fn encode_stream_end_message() {
        let file_path = "../../../tests/test-files/StreamEndMessage.txt".to_string();
        let file_contents = fs::read_to_string(file_path).unwrap();
        let message = Message::StreamEnd {
            req_id: "1515".to_string(),
            reason: Some("no more events".to_string()),
        };
        let output = String::from_utf8(message.encode()).unwrap();
        assert_eq!(output, file_contents);
    }

    #[test]
    pub fn encode_stream_cancel_message() {
        let file_path = "../../../tests/test-files/StreamCancelMessage.txt".to_string();
        let file_contents = fs::read_to_string(file_path).unwrap();
        let message = Message::StreamCancel {
            req_id: "1515".to_string(),
            reason: Some("no longer needed".to_string()),
        };
        let output = String::from_utf8(message.encode()).unwrap();
        assert_eq!(output, file_contents);
    }
}
