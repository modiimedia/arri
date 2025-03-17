# Arri Rust Codegen

## Setup

### 1) Add the generator to your arri config

```ts
// arri.config.ts
import { defineConfig, generators } from 'arri';

export default defineConfig({
    generators: [
        generators.rustClient({
            clientName: 'MyClient',
            outputFile: './some-project/my_client.g.rs',
        }),
    ],
});
```

**Options**

| Name                  | Descriptions                                                               |
| --------------------- | -------------------------------------------------------------------------- |
| clientName            | The named of the generated client struct (Defaults to "Client")            |
| outputFile (required) | Path to the file that will be created by the generator                     |
| typePrefix            | Add a prefix to the generated struct names                                 |
| format                | Whether to run `rustfmt` on the generated file or not (Defaults to "true") |

### 2) Install the Rust client library

The generated code relies on the [arri_client](/languages/rust/rust-client/README.md) library. So make sure it's installed wherever the generated code is being used. The version number should match your arri cli version. (Run `arri version` to check)

```bash
cargo add arri_client
```

## Using the generated code

All of the generated procedures in this client will be async functions, so you will need an async runtime like [tokio](https://tokio.rs/)

### Initializing the client

```rust
let config = ArriClientConfig {
    http_client: reqwest::Client::new(),
    base_url: "https://example.com".to_string(),
    headers: Hashmap::new(),
}
let client = MyClient::create(config);

// start calling procedures
client.my_procedure().await;
```

The root client will be a struct containing all of the services and procedures. If you only need a particular service you can initialize just that service.

```rust
let users_service = MyClientUsersService(config);
users_service.some_procedure().await;
```

### Updating Headers

For instances that you need to update the http headers (like in the case of an expired auth token), you can call the `update_headers()` function. When called, changes will propagate to all nested subservices.

```rust
client.update_headers(new_headers);
```

Be aware that if `update_headers()` is called from a subservice it will not propagate up to the parent service(s).

```rust
client.subservice.update_headers(new_headers);

// this will still use the original headers
client.do_something();
```

`update_headers()` be also be called across threads.

```rust
let mut headers: HashMap<&'static str, String> = HashMap::new();
let config = ArriClientConfig {
    http_client: reqwest::Client::new(),
    base_url: "https://example.com".to_string(),
    headers: headers.clone(),
}
let client = Arc::new(MyClient::create(config));
tokio::spawn(async move {
    loop {
        client.do_something().await;
    }
});
tokio::spawn(async move {
    loop {
        client.do_another_thing().await;
    }
});

// wait two seconds then change the headers
tokio::time::sleep(Duration::from_millis(2000)).await;
headers.insert("hello", "world".to_string());
client.update_headers(headers.clone());
// now both threads will start using the updated headers on their next loop
```

### Calling SSE Procedures

```rust
let mut msg_count = 0;
let mut open_count = 0;
client
    .users
    .watch_user(
        &mut |event, controller| match event {
            SseEvent::Message(msg) => {
                msg_count += 1;
                printl("NEW_MESSAGE: {:?}", msg);
            }
            SSeEvent::Error(err) => {
                // call abort to close the event stream
                controller.abort()
            }
            SseEvent::Open => {
                open_count += 1;
            }
            SseEvent::Close => {}
        },
        None, // max_retry_count (u64)
        None, // max_retry_interval (u64)
    ).await;
```

### Using the generated types

All the generated types will have the following methods implemented

- `from_json_string(String input) -> Self`
- `from_json(serde_json::Value input) -> Self`
- `to_json(&Self) -> serde_json::Value`
- `to_json_string(&Self) -> String`
- `to_query_params_string(&Self) -> String`

`serde_json` is used for parsing JSON. However we do not rely on `serde` itself for serializing and deserializing.

The generated types also derive the following traits

- Clone
- Debug
- PartialEq

# Development

```bash
# run unit tests
nx test rust-codegen
```
