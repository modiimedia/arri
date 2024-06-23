# Arri Rust Codegen

## Setup

### 1) Add the generator to your arri config

```ts
// arri.config.ts
import { defineConfig, generators } from "arri";

export default defineConfig({
    generators: [
        generators.rustClient({
            clientName: "MyClient",
            outputFile: "./some-project/my_client.g.rs",
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

### Initialize the client

```rust
let config = ArriClientConfig {
    http_client: reqwest::Client::new(),
    base_url: "https://example.com".to_string(),
    // this function will run before every request
    headers: || {
        let mut header_map = Hashmap::<&'static str, &'static str>::new();
        header_map.insert("some-header", "some-header-value");
        header_map
    }
}
let client = MyClient::create(&config);

client.my_procedure().await;
```

The root client will be a struct containing all of the services and procedures. If you only need a particular service you can initialize just that service.

```rust
let users_service = MyClientUsersService(&config);
users_service.some_procedure().await;
```

### Using the generated types

All the generated types will have the following methods implemented

-   `from_json_string(String input) -> Self`
-   `from_json(serde_json::Value input) -> Self`
-   `to_json(&Self) -> serde_json::Value`
-   `to_json_string(&Self) -> String`
-   `to_query_params_string(&Self) -> String`

`serde_json` is used for parsing JSON. However we do not rely on `serde` itself for serializing and deserializing.

The generated types also derive the following traits

-   Clone
-   Debug
-   PartialEq

# Development

```bash
# run unit tests
nx test rust-codegen
```
