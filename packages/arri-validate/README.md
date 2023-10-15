# Arri Validate

**This is a work in progress. Stuff will break!**

A type builder and validation library built on top of the [Json Type Definition (RFC 8927)](https://jsontypedef.com) This library is pretty similar to [Typebox](https://github.com/sinclairzx81/typebox) except that it creates Json Type Definition (JTD) objects instead of Json Schema objects.

A lot of inspiration was taken from both [Typebox](https://github.com/sinclairzx81/typebox) and [Zod](https://github.com/colinhacks/zod) when designing this library

## Installation

```bash
# npm
npm install arri-validate

# pnpm
pnpm install arri-validate
```

## Example

```ts
import { a } from "arri-validate";

const User = a.object({
    id: a.string(),
    name: a.string(),
});

type User = a.infer<typeof User>;

// passes and returns User
a.parse(User, `{"id": "1", "name": "John Doe"}`);
// throws error
a.parse(User, `{"id": "1", "name": null}`);

// returns true
a.validate(User, { id: "1", name: "John Doe" });
// returns false
a.validate(User, { id: "1", name: null });

// outputs valid json
a.serialize(User, { id: "1", name: "John Doe" });
```

## Building

Run `nx build arri-validate` to build the library.

## Running unit tests

Run `nx test arri-validate` to execute the unit tests via [Jest](https://jestjs.io).
