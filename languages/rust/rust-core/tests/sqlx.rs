#![deny(warnings)]

#[cfg(all(feature = "sqlx-sqlite", feature = "derive"))]
mod sqlite_integration {
    use std::collections::BTreeMap;

    use arri::{Arri, Null, Nullable, Present, Timestamp, Value, sqlx::Json};
    use sqlx::{FromRow, SqlitePool};

    #[derive(Arri, Debug, PartialEq)]
    #[arri(rename_all = "camelCase")]
    struct UserSettings {
        theme: String,
        max_items: i64,
        nickname: Nullable<String>,
        note: Option<String>,
        tags: Vec<String>,
        limits: BTreeMap<String, u64>,
        role: Role,
        shape: Shape,
    }

    #[derive(Arri, Debug, PartialEq)]
    #[arri(rename_all = "SCREAMING_SNAKE_CASE")]
    enum Role {
        Admin,
        Member,
    }

    #[derive(Arri, Debug, PartialEq)]
    #[arri(tag_key = "kind", rename_all = "camelCase")]
    enum Shape {
        Circle { radius: f64 },
        Empty,
    }

    #[derive(FromRow, Debug, PartialEq)]
    struct UserRow {
        id: i64,
        bio: Nullable<String>,
        settings: Json<UserSettings>,
        optional_settings: Nullable<Json<UserSettings>>,
        extra: Value,
        nullable_extra: Nullable<Value>,
        created_at: Timestamp,
        deleted_at: Nullable<Timestamp>,
    }

    #[tokio::test]
    async fn sqlite_round_trip_with_from_row() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        sqlx::query(
            r#"
            CREATE TABLE users (
                id INTEGER PRIMARY KEY,
                bio TEXT,
                settings TEXT NOT NULL,
                optional_settings TEXT,
                extra TEXT NOT NULL,
                nullable_extra TEXT,
                created_at DATETIME NOT NULL,
                deleted_at DATETIME
            )
            "#,
        )
        .execute(&pool)
        .await
        .unwrap();

        let mut limits = BTreeMap::new();
        limits.insert("requests".to_string(), u64::MAX);
        let settings = UserSettings {
            theme: "dark".into(),
            max_items: i64::MIN,
            nickname: Null,
            note: Some("hello".into()),
            tags: vec!["rust".into(), "arri".into()],
            limits,
            role: Role::Admin,
            shape: Shape::Circle { radius: 2.5 },
        };
        let extra = Value::Object(vec![
            ("ok".into(), Value::Bool(true)),
            (
                "items".into(),
                Value::List(vec![Value::from(1), Value::Null]),
            ),
        ]);
        let created_at = Timestamp::parse("2024-02-29T12:30:45.123456Z").unwrap();

        // Row 1: nullable fields are Null, extra is an object
        sqlx::query(
            r#"
            INSERT INTO users (id, bio, settings, optional_settings, extra, nullable_extra, created_at, deleted_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(1i64)
        .bind(Nullable::<String>::Null)
        .bind(Json(&settings))
        .bind(Nullable::<Json<&UserSettings>>::Null)
        .bind(&extra)
        .bind(Nullable::<Value>::Null)
        .bind(created_at)
        .bind(Nullable::<Timestamp>::Null)
        .execute(&pool)
        .await
        .unwrap();

        let row: UserRow = sqlx::query_as("SELECT * FROM users WHERE id = 1")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(row.id, 1);
        assert_eq!(row.bio, Null);
        assert_eq!(*row.settings, settings);
        assert_eq!(row.optional_settings, Null);
        assert_eq!(row.extra, extra);
        assert_eq!(row.nullable_extra, Null);
        assert_eq!(row.created_at, created_at);
        assert_eq!(row.deleted_at, Null);

        // Verify stored JSON matches Arri wire format (i64/u64 as strings)
        let raw_json: String = sqlx::query_scalar("SELECT settings FROM users WHERE id = 1")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert!(raw_json.contains(r#""maxItems":"-9223372036854775808""#));
        assert!(raw_json.contains(r#""requests":"18446744073709551615""#));

        // Row 2: nullable fields are Present, and Value::Null is JSON null (not SQL NULL)
        let deleted_at = Timestamp::parse("2025-01-01T00:00:00Z").unwrap();
        sqlx::query(
            r#"
            INSERT INTO users (id, bio, settings, optional_settings, extra, nullable_extra, created_at, deleted_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(2i64)
        .bind(Present("systems engineer"))
        .bind(Json(&settings))
        .bind(Present(Json(&settings)))
        .bind(Value::Null)
        .bind(Present(Value::Null))
        .bind(created_at)
        .bind(Present(deleted_at))
        .execute(&pool)
        .await
        .unwrap();

        let row2: UserRow = sqlx::query_as("SELECT * FROM users WHERE id = 2")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(row2.bio, Present("systems engineer".to_string()));
        assert_eq!(
            row2.optional_settings.as_ref().map(|j| &**j),
            Present(&settings)
        );
        assert_eq!(row2.extra, Value::Null);
        assert_eq!(row2.nullable_extra, Present(Value::Null));
        assert_eq!(row2.deleted_at, Present(deleted_at));
    }

    #[tokio::test]
    async fn sqlite_timestamp_text_int_and_julian_day() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();

        // SQLite CURRENT_TIMESTAMP / naive DATETIME string
        let ts: Timestamp = sqlx::query_scalar("SELECT '2001-01-01 16:00:00'")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(ts, Timestamp::parse("2001-01-01T16:00:00Z").unwrap());

        // Unix seconds as INTEGER
        let ts_int: Timestamp = sqlx::query_scalar("SELECT 978364800")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(ts_int, ts);

        // Julian day as REAL (julianday('2001-01-01 16:00:00'))
        let ts_real: Timestamp = sqlx::query_scalar("SELECT julianday('2001-01-01 16:00:00')")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(ts_real.unix_seconds(), ts.unix_seconds());
    }

    #[tokio::test]
    async fn sqlite_decode_errors_propagate_arri_errors() {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        let err = sqlx::query_scalar::<_, Json<UserSettings>>("SELECT '{\"theme\":123}'")
            .fetch_one(&pool)
            .await
            .unwrap_err();
        let msg = err.to_string();
        assert!(msg.contains("expected string"), "unexpected error: {msg}");
    }
}
