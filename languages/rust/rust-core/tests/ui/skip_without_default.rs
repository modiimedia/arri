use arri::Arri;

struct NoDefault;

#[derive(Arri)]
struct Foo {
    name: String,
    #[arri(skip)]
    handle: NoDefault,
}

fn main() {}
