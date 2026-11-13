use arri::Arri;

#[derive(Arri)]
#[arri(rename_all = "camel")]
struct Foo {
    a: String,
}

fn main() {}
