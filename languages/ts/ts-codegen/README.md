# Arri Typescript Codegen

## Setup

### 1) Add the generator to your arri config

```ts
// arri.config.ts
import { defineConfig, typescriptClientGenerator } from "arri";

export default defineConfig({
    generators: [
        typescriptClientGenerator({
            clientName: "MyClient",
            outputFile: "./client/src/myClient.g.ts",
        }),
    ],
});
```

**Options:**

| Name                  | Description                                          |
| --------------------- | ---------------------------------------------------- |
| clientName (required) | The name of the generated client                     |
| outputFile (required) | Path to a file that will be created by the generator |
| prettierOptions       | Formatting options for the generated code            |

### 2) Install the TS client library

Make sure that the project that will be using the generated code has the client library installed. The version number should match your arri cli version.

```bash
# npm
npm i @arrirpc/client

# pnpm
pnpm i --save @arrirpc/client
```

## Using the Generated Code

### Initialize the client

```ts
// This will match whatever you put in the arri config
import { MyClient } from "./myClient.g";

const client = new MyClient({
    baseUrl: "https://example.com",
    headers: () => {
        return {
            Authorization: "<some-token>",
        };
    },
});

await client.myProcedure();
```

The root client will be a class containing all of the services and procedures in a single class. If you only need a particular service. You can also import just that service.

For example if we have a some procedures grouped under `"users"` we can import just that service like so.

```ts
import { MyClientUsersService } from "./myClient.g";

const usersService = new MyClientUsersService({
    baseUrl: "https://example.com",
    headers: () => {
        return {
            Authorization: "<some-token>",
        };
    },
});

usersService.someProcedure();
```

### Importing and using types

All generated types and serializers/parsers can be imported from the generated code as well. Types will match the ID given to them in the schema. Serialization and parsing helpers will be prefixed with a `$$`

```ts
// import the user type and the user helper
import { type User, $$User } from "./myClient.g";

const bob: User = {
    // field
};

$$User.serialize(bob); // outputs valid JSON
$$User.parse("<some-json-string>"); // outputs a User
```

# Development

## Building

Run `nx build ts-codegen` to build the library.

## Running unit tests

Run `nx test ts-codegen` to execute the unit tests via [Vitest](https://vitest.dev).
