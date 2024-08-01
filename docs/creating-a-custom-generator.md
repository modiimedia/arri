# Creating a custom Arri generator

At its core a generator plugin is just a function that accepts an [app definition](../specifications/arri_app_definition.md) as it's first parameter and `isDevSever` as it's second parameter. What you choose to do from there is up to you. However the arri cli has some tooling to help streamline this process.

## Scaffold a generator project

Run the following command

```bash
arri init ./my-generator --type plugin
```

This will scaffold a project with an entry file that looks like this:

```ts
import { defineGeneratorPlugin } from "@arrirpc/codegen-utils";

// add any options needed for your plugin here
export interface MyPluginOptions {
    clientName: string;
    outputFile: string;
}

export default defineGeneratorPlugin((options: MyPluginOptions) => {
    return {
        options,
        generator: async (appDef, isDevServer) => {
            // generate something using the app definition and the specified options
        },
    };
});
```

Now you can take the app definition and use it to generate you files. You can look at some of the official generators under [./languages](../languages/) for reference.

Additionally, `@arrirpc/codegen-utils` has a number of utility functions to assist in the codegen process. You can read about them [here](../tooling/codegen-utils/README.md)

## Conventions and Best Practices

Official arri client generators aim to do the following:

-   Output code that is consistent and predictable. The same input should always produce the same output.
-   Output code that follows the standard conventions of the target language
    -   Ex: if a language expects snake_case keys. Then the code generator should convert the keys as needed.
-   Output code that is ergonomic and feels good to use.
-   Output code comments when a `description` is added to a type definition
-   Output code comments when a `description` is added to an RPC definition
-   Output `deprecated` annotations when a type definition is marked as deprecated
-   Output `deprecated` annotations when an RPC definition is marked as deprecated
-   Create clients that provide easy mechanisms for changing headers.
    -   You shouldn't have to initialize a whole new client just to change the headers
-   Create clients that notify the server what version they are on with the `client-version` header.
    -   This version should come from the `info.version` field in the app definition file.
-   Create clients that are tolerant to server side changes. [See below](#creating-tolerant-clients).

There are no recommended practices or conventions if you are using arri to generate something other than a client (i.e. Docs). Do whatever you want in that case.

### Creating tolerant clients

Arri clients should not crash unnecessarily. The truth of the matter is data models will change. Ideally clients will always be up-to-date, but obviously this is not realistic especially in the mobile world. Outdated Arri clients should be able to handle these changes without crashing unnecessarily.

To accomplish this tolerance, Arri clients should assign a fallback value for any field that fails validation. These fallbacks values are outlined below:

| type                | fallback value                                                                          |
| ------------------- | --------------------------------------------------------------------------------------- |
| any nullable type   | `null`                                                                                  |
| any optional type   | `undefined`                                                                             |
| string              | `""`                                                                                    |
| boolean             | `false`                                                                                 |
| timestamp           | [Current Date and Time]                                                                 |
| floats              | `0.0`                                                                                   |
| integers            | `0`                                                                                     |
| enums               | The first specified enum value                                                          |
| arrays              | `[]` an empty array                                                                     |
| records             | `{}` an empty record / hashmap                                                          |
| objects             | An instance of the object with all fields set to their fallback value                   |
| discriminated union | An instance of the first specified sub type with all fields set to their fallback value |

#### Scenario 1: Client receives an object with a missing field

Let's say the client was expecting a type that looked like this:

```ts
type User = {
    id: string;
    name: string;
    email: string;
};
```

But the server sent a response that looked like this:

```json
{
    "id": "1",
    "name": "John Doe"
}
```

in this scenario the client should initialize a user object that looks like this:

```ts
{
    id: "1",
    name: "John Doe",
    email: "", // this is a fallback value
}
```

#### Scenario 2: Client receives an enum field that it doesn't understand:

Let's say the client was expected a type that looked like this:

```rust
pub struct User {
    pub id: String,
    pub name: String,
    pub role: UserRole,
}

pub enum UserRole {
    Standard, // with the serial value being "STANDARD"
    Admin, // with the serial value being "ADMIN"
}
```

But the server sends a response that looks like this:

```json
{
    "id": "1",
    "name": "John Doe",
    "role": "MODERATOR"
}
```

Because the client doesn't understand the value `MODERATOR` it should fallback to the first specified enum value.

```rust
User {
    id: "1".to_string(),
    name: "John Doe".to_string(),
    role: UserRole::Standard, // this is the fallback value
}
```

#### When is acceptable to have the client return an error?

-   The client was unable to connect to the server
-   The server has returned an error
-   The server did not provide the correct content-type header
-   The server did not response with correctly formatted JSON

#### Conclusion

When it comes to data integrity the server should be deemed as the authority. This means server side validations will be stricter than the client. If the server sees that a field is missing/incorrect it should return an error, while if the client sees that a field is missing/incorrect it should just initialize an default version of that field.
