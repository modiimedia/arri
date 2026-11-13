use arri::Arri;

#[derive(Arri)]
struct Foo {
    #[arri(rename = "b")]
    a: String,
    b: String,
}

fn main() {}
