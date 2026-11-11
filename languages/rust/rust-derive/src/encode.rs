use proc_macro2::TokenStream;
use quote::{quote, quote_spanned};
use syn::spanned::Spanned;

use crate::model::{Body, Container, Field, Tagging, VariantKind, binding};

pub fn expand(c: &Container) -> TokenStream {
    let k = &c.krate;
    let ident = c.ident;
    let mut generics = c.bounded_generics(quote!(#k::Encode), &[]);
    generics
        .make_where_clause()
        .predicates
        .extend(c.internal_newtype_bounds());
    let (impl_generics, ty_generics, where_clause) = generics.split_for_impl();
    let result = quote!(#k::__private::Result<(), #k::EncodeError>);

    match &c.body {
        Body::Struct(fields) => {
            let accessors: Vec<_> = fields
                .iter()
                .map(|f| {
                    let ident = f.ident;
                    quote!(&self.#ident)
                })
                .collect();
            let count = field_count(fields, &accessors);
            let encode_fields = encode_fields(c, fields, &accessors);
            quote! {
                #[automatically_derived]
                impl #impl_generics #k::Encode for #ident #ty_generics #where_clause {
                    fn encode<__E: #k::Encoder + ?Sized>(&self, e: &mut __E) -> #result {
                        e.begin_object(#count)?;
                        #encode_fields
                        e.end_object()
                    }

                    fn encode_internally_tagged<__E: #k::Encoder + ?Sized>(
                        &self,
                        e: &mut __E,
                        tag_key: &str,
                        tag: &str,
                    ) -> #result {
                        e.begin_object(1 + #count)?;
                        e.encode_key(tag_key)?;
                        e.encode_str(tag)?;
                        #encode_fields
                        e.end_object()
                    }
                }
            }
        }
        Body::Newtype(_) => quote! {
            #[automatically_derived]
            impl #impl_generics #k::Encode for #ident #ty_generics #where_clause {
                fn encode<__E: #k::Encoder + ?Sized>(&self, e: &mut __E) -> #result {
                    #k::Encode::encode(&self.0, e)
                }

                fn encode_internally_tagged<__E: #k::Encoder + ?Sized>(
                    &self,
                    e: &mut __E,
                    tag_key: &str,
                    tag: &str,
                ) -> #result {
                    #k::Encode::encode_internally_tagged(&self.0, e, tag_key, tag)
                }
            }
        },
        Body::Enum(values) => {
            let arms = values.iter().map(|v| {
                let variant = v.ident;
                let value = &v.value;
                quote!(Self::#variant => e.encode_str(#value),)
            });
            quote! {
                #[automatically_derived]
                impl #impl_generics #k::Encode for #ident #ty_generics #where_clause {
                    fn encode<__E: #k::Encoder + ?Sized>(&self, e: &mut __E) -> #result {
                        match self {
                            #(#arms)*
                        }
                    }
                }
            }
        }
        Body::Union(tagging, variants) => {
            let arms = variants.iter().map(|variant| {
                let variant_ident = variant.ident;
                let tag = &variant.tag;
                let (pattern, value_len, write_value, write_fields) = match &variant.kind {
                    VariantKind::Unit => (
                        quote!(Self::#variant_ident),
                        quote!(0usize),
                        quote! {
                            e.begin_object(0)?;
                            e.end_object()?;
                        },
                        TokenStream::new(),
                    ),
                    VariantKind::Newtype(_) => {
                        let f = binding(0);
                        (
                            quote!(Self::#variant_ident(#f)),
                            // not used: internally tagged newtype variants use a `TaggedEncoder`
                            TokenStream::new(),
                            quote!(#k::Encode::encode(#f, e)?;),
                            TokenStream::new(),
                        )
                    }
                    VariantKind::Struct(fields) => {
                        let bindings: Vec<_> = (0..fields.len()).map(binding).collect();
                        // skipped fields are matched with `_` so they don't produce unused bindings
                        let patterns = fields.iter().zip(&bindings).map(|(f, b)| {
                            let ident = f.ident;
                            if f.is_skipped() {
                                quote!(#ident: _)
                            } else {
                                quote!(#ident: #b)
                            }
                        });
                        let accessors: Vec<_> = bindings.iter().map(|b| quote!(#b)).collect();
                        let count = field_count(fields, &accessors);
                        let encode_fields = encode_fields(c, fields, &accessors);
                        (
                            quote!(Self::#variant_ident { #(#patterns),* }),
                            count.clone(),
                            quote! {
                                e.begin_object(#count)?;
                                #encode_fields
                                e.end_object()?;
                            },
                            encode_fields,
                        )
                    }
                };
                let body = match tagging {
                    // the variant's value writes its own object and the encoder adds the tag to it
                    Tagging::Internal { tag_key }
                        if matches!(variant.kind, VariantKind::Newtype(_)) =>
                    {
                        let f = binding(0);
                        quote!(#k::Encode::encode_internally_tagged(#f, e, #tag_key, #tag))
                    }
                    Tagging::External => quote! {
                        e.begin_object(1)?;
                        e.encode_key(#tag)?;
                        #write_value
                        e.end_object()
                    },
                    Tagging::Internal { tag_key } => quote! {
                        e.begin_object(1 + #value_len)?;
                        e.encode_key(#tag_key)?;
                        e.encode_str(#tag)?;
                        #write_fields
                        e.end_object()
                    },
                    Tagging::Adjacent { tag_key, value_key } => quote! {
                        e.begin_object(2)?;
                        e.encode_key(#tag_key)?;
                        e.encode_str(#tag)?;
                        e.encode_key(#value_key)?;
                        #write_value
                        e.end_object()
                    },
                };
                quote!(#pattern => { #body })
            });
            // newtype variants of internally tagged unions can't contain a field with the same key
            // as the tag. Struct variants are checked by the macro itself, but the fields of a
            // newtype variant's type aren't visible here so the compiler checks them instead.
            let tag_key_checks: Vec<_> = match tagging {
                Tagging::Internal { tag_key } => variants
                    .iter()
                    .filter_map(|variant| match &variant.kind {
                        VariantKind::Newtype(ty) => Some((variant, ty)),
                        _ => None,
                    })
                    .map(|(variant, ty)| {
                        // the messages are format strings so braces are escaped
                        let escape = |s: String| s.replace('{', "{{").replace('}', "}}");
                        let not_an_object = escape(format!(
                            "the type in variant `{ident}::{}` is not an object. Variants of internally tagged unions must be structs with named fields, or types that wrap one (such as newtype structs or `Box<T>`)",
                            variant.ident
                        ));
                        let conflict = escape(format!(
                            "the type in variant `{ident}::{}` has a field with the key \"{tag_key}\" which conflicts with the union's tag_key",
                            variant.ident
                        ));
                        // spanned so that the error points at the variant's type
                        quote_spanned! {ty.span()=>
                            match <#ty as #k::ArriSchema>::PROPERTIES {
                                #k::__private::None => ::core::panic!(#not_an_object),
                                #k::__private::Some(keys) => {
                                    if #k::__private::contains_key(keys, #tag_key) {
                                        ::core::panic!(#conflict);
                                    }
                                }
                            }
                        }
                    })
                    .collect(),
                _ => Vec::new(),
            };
            // without generic parameters the check runs when the crate is compiled. Otherwise it
            // runs once `encode` is used with specific types.
            let (eager_check, deferred_check) = if tag_key_checks.is_empty() {
                (TokenStream::new(), TokenStream::new())
            } else if c.has_generic_params() {
                (TokenStream::new(), quote!(const { #(#tag_key_checks)* };))
            } else {
                (
                    quote!(const _: () = { #(#tag_key_checks)* };),
                    TokenStream::new(),
                )
            };
            quote! {
                #eager_check

                #[automatically_derived]
                impl #impl_generics #k::Encode for #ident #ty_generics #where_clause {
                    fn encode<__E: #k::Encoder + ?Sized>(&self, e: &mut __E) -> #result {
                        #deferred_check
                        match self {
                            #(#arms)*
                        }
                    }
                }
            }
        }
    }
}

/// An expression that counts how many keys will be written. `accessors` are expressions that
/// evaluate to a reference to each field.
fn field_count(fields: &[Field], accessors: &[TokenStream]) -> TokenStream {
    let required = fields
        .iter()
        .filter(|f| !f.optional && !f.is_skipped())
        .count();
    let optional = fields
        .iter()
        .zip(accessors)
        .filter(|(f, _)| f.optional && !f.is_skipped())
        .map(|(_, access)| quote!((#access).is_some() as usize));
    quote!(#required #(+ #optional)*)
}

/// Statements that write each key / value pair
fn encode_fields(c: &Container, fields: &[Field], accessors: &[TokenStream]) -> TokenStream {
    let k = &c.krate;
    let statements = fields
        .iter()
        .zip(accessors)
        .filter(|(field, _)| !field.is_skipped())
        .map(|(field, access)| {
            let key = &field.key;
            if field.optional {
                quote! {
                    if let #k::__private::Some(__value) = #access {
                        e.encode_key(#key)?;
                        #k::Encode::encode(__value, e)?;
                    }
                }
            } else {
                quote! {
                    e.encode_key(#key)?;
                    #k::Encode::encode(#access, e)?;
                }
            }
        });
    quote!(#(#statements)*)
}
