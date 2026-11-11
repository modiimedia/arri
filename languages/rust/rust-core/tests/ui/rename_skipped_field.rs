use arri::ArriModel;

#[derive(ArriModel)]
struct Foo {
    #[arri(skip, rename = "b")]
    a: String,
}

fn main() {}
