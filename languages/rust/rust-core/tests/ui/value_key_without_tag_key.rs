use arri::Arri;

#[derive(Arri)]
#[arri(value_key = "data")]
enum Foo {
    A(String),
}

fn main() {}
