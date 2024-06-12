# Arri Dart Codegen

## Setup

### 1) Add the generator to your arri config

```ts
// arri.config.ts
import { defineConfig, dartClientGenerator } from "arri";

export default defineConfig({
    generators: [
        dartClientGenerator({
            clientName: "MyClient",
            outputFile: "./client/src/my_client.g.dart",
        }),
    ],
});
```

**Options:**

| Name                  | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| clientName            | The name of the generated client class (Defaults to "Client") |
| outputFile (required) | Path to the file that will be created by the generator        |
| format                | Run `dart format` on the generated file (Defaults to `true`)  |
| modelPrefix           | Add a prefix to the generated class names                     |

### 2) Install the Dart client library

The generated code relies on the Dart [arri_client](/languages/dart/dart-client/README.md) library. So be sure to install it wherever the generated code is being used. The version number should match your Arri CLI version. (run `arri version` to check).

```bash
dart pub add arri_client
```

## Using the Generated Code

### Initialize the client

```dart
// this will match whatever you put in the arri config
import "./my_client.g.dart";

main() async {
    final client = MyClient(
        baseUrl: "https://example.com",
        headers: () async {
            return {
                "Authorization": "<some-token>",
            };
        },
    );
    await client.myProcedure();
}
```

The root client will be a class containing all of the services and procedures in a single class. If you only need a particular service, you can initialize just that service.

```dart
final service = MyClientUsersService(
    baseUrl: "https://example.com",
    headers: () async {
        return {
            "Authorization": "<some-token>",
        };
    },
);
```

### Using Arri Models

All generated models will be immutable. They will have access to the following features:

**Methods**:

-   `Map<String, dynamic> toJson()`
-   `String toJsonString()`
-   `String toUrlQueryParams()`
-   `copyWith()`

**Factory Methods**:

-   `empty()`
-   `fromJson(Map<String, dynamic> input)`
-   `fromJsonString(String input)`

**Overrides**:

-   `==` operator (allows for deep equality checking)
-   `hashMap` (allows for deep equality checking)
-   `toString` (will print out all properties and values instead of `Instance of X`)

This library was generated with [Nx](https://nx.dev).

## Development

```bash
# build the library
pnpm nx build codegen-dart

# test
pnpm nx test codegen-dart

# lint
pnpm nx lint codegen-dart
```
