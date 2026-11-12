use crate::{Encode, EncodeError, Encoder};

/// An [Arri Type Definition](https://github.com/modiimedia/arri/blob/master/specifications/arri_type_definition.md)
#[derive(Debug, Clone, PartialEq)]
pub struct TypeDef {
    pub form: Form,
    /// Corresponds to the `isNullable` keyword
    pub is_nullable: bool,
    pub metadata: Metadata,
}

/// The different schema forms an Arri Type Definition can take.
///
/// The deprecated "discriminator" form is intentionally absent. Use [`Union`] with a `tag_key` instead.
#[derive(Debug, Clone, PartialEq)]
pub enum Form {
    /// Accepts any value
    Empty,
    /// A scalar value
    Type(Type),
    /// One of a list of strings
    Enum(Vec<String>),
    /// A list
    Elements(Box<TypeDef>),
    /// An object with known keys
    Properties(Properties),
    /// An object with unknown keys (record / map)
    Values(Box<TypeDef>),
    /// A tagged union
    Union(Union),
    /// A reference to a type with a matching `metadata.id`. Used to close recursive types.
    Ref(String),
}

#[derive(Debug, Clone, PartialEq, Default)]
pub struct Properties {
    pub properties: Vec<(String, TypeDef)>,
    pub optional_properties: Vec<(String, TypeDef)>,
    pub is_strict: bool,
}

#[derive(Debug, Clone, PartialEq, Default)]
pub struct Union {
    /// When present the union is internally tagged (or adjacently tagged if `value_key` is also present)
    pub tag_key: Option<String>,
    /// When present (alongside `tag_key`) the union is adjacently tagged
    pub value_key: Option<String>,
    pub variants: Vec<(String, TypeDef)>,
}

#[derive(Debug, Clone, PartialEq, Default)]
pub struct Metadata {
    pub id: Option<String>,
    pub description: Option<String>,
    pub is_deprecated: bool,
    pub deprecated_note: Option<String>,
}

impl Metadata {
    pub fn is_empty(&self) -> bool {
        self.id.is_none()
            && self.description.is_none()
            && !self.is_deprecated
            && self.deprecated_note.is_none()
    }
}

/// Scalar types used by the "type" schema form
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Type {
    Boolean,
    String,
    Timestamp,
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
}

impl Type {
    pub const fn as_str(&self) -> &'static str {
        match self {
            Type::Boolean => "boolean",
            Type::String => "string",
            Type::Timestamp => "timestamp",
            Type::Float32 => "float32",
            Type::Float64 => "float64",
            Type::Int8 => "int8",
            Type::Uint8 => "uint8",
            Type::Int16 => "int16",
            Type::Uint16 => "uint16",
            Type::Int32 => "int32",
            Type::Uint32 => "uint32",
            Type::Int64 => "int64",
            Type::Uint64 => "uint64",
        }
    }
}

impl std::fmt::Display for Type {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
}

impl std::str::FromStr for Type {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "boolean" => Ok(Type::Boolean),
            "string" => Ok(Type::String),
            "timestamp" => Ok(Type::Timestamp),
            "float32" => Ok(Type::Float32),
            "float64" => Ok(Type::Float64),
            "int8" => Ok(Type::Int8),
            "uint8" => Ok(Type::Uint8),
            "int16" => Ok(Type::Int16),
            "uint16" => Ok(Type::Uint16),
            "int32" => Ok(Type::Int32),
            "uint32" => Ok(Type::Uint32),
            "int64" => Ok(Type::Int64),
            "uint64" => Ok(Type::Uint64),
            _ => Err(format!("invalid type \"{s}\"")),
        }
    }
}

impl TypeDef {
    pub fn new(form: Form) -> Self {
        Self {
            form,
            is_nullable: false,
            metadata: Metadata::default(),
        }
    }

    pub fn empty() -> Self {
        Self::new(Form::Empty)
    }

    pub fn scalar(t: Type) -> Self {
        Self::new(Form::Type(t))
    }

    pub fn enumeration<S: Into<String>>(values: impl IntoIterator<Item = S>) -> Self {
        Self::new(Form::Enum(values.into_iter().map(Into::into).collect()))
    }

    pub fn elements(inner: TypeDef) -> Self {
        Self::new(Form::Elements(Box::new(inner)))
    }

    pub fn values(inner: TypeDef) -> Self {
        Self::new(Form::Values(Box::new(inner)))
    }

    pub fn properties(properties: Properties) -> Self {
        Self::new(Form::Properties(properties))
    }

    pub fn union(union: Union) -> Self {
        Self::new(Form::Union(union))
    }

    pub fn reference(id: impl Into<String>) -> Self {
        Self::new(Form::Ref(id.into()))
    }

    pub fn nullable(mut self) -> Self {
        self.is_nullable = true;
        self
    }

    pub fn with_id(mut self, id: impl Into<String>) -> Self {
        self.metadata.id = Some(id.into());
        self
    }

    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.metadata.description = Some(description.into());
        self
    }

    pub fn deprecated(mut self, note: Option<String>) -> Self {
        self.metadata.is_deprecated = true;
        self.metadata.deprecated_note = note;
        self
    }

    /// Serialize this type definition as JSON
    pub fn to_json(&self) -> String {
        crate::json::to_string(self).expect("type definitions contain no floats and cannot fail")
    }
}

impl Encode for TypeDef {
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        let form_len = match &self.form {
            Form::Empty => 0,
            Form::Type(_) | Form::Enum(_) | Form::Elements(_) | Form::Values(_) | Form::Ref(_) => 1,
            Form::Properties(p) => {
                1 + !p.optional_properties.is_empty() as usize + p.is_strict as usize
            }
            Form::Union(u) => 1 + u.tag_key.is_some() as usize + u.value_key.is_some() as usize,
        };
        let len = form_len + self.is_nullable as usize + !self.metadata.is_empty() as usize;
        e.begin_object(len)?;
        match &self.form {
            Form::Empty => {}
            Form::Type(t) => {
                e.encode_key("type")?;
                e.encode_str(t.as_str())?;
            }
            Form::Enum(values) => {
                e.encode_key("enum")?;
                values.encode(e)?;
            }
            Form::Elements(inner) => {
                e.encode_key("elements")?;
                inner.encode(e)?;
            }
            Form::Properties(p) => {
                e.encode_key("properties")?;
                encode_def_map(e, &p.properties)?;
                if !p.optional_properties.is_empty() {
                    e.encode_key("optionalProperties")?;
                    encode_def_map(e, &p.optional_properties)?;
                }
                if p.is_strict {
                    e.encode_key("isStrict")?;
                    e.encode_bool(true)?;
                }
            }
            Form::Values(inner) => {
                e.encode_key("values")?;
                inner.encode(e)?;
            }
            Form::Union(u) => {
                if let Some(tag_key) = &u.tag_key {
                    e.encode_key("tagKey")?;
                    e.encode_str(tag_key)?;
                }
                if let Some(value_key) = &u.value_key {
                    e.encode_key("valueKey")?;
                    e.encode_str(value_key)?;
                }
                e.encode_key("union")?;
                encode_def_map(e, &u.variants)?;
            }
            Form::Ref(id) => {
                e.encode_key("ref")?;
                e.encode_str(id)?;
            }
        }
        if self.is_nullable {
            e.encode_key("isNullable")?;
            e.encode_bool(true)?;
        }
        if !self.metadata.is_empty() {
            e.encode_key("metadata")?;
            self.metadata.encode(e)?;
        }
        e.end_object()
    }
}

fn encode_def_map<E: Encoder + ?Sized>(
    e: &mut E,
    entries: &[(String, TypeDef)],
) -> Result<(), EncodeError> {
    e.begin_object(entries.len())?;
    for (key, def) in entries {
        e.encode_key(key)?;
        def.encode(e)?;
    }
    e.end_object()
}

impl Encode for Metadata {
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        let len = self.id.is_some() as usize
            + self.description.is_some() as usize
            + self.is_deprecated as usize
            + self.deprecated_note.is_some() as usize;
        e.begin_object(len)?;
        if let Some(id) = &self.id {
            e.encode_key("id")?;
            e.encode_str(id)?;
        }
        if let Some(description) = &self.description {
            e.encode_key("description")?;
            e.encode_str(description)?;
        }
        if self.is_deprecated {
            e.encode_key("isDeprecated")?;
            e.encode_bool(true)?;
        }
        if let Some(note) = &self.deprecated_note {
            e.encode_key("deprecatedNote")?;
            e.encode_str(note)?;
        }
        e.end_object()
    }
}
