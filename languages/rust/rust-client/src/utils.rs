pub fn string_to_json_string(input: String) -> String {
    serde_json::to_string(&input).unwrap_or("".to_string())
}
