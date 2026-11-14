# arri

Rust models for [Arri RPC](https://github.com/modiimedia/arri). Derive `Arri` on your types to:

- generate their [Arri Type Definition](https://github.com/modiimedia/arri/blob/master/specifications/arri_type_definition.md) (the schema Arri uses to generate clients)
- encode them to and decode them from JSON in the same format as every other Arri implementation

serde is not required.

```toml
[dependencies]
arri = "0.85"
```

## Example

```rust
use arri::{Arri, Nullable, Timestamp};

/// A user of the application
#[derive(Arri)]
#[arri(rename_all = "camelCase")]
struct User {
    id: String,
    name: Nullable<String>,
    created_at: Timestamp,
    /// The user's biography
    bio: Option<String>,
    role: Role,
}

#[derive(Arri)]
#[arri(rename_all = "SCREAMING_SNAKE_CASE")]
enum Role {
    Admin,
    Member,
}

let json = r#"{"id":"1","name":null,"createdAt":"2001-01-01T16:00:00.000Z","role":"ADMIN"}"#;
let user: User = arri::json::from_str(json).unwrap();
assert_eq!(arri::json::to_string(&user).unwrap(), json);

// the type definition for `User`
assert_eq!(
    arri::type_def_of::<User>().to_json(),
    concat!(
        r#"{"properties":{"id":{"type":"string"},"name":{"type":"string","isNullable":true},"#,
        r#""createdAt":{"type":"timestamp"},"role":{"enum":["ADMIN","MEMBER"],"metadata":{"id":"Role"}}},"#,
        r#""optionalProperties":{"bio":{"type":"string","metadata":{"description":"The user's biography"}}},"#,
        r#""metadata":{"id":"User","description":"A user of the application"}}"#,
    ),
);
```

- `Option<T>` fields may be left out of the payload (`optionalProperties`)
- `Nullable<T>` values must be present but may be `null` (`isNullable`)
- doc comments and `#[deprecated]` become the schema's metadata

## Unions

Enums with data become unions. They're externally tagged by default, and can be internally tagged
with `tag_key` or adjacently tagged with `tag_key` and `value_key`.

```rust
use arri::Arri;

#[derive(Arri)]
#[arri(tag_key = "type", rename_all = "camelCase")]
enum Shape {
    Circle { radius: f64 },
    Rectangle(Rectangle),
}

#[derive(Arri)]
struct Rectangle {
    width: f64,
    height: f64,
}

let circle = Shape::Circle { radius: 1.0 };
assert_eq!(arri::json::to_string(&circle).unwrap(), r#"{"type":"circle","radius":1}"#);
let rectangle = Shape::Rectangle(Rectangle { width: 2.0, height: 1.5 });
assert_eq!(
    arri::json::to_string(&rectangle).unwrap(),
    r#"{"type":"rectangle","width":2,"height":1.5}"#,
);
```

See the [`Arri` documentation](https://docs.rs/arri/latest/arri/derive.Arri.html) for
every attribute.

## Features

| feature    | default | description                                                                  |
| ---------- | ------- | ---------------------------------------------------------------------------- |
| `derive`   | yes     | `#[derive(Arri)]`                                                       |
| `chrono`   | no      | support for `chrono::DateTime<Utc>` and `chrono::DateTime<FixedOffset>`      |
| `time`     | no      | support for `time::OffsetDateTime` and `time::UtcDateTime`                   |
| `indexmap` | no      | support for `indexmap::IndexMap<String, V>`                                  |
| `serde`    | no      | serde `Serialize` / `Deserialize` for arri's own types (`Timestamp`, `Nullable`, `Value`, etc.) |

## Minimum supported Rust version

Rust 1.88. The derive's output also works in crates using older editions (2018 and 2021).

## License

MIT
