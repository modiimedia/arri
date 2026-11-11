use std::{
    borrow::Cow,
    collections::{BTreeMap, HashMap, VecDeque},
    rc::Rc,
    sync::Arc,
};

use crate::{Form, Type, TypeDef};

/// A type that can describe itself with an Arri Type Definition
#[diagnostic::on_unimplemented(
    message = "`{Self}` is not supported by arri",
    label = "`{Self}` does not implement `ArriSchema`",
    note = "use `#[derive(ArriModel)]` on your own types",
    note = "`Option<T>` is only supported as the type of a struct field. Use `arri::Nullable<T>` for values that can be `null`"
)]
pub trait ArriSchema {
    /// The name used for this type when it's a type argument of a generic type.
    ///
    /// Generic types build their `metadata.id` from the generic names of their type arguments
    /// followed by their own name (`Page<User>` becomes `UserPage`). The generic name must describe
    /// the full shape of the type so that instantiations with different schemas get different ids.
    ///
    /// - Named types (objects, enums, and unions) return their `metadata.id`
    /// - Scalars return a descriptive name (`String`, `Int32`, `Timestamp`, etc.)
    /// - Types that change the shape of their inner type add a suffix to its name:
    ///   `Nullable<User>` is `UserNullable`, `Vec<User>` is `UserArray`, and `HashMap<String, User>` is `UserRecord`
    /// - Types that don't change the shape of their inner type (`Box<T>`, `Rc<T>`, `Arc<T>`) return the inner type's name
    ///
    /// Because every part is a suffix, nested types are unambiguous: `Vec<Nullable<User>>` is
    /// `UserNullableArray` while `Nullable<Vec<User>>` is `UserArrayNullable`.
    ///
    /// Only named types use this as their `metadata.id`. For every other type it's just a fragment of a
    /// generic type's id. Arrays, records, and nullable values never set a `metadata.id` of their own.
    fn generic_name() -> Cow<'static, str>;

    /// Build the type definition for this type.
    ///
    /// Use [`type_def_of`] to get the type definition of a type outside of an `ArriSchema` implementation.
    ///
    /// Named types (structs, enums, and unions) should build their definition inside of
    /// [`SchemaContext::named`].
    fn type_def(ctx: &mut SchemaContext) -> TypeDef;
}

/// Returns the [`TypeDef`] for `T`
pub fn type_def_of<T: ArriSchema + ?Sized>() -> TypeDef {
    T::type_def(&mut SchemaContext::new())
}

/// Returns every named type (struct, enum, or union) used by `T`, including `T` itself if it's named.
///
/// See [`SchemaContext::into_definitions`].
pub fn definitions_of<T: ArriSchema + ?Sized>() -> Result<Vec<(String, TypeDef)>, SchemaError> {
    let mut ctx = SchemaContext::new();
    T::type_def(&mut ctx);
    ctx.into_definitions()
}

/// State that is shared while building type definitions.
///
/// - It tracks which named types are currently being built so that recursive types can be
///   closed with a `ref` schema instead of recursing forever.
/// - It records every named type that gets built so that they can be listed in the `definitions`
///   section of an app definition (see [`SchemaContext::into_definitions`]).
/// - It detects when two Rust types with different schemas produce the same id.
///
/// The same context can be passed to multiple [`ArriSchema::type_def`] calls to collect the
/// definitions of many types at once:
///
/// ```
/// use arri::{ArriModel, ArriSchema, SchemaContext};
///
/// #[derive(ArriModel)]
/// struct User {
///     id: String,
/// }
///
/// #[derive(ArriModel)]
/// struct GetUserParams {
///     id: String,
/// }
///
/// let mut ctx = SchemaContext::new();
/// GetUserParams::type_def(&mut ctx);
/// User::type_def(&mut ctx);
/// let definitions = ctx.into_definitions().unwrap();
/// let ids: Vec<&str> = definitions.iter().map(|(id, _)| id.as_str()).collect();
/// assert_eq!(ids, ["GetUserParams", "User"]);
/// ```
#[derive(Debug, Default)]
pub struct SchemaContext {
    /// the id and rust type of each named type that is currently being built
    in_progress: Vec<(String, &'static str)>,
    definitions: Vec<Definition>,
    /// maps an id to its position in `definitions`
    index: HashMap<String, usize>,
    collisions: Vec<SchemaCollision>,
}

#[derive(Debug)]
struct Definition {
    id: String,
    rust_type: &'static str,
    /// `None` while the type is still being built
    def: Option<TypeDef>,
}

impl SchemaContext {
    pub fn new() -> Self {
        Self::default()
    }

    /// Returns `true` if a type with this id is currently being built
    pub fn is_building(&self, id: &str) -> bool {
        self.in_progress.iter().any(|(item, _)| item == id)
    }

    /// Build the definition of the named type `T`.
    ///
    /// If `T` is already being built (meaning the type is recursive) a `ref` schema is returned instead.
    /// Otherwise `build` is called, `metadata.id` is set on the result, and the result is recorded
    /// as a definition.
    pub fn named<T: ?Sized>(
        &mut self,
        id: impl Into<String>,
        build: impl FnOnce(&mut Self) -> TypeDef,
    ) -> TypeDef {
        let id = id.into();
        let rust_type = std::any::type_name::<T>();
        if let Some((_, building)) = self.in_progress.iter().find(|(item, _)| *item == id) {
            if *building == rust_type {
                return TypeDef::reference(id);
            }
            // A different type with the same id is still being built so its schema can't be
            // compared yet. Since a `ref` would point to the wrong type this is always a collision.
            let first = *building;
            self.add_collision(&id, first, rust_type);
        }
        // the slot is reserved before building so that definitions are listed in the order they're
        // first encountered (parents before children)
        if !self.index.contains_key(&id) {
            self.index.insert(id.clone(), self.definitions.len());
            self.definitions.push(Definition {
                id: id.clone(),
                rust_type,
                def: None,
            });
        }
        self.in_progress.push((id, rust_type));
        let mut def = build(self);
        let (id, _) = self.in_progress.pop().expect("in_progress cannot be empty");
        def.metadata.id = Some(id.clone());
        self.record(&id, rust_type, &def);
        def
    }

    fn record(&mut self, id: &str, rust_type: &'static str, def: &TypeDef) {
        let entry = &mut self.definitions[self.index[id]];
        let first = entry.rust_type;
        match &entry.def {
            None if first == rust_type => entry.def = Some(def.clone()),
            // the slot belongs to a different type that's still being built. The collision has already been recorded.
            None => {}
            // the same type (or a different type with an identical schema) has already been recorded
            Some(existing) if same_definition(existing, def) => {}
            Some(_) => self.add_collision(id, first, rust_type),
        }
    }

    fn add_collision(&mut self, id: &str, first_type: &'static str, second_type: &'static str) {
        let collision = SchemaCollision {
            id: id.to_string(),
            first_type,
            second_type,
        };
        if !self.collisions.contains(&collision) {
            self.collisions.push(collision);
        }
    }

    /// Returns every named type (struct, enum, or union) that was built with this context as
    /// `(id, definition)` pairs.
    ///
    /// - Definitions are listed in the order they were first encountered
    /// - Each definition is complete. Nested named types are included inline (only recursive references use `ref`)
    /// - Different Rust types that produce identical schemas with the same id are merged into one definition
    ///
    /// Returns an error if different Rust types produced different schemas with the same id.
    pub fn into_definitions(self) -> Result<Vec<(String, TypeDef)>, SchemaError> {
        if !self.collisions.is_empty() {
            return Err(SchemaError {
                collisions: self.collisions,
            });
        }
        Ok(self
            .definitions
            .into_iter()
            .filter_map(|entry| entry.def.map(|def| (entry.id, def)))
            .collect())
    }
}

/// Two different Rust types produced different schemas with the same id
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SchemaCollision {
    pub id: String,
    /// The Rust type that first used the id (as reported by [`std::any::type_name`])
    pub first_type: &'static str,
    /// The Rust type that used the id with a different schema
    pub second_type: &'static str,
}

impl std::fmt::Display for SchemaCollision {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "the id \"{}\" is used by `{}` and `{}` which have different schemas",
            self.id, self.first_type, self.second_type
        )
    }
}

/// An error produced by [`SchemaContext::into_definitions`]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SchemaError {
    collisions: Vec<SchemaCollision>,
}

impl SchemaError {
    pub fn collisions(&self) -> &[SchemaCollision] {
        &self.collisions
    }
}

impl std::fmt::Display for SchemaError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        for (i, collision) in self.collisions.iter().enumerate() {
            if i > 0 {
                f.write_str("\n")?;
            }
            write!(f, "{collision}")?;
        }
        f.write_str(
            "\nType ids must be unique. Rename one of the types or give it a different id with `#[arri(id = \"...\")]`.",
        )
    }
}

impl std::error::Error for SchemaError {}

/// Compare two definitions that share an id.
///
/// Nested named types are compared by id only (rather than by their contents) because each of them
/// is compared against its own definition separately. This also means that a nested type that was
/// closed with a `ref` (because it was recursive) matches the same type written out inline.
fn same_definition(a: &TypeDef, b: &TypeDef) -> bool {
    a.is_nullable == b.is_nullable && a.metadata == b.metadata && same_form(&a.form, &b.form)
}

fn nested_id(def: &TypeDef) -> Option<&str> {
    match &def.form {
        Form::Ref(id) => Some(id),
        _ => def.metadata.id.as_deref(),
    }
}

fn same_nested(a: &TypeDef, b: &TypeDef) -> bool {
    match (nested_id(a), nested_id(b)) {
        (Some(a_id), Some(b_id)) => a_id == b_id && a.is_nullable == b.is_nullable,
        (None, None) => same_definition(a, b),
        _ => false,
    }
}

fn same_entries(a: &[(String, TypeDef)], b: &[(String, TypeDef)]) -> bool {
    a.len() == b.len()
        && a.iter()
            .zip(b)
            .all(|((a_key, a_def), (b_key, b_def))| a_key == b_key && same_nested(a_def, b_def))
}

fn same_form(a: &Form, b: &Form) -> bool {
    match (a, b) {
        (Form::Empty, Form::Empty) => true,
        (Form::Type(a), Form::Type(b)) => a == b,
        (Form::Enum(a), Form::Enum(b)) => a == b,
        (Form::Elements(a), Form::Elements(b)) | (Form::Values(a), Form::Values(b)) => {
            same_nested(a, b)
        }
        (Form::Properties(a), Form::Properties(b)) => {
            a.is_strict == b.is_strict
                && same_entries(&a.properties, &b.properties)
                && same_entries(&a.optional_properties, &b.optional_properties)
        }
        (Form::Union(a), Form::Union(b)) => {
            a.tag_key == b.tag_key
                && a.value_key == b.value_key
                && same_entries(&a.variants, &b.variants)
        }
        (Form::Ref(a), Form::Ref(b)) => a == b,
        _ => false,
    }
}

macro_rules! impl_schema_scalar {
    ($($ty:ty => $variant:ident, $name:literal);* $(;)?) => {
        $(
            impl ArriSchema for $ty {
                fn generic_name() -> Cow<'static, str> {
                    Cow::Borrowed($name)
                }

                fn type_def(_: &mut SchemaContext) -> TypeDef {
                    TypeDef::scalar(Type::$variant)
                }
            }
        )*
    };
}

impl_schema_scalar! {
    bool => Boolean, "Boolean";
    f32 => Float32, "Float32";
    f64 => Float64, "Float64";
    i8 => Int8, "Int8";
    u8 => Uint8, "Uint8";
    i16 => Int16, "Int16";
    u16 => Uint16, "Uint16";
    i32 => Int32, "Int32";
    u32 => Uint32, "Uint32";
    i64 => Int64, "Int64";
    u64 => Uint64, "Uint64";
    str => String, "String";
    String => String, "String";
    Cow<'_, str> => String, "String";
}

macro_rules! impl_schema_forward {
    ($($ty:ident),*) => {
        $(
            impl<T: ArriSchema + ?Sized> ArriSchema for $ty<T> {
                fn generic_name() -> Cow<'static, str> {
                    T::generic_name()
                }

                fn type_def(ctx: &mut SchemaContext) -> TypeDef {
                    T::type_def(ctx)
                }
            }
        )*
    };
}

impl_schema_forward!(Box, Rc, Arc);

impl<T: ArriSchema + ?Sized> ArriSchema for &T {
    fn generic_name() -> Cow<'static, str> {
        T::generic_name()
    }

    fn type_def(ctx: &mut SchemaContext) -> TypeDef {
        T::type_def(ctx)
    }
}

fn list_name<T: ArriSchema + ?Sized>() -> Cow<'static, str> {
    Cow::Owned(format!("{}Array", T::generic_name()))
}

fn record_name<T: ArriSchema + ?Sized>() -> Cow<'static, str> {
    Cow::Owned(format!("{}Record", T::generic_name()))
}

macro_rules! impl_schema_list {
    ($($ty:ty),*) => {
        $(
            impl<T: ArriSchema> ArriSchema for $ty {
                fn generic_name() -> Cow<'static, str> {
                    list_name::<T>()
                }

                fn type_def(ctx: &mut SchemaContext) -> TypeDef {
                    TypeDef::elements(T::type_def(ctx))
                }
            }
        )*
    };
}

impl_schema_list!([T], Vec<T>, VecDeque<T>);

impl<T: ArriSchema, const N: usize> ArriSchema for [T; N] {
    fn generic_name() -> Cow<'static, str> {
        list_name::<T>()
    }

    fn type_def(ctx: &mut SchemaContext) -> TypeDef {
        TypeDef::elements(T::type_def(ctx))
    }
}

impl<V: ArriSchema, S> ArriSchema for HashMap<String, V, S> {
    fn generic_name() -> Cow<'static, str> {
        record_name::<V>()
    }

    fn type_def(ctx: &mut SchemaContext) -> TypeDef {
        TypeDef::values(V::type_def(ctx))
    }
}

impl<V: ArriSchema> ArriSchema for BTreeMap<String, V> {
    fn generic_name() -> Cow<'static, str> {
        record_name::<V>()
    }

    fn type_def(ctx: &mut SchemaContext) -> TypeDef {
        TypeDef::values(V::type_def(ctx))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Form, Nullable, Value};

    #[test]
    fn scalar_and_container_type_defs() {
        assert_eq!(type_def_of::<String>().to_json(), r#"{"type":"string"}"#);
        assert_eq!(
            type_def_of::<Vec<Nullable<u64>>>().to_json(),
            r#"{"elements":{"type":"uint64","isNullable":true}}"#
        );
        assert_eq!(
            type_def_of::<HashMap<String, Vec<bool>>>().to_json(),
            r#"{"values":{"elements":{"type":"boolean"}}}"#
        );
        assert_eq!(type_def_of::<Value>().form, Form::Empty);
    }

    #[test]
    fn generic_names() {
        assert_eq!(<Vec<Vec<i32>>>::generic_name(), "Int32ArrayArray");
        assert_eq!(
            <BTreeMap<String, Nullable<String>>>::generic_name(),
            "StringNullableRecord"
        );
        assert_eq!(<Nullable<Box<i8>>>::generic_name(), "Int8Nullable");
        assert_eq!(<Vec<Nullable<i8>>>::generic_name(), "Int8NullableArray");
        assert_eq!(<Nullable<Vec<i8>>>::generic_name(), "Int8ArrayNullable");
        assert_eq!(<Box<str>>::generic_name(), "String");
    }

    #[test]
    fn recursive_types_produce_refs() {
        let mut ctx = SchemaContext::new();
        let def = ctx.named::<()>("Tree", |ctx| {
            assert!(ctx.is_building("Tree"));
            TypeDef::elements(ctx.named::<()>("Tree", |_| unreachable!()))
        });
        assert_eq!(
            def.to_json(),
            r#"{"elements":{"ref":"Tree"},"metadata":{"id":"Tree"}}"#
        );
        assert!(!ctx.is_building("Tree"));
    }
}
