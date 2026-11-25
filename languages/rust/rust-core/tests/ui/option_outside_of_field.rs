use arri::Arri;

#[derive(Arri)]
struct Bar {}

#[derive(Arri)]
struct Foo {
    items: Vec<Option<Bar>>,
}

fn main() {}
