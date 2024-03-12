use std::collections::HashMap;

use arri_client::{serde_json, ArriModel};

pub struct ObjectWithRecord {
    pub string_record: HashMap<String, String>,
    pub user_record: HashMap<String, User>,
}

impl ArriModel for ObjectWithRecord {
    fn new() -> Self {
        Self {
            string_record: HashMap::new(),
            user_record: HashMap::new(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let string_record = match val.get("stringRecord") {
                    Some(serde_json::Value::Object(string_record_val)) => {
                        let mut string_record_result: HashMap<String, String> = HashMap::new();
                        for (string_record_key, string_record_key_val) in string_record_val {
                            match string_record_key_val {
                                serde_json::Value::String(string_record_key_val_val) => {
                                    string_record_result.insert(
                                        string_record_key.to_owned(),
                                        string_record_key_val_val.to_owned(),
                                    );
                                }
                                _ => {}
                            }
                        }
                        string_record_result
                    }
                    _ => HashMap::new(),
                };
                let user_record = match val.get("userRecord") {
                    Some(serde_json::Value::Object(user_record_val)) => {
                        let mut user_record_result: HashMap<String, User> = HashMap::new();
                        for (user_record_key, user_record_key_val) in user_record_val {
                            user_record_result.insert(
                                user_record_key.to_owned(),
                                User::from_json(user_record_key_val.to_owned()),
                            );
                        }
                        user_record_result
                    }
                    _ => HashMap::new(),
                };
                Self {
                    string_record,
                    user_record,
                }
            }
            _ => Self::new(),
        }
    }

    fn from_json_string(input: String) -> Self {
        match serde_json::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }

    fn to_json_string(&self) -> String {
        let mut _json_output_ = "{".to_string();
        _json_output_.push_str("\"stringRecord\":");
        let mut string_record_index = 0;
        for (string_record_key, string_record_val) in &self.string_record {
            if string_record_index != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(format!("\"{}\":", string_record_key).as_str());
            _json_output_.push_str(format!("\"{}\"", string_record_val).as_str());
            string_record_index += 1;
        }
        let mut user_record_index = 0;
        for (user_record_key, user_record_val) in &self.user_record {
            if user_record_index != 0 {
                _json_output_.push(',');
            }
            _json_output_.push_str(format!("\"{}\":", user_record_key).as_str());
            _json_output_.push_str(user_record_val.to_json_string().as_str());
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        let mut string_record_index = 0;
        let mut string_record_output = "{".to_string();
        for (string_record_key, string_record_val) in &self.string_record {
            if string_record_index != 0 {
                string_record_output.push(',');
            }
            string_record_output
                .push_str(format!("{}={}", string_record_key, string_record_val).as_str());
            string_record_index += 1;
        }
        string_record_output.push('}');
        _query_parts_.push(string_record_output);
        let mut user_record_index = 0;
        let mut user_record_output = "{".to_string();
        for (user_record_key, user_record_val) in &self.user_record {
            if user_record_index != 0 {
                user_record_output.push(',');
            }
            user_record_output.push_str(
                format!("{}={}", user_record_key, user_record_val.to_json_string()).as_str(),
            );
            user_record_index += 1;
        }
        user_record_output.push('}');
        _query_parts_.push(user_record_output);
        _query_parts_.join("&")
    }
}

pub struct User {
    pub id: String,
    pub name: String,
}

impl ArriModel for User {
    fn new() -> Self {
        Self {
            id: "".to_string(),
            name: "".to_string(),
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
                let id = match val.get("id") {
                    Some(serde_json::Value::String(id_val)) => id_val.to_owned(),
                    _ => "".to_string(),
                };
                let name = match val.get("name") {
                    Some(serde_json::Value::String(name_val)) => name_val.to_owned(),
                    _ => "".to_string(),
                };
                Self { id, name }
            }
            _ => Self::new(),
        }
    }

    fn from_json_string(input: String) -> Self {
        match serde_json::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }

    fn to_json_string(&self) -> String {
        let mut output = "{".to_string();
        output.push_str("\"id\":");
        output.push_str(format!("\"{}\"", &self.id).as_str());
        output.push_str(",\"name\":");
        output.push_str(format!("\"{}\"", &self.name).as_str());
        output.push('}');
        output
    }

    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        parts.push(format!("id={}", &self.id));
        parts.push(format!("name={}", &self.name));
        parts.join("&")
    }
}
