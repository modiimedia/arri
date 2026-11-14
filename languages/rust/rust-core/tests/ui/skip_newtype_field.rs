use arri::Arri;

#[derive(Arri)]
struct Foo(#[arri(skip)] String);

fn main() {}
