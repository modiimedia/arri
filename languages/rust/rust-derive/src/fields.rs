/// Represents a parsed field with its associated metadata.
///
/// # Variants
///
/// * `Required` - A required field with its `Field` definition, `TokenStream`, and optional `FieldArguments`.
/// * `Optional` - An optional field with its `Field` definition, `TokenStream`, and optional `FieldArguments`.
pub(crate) enum ParsedField<'a> {
    Required(&'a Field, TokenStream, Vec<FieldArguments>),
    Optional(&'a Field, TokenStream, Vec<FieldArguments>),
}

/// Trait for parsing fields into a `ParsedField` representation.
pub(crate) trait FieldParser {
    /// Parses a field and returns a `ParsedField` or an error `TokenStream`.
    ///
    /// # Arguments
    ///
    /// * `field` - A reference to a `Field` object to parse.
    ///
    /// # Returns
    ///
    /// Returns a `Result` containing a `ParsedField` on success or a `TokenStream` on failure.
    fn parse(field: &Field) -> Result<ParsedField<'_>, TokenStream>;
}

/// Parses a single field and returns a `ParsedField` representation.
///
/// # Arguments
///
/// * `field` - A reference to a `Field` object to be parsed.
///
/// # Returns
///
/// Returns a `Result` containing a `ParsedField` on success or a `TokenStream` on failure.
pub fn parse_field(field: &Field) -> Result<ParsedField<'_>, TokenStream> {
    BaseParser::parse(field)
}

use proc_macro::TokenStream;
use quote::{ToTokens, quote, quote_spanned};
use syn::{Field, spanned::Spanned};

use crate::{
    attributes::FieldArguments,
    parsers::{attributes::fields, types::is_option_type},
};

use super::{FieldParser, ParsedField};

/// A parser for processing fields in a struct or enum.
///
/// The `BaseParser` is responsible for extracting metadata from fields,
/// such as type information, attributes, and optionality, and converting
/// them into a `ParsedField` representation.
pub struct BaseParser;

impl FieldParser for BaseParser {
    /// Parses a single field and returns a `ParsedField` representation.
    ///
    /// # Arguments
    ///
    /// * `field` - A reference to the `Field` to be parsed.
    ///
    /// # Returns
    ///
    /// * `Ok(ParsedField)` - If the field is successfully parsed.
    /// * `Err(TokenStream)` - If there is an error during parsing, such as
    ///   invalid attributes or type mismatches.
    fn parse(field: &Field) -> Result<ParsedField<'_>, TokenStream> {
        let ty = &field.ty;

        // Generate the exportable type representation.
        let export = quote!(<#ty as ronky::Exportable>::export());

        // Check if the field type is an `Option`.
        let is_optional = is_option_type(&field.ty);

        // Extract field attributes (rename + nullable).
        let field_attrs = fields::extract(&field.attrs)?;

        // Process nullable from field attributes.
        let nullable_code = {
            let mut actual_nullable: Option<bool> = None;
            for attr in &field_attrs {
                if let Some(is_nullable) = attr.is_nullable {
                    // Ensure only optional types can be nullable.
                    if !is_optional && is_nullable {
                        let type_name = field.ty.to_token_stream().to_string();
                        return Err(quote_spanned!(field.ty.span() =>
                            compile_error!(concat!(
                                "Only an optional type can be nullable. Use Option<",
                                #type_name,
                                "> instead of ",
                                #type_name
                            ))
                        )
                        .into());
                    }
                    actual_nullable = Some(is_nullable);
                }
            }
            actual_nullable.map(|is_nullable| {
                quote! {
                    use ronky::Serializable;
                    ty.set_nullable(#is_nullable);
                }
            })
        };

        // Generate the type schema representation.
        let typeschema = quote! {
            {
                let mut ty = #export;
                #nullable_code
                ty
            }
        }
        .into();

        // Return the parsed field based on its optionality.
        if is_optional {
            return Ok(ParsedField::Optional(field, typeschema, field_attrs));
        }
        Ok(ParsedField::Required(field, typeschema, field_attrs))
    }
}
