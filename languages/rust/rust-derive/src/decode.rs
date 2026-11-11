use proc_macro2::TokenStream;
use quote::quote;

use crate::model::{Body, Container, Field, Tagging, VariantKind, binding};

pub fn expand(c: &Container) -> TokenStream {
    let k = &c.krate;
    let ident = c.ident;
    let mut generics = c.bounded_generics(quote!(#k::Decode), &[]);
    generics
        .make_where_clause()
        .predicates
        .extend(c.skipped_default_predicates());
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
                        let tag_key: #k::__private::Option<&str> = #k::__private::None;
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
                        // the value is borrowed since it only needs to be compared
                        let value = d.decode_str()?;
                        match value {
                            #(#arms)*
                            _ => #k::__private::Err(#k::__private::unknown_variant(value, &[#(#all_values),*])),
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
            let (internal, tag_key_arg) = match tagging {
                Tagging::Internal { tag_key } => (true, quote!(#k::__private::Some(#tag_key))),
                _ => (false, quote!(#k::__private::None)),
            };
            let arms = variants.iter().enumerate().map(|(index, variant)| {
                let variant_ident = variant.ident;
                let open = if internal {
                    TokenStream::new()
                } else {
                    quote!(d.begin_object()?;)
                };
                let body = match &variant.kind {
                    VariantKind::Unit => quote! {
                        #open
                        #k::__private::decode_no_fields(d, #tag_key_arg, #strict)?;
                        #k::__private::Ok(Self::#variant_ident)
                    },
                    // the variant's value continues reading the object that contains the tag
                    VariantKind::Newtype(ty) if internal => {
                        let Tagging::Internal { tag_key } = tagging else {
                            unreachable!()
                        };
                        quote! {
                            <#ty as #k::Decode>::decode(
                                &mut #k::__private::TaggedDecoder::new(d, #tag_key),
                            )
                            .map(Self::#variant_ident)
                        }
                    }
                    VariantKind::Newtype(ty) => quote! {
                        <#ty as #k::Decode>::decode(d).map(Self::#variant_ident)
                    },
                    VariantKind::Struct(fields) => {
                        let decode_fields = decode_fields(c, fields, quote!(Self::#variant_ident));
                        quote! {
                            #open
                            let tag_key: #k::__private::Option<&str> = #tag_key_arg;
                            #decode_fields
                        }
                    }
                };
                quote!(#index => { #body })
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
                        index: usize,
                    ) -> #result {
                        match index {
                            #(#arms)*
                            _ => #k::__private::Err(#k::DecodeError::custom("invalid variant index")),
                        }
                    }
                }
            }
        }
    }
}

/// Reads the remaining entries of an open object into the given fields and constructs `ctor`.
///
/// Expects `d` and `tag_key: Option<&str>` to be in scope.
///
/// Each key is first matched to the index of its field. This lets the key be borrowed from the
/// decoder (no copying) since the borrow ends before the field's value is decoded.
fn decode_fields(c: &Container, fields: &[Field], ctor: TokenStream) -> TokenStream {
    let k = &c.krate;
    let strict = c.strict;
    let slots: Vec<_> = (0..fields.len()).map(binding).collect();
    let decoded = || fields.iter().zip(&slots).filter(|(f, _)| !f.is_skipped());
    let declarations = decoded().map(|(field, slot)| {
        let ty = field.ty;
        quote!(let mut #slot: #k::__private::Option<#ty> = #k::__private::None;)
    });
    let key_arms = decoded().enumerate().map(|(index, (field, _))| {
        let key = &field.key;
        quote!(#key => #index,)
    });
    let value_arms = decoded().enumerate().map(|(index, (field, slot))| {
        let ty = field.ty;
        let key = &field.key;
        quote! {
            #index => {
                if #slot.is_some() {
                    return #k::__private::Err(#k::__private::duplicate_key(#key));
                }
                #slot = #k::__private::Some(
                    <#ty as #k::Decode>::decode(d).map_err(|e| e.in_field(#key))?,
                );
            }
        }
    });
    let assignments = fields.iter().zip(&slots).map(|(field, slot)| {
        let ident = field.ident;
        let key = &field.key;
        if field.is_skipped() {
            let value = field.skipped_value();
            quote!(#ident: #value)
        } else if field.optional {
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
        while let #k::__private::Some(key) = d.next_key()? {
            let index: usize = match key {
                #(#key_arms)*
                _ => #k::__private::check_unknown_key(key, tag_key, #strict)?,
            };
            match index {
                #(#value_arms)*
                _ => d.skip_value()?,
            }
        }
        #k::__private::Ok(#ctor { #(#assignments),* })
    }
}
