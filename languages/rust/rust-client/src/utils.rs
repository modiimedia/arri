use chrono::{DateTime, FixedOffset, SecondsFormat};

pub fn serialize_string(input: &String) -> String {
    serde_json::to_string(input).unwrap_or("".to_string())
}

pub fn serialize_date_time(input: &DateTime<FixedOffset>, wrap_in_quotes: bool) -> String {
    let result = input.to_rfc3339_opts(SecondsFormat::Millis, true);
    match wrap_in_quotes {
        true => format!("\"{}\"", result),
        false => result,
    }
}

/// Encode a value so that it can safely be used in a url query string
pub fn encode_query_component(input: &str) -> String {
    let mut result = String::with_capacity(input.len());
    for byte in input.bytes() {
        match byte {
            b'a'..=b'z' | b'A'..=b'Z' | b'0'..=b'9' | b'*' | b'-' | b'.' | b'_' => {
                result.push(byte as char)
            }
            b' ' => result.push('+'),
            _ => result.push_str(format!("%{:02X}", byte).as_str()),
        }
    }
    result
}

#[cfg(test)]
mod tests {
    use super::encode_query_component;

    #[test]
    fn encode_query_component_test() {
        assert_eq!(
            encode_query_component("hello-world_1.5*"),
            "hello-world_1.5*"
        );
        assert_eq!(encode_query_component("hello world"), "hello+world");
        assert_eq!(
            encode_query_component("a&b=c/?#+%"),
            "a%26b%3Dc%2F%3F%23%2B%25"
        );
        assert_eq!(encode_query_component("\u{e9}"), "%C3%A9");
        assert_eq!(encode_query_component(""), "");
    }
}
