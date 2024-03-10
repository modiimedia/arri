#[path = "test_client.rpc.rs"]
mod test_client;
fn main() {
    println!("Hello, world!");
}

#[cfg(test)]
mod tests {
    use crate::test_client::TestClient;
    const CLIENT: TestClient = TestClient::new();

    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }
}
