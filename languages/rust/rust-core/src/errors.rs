use core::fmt;

use serde_json::json;

use crate::message::ContentType;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ArriError {
    pub code: u32,
    pub message: String,
    pub body: Option<Vec<u8>>,
    pub content_type: ContentType,
    has_parsed_body: bool,
    _data: Option<serde_json::Value>,
    _trace: Option<Vec<String>>,
}

impl ArriError {
    pub fn new(
        code: u32,
        message: String,
        content_type: Option<ContentType>,
        body: Option<Vec<u8>>,
    ) -> Self {
        Self {
            code,
            message,
            content_type: content_type.unwrap_or(ContentType::Json),
            body,
            has_parsed_body: false,
            _data: None,
            _trace: None,
        }
    }

    fn parse_body(&mut self) {
        if self.body.is_none() {
            self.has_parsed_body = true;
            return;
        }
        let body = String::from_utf8(self.body.unwrap());
        if body.is_err() {
            self.has_parsed_body = true;
            return;
        }
        let body = body.unwrap();
        match self.content_type {
            ContentType::Json => {
                let val = json!(body);
                match val.get("data") {
                    Some(val) => {
                        self._data = Some(val.to_owned());
                    }
                    None => {}
                }
                match val.get("trace") {
                    Some(val) => match val {
                        serde_json::Value::Null => {}
                        serde_json::Value::Bool(_) => {}
                        serde_json::Value::Number(_) => {}
                        serde_json::Value::String(_) => {}
                        serde_json::Value::Array(arr) => {}
                        serde_json::Value::Object(_) => {}
                    },
                    None => {}
                }
            }
        }
    }

    pub fn data(&self) -> &Option<serde_json::Value> {
        if self.has_parsed_body {
            return &self._data;
        }
        &self._data
    }

    pub fn trace(&self) -> &Option<Vec<String>> {
        if self.has_parsed_body {
            return &self._trace;
        }
        &self._trace
    }
}

impl fmt::Display for ArriError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "ArriError {{ code: {}, message: {}, data: {:?}, trace: {:?} }}",
            self.code, self.message, self.data, self.trace
        )
    }
}

pub fn status_message_from_status_code(status_code: u16) -> String {
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
