//! Compares arri's JSON encoding / decoding against serde_json using equivalent types.
//!
//! Run with `cargo bench -p arri --bench json --features chrono,serde`
//!
//! Every payload is benchmarked twice:
//!
//! - `arri_timestamp/*`: both libraries use `arri::Timestamp` (serde through the `serde` feature).
//!   Both sides run the exact same timestamp parsing / formatting code, so this isolates the cost
//!   of the JSON encoding and decoding itself. **This is the apples to apples comparison.**
//! - `chrono/*`: both libraries use `chrono::DateTime<Utc>`. arri converts to its own `Timestamp`
//!   while serde uses chrono's serde implementation, so differences here also include the
//!   timestamp implementations. This reflects what users of chrono will actually see.
//!
//! Each payload is also decoded with an invalid value (a string where a number belongs) placed
//! near the start (`decode_invalid_early`) and near the end (`decode_invalid_late`) of the input.
//!
//! Both libraries decode the exact same input (the output of arri's encoder). 64 bit integers are
//! intentionally left out since arri writes them as JSON strings and serde_json writes numbers.

use std::{collections::BTreeMap, hint::black_box};

use criterion::{BenchmarkId, Criterion, Throughput, criterion_group, criterion_main};

/// A timestamp type that both libraries can encode
trait BenchTimestamp: Clone {
    fn from_millis(millis: i64) -> Self;
}

impl BenchTimestamp for arri::Timestamp {
    fn from_millis(millis: i64) -> Self {
        arri::Timestamp::from_unix_millis(millis).unwrap()
    }
}

impl BenchTimestamp for chrono::DateTime<chrono::Utc> {
    fn from_millis(millis: i64) -> Self {
        chrono::DateTime::from_timestamp_millis(millis).unwrap()
    }
}

mod arri_types {
    use std::collections::BTreeMap;

    use arri::{ArriModel, Nullable};

    #[derive(ArriModel, Clone)]
    pub struct User<Ts> {
        pub id: String,
        pub name: String,
        pub email: Nullable<String>,
        pub bio: Option<String>,
        pub age: u32,
        pub is_admin: bool,
        pub score: f64,
        pub role: Role,
        pub tags: Vec<String>,
        pub created_at: Ts,
        pub settings: Settings,
    }

    #[derive(ArriModel, Clone, Copy)]
    pub enum Role {
        Standard,
        Admin,
        Moderator,
    }

    #[derive(ArriModel, Clone)]
    pub struct Settings {
        pub theme: String,
        pub notifications: bool,
        pub limits: BTreeMap<String, u32>,
    }

    #[derive(ArriModel, Clone)]
    #[arri(tag_key = "type")]
    pub enum Event<Ts> {
        Created {
            user: User<Ts>,
        },
        Renamed {
            id: String,
            old_name: String,
            new_name: String,
        },
        Deleted {
            id: String,
            deleted_at: Ts,
        },
    }

    /// Internally tagged union whose variants wrap other types (newtype variants)
    #[derive(ArriModel, Clone)]
    #[arri(tag_key = "type")]
    pub enum WrappedEvent<Ts> {
        Created(User<Ts>),
        Renamed(Rename),
        Deleted(Box<Deletion<Ts>>),
    }

    #[derive(ArriModel, Clone)]
    pub struct Rename {
        pub id: String,
        pub old_name: String,
        pub new_name: String,
    }

    #[derive(ArriModel, Clone)]
    pub struct Deletion<Ts> {
        pub id: String,
        pub deleted_at: Ts,
    }

    /// A single large object
    #[derive(ArriModel, Clone)]
    pub struct Report<Ts> {
        pub id: String,
        pub title: String,
        pub summary: String,
        pub created_at: Ts,
        pub updated_at: Nullable<Ts>,
        pub version: u32,
        pub priority: u8,
        pub offset: i16,
        pub ratio: f32,
        pub score: f64,
        pub is_public: bool,
        pub is_archived: bool,
        pub owner: User<Ts>,
        pub tags: Vec<String>,
        pub counters: BTreeMap<String, u32>,
        pub sections: Vec<Section>,
        pub authors: Vec<User<Ts>>,
    }

    #[derive(ArriModel, Clone)]
    pub struct Section {
        pub heading: String,
        pub body: String,
        pub order: u16,
        pub is_collapsed: bool,
        pub weight: f64,
        pub attributes: BTreeMap<String, String>,
    }
}

mod serde_types {
    use std::collections::BTreeMap;

    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize, Clone)]
    pub struct User<Ts> {
        pub id: String,
        pub name: String,
        pub email: Option<String>,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        pub bio: Option<String>,
        pub age: u32,
        pub is_admin: bool,
        pub score: f64,
        pub role: Role,
        pub tags: Vec<String>,
        pub created_at: Ts,
        pub settings: Settings,
    }

    #[derive(Serialize, Deserialize, Clone, Copy)]
    pub enum Role {
        Standard,
        Admin,
        Moderator,
    }

    #[derive(Serialize, Deserialize, Clone)]
    pub struct Settings {
        pub theme: String,
        pub notifications: bool,
        pub limits: BTreeMap<String, u32>,
    }

    #[derive(Serialize, Deserialize, Clone)]
    #[serde(tag = "type")]
    pub enum Event<Ts> {
        Created {
            user: User<Ts>,
        },
        Renamed {
            id: String,
            old_name: String,
            new_name: String,
        },
        Deleted {
            id: String,
            deleted_at: Ts,
        },
    }

    #[derive(Serialize, Deserialize, Clone)]
    #[serde(tag = "type")]
    pub enum WrappedEvent<Ts> {
        Created(User<Ts>),
        Renamed(Rename),
        Deleted(Box<Deletion<Ts>>),
    }

    #[derive(Serialize, Deserialize, Clone)]
    pub struct Rename {
        pub id: String,
        pub old_name: String,
        pub new_name: String,
    }

    #[derive(Serialize, Deserialize, Clone)]
    pub struct Deletion<Ts> {
        pub id: String,
        pub deleted_at: Ts,
    }

    #[derive(Serialize, Deserialize, Clone)]
    pub struct Report<Ts> {
        pub id: String,
        pub title: String,
        pub summary: String,
        pub created_at: Ts,
        pub updated_at: Option<Ts>,
        pub version: u32,
        pub priority: u8,
        pub offset: i16,
        pub ratio: f32,
        pub score: f64,
        pub is_public: bool,
        pub is_archived: bool,
        pub owner: User<Ts>,
        pub tags: Vec<String>,
        pub counters: BTreeMap<String, u32>,
        pub sections: Vec<Section>,
        pub authors: Vec<User<Ts>>,
    }

    #[derive(Serialize, Deserialize, Clone)]
    pub struct Section {
        pub heading: String,
        pub body: String,
        pub order: u16,
        pub is_collapsed: bool,
        pub weight: f64,
        pub attributes: BTreeMap<String, String>,
    }
}

const BIO: &str = "Likes \"quotes\", backslashes \\ and\nnewlines. Also unicode: café 🎉";
const PARAGRAPH: &str = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. \"Quoted text\" and a \\ backslash.\nNew line with unicode: naïve café 🎉 — done.\t";

fn arri_user<Ts: BenchTimestamp>(i: usize) -> arri_types::User<Ts> {
    let mut limits = BTreeMap::new();
    limits.insert("requests".to_string(), 1000 + i as u32);
    limits.insert("uploads".to_string(), 10);
    arri_types::User {
        id: format!("user_{i}"),
        name: format!("User Number {i}"),
        email: if i.is_multiple_of(4) {
            arri::Nullable::Null
        } else {
            arri::Nullable::Present(format!("user{i}@example.com"))
        },
        bio: i.is_multiple_of(3).then(|| BIO.to_string()),
        age: 18 + (i % 60) as u32,
        is_admin: i.is_multiple_of(10),
        score: i as f64 * 1.25 + 0.1,
        role: match i % 3 {
            0 => arri_types::Role::Standard,
            1 => arri_types::Role::Admin,
            _ => arri_types::Role::Moderator,
        },
        tags: vec!["alpha".into(), "beta".into(), format!("tag{}", i % 7)],
        created_at: Ts::from_millis(1_700_000_000_000 + i as i64 * 1000),
        settings: arri_types::Settings {
            theme: "dark".into(),
            notifications: i.is_multiple_of(2),
            limits,
        },
    }
}

fn serde_user<Ts: Clone>(user: &arri_types::User<Ts>) -> serde_types::User<Ts> {
    serde_types::User {
        id: user.id.clone(),
        name: user.name.clone(),
        email: user.email.clone().into_option(),
        bio: user.bio.clone(),
        age: user.age,
        is_admin: user.is_admin,
        score: user.score,
        role: match user.role {
            arri_types::Role::Standard => serde_types::Role::Standard,
            arri_types::Role::Admin => serde_types::Role::Admin,
            arri_types::Role::Moderator => serde_types::Role::Moderator,
        },
        tags: user.tags.clone(),
        created_at: user.created_at.clone(),
        settings: serde_types::Settings {
            theme: user.settings.theme.clone(),
            notifications: user.settings.notifications,
            limits: user.settings.limits.clone(),
        },
    }
}

fn arri_event<Ts: BenchTimestamp>(i: usize) -> arri_types::Event<Ts> {
    match i % 3 {
        0 => arri_types::Event::Created { user: arri_user(i) },
        1 => arri_types::Event::Renamed {
            id: format!("user_{i}"),
            old_name: format!("User Number {i}"),
            new_name: format!("Renamed User {i}"),
        },
        _ => arri_types::Event::Deleted {
            id: format!("user_{i}"),
            deleted_at: Ts::from_millis(1_700_000_000_000 + i as i64),
        },
    }
}

fn serde_event<Ts: Clone>(event: &arri_types::Event<Ts>) -> serde_types::Event<Ts> {
    match event {
        arri_types::Event::Created { user } => serde_types::Event::Created {
            user: serde_user(user),
        },
        arri_types::Event::Renamed {
            id,
            old_name,
            new_name,
        } => serde_types::Event::Renamed {
            id: id.clone(),
            old_name: old_name.clone(),
            new_name: new_name.clone(),
        },
        arri_types::Event::Deleted { id, deleted_at } => serde_types::Event::Deleted {
            id: id.clone(),
            deleted_at: deleted_at.clone(),
        },
    }
}

fn arri_wrapped_event<Ts: BenchTimestamp>(i: usize) -> arri_types::WrappedEvent<Ts> {
    match arri_event::<Ts>(i) {
        arri_types::Event::Created { user } => arri_types::WrappedEvent::Created(user),
        arri_types::Event::Renamed {
            id,
            old_name,
            new_name,
        } => arri_types::WrappedEvent::Renamed(arri_types::Rename {
            id,
            old_name,
            new_name,
        }),
        arri_types::Event::Deleted { id, deleted_at } => {
            arri_types::WrappedEvent::Deleted(Box::new(arri_types::Deletion { id, deleted_at }))
        }
    }
}

fn serde_wrapped_event<Ts: Clone>(
    event: &arri_types::WrappedEvent<Ts>,
) -> serde_types::WrappedEvent<Ts> {
    match event {
        arri_types::WrappedEvent::Created(user) => {
            serde_types::WrappedEvent::Created(serde_user(user))
        }
        arri_types::WrappedEvent::Renamed(r) => {
            serde_types::WrappedEvent::Renamed(serde_types::Rename {
                id: r.id.clone(),
                old_name: r.old_name.clone(),
                new_name: r.new_name.clone(),
            })
        }
        arri_types::WrappedEvent::Deleted(d) => {
            serde_types::WrappedEvent::Deleted(Box::new(serde_types::Deletion {
                id: d.id.clone(),
                deleted_at: d.deleted_at.clone(),
            }))
        }
    }
}

fn arri_report<Ts: BenchTimestamp>() -> arri_types::Report<Ts> {
    let sections = (0..200usize)
        .map(|i| arri_types::Section {
            heading: format!("Section {i}: an overview of item number {i}"),
            body: PARAGRAPH.repeat(4),
            order: i as u16,
            is_collapsed: i.is_multiple_of(5),
            weight: i as f64 / 7.0,
            attributes: (0..5)
                .map(|j| (format!("attribute_{j}"), format!("value {i}-{j}")))
                .collect(),
        })
        .collect();
    arri_types::Report {
        id: "report_1".into(),
        title: "Quarterly \"Large Object\" Report".into(),
        // ~64KB of text with characters that need escaping
        summary: PARAGRAPH.repeat(64 * 1024 / PARAGRAPH.len()),
        created_at: Ts::from_millis(1_700_000_000_000),
        updated_at: arri::Nullable::Present(Ts::from_millis(1_700_000_123_456)),
        version: 42,
        priority: 3,
        offset: -120,
        ratio: 0.75,
        score: 98.6,
        is_public: true,
        is_archived: false,
        owner: arri_user(0),
        tags: (0..100).map(|i| format!("tag_{i}")).collect(),
        counters: (0..1000u32)
            .map(|i| (format!("counter_{i:04}"), i * 3))
            .collect(),
        sections,
        authors: (0..50).map(arri_user).collect(),
    }
}

fn serde_report<Ts: Clone>(report: &arri_types::Report<Ts>) -> serde_types::Report<Ts> {
    serde_types::Report {
        id: report.id.clone(),
        title: report.title.clone(),
        summary: report.summary.clone(),
        created_at: report.created_at.clone(),
        updated_at: report.updated_at.clone().into_option(),
        version: report.version,
        priority: report.priority,
        offset: report.offset,
        ratio: report.ratio,
        score: report.score,
        is_public: report.is_public,
        is_archived: report.is_archived,
        owner: serde_user(&report.owner),
        tags: report.tags.clone(),
        counters: report.counters.clone(),
        sections: report
            .sections
            .iter()
            .map(|s| serde_types::Section {
                heading: s.heading.clone(),
                body: s.body.clone(),
                order: s.order,
                is_collapsed: s.is_collapsed,
                weight: s.weight,
                attributes: s.attributes.clone(),
            })
            .collect(),
        authors: report.authors.iter().map(serde_user).collect(),
    }
}

/// Replace the value of the first or last `"key":` in `input` with a string, making it invalid
/// for a numeric field
fn make_invalid(input: &str, key: &str, last: bool) -> String {
    let needle = format!("\"{key}\":");
    let found = if last {
        input.rfind(&needle)
    } else {
        input.find(&needle)
    };
    let start = found.unwrap_or_else(|| panic!("{needle} not found")) + needle.len();
    let end = start
        + input[start..]
            .find([',', '}'])
            .expect("value must be followed by ',' or '}'");
    format!("{}\"invalid\"{}", &input[..start], &input[end..])
}

/// `invalid_key` must be a numeric field. Its first and last occurrences are replaced with a
/// string to benchmark decoding input that fails early or late.
fn bench_payload<A, S>(
    c: &mut Criterion,
    name: &str,
    arri_value: &A,
    serde_value: &S,
    invalid_key: &str,
) where
    A: arri::Encode + arri::Decode,
    S: serde::Serialize + serde::de::DeserializeOwned,
{
    let input = arri::json::to_string(arri_value).unwrap();
    // make sure both libraries accept the input before measuring anything
    arri::json::from_str::<A>(&input).unwrap();
    serde_json::from_str::<S>(&input).unwrap();

    let invalid_early = make_invalid(&input, invalid_key, false);
    let invalid_late = make_invalid(&input, invalid_key, true);
    let mut invalid_inputs = vec![("decode_invalid_early", invalid_early)];
    if invalid_late != invalid_inputs[0].1 {
        invalid_inputs.push(("decode_invalid_late", invalid_late));
    } else {
        // the key only appears once
        invalid_inputs[0].0 = "decode_invalid";
    }
    // and make sure both libraries reject the invalid input
    for (_, invalid) in &invalid_inputs {
        assert!(arri::json::from_str::<A>(invalid).is_err());
        assert!(serde_json::from_str::<S>(invalid).is_err());
    }

    let mut group = c.benchmark_group(name);
    group.throughput(Throughput::Bytes(input.len() as u64));
    group.bench_function(BenchmarkId::new("encode", "arri"), |b| {
        b.iter(|| arri::json::to_vec(black_box(arri_value)).unwrap())
    });
    group.bench_function(BenchmarkId::new("encode", "serde_json"), |b| {
        b.iter(|| serde_json::to_vec(black_box(serde_value)).unwrap())
    });
    group.bench_function(BenchmarkId::new("decode", "arri"), |b| {
        b.iter(|| arri::json::from_str::<A>(black_box(&input)).unwrap())
    });
    group.bench_function(BenchmarkId::new("decode", "serde_json"), |b| {
        b.iter(|| serde_json::from_str::<S>(black_box(&input)).unwrap())
    });
    for (label, invalid) in &invalid_inputs {
        group.bench_function(BenchmarkId::new(*label, "arri"), |b| {
            b.iter(|| arri::json::from_str::<A>(black_box(invalid)).err().unwrap())
        });
        group.bench_function(BenchmarkId::new(*label, "serde_json"), |b| {
            b.iter(|| serde_json::from_str::<S>(black_box(invalid)).err().unwrap())
        });
    }
    group.finish();
}

fn bench_all<Ts>(c: &mut Criterion, prefix: &str)
where
    Ts: BenchTimestamp + arri::ArriModel + serde::Serialize + serde::de::DeserializeOwned,
{
    let user = arri_user::<Ts>(3);
    bench_payload(
        c,
        &format!("{prefix}/user"),
        &user,
        &serde_user(&user),
        "age",
    );

    let users: Vec<_> = (0..1000).map(arri_user::<Ts>).collect();
    let serde_users: Vec<_> = users.iter().map(serde_user).collect();
    bench_payload(
        c,
        &format!("{prefix}/users_1000"),
        &users,
        &serde_users,
        "age",
    );

    let events: Vec<_> = (0..1000).map(arri_event::<Ts>).collect();
    let serde_events: Vec<_> = events.iter().map(serde_event).collect();
    bench_payload(
        c,
        &format!("{prefix}/events_1000"),
        &events,
        &serde_events,
        "age",
    );

    let wrapped_events: Vec<_> = (0..1000).map(arri_wrapped_event::<Ts>).collect();
    let serde_wrapped_events: Vec<_> = wrapped_events.iter().map(serde_wrapped_event).collect();
    bench_payload(
        c,
        &format!("{prefix}/wrapped_events_1000"),
        &wrapped_events,
        &serde_wrapped_events,
        "age",
    );

    let report = arri_report::<Ts>();
    bench_payload(
        c,
        &format!("{prefix}/large_object"),
        &report,
        &serde_report(&report),
        "age",
    );
}

fn benchmarks(c: &mut Criterion) {
    bench_all::<arri::Timestamp>(c, "arri_timestamp");
    bench_all::<chrono::DateTime<chrono::Utc>>(c, "chrono");
}

criterion_group!(benches, benchmarks);
criterion_main!(benches);
