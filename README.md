# Arri RPC Monorepo

Arri is an RPC framework designed for effortless end-to-end type safety across programming languages

This is a work in progress. Things will break.

## Schema Builder

[@arrirpc/schema](tooling/schema/README.md) is used to define types that can be generated in any language. It also doubles as a parsing and serialization library that can be used on a NodeJS backend.

## Server Implementations

-   [Typescript](languages/ts/ts-server/README.md) - Official ts server implementation. It uses [@arrirpc/schema](tooling/schma/README.md) to define language agnostic types and safely parse/serialize inputs and outputs.

## Client Generators

Below are the language client generators that are planned to have first party support. This chart tracks the current progress on implementations for these clients.

| Language                                            | HTTP | SSE |
| --------------------------------------------------- | ---- | --- |
| [Typescript](languages/ts/ts-codegen/README.md)     | ✅   | ✅  |
| [Dart](languages/dart/dart-codegen/README.md)       | ✅   | ✅  |
| [Rust](languages/rust/rust-codegen/README.md)       | ✅   | 🚧  |
| [Kotlin](languages/kotlin/kotlin-codegen/README.md) | ✅   | ✅  |
| Swift                                               | 🚧   | 🚧  |
| Go                                                  |      |     |
| Python                                              |      |     |

✅ completed

🚧 in progress

## Other Tooling
-   [arri CLI](/tooling/cli/README.md) - CLI tool for run code generators and managing dependencies
-   [@arrirpc/typebox-adapter](tooling/schema-typebox-adapter/README.md) - convert Typebox Schemas to Arri Type Definitions
-   [@arrirpc/eslint-plugin](tooling/eslint-plugin/README.md) - Useful eslint rules when making Arri Type Definitions

## Creating Schemas For Custom Server Implementations

Arri allows you to generate clients for custom server implementations. All you need to do is point the cli to an AppDefinition file. The app definition can be a typescript file, JSON file, or a JSON http endpoint.

```bash
arri codegen ./AppDefinition.ts

arri codegen ./AppDefinition.json

arri codegen https://myapi.com/rpcs/__definition # must accept a GET request
```

Before running this command. Make sure you have an arri config created already.

**Example Config:**

```ts
// arri.config.ts
import { defineConfig, generators } from "arri";

export default defineConfig({
    generators: [
        generators.dartClient({
            // options
        }),
        generators.kotlinClient({
            // options
        }),
        generators.typescriptClient({
            // options
        }),
    ],
});
```

### Typescript App Definition (Recommended)

Arri comes with some useful helpers that reduces the boilerplate of manually creating a JSON definition file. Additionally the validators created with Arri Schema can be used throughout your app.

```ts
// AppDefinition.ts
import { createAppDefinition } from "arri";
import { a } from "@arrirpc/schema";

const HelloParams = a.object("HelloParams", {
    message: a.string(),
});

const HelloResponse = a.object("HelloResponse", {
    message: a.string(),
});

export default createAppDefinition({
    procedures: {
        sayHello: {
            transport: "http",
            method: "post",
            path: "/say-hello",
            params: HelloParams,
            response: HelloResponse,
        },
    },
});
```

Additionally if you only need cross language types, you can skip defining procedures all together and just pass in models to the helper.

```ts
// AppDefinition.ts
import { createAppDefinition } from "arri";
import { a } from "@arrirpc/schema";

const HelloParams = a.object("HelloParams", {
    message: a.string(),
});

const HelloResponse = a.object("HelloResponse", {
    message: a.string(),
});

export default createAppDefinition({
    definitions: {
        HelloParams,
        HelloResponse,
    },
});
```

Now `arri codegen ./AppDefinition.ts` will only generate types for each client defined in the arri config.

### JSON App Definition

JSON app definitions are something that would normally be automatically generated by an implementation of ARRI-RPC. Manually creating a JSON app definition is more terse and more subject to human error than the typescript alternative.

```json
{
    "schemaVersion": "<current-schema-version>",
    "procedures": {
        "sayHello": {
            "transport": "http",
            "method": "get",
            "path": "/say-hello",
            "params": "HelloParams",
            "response": "HelloResponse"
        }
    },
    "definitions": {
        "HelloParams": {
            "properties": {
                "message": {
                    "type": "string",
                    "metadata": {}
                }
            },
            "additionalProperties": true,
            "metadata": {
                "id": "HelloParams",
                "metadata": {}
            }
        },
        "HelloResponse": {
            "properties": {
                "message": {
                    "type": "string",
                    "metadata": {}
                }
            },
            "additionalProperties": true,
            "metadata": {
                "id": "HelloResponse"
            }
        }
    }
}
```
