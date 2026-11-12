use arri::ArriModel;

#[derive(ArriModel)]
#[arri(value_key = "data")]
enum Foo {
    A(String),
}

fn main() {}
