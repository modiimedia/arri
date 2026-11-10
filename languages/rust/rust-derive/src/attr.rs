use syn::{Attribute, Expr, ExprLit, Lit, LitStr, Meta, MetaNameValue, spanned::Spanned};

use crate::case::RenameRule;

/// `#[arri(...)]` attributes on a struct or enum
#[derive(Default)]
pub struct ContainerAttrs {
    pub id: Option<LitStr>,
    pub rename_all: Option<(RenameRule, LitStr)>,
    pub strict: Option<syn::Path>,
    pub tag_key: Option<LitStr>,
    pub value_key: Option<LitStr>,
    pub krate: Option<syn::Path>,
}

/// `#[arri(...)]` attributes on an enum variant
#[derive(Default)]
pub struct VariantAttrs {
    pub rename: Option<LitStr>,
    pub rename_all: Option<(RenameRule, LitStr)>,
}

/// `#[arri(...)]` attributes on a field
#[derive(Default)]
pub struct FieldAttrs {
    pub rename: Option<LitStr>,
}

/// Metadata that comes from standard attributes (doc comments and `#[deprecated]`)
#[derive(Default)]
pub struct Docs {
    pub description: Option<String>,
    /// `Some(None)` means deprecated without a note
    pub deprecated: Option<Option<String>>,
}

fn set_once<T>(
    slot: &mut Option<T>,
    value: T,
    meta: &syn::meta::ParseNestedMeta,
) -> syn::Result<()> {
    if slot.is_some() {
        return Err(meta.error(format!(
            "duplicate arri attribute `{}`",
            path_to_string(&meta.path)
        )));
    }
    *slot = Some(value);
    Ok(())
}

fn path_to_string(path: &syn::Path) -> String {
    path.segments
        .iter()
        .map(|s| s.ident.to_string())
        .collect::<Vec<_>>()
        .join("::")
}

fn parse_non_empty_str(meta: &syn::meta::ParseNestedMeta) -> syn::Result<LitStr> {
    let value: LitStr = meta.value()?.parse()?;
    if value.value().is_empty() {
        return Err(syn::Error::new(value.span(), "value cannot be empty"));
    }
    Ok(value)
}

fn parse_rename_rule(meta: &syn::meta::ParseNestedMeta) -> syn::Result<(RenameRule, LitStr)> {
    let value: LitStr = meta.value()?.parse()?;
    match RenameRule::parse(&value.value()) {
        Some(rule) => Ok((rule, value)),
        None => Err(syn::Error::new(
            value.span(),
            format!(
                "unknown rename rule \"{}\", expected one of {}",
                value.value(),
                RenameRule::VALID
            ),
        )),
    }
}

fn unknown_attr(meta: &syn::meta::ParseNestedMeta, location: &str, supported: &str) -> syn::Error {
    meta.error(format!(
        "unknown arri attribute `{}` on {location}. Supported attributes: {supported}",
        path_to_string(&meta.path)
    ))
}

fn arri_attrs(attrs: &[Attribute]) -> impl Iterator<Item = &Attribute> {
    attrs.iter().filter(|attr| attr.path().is_ident("arri"))
}

impl ContainerAttrs {
    pub fn parse(attrs: &[Attribute]) -> syn::Result<Self> {
        let mut out = Self::default();
        for attr in arri_attrs(attrs) {
            attr.parse_nested_meta(|meta| {
                if meta.path.is_ident("id") {
                    let value = parse_non_empty_str(&meta)?;
                    set_once(&mut out.id, value, &meta)
                } else if meta.path.is_ident("rename_all") {
                    let value = parse_rename_rule(&meta)?;
                    set_once(&mut out.rename_all, value, &meta)
                } else if meta.path.is_ident("strict") {
                    set_once(&mut out.strict, meta.path.clone(), &meta)
                } else if meta.path.is_ident("tag_key") {
                    let value = parse_non_empty_str(&meta)?;
                    set_once(&mut out.tag_key, value, &meta)
                } else if meta.path.is_ident("value_key") {
                    let value = parse_non_empty_str(&meta)?;
                    set_once(&mut out.value_key, value, &meta)
                } else if meta.path.is_ident("crate") {
                    let value: LitStr = meta.value()?.parse()?;
                    let path: syn::Path = value.parse()?;
                    set_once(&mut out.krate, path, &meta)
                } else {
                    Err(unknown_attr(
                        &meta,
                        "a type",
                        "`id`, `rename_all`, `strict`, `tag_key`, `value_key`, `crate`",
                    ))
                }
            })?;
        }
        Ok(out)
    }
}

impl VariantAttrs {
    pub fn parse(attrs: &[Attribute]) -> syn::Result<Self> {
        let mut out = Self::default();
        for attr in arri_attrs(attrs) {
            attr.parse_nested_meta(|meta| {
                if meta.path.is_ident("rename") {
                    let value = parse_non_empty_str(&meta)?;
                    set_once(&mut out.rename, value, &meta)
                } else if meta.path.is_ident("rename_all") {
                    let value = parse_rename_rule(&meta)?;
                    set_once(&mut out.rename_all, value, &meta)
                } else {
                    Err(unknown_attr(&meta, "a variant", "`rename`, `rename_all`"))
                }
            })?;
        }
        Ok(out)
    }
}

impl FieldAttrs {
    pub fn parse(attrs: &[Attribute]) -> syn::Result<Self> {
        let mut out = Self::default();
        for attr in arri_attrs(attrs) {
            attr.parse_nested_meta(|meta| {
                if meta.path.is_ident("rename") {
                    let value = parse_non_empty_str(&meta)?;
                    set_once(&mut out.rename, value, &meta)
                } else {
                    Err(unknown_attr(&meta, "a field", "`rename`"))
                }
            })?;
        }
        Ok(out)
    }
}

impl Docs {
    pub fn parse(attrs: &[Attribute]) -> syn::Result<Self> {
        let mut lines: Vec<String> = Vec::new();
        let mut deprecated = None;
        for attr in attrs {
            if attr.path().is_ident("doc") {
                // `#[doc = include_str!(...)]` and other non-literal docs are ignored
                if let Meta::NameValue(MetaNameValue {
                    value:
                        Expr::Lit(ExprLit {
                            lit: Lit::Str(value),
                            ..
                        }),
                    ..
                }) = &attr.meta
                {
                    let value = value.value();
                    // block doc comments (`/** */`) can contain multiple lines.
                    // `split` is used rather than `lines` so that empty `///` lines are kept.
                    for line in value.split('\n') {
                        lines.push(
                            line.strip_prefix(' ')
                                .unwrap_or(line)
                                .trim_end()
                                .to_string(),
                        );
                    }
                }
            } else if attr.path().is_ident("deprecated") {
                deprecated = Some(parse_deprecated(attr)?);
            }
        }
        // trim leading and trailing blank lines
        while lines.first().is_some_and(|l| l.trim().is_empty()) {
            lines.remove(0);
        }
        while lines.last().is_some_and(|l| l.trim().is_empty()) {
            lines.pop();
        }
        let description = if lines.is_empty() {
            None
        } else {
            Some(lines.join("\n"))
        };
        Ok(Self {
            description,
            deprecated,
        })
    }
}

/// Supports `#[deprecated]`, `#[deprecated = "note"]`, and `#[deprecated(since = "...", note = "...")]`
fn parse_deprecated(attr: &Attribute) -> syn::Result<Option<String>> {
    match &attr.meta {
        Meta::Path(_) => Ok(None),
        Meta::NameValue(MetaNameValue {
            value:
                Expr::Lit(ExprLit {
                    lit: Lit::Str(note),
                    ..
                }),
            ..
        }) => Ok(Some(note.value())),
        Meta::NameValue(other) => Err(syn::Error::new(
            other.value.span(),
            "expected a string literal",
        )),
        Meta::List(_) => {
            let mut note = None;
            attr.parse_nested_meta(|meta| {
                let value: LitStr = meta.value()?.parse()?;
                if meta.path.is_ident("note") {
                    note = Some(value.value());
                }
                Ok(())
            })?;
            Ok(note)
        }
    }
}
