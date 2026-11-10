use std::{
    borrow::Cow,
    collections::{BTreeMap, HashMap, VecDeque},
    rc::Rc,
    sync::Arc,
};

use crate::{Type, TypeDef};

/// A type that can describe itself with an Arri Type Definition
#[diagnostic::on_unimplemented(
    message = "`{Self}` is not supported by arri",
    label = "`{Self}` does not implement `ArriSchema`",
    note = "use `#[derive(ArriModel)]` on your own types",
    note = "`Option<T>` is only supported as the type of a struct field. Use `arri::Nullable<T>` for values that can be `null`"
)]
pub trait ArriSchema {
    /// A name for this type.
    ///
    /// For named types (objects, enums, and unions) this is the `metadata.id`.
    /// Other types return a descriptive name (e.g. `String`, `Int32Array`).
    /// Wrappers that don't change the shape of the schema (`Nullable<T>`, `Box<T>`, `Rc<T>`, `Arc<T>`)
    /// return the name of the inner type.
    /// These names are used to build ids for generic types (`Page<User>` becomes `PageUser`).
    fn type_name() -> Cow<'static, str>;

    /// Build the type definition for this type.
    ///
    /// Use [`type_def_of`] to get the type definition of a type outside of an `ArriSchema` implementation.
    fn type_def(ctx: &mut SchemaContext) -> TypeDef;
}

/// Returns the [`TypeDef`] for `T`
pub fn type_def_of<T: ArriSchema + ?Sized>() -> TypeDef {
    T::type_def(&mut SchemaContext::new())
}

/// State that is shared while building a type definition.
///
/// It tracks which named types are currently being built so that recursive types
/// can be closed with a `ref` schema instead of recursing forever.
#[derive(Debug, Default)]
pub struct SchemaContext {
    in_progress: Vec<String>,
}

impl SchemaContext {
    pub fn new() -> Self {
        Self::default()
    }

    /// Returns `true` if a type with this id is currently being built
    pub fn is_building(&self, id: &str) -> bool {
        self.in_progress.iter().any(|item| item == id)
    }

    /// Build a named type definition.
    ///
    /// If a type with the same id is already being built (meaning the type is recursive) a `ref`
    /// schema is returned instead. Otherwise `build` is called and `metadata.id` is set on the result.
    pub fn named(
        &mut self,
        id: impl Into<String>,
        build: impl FnOnce(&mut Self) -> TypeDef,
    ) -> TypeDef {
        let id = id.into();
        if self.is_building(&id) {
            return TypeDef::reference(id);
        }
        self.in_progress.push(id);
        let mut def = build(self);
        let id = self.in_progress.pop().expect("in_progress cannot be empty");
        def.metadata.id = Some(id);
        def
    }
}

macro_rules! impl_schema_scalar {
    ($($ty:ty => $variant:ident, $name:literal);* $(;)?) => {
        $(
            impl ArriSchema for $ty {
                fn type_name() -> Cow<'static, str> {
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
                fn type_name() -> Cow<'static, str> {
                    T::type_name()
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
    fn type_name() -> Cow<'static, str> {
        T::type_name()
    }

    fn type_def(ctx: &mut SchemaContext) -> TypeDef {
        T::type_def(ctx)
    }
}

fn list_name<T: ArriSchema + ?Sized>() -> Cow<'static, str> {
    Cow::Owned(format!("{}Array", T::type_name()))
}

fn record_name<T: ArriSchema + ?Sized>() -> Cow<'static, str> {
    Cow::Owned(format!("{}Record", T::type_name()))
}

macro_rules! impl_schema_list {
    ($($ty:ty),*) => {
        $(
            impl<T: ArriSchema> ArriSchema for $ty {
                fn type_name() -> Cow<'static, str> {
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
    fn type_name() -> Cow<'static, str> {
        list_name::<T>()
    }

    fn type_def(ctx: &mut SchemaContext) -> TypeDef {
        TypeDef::elements(T::type_def(ctx))
    }
}

impl<V: ArriSchema, S> ArriSchema for HashMap<String, V, S> {
    fn type_name() -> Cow<'static, str> {
        record_name::<V>()
    }

    fn type_def(ctx: &mut SchemaContext) -> TypeDef {
        TypeDef::values(V::type_def(ctx))
    }
}

impl<V: ArriSchema> ArriSchema for BTreeMap<String, V> {
    fn type_name() -> Cow<'static, str> {
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
    fn type_names() {
        assert_eq!(<Vec<Vec<i32>>>::type_name(), "Int32ArrayArray");
        assert_eq!(
            <BTreeMap<String, Nullable<String>>>::type_name(),
            "StringRecord"
        );
        assert_eq!(<Nullable<Box<i8>>>::type_name(), "Int8");
        assert_eq!(<Box<str>>::type_name(), "String");
    }

    #[test]
    fn recursive_types_produce_refs() {
        let mut ctx = SchemaContext::new();
        let def = ctx.named("Tree", |ctx| {
            assert!(ctx.is_building("Tree"));
            TypeDef::elements(ctx.named("Tree", |_| unreachable!()))
        });
        assert_eq!(
            def.to_json(),
            r#"{"elements":{"ref":"Tree"},"metadata":{"id":"Tree"}}"#
        );
        assert!(!ctx.is_building("Tree"));
    }
}
