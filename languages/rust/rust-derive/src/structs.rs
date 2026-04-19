use proc_macro2::TokenStream;
use quote::quote;
use syn::{DeriveInput, Field, punctuated::Punctuated, token::Comma};

use crate::fields::ParsedField;

pub fn export_named_struct(input: &DeriveInput, fields: &Punctuated<Field, Comma>) -> TokenStream {
    let metadata: proc_macro2::TokenStream = metadata::extract(&input.attrs).into();
    let (attrs, rename_all) = match properties::extract(&input.attrs) {
        Ok(attrs) => {
            if attrs.is_empty() {
                (None, None)
            } else {
                let strict = attrs.iter().find_map(|a| a.strict);
                let rename_all = attrs.iter().find_map(|a| a.rename_all.clone());

                let attrs_tokens = strict.map(|strict_value| {
                    quote! {
                        schema.set_strict(#strict_value);
                    }
                });

                (attrs_tokens, rename_all)
            }
        }
        Err(stream) => (Some(stream.into()), None),
    };

    let base_export: proc_macro2::TokenStream = export_struct_fields(fields, &rename_all).into();

    quote! {
        use ronky::Serializable;
        let mut schema = { #base_export };
        schema.set_metadata(#metadata);
        #attrs
        schema
    }
    .into()
}

pub fn export_struct_fields(
    fields: &Punctuated<Field, Comma>,
    rename_all: &Option<CaseTransform>,
) -> TokenStream {
    let mut properties = Vec::new();
    for field in fields.iter() {
        match parse_field(field) {
            Ok(ParsedField::Required(field, stream, args)) => {
                process_field!(properties => field, stream, args, set_property, rename_all);
            }
            Ok(ParsedField::Optional(field, stream, args)) => {
                process_field!(properties => field, stream, args, set_optional_property, rename_all);
            }
            Err(stream) => return stream,
        }
    }

    quote! {
        let mut schema = ronky::PropertiesSchema::new();
        #(#properties)*
        schema
    }
    .into()
}
