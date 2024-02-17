use arri_client::{
    serde_json::{self, json, Value},
    ArriModel,
};
use std::collections::HashMap;

#[derive(Debug)]
pub struct GetStatusResponse {
    message: String,
}

impl ArriModel for GetStatusResponse {
    fn new() -> Self {
        return GetStatusResponse {
            message: "".to_string(),
        };
    }

    fn from_json(input: serde_json::Value) -> Self {
        todo!()
    }

    fn from_json_string(input: String) -> Self {
        return Self::from_json(json!(input));
    }

    fn to_json_string(&self) -> String {
        todo!()
    }

    fn to_query_params_string(&self) -> String {
        todo!()
    }
}

#[derive(Debug)]
pub struct User {
    id: String,
    role: UserRole,
    photo: Option<UserPhoto>,
    // TODO FINISH THIS
    created_at: i32,
    num_followers: i32,
    settings: UserSettings,
    recent_notifications: Vec<i32>,
    bookmarks: HashMap<String, UserBookmarksValue>,
    bio: Option<String>,
    metadata: HashMap<String, Value>,
    random_list: Vec<Value>,
}

impl ArriModel for User {
    fn new() -> Self {
        return User {
            id: "".to_string(),
            role: UserRole::Standard,
            photo: None,
            created_at: 0,
            num_followers: 0,
            settings: UserSettings::new(),
            recent_notifications: Vec::new(),
            bookmarks: HashMap::new(),
            bio: None,
            metadata: HashMap::new(),
            random_list: Vec::new(),
        };
    }

    fn from_json(input: serde_json::Value) -> Self {
        todo!()
    }

    fn from_json_string(input: String) -> Self {
        return User::from_json(json!(input));
    }

    fn to_json_string(&self) -> String {
        let mut output = "".to_string();

        todo!()
    }

    fn to_query_params_string(&self) -> String {
        todo!()
    }
}

#[derive(Debug)]
pub enum UserRole {
    Standard,
    Admin,
}

impl ArriModel for UserRole {
    fn new() -> Self {
        return UserRole::Standard;
    }
    fn from_json(input: serde_json::Value) -> Self {
        todo!()
    }

    fn from_json_string(input: String) -> Self {
        return Self::from_json(json!(input));
    }

    fn to_json_string(&self) -> String {
        return match &self {
            UserRole::Standard => "standard".to_string(),
            UserRole::Admin => "admin".to_string(),
        };
    }

    fn to_query_params_string(&self) -> String {
        return self.to_json_string();
    }
}

#[derive(Debug)]
pub struct UserPhoto {
    url: String,
    width: f64,
    height: f64,
    bytes: i64,
    nanoseconds: u64,
}

impl ArriModel for UserPhoto {
    fn new() -> Self {
        return UserPhoto {
            url: "".to_string(),
            width: 0.0,
            height: 0.0,
            bytes: 0,
            nanoseconds: 0,
        };
    }
    fn from_json(input: serde_json::Value) -> Self {
        todo!()
    }

    fn from_json_string(input: String) -> Self {
        return Self::from_json(json!(input));
    }

    fn to_json_string(&self) -> String {
        let mut result = "{".to_string();
        result += "\"url\":";
        result += format!(
            "\"{}\"",
            &self.url.replace("\n", "\\n").replace("\"", "\\\"")
        )
        .as_str();
        result += ",\"width\":";
        result += &self.width.to_string().as_str();
        result += ",\"height\":";
        result += &self.height.to_string().as_str();
        result += ",\"bytes\":";
        result += format!("\"{}\"", &self.bytes.to_string()).as_str();
        result += ",\"nanoseconds\":";
        result += format!("\"{}\"", &self.nanoseconds.to_string()).as_str();
        result += "}";
        return result;
    }

    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("url={}", &self.url));
        parts.push(format!("width={}", &self.width));
        parts.push(format!("height={}", &self.height));
        parts.push(format!("bytes={}", &self.bytes));
        parts.push(format!("nanoseconds={}", &self.nanoseconds));
        return parts.join("&");
    }
}

#[derive(Debug)]
pub struct UserSettings {
    notifications_enabled: bool,
    preferred_theme: UserSettingsPreferredTheme,
}

impl ArriModel for UserSettings {
    fn new() -> Self {
        return UserSettings {
            notifications_enabled: false,
            preferred_theme: UserSettingsPreferredTheme::DarkMode,
        };
    }

    fn from_json(input: serde_json::Value) -> Self {
        todo!()
    }

    fn from_json_string(input: String) -> Self {
        return Self::from_json(json!(input));
    }

    fn to_json_string(&self) -> String {
        todo!()
    }

    fn to_query_params_string(&self) -> String {
        todo!()
    }
}

#[derive(Debug)]
pub enum UserSettingsPreferredTheme {
    DarkMode,
    LightMode,
    System,
}

impl ArriModel for UserSettingsPreferredTheme {
    fn new() -> Self {
        return UserSettingsPreferredTheme::DarkMode;
    }

    fn from_json(input: serde_json::Value) -> Self {
        return match input {
            Value::String(val) => match val.as_str() {
                "DARK_MODE" => UserSettingsPreferredTheme::DarkMode,
                "LIGHT_MODE" => UserSettingsPreferredTheme::LightMode,
                "SYSTEM" => UserSettingsPreferredTheme::System,
                _ => UserSettingsPreferredTheme::DarkMode,
            },
            _ => UserSettingsPreferredTheme::DarkMode,
        };
    }

    fn from_json_string(input: String) -> Self {
        return Self::from_json(json!(input));
    }

    fn to_json_string(&self) -> String {
        return match &self {
            UserSettingsPreferredTheme::DarkMode => "DARK_MODE".to_string(),
            UserSettingsPreferredTheme::LightMode => "LIGHT_MODE".to_string(),
            UserSettingsPreferredTheme::System => "SYSTEM".to_string(),
        };
    }

    fn to_query_params_string(&self) -> String {
        return self.to_json_string();
    }
}

#[derive(Debug)]
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
        return Self::PostLike {
            post_id: "".to_string(),
            user_id: "".to_string(),
        };
    }

    fn from_json(input: serde_json::Value) -> Self {
        return match input {
            Value::Object(val) => {
                let notification_type = match val.get("notificationType") {
                    Some(Value::String(notification_type_value)) => {
                        notification_type_value.to_string()
                    }
                    _ => "POST_LIKE".to_string(),
                };
                return match notification_type.as_str() {
                    "POST_LIKE" => {
                        let post_id = match val.get("postId") {
                            Some(Value::String(post_id_value)) => post_id_value.to_string(),
                            _ => "".to_string(),
                        };
                        let user_id = match val.get("userId") {
                            Some(Value::String(user_id_value)) => user_id_value.to_string(),
                            _ => "".to_string(),
                        };
                        return UserRecentNotificationsItem::PostLike { post_id, user_id };
                    }
                    "POST_COMMENT" => {
                        let post_id = match val.get("postId") {
                            Some(Value::String(post_id_value)) => post_id_value.to_owned(),
                            _ => "".to_string(),
                        };
                        let user_id = match val.get("userId") {
                            Some(Value::String(user_id_value)) => user_id_value.to_string(),
                            _ => "".to_string(),
                        };
                        let comment_text = match val.get("commentText") {
                            Some(Value::String(comment_text_value)) => {
                                comment_text_value.to_string()
                            }
                            _ => "".to_string(),
                        };
                        return UserRecentNotificationsItem::PostComment {
                            post_id,
                            user_id,
                            comment_text,
                        };
                    }
                    _ => Self::new(),
                };
            }
            _ => Self::new(),
        };
    }

    fn from_json_string(input: String) -> Self {
        return Self::from_json(json!(input));
    }

    fn to_json_string(&self) -> String {
        todo!()
    }

    fn to_query_params_string(&self) -> String {
        todo!()
    }
}

#[derive(Debug)]
pub struct UserBookmarksValue {
    post_id: String,
    user_id: String,
}

impl ArriModel for UserBookmarksValue {
    fn new() -> Self {
        return UserBookmarksValue {
            post_id: "".to_string(),
            user_id: "".to_string(),
        };
    }

    fn from_json(input: serde_json::Value) -> Self {
        return match input {
            Value::Object(val) => {
                let post_id = match val.get("postId") {
                    Some(Value::String(post_id_val)) => post_id_val.to_string(),
                    _ => "".to_string(),
                };
                let user_id = match val.get("userId") {
                    Some(Value::String(user_id_val)) => user_id_val.to_string(),
                    _ => "".to_string(),
                };
                return UserBookmarksValue {
                    post_id: post_id,
                    user_id: user_id,
                };
            }
            _ => Self::new(),
        };
    }

    fn from_json_string(input: String) -> Self {
        return Self::from_json(json!(input));
    }

    fn to_json_string(&self) -> String {
        let mut result = "{".to_string();
        result += "\"postId\":";
        result += format!("\"{}\"", &self.post_id).as_str();
        result += ",\"userId\":";
        result += format!("\"{}\"", &self.user_id).as_str();
        result += "}";
        return result;
    }

    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("postId={}", &self.post_id));
        parts.push(format!("userId={}", &self.user_id));
        return parts.join("&");
    }
}

#[derive(Debug)]
pub struct UserParams {
    user_id: String,
}

impl ArriModel for UserParams {
    fn new() -> Self {
        return UserParams {
            user_id: "".to_string(),
        };
    }
    fn from_json(input: serde_json::Value) -> Self {
        return match input {
            Value::Object(val) => {
                let user_id = match val.get("userId") {
                    Some(Value::String(user_id_val)) => user_id_val.to_string(),
                    _ => "".to_string(),
                };
                return UserParams { user_id: user_id };
            }
            _ => Self::new(),
        };
    }

    fn from_json_string(input: String) -> Self {
        return Self::from_json(json!(input));
    }

    fn to_json_string(&self) -> String {
        let mut result = "{".to_string();
        result += "\"userId\":";
        result += format!(
            "\"{}\"",
            &self.user_id.replace("\n", "\\n").replace("\"", "\\\"")
        )
        .as_str();
        result += "}";
        return result;
    }

    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("userId={}", &self.user_id));
        return parts.join("&");
    }
}

#[derive(Debug)]
pub struct UpdateUserParams {
    id: String,
    bio: Option<String>,
    photo: Option<UserPhoto>,
}

impl ArriModel for UpdateUserParams {
    fn new() -> Self {
        return UpdateUserParams {
            id: "".to_string(),
            bio: None,
            photo: None,
        };
    }
    fn from_json(json: serde_json::Value) -> Self {
        match json {
            Value::Object(val) => {
                let id = match val.get("id") {
                    Some(Value::String(idVal)) => idVal.to_string(),
                    _ => "".to_string(),
                };
                let bio = match val.get("bio") {
                    Some(Value::String(bioVal)) => Some(bioVal.to_string()),
                    _ => None,
                };
                let photo = match val.get("photo") {
                    Some(photoVal) => Some(UserPhoto::from_json(photoVal.to_owned())),
                    None => None,
                };
                return UpdateUserParams {
                    id: id,
                    bio: bio,
                    photo: photo,
                };
            }
            _ => return Self::new(),
        }
    }

    fn from_json_string(input: String) -> Self {
        return Self::from_json(json!(input));
    }

    fn to_json_string(&self) -> String {
        let mut result = "{".to_string();
        result += "\"id\":";
        result += format!(
            "\"{}\"",
            &self.id.replace("\n", "\\n").replace("\"", "\\\"")
        )
        .as_str();
        match &self.bio {
            Some(val) => {
                result += ",\"bio\":";
                result +=
                    format!("\"{}\"", val.replace("\n", "\\n").replace("\"", "\\\"")).as_str();
            }
            None => {}
        }
        match &self.photo {
            Some(val) => {
                result += ",\"photo\":";
                result += val.to_json_string().as_str();
            }
            None => result += ",\"photo\":null",
        }
        result += "}";
        return result;
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
        return parts.join("&");
    }
}
