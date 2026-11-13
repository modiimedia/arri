use std::collections::HashSet;

use proc_macro2::{Span, TokenStream, TokenTree};
use quote::{ToTokens, format_ident, quote, quote_spanned};
use syn::{
    Data, DeriveInput, Fields, GenericArgument, Generics, Ident, LitStr, PathArguments, Type,
    WherePredicate, ext::IdentExt, spanned::Spanned,
};

use crate::{
    attr::{ContainerAttrs, Docs, FieldAttrs, VariantAttrs},
    case::RenameRule,
};

pub struct Container<'a> {
    pub ident: &'a Ident,
    pub generics: &'a Generics,
    /// path to the arri crate
    pub krate: TokenStream,
    /// the type id without generic arguments appended
    pub id: String,
    pub docs: Docs,
    pub strict: bool,
    pub body: Body<'a>,
}

pub enum Body<'a> {
    /// struct with named fields
    Struct(Vec<Field<'a>>),
    /// struct with exactly one unnamed field
    Newtype(&'a Type),
    /// enum with only unit variants (the "enum" schema form)
    Enum(Vec<EnumValue<'a>>),
    /// any other enum (the "union" schema form)
    Union(Tagging, Vec<Variant<'a>>),
}

pub struct Field<'a> {
    pub ident: &'a Ident,
    pub key: String,
    /// The type used for the schema / encoding / decoding. For `Option<T>` fields this is `T`.
    /// For skipped fields this is the type exactly as written.
    pub ty: &'a Type,
    pub optional: bool,
    pub docs: Docs,
    /// `Some` if the field is excluded from the schema and encoding (`#[arri(skip)]`)
    pub skip: Option<Skip>,
}

/// How a skipped field gets its value when decoding
pub enum Skip {
    /// `Default::default()`
    Default,
    /// `#[arri(skip, default = "path::to::fn")]`
    With(syn::Path),
}

impl Field<'_> {
    pub fn is_skipped(&self) -> bool {
        self.skip.is_some()
    }

    /// The expression that produces the value of a skipped field
    pub fn skipped_value(&self) -> TokenStream {
        let ty = self.ty;
        match &self.skip {
            Some(Skip::With(path)) => quote_spanned!(path.span()=> #path()),
            _ => quote_spanned!(ty.span()=> <#ty as ::core::default::Default>::default()),
        }
    }
}

pub struct EnumValue<'a> {
    pub ident: &'a Ident,
    pub value: String,
}

pub enum Tagging {
    External,
    Internal { tag_key: String },
    Adjacent { tag_key: String, value_key: String },
}

pub struct Variant<'a> {
    pub ident: &'a Ident,
    pub tag: String,
    pub docs: Docs,
    pub kind: VariantKind<'a>,
}

pub enum VariantKind<'a> {
    Unit,
    Newtype(&'a Type),
    Struct(Vec<Field<'a>>),
}

/// If `ty` is `Option<T>` returns `T`
fn option_inner(ty: &Type) -> Option<&Type> {
    match ty {
        Type::Group(group) => option_inner(&group.elem),
        Type::Paren(paren) => option_inner(&paren.elem),
        Type::Path(path) if path.qself.is_none() => {
            let segment = path.path.segments.last()?;
            if segment.ident != "Option" {
                return None;
            }
            let PathArguments::AngleBracketed(args) = &segment.arguments else {
                return None;
            };
            if args.args.len() != 1 {
                return None;
            }
            match args.args.first()? {
                GenericArgument::Type(inner) => Some(inner),
                _ => None,
            }
        }
        _ => None,
    }
}

fn error<T>(span: Span, message: impl std::fmt::Display) -> syn::Result<T> {
    Err(syn::Error::new(span, message))
}

fn reject_container_attr<T: Spanned>(
    attr: &Option<T>,
    name: &str,
    location: &str,
) -> syn::Result<()> {
    match attr {
        Some(value) => error(
            value.span(),
            format!("`{name}` is not supported on {location}"),
        ),
        None => Ok(()),
    }
}

/// Newtype fields use the schema of their type directly so field attributes don't apply to them
fn reject_field_attrs(field: &syn::Field, location: &str) -> syn::Result<()> {
    let attrs = FieldAttrs::parse(&field.attrs)?;
    if attrs.is_empty() {
        return Ok(());
    }
    let span = attrs
        .skip
        .as_ref()
        .map(|p| p.span())
        .or(attrs.rename.as_ref().map(|r| r.span()))
        .or(attrs.default.as_ref().map(|(_, lit)| lit.span()))
        .unwrap_or_else(|| field.span());
    error(
        span,
        format!("arri field attributes are not supported on {location}"),
    )
}

fn parse_fields<'a>(
    fields: &'a syn::FieldsNamed,
    rename_all: Option<RenameRule>,
) -> syn::Result<Vec<Field<'a>>> {
    let mut output: Vec<Field<'a>> = Vec::with_capacity(fields.named.len());
    let mut keys = HashSet::new();
    for field in &fields.named {
        let ident = field.ident.as_ref().expect("named fields have identifiers");
        let attrs = FieldAttrs::parse(&field.attrs)?;
        if attrs.skip.is_some() {
            reject_container_attr(&attrs.rename, "rename", "skipped fields")?;
            let skip = match attrs.default {
                Some((path, _)) => Skip::With(path),
                None => Skip::Default,
            };
            // skipped fields keep their original type and don't reserve a key
            output.push(Field {
                ident,
                key: ident.unraw().to_string(),
                ty: &field.ty,
                optional: false,
                docs: Docs::default(),
                skip: Some(skip),
            });
            continue;
        }
        if let Some((_, lit)) = &attrs.default {
            return error(
                lit.span(),
                "`default` can only be used alongside `skip` (`#[arri(skip, default = \"...\")]`)",
            );
        }
        let key = match &attrs.rename {
            Some(rename) => rename.value(),
            None => {
                let name = ident.unraw().to_string();
                match rename_all {
                    Some(rule) => rule.apply(&name),
                    None => name,
                }
            }
        };
        if !keys.insert(key.clone()) {
            return error(
                field.span(),
                format!("multiple fields would be serialized with the key \"{key}\""),
            );
        }
        let (ty, optional) = match option_inner(&field.ty) {
            Some(inner) => (inner, true),
            None => (&field.ty, false),
        };
        output.push(Field {
            ident,
            key,
            ty,
            optional,
            docs: Docs::parse(&field.attrs)?,
            skip: None,
        });
    }
    Ok(output)
}

impl<'a> Container<'a> {
    pub fn from_input(input: &'a DeriveInput) -> syn::Result<Self> {
        let attrs = ContainerAttrs::parse(&input.attrs)?;
        let docs = Docs::parse(&input.attrs)?;
        let krate = match &attrs.krate {
            Some(path) => quote!(#path),
            None => quote!(::arri),
        };
        let id = match &attrs.id {
            Some(id) => id.value(),
            None => input.ident.unraw().to_string(),
        };
        let rename_all = attrs.rename_all.as_ref().map(|(rule, _)| *rule);
        let strict = attrs.strict.is_some();

        let body = match &input.data {
            Data::Struct(data) => {
                reject_container_attr(&attrs.tag_key, "tag_key", "structs")?;
                reject_container_attr(&attrs.value_key, "value_key", "structs")?;
                match &data.fields {
                    Fields::Named(fields) => Body::Struct(parse_fields(fields, rename_all)?),
                    Fields::Unnamed(fields) if fields.unnamed.len() == 1 => {
                        let location =
                            "newtype structs since they use the schema of the inner type";
                        reject_container_attr(&attrs.id, "id", location)?;
                        reject_container_attr(&attrs.strict, "strict", location)?;
                        reject_container_attr(
                            &attrs.rename_all.as_ref().map(|(_, lit)| lit),
                            "rename_all",
                            location,
                        )?;
                        let field = fields.unnamed.first().expect("length was checked");
                        reject_field_attrs(field, "newtype structs")?;
                        if option_inner(&field.ty).is_some() {
                            return error(
                                field.ty.span(),
                                "`Option<T>` can only be used for struct fields. Use `arri::Nullable<T>` for values that can be null",
                            );
                        }
                        Body::Newtype(&field.ty)
                    }
                    Fields::Unnamed(_) => {
                        return error(
                            input.ident.span(),
                            "`Arri` can only be derived for tuple structs with exactly one field",
                        );
                    }
                    Fields::Unit => {
                        return error(
                            input.ident.span(),
                            "`Arri` cannot be derived for unit structs. Use a struct with no fields (`struct Foo {}`) instead",
                        );
                    }
                }
            }
            Data::Enum(data) => {
                if data.variants.is_empty() {
                    return error(
                        input.ident.span(),
                        "`Arri` cannot be derived for enums with no variants",
                    );
                }
                let tagging = match (&attrs.tag_key, &attrs.value_key) {
                    (None, None) => Tagging::External,
                    (Some(tag_key), None) => Tagging::Internal {
                        tag_key: tag_key.value(),
                    },
                    (Some(tag_key), Some(value_key)) => {
                        if tag_key.value() == value_key.value() {
                            return error(
                                value_key.span(),
                                "`value_key` must be different from `tag_key`",
                            );
                        }
                        Tagging::Adjacent {
                            tag_key: tag_key.value(),
                            value_key: value_key.value(),
                        }
                    }
                    (None, Some(value_key)) => {
                        return error(
                            value_key.span(),
                            "`value_key` can only be used alongside `tag_key`",
                        );
                    }
                };
                let all_unit = data
                    .variants
                    .iter()
                    .all(|v| matches!(v.fields, Fields::Unit));
                if all_unit && attrs.tag_key.is_none() {
                    reject_container_attr(
                        &attrs.strict,
                        "strict",
                        "enums where every variant is a unit variant (they are serialized as strings)",
                    )?;
                    Body::Enum(parse_enum_values(data, rename_all)?)
                } else {
                    let variants = parse_variants(data, rename_all, &tagging)?;
                    Body::Union(tagging, variants)
                }
            }
            Data::Union(data) => {
                return error(
                    data.union_token.span,
                    "`Arri` cannot be derived for unions. Use an enum instead",
                );
            }
        };

        Ok(Self {
            ident: &input.ident,
            generics: &input.generics,
            krate,
            id,
            docs,
            strict,
            body,
        })
    }

    /// Types that make up the schema (every field / variant type that isn't skipped)
    fn schema_types(&self) -> Vec<&Type> {
        fn non_skipped<'b>(fields: &'b [Field<'b>]) -> impl Iterator<Item = &'b Type> {
            fields.iter().filter(|f| !f.is_skipped()).map(|f| f.ty)
        }
        match &self.body {
            Body::Struct(fields) => non_skipped(fields).collect(),
            Body::Newtype(ty) => vec![*ty],
            Body::Enum(_) => Vec::new(),
            Body::Union(_, variants) => variants
                .iter()
                .flat_map(|v| -> Vec<&Type> {
                    match &v.kind {
                        VariantKind::Unit => Vec::new(),
                        VariantKind::Newtype(ty) => vec![*ty],
                        VariantKind::Struct(fields) => non_skipped(fields).collect(),
                    }
                })
                .collect(),
        }
    }

    /// Type parameters that affect the schema.
    ///
    /// Parameters that are only used by skipped fields (e.g. `PhantomData<T>`) don't get arri
    /// trait bounds and aren't part of the type's id.
    pub fn schema_params(&self) -> Vec<&Ident> {
        let types = self.schema_types();
        self.generics
            .type_params()
            .map(|p| &p.ident)
            .filter(|param| types.iter().any(|ty| mentions(ty.to_token_stream(), param)))
            .collect()
    }

    /// Skipped fields
    fn skipped_fields(&self) -> Vec<&Field<'_>> {
        match &self.body {
            Body::Struct(fields) => fields.iter().filter(|f| f.is_skipped()).collect(),
            Body::Union(_, variants) => variants
                .iter()
                .flat_map(|v| match &v.kind {
                    VariantKind::Struct(fields) => {
                        fields.iter().filter(|f| f.is_skipped()).collect()
                    }
                    _ => Vec::new(),
                })
                .collect(),
            _ => Vec::new(),
        }
    }

    /// `FieldType: Default` predicates for skipped fields that use `Default` and depend on a type parameter
    pub fn skipped_default_predicates(&self) -> Vec<WherePredicate> {
        let params: Vec<&Ident> = self.generics.type_params().map(|p| &p.ident).collect();
        self.skipped_fields()
            .into_iter()
            .filter(|f| matches!(f.skip, Some(Skip::Default)))
            .filter(|f| params.iter().any(|p| mentions(f.ty.to_token_stream(), p)))
            .map(|f| {
                let ty = f.ty;
                syn::parse_quote!(#ty: ::core::default::Default)
            })
            .collect()
    }

    /// Generics with an additional `T: <bound>` predicate for every type parameter that affects the schema
    pub fn bounded_generics(&self, bound: TokenStream, extra: &[(Ident, TokenStream)]) -> Generics {
        let mut generics = self.generics.clone();
        let params: Vec<Ident> = self.schema_params().into_iter().cloned().collect();
        let where_clause = generics.make_where_clause();
        for param in params {
            let predicate: WherePredicate = syn::parse_quote!(#param: #bound);
            where_clause.predicates.push(predicate);
        }
        for (param, bound) in extra {
            let predicate: WherePredicate = syn::parse_quote!(#param: #bound);
            where_clause.predicates.push(predicate);
        }
        generics
    }

    /// Whether the type has any generic parameters (types, lifetimes, or consts)
    pub fn has_generic_params(&self) -> bool {
        !self.generics.params.is_empty()
    }

    /// `Type` bounds for the types of internally tagged newtype variants in generic types.
    ///
    /// The encoder checks `<T as Type>::PROPERTIES` for these types at compile time. Types
    /// without generic parameters don't need the bounds (their check runs eagerly).
    pub fn internal_newtype_bounds(&self) -> Vec<WherePredicate> {
        let Body::Union(Tagging::Internal { .. }, variants) = &self.body else {
            return Vec::new();
        };
        if !self.has_generic_params() {
            return Vec::new();
        }
        let k = &self.krate;
        variants
            .iter()
            .filter_map(|variant| match &variant.kind {
                VariantKind::Newtype(ty) => Some(syn::parse_quote!(#ty: #k::Type)),
                _ => None,
            })
            .collect()
    }
}

fn parse_enum_values<'a>(
    data: &'a syn::DataEnum,
    rename_all: Option<RenameRule>,
) -> syn::Result<Vec<EnumValue<'a>>> {
    let mut values: Vec<EnumValue<'a>> = Vec::with_capacity(data.variants.len());
    let mut seen = HashSet::new();
    for variant in &data.variants {
        let attrs = VariantAttrs::parse(&variant.attrs)?;
        reject_container_attr(
            &attrs.rename_all.as_ref().map(|(_, lit)| lit),
            "rename_all",
            "unit variants",
        )?;
        let value = variant_tag(&variant.ident, &attrs, rename_all);
        if !seen.insert(value.clone()) {
            return error(
                variant.span(),
                format!("multiple variants would be serialized as \"{value}\""),
            );
        }
        values.push(EnumValue {
            ident: &variant.ident,
            value,
        });
    }
    Ok(values)
}

fn variant_tag(ident: &Ident, attrs: &VariantAttrs, rename_all: Option<RenameRule>) -> String {
    match &attrs.rename {
        Some(rename) => rename.value(),
        None => {
            let name = ident.unraw().to_string();
            match rename_all {
                Some(rule) => rule.apply(&name),
                None => name,
            }
        }
    }
}

fn parse_variants<'a>(
    data: &'a syn::DataEnum,
    rename_all: Option<RenameRule>,
    tagging: &Tagging,
) -> syn::Result<Vec<Variant<'a>>> {
    let mut variants: Vec<Variant<'a>> = Vec::with_capacity(data.variants.len());
    let mut seen = HashSet::new();
    for variant in &data.variants {
        let attrs = VariantAttrs::parse(&variant.attrs)?;
        let tag = variant_tag(&variant.ident, &attrs, rename_all);
        if !seen.insert(tag.clone()) {
            return error(
                variant.span(),
                format!("multiple variants would be serialized with the tag \"{tag}\""),
            );
        }
        let field_rename_all = attrs.rename_all.as_ref().map(|(rule, _)| *rule);
        let kind = match &variant.fields {
            Fields::Unit => {
                reject_container_attr(
                    &attrs.rename_all.as_ref().map(|(_, lit)| lit),
                    "rename_all",
                    "unit variants",
                )?;
                VariantKind::Unit
            }
            Fields::Unnamed(fields) if fields.unnamed.len() == 1 => {
                reject_container_attr(
                    &attrs.rename_all.as_ref().map(|(_, lit)| lit),
                    "rename_all",
                    "newtype variants",
                )?;
                let field = fields.unnamed.first().expect("length was checked");
                reject_field_attrs(field, "newtype variants")?;
                let ty = &field.ty;
                if option_inner(ty).is_some() {
                    return error(
                        ty.span(),
                        "`Option<T>` can only be used for struct fields. Use `arri::Nullable<T>` for values that can be null",
                    );
                }
                VariantKind::Newtype(ty)
            }
            Fields::Unnamed(fields) => {
                return error(
                    fields.span(),
                    "tuple variants must have exactly one field. Use a struct variant instead",
                );
            }
            Fields::Named(fields) => {
                let fields = parse_fields(fields, field_rename_all)?;
                if let Tagging::Internal { tag_key } = tagging
                    && let Some(field) =
                        fields.iter().find(|f| !f.is_skipped() && &f.key == tag_key)
                {
                    return error(
                        field.ident.span(),
                        format!("field \"{}\" conflicts with the union's tag_key", field.key),
                    );
                }
                VariantKind::Struct(fields)
            }
        };
        variants.push(Variant {
            ident: &variant.ident,
            tag,
            docs: Docs::parse(&variant.attrs)?,
            kind,
        });
    }
    Ok(variants)
}

/// Returns `true` if `tokens` contains the identifier `ident`
fn mentions(tokens: TokenStream, ident: &Ident) -> bool {
    tokens.into_iter().any(|token| match token {
        TokenTree::Ident(other) => other == *ident,
        TokenTree::Group(group) => mentions(group.stream(), ident),
        _ => false,
    })
}

/// Binding names used when destructuring fields (`__f0`, `__f1`, ...)
pub fn binding(index: usize) -> Ident {
    format_ident!("__f{}", index)
}

/// `Some("...")` / `None` tokens for an optional string
pub fn option_str(krate: &TokenStream, value: Option<&str>) -> TokenStream {
    match value {
        Some(value) => {
            let lit = LitStr::new(value, Span::call_site());
            quote!(#krate::__private::Some(#lit))
        }
        None => quote!(#krate::__private::None),
    }
}

/// Tokens that apply doc / deprecation metadata to the type definition produced by `def`
pub fn with_docs(krate: &TokenStream, docs: &Docs, def: TokenStream) -> TokenStream {
    if docs.description.is_none() && docs.deprecated.is_none() {
        return def;
    }
    let description = option_str(krate, docs.description.as_deref());
    let deprecated = match &docs.deprecated {
        None => quote!(#krate::__private::None),
        Some(note) => {
            let note = option_str(krate, note.as_deref());
            quote!(#krate::__private::Some(#note))
        }
    };
    quote!(#krate::__private::with_metadata(#def, #description, #deprecated))
}
