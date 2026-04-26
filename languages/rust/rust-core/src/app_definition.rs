use indexmap::IndexMap;

use crate::encoder::{Encodable, maybe_encode_field};

pub enum Transport {
    Http,
    Ws,
    Other(String),
}

impl Encodable for Transport {
    fn encode<T: crate::encoder::Encoder>(&self, encoder: &mut T) {
        todo!()
    }
}

pub enum RpcHttpMethod {
    Get,
    Post,
    Put,
    Delete,
    Patch,
}

impl Encodable for RpcHttpMethod {
    fn encode<T: crate::encoder::Encoder>(&self, encoder: &mut T) {
        todo!()
    }
}

pub const SCHEMA_VERSION: &str = "0.0.8";

pub struct AppDefinition {
    pub schema_version: String,
    pub info: Option<AppDefinitionInfo>,
    pub procedures: Option<IndexMap<String, RpcDefinition>>,
    pub definitions: Option<IndexMap<String, String>>,
}

impl Encodable for AppDefinition {
    fn encode<T: crate::encoder::Encoder>(&self, encoder: &mut T) {
        encoder.begin_object();
        encoder.encode_field("schemaVersion");
        self.schema_version.encode(encoder);
        maybe_encode_field(encoder, "info", &self.info);
        maybe_encode_field(encoder, "procedures", &self.procedures);
        maybe_encode_field(encoder, "definitions", &self.definitions);
        encoder.end_object();
    }
}

pub struct AppDefinitionInfo {}

impl Encodable for AppDefinitionInfo {
    fn encode<T: crate::encoder::Encoder>(&self, encoder: &mut T) {}
}

pub struct RpcDefinition {
    pub transport: Transport,
    pub transports: Vec<Transport>,
    pub path: String,
    pub method: Option<RpcHttpMethod>,
    pub input: Option<String>,
    pub input_is_stream: Option<bool>,
    pub output: Option<String>,
    pub output_is_stream: Option<bool>,
    pub description: Option<String>,
    pub is_deprecated: Option<bool>,
    pub deprecation_note: Option<String>,
}

impl Encodable for RpcDefinition {
    fn encode<T: crate::encoder::Encoder>(&self, encoder: &mut T) {
        encoder.begin_object();
        encoder.encode_field("transport");
        self.transport.encode(encoder);
        encoder.encode_field("transports");
        self.transports.encode(encoder);
        encoder.encode_field("path");
        self.path.encode(encoder);
        maybe_encode_field(encoder, "input", &self.input);
        maybe_encode_field(encoder, "inputIsStream", &self.input_is_stream);
        maybe_encode_field(encoder, "output", &self.output);
        maybe_encode_field(encoder, "outputIsStream", &self.output_is_stream);
        maybe_encode_field(encoder, "description", &self.description);
        maybe_encode_field(encoder, "isDeprecated", &self.is_deprecated);
        maybe_encode_field(encoder, "deprecationNote", &self.deprecation_note);
        encoder.end_object();
    }
}
