# Arri CLI

Command line interface for ARRI-RPC

## Usage with @arrirpc/server

For full details visit the [server docs](https://github.com/modiimedia/arri/blob/master/packages/arri/README.md)

#### 1) Create an `arri.config.ts`

```ts
import { defineConfig } from "arri";

export default defineConfig({
    srcDir: "src",
    entry: "app.ts",
    port: 3000,
    generators: [
        // client generators go here (can be imported from arri)
    ],
});
```

#### 2) Develop your server

```bash
arri dev
arri build
```

## Generate Clients Without an Arri Server

#### 1) Create an App Definition

```ts
// app-definition.ts
import { createAppDefinition } from "arri";
import { a } from "@arrirpc/schema";

export default createAppDefinition({
    procedures: {
        sayHello: {
            transport: "http",
            method: "post",
            path: "/say-hello",
            params: a.object({
                name: a.string(),
            }),
            response: a.object({
                message: a.string(),
            }),
        },
    },
});
```

#### 2) Create an `arri.config.ts`

```ts
// arri.config.ts
import { defineConfig, generators } from "arri";

export default defineConfig({
    generators: [
        generators.typescriptClient({
            // options
        }),
        generators.dartClient({
            // options
        }),
        generators.kotlinClient({
            // options
        }),
    ],
});
```

#### 3) Run codegen command

```bash
arri codegen ./app-definition.ts
```

#### Now you can use the generated clients in your application code

```ts
// typescript
await client.sayHello({
    name: "John Doe",
});
```

```dart
// dart
await client.sayHello(
    SayHelloParams(
        name: "John Doe",
    ),
);
```

```kt
// kotlin
client.sayHello(
    SayHelloParams(
        name = "John Doe"
    )
)
```
