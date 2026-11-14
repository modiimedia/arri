use arri::Arri;

#[derive(Arri)]
struct Foo {
    #[arri(flatten)]
    a: String,
}

fn main() {}
