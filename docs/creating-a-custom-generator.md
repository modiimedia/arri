# Creating a custom Arri generator

At its core a generator plugin is just a function that accepts an [app definition](../specifications/arri_app_definition.md) as it's first parameter and `isDevSever` as it's second parameter. What you choose to do from there is up to you. However the arri cli has some tooling to help streamline this process.

## Table of Contents

- [Scaffold a generator project](#scaffold-a-generator-project)
- [Conventions and Best Practices](#conventions-and-best-practices)
- [Additional Requirements For Official Client Generators](#additional-requirements-for-official-client-generators)

## Scaffold a generator project

Run the following command

```bash
arri init ./my-generator --type plugin
```

This will scaffold a project with an entry file that looks like this:

```ts
import { defineGeneratorPlugin } from '@arrirpc/codegen-utils';

// add any options needed for your plugin here
export interface MyPluginOptions {
    clientName: string;
    outputFile: string;
}

export default defineGeneratorPlugin((options: MyPluginOptions) => {
    return {
        options,
        run: async (appDef, isDevServer) => {
            // generate something using the app definition and the specified options
        },
    };
});
```

Now you can take the app definition and use it to generate you files. You can look at some of the official generators under [./languages](../languages/) for reference.

Additionally, `@arrirpc/codegen-utils` has a number of utility functions to assist in the codegen process. You can read about them [here](../tooling/codegen-utils/README.md)

## Conventions and Best Practices

_The following only applies to official Arri client generators. There are no conventions and best practices if you are looking to generate documentation, stubs for a server, or anything else that isn't a client._

Client generators should aim to do the following:

- Output code that is consistent and predictable. The same input should always produce the same output.
- Output code that follows the standard conventions of the target language
    - Ex: if a language expects snake_case keys. Then the code generator should convert the keys as needed.
    - This includes the `tagKey` and `valueKey` of [union schemas](../specifications/arri_type_definition.md#union-schema-form). The field names should follow the conventions of the target language, while the JSON keys must stay exactly as they are in the schema.
- Output code that is ergonomic and feels good to use.
- Output code comments when a `description` is added to a type definition
- Output code comments when a `description` is added to an RPC definition
- Output `deprecated` annotations when a type definition is marked as deprecated
- Output `deprecated` annotations when an RPC definition is marked as deprecated
- Create clients that provide easy mechanisms for changing headers.
    - You shouldn't have to initialize a whole new client just to change the headers
- Create clients that notify the server what version they are on with the `client-version` header.
    - This version should come from the `info.version` field in the app definition file.
- Create clients that are tolerant to server side changes. [See below](#creating-tolerant-clients).

### Creating tolerant clients

Arri clients should not crash unnecessarily. The truth of the matter is data models will change. Ideally clients will always be up-to-date, but obviously this is not realistic especially in the mobile world. Outdated Arri clients should be able to handle these changes without crashing unnecessarily.

To accomplish this tolerance, Arri clients should assign a fallback value for any field that fails validation. These fallbacks values are outlined below:

| type              | fallback value                                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| any nullable type | `null`                                                                                                                                               |
| any optional type | `undefined`                                                                                                                                          |
| string            | `""`                                                                                                                                                 |
| boolean           | `false`                                                                                                                                              |
| timestamp         | [Current Date and Time]                                                                                                                              |
| floats            | `0.0`                                                                                                                                                |
| integers          | `0`                                                                                                                                                  |
| enums             | The first specified enum value                                                                                                                       |
| arrays            | `[]` an empty array                                                                                                                                  |
| records           | `{}` an empty record / hashmap                                                                                                                       |
| objects           | An instance of the object with all fields set to their fallback value                                                                                |
| unions            | An instance of the first specified variant with all fields set to their fallback value. If the first variant is recursive then use the next in line. |
| discriminators    | Same as unions. (The discriminator schema form is deprecated but generators should continue supporting it for now.)                                  |

Unions (and discriminators) should also use this fallback when the tag is missing or has a value that the client doesn't recognize. See [scenario 3](#scenario-3-client-receives-a-union-variant-that-it-doesnt-understand).

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

#### Scenario 3: Client receives a union variant that it doesn't understand

Let's say the client was expecting a type that looked like this:

```ts
type Shape =
    | { shape: 'rectangle'; width: number; height: number }
    | { shape: 'circle'; radius: number };
```

But the server has since added a new variant and sends a response that looks like this:

```json
{
    "shape": "triangle",
    "base": 10,
    "height": 5
}
```

Because the client doesn't understand the `triangle` variant it should fallback to the first specified variant with all of its fields set to their fallback values.

```ts
{
    shape: 'rectangle', // this is the fallback value
    width: 0,
    height: 0,
}
```

The same applies to externally tagged and adjacently tagged unions. An unknown or missing tag results in the first variant being initialized with its fallback values.

#### When is acceptable to have the client return an error?

- The client was unable to connect to the server
- The server has returned an error
- The server did not provide the correct content-type header
- The server did not response with correctly formatted JSON

#### Conclusion

When it comes to data integrity the server should be deemed as the authority. This means server side validations will be stricter than the client. If the server sees that a field is missing/incorrect it should return an error, while if the client sees that a field is missing/incorrect it should just initialize an default version of that field.

## Additional Requirements for Official Client Generators

_If you have any additional questions or concerns regarding the instructions below, please reach out on [discord](https://discord.gg/5m23HEQss7)_

Maintaining high quality first party clients is a very high priority for Arri RPC. This is important to distinguish us from other projects where the clients sometimes do not maintain the same level of quality. In order to facilitate this Arri, has a number of test files and integration tests to test our generated clients in a variety of scenarios. All official clients need to have tests setup to pass these scenarios. Additionally we should try to minimize the number of dependencies needed by official clients.

Typically when making a new client generator I will hand write a custom client based on `tests/test-files/AppDefinition.json` and then use that for a reference when making the code generator. It's tedious at first but it's actual proven to be the easiest way to prevent dumb little syntax errors with the outputted clients. Once set up it also provides the most straightforward way to quickly iterating on changes to the generator. (EX: Make a change to the hand written client. Then adjust the code-generator to have the same output.)

### Creating unit tests with the reference test files

In the following directory `tests/test-files` there are a number of JSON files which are used as a reference during unit tests. These files are generated by [`internal/scripts/generate-test-utils.ts`](../internal/scripts/generate-test-utils.ts) which can be run with `pnpm gen-test-utils`. (This script deletes and recreates the entire directory, so any new test files should be added to the script rather than created by hand.)

Personally I will usually hand write a client based on the `AppDefinition.json` that I want my code-generator to output. After that I will create a unit tests that feeds `AppDefinition.json` to the code generator to see if the outputs match (Ignoring disparities in newlines and indentation. The `normalizeWhitespace()` utility from `@arrirpc/codegen-utils` can be used for this.)

Unit tests can also be made for the hand-written client to ensure that it deserializes and serializes the following files in `tests/test-files`:

- `Book.json`
- `BookParams.json`
- `NestedObject_NoSpecialChars.json`
- `NestedObject_SpecialChars.json`
- `ObjectWithEveryType.json`
- `ObjectWithNullableFields_AllNull.json`
- `ObjectWithNullableFields_NoNull.json`
- `ObjectWithOptionalFields_AllUndefined.json`
- `ObjectWithOptionalFields_NoUndefined.json`
- `RecursiveObject.json`
- `UnionExternal_Object.json`
- `UnionExternal_Array.json`
- `UnionExternal_Boolean.json`
- `UnionExternal_Timestamp.json`
- `UnionExternal_TimestampNull.json`
- `UnionInternal_Rectangle.json`
- `UnionAdjacent_Object.json`
- `UnionAdjacent_TimestampNull.json`

Some other files you may need:

- `*_ReversedRecord.json` files contain the same data as their counterpart but with the record keys in reverse order. These are useful for languages where hashmaps don't guarantee key order, since the serialized output can match either file.
- `LegacyDiscriminator.json` tests the deprecated discriminator schema form.

`ObjectWithEveryType`, `ObjectWithNullableFields`, and `ObjectWithOptionalFields` each contain an externally tagged, internally tagged, and adjacently tagged union field (`unionExternal`, `unionInternal`, and `unionAdjacent`). The top level `Union*` files intentionally use different variants than the ones nested in those objects so that every variant gets exercised.

I encourage you to look at some of the codegen-reference projects in `/languages` to see what some of this looks like. For example look at the tests in `/languages/dart/dart-codegen-reference` and `/languages/dart/dart-codegen` to see how they reference one another and how they reference the test files.

### Creating integration tests

We also have a test server that is used for more intricate integration testing. These tests will send actual requests to the test server to ensuring everything is working correctly in various scenarios.

See one of the existing test clients located in `tests/clients` to see what these integration tests should look like.
