use arri::ArriModel;

#[derive(ArriModel)]
#[arri(strict)]
enum Foo {
    A,
    B,
}

fn main() {}
