use indexmap::IndexMap;

pub enum Transport {
    Http,
    Ws,
    Other(String),
}

pub enum RpcHttpMethod {
    Get,
    Post,
    Put,
    Delete,
    Patch,
}

pub struct AppDefinition {
    pub procedures: IndexMap<String, RpcDefinition>,
    pub definitions: IndexMap<String, String>,
}

pub struct RpcDefinition {
    pub transports: Vec<Transport>,
    pub path: String,
    pub method: Option<RpcHttpMethod>,
    pub input: Option<String>,
    pub input_is_stream: Option<bool>,
    pub output: Option<String>,
    pub output_is_stream: Option<bool>,
    pub description: Option<String>,
    pub deprecation_note: Option<String>,
}
