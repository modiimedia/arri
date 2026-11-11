//! Behavior tests for `#[derive(ArriModel)]`
#![deny(warnings)]

use arri::{ArriModel, ArriSchema, DecodeErrorKind, Nullable, Timestamp, Value, json, type_def_of};

fn decode_err<T: ArriModel + std::fmt::Debug>(input: &str) -> arri::DecodeError {
    json::from_str::<T>(input).expect_err("expected decoding to fail")
}

mod metadata {
    use super::*;

    /// First paragraph.
    ///
    /// Second paragraph
    ///     with indentation.
    #[derive(ArriModel)]
    #[arri(id = "CustomId")]
    #[deprecated(since = "1.0.0", note = "use something else")]
    #[allow(dead_code)]
    pub struct Documented {
        /** A block doc comment */
        a: String,
        #[deprecated]
        b: String,
        #[deprecated = "short form"]
        c: String,
    }

    #[test]
    #[allow(deprecated)]
    fn doc_comments_and_deprecation() {
        assert_eq!(
            type_def_of::<Documented>().to_json(),
            concat!(
                r#"{"properties":{"#,
                r#""a":{"type":"string","metadata":{"description":"A block doc comment"}},"#,
                r#""b":{"type":"string","metadata":{"isDeprecated":true}},"#,
                r#""c":{"type":"string","metadata":{"isDeprecated":true,"deprecatedNote":"short form"}}},"#,
                r#""metadata":{"id":"CustomId","description":"First paragraph.\n\nSecond paragraph\n    with indentation.","isDeprecated":true,"deprecatedNote":"use something else"}}"#,
            )
        );
    }
}

mod structs {
    use super::*;

    #[derive(ArriModel, Debug, PartialEq)]
    struct User {
        id: String,
        r#type: String,
        #[arri(rename = "EMAIL")]
        email: Nullable<String>,
        bio: Option<String>,
        nickname: Option<Nullable<String>>,
    }

    #[test]
    fn default_keys_match_field_names() {
        let user = User {
            id: "1".into(),
            r#type: "admin".into(),
            email: Nullable::Null,
            bio: None,
            nickname: None,
        };
        let encoded = json::to_string(&user).unwrap();
        assert_eq!(encoded, r#"{"id":"1","type":"admin","EMAIL":null}"#);
        assert_eq!(json::from_str::<User>(&encoded).unwrap(), user);
    }

    #[test]
    fn optional_vs_nullable() {
        let cases = [
            (r#"{"id":"1","type":"","EMAIL":null}"#, None),
            (
                r#"{"id":"1","type":"","EMAIL":null,"nickname":null}"#,
                Some(Nullable::Null),
            ),
            (
                r#"{"id":"1","type":"","EMAIL":null,"nickname":"bob"}"#,
                Some(Nullable::Present("bob".to_string())),
            ),
        ];
        for (input, nickname) in cases {
            let user: User = json::from_str(input).unwrap();
            assert_eq!(user.nickname, nickname);
            assert_eq!(json::to_string(&user).unwrap(), input);
        }

        // nullable fields cannot be omitted
        let err = decode_err::<User>(r#"{"id":"1","type":""}"#);
        assert_eq!(err.kind(), DecodeErrorKind::MissingField);
        assert_eq!(err.message(), "missing required field \"EMAIL\"");

        // optional fields cannot be null
        let err = decode_err::<User>(r#"{"id":"1","type":"","EMAIL":null,"bio":null}"#);
        assert_eq!(err.kind(), DecodeErrorKind::InvalidType);
        assert_eq!(err.instance_path(), "/bio");
    }

    #[test]
    fn schema_uses_optional_properties() {
        assert_eq!(
            type_def_of::<User>().to_json(),
            concat!(
                r#"{"properties":{"id":{"type":"string"},"type":{"type":"string"},"EMAIL":{"type":"string","isNullable":true}},"#,
                r#""optionalProperties":{"bio":{"type":"string"},"nickname":{"type":"string","isNullable":true}},"#,
                r#""metadata":{"id":"User"}}"#
            )
        );
    }

    #[test]
    fn unknown_fields_are_ignored_by_default() {
        let user: User = json::from_str(
            r#"{"extra":{"nested":[1,2,{"a":null}]},"id":"1","type":"","EMAIL":"a@b.c","more":"x"}"#,
        )
        .unwrap();
        assert_eq!(user.email, Nullable::Present("a@b.c".to_string()));
    }

    #[derive(ArriModel, Debug, PartialEq)]
    #[arri(strict, rename_all = "camelCase")]
    struct StrictParams {
        user_id: String,
    }

    #[test]
    fn strict_structs_reject_unknown_fields() {
        let err = decode_err::<StrictParams>(r#"{"userId":"1","user_id":"1"}"#);
        assert_eq!(err.kind(), DecodeErrorKind::UnknownField);
        assert_eq!(err.message(), "unknown field \"user_id\"");
        assert_eq!(
            type_def_of::<StrictParams>().to_json(),
            r#"{"properties":{"userId":{"type":"string"}},"isStrict":true,"metadata":{"id":"StrictParams"}}"#
        );
    }

    #[derive(ArriModel, Debug, PartialEq)]
    struct Outer {
        items: Vec<Inner>,
    }

    #[derive(ArriModel, Debug, PartialEq)]
    struct Inner {
        name: String,
        count: u8,
    }

    #[test]
    fn errors_report_the_instance_path() {
        let err =
            decode_err::<Outer>(r#"{"items":[{"name":"a","count":1},{"name":"b","count":300}]}"#);
        assert_eq!(err.kind(), DecodeErrorKind::InvalidValue);
        assert_eq!(err.instance_path(), "/items/1/count");
        assert_eq!(
            err.to_string(),
            "300 is out of range for uint8 at \"/items/1/count\""
        );

        let err = decode_err::<Outer>(r#"{"items":[{"name":"a"}]}"#);
        assert_eq!(err.kind(), DecodeErrorKind::MissingField);
        assert_eq!(err.instance_path(), "/items/0");

        let err = decode_err::<Outer>(r#"{"items":[{"name":1,"count":1}]}"#);
        assert_eq!(err.message(), "expected string but found number");
        assert_eq!(err.instance_path(), "/items/0/name");
    }

    #[test]
    fn escaped_keys_match_fields() {
        let inner: Inner = json::from_str(r#"{"n\u0061me":"a","\u0063ount":2}"#).unwrap();
        assert_eq!(
            inner,
            Inner {
                name: "a".into(),
                count: 2
            }
        );
    }

    #[test]
    fn duplicate_keys_are_rejected() {
        let err = decode_err::<Inner>(r#"{"name":"a","count":1,"name":"b"}"#);
        assert_eq!(err.kind(), DecodeErrorKind::DuplicateKey);
        assert_eq!(err.message(), "duplicate key \"name\"");
        assert_eq!(err.instance_path(), "");
        // escaped keys are compared after unescaping
        let err = decode_err::<Inner>(r#"{"name":"a","count":1,"name":"b"}"#);
        assert_eq!(err.kind(), DecodeErrorKind::DuplicateKey);
    }

    /// A user id
    #[derive(ArriModel, Debug, PartialEq)]
    struct UserId(String);

    #[test]
    fn newtype_structs_are_transparent() {
        assert_eq!(json::to_string(&UserId("1".into())).unwrap(), r#""1""#);
        assert_eq!(
            json::from_str::<UserId>(r#""1""#).unwrap(),
            UserId("1".into())
        );
        assert_eq!(
            type_def_of::<UserId>().to_json(),
            r#"{"type":"string","metadata":{"description":"A user id"}}"#
        );
        assert_eq!(UserId::generic_name(), "String");
    }

    #[derive(ArriModel, Debug, PartialEq)]
    struct Empty {}

    #[test]
    fn empty_structs() {
        assert_eq!(json::to_string(&Empty {}).unwrap(), "{}");
        assert_eq!(json::from_str::<Empty>(r#"{"a":1}"#).unwrap(), Empty {});
        assert!(json::from_str::<Empty>("[]").is_err());
    }
}

mod enums {
    use super::*;

    #[derive(ArriModel, Debug, PartialEq, Clone, Copy)]
    enum Role {
        Standard,
        #[arri(rename = "ADMIN")]
        Admin,
        SuperUser,
    }

    #[test]
    fn values_default_to_variant_names() {
        assert_eq!(
            type_def_of::<Role>().to_json(),
            r#"{"enum":["Standard","ADMIN","SuperUser"],"metadata":{"id":"Role"}}"#
        );
        for role in [Role::Standard, Role::Admin, Role::SuperUser] {
            let encoded = json::to_string(&role).unwrap();
            assert_eq!(json::from_str::<Role>(&encoded).unwrap(), role);
        }
        assert_eq!(json::to_string(&Role::SuperUser).unwrap(), r#""SuperUser""#);
    }

    #[test]
    fn escaped_values_are_matched() {
        assert_eq!(
            json::from_str::<Role>(r#""\u0041DMIN""#).unwrap(),
            Role::Admin
        );
    }

    #[test]
    fn unknown_values_are_rejected() {
        let err = decode_err::<Role>(r#""Admin""#);
        assert_eq!(err.kind(), DecodeErrorKind::UnknownVariant);
        assert_eq!(
            err.message(),
            r#"unknown value "Admin", expected one of ["Standard", "ADMIN", "SuperUser"]"#
        );
    }

    #[derive(ArriModel, Debug, PartialEq)]
    #[arri(rename_all = "camelCase")]
    enum Status {
        InProgress,
        Done,
    }

    #[test]
    fn rename_all() {
        assert_eq!(
            json::to_string(&Status::InProgress).unwrap(),
            r#""inProgress""#
        );
        assert_eq!(json::from_str::<Status>(r#""done""#).unwrap(), Status::Done);
    }
}

mod unions {
    use super::*;

    #[derive(ArriModel, Debug, PartialEq)]
    struct Message {
        text: String,
    }

    /// An event
    #[derive(ArriModel, Debug, PartialEq)]
    enum External {
        Connected,
        Message(Message),
        Count(u32),
        /// Moved somewhere
        Moved {
            x: f64,
            y: Option<f64>,
        },
    }

    #[test]
    fn externally_tagged() {
        let cases = [
            (External::Connected, r#"{"Connected":{}}"#),
            (
                External::Message(Message { text: "hi".into() }),
                r#"{"Message":{"text":"hi"}}"#,
            ),
            (External::Count(5), r#"{"Count":5}"#),
            (
                External::Moved { x: 1.5, y: None },
                r#"{"Moved":{"x":1.5}}"#,
            ),
            (
                External::Moved {
                    x: 1.5,
                    y: Some(-2.0),
                },
                r#"{"Moved":{"x":1.5,"y":-2}}"#,
            ),
        ];
        for (value, expected) in cases {
            assert_eq!(json::to_string(&value).unwrap(), expected);
            assert_eq!(json::from_str::<External>(expected).unwrap(), value);
        }
        assert_eq!(
            type_def_of::<External>().to_json(),
            concat!(
                r#"{"union":{"Connected":{"properties":{}},"#,
                r#""Message":{"properties":{"text":{"type":"string"}},"metadata":{"id":"Message"}},"#,
                r#""Count":{"type":"uint32"},"#,
                r#""Moved":{"properties":{"x":{"type":"float64"}},"optionalProperties":{"y":{"type":"float64"}},"metadata":{"description":"Moved somewhere"}}},"#,
                r#""metadata":{"id":"External","description":"An event"}}"#
            )
        );
    }

    #[test]
    fn externally_tagged_errors() {
        let err = decode_err::<External>(r#"{"Unknown":{}}"#);
        assert_eq!(err.kind(), DecodeErrorKind::UnknownVariant);
        assert_eq!(err.instance_path(), "/Unknown");

        let err = decode_err::<External>(r#"{}"#);
        assert_eq!(err.kind(), DecodeErrorKind::InvalidValue);

        let err = decode_err::<External>(r#"{"Count":1,"Connected":{}}"#);
        assert_eq!(err.kind(), DecodeErrorKind::InvalidValue);

        let err = decode_err::<External>(r#"{"Moved":{"y":1}}"#);
        assert_eq!(err.kind(), DecodeErrorKind::MissingField);
        assert_eq!(err.instance_path(), "/Moved");

        let err = decode_err::<External>(r#"{"Message":{"text":true}}"#);
        assert_eq!(err.instance_path(), "/Message/text");
    }

    #[derive(ArriModel, Debug, PartialEq)]
    #[arri(tag_key = "type", rename_all = "snake_case")]
    enum Internal {
        Ping,
        Message(Message),
        TextMessage { text: String, sent_at: Timestamp },
    }

    #[test]
    fn internally_tagged() {
        let sent_at = Timestamp::parse("2001-01-01T16:00:00Z").unwrap();
        let cases = [
            (Internal::Ping, r#"{"type":"ping"}"#),
            (
                Internal::Message(Message { text: "hi".into() }),
                r#"{"type":"message","text":"hi"}"#,
            ),
            (
                Internal::TextMessage {
                    text: "hi".into(),
                    sent_at,
                },
                r#"{"type":"text_message","text":"hi","sent_at":"2001-01-01T16:00:00.000Z"}"#,
            ),
        ];
        for (value, expected) in cases {
            assert_eq!(json::to_string(&value).unwrap(), expected);
            assert_eq!(json::from_str::<Internal>(expected).unwrap(), value);
        }
    }

    #[test]
    fn internally_tagged_with_tag_after_fields() {
        // the tag doesn't need to be the first key
        let value: Internal = json::from_str(
            r#"{"text":"hi","extra":[1,{"a":"b"}],"sent_at":"2001-01-01T16:00:00.000Z","type":"text_message"}"#,
        )
        .unwrap();
        assert_eq!(
            value,
            Internal::TextMessage {
                text: "hi".into(),
                sent_at: Timestamp::parse("2001-01-01T16:00:00Z").unwrap(),
            }
        );
        let value: Internal = json::from_str(r#"{"text":"hi","type":"message"}"#).unwrap();
        assert_eq!(value, Internal::Message(Message { text: "hi".into() }));

        // errors from the buffered path still have the correct paths
        let err = decode_err::<Internal>(r#"{"sent_at":"nope","text":"hi","type":"text_message"}"#);
        assert_eq!(err.kind(), DecodeErrorKind::InvalidValue);
        assert_eq!(err.instance_path(), "/sent_at");
    }

    #[test]
    fn internally_tagged_errors() {
        let err = decode_err::<Internal>(r#"{"text":"hi"}"#);
        assert_eq!(err.kind(), DecodeErrorKind::MissingField);
        assert_eq!(err.message(), "missing required field \"type\"");

        let err = decode_err::<Internal>(r#"{"type":"pong"}"#);
        assert_eq!(err.kind(), DecodeErrorKind::UnknownVariant);
        assert_eq!(err.instance_path(), "/type");

        let err = decode_err::<Internal>(r#"{"text":"hi","type":5}"#);
        assert_eq!(err.instance_path(), "/type");

        let err = decode_err::<Internal>(r#"{"type":"text_message","text":"hi"}"#);
        assert_eq!(err.message(), "missing required field \"sent_at\"");
    }

    #[derive(ArriModel, Debug, PartialEq)]
    #[arri(tag_key = "kind", value_key = "data")]
    enum Adjacent {
        Empty,
        Text(String),
        Point { x: i32, y: i32 },
        Nothing(Nullable<bool>),
    }

    #[test]
    fn adjacently_tagged() {
        let cases = [
            (Adjacent::Empty, r#"{"kind":"Empty","data":{}}"#),
            (
                Adjacent::Text("hi".into()),
                r#"{"kind":"Text","data":"hi"}"#,
            ),
            (
                Adjacent::Point { x: 1, y: -1 },
                r#"{"kind":"Point","data":{"x":1,"y":-1}}"#,
            ),
            (
                Adjacent::Nothing(Nullable::Null),
                r#"{"kind":"Nothing","data":null}"#,
            ),
        ];
        for (value, expected) in cases {
            assert_eq!(json::to_string(&value).unwrap(), expected);
            assert_eq!(json::from_str::<Adjacent>(expected).unwrap(), value);
        }
        // data before kind
        assert_eq!(
            json::from_str::<Adjacent>(r#"{"data":{"y":2,"x":1},"extra":true,"kind":"Point"}"#)
                .unwrap(),
            Adjacent::Point { x: 1, y: 2 }
        );
        assert_eq!(
            type_def_of::<Adjacent>().to_json(),
            concat!(
                r#"{"tagKey":"kind","valueKey":"data","union":{"Empty":{"properties":{}},"Text":{"type":"string"},"#,
                r#""Point":{"properties":{"x":{"type":"int32"},"y":{"type":"int32"}}},"#,
                r#""Nothing":{"type":"boolean","isNullable":true}},"metadata":{"id":"Adjacent"}}"#
            )
        );
    }

    #[test]
    fn adjacently_tagged_errors() {
        let err = decode_err::<Adjacent>(r#"{"data":"hi"}"#);
        assert_eq!(err.message(), "missing required field \"kind\"");

        let err = decode_err::<Adjacent>(r#"{"kind":"Text"}"#);
        assert_eq!(err.message(), "missing required field \"data\"");

        let err = decode_err::<Adjacent>(r#"{"kind":"Point","data":{"x":1,"y":"2"}}"#);
        assert_eq!(err.instance_path(), "/data/y");

        let err = decode_err::<Adjacent>(r#"{"data":{"x":1,"y":"2"},"kind":"Point"}"#);
        assert_eq!(err.instance_path(), "/data/y");
    }

    #[derive(ArriModel, Debug, PartialEq)]
    #[arri(tag_key = "op", strict)]
    enum StrictInternal {
        Add { a: i32, b: i32 },
        Noop,
    }

    #[test]
    fn strict_unions() {
        assert_eq!(
            json::from_str::<StrictInternal>(r#"{"a":1,"op":"Add","b":2}"#).unwrap(),
            StrictInternal::Add { a: 1, b: 2 }
        );
        let err = decode_err::<StrictInternal>(r#"{"op":"Add","a":1,"b":2,"c":3}"#);
        assert_eq!(err.kind(), DecodeErrorKind::UnknownField);
        let err = decode_err::<StrictInternal>(r#"{"op":"Noop","c":3}"#);
        assert_eq!(err.kind(), DecodeErrorKind::UnknownField);
        assert_eq!(
            type_def_of::<StrictInternal>().to_json(),
            concat!(
                r#"{"tagKey":"op","union":{"Add":{"properties":{"a":{"type":"int32"},"b":{"type":"int32"}},"isStrict":true},"#,
                r#""Noop":{"properties":{},"isStrict":true}},"metadata":{"id":"StrictInternal"}}"#
            )
        );
    }

    #[derive(ArriModel, Debug, PartialEq)]
    enum Expr {
        Number(f64),
        Add { left: Box<Expr>, right: Box<Expr> },
    }

    #[test]
    fn recursive_unions() {
        let expr = Expr::Add {
            left: Box::new(Expr::Number(1.0)),
            right: Box::new(Expr::Add {
                left: Box::new(Expr::Number(2.0)),
                right: Box::new(Expr::Number(3.5)),
            }),
        };
        let encoded = json::to_string(&expr).unwrap();
        assert_eq!(
            encoded,
            r#"{"Add":{"left":{"Number":1},"right":{"Add":{"left":{"Number":2},"right":{"Number":3.5}}}}}"#
        );
        assert_eq!(json::from_str::<Expr>(&encoded).unwrap(), expr);
        assert_eq!(
            type_def_of::<Expr>().to_json(),
            r#"{"union":{"Number":{"type":"float64"},"Add":{"properties":{"left":{"ref":"Expr"},"right":{"ref":"Expr"}}}},"metadata":{"id":"Expr"}}"#
        );
    }
}

mod generics {
    use super::*;

    #[derive(ArriModel, Debug, PartialEq)]
    struct User {
        id: String,
    }

    /// A page of results
    #[derive(ArriModel, Debug, PartialEq)]
    struct Page<T> {
        items: Vec<T>,
        next: Nullable<String>,
    }

    #[derive(ArriModel, Debug, PartialEq)]
    struct Pair<A, B> {
        a: A,
        b: B,
    }

    #[derive(ArriModel, Debug, PartialEq)]
    #[arri(tag_key = "type")]
    enum Event<T> {
        Created(T),
        Deleted { id: String },
    }

    #[test]
    fn ids_include_type_arguments() {
        assert_eq!(<Page<User>>::generic_name(), "UserPage");
        assert_eq!(<Page<Vec<User>>>::generic_name(), "UserArrayPage");
        assert_eq!(
            <Pair<String, Nullable<u8>>>::generic_name(),
            "StringUint8NullablePair"
        );
        assert_eq!(<Page<Page<User>>>::generic_name(), "UserPagePage");
        assert_eq!(
            type_def_of::<Page<User>>().to_json(),
            concat!(
                r#"{"properties":{"items":{"elements":{"properties":{"id":{"type":"string"}},"metadata":{"id":"User"}}},"#,
                r#""next":{"type":"string","isNullable":true}},"metadata":{"id":"UserPage","description":"A page of results"}}"#
            )
        );
    }

    #[test]
    fn instantiations_with_different_shapes_get_different_ids() {
        let ids = [
            type_def_of::<Page<User>>().metadata.id,
            type_def_of::<Page<Nullable<User>>>().metadata.id,
            type_def_of::<Page<Vec<User>>>().metadata.id,
            type_def_of::<Page<Vec<Nullable<User>>>>().metadata.id,
            type_def_of::<Page<Nullable<Vec<User>>>>().metadata.id,
        ];
        assert_eq!(
            ids.map(Option::unwrap),
            [
                "UserPage",
                "UserNullablePage",
                "UserArrayPage",
                "UserNullableArrayPage",
                "UserArrayNullablePage",
            ]
            .map(String::from)
        );
        // Box doesn't change the schema so it doesn't change the id
        assert_eq!(<Page<Box<User>>>::generic_name(), "UserPage");
    }

    #[test]
    fn arrays_records_and_nullable_values_have_no_id_of_their_own() {
        use std::collections::HashMap;

        assert_eq!(type_def_of::<Vec<User>>().metadata.id, None);
        assert_eq!(type_def_of::<HashMap<String, User>>().metadata.id, None);
        assert_eq!(type_def_of::<Vec<Nullable<String>>>().metadata.id, None);
        // the named type inside keeps its own id
        let arri::Form::Elements(inner) = type_def_of::<Vec<User>>().form else {
            panic!("expected the elements form")
        };
        assert_eq!(inner.metadata.id.as_deref(), Some("User"));
        // Nullable<T> has the same schema (and id) as T
        let nullable = type_def_of::<Nullable<User>>();
        assert!(nullable.is_nullable);
        assert_eq!(nullable.metadata.id.as_deref(), Some("User"));
    }

    #[derive(ArriModel, Debug, PartialEq)]
    struct Maybe<T> {
        nullable: Nullable<T>,
        optional: Option<T>,
        both: Option<Nullable<T>>,
    }

    #[test]
    fn option_and_nullable_keep_the_inner_id() {
        assert_eq!(<Maybe<User>>::generic_name(), "UserMaybe");
        // every field reuses User's schema (and id). Nullable only adds `isNullable`, and Option
        // only moves the field into `optionalProperties`.
        let user = r#"{"properties":{"id":{"type":"string"}}"#;
        assert_eq!(
            type_def_of::<Maybe<User>>().to_json(),
            format!(
                concat!(
                    r#"{{"properties":{{"nullable":{user},"isNullable":true,"metadata":{{"id":"User"}}}}}},"#,
                    r#""optionalProperties":{{"optional":{user},"metadata":{{"id":"User"}}}},"#,
                    r#""both":{user},"isNullable":true,"metadata":{{"id":"User"}}}}}},"#,
                    r#""metadata":{{"id":"UserMaybe"}}}}"#
                ),
                user = user
            )
        );
    }

    #[test]
    fn generic_encode_decode() {
        let page = Page {
            items: vec![User { id: "1".into() }],
            next: Nullable::Null,
        };
        let encoded = json::to_string(&page).unwrap();
        assert_eq!(encoded, r#"{"items":[{"id":"1"}],"next":null}"#);
        assert_eq!(json::from_str::<Page<User>>(&encoded).unwrap(), page);

        let event = Event::Created(User { id: "1".into() });
        let encoded = json::to_string(&event).unwrap();
        assert_eq!(encoded, r#"{"type":"Created","id":"1"}"#);
        assert_eq!(json::from_str::<Event<User>>(&encoded).unwrap(), event);
        assert_eq!(<Event<User>>::generic_name(), "UserEvent");
    }
}

mod crate_path {
    mod reexport {
        pub use arri as renamed;
    }

    #[derive(reexport::renamed::ArriModel, Debug, PartialEq)]
    #[arri(crate = "reexport::renamed")]
    struct Foo {
        a: bool,
    }

    #[test]
    fn custom_crate_path() {
        assert_eq!(
            arri::json::to_string(&Foo { a: true }).unwrap(),
            r#"{"a":true}"#
        );
    }
}

mod any {
    use super::*;

    #[derive(ArriModel, Debug, PartialEq)]
    struct Event {
        payload: Value,
    }

    #[test]
    fn any_values_preserve_structure() {
        let input =
            r#"{"payload":{"b":[1,-2,1.5,"x",null,true],"a":{"nested":"9007199254740993"}}}"#;
        let event: Event = json::from_str(input).unwrap();
        assert_eq!(json::to_string(&event).unwrap(), input);
        assert_eq!(
            type_def_of::<Event>().to_json(),
            r#"{"properties":{"payload":{}},"metadata":{"id":"Event"}}"#
        );
    }
}

mod prelude {
    use arri::prelude::*;

    #[derive(ArriModel, Debug, PartialEq)]
    struct Profile {
        name: Nullable<String>,
        age: Nullable<u8>,
    }

    #[test]
    fn variants_can_be_used_without_a_prefix() {
        let profile = Profile {
            name: Present("John".to_string()),
            age: Null,
        };
        let encoded = arri::json::to_string(&profile).unwrap();
        assert_eq!(encoded, r#"{"name":"John","age":null}"#);
        let decoded: Profile = arri::json::from_str(&encoded).unwrap();
        assert!(matches!(decoded.age, Null));
        assert_eq!(decoded, profile);
    }
}

mod definitions {
    use arri::{ArriModel, ArriSchema, Nullable, SchemaContext, definitions_of, type_def_of};

    fn ids(definitions: &[(String, arri::TypeDef)]) -> Vec<&str> {
        definitions.iter().map(|(id, _)| id.as_str()).collect()
    }

    #[derive(ArriModel)]
    struct User {
        id: String,
    }

    #[derive(ArriModel)]
    #[allow(dead_code)]
    enum Role {
        Admin,
        Standard,
    }

    #[derive(ArriModel)]
    struct Root {
        owner: User,
        members: Vec<User>,
        role: Nullable<Role>,
        tags: Vec<String>,
    }

    #[test]
    fn named_types_are_collected_once_in_order() {
        let definitions = definitions_of::<Root>().unwrap();
        assert_eq!(ids(&definitions), ["Root", "User", "Role"]);
        // nested types are written out inline (not replaced with refs) and nullability belongs to the field
        assert_eq!(definitions[0].1, type_def_of::<Root>());
        assert_eq!(definitions[1].1, type_def_of::<User>());
        assert!(!definitions[2].1.is_nullable);
    }

    #[test]
    fn non_named_types_produce_no_definitions() {
        assert!(definitions_of::<Vec<String>>().unwrap().is_empty());
        assert_eq!(
            ids(&definitions_of::<Vec<Nullable<User>>>().unwrap()),
            ["User"]
        );
    }

    #[test]
    fn one_context_can_collect_many_types() {
        let mut ctx = SchemaContext::new();
        User::type_def(&mut ctx);
        Root::type_def(&mut ctx);
        User::type_def(&mut ctx);
        assert_eq!(
            ids(&ctx.into_definitions().unwrap()),
            ["User", "Root", "Role"]
        );
    }

    #[derive(ArriModel)]
    struct Tree {
        children: Vec<Tree>,
    }

    #[derive(ArriModel)]
    struct A {
        b: Nullable<Box<B>>,
    }

    #[derive(ArriModel)]
    struct B {
        a: Nullable<Box<A>>,
    }

    #[derive(ArriModel)]
    struct MutualRoot {
        a: A,
        b: B,
    }

    #[test]
    fn recursive_types() {
        let definitions = definitions_of::<Tree>().unwrap();
        assert_eq!(ids(&definitions), ["Tree"]);
        assert_eq!(
            definitions[0].1.to_json(),
            r#"{"properties":{"children":{"elements":{"ref":"Tree"}}},"metadata":{"id":"Tree"}}"#
        );
        // `B` is first built inside of `A` (where `A` is a ref) and then on its own (where `A` is inline).
        // These are the same type so they must not be treated as a collision.
        let definitions = definitions_of::<MutualRoot>().unwrap();
        assert_eq!(ids(&definitions), ["MutualRoot", "A", "B"]);
    }

    mod same {
        #[derive(arri::ArriModel)]
        pub struct User {
            pub id: String,
        }
    }

    mod different {
        #[derive(arri::ArriModel)]
        pub struct User {
            pub id: u32,
        }
    }

    mod documented {
        /// A user
        #[derive(arri::ArriModel)]
        pub struct User {
            pub id: String,
        }
    }

    #[derive(ArriModel)]
    struct Page<T> {
        items: Vec<T>,
    }

    #[derive(ArriModel)]
    struct SameSchemas {
        a: User,
        b: same::User,
        c: Page<User>,
        d: Page<Box<User>>,
    }

    #[test]
    fn identical_schemas_with_the_same_id_are_merged() {
        let definitions = definitions_of::<SameSchemas>().unwrap();
        assert_eq!(ids(&definitions), ["SameSchemas", "User", "UserPage"]);
    }

    #[derive(ArriModel)]
    struct DifferentSchemas {
        a: User,
        b: different::User,
        // the same collision should only be reported once
        c: different::User,
    }

    #[test]
    fn different_schemas_with_the_same_id_are_an_error() {
        let err = definitions_of::<DifferentSchemas>().unwrap_err();
        assert_eq!(err.collisions().len(), 1);
        let collision = &err.collisions()[0];
        assert_eq!(collision.id, "User");
        assert_eq!(collision.first_type, "derive::definitions::User");
        assert_eq!(
            collision.second_type,
            "derive::definitions::different::User"
        );
        assert_eq!(
            err.to_string(),
            "the id \"User\" is used by `derive::definitions::User` and `derive::definitions::different::User` which have different schemas\nType ids must be unique. Rename one of the types or give it a different id with `#[arri(id = \"...\")]`."
        );
    }

    #[test]
    fn metadata_is_part_of_the_schema() {
        #[derive(ArriModel)]
        struct Docs {
            a: User,
            b: documented::User,
        }
        let err = definitions_of::<Docs>().unwrap_err();
        assert_eq!(err.collisions()[0].id, "User");
    }

    #[derive(ArriModel)]
    #[allow(clippy::upper_case_acronyms)]
    struct AB {
        x: bool,
    }

    #[derive(ArriModel)]
    struct BC {
        y: bool,
    }

    #[derive(ArriModel)]
    struct C {
        z: bool,
    }

    #[derive(ArriModel)]
    struct Pair<L, R> {
        left: L,
        right: R,
    }

    #[derive(ArriModel)]
    struct UserArray {
        users: Vec<User>,
    }

    #[test]
    fn generic_ids_that_collide_are_an_error() {
        #[derive(ArriModel)]
        struct Pairs {
            // both are "ABCPair"
            a: Pair<AB, C>,
            b: Pair<A, BC>,
        }
        let err = definitions_of::<Pairs>().unwrap_err();
        assert_eq!(err.collisions()[0].id, "ABCPair");

        #[derive(ArriModel)]
        struct Pages {
            // both are "UserArrayPage"
            a: Page<Vec<User>>,
            b: Page<UserArray>,
        }
        let err = definitions_of::<Pages>().unwrap_err();
        assert_eq!(err.collisions()[0].id, "UserArrayPage");
    }

    mod nested {
        #[derive(arri::ArriModel)]
        pub struct User {
            pub inner: super::User,
        }
    }

    #[test]
    fn collisions_between_a_type_and_one_it_contains() {
        // `super::User` is built while `nested::User` is still being built so it can't be closed
        // with a ref (that would point at the wrong type)
        let err = definitions_of::<nested::User>().unwrap_err();
        assert_eq!(
            err.collisions()[0].first_type,
            "derive::definitions::nested::User"
        );
        assert_eq!(err.collisions()[0].second_type, "derive::definitions::User");
        // the schema itself still describes the right shape
        assert_eq!(
            type_def_of::<nested::User>().to_json(),
            r#"{"properties":{"inner":{"properties":{"id":{"type":"string"}},"metadata":{"id":"User"}}},"metadata":{"id":"User"}}"#
        );
    }
}

mod skip {
    use std::marker::PhantomData;

    use arri::{ArriModel, ArriSchema, DecodeErrorKind, json, type_def_of};

    /// Doesn't implement any arri traits
    #[derive(Debug, Default, PartialEq)]
    struct Cache(Vec<u8>);

    #[derive(ArriModel, Debug, PartialEq)]
    struct User {
        id: String,
        #[arri(skip)]
        cache: Cache,
        #[arri(skip, default = "default_role")]
        role: String,
        #[arri(skip)]
        hits: Option<u32>,
    }

    fn default_role() -> String {
        "standard".to_string()
    }

    #[test]
    fn skipped_fields_are_excluded_from_the_schema() {
        assert_eq!(
            type_def_of::<User>().to_json(),
            r#"{"properties":{"id":{"type":"string"}},"metadata":{"id":"User"}}"#
        );
    }

    #[test]
    fn skipped_fields_are_not_encoded() {
        let user = User {
            id: "1".into(),
            cache: Cache(vec![1, 2, 3]),
            role: "admin".into(),
            hits: Some(10),
        };
        assert_eq!(json::to_string(&user).unwrap(), r#"{"id":"1"}"#);
    }

    #[test]
    fn skipped_fields_use_defaults_when_decoding() {
        let user: User = json::from_str(r#"{"id":"1"}"#).unwrap();
        assert_eq!(
            user,
            User {
                id: "1".into(),
                cache: Cache::default(),
                role: "standard".into(),
                hits: None,
            }
        );
        // a key matching a skipped field is treated like any other unknown key
        let user: User = json::from_str(r#"{"id":"1","role":"admin","cache":[1]}"#).unwrap();
        assert_eq!(user.role, "standard");
    }

    #[derive(ArriModel, Debug)]
    #[arri(strict)]
    struct StrictUser {
        id: String,
        #[arri(skip)]
        #[allow(dead_code)]
        cache: Cache,
    }

    #[test]
    fn strict_structs_reject_keys_of_skipped_fields() {
        let err = json::from_str::<StrictUser>(r#"{"id":"1","cache":[]}"#).unwrap_err();
        assert_eq!(err.kind(), DecodeErrorKind::UnknownField);
    }

    #[derive(ArriModel, Debug, PartialEq)]
    struct KeyReuse {
        #[arri(skip)]
        name: String,
        // a skipped field doesn't reserve its key
        #[arri(rename = "name")]
        display_name: String,
    }

    #[test]
    fn skipped_fields_do_not_reserve_keys() {
        let value: KeyReuse = json::from_str(r#"{"name":"a"}"#).unwrap();
        assert_eq!(value.display_name, "a");
        assert_eq!(value.name, "");
    }

    #[derive(ArriModel, Debug, PartialEq)]
    #[arri(tag_key = "type")]
    enum Event {
        Created {
            id: String,
            // doesn't conflict with the tag key since it's skipped
            #[arri(skip)]
            r#type: String,
        },
        Deleted {
            #[arri(skip)]
            cache: Cache,
        },
    }

    #[test]
    fn skipped_fields_in_struct_variants() {
        let event = Event::Created {
            id: "1".into(),
            r#type: "ignored".into(),
        };
        assert_eq!(
            json::to_string(&event).unwrap(),
            r#"{"type":"Created","id":"1"}"#
        );
        assert_eq!(
            json::from_str::<Event>(r#"{"type":"Created","id":"1"}"#).unwrap(),
            Event::Created {
                id: "1".into(),
                r#type: String::new(),
            }
        );
        let event = Event::Deleted {
            cache: Cache(vec![1]),
        };
        assert_eq!(json::to_string(&event).unwrap(), r#"{"type":"Deleted"}"#);
        assert_eq!(
            type_def_of::<Event>().to_json(),
            r#"{"tagKey":"type","union":{"Created":{"properties":{"id":{"type":"string"}}},"Deleted":{"properties":{}}},"metadata":{"id":"Event"}}"#
        );
    }

    /// `T` is only used by a skipped field so it doesn't need to implement the arri traits
    #[derive(ArriModel, Debug, PartialEq)]
    struct Tagged<T> {
        name: String,
        #[arri(skip)]
        marker: PhantomData<T>,
    }

    #[test]
    fn type_params_only_used_by_skipped_fields_are_ignored() {
        // Cache doesn't implement ArriSchema / Encode / Decode
        assert_eq!(<Tagged<Cache>>::generic_name(), "Tagged");
        let value = Tagged::<Cache> {
            name: "a".into(),
            marker: PhantomData,
        };
        let encoded = json::to_string(&value).unwrap();
        assert_eq!(json::from_str::<Tagged<Cache>>(&encoded).unwrap(), value);
    }

    #[derive(ArriModel, Debug, PartialEq)]
    struct Holder<T, U> {
        value: T,
        #[arri(skip)]
        extra: U,
    }

    #[test]
    fn skipped_generic_fields_require_default() {
        // U = Cache needs Default (which it has) but no arri traits
        let value: Holder<u8, Cache> = json::from_str(r#"{"value":1}"#).unwrap();
        assert_eq!(
            value,
            Holder {
                value: 1,
                extra: Cache::default()
            }
        );
        assert_eq!(<Holder<u8, Cache>>::generic_name(), "Uint8Holder");
    }
}

mod duplicate_keys {
    use std::collections::{BTreeMap, HashMap};

    use arri::{ArriModel, DecodeErrorKind, Value, json};

    fn kind<T: ArriModel + std::fmt::Debug>(input: &str) -> DecodeErrorKind {
        json::from_str::<T>(input)
            .expect_err("expected decoding to fail")
            .kind()
    }

    #[derive(ArriModel, Debug, PartialEq)]
    struct Fields {
        a: i32,
        b: Option<i32>,
        #[arri(skip)]
        skipped: i32,
    }

    #[derive(ArriModel, Debug, PartialEq)]
    #[arri(strict)]
    struct StrictFields {
        a: i32,
        #[arri(skip)]
        skipped: i32,
    }

    #[derive(ArriModel, Debug, PartialEq)]
    struct Outer {
        inner: Fields,
        list: Vec<Fields>,
    }

    #[test]
    fn struct_fields() {
        assert_eq!(
            kind::<Fields>(r#"{"a":1,"a":2}"#),
            DecodeErrorKind::DuplicateKey
        );
        // optional fields
        assert_eq!(
            kind::<Fields>(r#"{"a":1,"b":1,"b":2}"#),
            DecodeErrorKind::DuplicateKey
        );
        // even when the value is the same
        assert_eq!(
            kind::<Fields>(r#"{"a":1,"a":1}"#),
            DecodeErrorKind::DuplicateKey
        );
        // nested objects report where the duplicate was found
        let err = json::from_str::<Outer>(r#"{"inner":{"a":1},"list":[{"a":1},{"a":1,"a":2}]}"#)
            .unwrap_err();
        assert_eq!(err.kind(), DecodeErrorKind::DuplicateKey);
        assert_eq!(err.instance_path(), "/list/1");
        // a duplicate of a field of the outer object
        assert_eq!(
            kind::<Outer>(r#"{"inner":{"a":1},"list":[],"inner":{"a":2}}"#),
            DecodeErrorKind::DuplicateKey
        );
    }

    #[test]
    fn ignored_keys_may_repeat() {
        // unknown keys and the keys of skipped fields are ignored so repeating them changes nothing
        let value: Fields =
            json::from_str(r#"{"x":1,"a":1,"x":2,"skipped":1,"skipped":2}"#).unwrap();
        assert_eq!(
            value,
            Fields {
                a: 1,
                b: None,
                skipped: 0
            }
        );
        // strict objects reject them for being unknown
        assert_eq!(
            kind::<StrictFields>(r#"{"a":1,"skipped":1}"#),
            DecodeErrorKind::UnknownField
        );
    }

    #[test]
    fn records() {
        assert_eq!(
            kind::<HashMap<String, i32>>(r#"{"a":1,"b":2,"a":3}"#),
            DecodeErrorKind::DuplicateKey
        );
        assert_eq!(
            kind::<BTreeMap<String, i32>>(r#"{"a":1,"b":2,"a":3}"#),
            DecodeErrorKind::DuplicateKey
        );
        let err = json::from_str::<HashMap<String, i32>>(r#"{"a":1,"a":2}"#).unwrap_err();
        assert_eq!(err.message(), "duplicate key \"a\"");
    }

    #[test]
    fn any_values_keep_duplicates() {
        // `Value` represents arbitrary JSON so it keeps every entry
        let value: Value = json::from_str(r#"{"a":1,"a":2}"#).unwrap();
        assert_eq!(json::to_string(&value).unwrap(), r#"{"a":1,"a":2}"#);
    }

    #[derive(ArriModel, Debug, PartialEq)]
    enum External {
        A(i32),
        B(i32),
    }

    #[test]
    fn externally_tagged() {
        assert_eq!(
            kind::<External>(r#"{"A":1,"A":2}"#),
            DecodeErrorKind::DuplicateKey
        );
        // a second tag is still an error, just not a duplicate
        assert_eq!(
            kind::<External>(r#"{"A":1,"B":2}"#),
            DecodeErrorKind::InvalidValue
        );
    }

    #[derive(ArriModel, Debug, PartialEq)]
    #[arri(tag_key = "type")]
    enum Internal {
        Unit,
        Struct { a: i32 },
        Newtype(Fields),
    }

    #[test]
    fn internally_tagged() {
        for input in [
            // tag first (the tag is consumed before the variant's fields are read)
            r#"{"type":"Unit","type":"Unit"}"#,
            r#"{"type":"Struct","a":1,"type":"Struct"}"#,
            r#"{"type":"Struct","a":1,"type":"Unit"}"#,
            r#"{"type":"Newtype","a":1,"type":"Newtype"}"#,
            // tag later (the object is buffered until the tag is found)
            r#"{"a":1,"type":"Struct","type":"Struct"}"#,
            r#"{"a":1,"type":"Struct","type":"Unit"}"#,
            r#"{"a":1,"type":"Newtype","type":"Newtype"}"#,
            // duplicate fields
            r#"{"type":"Struct","a":1,"a":2}"#,
            r#"{"a":1,"a":2,"type":"Struct"}"#,
            r#"{"type":"Newtype","a":1,"a":2}"#,
            r#"{"a":1,"type":"Newtype","a":2}"#,
        ] {
            assert_eq!(
                kind::<Internal>(input),
                DecodeErrorKind::DuplicateKey,
                "{input}"
            );
        }
        assert_eq!(
            json::from_str::<Internal>(r#"{"a":1,"type":"Struct"}"#).unwrap(),
            Internal::Struct { a: 1 }
        );
    }

    #[derive(ArriModel, Debug, PartialEq)]
    #[arri(tag_key = "t", value_key = "v")]
    enum Adjacent {
        Unit,
        Struct { a: i32 },
    }

    #[test]
    fn adjacently_tagged() {
        for input in [
            r#"{"t":"Struct","t":"Struct","v":{"a":1}}"#,
            r#"{"t":"Struct","v":{"a":1},"t":"Unit"}"#,
            r#"{"v":{"a":1},"t":"Struct","t":"Struct"}"#,
            r#"{"t":"Struct","v":{"a":1},"v":{"a":2}}"#,
            r#"{"v":{"a":1},"v":{"a":2},"t":"Struct"}"#,
            r#"{"v":{"a":1},"t":"Struct","v":{"a":2}}"#,
            // duplicate fields inside the value
            r#"{"t":"Struct","v":{"a":1,"a":2}}"#,
            r#"{"v":{"a":1,"a":2},"t":"Struct"}"#,
        ] {
            assert_eq!(
                kind::<Adjacent>(input),
                DecodeErrorKind::DuplicateKey,
                "{input}"
            );
        }
        // unknown keys may still repeat
        assert_eq!(
            json::from_str::<Adjacent>(r#"{"x":1,"t":"Unit","x":2,"v":{}}"#).unwrap(),
            Adjacent::Unit
        );
    }
}
