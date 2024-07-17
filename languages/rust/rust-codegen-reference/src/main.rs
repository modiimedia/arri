use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use arri_client::{chrono::DateTime, reqwest, ArriClientConfig, ArriClientService};
use example_client::{Book, BookParams, ExampleClient};

mod example_client;

fn get_headers() -> HashMap<&'static str, String> {
    let mut headers = HashMap::new();
    headers.insert("Authorization", "Bearer 12345".to_string());
    headers
}

#[tokio::main]
async fn main() {
    let client = ExampleClient::create(ArriClientConfig {
        http_client: reqwest::Client::new(),
        base_url: "http://localhost:2020".to_string(),
        headers: get_headers(),
    });
    let result = client
        .books
        .create_book(Book {
            id: "1".to_string(),
            name: "Tom Sawyer".to_string(),
            created_at: DateTime::default(),
            updated_at: DateTime::default(),
        })
        .await;

    tokio::spawn(async move {
        client
            .books
            .watch_book(
                BookParams {
                    book_id: "12345".to_string(),
                },
                &mut |event, controller| match event {
                    arri_client::sse::SseEvent::Message(_) => {
                        controller.abort();
                        client.update_headers(HashMap::new());
                    }
                    arri_client::sse::SseEvent::Error(_) => {}
                    arri_client::sse::SseEvent::Open => {}
                    arri_client::sse::SseEvent::Close => {}
                },
                None,
                None,
            )
            .await;
    });
    println!("CREATE_BOOK_RESULT: {:?}", result);
}

#[cfg(test)]
mod parsing_and_serialization_tests {
    use crate::example_client::{
        Book, BookParams, Discriminator, Enumerator, NestedObject, ObjectWithEveryType,
        ObjectWithNullableFields, ObjectWithOptionalFields, RecursiveObject,
    };
    use arri_client::{
        chrono::{DateTime, FixedOffset},
        serde_json::{self, json},
        ArriModel,
    };
    use std::{collections::BTreeMap, fs};

    fn get_test_date() -> DateTime<FixedOffset> {
        DateTime::parse_from_rfc3339("2001-01-01T16:00:00.000Z").unwrap_or(DateTime::default())
    }

    #[test]
    fn book_test() {
        let file_path: String = "../../../tests/test-files/Book.json".to_string();
        let file_contents: String = fs::read_to_string(file_path).unwrap();

        let reference: Book = Book {
            id: "1".to_string(),
            name: "The Adventures of Tom Sawyer".to_string(),
            created_at: get_test_date(),
            updated_at: get_test_date(),
        };

        assert_eq!(
            Book::from_json_string(file_contents.clone()),
            reference.clone()
        );
        assert_eq!(reference.to_json_string(), file_contents.clone());
        assert_eq!(reference.to_query_params_string(), "id=1&name=The Adventures of Tom Sawyer&createdAt=2001-01-01T16:00:00.000Z&updatedAt=2001-01-01T16:00:00.000Z")
    }

    #[test]
    fn book_params_test() {
        let file_path = "../../../tests/test-files/BookParams.json".to_string();
        let file_contents = fs::read_to_string(file_path).unwrap();
        let reference = BookParams {
            book_id: "1".to_string(),
        };
        assert_eq!(
            BookParams::from_json_string(file_contents.clone()),
            reference.clone()
        );
        assert_eq!(reference.to_json_string(), file_contents.clone());
        assert_eq!(reference.to_query_params_string(), "bookId=1");
    }

    #[test]
    fn nested_object_no_special_chars_test() {
        let file_content =
            fs::read_to_string("../../../tests/test-files/NestedObject_NoSpecialChars.json")
                .unwrap();
        let reference = NestedObject {
            id: "1".to_string(),
            content: "hello world".to_string(),
        };
        assert_eq!(
            NestedObject::from_json_string(file_content.clone()),
            reference.clone()
        );
        assert_eq!(reference.to_json_string(), file_content.clone());
    }

    #[test]
    fn nested_object_special_chars_test() {
        let file_path = "../../../tests/test-files/NestedObject_SpecialChars.json";
        let file_content = fs::read_to_string(file_path).unwrap();
        let reference = NestedObject {
            id: "1".to_string(),
            content: "double-quote: \" | backslash: \\ | backspace: \x08 | form-feed: \x0C | newline: \n | carriage-return: \r | tab: \t | unicode: \u{0000}".to_string(),
        };
        assert_eq!(
            NestedObject::from_json_string(file_content.clone()),
            reference.clone()
        );
        assert_eq!(reference.to_json_string(), file_content.clone());
    }

    #[test]
    fn object_with_every_type_test() {
        let file_path = "../../../tests/test-files/ObjectWithEveryType.json";
        let file_content = fs::read_to_string(file_path).unwrap();
        let mut record_val: BTreeMap<String, bool> = BTreeMap::new();
        record_val.insert("A".to_string(), true);
        record_val.insert("B".to_string(), false);
        let reference = ObjectWithEveryType {
            string: "".to_string(),
            boolean: false,
            timestamp: get_test_date(),
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
            r#enum: Enumerator::Baz,
            object: NestedObject {
                id: "1".to_string(),
                content: "hello world".to_string(),
            },
            array: vec![true, false, false],
            record: record_val,
            discriminator: Discriminator::C {
                id: "".to_string(),
                name: "".to_string(),
                date: get_test_date(),
            },
            any: serde_json::Value::String("hello world".to_string()),
        };

        assert_eq!(
            ObjectWithEveryType::from_json_string(file_content.clone()),
            reference.clone()
        );
        assert_eq!(file_content.clone(), reference.to_json_string());
    }

    #[test]
    fn object_with_optional_fields_test() {
        let file_content = fs::read_to_string(
            "../../../tests/test-files/ObjectWithOptionalFields_AllUndefined.json",
        )
        .unwrap();
        let reference = ObjectWithOptionalFields::new();
        assert_eq!(
            ObjectWithOptionalFields::from_json_string(file_content.clone()),
            reference.clone()
        );
        assert_eq!(reference.to_json_string(), file_content.clone());
    }

    #[test]
    fn object_with_optional_fields_no_undefined_test() {
        let file_content = fs::read_to_string(
            "../../../tests/test-files/ObjectWithOptionalFields_NoUndefined.json",
        )
        .unwrap();
        let mut record_val: BTreeMap<String, bool> = BTreeMap::new();
        record_val.insert("A".to_string(), true);
        record_val.insert("B".to_string(), false);
        let reference = ObjectWithOptionalFields {
            string: Some("".to_string()),
            boolean: Some(false),
            timestamp: Some(get_test_date()),
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
            r#enum: Some(Enumerator::Baz),
            object: Some(NestedObject {
                id: "1".to_string(),
                content: "hello world".to_string(),
            }),
            array: Some(vec![true, false, false]),
            record: Some(record_val),
            discriminator: Some(Discriminator::C {
                id: "".to_string(),
                name: "".to_string(),
                date: get_test_date(),
            }),
            any: Some(serde_json::Value::String("hello world".to_string())),
        };

        assert_eq!(
            ObjectWithOptionalFields::from_json_string(file_content.clone()),
            reference.clone()
        );
        assert_eq!(reference.to_json_string(), file_content.clone());
    }

    #[test]
    fn object_with_nullable_fields_all_null_test() {
        let file_path = "../../../tests/test-files/ObjectWithNullableFields_AllNull.json";
        let file_content = fs::read_to_string(file_path).unwrap();
        let reference = ObjectWithNullableFields {
            string: None,
            boolean: None,
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
            r#enum: None,
            object: None,
            array: None,
            record: None,
            discriminator: None,
            any: serde_json::Value::Null,
        };
        assert_eq!(
            ObjectWithNullableFields::from_json_string(file_content.clone()),
            reference.clone()
        );
        assert_eq!(reference.to_json_string(), file_content.clone());
    }

    #[test]
    fn object_with_nullable_fields_no_null_test() {
        let file_path = "../../../tests/test-files/ObjectWithNullableFields_NoNull.json";
        let file_content = fs::read_to_string(file_path).unwrap();
        let mut record_val: BTreeMap<String, bool> = BTreeMap::new();
        record_val.insert("A".to_string(), true);
        record_val.insert("B".to_string(), false);
        let mut any_val: BTreeMap<String, String> = BTreeMap::new();
        any_val.insert("message".to_string(), "hello world".to_string());
        let reference = ObjectWithNullableFields {
            string: Some("".to_string()),
            boolean: Some(true),
            timestamp: Some(get_test_date()),
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
            r#enum: Some(Enumerator::Baz),
            object: Some(NestedObject {
                id: "".to_string(),
                content: "".to_string(),
            }),
            array: Some(vec![true, false, false]),
            record: Some(record_val),
            discriminator: Some(Discriminator::C {
                id: "".to_string(),
                name: "".to_string(),
                date: get_test_date(),
            }),
            any: json!({"message": "hello world"}),
        };
        assert_eq!(
            ObjectWithNullableFields::from_json_string(file_content.clone()),
            reference.clone()
        );
        assert_eq!(reference.to_json_string(), file_content.clone());
    }

    #[test]
    fn recursive_object_test() {
        let file_path = "../../../tests/test-files/RecursiveObject.json";
        let file_content = fs::read_to_string(file_path).unwrap();
        let reference = RecursiveObject {
            left: Some(Box::new(RecursiveObject {
                left: Some(Box::new(RecursiveObject {
                    left: None,
                    right: Some(Box::new(RecursiveObject {
                        left: None,
                        right: None,
                    })),
                })),
                right: None,
            })),
            right: Some(Box::new(RecursiveObject {
                left: None,
                right: None,
            })),
        };
        assert_eq!(
            RecursiveObject::from_json_string(file_content.clone()),
            reference.clone()
        );
        assert_eq!(file_content.clone(), reference.to_json_string());
        assert_eq!(reference.to_query_params_string(), "".to_string());
    }
}
