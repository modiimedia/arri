use indexmap::IndexMap;

pub enum Schema {
    Empty {
        metadata: Option<SchemaMetadata>,
    },
    Type {
        r#type: Type,
        metadata: Option<SchemaMetadata>,
    },
    Enum {
        r#enum: Vec<String>,
        metadata: Option<SchemaMetadata>,
    },
    Elements {
        elements: Box<Schema>,
        metadata: Option<SchemaMetadata>,
    },
    Properties {
        properties: IndexMap<String, Box<Schema>>,
        optional_properties: Option<IndexMap<String, Box<Schema>>>,
        metadata: Option<SchemaMetadata>,
        is_strict: Option<bool>,
    },
    Values {
        values: Box<Schema>,
        metadata: Option<SchemaMetadata>,
    },
    Discriminator {
        discriminator: String,
        mapping: IndexMap<String, Box<Schema>>,
        metadata: Option<SchemaMetadata>,
    },
    Ref {
        r#ref: String,
    },
}

pub struct SchemaMetadata {
    pub id: Option<String>,
    pub description: Option<String>,
    pub is_deprecated: Option<bool>,
    pub deprecated_note: Option<String>,
}

pub enum Type {
    Boolean,
    Float32,
    Float64,
    Int8,
    Uint8,
    Int16,
    Uint16,
    Int32,
    Uint32,
    String,
    Timestamp,
}
