# Arri Schema

A type builder and validation library built on top of the [Json Type Definition (RFC 8927)](https://jsontypedef.com) This library is pretty similar to [Typebox](https://github.com/sinclairzx81/typebox) except that it creates Json Type Definition (JTD) objects instead of Json Schema objects.

A lot of inspiration was taken from both [Typebox](https://github.com/sinclairzx81/typebox) and [Zod](https://github.com/colinhacks/zod) when designing this library.

## Project Philosophy

The goals of this project are as follows:

-   Portable type definitions
-   High performance validation, parsing, and serialization
-   Consistent error reporting for parsing and serialization errors

I am not looking to support every feature of Typescript's type system or even every possible representation of JSON. The goal is that the data models defined through this library can be used as a source of truth across multiple programming languages. Both JSON and Typescript have to be limited to accomplish this.

### Adherence to RFC 8927

To represent the data-models in a language agnostic way this library heavily relies on JSON Type Definition (JTD). However, this library does not strictly comply with the JTD specification. The reason for this is because JTD does not support 64-bit integers. I believe sharing large integers across languages is a huge pain point especially when going to and from Javascript. For this reason alone, I have opted to break away from the JTD spec and add support for `int64` and `uint64`. So while I have no intention to break further away from the spec I am open to it if a large enough issue arises (in my view). If you use this library be aware that I'm using a superset of JTD rather than a strict spec compliant implementation.

## Table of Contents

-   [Installation](#installation)
-   [Basic Example](#basic-example)
-   [Usage With @arrirpc/server](#usage-with-@arrirpc/server)
-   [Supported Types](#supported-types)
    -   [Primitives](#primitives)
    -   [Enums](#enums)
    -   [Arrays / Lists](#arrays--lists)
    -   [Objects](#objects)
    -   [Records / Maps](#records--maps)
    -   [Discriminated Unions](#discriminated-unions)
    -   [Recursive Types](#recursive-types)
-   [Modifiers](#modifiers)
    -   [Optional](#optional)
    -   [Nullable](#nullable)
    -   [Extend](#extend)
    -   [Omit](#omit)
    -   [Pick](#pick)
    -   [Partial](#partial)
-   [Utilities](#utilities)
    -   [Validate](#validate)
    -   [Parse](#parse)
    -   [Safe Parse](#safe-parse)
    -   [Coerce](#coerce)
    -   [Safe Coerce](#safe-coerce)
    -   [Serialize](#serialize)
    -   [Errors](#errors)
-   [Compiled Validators](#compiled-validators)
-   [Metadata](#metadata)
-   [Benchmarks](#benchmarks)
-   [Development](#development)

## Installation

```bash
# npm
npm install @arrirpc/schema

# pnpm
pnpm install @arrirpc/schema
```

## Basic Example

```ts
import { a } from "@arrirpc/schema";

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

## Usage With @arrirpc/server

See [here](/languages/ts/ts-server/README.md) for full details.

```ts
import { a } from "@arrirpc/schema";
import { defineRpc } from "@arrirpc/server";

export default defineRpc({
    params: a.object({
        name: a.string(),
    }),
    response: a.object({
        message: a.string(),
    }),
    handler({ params }) {
        // can now access params.name here
        return {
            message: `Hello ${params.name}`,
        };
    },
});
```

## Supported Types

### Primitives

| Arri Schema   | Typescript | Json Type Definition  |
| ------------- | ---------- | --------------------- |
| a.any()       | any        | {}                    |
| a.string()    | string     | { "type": "string" }  |
| a.boolean()   | boolean    | {"type": "boolean"}   |
| a.timestamp() | Date       | {"type": "timestamp"} |
| a.float32()   | number     | {"type": "float32"}   |
| a.float64()   | number     | {"type": "float64"}   |
| a.int8()      | number     | {"type": "int8"}      |
| a.int16()     | number     | {"type": "int16"}     |
| a.int32()     | number     | {"type": "int32"}     |
| a.int64()     | BigInt     | {"type": "int64"}     |
| a.uint8()     | number     | {"type": "uint8"}     |
| a.uint16()    | number     | {"type": "uint16"}    |
| a.uint32()    | number     | {"type": "uint32"}    |
| a.uint64()    | BigInt     | {"type": "uint64"}    |

### Enums

Enum schemas allow you to specify a predefine list of accepted strings

**Usage**

```ts
const Status = a.enumerator(["ACTIVE", "INACTIVE", "UNKNOWN"]);
type Status = a.infer<typeof Status>; // "ACTIVE" | "INACTIVE" | "UNKNOWN";

a.validate(Status, "BLAH"); // false
a.validate(Status, "ACTIVE"); // true
```

**Outputted JTD**

```json
{
    "enum": ["ACTIVE", "INACTIVE", "UNKNOWN"]
}
```

### Arrays / Lists

**Usage**

```ts
const MyList = a.array(a.string());
type MyList = a.infer<typeof MyList>; // string[];

a.validate(MyList, [1, 2]); // false
a.validate(MyList, ["hello", "world"]); // true
```

**Outputted JTD**

```json
{
    "elements": {
        "type": "string"
    }
}
```

### Objects

**Usage**

```ts
const User = a.object({
    id: a.string(),
    email: a.string(),
    created: a.timestamp(),
});
type User = a.infer<typeof User>; // { id: string; email: string; created: Date; }

a.validate({
    id: "1",
    email: "johndoe@example.com",
    created: new Date(),
}); // true
a.validate({
    id: "1",
    email: null,
    created: new Date(),
}); // false
```

**Outputted JTD**

```json
{
    "properties": {
        "id": {
            "type": "string"
        },
        "email": {
            "type": "string"
        },
        "created": {
            "type": "timestamp"
        }
    },
    "additionalProperties": true
}
```

#### Strict Mode

By default @arrirpc/schema will ignore and strip out any additional properties when validating objects. If you want validation to fail when additional properties are present then modify the `additionalProperties` option.

```ts
const UserStrict = a.object(
    {
        id: a.string(),
        name: a.string(),
        created: a.timestamp(),
    },
    {
        additionalProperties: false,
    },
);

a.parse(UserStrict, {
    id: "1",
    name: "johndoe",
    created: new Date(),
    bio: "my name is joe",
}); // fails parsing because of the additional field "bio"
```

**Outputted JTD**

```json
{
    "properties": {
        "id": {
            "type": "string"
        },
        "email": {
            "type": "string"
        },
        "created": {
            "type": "timestamp"
        }
    },
    "additionalProperties": false
}
```

### Records / Maps

**Usage**

```ts
const R = a.record(a.boolean());
type R = a.infer<typeof R>; // Record<string, boolean>

a.validate(R, {
    hello: true,
    world: false,
}); // true;
a.validate(R, {
    hello: "world",
}); // false;
```

**Outputted JTD**

```json
{
    "values": {
        "type": "boolean"
    }
}
```

### Discriminated Unions

**Usage**

```ts
const Shape = a.discriminator("type", {
    RECTANGLE: a.object({
        width: a.float32(),
        height: a.float32(),
    }),
    CIRCLE: a.object({
        radius: a.float32(),
    }),
});
type Shape = a.infer<typeof Shape>; // { type: "RECTANGLE"; width: number; height: number; } | { type: "CIRCLE"; radius: number; }

// Infer specific sub types of the union
type ShapeTypeRectangle = a.inferSubType<Shape, "type", "RECTANGLE">; // { type "RECTANGLE"; width: number; height: number; };
type ShapeTypeCircle = a.inferSubType<Shape, "type", "CIRCLE">; // { type "CIRCLE"; radius: number; }

a.validate(Shape, {
    type: "RECTANGLE",
    width: 1,
    height: 1.5,
}); // true
a.validate(Shape, {
    type: "CIRCLE",
    radius: 5,
}); // true
a.validate(Shape, {
    type: "CIRCLE",
    width: 1,
    height: 1.5,
}); // false
```

**Outputted JTD**

```json
{
    "discriminator": "type",
    "mapping": {
        "RECTANGLE": {
            "properties": {
                "width": {
                    "type": "float32"
                },
                "height": {
                    "type": "float32"
                }
            },
            "additionalProperties": true
        },
        "CIRCLE": {
            "properties": {
                "radius": {
                    "type": "float32"
                }
            },
            "additionalProperties": true
        }
    }
}
```

### Recursive Types

You can define recursive schemas by using the `a.recursive` helper. This function accepts another function that outputs an object schema or a discriminator schema.

An important thing to note is that type inference doesn't work correctly for Recursive schemas. In order to satisfy Typescript you will need to define the type and then pass it to the function as a generic.

Additionally it is recommended to define an ID for any recursive schemas. If one is not specified arri will auto generate one.

---

_If some TS wizard knows how to get type inference to work automatically for these recursive schemas, feel free to open a PR although I fear it will require a major refactor the existing type system._

**Usage**

```ts
// the recursive type must be defined first
type BinaryTree = {
    left: BinaryTree | null;
    right: BinaryTree | null;
};

// pass the type to the helper
const BinaryTree = a.recursive<BinaryTree>(
    (self) =>
        // the resulting schema must be an object or discriminator
        // it also must match the type you pass into the generic parameter
        // or TS will yell at you
        a.object({
            left: a.nullable(self),
            right: a.nullable(self),
        }),
    {
        id: "BinaryTree",
    },
);

a.validate(BinaryTree, {
    left: {
        left: null,
        right: {
            left: null,
            right: null,
        },
    },
    right: null,
}); // true
a.validate(BinaryTree, {
    left: {
        left: null,
        right: {
            left: true,
            right: null,
        },
    },
    right: null,
}); // false
```

**Outputted JTD**

```json
{
    "properties": {
        "left": {
            "ref": "BinaryTree",
            "nullable": true
        },
        "right": {
            "ref": "BinaryTree",
            "nullable": true
        }
    },
    "additionalProperties": true,
    "metadata": {
        "id": "BinaryTree"
    }
}
```

## Modifiers

### Optional

Use `a.optional()` to make an object field optional.

```ts
const User = a.object({
    id: a.string(),
    email: a.optional(a.string()),
    date: a.timestamp();
})

/**
 * Resulting type
 * {
 *   id: string;
 *   email: string | undefined;
 *   date: Date;
 * }
 */
```

**Outputted JTD**

```json
{
    "properties": {
        "id": {
            "type": "string"
        },
        "date": {
            "type": "timestamp"
        }
    },
    "optionalProperties": {
        "email": {
            "type": "string"
        }
    }
}
```

### Nullable

Use `a.nullable()` to make a particular type nullable

```ts
const name = a.nullable(a.string());

/**
 * Resulting type
 * string | null
 */
```

**Outputted JTD**

```json
{
    "type": "string",
    "nullable": true
}
```

### Clone

Copy another schema without copying it's metadata using the `a.clone()` helper

```ts
const A = a.object(
    {
        a: a.string(),
        b: a.float32(),
    },
    { id: "A" },
);
console.log(A.metadata.id); // "A"

const B = a.clone(A);
console.log(B.metadata.id); // undefined
```

### Extend

Extend an object schema with the `a.extend()` helper.

```ts
const A = a.object({
    a: a.string(),
    b: a.float32(),
});
// { a: string; b: number; }

const B = a.object({
    c: a.timestamp(),
});
// { c: Date }

const C = a.extend(A, B);
// { a: string; b: number; c: Date }
```

### Omit

Use `a.omit()` to create a new object schema with certain properties removed

```ts
const A = a.object({
    a: a.string(),
    b: a.float32(),
});
// { a: string; b: number; }

const B = a.omit(A, ["a"]);
// { b: number; }
```

### Pick

Use `a.pick()` to create a new object schema with the a subset of properties from the parent object

```ts
const A = a.object({
    a: a.string(),
    b: a.float32(),
    c: a.timestamp(),
});
// { a: string; b: number; c: Date; }

const B = a.pick(A, ["a", "c"]);
// { a: string; c: Date; }
```

### Partial

Use `a.partial()` to create a new object schema that makes all of the properties of the parent schema optional.

```ts
const A = a.object({
    a: a.string(),
    b: a.float32(),
    c: a.timestamp(),
});
// { a: string; b: number; c: Date; }

const B = a.partial(A);
// { a: string | undefined; b: number | undefined; c: Date | undefined; }
```

## Utilities

### Validate

Call `a.validate()` to validate an input against an arri schema. This method also acts as a type guard, so any `any` or `unknown` types that pass validation will automatically gain autocomplete for the validated fields

```ts
const User = a.object({
    id: a.string(),
    name: a.string(),
});
a.validate(User, true); // false
a.validate(User, { id: "1", name: "john doe" }); // true

if (a.validate(User, someInput)) {
    console.log(someInput.id); // intellisense works here
}
```

### Parse

Call `a.parse()` to parse a JSON string against an arri schema. It will also handle parsing normal objects as well.

```ts
const User = a.object({
    id: a.string(),
    name: a.string(),
});

// returns a User if successful or throws a ValidationError if fails
const result = a.parse(User, jsonString);
```

### Safe Parse

A safer alternative to `a.parse()` that doesn't throw an error.

```ts
const User = a.object({
    id: a.string(),
    name: a.string(),
});

const result = a.safeParse(User, jsonString);
if (result.success) {
    console.log(result.value); // result.value will be User
} else {
    console.error(result.error);
}
```

### Coerce

`a.coerce()` will attempt to convert inputs to the correct type. If it fails to convert the inputs it will throw a `ValidationError`

```ts
const A = a.object({
    a: a.string(),
    b: a.boolean(),
    c: a.float32(),
});

a.coerce(A, {
    a: "1",
    b: "true",
    c: "500.24",
});
// { a: "1", b: true, c: 500.24 };
```

### Safe Coerce

`a.safeCoerce()` is an alternative to `a.coerce()` that doesn't throw.

```ts
const A = a.object({
    a: a.string(),
    b: a.boolean(),
    c: a.float32(),
});

const result = a.safeCoerce(A, someInput);

if (result.success) {
    console.log(result.value);
} else {
    console.error(result.error);
}
```

### Serialize

`a.serialize()` will take an input and serialize it to a valid JSON string.

```ts
const User = a.object({
    id: a.string(),
    name: a.string(),
});

a.serialize(User, { id: "1", name: "john doe" });
// {"id":"1","name":"john doe"}
```

Be aware that this function does not validate the input. So if you are passing in an any or unknown type into this function it is recommended that you validate it first.

### Errors

Use `a.errors()` to get all of the validation errors of a given input.

```ts
const User = a.object({
    id: a.string(),
    date: a.timestamp(),
});

a.errors(User, { id: 1, date: "hello world" });
/**
 * [
 *   {
 *     instancePath: "/id",
 *     schemaPath: "/properties/id/type",
 *     message: "Expected string",
 *   },
 *   {
 *     instancePath: "/date",
 *     schemaPath: "/properties/id/type",
 *     message: "Expected instanceof Date",
 *   }
 * ]
 *
 */
```

## Compiled Validators

`@arrirpc/schema` comes with a high performance JIT compiler that transforms Arri Schemas into highly optimized validation, parsing, serialization functions.

```ts
const User = a.object({
    id: a.string(),
    email: a.nullable(a.string()),
    created: a.timestamp(),
});

const $$User = a.compile(User);

$$User.validate(someInput);
$$User.parse(someJson);
$$User.serialize({ id: "1", email: null, created: new Date() });
```

In most cases, the compiled validators will be much faster than the standard utilities. However there is some overhead with compiling the schemas so ideally each validator would be compiled once. Additionally the resulting methods make use of eval so they can only be used in an environment that you control such as a backend server. They WILL NOT work in a browser environment.

You can also use `a.compile` for code generation. The compiler result gives you access to the generated function bodies.

```ts
$$User.compiledCode.validate; // the generated validation code
$$User.compiledCode.parse; // the generated parsing code
$$User.compiledCode.serialize; // the generated serialization code
```

## Metadata

Metadata is used during cross-language code generation. Arri schemas allow you to specify the following metadata fields:

-   id - Will be used as the type name in any arri client generators
-   description - Will be added as a description comment above any generated types
-   isDeprecated - Will mark any generated code with the deprecation annotation of target language

### Examples

A schema with this metadata:

```ts
// metadata object
const BookSchema = a.object(
    {
        title: a.string(),
        author: a.string(),
        publishDate: a.timestamp(),
    },
    {
        id: "Book",
        description: "This is a book",
    },
);
```

will produce types that look something like this during codegen.

**Typescript**

```ts
/**
 * This is a book
 */
interface Book {
    title: string;
    author: string;
    publishDate: Date;
}
```

**Rust**

```rust
/// This is a book
struct Book {
    title: String,
    author: String,
    publish_date: DateTime<FixedOffset>
}
```

**Dart**

```dart
/// This is a book
class Book {
    final String title;
    final String author;
    final DateTime publishDate;
    const Book({
        required this.title,
        required this.author,
        required this.publishDate,
    });
}
```

**Kotlin**

```kotlin
/**
 * This is a book
 */
data class Book(
    val title: String,
    val author: String,
    val publishDate: Instant,
)
```

### ID Shorthand (Experimental)

Because IDs are really important for producing concise type names. Arri validate also provides an _experimental\*_ shorthand for defining IDs of objects, discriminators, and recursive types.

```ts
// ID will be set to "Book"
const BookSchema = a.object("Book", {
    title: a.string(),
    author: a.string(),
    publishDate: a.timestamp(),
});

// ID will be set to "Message"
const MessageSchema = a.discriminator("Message", "type", {
    TEXT: a.object({
        userId: a.string(),
        content: a.string(),
    }),
    IMAGE: a.object({
        userId: a.string(),
        imageUrl: a.string(),
    }),
});

// ID will be set to "BTree"
const BinaryTreeSchema = a.recursive("BTree", (self) =>
    a.object({
        left: a.nullable(self),
        right: a.nullable(self),
    }),
);
```

\* Because this is experimental it may be removed in the future. The main thing I'm testings is whether added convenience is worth the overhead of maintaining 2 versions of each of these functions. The shorthand could also introduce unintended confusion for users of this library as it creates two places to look for an id.

## Benchmarks

_Last Updated: 2024-03-19_

All benchmarks were run on my personal desktop. You can view the methodology used in [./benchmarks/src](./benchmark/src).

```txt
OS - Pop!_OS 22.04 LTS
CPU - AMD Ryzen 9 5900 12-Core Processor
RAM - 32GB
Graphics - AMD® Radeon rx 6900 xt
```

### Objects

The following data was used in these benchmarks. Relevant schemas were created in each of the mentioned libraries.

```ts
{
    id: 12345,
    role: "moderator",
    name: "John Doe",
    email: null,
    createdAt: 0,
    updatedAt: 0,
    settings: {
        preferredTheme: "system",
        allowNotifications: true,
    },
    recentNotifications: [
        {
            type: "POST_LIKE",
            postId: "1",
            userId: "2",
        },
        {
            type: "POST_COMMENT",
            postId: "1",
            userId: "1",
            commentText: "",
        },
    ],
};
```

#### Validation

| Library                      | op/s        |
| ---------------------------- | ----------- |
| **Arri (Compiled)**          | 122,753,978 |
| Typebox (Compiled)           | 63,131,651  |
| Ajv -JTD (Compiled)          | 37,814,896  |
| Ajv - JTD                    | 29,402,413  |
| Ajv - JSON Schema (Compiled) | 12,003,432  |
| Ajv -JSON Schema             | 10,057,501  |
| **Arri**                     | 2,131,823   |
| Typebox                      | 93,5599     |
| Zod                          | 52,1357     |

#### Parsing

| Library             | op/s    |
| ------------------- | ------- |
| JSON.parse          | 749,534 |
| **Arri (Compiled)** | 728,382 |
| **Arri**            | 378,175 |
| Ajv -JTD (Compiled) | 241,107 |

#### Serialization

| Library                                    | op/s      |
| ------------------------------------------ | --------- |
| **Arri (Compiled)**                        | 4,272,430 |
| **Arri (Compiled) Validate and Serialize** | 3,846,453 |
| Ajv - JTD (Compiled)                       | 2,012,894 |
| JSON.stringify                             | 938,289   |
| Arri                                       | 481,985   |

#### Coercion

| Library  | op/s    |
| -------- | ------- |
| **Arri** | 818,963 |
| Zod      | 466,092 |
| Typebox  | 209,363 |

### Integers

The following benchmarks measure how quickly each library operates on a single integer value.

#### Validation

| Library                      | op/s        |
| ---------------------------- | ----------- |
| Ajv - JSON Schema (Compiled) | 329,332,736 |
| **Arri (Compiled)**          | 201,644,167 |
| **Arri**                     | 186,634,732 |
| Ajv - JTD (Compiled)         | 151,044,902 |
| Typebox (Compiled)           | 110,692,029 |
| Ajv - JTD                    | 48,200,004  |
| Ajv - JSON Schema            | 47,840,571  |
| Typebox                      | 42,363,980  |
| Zod                          | 1,266,268   |

#### Parsing

| Library              | op/s        |
| -------------------- | ----------- |
| **Arri (Compiled)**  | 138,189,123 |
| **Arri**             | 136,995,619 |
| JSON.parse()         | 19,911,721  |
| Ajv - JTD (Compiled) | 8,996,081   |

#### Serialization

| Library              | op/s        |
| -------------------- | ----------- |
| Ajv - JTD (Compiled) | 198,980,679 |
| **Arri (Compiled)**  | 190,386,426 |
| **Arri**             | 114,799,692 |
| JSON.stringify       | 21,433,854  |

#### Coercion

| Library           | op/s        |
| ----------------- | ----------- |
| Arri              | 117,854,219 |
| TypeBox           | 34,633,126  |
| Ajv - JSON Schema | 28,016,735  |
| Zod               | 1,586,546   |

## Development

### Building

Run `nx build @arrirpc/schema` to build the library.

### Running unit tests

Run `nx test @arrirpc/schema` to execute the unit tests via Vitest

### Benchmarking

Run `nx benchmark @arrirpc/schema` to execute benchmarks
