use arri::ArriModel;

#[derive(ArriModel)]
#[arri(rename_all = "camel")]
struct Foo {
    a: String,
}

fn main() {}
