use arri_client::{
    serde_json::{self, json, Number, Value},
    ArriPayload,
};
use std::{any::Any, fmt::format, iter::Map};

pub struct GetStatusResponse {
    message: String,
}

pub struct User {
    id: String,
    role: UserRole,
    photo: Option<UserPhoto>,
    // TODO FINISH THIS
    created_at: i32,
    num_followers: i32,
    settings: UserSettings,
    recent_notifications: Vec<i32>,
    bookmarks: Map<String, UserBookmarksValue>,
    bio: Option<String>,
    metadata: Map<String, Value>,
    random_list: Vec<Value>,
}

impl ArriPayload for User {
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

pub enum UserRole {
    Standard,
    Admin,
}

impl ArriPayload for UserRole {
    fn from_json(input: serde_json::Value) -> Self {
        todo!()
    }

    fn from_json_string(input: String) -> Self {
        todo!()
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

pub struct UserPhoto {
    url: String,
    width: f64,
    height: f64,
    bytes: i64,
    nanoseconds: u64,
}

impl ArriPayload for UserPhoto {
    fn from_json(input: serde_json::Value) -> Self {
        todo!()
    }

    fn from_json_string(input: String) -> Self {
        todo!()
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

pub struct UserSettings {
    notifications_enabled: bool,
    preferred_theme: UserSettingsPreferredTheme,
}

pub enum UserSettingsPreferredTheme {
    DarkMode,
    LightMode,
    System,
}

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

pub struct UserBookmarksValue {
    postId: String,
    userId: String,
}

pub struct UserParams {
    user_id: String,
}

impl ArriPayload for UserParams {
    fn from_json(input: serde_json::Value) -> Self {
        todo!()
    }

    fn from_json_string(input: String) -> Self {
        todo!()
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

pub struct UpdateUserParams {
    id: String,
    bio: Option<String>,
    photo: Option<UserPhoto>,
}

impl ArriPayload for UpdateUserParams {
    fn from_json(input: serde_json::Value) -> Self {
        todo!()
    }

    fn from_json_string(input: String) -> Self {
        todo!()
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
