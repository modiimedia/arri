use arri::ArriModel;

#[derive(ArriModel)]
struct Foo {
    #[arri(default = "make_name")]
    name: String,
}

fn make_name() -> String {
    String::new()
}

fn main() {}
