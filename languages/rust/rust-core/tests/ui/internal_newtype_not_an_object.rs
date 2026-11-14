use arri::Arri;

#[derive(Arri)]
#[arri(tag_key = "type")]
enum Foo {
    A(String),
}

fn main() {}
