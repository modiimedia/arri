use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::BTreeMap;

type Metadata = BTreeMap<String, Value>;

#[derive(Debug, Serialize, Deserialize)]
enum ASchema {
    ASchemaFormEmpty {
        nullable: Option<bool>,
        metadata: Option<Metadata>,
    },
    ASchemaFormType {
        #[serde(rename = "type")]
        r#type: AType,
        nullable: Option<bool>,
        metadata: Option<Metadata>,
    },
    ASchemaFormEnum {
        #[serde(rename = "enum")]
        r#enum: Vec<String>,
        nullable: Option<bool>,
        metadata: Option<Metadata>,
    },
    ASchemaFormElements {
        elements: Box<ASchema>,
        nullable: Option<bool>,
        metadata: Option<Metadata>,
    },
    ASchemaFormProperties {
        properties: Box<BTreeMap<String, ASchema>>,
        #[serde(rename = "optionalProperties")]
        optional_properties: Option<Box<BTreeMap<String, ASchema>>>,
        #[serde(rename = "additionalProperties")]
        additional_properties: Option<bool>,
        nullable: Option<bool>,
        metadata: Option<Metadata>,
    },
    ASchemaFormValues {
        values: Box<ASchema>,
        nullable: Option<bool>,
        metadata: Option<Metadata>,
    },
    ASchemaFormDiscriminator {
        discriminator: String,
        mapping: Box<BTreeMap<String, ASchema>>,
        nullable: Option<bool>,
        metadata: Option<bool>,
    },
    ASchemaFormRef {
        #[serde(rename = "ref")]
        r#ref: String,
        nullable: Option<bool>,
        metadata: Option<bool>,
    },
}

#[derive(Debug, Serialize, Deserialize)]
enum AType {
    #[serde(rename = "string")]
    String,
    #[serde(rename = "boolean")]
    Boolean,
    #[serde(rename = "timestamp")]
    Timestamp,
    #[serde(rename = "float32")]
    Float32,
    #[serde(rename = "float64")]
    Float64,
    #[serde(rename = "int8")]
    Int8,
    #[serde(rename = "uint8")]
    Uint8,
    #[serde(rename = "int16")]
    Int16,
    #[serde(rename = "uint16")]
    Uint16,
    #[serde(rename = "int32")]
    Int32,
    #[serde(rename = "uint32")]
    Uint32,
    #[serde(rename = "int64")]
    Int64,
    #[serde(rename = "uint64")]
    Uint64,
}
