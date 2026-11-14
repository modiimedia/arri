use arri::Arri;

#[derive(Arri)]
struct UserId(String);

#[derive(Arri)]
#[arri(tag_key = "type")]
enum Foo {
    A(UserId),
}

fn main() {}
