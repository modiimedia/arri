use proc_macro2::TokenStream;
use quote::quote;

use crate::model::{Body, Container, Field, Tagging, VariantKind, with_docs};

pub fn expand(c: &Container) -> TokenStream {
    let k = &c.krate;
    let ident = c.ident;
    let generics = c.bounded_generics(quote!(#k::ArriSchema), &[]);
    let (impl_generics, ty_generics, where_clause) = generics.split_for_impl();

    let generic_name = match &c.body {
        Body::Newtype(inner) => quote!(<#inner as #k::ArriSchema>::generic_name()),
        _ => {
            let id = &c.id;
            let params = c.schema_params();
            if params.is_empty() {
                quote!(#k::__private::Cow::Borrowed(#id))
            } else {
                // the generic names of the type arguments come first, followed by the type's
                // own name (Page<User> => UserPage). Every part of a generic name is a suffix
                // so that nested types are unambiguous.
                quote! {
                    let mut name = #k::__private::String::new();
                    #( name.push_str(&<#params as #k::ArriSchema>::generic_name()); )*
                    name.push_str(#id);
                    #k::__private::Cow::Owned(name)
                }
            }
        }
    };

    let type_def = match &c.body {
        Body::Newtype(inner) => with_docs(
            k,
            &c.docs,
            quote!(<#inner as #k::ArriSchema>::type_def(ctx)),
        ),
        Body::Struct(fields) => {
            let def = with_docs(k, &c.docs, properties_def(c, fields));
            named(c, def)
        }
        Body::Enum(values) => {
            let values = values.iter().map(|v| &v.value);
            let def = with_docs(k, &c.docs, quote!(#k::TypeDef::enumeration([#(#values),*])));
            named(c, def)
        }
        Body::Union(tagging, variants) => {
            let (tag_key, value_key) = match tagging {
                Tagging::External => (quote!(#k::__private::None), quote!(#k::__private::None)),
                Tagging::Internal { tag_key } => (
                    quote!(#k::__private::Some(#k::__private::String::from(#tag_key))),
                    quote!(#k::__private::None),
                ),
                Tagging::Adjacent { tag_key, value_key } => (
                    quote!(#k::__private::Some(#k::__private::String::from(#tag_key))),
                    quote!(#k::__private::Some(#k::__private::String::from(#value_key))),
                ),
            };
            let variant_defs = variants.iter().map(|variant| {
                let tag = &variant.tag;
                let def = match &variant.kind {
                    VariantKind::Unit => properties_def(c, &[]),
                    VariantKind::Newtype(ty) => quote!(<#ty as #k::ArriSchema>::type_def(ctx)),
                    VariantKind::Struct(fields) => properties_def(c, fields),
                };
                let def = with_docs(k, &variant.docs, def);
                quote!(union.variants.push((#k::__private::String::from(#tag), #def));)
            });
            let variant_count = variants.len();
            let def = with_docs(
                k,
                &c.docs,
                quote! {{
                    let mut union = #k::Union {
                        tag_key: #tag_key,
                        value_key: #value_key,
                        variants: #k::__private::Vec::with_capacity(#variant_count),
                    };
                    #(#variant_defs)*
                    #k::TypeDef::union(union)
                }},
            );
            named(c, def)
        }
    };

    let properties = match &c.body {
        Body::Struct(fields) => {
            let keys = fields.iter().filter(|f| !f.is_skipped()).map(|f| &f.key);
            quote! {
                const PROPERTIES: #k::__private::Option<&'static [&'static str]> =
                    #k::__private::Some(&[#(#keys),*]);
            }
        }
        // newtype structs have the same schema as their inner type
        Body::Newtype(inner) => quote! {
            const PROPERTIES: #k::__private::Option<&'static [&'static str]> =
                <#inner as #k::ArriSchema>::PROPERTIES;
        },
        Body::Enum(_) | Body::Union(..) => TokenStream::new(),
    };

    quote! {
        #[automatically_derived]
        impl #impl_generics #k::ArriSchema for #ident #ty_generics #where_clause {
            #properties

            fn generic_name() -> #k::__private::Cow<'static, str> {
                #generic_name
            }

            fn type_def(ctx: &mut #k::SchemaContext) -> #k::TypeDef {
                #type_def
            }
        }
    }
}

/// Wraps a definition so that it gets an id, and so that recursive references become `ref` schemas
fn named(c: &Container, def: TokenStream) -> TokenStream {
    let k = &c.krate;
    quote! {
        ctx.named::<Self>(<Self as #k::ArriSchema>::generic_name(), |ctx| {
            let _ = &ctx;
            #def
        })
    }
}

/// A "properties" schema for a list of fields
fn properties_def(c: &Container, fields: &[Field]) -> TokenStream {
    let k = &c.krate;
    let strict = c.strict;
    let pushes = fields.iter().filter(|f| !f.is_skipped()).map(|field| {
        let key = &field.key;
        let ty = field.ty;
        let def = with_docs(
            k,
            &field.docs,
            quote!(<#ty as #k::ArriSchema>::type_def(ctx)),
        );
        let target = if field.optional {
            quote!(optional_properties)
        } else {
            quote!(properties)
        };
        quote!(properties.#target.push((#k::__private::String::from(#key), #def));)
    });
    quote! {{
        let mut properties = #k::Properties {
            properties: #k::__private::Vec::new(),
            optional_properties: #k::__private::Vec::new(),
            is_strict: #strict,
        };
        #(#pushes)*
        #k::TypeDef::properties(properties)
    }}
}
