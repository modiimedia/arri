//! Derive macros for the [`arri`](https://docs.rs/arri) crate.
//!
//! Use the `Arri` re-export from the `arri` crate rather than depending on this crate directly.

mod attr;
mod case;
mod decode;
mod encode;
mod model;
mod schema;

use proc_macro::TokenStream;
use quote::quote;
use syn::{DeriveInput, parse_macro_input};

/// See the documentation of `arri::Arri`
#[proc_macro_derive(Arri, attributes(arri))]
pub fn derive_arri(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    match expand(&input) {
        Ok(tokens) => tokens.into(),
        Err(err) => err.to_compile_error().into(),
    }
}

fn expand(input: &DeriveInput) -> syn::Result<proc_macro2::TokenStream> {
    let container = model::Container::from_input(input)?;
    let schema = schema::expand(&container);
    let encode = encode::expand(&container);
    let decode = decode::expand(&container);
    Ok(quote! {
        #[allow(deprecated, non_local_definitions, clippy::all)]
        const _: () = {
            #schema
            #encode
            #decode
        };
    })
}
