use arri::Arri;

#[derive(Arri)]
struct Inner {
    r#type: String,
}

#[derive(Arri)]
struct Wrap(Inner);

#[derive(Arri)]
#[arri(tag_key = "type")]
enum Foo {
    A(Wrap),
}

fn main() {}
