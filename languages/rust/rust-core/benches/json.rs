//! Compares arri's JSON encoding / decoding against serde_json using equivalent types.
//!
//! Run with `cargo bench -p arri --bench json`
//!
//! Both libraries decode the exact same input (the output of arri's encoder). The only intentional
//! difference in the payloads is how timestamps are written (arri always writes milliseconds).

use std::{collections::BTreeMap, hint::black_box};

use criterion::{BenchmarkId, Criterion, Throughput, criterion_group, criterion_main};

mod arri_types {
    use std::collections::BTreeMap;

    use arri::{ArriModel, Nullable, Timestamp};

    #[derive(ArriModel, Clone)]
    pub struct User {
        pub id: String,
        pub name: String,
        pub email: Nullable<String>,
        pub bio: Option<String>,
        pub age: u32,
        pub is_admin: bool,
        pub score: f64,
        pub role: Role,
        pub tags: Vec<String>,
        pub created_at: Timestamp,
        pub settings: Settings,
    }

    #[derive(ArriModel, Clone)]
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
    pub enum Event {
        Created {
            user: User,
        },
        Renamed {
            id: String,
            old_name: String,
            new_name: String,
        },
        Deleted {
            id: String,
            deleted_at: Timestamp,
        },
    }
}

mod serde_types {
    use std::collections::BTreeMap;

    use chrono::{DateTime, Utc};
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize, Clone)]
    pub struct User {
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
        pub created_at: DateTime<Utc>,
        pub settings: Settings,
    }

    #[derive(Serialize, Deserialize, Clone)]
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
    pub enum Event {
        Created {
            user: User,
        },
        Renamed {
            id: String,
            old_name: String,
            new_name: String,
        },
        Deleted {
            id: String,
            deleted_at: DateTime<Utc>,
        },
    }
}

const BIO: &str = "Likes \"quotes\", backslashes \\ and\nnewlines. Also unicode: café 🎉";

fn arri_user(i: usize) -> arri_types::User {
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
        created_at: arri::Timestamp::from_unix_millis(1_700_000_000_000 + i as i64 * 1000).unwrap(),
        settings: arri_types::Settings {
            theme: "dark".into(),
            notifications: i.is_multiple_of(2),
            limits,
        },
    }
}

fn serde_user(user: &arri_types::User) -> serde_types::User {
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
        created_at: user.created_at.into(),
        settings: serde_types::Settings {
            theme: user.settings.theme.clone(),
            notifications: user.settings.notifications,
            limits: user.settings.limits.clone(),
        },
    }
}

fn arri_event(i: usize) -> arri_types::Event {
    match i % 3 {
        0 => arri_types::Event::Created { user: arri_user(i) },
        1 => arri_types::Event::Renamed {
            id: format!("user_{i}"),
            old_name: format!("User Number {i}"),
            new_name: format!("Renamed User {i}"),
        },
        _ => arri_types::Event::Deleted {
            id: format!("user_{i}"),
            deleted_at: arri::Timestamp::from_unix_millis(1_700_000_000_000 + i as i64).unwrap(),
        },
    }
}

fn serde_event(event: &arri_types::Event) -> serde_types::Event {
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
            deleted_at: (*deleted_at).into(),
        },
    }
}

fn bench_payload<A, S>(c: &mut Criterion, name: &str, arri_value: &A, serde_value: &S)
where
    A: arri::Encode + arri::Decode,
    S: serde::Serialize + serde::de::DeserializeOwned,
{
    let input = arri::json::to_string(arri_value).unwrap();
    // make sure both libraries accept the input before measuring anything
    arri::json::from_str::<A>(&input).unwrap();
    serde_json::from_str::<S>(&input).unwrap();

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
    group.finish();
}

fn benchmarks(c: &mut Criterion) {
    let user = arri_user(3);
    bench_payload(c, "user", &user, &serde_user(&user));

    let users: Vec<_> = (0..1000).map(arri_user).collect();
    let serde_users: Vec<_> = users.iter().map(serde_user).collect();
    bench_payload(c, "users_1000", &users, &serde_users);

    let events: Vec<_> = (0..1000).map(arri_event).collect();
    let serde_events: Vec<_> = events.iter().map(serde_event).collect();
    bench_payload(c, "events_1000", &events, &serde_events);
}

criterion_group!(benches, benchmarks);
criterion_main!(benches);
