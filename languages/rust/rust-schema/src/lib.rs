pub trait ArriTypeDef {
    fn from_json(input: String) -> Result<Self, ArriParsingError>
    where
        Self: Sized;
    fn to_json(&self) -> String;
    fn to_typedef_string(&self) -> String;
}

pub struct ArriParsingError {
    instance_path: String,
    schema_path: String,
    message: String,
}
