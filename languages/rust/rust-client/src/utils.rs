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
