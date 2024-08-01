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
-   `UPDATE`
-   `PATCH`
-   `PUT`
-   `DELETE`

Any individual procedure can use any one of those methods. By default Arri will use `POST`, but you have the freedom to change the methods as you see fit.

The following HTTP methods preserve their standard usage/meaning:

-   `OPTIONS`
-   `HEAD`

Although the Arri specification doesn't require you to implement `HEAD` for your routes.

## Rule 3: All RPC parameters are passed through the request body as JSON with the exception of GET requests

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

Because GET requests must send parameters through as URL query params. This means that the following types cannot be supported for parameters:

-   "any" types
-   arrays
-   records
-   nested objects
-   nested discriminators

Additionally when receiving RPC params through query parameters every field will be encoded as a string so you need to be able to parse those values from the string.

## Rule 4: Where returning an error the server returns an Arri error response.

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

## Rule 5: You must be able to produce an AppDefinition file

For details about the app definition specification see [here](../specifications/arri_app_definition.md). This specification can be manually created or automatically created at build time.

All official Arri server implementations will provide mechanisms for automatically generating this specification from your server code. This is in-keeping with Arri's "code-first" philosophy. The method by which this is accomplished will depend on the meta-programming tools available in the target language.

The most common of these approaches are:

-   Schema builders
-   Macros
-   Annotations + Codegen

The typescript implementation uses the schema builder approach (similar to Zod) which makes the type definitions and rpc definitions available at runtime.

```ts
const UserParams = a.object("UserParams", {
    userId: a.string(),
});

const User = a.object("User", {
    id: a.string(),
    name: a.string(),
});

const getUsers = defineRpc({
    params: UserParams,
    response: User,
    handler({ params }) {
        // some logic to get the user and return it
    },
});
```

In a language like Rust, the server implementation will likely make use of proc macros/.

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

Once you have generated the app definition you simply pass it to the Arri code generator.

```bash
arri codegen AppDefinition.json # json app def
arri codegen AppDefinition.ts # ts app def
arri codegen https://myapi.com/__definition # http endpoint
```
