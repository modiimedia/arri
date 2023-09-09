# Arri Validate

**This is a work in progress. Stuff will break!**

A type builder and validation library built on top of the [Json Type Definition (RFC 8927)](https://jsontypedef.com) . It uses [AJV](https://ajv.js.org/guide/typescript.html) for parsing and serialization. This library is pretty similar to [Typebox](https://github.com/sinclairzx81/typebox) except that it creates Json Type Definition (JTD) objects instead of Json Schema objects.

A lot of inspiration was taken from both [Typebox](https://github.com/sinclairzx81/typebox) and [Zod](https://github.com/colinhacks/zod) when designing this library

## Example

```ts
import { a } from "arri-validate";

const User = a.object({
    id: a.string(),
    name: a.string(),
});

type User = a.infer<typeof User>;

// passes
const result = a.parse(User, `{"id": "1", "name": "john doe"}`);
// fails
const result = a.parse(User, `{"id": "1", "name": null}`);
```

## Building

Run `nx build arri-validate` to build the library.

## Running unit tests

Run `nx test arri-validate` to execute the unit tests via [Jest](https://jestjs.io).
