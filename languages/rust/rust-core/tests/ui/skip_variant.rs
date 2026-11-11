use arri::ArriModel;

#[derive(ArriModel)]
enum Foo {
    A { a: String },
    #[arri(skip)]
    B { b: String },
}

fn main() {}
