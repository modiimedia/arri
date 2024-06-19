# Arri RPC

Typescript implementation of [Arri RPC](/README.md). It's built on top of [H3](https://github.com/unjs/h3) and uses [esbuild](https://esbuild.github.io/) for bundling.

## Table of Contents

-   [Quickstart](#quickstart)
-   [Manual Setup](#manual-setup)
    -   [Install Dependencies](#install-dependencies)
    -   [Scaffold Your Project](#scaffold-your-project)
-   [Usage](#usage)
    -   [Creating Procedures](#creating-procedures)
        -   [File-Based Routing](#file-based-routing)
        -   [Manual Routing](#manual-routing)
        -   [Creating Event Stream Procedures](#creating-event-stream-procedures)
        -   [Creating Websocket Procedures](#creating-websocket-procedures-experimental)
    -   [Adding Non-RPC Routes](#adding-non-rpc-routes)
    -   [Adding Middleware](#adding-middleware)
-   [Key Concepts](#key-concepts)
    -   [Arri Definition File](#arri-definition-file)
    -   [How Procedures Map To Endpoints](#how-procedures-map-to-endpoints)
    -   [H3 Support](#h3-support)
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
npm install arri @arri/server @arri/schema

# pnpm
pnpm install arri @arri/server @arri/schema
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
import { defineConfig, generators } from "arri";

export default defineConfig({
    entry: "app.ts",
    port: 3000,
    srcDir: "src",
    generators: [
        generators.typescriptClient({
            // options
        }),
        generators.dartClient({
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

const app = new ArriApp();

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

### Creating Procedures

#### File Based Routing

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
import { defineRpc } from "@arrirpc/server";
import { a } from "@arrirpc/schema";

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

##### Customizing the File Based Router

```ts
export default defineConfig({
    // rest of config
    procedureDir: "procedures", // change which directory to look for procedures (This is relative to the srcDir)
    procedureGlobPatterns: ["**/*.rpc.ts"], // change the file name glob pattern for finding rpcs
});
```

#### Manual Routing

For those that want to opt out of the file-based routing system you can manually register procedures like so.

```ts
// using the app instance
const app = new ArriApp()
app.rpc('sayHello', {...})

// using a sub-router
const app = new ArriApp();
const router = new ArriRouter();
router.rpc('sayHello', {...})
app.use(router)
```

#### Creating Event Stream Procedures

Event stream procedures make use of [Server Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) to stream events to clients.

Arri Event streams sent the following event types:

-   `message` - A standard message with the response data serialized as JSON
-   `error` - An error message with an `ArriRequestError` sent as JSON
-   `done` - A message to tell clients that there will be no more events
-   `ping` - A message periodically sent by the server to keep the connection alive.

```ts
/// message event ///
id: string | undefined;
event: "message";
data: Response; // whatever you have specified as the response serialized to json

/// error event ///
id: string | undefined;
event: "error";
data: ArriRequestError; // serialized to json

/// done event ///
event: "done";
data: "this stream has ended";

/// ping event ///
event: "ping";
data: "";
```

##### Example Usage:

```ts
// procedures/users/watchUser.rpc.ts
export default defineEventStreamRpc({
    params: a.object({
        userId: a.string(),
    }),
    response: a.object({
        id: a.string(),
        name: a.string(),
        createdAt: a.timestamp(),
        updatedAt: a.timestamp(),
    }),
    handler({ params, stream }) {
        // initialize the stream and send it to the client
        stream.send();

        // send a message every second
        const interval = setInterval(async () => {
            await stream.push({
                id: "1",
                name: "John Doe",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }, 1000);

        // cleanup when the client disconnects
        stream.on("close", () => {
            clearInterval(interval);
        });
    },
});
```

#### EventStreamConnection methods

```ts
stream.push(data: Data, eventId?: string)
stream.pushError(error: ArriRequestError, eventId?: string)
stream.send()
stream.end()
stream.on(e: 'request:close' | 'close', callback: () => any)
```

### Creating Websocket Procedures (Experimental)

```ts
// Websocket procedures work really well with discriminated unions
const IncomingMsg = a.discriminator('type', {
    FOO: a.object({
        message: a.string(),
    }),
    PING: a.object({
        message: a.string(),
    })
});

const OutgoingMsg = a.discriminator('type', {
    BAR: a.object({
        message: a.string(),
    }),
    PONG: a.object({
    message: a.string()
    })
});

export default defineWebsocketRpc(
    params: IncomingMsg,
    response: OutgoingMsg,
    handler: {
        onOpen: (peer) => {},
        onMessage: (peer, message) => {
            switch(message.type) {
                case "FOO":
                    peer.send({
                        type: "BAR",
                        message: "You sent a FOO message"
                    });
                    break;
                case "PING":
                    peer.send({
                        type: "PONG",
                        message: "You sent a PING message"
                    });
                    break;
            }
        },
        onError: (peer, error) => {}
    }
)
```

Under the hood Websocket RPCs use [crossws](https://crossws.unjs.io/).

The possible payloads sent by the server will look like the following:

```
event: message
data: <response serialized to json>
```

```
event: error
data: {"code": <some-err-code>, "message": <some-error-msg>}
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

To get type safety for these new properties create a `.d.ts` file and augment the `ArriEventContext` provided by `@arri/server`

```ts
import "@arri/server";

declare module "@arri/server" {
    interface ArriEventContext {
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
-   kotlin

```ts
// arri.config.ts
import { defineConfig, generators } from "arri";

export default defineConfig({
    // rest of config
    clientGenerators: [
        generators.typescriptClient({...}),
        generators.dartClient({...}),
        generators.kotlinClient({...})
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
            "transport": "http",
            "path": "/say-hello",
            "method": "post",
            "params": "SayHelloParams",
            "response": "SayHelloResponse"
        }
        // rest of procedures
    },
    "definitions": {
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

### H3 Support

Arri is built on top of [H3](https://h3.unjs.io/utils/request#getrequestipevent) so many of the concepts that apply to H3 also apply to Arri.

#### Accessing Utilities

Arri re-eports all of the H3 utilities.

```ts
import { getRequestIP, setResponseHeader } from "@arrirpc/server";
```

#### Accessing H3 Events

You can access H3 events from inside procedures handlers.

```ts
defineRpc({
  params: undefined,
  response: undefined,
  handler(_, event) {
    getRequestIP(event);
  }
)

defineEventStreamRpc({
  params: undefined,
  response: undefined,
  handler(_, event) {
    getRequestIP(event);
  }
)
```

#### Manually Starting an Arri Server

Arri server is just an H3 app under the hood so you can start it the same way you would start an H3 app. Although you should note that currently the filed based router only works when using the Arri CLI.

```ts
import { createServer } from "node:http";
import { ArriApp, toNodeListener } from "@arrirpc/server";

const app = new ArriApp();

createServer(toNodeListener(app.h3App)).listen(process.env.PORT || 3000);
```

## Arri CLI

```bash
# start the dev server
arri dev [flags]

# create a production build
arri build [flags]

# create a new project
arri init [dir]

# run codegen
arri codegen [path-to-definition-file]
```

## Development

### Building

Run `nx build arri-rpc` to build the library.

### Running unit tests

Run `nx test arri-rpc` to execute the unit tests via Vitest.
