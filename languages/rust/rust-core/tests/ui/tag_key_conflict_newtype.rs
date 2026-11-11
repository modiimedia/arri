use arri::ArriModel;

#[derive(ArriModel)]
struct Inner {
    a: i32,
    r#type: String,
}

#[derive(ArriModel)]
#[arri(tag_key = "type")]
enum Foo {
    A(Inner),
    // pointers are checked too
    B(Box<Inner>),
}

fn main() {}
