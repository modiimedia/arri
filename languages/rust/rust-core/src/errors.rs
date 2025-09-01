pub struct ArriError {
    code: u32,
    message: String,
}

impl ArriError {
    pub fn new(code: u32, message: String) -> Self {
        Self { code, message }
    }
}

impl std::fmt::Display for ArriError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Error {}: {}", self.code, self.message)
    }
}
