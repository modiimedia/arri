use proc_macro2::TokenStream;
use quote::quote;

use crate::model::{Body, Container, Field, Tagging, VariantKind, binding};

pub fn expand(c: &Container) -> TokenStream {
    let k = &c.krate;
    let ident = c.ident;
    let extra: Vec<_> = c
        .internal_newtype_params()
        .into_iter()
        .map(|param| (param, quote!(#k::DecodeFields)))
        .collect();
    let generics = c.bounded_generics(quote!(#k::Decode), &extra);
    let (impl_generics, ty_generics, where_clause) = generics.split_for_impl();
    let result = quote!(#k::__private::Result<Self, #k::DecodeError>);
    let strict = c.strict;

    match &c.body {
        Body::Struct(fields) => {
            let decode_fields = decode_fields(c, fields, quote!(Self));
            quote! {
                #[automatically_derived]
                impl #impl_generics #k::Decode for #ident #ty_generics #where_clause {
                    fn decode<__D: #k::Decoder + ?Sized>(d: &mut __D) -> #result {
                        d.begin_object()?;
                        let mut key = #k::__private::String::new();
                        <Self as #k::DecodeFields>::decode_fields(d, &mut key, #k::__private::None)
                    }
                }

                #[automatically_derived]
                impl #impl_generics #k::DecodeFields for #ident #ty_generics #where_clause {
                    fn decode_fields<__D: #k::Decoder + ?Sized>(
                        d: &mut __D,
                        key: &mut #k::__private::String,
                        skip_key: #k::__private::Option<&str>,
                    ) -> #result {
                        #decode_fields
                    }
                }
            }
        }
        Body::Newtype(inner) => quote! {
            #[automatically_derived]
            impl #impl_generics #k::Decode for #ident #ty_generics #where_clause {
                fn decode<__D: #k::Decoder + ?Sized>(d: &mut __D) -> #result {
                    <#inner as #k::Decode>::decode(d).map(Self)
                }
            }
        },
        Body::Enum(values) => {
            let arms = values.iter().map(|v| {
                let variant = v.ident;
                let value = &v.value;
                quote!(#value => #k::__private::Ok(Self::#variant),)
            });
            let all_values = values.iter().map(|v| &v.value);
            quote! {
                #[automatically_derived]
                impl #impl_generics #k::Decode for #ident #ty_generics #where_clause {
                    fn decode<__D: #k::Decoder + ?Sized>(d: &mut __D) -> #result {
                        let value = d.decode_string()?;
                        match value.as_str() {
                            #(#arms)*
                            _ => #k::__private::Err(#k::__private::unknown_variant(&value, &[#(#all_values),*])),
                        }
                    }
                }
            }
        }
        Body::Union(tagging, variants) => {
            let decode = match tagging {
                Tagging::External => quote!(#k::__private::decode_external::<Self, __D>(d)),
                Tagging::Internal { tag_key } => {
                    quote!(#k::__private::decode_internal::<Self, __D>(d, #tag_key))
                }
                Tagging::Adjacent { tag_key, value_key } => quote! {
                    #k::__private::decode_adjacent::<Self, __D>(d, #tag_key, #value_key, #strict)
                },
            };
            // for internally tagged unions the variant's fields share an object with the tag
            let (internal, skip_key) = match tagging {
                Tagging::Internal { tag_key } => (true, quote!(#k::__private::Some(#tag_key))),
                _ => (false, quote!(#k::__private::None)),
            };
            let arms = variants.iter().map(|variant| {
                let variant_ident = variant.ident;
                let tag = &variant.tag;
                let open = if internal {
                    TokenStream::new()
                } else {
                    quote!(d.begin_object()?;)
                };
                let body = match &variant.kind {
                    VariantKind::Unit => quote! {
                        #open
                        #k::__private::decode_no_fields(d, key, #skip_key, #strict)?;
                        #k::__private::Ok(Self::#variant_ident)
                    },
                    VariantKind::Newtype(ty) if internal => quote! {
                        <#ty as #k::DecodeFields>::decode_fields(d, key, #skip_key).map(Self::#variant_ident)
                    },
                    VariantKind::Newtype(ty) => quote! {
                        <#ty as #k::Decode>::decode(d).map(Self::#variant_ident)
                    },
                    VariantKind::Struct(fields) => {
                        let decode_fields = decode_fields(c, fields, quote!(Self::#variant_ident));
                        quote! {
                            #open
                            let skip_key: #k::__private::Option<&str> = #skip_key;
                            #decode_fields
                        }
                    }
                };
                quote!(#tag => { #body })
            });
            let tags = variants.iter().map(|v| &v.tag);
            quote! {
                #[automatically_derived]
                impl #impl_generics #k::Decode for #ident #ty_generics #where_clause {
                    fn decode<__D: #k::Decoder + ?Sized>(d: &mut __D) -> #result {
                        #decode
                    }
                }

                #[automatically_derived]
                impl #impl_generics #k::__private::DecodeVariant for #ident #ty_generics #where_clause {
                    const VARIANTS: &'static [&'static str] = &[#(#tags),*];

                    fn decode_variant<__D: #k::Decoder + ?Sized>(
                        d: &mut __D,
                        tag: &str,
                        key: &mut #k::__private::String,
                    ) -> #result {
                        let _ = &key;
                        match tag {
                            #(#arms)*
                            _ => #k::__private::Err(#k::__private::unknown_variant(tag, Self::VARIANTS)),
                        }
                    }
                }
            }
        }
    }
}

/// Reads the remaining entries of an open object into the given fields and constructs `ctor`.
///
/// Expects `d`, `key: &mut String`, and `skip_key: Option<&str>` to be in scope.
fn decode_fields(c: &Container, fields: &[Field], ctor: TokenStream) -> TokenStream {
    let k = &c.krate;
    let strict = c.strict;
    let slots: Vec<_> = (0..fields.len()).map(binding).collect();
    let declarations = fields.iter().zip(&slots).map(|(field, slot)| {
        let ty = field.ty;
        quote!(let mut #slot: #k::__private::Option<#ty> = #k::__private::None;)
    });
    let arms = fields.iter().zip(&slots).map(|(field, slot)| {
        let ty = field.ty;
        let key = &field.key;
        quote! {
            #key => {
                #slot = #k::__private::Some(
                    <#ty as #k::Decode>::decode(d).map_err(|e| e.in_field(#key))?,
                );
            }
        }
    });
    let assignments = fields.iter().zip(&slots).map(|(field, slot)| {
        let ident = field.ident;
        let key = &field.key;
        if field.optional {
            quote!(#ident: #slot)
        } else {
            quote! {
                #ident: match #slot {
                    #k::__private::Some(value) => value,
                    #k::__private::None => return #k::__private::Err(#k::__private::missing_field(#key)),
                }
            }
        }
    });
    quote! {
        #(#declarations)*
        while d.next_key(key)? {
            match key.as_str() {
                #(#arms)*
                _ => #k::__private::unknown_key(d, key.as_str(), skip_key, #strict)?,
            }
        }
        #k::__private::Ok(#ctor { #(#assignments),* })
    }
}
