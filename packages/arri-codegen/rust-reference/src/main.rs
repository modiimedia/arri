mod complete_object;
mod test_client;

use arri_client::{
    reqwest::{header::HeaderMap, Client},
    ArriClientConfig, ArriService,
};
use test_client::{
    TestClient, TestClientUserSettingsServiceMethods, TestClientUsersServiceMethods, UserParams,
};

#[tokio::main]
async fn main() {
    let config = ArriClientConfig {
        client: Client::default(),
        base_url: "https://google.com".to_string(),
        headers: HeaderMap::new(),
    };
    let client = TestClient::new();
    let user = client
        .users
        .get_user(
            &config,
            UserParams {
                user_id: "12345".to_string(),
            },
        )
        .await;
    match user {
        Ok(user_val) => println!("{:?}", user_val),
        Err(err) => println!("{:?}", err),
    };
    let user_settings = client.users.settings.get_user_settings(&config).await;
    match user_settings {
        Ok(user_settings_val) => println!("{:?}", user_settings_val),
        Err(err) => println!("{:?}", err),
    };
}
