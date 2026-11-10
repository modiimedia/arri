use arri::ArriModel;

#[derive(ArriModel)]
struct Foo {
    #[arri(skip)]
    a: String,
}

fn main() {}
