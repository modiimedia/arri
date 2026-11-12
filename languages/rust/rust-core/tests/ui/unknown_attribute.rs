use arri::ArriModel;

#[derive(ArriModel)]
struct Foo {
    #[arri(flatten)]
    a: String,
}

fn main() {}
