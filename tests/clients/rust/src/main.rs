#[path = "test_client.g.rs"]
mod test_client;
fn main() {}

#[cfg(test)]
mod tests {
    use arri_client::{
        chrono::{DateTime, Utc},
        reqwest, serde_json,
        sse::SseEvent,
        ArriClientConfig, ArriClientService,
    };
    use std::{
        collections::{BTreeMap, HashMap},
        sync::{Arc, Mutex},
        time::Duration,
    };

    use crate::test_client::ChatMessageParams;
    #[allow(deprecated)]
    use crate::test_client::{
        DefaultPayload, DeprecatedRpcParams, ObjectWithEveryNullableType,
        ObjectWithEveryNullableTypeNestedArrayElementElement,
        ObjectWithEveryNullableTypeNestedObject, ObjectWithEveryNullableTypeNestedObjectData,
        ObjectWithEveryNullableTypeNestedObjectDataData, ObjectWithEveryNullableTypeObject,
        ObjectWithEveryOptionalType, ObjectWithEveryOptionalTypeNestedArrayElementElement,
        ObjectWithEveryOptionalTypeNestedObject, ObjectWithEveryOptionalTypeNestedObjectData,
        ObjectWithEveryOptionalTypeNestedObjectDataData, ObjectWithEveryType,
        ObjectWithEveryTypeNestedArrayElementElement, ObjectWithEveryTypeNestedObject,
        ObjectWithEveryTypeNestedObjectData, ObjectWithEveryTypeNestedObjectDataData,
        ObjectWithEveryTypeObject, RecursiveObject, RecursiveUnion, RecursiveUnionDataShape,
        SendErrorParams, TestClient,
    };

    const TARGET_MS: i64 = 978328800000;

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
    async fn can_send_and_receive_objects() {
        let config = get_config(headers);
        let client = TestClient::create(config);
        let target_date = DateTime::<Utc>::from_timestamp_millis(TARGET_MS).unwrap();
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

    #[tokio::test]
    async fn unauthenticated_client_returns_error() {
        let config = get_config(|| return HashMap::new());
        let client = TestClient::create(config);
        let result = client
            .tests
            .send_partial_object(ObjectWithEveryOptionalType {
                any: None,
                boolean: None,
                string: None,
                timestamp: None,
                float32: None,
                float64: None,
                int8: None,
                uint8: None,
                int16: None,
                uint16: None,
                int32: None,
                uint32: None,
                int64: None,
                uint64: None,
                enumerator: None,
                array: None,
                object: None,
                record: None,
                discriminator: None,
                nested_object: None,
                nested_array: None,
            })
            .await;
        assert_eq!(result.is_err(), true);
        assert_eq!(result.unwrap_err().code, 401);
    }

    #[tokio::test]
    async fn can_send_and_receive_object_with_nullable_fields() {
        let config = get_config(headers);
        let target_date = DateTime::from_timestamp_millis(TARGET_MS).unwrap();
        let client = TestClient::create(config);
        let all_null_input = ObjectWithEveryNullableType {
            any: serde_json::Value::Null,
            boolean: None,
            string: None,
            timestamp: None,
            float32: None,
            float64: None,
            int8: None,
            uint8: None,
            int16: None,
            uint16: None,
            int32: None,
            uint32: None,
            int64: None,
            uint64: None,
            enumerator: None,
            array: None,
            object: None,
            record: None,
            discriminator: None,
            nested_object: None,
            nested_array: None,
        };
        let mut record = BTreeMap::<String, Option<bool>>::new();
        record.insert("A".to_string(), Some(true));
        record.insert("B".to_string(), Some(false));
        let mut no_null_input = ObjectWithEveryNullableType {
            any: serde_json::Value::Bool(true),
            boolean: Some(false),
            string: Some("hello world".to_string()),
            timestamp: Some(target_date.fixed_offset()),
            float32: Some(1.5),
            float64: Some(1.5),
            int8: Some(1),
            uint8: Some(1),
            int16: Some(10),
            uint16: Some(10),
            int32: Some(100),
            uint32: Some(100),
            int64: Some(1000),
            uint64: Some(1000),
            enumerator: Some(crate::test_client::ObjectWithEveryNullableTypeEnumerator::B),
            array: Some(vec![Some(true), Some(false), Some(true)]),
            object: Some(ObjectWithEveryNullableTypeObject {
                string: Some("hello world".to_string()),
                boolean: Some(true),
                timestamp: Some(target_date.fixed_offset()),
            }),
            record: Some(record),
            discriminator: Some(
                crate::test_client::ObjectWithEveryNullableTypeDiscriminator::B {
                    title: Some("hello world".to_string()),
                    description: Some("hello world again".to_string()),
                },
            ),
            nested_object: Some(ObjectWithEveryNullableTypeNestedObject {
                id: Some("1".to_string()),
                timestamp: Some(target_date.fixed_offset()),
                data: Some(ObjectWithEveryNullableTypeNestedObjectData {
                    id: Some("2".to_string()),
                    timestamp: Some(target_date.fixed_offset()),
                    data: Some(ObjectWithEveryNullableTypeNestedObjectDataData {
                        id: Some("3".to_string()),
                        timestamp: Some(target_date.fixed_offset()),
                    }),
                }),
            }),
            nested_array: Some(vec![Some(vec![
                Some(ObjectWithEveryNullableTypeNestedArrayElementElement {
                    id: Some("1".to_string()),
                    timestamp: Some(target_date.fixed_offset()),
                }),
                Some(ObjectWithEveryNullableTypeNestedArrayElementElement {
                    id: Some("2".to_string()),
                    timestamp: Some(target_date.fixed_offset()),
                }),
            ])]),
        };
        let all_null_result = client
            .tests
            .send_object_with_nullable_fields(all_null_input.clone())
            .await;
        assert_eq!(
            all_null_result.as_ref().unwrap().clone(),
            all_null_input.clone()
        );
        let no_null_result = client
            .tests
            .send_object_with_nullable_fields(no_null_input.clone())
            .await;
        assert_eq!(
            no_null_result.as_ref().unwrap().clone(),
            no_null_input.clone()
        );
        no_null_input.nested_array = Some(vec![Some(vec![Some(
            ObjectWithEveryNullableTypeNestedArrayElementElement {
                id: Some("4".to_string()),
                timestamp: None,
            },
        )])]);
        assert_ne!(
            no_null_result.as_ref().unwrap().clone(),
            no_null_input.clone()
        );
        let new_result = client
            .tests
            .send_object_with_nullable_fields(no_null_input.clone())
            .await;
        assert_eq!(new_result.as_ref().unwrap().clone(), no_null_input);
    }

    #[tokio::test]
    async fn can_send_and_receive_recursive_objects() {
        let config = get_config(headers);
        let client = TestClient::create(config);
        let input = RecursiveObject {
            left: Some(Box::new(RecursiveObject {
                left: Some(Box::new(RecursiveObject {
                    left: None,
                    right: None,
                    value: "d3".to_string(),
                })),
                right: Some(Box::new(RecursiveObject {
                    left: None,
                    right: Some(Box::new(RecursiveObject {
                        left: None,
                        right: None,
                        value: "d4".to_string(),
                    })),
                    value: "d3".to_string(),
                })),
                value: "d2".to_string(),
            })),
            right: Some(Box::new(RecursiveObject {
                left: None,
                right: None,
                value: "d2".to_string(),
            })),
            value: "d1".to_string(),
        };
        let result = client.tests.send_recursive_object(input.clone()).await;
        assert_eq!(result.unwrap(), input);
    }

    #[tokio::test]
    async fn can_send_and_receive_recursive_discriminators() {
        let config = get_config(headers);
        let client = TestClient::create(config);
        let input = RecursiveUnion::Children {
            data: vec![
                Box::new(RecursiveUnion::Child {
                    data: Box::new(RecursiveUnion::Text {
                        data: "Hello world".to_string(),
                    }),
                }),
                Box::new(RecursiveUnion::Shape {
                    data: RecursiveUnionDataShape {
                        width: 100.0,
                        height: 1000.0,
                        color: "#F6F6F6".to_string(),
                    },
                }),
                Box::new(RecursiveUnion::Children {
                    data: vec![
                        Box::new(RecursiveUnion::Text {
                            data: "Hello world".to_string(),
                        }),
                        Box::new(RecursiveUnion::Text {
                            data: "Hello world".to_string(),
                        }),
                    ],
                }),
            ],
        };

        let result = client.tests.send_recursive_union(input.clone()).await;
        assert_eq!(result.unwrap(), input);
    }

    #[tokio::test]
    async fn can_send_requests_with_no_params() {
        let config = get_config(headers);
        let client = TestClient::create(config);
        let get_request_result = client.tests.empty_params_get_request().await;
        let post_request_result = client.tests.empty_params_post_request().await;
        assert!(!get_request_result.unwrap().message.is_empty());
        assert!(!post_request_result.unwrap().message.is_empty());
    }

    #[tokio::test]
    async fn can_send_requests_with_no_response() {
        let config = get_config(headers);
        let client = TestClient::create(config);
        let get_request_result = client
            .tests
            .empty_response_get_request(DefaultPayload {
                message: "hello world".to_string(),
            })
            .await;
        let post_request_result = client
            .tests
            .empty_response_post_request(DefaultPayload {
                message: "hello world again".to_string(),
            })
            .await;
        assert!(get_request_result.is_ok());
        assert!(post_request_result.is_ok());
    }

    #[tokio::test]
    async fn can_properly_parse_error_responses() {
        let config = get_config(headers);
        let client = TestClient::create(config);
        let result = client
            .tests
            .send_error(SendErrorParams {
                code: 444,
                message: "This is an error".to_string(),
            })
            .await;
        assert!(result.is_err());
        assert_eq!(result.as_ref().unwrap_err().code, 444);
        assert_eq!(result.unwrap_err().message, "This is an error".to_string());
    }

    #[tokio::test]
    async fn can_send_and_receive_partial_objects() {
        let config = get_config(headers);
        let client = TestClient::create(config);
        let target_date = DateTime::from_timestamp_millis(TARGET_MS).unwrap();
        let mut record = BTreeMap::<String, bool>::new();
        record.insert("A".to_string(), false);
        record.insert("B".to_string(), true);
        let input = ObjectWithEveryOptionalType {
            any: None,
            boolean: None,
            string: Some("hello world".to_string()),
            timestamp: Some(target_date.fixed_offset()),
            float32: None,
            float64: None,
            int8: None,
            uint8: None,
            int16: None,
            uint16: None,
            int32: None,
            uint32: None,
            int64: None,
            uint64: None,
            enumerator: Some(crate::test_client::ObjectWithEveryOptionalTypeEnumerator::C),
            array: None,
            object: None,
            record: Some(record),
            discriminator: Some(
                crate::test_client::ObjectWithEveryOptionalTypeDiscriminator::A {
                    title: "hello world".to_string(),
                },
            ),
            nested_object: Some(ObjectWithEveryOptionalTypeNestedObject {
                id: "hello world".to_string(),
                timestamp: target_date.fixed_offset(),
                data: ObjectWithEveryOptionalTypeNestedObjectData {
                    id: "hello world".to_string(),
                    timestamp: target_date.fixed_offset(),
                    data: ObjectWithEveryOptionalTypeNestedObjectDataData {
                        id: "hello world".to_string(),
                        timestamp: target_date.fixed_offset(),
                    },
                },
            }),
            nested_array: Some(vec![vec![
                ObjectWithEveryOptionalTypeNestedArrayElementElement {
                    id: "Hello world".to_string(),
                    timestamp: target_date.fixed_offset(),
                },
            ]]),
        };
        let result = client.tests.send_partial_object(input.clone()).await;
        assert_eq!(result.unwrap(), input);
    }

    #[tokio::test]
    async fn deprecated_types_and_procedures_are_properly_marked() {
        let config = get_config(headers);
        let client = TestClient::create(config);
        #[allow(deprecated)]
        let _ = client
            .tests
            .deprecated_rpc(DeprecatedRpcParams {
                deprecated_field: "hello world".to_string(),
            })
            .await;
        assert!(true);
    }

    #[tokio::test]
    async fn can_receive_sse_messages() {
        let config = get_config(headers);
        let client = Arc::new(TestClient::create(config));
        let error_count = Arc::new(Mutex::new(0));
        let error_count_ref = Arc::clone(&error_count);
        let msg_count = Arc::new(Mutex::new(0));
        let msg_count_ref = Arc::clone(&msg_count);
        let open_count = Arc::new(Mutex::new(0));
        let open_count_ref = Arc::clone(&open_count);
        let thread = tokio::spawn(async move {
            client
                .tests
                .stream_messages(
                    ChatMessageParams {
                        channel_id: "12345".to_string(),
                    },
                    |event, _| match event {
                        SseEvent::Message(msg) => {
                            let mut msg_count = msg_count_ref.lock().unwrap();
                            *msg_count += 1;
                            match msg {
                                crate::test_client::ChatMessage::Text { channel_id, .. } => {
                                    assert_eq!(channel_id, "12345".to_string());
                                }
                                crate::test_client::ChatMessage::Image { channel_id, .. } => {
                                    assert_eq!(channel_id, "12345".to_string());
                                }
                                crate::test_client::ChatMessage::Url { channel_id, .. } => {
                                    assert_eq!(channel_id, "12345".to_string());
                                }
                            }
                        }
                        SseEvent::Error { .. } => {
                            let mut error_count = error_count_ref.lock().unwrap();
                            *error_count += 1;
                        }
                        SseEvent::Open => {
                            let mut open_count = open_count_ref.lock().unwrap();
                            *open_count += 1;
                        }
                        SseEvent::Close => {}
                    },
                    None,
                    None,
                )
                .await
        });
        tokio::time::sleep(Duration::from_millis(1000)).await;
        thread.abort();
        assert_eq!(*open_count.lock().unwrap(), 1);
        assert!(*msg_count.lock().unwrap() > 0,);
        assert_eq!(*error_count.lock().unwrap(), 0);
    }
}
