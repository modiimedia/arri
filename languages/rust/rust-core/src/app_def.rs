use crate::{Encode, EncodeError, Encoder, SchemaContext, SchemaError, Type, TypeDef};

/// The version of the [app definition specification](https://github.com/modiimedia/arri/blob/master/specifications/arri_app_definition.md)
/// that [`AppDef`] produces
pub const SCHEMA_VERSION: &str = "0.0.9";

/// An [Arri App Definition](https://github.com/modiimedia/arri/blob/master/specifications/arri_app_definition.md).
///
/// This is the document passed to the Arri code generators. It's usually built with [`AppDef::builder`]:
///
/// ```
/// use arri::{AppDef, Arri};
///
/// #[derive(Arri)]
/// struct User {
///     id: String,
/// }
///
/// let app = AppDef::builder()
///     .title("My API")
///     .version("1")
///     .add_type::<User>()
///     .build()
///     .unwrap();
/// assert_eq!(
///     app.to_json(),
///     r#"{"schemaVersion":"0.0.9","info":{"title":"My API","version":"1"},"procedures":{},"definitions":{"User":{"properties":{"id":{"type":"string"}},"metadata":{"id":"User"}}}}"#,
/// );
/// ```
///
/// Procedures are not supported yet. `procedures` is always encoded as an empty object.
#[derive(Debug, Clone, PartialEq)]
pub struct AppDef {
    /// Corresponds to `schemaVersion`. Defaults to [`SCHEMA_VERSION`].
    pub schema_version: String,
    pub info: Option<AppInfo>,
    /// Corresponds to `externalDocs`
    pub external_docs: Option<ExternalDocs>,
    /// Every type that the code generators should create, as `(id, definition)` pairs
    pub definitions: Vec<(String, TypeDef)>,
}

/// Metadata about the API
#[derive(Debug, Clone, PartialEq, Default)]
pub struct AppInfo {
    pub title: Option<String>,
    pub description: Option<String>,
    /// The current client version. Arri clients send this in the `client-version` header.
    pub version: Option<String>,
}

/// A link to external documentation for the API
#[derive(Debug, Clone, PartialEq)]
pub struct ExternalDocs {
    pub description: Option<String>,
    pub url: String,
}

impl Default for AppDef {
    fn default() -> Self {
        Self::new()
    }
}

impl AppDef {
    /// An app definition with no info and no definitions
    pub fn new() -> Self {
        Self {
            schema_version: SCHEMA_VERSION.to_string(),
            info: None,
            external_docs: None,
            definitions: Vec::new(),
        }
    }

    /// Build an app definition from Rust types. See [`AppDefBuilder`].
    pub fn builder() -> AppDefBuilder {
        AppDefBuilder::default()
    }

    /// Serialize this app definition as JSON
    pub fn to_json(&self) -> String {
        crate::json::to_string(self).expect("app definitions contain no floats and cannot fail")
    }
}

impl AppInfo {
    fn is_empty(&self) -> bool {
        self.title.is_none() && self.description.is_none() && self.version.is_none()
    }
}

/// Builds an [`AppDef`] from Rust types.
///
/// Every type added with [`AppDefBuilder::add_type`] shares one [`SchemaContext`], so each named
/// type (including nested ones) shows up once in `definitions`, in the order it was first encountered.
#[derive(Debug, Default)]
pub struct AppDefBuilder {
    info: AppInfo,
    external_docs: Option<ExternalDocs>,
    ctx: SchemaContext,
}

impl AppDefBuilder {
    pub fn title(mut self, title: impl Into<String>) -> Self {
        self.info.title = Some(title.into());
        self
    }

    pub fn description(mut self, description: impl Into<String>) -> Self {
        self.info.description = Some(description.into());
        self
    }

    pub fn version(mut self, version: impl Into<String>) -> Self {
        self.info.version = Some(version.into());
        self
    }

    pub fn external_docs(mut self, url: impl Into<String>, description: Option<String>) -> Self {
        self.external_docs = Some(ExternalDocs {
            description,
            url: url.into(),
        });
        self
    }

    /// Add `T` and every named type it uses to `definitions`.
    ///
    /// Only named types (structs, enums, and unions) become definitions, so adding a type like
    /// `Vec<User>` adds `User`.
    pub fn add_type<T: Type + ?Sized>(mut self) -> Self {
        T::type_def(&mut self.ctx);
        self
    }

    /// Add a hand-written type definition under `id`.
    ///
    /// Definitions keep the order they were added in, mixed with the types from [`AppDefBuilder::add_type`].
    /// `metadata.id` is set to `id`. Named types nested inside `def` are not added as definitions of their own.
    pub fn definition(mut self, id: impl Into<String>, def: TypeDef) -> Self {
        self.ctx.add_definition(id, def);
        self
    }

    /// Returns an error if two definitions with the same id have different schemas
    pub fn build(self) -> Result<AppDef, SchemaError> {
        Ok(AppDef {
            schema_version: SCHEMA_VERSION.to_string(),
            info: (!self.info.is_empty()).then_some(self.info),
            external_docs: self.external_docs,
            definitions: self.ctx.into_definitions()?,
        })
    }
}

impl Encode for AppDef {
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        // schemaVersion, procedures, and definitions are always present
        let len = 3 + self.info.is_some() as usize + self.external_docs.is_some() as usize;
        e.begin_object(len)?;
        e.encode_key("schemaVersion")?;
        e.encode_str(&self.schema_version)?;
        if let Some(info) = &self.info {
            e.encode_key("info")?;
            info.encode(e)?;
        }
        if let Some(docs) = &self.external_docs {
            e.encode_key("externalDocs")?;
            docs.encode(e)?;
        }
        e.encode_key("procedures")?;
        e.begin_object(0)?;
        e.end_object()?;
        e.encode_key("definitions")?;
        e.begin_object(self.definitions.len())?;
        for (id, def) in &self.definitions {
            e.encode_key(id)?;
            def.encode(e)?;
        }
        e.end_object()?;
        e.end_object()
    }
}

impl Encode for AppInfo {
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        let len = self.title.is_some() as usize
            + self.description.is_some() as usize
            + self.version.is_some() as usize;
        e.begin_object(len)?;
        if let Some(title) = &self.title {
            e.encode_key("title")?;
            e.encode_str(title)?;
        }
        if let Some(description) = &self.description {
            e.encode_key("description")?;
            e.encode_str(description)?;
        }
        if let Some(version) = &self.version {
            e.encode_key("version")?;
            e.encode_str(version)?;
        }
        e.end_object()
    }
}

impl Encode for ExternalDocs {
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        e.begin_object(1 + self.description.is_some() as usize)?;
        if let Some(description) = &self.description {
            e.encode_key("description")?;
            e.encode_str(description)?;
        }
        e.encode_key("url")?;
        e.encode_str(&self.url)?;
        e.end_object()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Nullable, Primitive};

    #[derive(crate::Arri)]
    struct Author {
        name: String,
    }

    #[derive(crate::Arri)]
    struct Post {
        id: String,
        author: Author,
        tags: Vec<String>,
    }

    #[test]
    fn empty_app_def() {
        assert_eq!(
            AppDef::new().to_json(),
            r#"{"schemaVersion":"0.0.9","procedures":{},"definitions":{}}"#
        );
        // a builder with no info leaves `info` out entirely
        assert_eq!(AppDef::builder().build().unwrap(), AppDef::new());
    }

    #[test]
    fn builder_collects_nested_definitions_once() {
        let app = AppDef::builder()
            .description("posts")
            .external_docs("https://example.com", Some("docs".to_string()))
            .add_type::<Vec<Post>>()
            .add_type::<Nullable<Author>>()
            .add_type::<String>()
            .build()
            .unwrap();
        let ids: Vec<&str> = app.definitions.iter().map(|(id, _)| id.as_str()).collect();
        assert_eq!(ids, ["Post", "Author"]);
        assert_eq!(
            app.to_json(),
            concat!(
                r#"{"schemaVersion":"0.0.9","info":{"description":"posts"},"#,
                r#""externalDocs":{"description":"docs","url":"https://example.com"},"procedures":{},"definitions":{"#,
                r#""Post":{"properties":{"id":{"type":"string"},"author":{"properties":{"name":{"type":"string"}},"metadata":{"id":"Author"}},"tags":{"elements":{"type":"string"}}},"metadata":{"id":"Post"}},"#,
                r#""Author":{"properties":{"name":{"type":"string"}},"metadata":{"id":"Author"}}}}"#,
            )
        );
    }

    #[test]
    fn manual_definitions() {
        let mut app = AppDef::new();
        app.info = Some(AppInfo {
            version: Some("2".to_string()),
            ..Default::default()
        });
        app.definitions
            .push(("Id".to_string(), TypeDef::scalar(Primitive::String)));
        assert_eq!(
            app.to_json(),
            r#"{"schemaVersion":"0.0.9","info":{"version":"2"},"procedures":{},"definitions":{"Id":{"type":"string"}}}"#
        );
    }

    #[test]
    fn builder_manual_definitions() {
        let app = AppDef::builder()
            .definition("Id", TypeDef::scalar(Primitive::String))
            .add_type::<Author>()
            // identical to the derived schema, so it's merged instead of reported as a collision
            .definition(
                "Author",
                TypeDef::properties(crate::Properties {
                    properties: vec![("name".to_string(), TypeDef::scalar(Primitive::String))],
                    ..Default::default()
                }),
            )
            .build()
            .unwrap();
        assert_eq!(
            app.to_json(),
            concat!(
                r#"{"schemaVersion":"0.0.9","procedures":{},"definitions":{"#,
                r#""Id":{"type":"string","metadata":{"id":"Id"}},"#,
                r#""Author":{"properties":{"name":{"type":"string"}},"metadata":{"id":"Author"}}}}"#,
            )
        );

        let err = AppDef::builder()
            .add_type::<Author>()
            .definition("Author", TypeDef::scalar(Primitive::String))
            .build()
            .unwrap_err();
        assert_eq!(
            err.collisions()[0].second_type,
            "<manually added definition>"
        );

        let err = AppDef::builder()
            .definition("Id", TypeDef::scalar(Primitive::String))
            .definition("Id", TypeDef::scalar(Primitive::Int32))
            .build()
            .unwrap_err();
        assert_eq!(err.collisions().len(), 1);
    }

    #[test]
    fn builder_reports_collisions() {
        mod a {
            #[derive(crate::Arri)]
            pub struct Thing {
                pub a: String,
            }
        }
        mod b {
            #[derive(crate::Arri)]
            pub struct Thing {
                pub b: String,
            }
        }
        let err = AppDef::builder()
            .add_type::<a::Thing>()
            .add_type::<b::Thing>()
            .build()
            .unwrap_err();
        assert_eq!(err.collisions().len(), 1);
    }
}
