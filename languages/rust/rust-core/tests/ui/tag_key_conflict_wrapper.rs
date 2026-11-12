use arri::ArriModel;

#[derive(ArriModel)]
struct Inner {
    r#type: String,
}

#[derive(ArriModel)]
struct Wrap(Inner);

#[derive(ArriModel)]
#[arri(tag_key = "type")]
enum Foo {
    A(Wrap),
}

fn main() {}
