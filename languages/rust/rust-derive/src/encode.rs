use proc_macro2::TokenStream;
use quote::quote;

use crate::model::{Body, Container, Field, Tagging, VariantKind, binding};

pub fn expand(c: &Container) -> TokenStream {
    let k = &c.krate;
    let ident = c.ident;
    let extra: Vec<_> = c
        .internal_newtype_params()
        .into_iter()
        .map(|param| (param, quote!(#k::EncodeFields)))
        .collect();
    let generics = c.bounded_generics(quote!(#k::Encode), &extra);
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
                        e.begin_object(#k::EncodeFields::field_count(self))?;
                        #k::EncodeFields::encode_fields(self, e)?;
                        e.end_object()
                    }
                }

                #[automatically_derived]
                impl #impl_generics #k::EncodeFields for #ident #ty_generics #where_clause {
                    fn field_count(&self) -> usize {
                        #count
                    }

                    fn encode_fields<__E: #k::Encoder + ?Sized>(&self, e: &mut __E) -> #result {
                        #encode_fields
                        #k::__private::Ok(())
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
                            quote!(#k::EncodeFields::field_count(#f)),
                            quote!(#k::Encode::encode(#f, e)?;),
                            quote!(#k::EncodeFields::encode_fields(#f, e)?;),
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
