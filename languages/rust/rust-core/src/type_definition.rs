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
    Int64,
    Uint64,
    String,
    Timestamp,
}

impl std::str::FromStr for Type {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "boolean" => Ok(Self::Boolean),
            "float32" => Ok(Self::Float32),
            "float64" => Ok(Self::Float64),
            "int8" => Ok(Self::Int8),
            "uint8" => Ok(Self::Uint8),
            "int16" => Ok(Self::Int16),
            "uint16" => Ok(Self::Uint16),
            "int32" => Ok(Self::Int32),
            "uint32" => Ok(Self::Uint32),
            "int64" => Ok(Self::Int64),
            "uint64" => Ok(Self::Uint64),
            "string" => Ok(Self::String),
            "timestamp" => Ok(Self::Timestamp),
            _ => Err(format!("invalid type: \"{}\"", s)),
        }
    }
}

impl std::fmt::Display for Type {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match &self {
            Type::Boolean => f.write_str("boolean"),
            Type::Float32 => f.write_str("float32"),
            Type::Float64 => f.write_str("float64"),
            Type::Int8 => f.write_str("int8"),
            Type::Uint8 => f.write_str("uint8"),
            Type::Int16 => f.write_str("int16"),
            Type::Uint16 => f.write_str("uint16"),
            Type::Int32 => f.write_str("int32"),
            Type::Uint32 => f.write_str("uint32"),
            Type::Int64 => f.write_str("int64"),
            Type::Uint64 => f.write_str("uint64"),
            Type::String => f.write_str("string"),
            Type::Timestamp => f.write_str("timestamp"),
        }
    }
}
