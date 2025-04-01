# Arri Typescript Codegen

## Setup

### 1) Add the generator to your arri config

```ts
// arri.config.ts
import { defineConfig, generators } from 'arri';

export default defineConfig({
    generators: [
        generators.typescriptClient({
            clientName: 'MyClient',
            outputFile: './client/src/myClient.g.ts',
        }),
    ],
});
```

**Options:**

| Name                  | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| outputFile (required) | Path to a file that will be created by the generator       |
| clientName            | The name of the generated client                           |
| typePrefix            | Add a prefix to the generated type names                   |
| rootService           | Set the root service of the generated client               |
| prettierOptions       | Formatting options for the generated code                  |
| rpcGenerators         | Override the default function used for creating procedures |

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
import { MyClient } from './myClient.g';

const client = new MyClient({
    // only required field
    baseUrl: 'https://example.com',

    // everything below is optional
    headers: () => {
        return {
            Authorization: '<some-token>',
        };
    },
    onError: (err) => {},
    options: {
        retry: 4,
        retryDelay: 200,
        retryStatusCodes: [400, 403, 500, 501],
        onRequest: (ctx) => {},
        onRequestError: (ctx) => {},
        onResponse: (ctx) => {},
        onResponseError: (ctx) => {},
        signal: undefined, // abortcontroller signal
        timeout: 200,
    },
});

await client.myProcedure({ foo: 'foo' });

// individual procedures can also override the global request options
await client.myProcedure({ foo: 'foo' }, { timeout: 400 });
// be aware that these options are not merged with the global request options so you will have to
// re-specify every hook if you only want to change one thing
```

The root client will be a class containing all of the services and procedures in a single class. If you only need a particular service. You can also import just that service.

For example if we have a some procedures grouped under `"users"` we can import just that service like so.

```ts
import { MyClientUsersService } from './myClient.g';

const usersService = new MyClientUsersService({
    baseUrl: 'https://example.com',
    headers: () => {
        return {
            Authorization: '<some-token>',
        };
    },
});

usersService.someProcedure();
```

### Importing and using types

All generated types and serializers/parsers can be imported from the generated code as well. Types will match the ID given to them in the schema. Serialization and parsing helpers will be prefixed with a `$$`

```ts
// import the user type and the user helper
import { type User, $$User } from './myClient.g';

const bob: User = {
    // field
};

$$User.serialize(bob); // outputs valid JSON
$$User.parse('<some-json-string>'); // outputs a User
```

# Development

## Building

Run `nx build ts-codegen` to build the library.

## Running unit tests

Run `nx test ts-codegen` to execute the unit tests via [Vitest](https://vitest.dev).
