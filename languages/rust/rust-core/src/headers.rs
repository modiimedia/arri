use std::{
    collections::BTreeMap,
    ops::{Deref, DerefMut},
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HeaderMap(BTreeMap<String, String>);

impl HeaderMap {
    pub fn new() -> Self {
        HeaderMap(BTreeMap::new())
    }

    pub fn insert(&mut self, key: &str, val: &str) {
        self.0.insert(key.to_lowercase(), val.to_owned());
    }

    pub fn get(&self, key: &str) -> Option<&String> {
        self.0.get(&key.to_lowercase())
    }

    pub fn get_mut(&mut self, key: &str) -> Option<&mut String> {
        self.0.get_mut(&key.to_lowercase())
    }

    pub fn contains_key(&self, key: &str) -> bool {
        self.0.contains_key(&key.to_lowercase())
    }
}

impl Deref for HeaderMap {
    type Target = BTreeMap<String, String>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl DerefMut for HeaderMap {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl FromIterator<(String, String)> for HeaderMap {
    fn from_iter<T: IntoIterator<Item = (String, String)>>(iter: T) -> Self {
        let mut map = BTreeMap::new();
        for (key, value) in iter {
            map.insert(key.to_lowercase(), value);
        }
        Self(map)
    }
}

impl IntoIterator for HeaderMap {
    type Item = (String, String);
    type IntoIter = std::collections::btree_map::IntoIter<String, String>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}

impl<'a> IntoIterator for &'a HeaderMap {
    type Item = (&'a String, &'a String);
    type IntoIter = std::collections::btree_map::Iter<'a, String, String>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.iter()
    }
}

impl<'a> IntoIterator for &'a mut HeaderMap {
    type Item = (&'a String, &'a mut String);
    type IntoIter = std::collections::btree_map::IterMut<'a, String, String>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.iter_mut()
    }
}

#[cfg(test)]
pub mod headers_test {
    use crate::headers::HeaderMap;

    #[test]
    pub fn keys_are_always_lowercase() {
        let mut headers = HeaderMap::from_iter([
            ("content-type".to_string(), "application/json".to_string()),
            ("ReqId".to_string(), "12345".to_string()),
            ("ERR_MSG".to_string(), "this is an error".to_string()),
            ("eRr-CoDe".to_string(), "15".to_string()),
        ]);
        assert_eq!(
            headers.get("Content-Type").unwrap().as_str(),
            "application/json"
        );

        let left: Vec<Option<&String>> = vec![
            headers.get("content-type"),
            headers.get("reqid"),
            headers.get("rEQiD"),
            headers.get("err_msg"),
        ];
        let right: Vec<Option<&String>> = vec![
            headers.get("Content-Type"),
            headers.get("ReqId"),
            headers.get("REQID"),
            headers.get("ERR_MSG"),
        ];
        assert_eq!(left, right);

        headers.insert("Foo_Foo", "foo");
        assert_eq!(headers.get("foo_foo"), Some(&("foo".to_owned())));

        assert_eq!(
            headers.get_mut("CONTENT-TYPE"),
            Some(&mut ("application/json".to_string()))
        );

        for (key, val) in headers {
            match key.as_str() {
                "content-type" => {
                    assert_eq!(val, "application/json".to_string());
                }
                "reqid" => {
                    assert_eq!(val, "12345".to_string());
                }
                "err_msg" => {
                    assert_eq!(val, "this is an error".to_string());
                }
                "err-code" => {
                    assert_eq!(val, "15".to_string());
                }
                "foo_foo" => {
                    assert_eq!(val, "foo".to_string());
                }
                _ => {
                    assert!(false, "unexpected key {}", key);
                }
            }
        }
    }
}
