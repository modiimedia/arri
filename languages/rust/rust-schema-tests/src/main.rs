use arri_schema_macros::ArriTypeDef;

fn main() {
    let user = User {
        id: "1".to_string(),
        name: "John Doe".to_string(),
    };
    user.hello_world();
}

#[derive(ArriTypeDef, Debug)]
struct User {
    pub id: String,
    pub name: String,
}
