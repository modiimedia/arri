use arri::ArriModel;

struct NoDefault;

#[derive(ArriModel)]
struct Foo {
    name: String,
    #[arri(skip)]
    handle: NoDefault,
}

fn main() {}
