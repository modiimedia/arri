use arri::Arri;

#[derive(Arri)]
enum Foo {
    A { a: String },
    #[arri(skip)]
    B { b: String },
}

fn main() {}
