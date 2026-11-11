//! Internally and adjacently tagged unions are decoded through a different code path when the tag
//! comes after the variant's data (the data is buffered as a `Value` until the tag is known).
//! These tests check that both paths accept and reject exactly the same input.
#![deny(warnings)]

use std::collections::BTreeMap;

use arri::{ArriModel, DecodeError, DecodeErrorKind, Nullable, Timestamp, Value, json};

#[derive(ArriModel, Debug, PartialEq)]
struct Inner {
    id: i64,
    tags: Vec<String>,
}

#[derive(ArriModel, Debug, PartialEq)]
#[arri(rename_all = "camelCase")]
struct Fields {
    int64: i64,
    uint64: u64,
    int32: i32,
    float32: f32,
    float64: f64,
    time: Timestamp,
    inner: Inner,
    record: BTreeMap<String, u64>,
    nullable: Nullable<i64>,
    optional: Option<String>,
    any: Value,
}

#[derive(ArriModel, Debug, PartialEq)]
#[arri(tag_key = "type")]
enum Internal {
    A(Fields),
}

#[derive(ArriModel, Debug, PartialEq)]
#[arri(tag_key = "t", value_key = "v")]
enum Adjacent {
    A(Fields),
}

const VALID: &str = r#""int64":"-9223372036854775808","uint64":"18446744073709551615","int32":-5,"float32":1.1,"float64":-1.5e-3,"time":"2001-02-03T04:05:06.789Z","inner":{"id":"1","tags":["a","b\"c"]},"record":{"x":"1","y":2},"nullable":null,"any":{"a":[1,"2",null]}"#;

/// Replace a single field of [`VALID`]
fn with(key: &str, value: &str) -> String {
    let start = VALID
        .find(&format!("\"{key}\":"))
        .unwrap_or_else(|| panic!("no field named {key}"));
    let value_start = start + key.len() + 3;
    let mut depth = 0;
    let mut in_string = false;
    let mut escaped = false;
    let mut end = VALID.len();
    for (i, c) in VALID[value_start..].char_indices() {
        match c {
            _ if escaped => escaped = false,
            '\\' if in_string => escaped = true,
            '"' => in_string = !in_string,
            '{' | '[' if !in_string => depth += 1,
            '}' | ']' if !in_string => depth -= 1,
            ',' if !in_string && depth == 0 => {
                end = value_start + i;
                break;
            }
            _ => {}
        }
    }
    format!("{}{value}{}", &VALID[..value_start], &VALID[end..])
}

/// Remove a single field of [`VALID`]
fn without(key: &str) -> String {
    with(key, "")
        .replace(&format!("\"{key}\":,"), "")
        .replace(&format!(",\"{key}\":"), "")
}

/// The parts of a result that must match. Errors are compared by kind and location.
fn summary<T: std::fmt::Debug>(result: Result<T, DecodeError>) -> String {
    match result {
        Ok(value) => format!("Ok({value:?})"),
        Err(err) => format!("Err({:?} at {})", err.kind(), err.instance_path()),
    }
}

fn bodies() -> Vec<(&'static str, String)> {
    vec![
        ("valid", VALID.to_string()),
        ("int64 as number", with("int64", "-42")),
        (
            "uint64 max as number",
            with("uint64", "18446744073709551615"),
        ),
        ("uint64 as whole float", with("uint64", "1.5e19")),
        (
            "int64 out of range string",
            with("int64", "\"9223372036854775808\""),
        ),
        (
            "int64 out of range number",
            with("int64", "9223372036854775808"),
        ),
        (
            "int64 huge number",
            with("int64", "1000000000000000000000000000000"),
        ),
        ("int64 fraction", with("int64", "1.5")),
        ("int64 fraction string", with("int64", "\"1.5\"")),
        ("int64 not a number", with("int64", "\"abc\"")),
        ("int64 bool", with("int64", "true")),
        ("uint64 negative", with("uint64", "-1")),
        ("int32 as string", with("int32", "\"1\"")),
        ("int32 whole float", with("int32", "2.0e1")),
        ("float32 as string", with("float32", "\"1.1\"")),
        ("float32 integer", with("float32", "7")),
        ("float64 null", with("float64", "null")),
        ("float64 overflow", with("float64", "1e400")),
        ("float32 overflow", with("float32", "1e39")),
        ("any overflow", with("any", "[1e400]")),
        ("time leap second", with("time", "\"2016-12-31T23:59:60Z\"")),
        ("time invalid", with("time", "\"2001-02-30T00:00:00Z\"")),
        ("time as number", with("time", "1")),
        (
            "nested int64 as number",
            with("inner", r#"{"id":5,"tags":[]}"#),
        ),
        ("nested invalid", with("inner", r#"{"id":"1","tags":[1]}"#)),
        ("nested missing field", with("inner", r#"{"tags":[]}"#)),
        ("record invalid", with("record", r#"{"x":"a"}"#)),
        ("nullable present", with("nullable", "5")),
        ("nullable string", with("nullable", "\"5\"")),
        ("nullable invalid", with("nullable", "false")),
        ("optional present", format!(r#"{VALID},"optional":"hi""#)),
        ("optional null", format!(r#"{VALID},"optional":null"#)),
        ("unknown key", format!(r#"{VALID},"extra":[1,{{"a":2}}]"#)),
        ("missing field", without("float64")),
        ("duplicate field", format!(r#"{VALID},"int32":1"#)),
        (
            "duplicate optional field",
            format!(r#"{VALID},"optional":"a","optional":"b""#),
        ),
        (
            "duplicate nested field",
            with("inner", r#"{"id":"1","tags":[],"id":"2"}"#),
        ),
        (
            "duplicate record key",
            with("record", r#"{"x":"1","x":"2"}"#),
        ),
        (
            "duplicate unknown key",
            format!(r#"{VALID},"extra":1,"extra":2"#),
        ),
    ]
}

#[test]
fn bodies_are_well_formed() {
    // make sure the helpers produced the intended JSON
    assert!(json::from_str::<Value>(&format!("{{{VALID}}}")).is_ok());
    for (name, body) in bodies() {
        // some bodies are intentionally invalid (e.g. out of range numbers) but they must be valid JSON
        if let Err(err) = json::from_str::<Value>(&format!("{{{body}}}")) {
            assert_ne!(err.kind(), DecodeErrorKind::Syntax, "{name}: {body}");
        }
    }
    assert!(json::from_str::<Fields>(&format!("{{{VALID}}}")).is_ok());
}

#[test]
fn internal_tag_position_does_not_change_the_result() {
    for (name, body) in bodies() {
        let first = json::from_str::<Internal>(&format!(r#"{{"type":"A",{body}}}"#));
        let last = json::from_str::<Internal>(&format!(r#"{{{body},"type":"A"}}"#));
        assert_eq!(summary(first), summary(last), "{name}");
    }
}

#[test]
fn adjacent_tag_position_does_not_change_the_result() {
    for (name, body) in bodies() {
        let first = json::from_str::<Adjacent>(&format!(r#"{{"t":"A","v":{{{body}}}}}"#));
        let last = json::from_str::<Adjacent>(&format!(r#"{{"v":{{{body}}},"t":"A"}}"#));
        assert_eq!(summary(first), summary(last), "{name}");
    }
}

#[test]
fn large_integers_accept_strings_and_numbers() {
    let decoded = json::from_str::<Fields>(&format!("{{{}}}", with("int64", "-42"))).unwrap();
    assert_eq!(decoded.int64, -42);
    let decoded =
        json::from_str::<Fields>(&format!("{{{}}}", with("uint64", "18446744073709551615")))
            .unwrap();
    assert_eq!(decoded.uint64, u64::MAX);
    // they're still encoded as strings
    assert!(
        json::to_string(&decoded)
            .unwrap()
            .contains(r#""uint64":"18446744073709551615""#)
    );
}
