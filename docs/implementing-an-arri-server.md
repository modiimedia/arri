# Implementing an Arri Server Over HTTP

In order to implement an Arri server over HTTP you need to follow a few simple rules. These rules specifically limit where state is passed between the server and client. In REST, state may be passed through a combination of the url params, query params, request body, HTTP method, and HTTP headers. In contrast, Arri minimizes where information is passed.

## Rule 1: Every procedure gets a separate URL

Arri uses HTTP URLs to specify RPC endpoints on the server. Every procedure get's mapped directly to a URL. The way you choose to map procedures to URLs is up to you. For example given a procedure named `users.getUsers`, you can use any of the following conventions when creating a URL path.

-   `/users/get-users`
-   `/users.getUsers`
-   `/users_get_users`

Arri doesn't care about the naming conventions you use for your paths. Although you should aim to be consistent.

You can also optionally add a prefix to all of your Arri RPC paths, such as `procedures`

-   `/procedures/users/get-users`
-   `/procedures/users.getUsers`
-   `/procedures/users_get_users`

## Rule 2: HTTP methods do not carry implicit meaning

Arri doesn't differentiate between any of the following HTTP methods:

-   `GET`
-   `POST`
-   `PATCH`
-   `PUT`
-   `DELETE`

Any individual procedure can use any one of those methods. By default Arri will use `POST`, but you have the freedom to change the methods as you see fit.

The following HTTP methods preserve their standard usage/meaning:

-   `OPTIONS`
-   `HEAD`

Although the Arri specification doesn't require you to implement `HEAD` for your routes.

## Rule 3: All inputs and outputs must be a named object

Procedures cannot send / receive arbitrary types like `string` or `boolean`. All parameters and responses must be a named object. So when using [Arri Type Definition](/specifications/arri_type_definition.md) that means that the "Property" Schema Form and "Discriminator" Schema Form are the only valid inputs and outputs that can be assigned to procedures.

Allowing for unnamed inputs and outputs complicates code-generation.

## Rule 4: All RPC parameters are passed through the request body as JSON with the exception of GET requests

Arri doesn't not mix passing of information between the URL and the request body. The URL is used to specify which RPC is being called and the body is used to pass parameters to the RPC. The only exception to this rule is when an RPC uses a `GET` HTTP method. When using a `GET` method, the parameters are passed as URL query params.

**Examples:**

Given the following procedure:

```json
{
    "users.getUser": {
        "transport": "http",
        "method": "post",
        "path": "/users/get-user",
        "params": "GetUserParams",
        "response": "User"
    }
}
```

The params must passed through the request body as JSON.

However give the following change:

```json
{
    "users.getUser": {
        "transport": "http",
        "method": "get",
        "path": "/users/get-user",
        "params": "GetUserParams",
        "response": "User"
    }
}
```

The params must now be passed through the url query params like so:

```txt
http://myapi.com/users/get-user?a=FOO&b=BAR&c=BAZ
```

### Additional Notes

Because GET requests must send parameters through as URL query params. This means that the following types cannot be supported for parameters when an RPC is bound to a GET method:

-   "any" types
-   arrays
-   records
-   nested objects
-   nested discriminators

Additionally when receiving RPC params through query parameters every field will be encoded as a string so you need to be able to parse those values from the string.

## Rule 5: Where returning an error the server returns an Arri error response.

An Arri response looks like this:

```jsonc
{
    // REQUIRED FIELDS:
    "code": 400, // the http status code
    "message": "Bad request", // an error message

    // OPTIONAL FIELDS:
    "data": "FOO", // Some arbitrary data to send to the client. Can be anything.,
    "stack": ["...", "...."], // A stack trace
}
```

All error responses must conform to this pattern.

## Rule 6: You must be able to produce an AppDefinition file

For details about the app definition specification see [here](../specifications/arri_app_definition.md).

This is the most difficult rule to implement and you will probably spend the majority of your implementation time on this step. For those that want to opt out of this step arri provides tools to manually create app definitions, which can be seen [here](../README.md#manually-creating-an-app-definition).

Arri takes a "code-first" approach which means it prioritizing automatically generating these definitions from your server code. In this, the code becomes the source of truth. The methods by which you accomplish this automatic generation doesn't matter and will likely depend on the language with which the server is being implemented in. The most common approaches to this sort of problem are:

-   Schema builders
-   Macros
-   Annotations + Codegen

### Examples

#### Typescript

The typescript implementation uses the schema builder approach (similar to Zod) which makes the type definitions and rpc definitions available at runtime.

```ts
// Arri Models
const UserParams = a.object("UserParams", {
    userId: a.string(),
});
const User = a.object("User", {
    id: a.string(),
    name: a.string(),
});

// RPC
export const getUser = defineRpc({
    params: UserParams,
    response: User,
    handler({ params }) {
        // some logic to get the user and return it
    },
});
```

These schemas then get registered on the app instance:

```ts
import { getUser } from "./wherever";
const app = new ArriApp();

app.rpc("getUser", getUser);
```

#### Rust

In a language like Rust, the server implementation will likely make use of proc macros.

```rust
#[derive(ArriModel)]
struct UserParams {
    user_id: String,
}

#[derive(ArriModel)]
struct User {
    id: String,
    name: String,
}

#[rpc("/users/get-user")]
async fn get_user(params: UserParams) -> Result<User, ()> {
    // implementation here
}
```

### After creating an app definition

Once you have generated the app definition you simply pass it to the Arri code generator.

```bash
arri codegen AppDefinition.json # json app def
arri codegen AppDefinition.ts # ts app def
arri codegen https://myapi.com/__definition # http endpoint
```

## Bonus: Create a plugin for the Arri CLI

Server plugins dictate what happens when you run `arri dev` and `arri build`. By creating a plugin you can create a fully automated experience.

In order to create a server plugin use the `defineServerConfig` helper from the `arri` package:

```ts
import { defineServerConfig } from "arri";

const myCustomConfig = defineServerConfig({
    devArgs: {
        // define what CLI args the "dev" command accepts
        foo: {
            type: "string",
            required: false,
        },
    },
    devFn(args, generators) {
        console.log(args.foo); // foo is now available here
    },
    buildArgs: {
        // define what CLI args the "build" command accepts
        bar: {
            type: "boolean",
        },
    },
    buildFn(args, generators) {
        console.log(args.bar); // bar is now available here
    },
});
```

Then you simply register your plugin in the arri config file:

```ts
export default defineConfig({
    server: myCustomPlugin,
    generators: [...]
})
```

Now the Arri CLI will use the functions in `devFn` and `buildFn` for the `dev` and `build` commands respectively.

```bash
arri dev --foo "hello world" # outputs "hello world"
arri build --bar # outputs false
```

You can also wrap this helper in a function if you have some options that you want users to input without needing to be passed as CLI args.

```ts
function myCustomServer(options: { port: number }) {
    return defineServerConfig({...});
}
```

```ts
export default defineConfig({
    server: myCustomServer({
        port: 3000,
    }),
    generators: [...],
});
```

### Example: A simple Go server plugin

Let's say we've configured a go generator that reads our go application and outputs an [App Definition](/specifications/arri_app_definition.md) at the following location `.arri/__definition.json`. We can set up a simple plugin that looks like this.

```ts
const goServer = defineServerConfig({
    devArgs: {},
    devFn(_, generators) {
        // run "go generate"
        execSync("go generate", {
            stdio: "inherit",
        });
        // read the App Definition
        const appDef = JSON.parse(
            readFileSync(".arri/__definition.json", "utf8"),
        ) as AppDefinition;
        // run all of the registered Arri generators
        await Promise.all(generators.map((item) => item.generator(appDef)));
        // start the go application
        execSync("go run main.go", {
            stdio: 'inherit'
        });
    },
    buildArgs: {},
    buildFn(_, generators) {
        // run "go generate"
        execSync("go generate", {
            stdio: "inherit",
        });
        // read the App Definition
        const appDef = JSON.parse(
            readFileSync(".arri/__definition.json", "utf8"),
        ) as AppDefinition;
        // run all of the registered Arri generators
        await Promise.all(generators.map((item) => item.generator(appDef)));
        // run "go build"
        execSync("go build", {
            stdio: "inherit"
        })
    },
});

export default defineConfig({
    server: goServer,
    generators: [...]
})
```

That's it. Now whenever we call `arri dev` it will:

-   output JSON app definition file
-   run the arri code generators against that file
-   start the go server

And when we call `arri build` it will:

-   output JSON app definition file
-   run the arri code generators against that file
-   build the go application

Now there's a lot more we can add to this such as file watchers and whatnot. It's just typescript go so you can basically do whatever you want.
