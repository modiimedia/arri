pub trait ArriClientModel: Clone {
    fn new() -> Self;
    fn from_json(input: serde_json::Value) -> Self;
    fn from_json_string(input: String) -> Self;
    fn to_json_string(&self) -> String;
    fn to_query_params_string(&self) -> String;
}

pub trait ArriClientEnum {
    fn default() -> Self;
    fn from_string(input: String) -> Self;
    fn serial_value(&self) -> String;
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct EmptyArriClientModel {}
impl ArriClientModel for EmptyArriClientModel {
    fn new() -> Self {
        Self {}
    }

    fn from_json(_: serde_json::Value) -> Self {
        Self {}
    }

    fn from_json_string(_: String) -> Self {
        Self {}
    }

    fn to_json_string(&self) -> String {
        "{}".to_string()
    }

    fn to_query_params_string(&self) -> String {
        "".to_string()
    }
}
