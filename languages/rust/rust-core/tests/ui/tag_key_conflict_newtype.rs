use arri::Arri;

#[derive(Arri)]
struct Inner {
    a: i32,
    r#type: String,
}

#[derive(Arri)]
#[arri(tag_key = "type")]
enum Foo {
    A(Inner),
    // pointers are checked too
    B(Box<Inner>),
}

fn main() {}
