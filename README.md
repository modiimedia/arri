_**WARNING: Breaking changes are likely to happen until v1.0 is released**_

# Arri RPC

[![Discord](https://img.shields.io/discord/1272569268869005322?logo=discord&logoColor=white&logoSize=)](https://discord.gg/5m23HEQss7)

Arri RPC is a code-first RPC framework. Type-safe clients get generated directly from your server code meaning you never need to manually write another client again.

Click [here](#server-implementations) to get started with your backend language of choice.

https://github.com/user-attachments/assets/15cf68a4-871e-4e7d-b5fc-25dcd1760fc1

## Table of Contents

- [Server Implementations](#server-implementations)
    - [Typescript](#typescript)
    - [Go](#go)
    - [Server Language Roadmap](#server-language-roadmap)
- [Client Generators](#client-generators)
- [Other Tooling](#other-tooling)
- [How Arri RPC Works](#how-arri-rpc-works)
- [Manually Creating An App Definition](#manually-creating-an-app-definition)
- [How To Contribute](#how-to-contribute)

## Server Implementations

### Typescript

Click [here](/languages/ts/ts-server/README.md) to get started with a Typescript server.

#### Relevant Libraries

| Name                                                            | Description                                                                                                                                                                    |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [@arrirpc/server](/languages/ts/ts-server/README.md)            | TS Server framework for Arri RPC                                                                                                                                               |
| [@arrirpc/schema](/languages/ts/ts-schema/README.md)            | High performance schema builder for validating procedure inputs and outputs. Can also be used as a standalone TS validation library or to generated types for other languages. |
| [@arrirpc/eslint-plugin](/languages/ts/eslint-plugin/README.md) | Lint rules for building Arri RPC schemas                                                                                                                                       |

### Go

Click [here](/languages/go/go-server/README.md) to get started with Go. Be aware that Go support is still in early stages.

### Server Language Roadmap

I'm currently finishing up the Go server implementation. After that is stable I have the following languages on my shortlist for the next potential server implementation:

- rust
- dart
- zig

See this [guide](/docs/implementing-an-arri-server.md) for information on how to implement your own Arri server

## Client Generators

Generators get run by the [Arri CLI](/tooling/cli/README.md) during `arri build`, `arri dev`, and `arri codegen`. You can register which generators you want to run in your Arri config (`arri.config.ts` by default)

Below are the language client generators that are planned to have first party support. This chart tracks the current progress on implementations for these clients. For those interested in creating their own generators, see [this guide](/docs/creating-a-custom-generator.md).

| Language                                            | HTTP | SSE    |
| --------------------------------------------------- | ---- | ------ |
| [Typescript](languages/ts/ts-codegen/README.md)     | ✅   | ✅     |
| [Dart](languages/dart/dart-codegen/README.md)       | ✅   | ✅     |
| [Rust](languages/rust/rust-codegen/README.md)       | ✅   | ✅     |
| [Kotlin](languages/kotlin/kotlin-codegen/README.md) | ✅   | ✅     |
| [Swift](languages/swift/swift-codegen/README.md)    | ✅   | ✅\*\* |
| Go                                                  |      |        |
| Python                                              |      |        |

✅ completed

🚧 in progress

\*\* SSE for Swift is working but it still has some rough edges

## Other Tooling

- [Arri CLI](/tooling/cli/README.md) - CLI tool for run code generators and managing dependencies

## How Arri RPC Works

Arri RPC requires two things:

- The [Arri CLI](/tooling/cli/README.md)
- A valid Arri RPC [server implementation](/docs/implementing-an-arri-server.md)

All official server implementations are able to create an [Arri App Definition](/specifications/arri_app_definition.md) based on the server defined types and procedures. It also is able to communicate with the Arri CLI via a server plugin (to be documented). Server plugins tell the CLI important information such as: "How to build the server", "How to start the server" and "How to get the server's app definition".

Once these things are in place the Arri CLI has everything it needs to grab up-to-date type information and pass it to the [client generators](#client-generators)

### What Happens When We Run `arri build`?

The Arri CLI will do the following:

- Build the server
- Have the compiled output generate an app definition
- Take the app definition and pass to the client generators defined in the `arri.config.ts`

### What Happens When We Run `arri dev`

The Arri CLI will do the following:

- Build the server and start it
- Request the server's app definition and pass it to the client generators
- Start a file watcher to watch for file changes
- When a file is changed:
    - Do whatever logic is necessary to reload the server (hot-reload for Javascript and kill + restart for Go lang)
    - Request the server's app definition
    - If the app definition has changed then pass it to the client generators

## Manually Creating an App Definition

Even though Arri focuses primarily on a code-first approach it allow you to manually create app definitions in the event that you have a server implementation that isn't supported. Once your app definition is created you simply need to point the CLI to the app definition file. This file can be can be a typescript file, JSON file, or a JSON http endpoint.

```bash
arri codegen ./AppDefinition.ts

arri codegen ./AppDefinition.json

arri codegen https://myapi.com/rpcs/__definition # must accept a GET request
```

Before running this command. Make sure you have an arri config created already.

**Example Config:**

```ts
// arri.config.ts
import { defineConfig, generators } from 'arri';

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
import { createAppDefinition } from 'arri';
import { a } from '@arrirpc/schema';

const HelloParams = a.object('HelloParams', {
    message: a.string(),
});

const HelloResponse = a.object('HelloResponse', {
    message: a.string(),
});

export default createAppDefinition({
    procedures: {
        sayHello: {
            transport: 'http',
            method: 'post',
            path: '/say-hello',
            params: HelloParams,
            response: HelloResponse,
        },
    },
});
```

Additionally if you only need cross language types, you can skip defining procedures all together and just pass in models to the helper.

```ts
// AppDefinition.ts
import { createAppDefinition } from 'arri';
import { a } from '@arrirpc/schema';

const HelloParams = a.object('HelloParams', {
    message: a.string(),
});

const HelloResponse = a.object('HelloResponse', {
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
            "metadata": {
                "id": "HelloResponse"
            }
        }
    }
}
```

## How To Contribute

Contributions are welcome!

Please read the [contribution guide](/CONTRIBUTING.md) which will guide you through the entire workflow of how to build the source code, how to run the tests, and how to contribute changes to the Arri RPC codebase. Also feel free to reach out on [discord](https://discord.gg/5m23HEQss7) if you have any other additional questions.
