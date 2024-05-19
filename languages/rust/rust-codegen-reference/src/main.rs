mod example_client;

fn main() {}

#[cfg(test)]
mod parsing_and_serialization_tests {
    use crate::example_client::{
        Book, BookParams, Discriminator, Enumerator, NestedObject, ObjectWithEveryType,
        ObjectWithOptionalFields,
    };
    use arri_client::{chrono::DateTime, serde_json, ArriModel};
    use std::{
        collections::{hash_map, BTreeMap, HashMap},
        fs,
    };

    #[test]
    fn book_test() {
        let file_path: String = "../../../tests/test-files/Book.json".to_string();
        let file_contents: String = fs::read_to_string(file_path).unwrap();

        let reference: Book = Book {
            id: "1".to_string(),
            name: "The Adventures of Tom Sawyer".to_string(),
            created_at: DateTime::parse_from_rfc3339("2001-01-01T16:00:00.000Z").unwrap(),
            updated_at: DateTime::parse_from_rfc3339("2001-01-01T16:00:00.000Z").unwrap(),
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
        let target_date =
            DateTime::parse_from_rfc3339("2001-01-01T16:00:00.000Z").unwrap_or(DateTime::default());
        let file_path = "../../../tests/test-files/ObjectWithEveryType.json";
        let file_content = fs::read_to_string(file_path).unwrap();
        let mut record_val: BTreeMap<String, bool> = BTreeMap::new();
        record_val.insert("A".to_string(), true);
        record_val.insert("B".to_string(), false);
        let reference = ObjectWithEveryType {
            string: "".to_string(),
            boolean: false,
            timestamp: target_date,
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
                date: target_date,
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
        let target_date =
            DateTime::parse_from_rfc3339("2001-01-01T16:00:00.000Z").unwrap_or(DateTime::default());
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
            timestamp: Some(target_date),
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
                date: target_date,
            }),
            any: Some(serde_json::Value::String("hello world".to_string())),
        };

        assert_eq!(
            ObjectWithOptionalFields::from_json_string(file_content.clone()),
            reference.clone()
        );
        assert_eq!(reference.to_json_string(), file_content.clone());
    }
}
