use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, DeriveInput};

#[proc_macro_derive(ArriTypeDef)]
pub fn arri_type_def(input: TokenStream) -> TokenStream {
    let DeriveInput {
        attrs,
        vis,
        ident,
        generics,
        data,
    } = parse_macro_input!(input as DeriveInput);
    let where_clause = &generics.where_clause;

    let mut fields = Vec::<proc_macro2::TokenStream>::new();
    match data.clone() {
        syn::Data::Struct(val) => {
            for field in &val.fields {
                fields.push(quote! {
                    println!("{:?}", #field)
                });
            }
        }
        syn::Data::Enum(val) => {}
        syn::Data::Union(val) => {}
    }
    let expanded = quote! {
        impl #generics #ident #generics #where_clause {
            fn hello_world(&self) {
                println!("Hello world");
            }
        }
    };
    TokenStream::from(expanded)
}
