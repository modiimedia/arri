# Arri RPC

## Installation

```bash
# npm
npm install arri arri-validate

# pnpm
pnpm install arri arri-validate
```

## Basic Setup Example

Create an `arri.config.ts` in the project directory

```ts
// arri.config.ts
import { defineConfig } from "arri";
import {
    typescriptClientGenerator,
    dartClientGenerator,
} from "arri/dist/codegen";

export default defineConfig({
    entry: "app.ts",
    port: 3000,
    srcDir: "src",
    clientGenerators: [
        typescriptClientGenerator({
            // options
        }),
        dartClientGenerator({
            // options
        }),
    ],
});
```

Create an `app.ts` file in the source directory

```ts
// ./src/app.ts
import { ArriApp } from "arri";
import { a } from "arri-validate";

const app = new ArriApp();

app.rpc("sayHello", {
    params: a.object({
        name: a.string(),
    }),
    response: a.object({
        message: a.string(),
    }),
    handler({ params }) {
        return {
            message: `Hello ${params.name}`,
        };
    },
});

export default app;
```

Setup your npm scripts:

```json
{
    "scripts": {
        "dev": "arri dev",
        "build": "arri build"
    }
}
```

Start the dev server:

```bash
npm run dev
```

## File Based Routing

Arri RPC comes with an optional file based router that will automatically register functions in the `./procedures` directory that end with the `.rpc.ts` file extension.

```fs
|-- src
   |-- procedures
      |-- sayHello.rpc.ts // becomes sayHello()
      |-- users
          |-- getUser.rpc.ts // becomes users.getUser()
          |-- updateUser.rpc.ts // becomes users.updateUser()
```

Example `.rpc.ts` file

```ts
// ./src/users/getUser.rpc.ts
import { defineRpc } from "arri";
import { a } from "arri-validate";

export default defineRpc({
    params: a.object({
        userId: a.string(),
    }),
    response: a.object({
        id: a.string(),
        name: a.string(),
        createdAt: a.timestamp(),
    }),
    handler({ params }) {
        // function body
    },
});
```

### Customizing the File Based Router

```ts
export default defineConfig({
    // rest of config
    procedureDir: "procedures", // change which directory to look for procedures (This is relative to the srcDir)
    procedureGlobPatterns: ["**/*.rpc.ts"], // change the file name glob pattern for finding rpcs
});
```

## Adding Non-RPC Endpoints

```ts
app.route({
    method: "get",
    path: "/hello-world",
    handler(event) {
        return "hello world";
    },
});
```

## Creating sub routers

```ts
import { ArriApp, ArriRouter } from "arri";

const app = new ArriApp();
const router = new ArriRouter();

router.rpc({
    // rpc config
});

router.route({
    // route config
});

app.use(router);
```

## Developing

### Building

Run `nx build arri-rpc` to build the library.

### Running unit tests

Run `nx test arri-rpc` to execute the unit tests via Vitest.
