use arri::ArriModel;

#[derive(ArriModel)]
struct Foo(#[arri(skip)] String);

fn main() {}
