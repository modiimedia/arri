use arri::ArriModel;

#[derive(ArriModel)]
struct Foo {
    #[arri(rename = "b")]
    a: String,
    b: String,
}

fn main() {}
