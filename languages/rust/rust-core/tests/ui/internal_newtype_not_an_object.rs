use arri::ArriModel;

#[derive(ArriModel)]
#[arri(tag_key = "type")]
enum Foo {
    A(String),
}

fn main() {}
