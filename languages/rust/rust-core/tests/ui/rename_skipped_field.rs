use arri::Arri;

#[derive(Arri)]
struct Foo {
    #[arri(skip, rename = "b")]
    a: String,
}

fn main() {}
