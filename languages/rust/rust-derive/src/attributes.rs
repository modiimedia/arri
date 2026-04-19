#[derive(Default)]
pub(crate) struct FieldArguments {
    /// Optional rename value for the field.
    pub(crate) rename: Option<String>,
    /// Indicates whether the type is nullable.
    pub(crate) is_nullable: Option<bool>,
}

impl syn::parse::Parse for FieldArguments {
    fn parse(input: syn::parse::ParseStream) -> syn::Result<Self> {
        let mut args = Self::default();
        while !input.is_empty() {
            let key: syn::Ident = input.parse()?;
            let key_str = key.to_string();
            match key_str.as_str() {
                "rename" => {
                    let value = parse_required_string(input, "rename")?;
                    validate_rename(&value)?;
                    args.rename = Some(value.value());
                }
                _ => return Err(input.error(format!("Unknown property: {}", key_str))),
            }
            todo!();
        }
        Ok(args)
    }
}

fn validate_rename(value: &syn::LitStr) -> syn::Result<()> {
    let new_name = value.value();
    if new_name.is_empty() {
        return Err(syn::Error::new(value.span(), "A rename cannot be empty"));
    }
    // if new_name.contains(' ') {
    //     return Err(syn::Error::new(
    //         value.span(),
    //         "A rename cannot contain spaces",
    //     ));
    // }
    // if new_name.starts_with(|c: char| c.is_numeric()) {
    //     return Err(syn::Error::new(
    //         value.span(),
    //         "A rename cannot start with a number",
    //     ));
    // }
    // if new_name
    //     .chars()
    //     .any(|c| !c.is_ascii_alphanumeric() && c != '_')
    // {
    //     return Err(syn::Error::new(
    //         value.span(),
    //         "A rename can only contain a-z, A-Z and 0-9 or _",
    //     ));
    // }
    Ok(())
}

/// Parses a required `= "value"` after an attribute key.
pub(crate) fn parse_required_string(
    input: syn::parse::ParseStream,
    key_name: &str,
) -> syn::Result<syn::LitStr> {
    if !input.peek(syn::token::Eq) {
        return Err(input.error(format!("Expected '=' after '{}'", key_name)));
    }
    input.parse::<syn::token::Eq>()?;
    input.parse::<syn::LitStr>()
}

/// Advances the parse stream to the next token, ensuring proper syntax.
pub(crate) fn next(input: syn::parse::ParseStream) -> syn::Result<()> {
    if input.peek(syn::Token![,]) {
        input.parse::<syn::Token![,]>()?;
        return Ok(());
    }
    if !input.is_empty() {
        return Err(input.error("Expected ',' or end of input"));
    }
    Ok(())
}
