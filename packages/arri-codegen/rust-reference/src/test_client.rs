#![allow(dead_code)]
use arri_client::{
    async_trait::async_trait,
    chrono::{DateTime, FixedOffset},
    parsed_arri_request,
    reqwest::Method,
    serde_json::{self},
    ArriClientConfig, ArriModel, ArriParsedRequestOptions, ArriRequestError, ArriService,
    EmptyArriModel,
};
use std::{collections::HashMap, str::FromStr};

pub struct TestClient {
    pub users: TestClientUsersService,
}

impl ArriService for TestClient {
    fn new() -> Self {
        Self {
            users: TestClientUsersService::new(),
        }
    }
}

#[async_trait]
pub trait TestClientMethods {
    async fn get_status(
        &self,
        config: &ArriClientConfig,
    ) -> Result<GetStatusResponse, ArriRequestError>;
}

#[async_trait]
impl TestClientMethods for TestClient {
    async fn get_status(
        &self,
        config: &ArriClientConfig,
    ) -> Result<GetStatusResponse, ArriRequestError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                client: &config.client,
                url: format!("{}/status", config.base_url),
                method: Method::GET,
                headers: &config.headers,
            },
            None::<EmptyArriModel>,
            |input| GetStatusResponse::from_json_string(input),
        )
        .await
    }
}

pub struct TestClientUsersService {
    pub settings: TestClientUsersSettingsService,
}

impl ArriService for TestClientUsersService {
    fn new() -> Self {
        Self {
            settings: TestClientUsersSettingsService::new(),
        }
    }
}

#[async_trait]
pub trait TestClientUsersServiceMethods {
    async fn get_user(
        &self,
        config: &ArriClientConfig,
        params: UserParams,
    ) -> Result<User, ArriRequestError>;
    async fn update_user(
        &self,
        config: &ArriClientConfig,
        params: UpdateUserParams,
    ) -> Result<User, ArriRequestError>;
}

#[async_trait]
impl TestClientUsersServiceMethods for TestClientUsersService {
    async fn get_user(
        &self,
        config: &ArriClientConfig,
        params: UserParams,
    ) -> Result<User, ArriRequestError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                client: &config.client,
                url: format!("{}/users/get-user", config.base_url),
                method: Method::GET,
                headers: &config.headers,
            },
            Some(params),
            |input| User::from_json_string(input),
        )
        .await
    }
    async fn update_user(
        &self,
        config: &ArriClientConfig,
        params: UpdateUserParams,
    ) -> Result<User, ArriRequestError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                client: &config.client,
                url: format!("{}/users/update-user", config.base_url),
                method: Method::POST,
                headers: &config.headers,
            },
            Some(params),
            |input| User::from_json_string(input),
        )
        .await
    }
}

pub struct TestClientUsersSettingsService {}

impl ArriService for TestClientUsersSettingsService {
    fn new() -> Self {
        TestClientUsersSettingsService {}
    }
}

#[async_trait]
pub trait TestClientUserSettingsServiceMethods {
    async fn get_user_settings(&self, config: &ArriClientConfig) -> Result<(), ArriRequestError>;
}

#[async_trait]
impl TestClientUserSettingsServiceMethods for TestClientUsersSettingsService {
    async fn get_user_settings(&self, config: &ArriClientConfig) -> Result<(), ArriRequestError> {
        parsed_arri_request(
            ArriParsedRequestOptions {
                client: &config.client,
                url: format!("{}/users/settings/get-user-settings", config.base_url),
                method: Method::GET,
                headers: &config.headers,
            },
            None::<EmptyArriModel>,
            |_| (),
        )
        .await
    }
}

//// END NESTED STRUCT IMPLEMENTATION ////

#[derive(Debug, PartialEq, Clone)]
pub struct GetStatusResponse {
    pub message: String,
}

impl ArriModel for GetStatusResponse {
    fn new() -> Self {
        Self {
            message: "".to_string(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let message = match val.get("message") {
                    Some(serde_json::Value::String(message_val)) => message_val.to_string(),
                    _ => "".to_string(),
                };
                Self { message }
            }
            _ => Self::new(),
        }
    }

    fn from_json_string(input: String) -> Self {
        match serde_json::Value::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }

    fn to_json_string(&self) -> String {
        let mut output = "{".to_string();
        output.push_str("\"message\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.message.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push('}');
        output
    }

    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("message={}", &self.message));
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct User {
    pub id: String,
    pub role: UserRole,
    pub photo: Option<UserPhoto>,
    // TODO FINISH THIS
    pub created_at: DateTime<FixedOffset>,
    pub num_followers: i32,
    pub settings: UserSettings,
    pub last_notification: Option<UserRecentNotificationsItem>,
    pub recent_notifications: Vec<UserRecentNotificationsItem>,
    pub bookmarks: HashMap<String, UserBookmarksValue>,
    pub bio: Option<String>,
    pub metadata: HashMap<String, serde_json::Value>,
    pub random_list: Vec<serde_json::Value>,
}

impl ArriModel for User {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            role: UserRole::Standard,
            photo: None,
            created_at: DateTime::default(),
            num_followers: 0,
            settings: UserSettings::new(),
            last_notification: None,
            recent_notifications: Vec::new(),
            bookmarks: HashMap::new(),
            bio: None,
            metadata: HashMap::new(),
            random_list: Vec::new(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_string(),
                    _ => "".to_string(),
                };
                let role = match val.get("role") {
                    Some(rol_val) => UserRole::from_json(rol_val.to_owned()),
                    _ => UserRole::new(),
                };
                let photo = match val.get("photo") {
                    Some(photo_val) => Some(UserPhoto::from_json(photo_val.to_owned())),
                    None => None,
                };
                let created_at = match val.get("createdAt") {
                    Some(serde_json::Value::String(created_at_val)) => {
                        match DateTime::<FixedOffset>::parse_from_rfc3339(created_at_val.as_str()) {
                            Ok(created_at_val_result) => created_at_val_result,
                            Err(_) => DateTime::default(),
                        }
                    }
                    _ => DateTime::default(),
                };
                let num_followers = match val.get("numFollowers") {
                    Some(serde_json::Value::Number(num_followers_val)) => {
                        match i32::try_from(num_followers_val.as_i64().unwrap_or(0)) {
                            Ok(num_followers_val_result) => num_followers_val_result,
                            _ => 0,
                        }
                    }
                    _ => 0,
                };
                let settings = match val.get("settings") {
                    Some(settings_val) => UserSettings::from_json(settings_val.to_owned()),
                    _ => UserSettings::new(),
                };
                let last_notification = match val.get("lastNotification") {
                    Some(last_notification_val) => Some(UserRecentNotificationsItem::from_json(
                        last_notification_val.to_owned(),
                    )),
                    _ => None,
                };
                let recent_notifications = match val.get("recentNotifications") {
                    Some(serde_json::Value::Array(recent_notifications_val)) => {
                        let mut items: Vec<UserRecentNotificationsItem> = Vec::new();
                        for recent_notifications_val_item in recent_notifications_val.into_iter() {
                            items.push(UserRecentNotificationsItem::from_json(
                                recent_notifications_val_item.to_owned(),
                            ));
                        }
                        items
                    }
                    _ => Vec::new(),
                };
                let bookmarks = match val.get("bookmarks") {
                    Some(serde_json::Value::Object(bookmarks_val)) => {
                        let mut hash_map: HashMap<String, UserBookmarksValue> = HashMap::new();
                        for (key, val) in bookmarks_val.into_iter() {
                            hash_map.insert(
                                key.to_owned(),
                                UserBookmarksValue::from_json(val.to_owned()),
                            );
                        }
                        hash_map
                    }
                    _ => HashMap::new(),
                };
                let bio = match val.get("bio") {
                    Some(serde_json::Value::String(bio_val)) => Some(bio_val.to_string()),
                    _ => None,
                };
                let metadata = match val.get("metadata") {
                    Some(serde_json::Value::Object(metadata_val)) => {
                        let mut hash_map: HashMap<String, serde_json::Value> = HashMap::new();
                        for (key, val) in metadata_val.into_iter() {
                            hash_map.insert(key.to_owned(), val.to_owned());
                        }
                        hash_map
                    }
                    _ => HashMap::new(),
                };
                let random_list = match val.get("randomList") {
                    Some(serde_json::Value::Array(random_list_val)) => {
                        let mut items: Vec<serde_json::Value> = Vec::new();
                        for item in random_list_val.into_iter() {
                            items.push(item.to_owned());
                        }
                        items
                    }
                    _ => Vec::new(),
                };

                Self {
                    id,
                    role,
                    photo,
                    created_at,
                    num_followers,
                    settings,
                    last_notification,
                    recent_notifications,
                    bookmarks,
                    bio,
                    metadata,
                    random_list,
                }
            }
            _ => Self::new(),
        }
    }

    fn from_json_string(input: String) -> Self {
        match serde_json::Value::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }

    fn to_json_string(&self) -> String {
        let mut output = "{".to_string();
        output.push_str("\"id:\":");
        output.push_str(format!("\"{}\"", &self.id).as_str());
        output.push_str(",\"role\":");
        output.push_str(format!("\"{}\"", &self.role.to_json_string()).as_str());
        output.push_str(",\"photo\":");
        match &self.photo {
            Some(photo) => {
                output.push_str(photo.to_json_string().as_str());
            }
            None => {
                output.push_str("null");
            }
        }
        output.push_str(",\"createdAt\":");
        output.push_str(format!("\"{}\"", &self.created_at.to_rfc3339()).as_str());
        output.push_str("\"numFollowers\":");
        output.push_str(&self.num_followers.to_string().as_str());
        output.push_str(",\"settings\":");
        output.push_str(&self.settings.to_json_string().as_str());
        output.push_str(",\"lastNotification\":");
        match &self.last_notification {
            Some(last_notification) => {
                output.push_str(last_notification.to_json_string().as_str());
            }
            None => {
                output.push_str("null");
            }
        }
        output.push_str(",\"recentNotifications\":");
        output.push('[');
        let mut recent_notifications_index = 0;
        for item in &self.recent_notifications {
            if recent_notifications_index != 0 {
                output.push(',');
            }
            output.push_str(item.to_json_string().as_str());
            recent_notifications_index += 1;
        }
        output.push(']');
        output.push_str("\"bookmarks\":");
        output.push('{');
        let mut bookmarks_index = 0;
        for (key, val) in &self.bookmarks {
            if bookmarks_index == 0 {
                output.push_str(format!("\"{}\":", key).as_str());
            } else {
                output.push_str(format!(",\"{}\":", key).as_str());
            }
            output.push_str(val.to_json_string().as_str());
            bookmarks_index += 1;
        }
        output.push('}');
        match &self.bio {
            Some(bio_val) => {
                output.push_str(",\"bio\":");
                output.push_str(
                    format!("\"{}\"", bio_val.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
            }
            None => {}
        }
        output.push_str("\"metadata\":");
        output.push('{');
        let mut metadata_index = 0;
        for (key, val) in &self.metadata {
            match serde_json::to_string(val) {
                Ok(val_val) => {
                    if metadata_index == 0 {
                        output.push_str(format!("\"{}\":", key).as_str());
                    } else {
                        output.push_str(format!(",\"{}\":", key).as_str());
                    }
                    output.push_str(&val_val);
                    metadata_index += 1;
                }
                Err(_) => {}
            }
        }
        output.push('}');
        output.push_str("\"randomList\":");
        output.push('[');
        let mut random_list_index = 0;
        for item in &self.random_list {
            match serde_json::to_string(item) {
                Ok(item_val) => {
                    if random_list_index != 0 {
                        output.push(',');
                    }
                    output.push_str(item_val.as_str());
                    random_list_index += 1;
                }
                Err(_) => {}
            }
        }
        output.push(']');
        output.push('}');
        output
    }

    fn to_query_params_string(&self) -> String {
        "".to_string()
    }
}

#[derive(Debug, PartialEq, Clone)]
pub enum UserRole {
    Standard,
    Admin,
}

impl ArriModel for UserRole {
    fn new() -> Self {
        Self::Standard
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::String(val) => match val.as_str() {
                "STANDARD" => Self::Standard,
                "ADMIN" => Self::Admin,
                _ => Self::Standard,
            },
            _ => Self::Standard,
        }
    }

    fn from_json_string(input: String) -> Self {
        Self::from_json(serde_json::json!(input))
    }

    fn to_json_string(&self) -> String {
        match &self {
            Self::Standard => "STANDARD".to_string(),
            Self::Admin => "ADMIN".to_string(),
        }
    }

    fn to_query_params_string(&self) -> String {
        self.to_json_string()
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct UserPhoto {
    pub url: String,
    pub width: f64,
    pub height: f64,
    pub bytes: i64,
    pub nanoseconds: u64,
}

impl ArriModel for UserPhoto {
    fn new() -> Self {
        Self {
            url: "".to_string(),
            width: 0.0,
            height: 0.0,
            bytes: 0,
            nanoseconds: 0,
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let url = match val.get("url") {
                    Some(serde_json::Value::String(url_val)) => url_val.to_owned(),
                    _ => "".to_string(),
                };
                let width = match val.get("width") {
                    Some(serde_json::Value::Number(width_val)) => width_val.as_f64().unwrap_or(0.0),
                    _ => 0.0,
                };
                let height = match val.get("height") {
                    Some(serde_json::Value::Number(height_val)) => {
                        height_val.as_f64().unwrap_or(0.0)
                    }
                    _ => 0.0,
                };
                let bytes = match val.get("bytes") {
                    Some(serde_json::Value::Number(bytes_val)) => bytes_val.as_i64().unwrap_or(0),
                    _ => 0,
                };
                let nanoseconds = match val.get("nanoseconds") {
                    Some(serde_json::Value::Number(nanoseconds_val)) => {
                        nanoseconds_val.as_u64().unwrap_or(0)
                    }
                    _ => 0,
                };
                Self {
                    url,
                    width,
                    height,
                    bytes,
                    nanoseconds,
                }
            }
            _ => Self::new(),
        }
    }

    fn from_json_string(input: String) -> Self {
        match serde_json::Value::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }

    fn to_json_string(&self) -> String {
        let mut output = "{".to_string();
        output.push_str("\"url\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.url.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push_str(",\"width\":");
        output.push_str(&self.width.to_string().as_str());
        output.push_str(",\"height\":");
        output.push_str(&self.height.to_string().as_str());
        output.push_str(",\"bytes\":");
        output.push_str(format!("\"{}\"", &self.bytes.to_string()).as_str());
        output.push_str(",\"nanoseconds\":");
        output.push_str(format!("\"{}\"", &self.nanoseconds.to_string()).as_str());
        output.push('}');
        output
    }

    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("url={}", &self.url));
        parts.push(format!("width={}", &self.width));
        parts.push(format!("height={}", &self.height));
        parts.push(format!("bytes={}", &self.bytes));
        parts.push(format!("nanoseconds={}", &self.nanoseconds));
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct UserSettings {
    pub notifications_enabled: bool,
    pub preferred_theme: UserSettingsPreferredTheme,
}

impl ArriModel for UserSettings {
    fn new() -> Self {
        Self {
            notifications_enabled: false,
            preferred_theme: UserSettingsPreferredTheme::DarkMode,
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let notifications_enabled = match val.get("notificationsEnabled") {
                    Some(serde_json::Value::Bool(notifications_enabled_val)) => {
                        notifications_enabled_val.to_owned()
                    }
                    _ => false,
                };
                let preferred_theme = match val.get("preferredTheme") {
                    Some(preferred_theme_val) => {
                        println!("PREFERRED_THEME_VAL {}", preferred_theme_val);
                        UserSettingsPreferredTheme::from_json(preferred_theme_val.to_owned())
                    }
                    _ => UserSettingsPreferredTheme::new(),
                };
                Self {
                    notifications_enabled,
                    preferred_theme,
                }
            }
            _ => Self::new(),
        }
    }

    fn from_json_string(input: String) -> Self {
        match serde_json::Value::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }

    fn to_json_string(&self) -> String {
        let mut output = "{".to_string();
        output.push_str("\"notificationsEnabled\":");
        output.push_str(&self.notifications_enabled.to_string().as_str());
        output.push_str(",\"preferredTheme\":");
        output.push_str(format!("\"{}\"", &self.preferred_theme.to_json_string()).as_str());
        output.push_str("}");
        output
    }

    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!(
            "notificationsEnabled={}",
            &self.notifications_enabled
        ));
        parts.push(format!(
            "preferredTheme={}",
            &self.preferred_theme.to_json_string()
        ));
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub enum UserSettingsPreferredTheme {
    DarkMode,
    LightMode,
    System,
}

impl ArriModel for UserSettingsPreferredTheme {
    fn new() -> Self {
        Self::DarkMode
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::String(val) => match val.as_str() {
                "dark-mode" => Self::DarkMode,
                "light-mode" => Self::LightMode,
                "system" => Self::System,
                _ => Self::DarkMode,
            },
            _ => Self::DarkMode,
        }
    }

    fn from_json_string(input: String) -> Self {
        Self::from_json(serde_json::json!(input))
    }

    fn to_json_string(&self) -> String {
        match &self {
            Self::DarkMode => "DARK_MODE".to_string(),
            Self::LightMode => "LIGHT_MODE".to_string(),
            Self::System => "SYSTEM".to_string(),
        }
    }

    fn to_query_params_string(&self) -> String {
        self.to_json_string()
    }
}

#[derive(Debug, PartialEq, Clone)]
pub enum UserRecentNotificationsItem {
    PostLike {
        post_id: String,
        user_id: String,
    },
    PostComment {
        post_id: String,
        user_id: String,
        comment_text: String,
    },
}

impl ArriModel for UserRecentNotificationsItem {
    fn new() -> Self {
        Self::PostLike {
            post_id: "".to_string(),
            user_id: "".to_string(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let notification_type = match val.get("notificationType") {
                    Some(serde_json::Value::String(notification_type_value)) => {
                        notification_type_value.to_string()
                    }
                    _ => "POST_LIKE".to_string(),
                };
                match notification_type.as_str() {
                    "POST_LIKE" => {
                        let post_id = match val.get("postId") {
                            Some(serde_json::Value::String(post_id_value)) => {
                                post_id_value.to_string()
                            }
                            _ => "".to_string(),
                        };
                        let user_id = match val.get("userId") {
                            Some(serde_json::Value::String(user_id_value)) => {
                                user_id_value.to_string()
                            }
                            _ => "".to_string(),
                        };
                        return Self::PostLike { post_id, user_id };
                    }
                    "POST_COMMENT" => {
                        let post_id = match val.get("postId") {
                            Some(serde_json::Value::String(post_id_value)) => {
                                post_id_value.to_owned()
                            }
                            _ => "".to_string(),
                        };
                        let user_id = match val.get("userId") {
                            Some(serde_json::Value::String(user_id_value)) => {
                                user_id_value.to_string()
                            }
                            _ => "".to_string(),
                        };
                        let comment_text = match val.get("commentText") {
                            Some(serde_json::Value::String(comment_text_value)) => {
                                comment_text_value.to_string()
                            }
                            _ => "".to_string(),
                        };
                        Self::PostComment {
                            post_id,
                            user_id,
                            comment_text,
                        }
                    }
                    _ => Self::new(),
                }
            }
            _ => Self::new(),
        }
    }

    fn from_json_string(input: String) -> Self {
        match serde_json::Value::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }

    fn to_json_string(&self) -> String {
        match &self {
            Self::PostLike { post_id, user_id } => {
                let mut output = "{".to_string();
                output.push_str("\"postId\":");
                output.push_str(format!("\"{}\"", post_id).as_str());
                output.push_str(",\"userId\":");
                output.push_str(format!("\"{}\"", user_id).as_str());
                output.push('}');
                output
            }
            Self::PostComment {
                post_id,
                user_id,
                comment_text,
            } => {
                let mut output = "{".to_string();
                output.push_str("\"postId\":");
                output.push_str(format!("\"{}\"", post_id).as_str());
                output.push_str(",\"userId\":");
                output.push_str(format!("\"{}\"", user_id).as_str());
                output.push_str(",\"commentText\":");
                output.push_str(format!("\"{}\"", comment_text).as_str());
                output.push('}');
                output
            }
        }
    }

    fn to_query_params_string(&self) -> String {
        match &self {
            Self::PostLike { post_id, user_id } => {
                let mut parts: Vec<String> = Vec::new();
                parts.push(format!("postId={}", post_id));
                parts.push(format!("userId={}", user_id));
                parts.join("&")
            }
            Self::PostComment {
                post_id,
                user_id,
                comment_text,
            } => {
                let mut parts: Vec<String> = Vec::new();
                parts.push(format!("postId={}", post_id));
                parts.push(format!("userId={}", user_id));
                parts.push(format!("commentText={}", comment_text));
                parts.join("&")
            }
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct UserBookmarksValue {
    pub post_id: String,
    pub user_id: String,
}

impl ArriModel for UserBookmarksValue {
    fn new() -> Self {
        Self {
            post_id: "".to_string(),
            user_id: "".to_string(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let post_id = match val.get("postId") {
                    Some(serde_json::Value::String(post_id_val)) => post_id_val.to_string(),
                    _ => "".to_string(),
                };
                let user_id = match val.get("userId") {
                    Some(serde_json::Value::String(user_id_val)) => user_id_val.to_string(),
                    _ => "".to_string(),
                };
                Self { post_id, user_id }
            }
            _ => Self::new(),
        }
    }

    fn from_json_string(input: String) -> Self {
        match serde_json::Value::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }

    fn to_json_string(&self) -> String {
        let mut output = "{".to_string();
        output.push_str("\"postId\":");
        output.push_str(format!("\"{}\"", &self.post_id).as_str());
        output.push_str(",\"userId\":");
        output.push_str(format!("\"{}\"", &self.user_id).as_str());
        output.push('}');
        output
    }

    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("postId={}", &self.post_id));
        parts.push(format!("userId={}", &self.user_id));
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct UserParams {
    pub user_id: String,
}

impl ArriModel for UserParams {
    fn new() -> Self {
        Self {
            user_id: "".to_string(),
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let user_id = match val.get("userId") {
                    Some(serde_json::Value::String(user_id_val)) => user_id_val.to_string(),
                    _ => "".to_string(),
                };
                Self { user_id }
            }
            _ => Self::new(),
        }
    }

    fn from_json_string(input: String) -> Self {
        match serde_json::Value::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }

    fn to_json_string(&self) -> String {
        let mut output = "{".to_string();
        output.push_str("\"userId\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.user_id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        output.push('}');
        output
    }

    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("userId={}", &self.user_id));
        parts.join("&")
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct UpdateUserParams {
    pub id: String,
    pub bio: Option<String>,
    pub photo: Option<UserPhoto>,
}

impl ArriModel for UpdateUserParams {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            bio: None,
            photo: None,
        }
    }
    fn from_json(json: serde_json::Value) -> Self {
        match json {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_string(),
                    _ => "".to_string(),
                };
                let bio = match val.get("bio") {
                    Some(serde_json::Value::String(bio_val)) => Some(bio_val.to_string()),
                    _ => None,
                };
                let photo = match val.get("photo") {
                    Some(photo_val) => Some(UserPhoto::from_json(photo_val.to_owned())),
                    None => None,
                };
                Self { id, bio, photo }
            }
            _ => Self::new(),
        }
    }

    fn from_json_string(input: String) -> Self {
        match serde_json::Value::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }

    fn to_json_string(&self) -> String {
        let mut output = "{".to_string();
        output.push_str("\"id\":");
        output.push_str(
            format!(
                "\"{}\"",
                &self.id.replace("\n", "\\n").replace("\"", "\\\"")
            )
            .as_str(),
        );
        match &self.bio {
            Some(val) => {
                output.push_str(",\"bio\":");
                output.push_str(
                    format!("\"{}\"", val.replace("\n", "\\n").replace("\"", "\\\"")).as_str(),
                );
            }
            None => {}
        }
        match &self.photo {
            Some(val) => {
                output.push_str(",\"photo\":");
                output.push_str(val.to_json_string().as_str());
            }
            None => output.push_str(",\"photo\":null"),
        }
        output.push('}');
        output
    }

    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("id={}", &self.id));
        match &self.bio {
            Some(val) => parts.push(format!("bio={}", val)),
            None => {}
        }
        match &self.photo {
            Some(val) => parts.push(format!("photo={}", val.to_json_string())),
            None => parts.push("photo=null".to_string()),
        }
        parts.join("&")
    }
}

// TESTS //

#[test]
fn test_user_role() {
    let standard_role = UserRole::Standard;
    assert_eq!(standard_role.to_json_string(), "STANDARD".to_string());
    assert_eq!(
        UserRole::from_json_string("STANDARD".to_string()),
        UserRole::Standard
    );
    let admin_role = UserRole::Admin;
    assert_eq!(admin_role.to_json_string(), "ADMIN".to_string());
    assert_eq!(
        UserRole::from_json_string("ADMIN".to_string()),
        UserRole::Admin
    );
}

#[test]
fn test_user() {
    let json_input = "{
            \"id\":\"12345\",
            \"role\":\"ADMIN\",
            \"photo\":{
                \"url\":\"https://example.com\",
                \"width\":100.5,
                \"height\":100.5,
                \"bytes\":\"999999999999\",
                \"nanoseconds\":\"999999999999\"
            },
            \"createdAt\":\"2001-01-01T06:00:00.000Z\",
            \"numFollowers\":25,
            \"settings\":{
                \"notificationsEnabled\":true,
                \"preferredTheme\":\"system\"
            },
            \"lastNotification\":{
                \"notificationType\":\"POST_LIKE\",
                \"postId\":\"1\",
                \"userId\":\"1\"
            },
            \"recentNotifications\":[
                {
                    \"notificationType\":\"POST_LIKE\",
                    \"postId\":\"1\",
                    \"userId\":\"1\"
                },
                {
                    \"notificationType\":\"POST_COMMENT\",
                    \"postId\":\"1\",
                    \"userId\":\"1\",
                    \"commentText\":\"you suck\"
                }
            ],
            \"bookmarks\":{
                \"a\":{
                    \"postId\":\"1\",
                    \"userId\":\"1\"
                }
            },
            \"bio\":null,
            \"metadata\":{
                \"description\":\"this is a description\",
                \"isRestricted\":false
            },
            \"randomList\":[1,2,true,false]
        }"
    .to_string();
    let user = User::from_json_string(json_input);
    assert_eq!(user.id, "12345".to_string());
    assert_eq!(user.role, UserRole::Admin);
    assert_eq!(user.photo.is_some(), true);
    assert_eq!(user.photo.unwrap().url, "https://example.com");
    assert_eq!(
        user.created_at,
        DateTime::<FixedOffset>::from(DateTime::from_timestamp_millis(978328800000).unwrap())
    );
    assert_eq!(user.num_followers, 25);
    assert_eq!(
        user.settings.preferred_theme,
        UserSettingsPreferredTheme::System
    );
    assert_eq!(user.settings.notifications_enabled, true);
    assert_eq!(user.last_notification.is_some(), true);
    assert_eq!(
        user.last_notification.unwrap(),
        UserRecentNotificationsItem::PostLike {
            post_id: "1".to_string(),
            user_id: "1".to_string()
        }
    );
    assert_eq!(user.recent_notifications.len(), 2);
    assert_eq!(
        user.recent_notifications.get(0).unwrap().to_owned(),
        UserRecentNotificationsItem::PostLike {
            post_id: "1".to_string(),
            user_id: "1".to_string(),
        }
    );
    assert_eq!(
        user.recent_notifications.get(1).unwrap(),
        &UserRecentNotificationsItem::PostComment {
            post_id: "1".to_string(),
            user_id: "1".to_string(),
            comment_text: "you suck".to_string()
        }
    );
    assert_eq!(user.bookmarks.clone().into_iter().len(), 1);
    assert_eq!(
        user.bookmarks.get("a").unwrap().to_owned(),
        UserBookmarksValue {
            post_id: "1".to_string(),
            user_id: "1".to_string()
        }
    );
    assert_eq!(user.bio, None);
    assert_eq!(user.metadata.clone().into_iter().len(), 2);
    assert_eq!(
        user.metadata.clone().get("description").unwrap().to_owned(),
        serde_json::Value::String("this is a description".to_string())
    );
    assert_eq!(
        user.metadata
            .clone()
            .get("isRestricted")
            .unwrap()
            .to_owned(),
        serde_json::Value::Bool(false)
    );
    assert_eq!(user.random_list.clone().len(), 4);
    println!("{:?}", user.random_list);
    assert_eq!(
        user.random_list.get(0).unwrap().to_owned(),
        serde_json::json!(1)
    );
    assert_eq!(
        user.random_list.get(1).unwrap().to_owned(),
        serde_json::json!(2)
    );
    assert_eq!(
        user.random_list.get(2).unwrap().to_owned(),
        serde_json::Value::Bool(true)
    );
    assert_eq!(
        user.random_list.get(3).unwrap().to_owned(),
        serde_json::Value::Bool(false)
    );
}
