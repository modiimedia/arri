#[path = "test_client.g.rs"]
mod test_client;
fn main() {}

#[cfg(test)]
mod tests {
    use arri_client::{
        chrono::{DateTime, Utc},
        reqwest, serde_json, ArriClientConfig, ArriClientService,
    };
    use std::collections::{BTreeMap, HashMap};

    use crate::test_client::{
        ObjectWithEveryType, ObjectWithEveryTypeNestedArrayElementElement,
        ObjectWithEveryTypeNestedObject, ObjectWithEveryTypeNestedObjectData,
        ObjectWithEveryTypeNestedObjectDataData, ObjectWithEveryTypeObject, TestClient,
    };

    fn headers() -> HashMap<&'static str, &'static str> {
        let mut result: HashMap<&'static str, &'static str> = HashMap::new();
        result.insert("x-test-header", "rust-12345");
        result
    }
    fn get_config(headers: fn() -> HashMap<&'static str, &'static str>) -> ArriClientConfig {
        ArriClientConfig {
            http_client: reqwest::Client::new(),
            base_url: "http://127.0.0.1:2020".to_string(),
            headers: headers,
        }
    }

    #[tokio::test]
    async fn can_send_and_receive_object() {
        let config = get_config(headers);
        let client = TestClient::create(&config);
        let target_date = DateTime::<Utc>::from_timestamp_millis(978328800000).unwrap();
        let mut record = BTreeMap::<String, bool>::new();
        record.insert("A".to_string(), true);
        record.insert("B".to_string(), false);
        let mut input = ObjectWithEveryType {
            any: serde_json::Value::String("hello world".to_string()),
            boolean: true,
            string: "hello world".to_string(),
            timestamp: target_date.fixed_offset(),
            float32: 1.5,
            float64: 1.5,
            int8: 1,
            uint8: 1,
            int16: 10,
            uint16: 10,
            int32: 100,
            uint32: 100,
            int64: 1000,
            uint64: 1000,
            enumerator: crate::test_client::ObjectWithEveryTypeEnumerator::C,
            array: vec![true, false, true],
            object: ObjectWithEveryTypeObject {
                string: "hello world".to_string(),
                boolean: true,
                timestamp: target_date.fixed_offset(),
            },
            record,
            discriminator: crate::test_client::ObjectWithEveryTypeDiscriminator::A {
                title: "hello world (A)".to_string(),
            },
            nested_object: ObjectWithEveryTypeNestedObject {
                id: "12345".to_string(),
                timestamp: target_date.fixed_offset(),
                data: ObjectWithEveryTypeNestedObjectData {
                    id: "123456".to_string(),
                    timestamp: target_date.fixed_offset(),
                    data: ObjectWithEveryTypeNestedObjectDataData {
                        id: "1234567".to_string(),
                        timestamp: target_date.fixed_offset(),
                    },
                },
            },
            nested_array: vec![vec![
                ObjectWithEveryTypeNestedArrayElementElement {
                    id: "1A".to_string(),
                    timestamp: target_date.fixed_offset(),
                },
                ObjectWithEveryTypeNestedArrayElementElement {
                    id: "2A".to_string(),
                    timestamp: target_date.fixed_offset(),
                },
                ObjectWithEveryTypeNestedArrayElementElement {
                    id: "1B".to_string(),
                    timestamp: target_date.fixed_offset(),
                },
            ]],
        };
        let result = client.tests.send_object(input.clone()).await;
        assert_eq!(result.as_ref().unwrap(), &input.clone());
        input.nested_object.data.data.id = "different value".to_string();
        assert_ne!(result.as_ref().unwrap(), &input);
    }
    async fn unauthenticated_client_returns_errors() {
        let config = get_config(|| return HashMap::new());
        let client = TestClient::create(&config);
    }
}
