# Arri TS

Typescript implementation of Arri RPC. It's built on top of [H3](https://github.com/unjs/h3) and uses [esbuild](https://esbuild.github.io/) for bundling.

## Table of Contents

-   [Quickstart](#quickstart)
-   [Manual Setup](#manual-setup)
    -   [Install Dependencies](#install-dependencies)
    -   [Scaffold Your Project](#scaffold-your-project)
-   [Usage](#usage)
    -   [File-Based Routing](#file-based-routing)
    -   [Manual Routing](#manual-routing)
    -   [Adding Non-RPC Routes](#adding-non-rpc-routes)
    -   [Adding Middleware](#adding-middleware)
-   [Key Concepts](#key-concepts)
    -   [Arri Definition File](#arri-definition-file)
    -   [How Procedures Map To Endpoints](#how-procedures-map-to-endpoints)
-   [Arri CLI](#arri-cli)

## Quickstart

```bash
# npm
npx arri init [project-name]
cd [project-name]
npm install
npm run dev

# pnpm
pnpm dlx arri init [project-name]
cd [project-name]
pnpm install
pnpm run dev
```

## Manual Setup

### Install Dependencies

```bash
# npm
npm install arri arri-validate

# pnpm
pnpm install arri arri-validate
```

### Scaffold Your Project

A basic Arri app directory looks something like this:

```fs
|-- project-dir
    |-- .arri // temp files go here
    |-- .output // final bundle goes here
    |-- src
        |-- procedures // .rpc.ts files go here
        |-- app.ts
    |-- arri.config.ts
    |-- package.json
    |-- tsconfig.json
|
```

Both `.arri` and `.output` should be added to your `.gitignore` file

```txt
.arri
.output
node_modules
```

#### Configuration File

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

##### App Entry

Create an app entry file in your src directory. The name of the file must match whatever you put as the `entry` in your `arri.config.ts`.

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

##### Package.json

Setup your npm scripts:

```json
{
    "name": "my-arri-app",
    "type": "module",
    "scripts": {
        "dev": "arri dev",
        "build": "arri build"
    },
    "dependencies": {
        ...
    },
    "devDependencies": {
        ...
    }
}
```

## Usage

### File Based Routing

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

#### Customizing the File Based Router

```ts
export default defineConfig({
    // rest of config
    procedureDir: "procedures", // change which directory to look for procedures (This is relative to the srcDir)
    procedureGlobPatterns: ["**/*.rpc.ts"], // change the file name glob pattern for finding rpcs
});
```

### Manual Routing

```ts
// using the app instance
const app = new ArriApp()
app.rpc('sayHello', {...})

// using a sub-router
const app = new ArriApp();
const router = new ArriRoute();
router.rpc('sayHello', {...})
app.use(router)
```

### Adding Non-RPC Routes

You can also add generic endpoints for instances when a message-based RPC endpoint doesn't fit.

```ts
// using the app instance
const app = new ArriApp();
app.route({
    method: "get",
    path: "/hello-world",
    handler(event) {
        return "hello world";
    },
});

// using a sub-router
const app = new ArriApp();
const router = new ArriRouter();
router.route({
    method: "get",
    path: "/hello-world",
    handler(event) {
        return "hello world",
    }
})
app.use(router)
```

### Adding Middleware

```ts
const app = new ArriApp();

const requestLoggerMiddleware = defineMiddleware((event) => {
    console.log(`new request at ${event.path}`);
});

app.use(requestLoggerMiddleware);
```

#### Adding to the RPC Context

Any values added to `event.context` will become available in the rpc instance

```ts
const authMiddleware = defineMiddleware(async (event) => {
    // assume you did something to get the user from the request
    event.context.user = {
        id: 1,
        name: "John Doe",
        email: "johndoe@gmail.com",
    };
});

app.rpc("sayHello", {
    params: undefined,
    response: a.object({
        message: a.string(),
    }),
    // user is available here
    handler({ user }) {
        return {
            message: `Hello ${user.name}`,
        };
    },
});
```

To get type safety for these new properties create a `.d.ts` file and augment the `EventContext` provided by `H3`

```ts
import "h3";

declare module "h3" {
    interface H3EventContext {
        user?: {
            id: number;
            name: string;
            email: string;
        };
    }
}
```

### Adding Client Generators

Right now Arri RPC has client generators for the following languages:

-   typescript
-   dart

```ts
// arri.config.ts
import { defineConfig } from "arri";
import { typescriptClientGenerator, dartClientGenerator } from "arri/dist/codegen";

export default defineConfig({
    // rest of config
    clientGenerators: [
        typescriptClientGenerator({...}),
        dartClientGenerator({...})
    ]
});
```

## Key Concepts

### Arri Definition File

The server generates a `__definition.json` file that acts as a schema for all of the procedures and models in the API. By default this schema is viewable from `/__definition` when the server is running, but it can be modified. The endpoint is also relative to the `rpcRoutePrefix` option.

It looks something like this:

```json
{
    "procedures": {
        "sayHello": {
            "path": "/say-hello",
            "method": "post",
            "params": "SayHelloParams",
            "response": "SayHelloResponse"
        }
        // rest of procedures
    },
    "models": {
        "SayHelloParams": {
            "properties": {
                "name": {
                    "type": "string"
                }
            }
        },
        "SayHelloResponse": {
            "properties": {
                "message": {
                    "type": "string"
                }
            }
        }
        // rest of models
    }
}
```

Arri is able to use this schema file to automatically generate clients in multiple languages. In this way it works similarly to an Open API schema, but with much better code-generation support. I've made a lot of deliberate choices in designing this schema to make code-generation easier and more consistent across languages. For example, Arri schemas use a superset of [JSON Type Definition](https://jsontypedef.com/) for their models instead of JSON Schema.

### How Procedures Map To Endpoints

Every procedure maps to a different url based on it's name. For example given the following file structure:

```fs
|--src
   |--procedures
      |--getStatus.rpc.ts
      |--users
         |--getUser.rpc.ts
         |--updateUser.rpc.ts
```

We will get the following endpoints:

```txt
POST /get-status
POST /users/get-user
POST /users/update-user

(Note: these will always be relative to the `rpcRoutePrefix` option)
```

By default all procedures will become post requests, but you can change this when creating a procedure:

```ts
// procedures/users/getUser.rpc.ts
export default defineRpc({
    method: "get",
    // rest of config
});
```

The supported HTTP methods are as follows:

-   post
-   get
-   delete
-   patch
-   put

When using a get method the RPC params will be mapped as query parameters which will be coerced into their type using the `a.coerce` method from `arri-validate`. Get methods support all basic scalar types however arrays and nested objects are not supported.

## Arri CLI

```bash
# start the dev server
arri dev [flags]

# create a production build
arri build [flags]

# create a new project
arri init [dir]
```

## Developing

### Building

Run `nx build arri-rpc` to build the library.

### Running unit tests

Run `nx test arri-rpc` to execute the unit tests via Vitest.
