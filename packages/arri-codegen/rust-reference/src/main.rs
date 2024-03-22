mod ref_client;
mod ref_complete_object;
mod ref_hashmap;
mod ref_nullable_object;
mod ref_partial_object;
mod ref_recursive_object;

use arri_client::{
    reqwest::{header::HeaderMap, Client},
    ArriClientConfig, ArriService,
};
use ref_client::{
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
