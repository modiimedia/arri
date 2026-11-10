use std::collections::HashSet;

use proc_macro2::{Span, TokenStream};
use quote::{format_ident, quote};
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
    pub ty: &'a Type,
    pub optional: bool,
    pub docs: Docs,
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

fn parse_fields<'a>(
    fields: &'a syn::FieldsNamed,
    rename_all: Option<RenameRule>,
) -> syn::Result<Vec<Field<'a>>> {
    let mut output: Vec<Field<'a>> = Vec::with_capacity(fields.named.len());
    let mut keys = HashSet::new();
    for field in &fields.named {
        let ident = field.ident.as_ref().expect("named fields have identifiers");
        let attrs = FieldAttrs::parse(&field.attrs)?;
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
                            "ArriModel can only be derived for tuple structs with exactly one field",
                        );
                    }
                    Fields::Unit => {
                        return error(
                            input.ident.span(),
                            "ArriModel cannot be derived for unit structs. Use a struct with no fields (`struct Foo {}`) instead",
                        );
                    }
                }
            }
            Data::Enum(data) => {
                if data.variants.is_empty() {
                    return error(
                        input.ident.span(),
                        "ArriModel cannot be derived for enums with no variants",
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
                    "ArriModel cannot be derived for unions. Use an enum instead",
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

    /// Generics with an additional `T: <bound>` predicate for every type parameter
    pub fn bounded_generics(&self, bound: TokenStream, extra: &[(Ident, TokenStream)]) -> Generics {
        let mut generics = self.generics.clone();
        let params: Vec<Ident> = generics.type_params().map(|p| p.ident.clone()).collect();
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

    /// Type parameters that are used directly as the type of an internally tagged newtype variant.
    /// These need `EncodeFields` / `DecodeFields` bounds.
    pub fn internal_newtype_params(&self) -> Vec<Ident> {
        let Body::Union(Tagging::Internal { .. }, variants) = &self.body else {
            return Vec::new();
        };
        let params: Vec<&Ident> = self.generics.type_params().map(|p| &p.ident).collect();
        let mut output = Vec::new();
        for variant in variants {
            if let VariantKind::Newtype(Type::Path(path)) = &variant.kind
                && let Some(ident) = path.path.get_ident()
                && params.contains(&ident)
                && !output.contains(ident)
            {
                output.push(ident.clone());
            }
        }
        output
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
                let ty = &fields.unnamed.first().expect("length was checked").ty;
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
                    && let Some(field) = fields.iter().find(|f| &f.key == tag_key)
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
