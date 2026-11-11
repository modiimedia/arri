use arri::ArriModel;

#[derive(ArriModel)]
struct UserId(String);

#[derive(ArriModel)]
#[arri(tag_key = "type")]
enum Foo {
    A(UserId),
}

fn main() {}
