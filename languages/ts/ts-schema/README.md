# Arri Schema

A Typescript validator and schema builder that can be compiled to other languages. A lot of inspiration was taken from both [Typebox](https://github.com/sinclairzx81/typebox) and [Zod](https://github.com/colinhacks/zod) when designing this library. This library also supports [standard-schema](https://github.com/standard-schema/standard-schema) meaning it can be used with any third-party library that accepts standard schema.

Under the hood this library constructs [Arri Type Definitions (ATD)](/specifications/arri_type_definition.md). These definitions can be passed to the [Arri CLI](/tooling/cli//README.md) to generate code for any of the client languages that Arri supports. Lastly, this library also comes with a [JIT compiler](#compiled-validators) which produces precompiled validators that are more than 100x faster than Zod.

## Project Philosophy

The goals of this project are as follows:

- Portable type definitions
- High performance validation, parsing, and serialization
- Consistent error reporting for parsing and serialization errors

I am not looking to support every feature of Typescript's type system or even every possible representation of JSON. The goal is that the data models defined through this library can be used as a source of truth across multiple programming languages. Both JSON and Typescript have to be limited to accomplish this.

### Adherence to RFC 8927

Originally this library was created as a way for building schemas for [Json Type Definition](https://jsontypedef.com/). However over time parts of the internal schema were modified to better suite the goals of Arri RPC. Some of these modifications include:

- Adding support for 64-bit integers
- Replacing the `additionalProperties` field with `strict` to allow for additional properties by default.
- Restrict `ref` to only be used for recursive references.

## Table of Contents

- [Installation](#installation)
- [Basic Example](#basic-example)
- [Usage with @arrirpc/server](#usage-with-arrirpcserver)
- [Compiling to other languages](#compiling-to-other-languages)
- [Supported Types](#supported-types)
    - [Primitives](#primitives)
    - [Enums](#enums)
    - [Arrays / Lists](#arrays--lists)
    - [Objects](#objects)
    - [Records / Maps](#records--maps)
    - [Discriminated Unions](#discriminated-unions)
    - [Recursive Types](#recursive-types)
- [Modifiers](#modifiers)
    - [Optional](#optional)
    - [Nullable](#nullable)
    - [Extend](#extend)
    - [Omit](#omit)
    - [Pick](#pick)
    - [Partial](#partial)
- [Utilities](#utilities)
    - [Validate](#validate)
    - [Parse](#parse)
    - [Parse Unsafe](#parse-unsafe)
    - [Coerce](#coerce)
    - [Coerce Unsafe](#coerce-unsafe)
    - [Serialize](#serialize)
    - [Serialize Unsafe](#serialize-unsafe)
    - [Errors](#errors)
- [Metadata](#metadata)
- [Compiled Validators](#compiled-validators)
- [Benchmarks](#benchmarks)
- [Development](#development)

## Installation

```bash
# npm
npm install @arrirpc/schema

# pnpm
pnpm install @arrirpc/schema
```

## Basic Example

```ts
import { a } from '@arrirpc/schema';

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
a.validate(User, { id: '1', name: 'John Doe' });
// returns false
a.validate(User, { id: '1', name: null });

// outputs valid json
a.serialize(User, { id: '1', name: 'John Doe' });

// JIT compiled validator (faster but server-side only)
const $$User = a.compile(User);
$$User.validate({ id: '1', name: 'John Doe' });
$$User.parse(`{"id": "1", "name": "John Doe"}`);
$$User.serialize({ id: '1', name: 'John Doe' });
```

## Usage With @arrirpc/server

See [here](/languages/ts/ts-server/README.md) for full details.

```ts
import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

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

## Compiling To Other Languages

All schemas defined with this library can be compiled to other languages using the [Arri CLI](/tooling/cli/README.md).

### Install the Arri ClI

```bash
# npm
npm i --save-dev arri

# pnpm
pnpm i --save-dev arri
```

### Create Your Arri Config

```ts
import { defineConfig, generators } from 'arri';

export default defineConfig({
    generators: [
        // add your generators here
        generators.rustClient({
            // options
        }),
        generators.dartClient({
            // options
        }),
    ],
});
```

### Create And Export Your Schemas

Use the `createAppDefinition` helper to export your schemas for the Arri CLI.

```ts
// definitions.ts
import { createAppDefinition } from 'arri';
import { a } from '@arrirpc/schema';

const User = a.object('User', {
    id: a.string(),
    name: a.optional(string()),
    email: a.nullable(a.string()),
    createdAt: a.timestamp({ description: 'When the user was created' }),
    updatedAt: a.timestamp(),
});

export default createAppDefinition({
    definitions: {
        User,
    },
});
```

### Run the Code Generator

```bash
# npm
npx arri codegen ./definitions.ts

# pnpm
pnpm arri codegen ./definitions.ts
```

And your done. Now you can rerun this command whenever any of your schemas get updated.

### Example Output

```dart
// dart output

class User {
  final String id;
  final String? name;
  final String? email;
  /// when the user was created
  final DateTime createdAt;
  final DateTime updatedAt;
  const User({
     required this.id,
     this.name,
     required this.email,
     required this.createdAt,
     required this.updatedAt,
  });

  // implementation details
}
```

```rust
// rust output

pub struct User {
  id: String,
  name: String,
  name: Option<String>,
  email: Option<String>,
  // when the user was created
  created_at: DateTime<FixedOffset>,
  updated_at: DateTime<FixedOffset>,
}

impl ArriModel for User {
  // implementation details
}
```

```kotlin
// kotlin output

data class User(
  val id: String,
  val name: String?,
  val email: String? = null,
  /**
   * When the user was created
   */
  val createdAt: Instant,
  val updatedAt: Instance,
) {
  // implementation details
}
```

See [here](/README.md#client-generators) for a list of all officially supported language generators.

## Supported Types

### Primitives

| Arri Schema   | Typescript | Arri Type Definition  |
| ------------- | ---------- | --------------------- |
| a.any()       | any        | {}                    |
| a.string()    | string     | {"type": "string" }   |
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
const Status = a.enumerator(['ACTIVE', 'INACTIVE', 'UNKNOWN']);
type Status = a.infer<typeof Status>; // "ACTIVE" | "INACTIVE" | "UNKNOWN";

a.validate(Status, 'BLAH'); // false
a.validate(Status, 'ACTIVE'); // true
```

**Outputted ATD**

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
a.validate(MyList, ['hello', 'world']); // true
```

**Outputted ATD**

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

a.validate(User, {
    id: '1',
    email: 'johndoe@example.com',
    created: new Date(),
}); // true
a.validate(User, {
    id: '1',
    email: null,
    created: new Date(),
}); // false
```

**Outputted ATD**

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
    }
}
```

#### Strict Mode

By default @arrirpc/schema will ignore and strip out any additional properties when validating objects. If you want validation to fail when additional properties are present then modify the `strict` option.

```ts
const UserStrict = a.object(
    {
        id: a.string(),
        name: a.string(),
        created: a.timestamp(),
    },
    {
        strict: true,
    },
);

a.parse(UserStrict, {
    id: '1',
    name: 'johndoe',
    created: new Date(),
    bio: 'my name is joe',
}); // fails parsing because of the additional field "bio"
```

**Outputted ATD**

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
    "strict": true
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
    hello: 'world',
}); // false;
```

**Outputted ATD**

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
const Shape = a.discriminator('type', {
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
type ShapeTypeRectangle = a.inferSubType<Shape, 'type', 'RECTANGLE'>; // { type "RECTANGLE"; width: number; height: number; };
type ShapeTypeCircle = a.inferSubType<Shape, 'type', 'CIRCLE'>; // { type "CIRCLE"; radius: number; }

a.validate(Shape, {
    type: 'RECTANGLE',
    width: 1,
    height: 1.5,
}); // true
a.validate(Shape, {
    type: 'CIRCLE',
    radius: 5,
}); // true
a.validate(Shape, {
    type: 'CIRCLE',
    width: 1,
    height: 1.5,
}); // false
```

**Outputted ATD**

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
            }
        },
        "CIRCLE": {
            "properties": {
                "radius": {
                    "type": "float32"
                }
            }
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
        id: 'BinaryTree',
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

**Outputted ATD**

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

**Outputted ATD**

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

**Outputted ATD**

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
    { id: 'A' },
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

const B = a.omit(A, ['a']);
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

const B = a.pick(A, ['a', 'c']);
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
a.validate(User, { id: '1', name: 'john doe' }); // true

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

// returns Result<User>
const result = a.parse(User, jsonString);
if (result.success) {
    // something when wrong with parsing
    console.log(result.errors);
} else {
    // parsing was successful
    console.log(result.value);
}
```

### Parse Unsafe

Alternate version to `parse()` that will throw a `ValidationException` if parsing fails.

```ts
const User = a.object({
    id: a.string(),
    name: a.string(),
});

// can throw an error
const result = a.parseUnsafe(User, jsonString);
console.log(result);
```

### Coerce

`a.coerce()` will attempt to convert inputs to the correct type. Returns a `Result<T>`

```ts
const A = a.object({
    a: a.string(),
    b: a.boolean(),
    c: a.float32(),
});

a.coerce(A, {
    a: '1',
    b: 'true',
    c: '500.24',
});
// { success: true, value: { a: '1', b: true, c: 500.24 } };
```

### Coerce Unsafe

`a.coerceUnsafe()` is an alternative to `a.coerce()` that will throw an error if coercion fails

```ts
const A = a.object({
    a: a.string(),
    b: a.boolean(),
    c: a.float32(),
});

a.coerceUnsafe(A, someInput); // returns T but can throw an error
```

### Serialize

`a.serialize()` will take an input and serialize it to a valid JSON string. This returns `Result<string>`

```ts
const User = a.object({
    id: a.string(),
    name: a.string(),
});

const result = a.serialize(User, { id: '1', name: 'john doe' });
if (result.success) {
    console.log(result.value);
    // '{"id":"1","name":"john doe"}''
}
```

Be aware that this function does not validate the input. So if you are passing in an any or unknown type into this function it is recommended that you validate it first.

### Serialize Unsafe

`a.serializeUnsafe()` is an alternative to `a.serialize()` that returns a JSON string, but can throw an error.

```ts
const User = a.object({
    id: a.string(),
    name: a.string(),
});

const result = a.serialize(User, { id: '1', name: 'john doe' }); // might throw an error
// '{"id":"1","name":"john doe"}''
```

Be aware that this function does not validate the input. So if you are passing in an any or unknown type into this function it is recommended that you validate it first.

### Errors

Use `a.errors()` to get all of the validation errors of a given input.

```ts
const User = a.object({
    id: a.string(),
    date: a.timestamp(),
});

a.errors(User, { id: 1, date: 'hello world' });
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

## Metadata

Metadata is used during cross-language code generation. Arri schemas allow you to specify the following metadata fields:

- id - Will be used as the type name in any arri client generators
- description - Will be added as a description comment above any generated types
- isDeprecated - Will mark any generated code with the deprecation annotation of target language

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
        id: 'Book',
        description: 'This is a book',
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

### ID Shorthand

Because IDs are really important for producing concise type names. Arri validate also provides shorthand for defining IDs of objects, discriminators, and recursive types.

```ts
// ID will be set to "Book"
const BookSchema = a.object('Book', {
    title: a.string(),
    author: a.string(),
    publishDate: a.timestamp(),
});

// ID will be set to "Message"
const MessageSchema = a.discriminator('Message', 'type', {
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
const BinaryTreeSchema = a.recursive('BTree', (self) =>
    a.object({
        left: a.nullable(self),
        right: a.nullable(self),
    }),
);
```

## Compiled Validators

`@arrirpc/schema` comes with a high performance JIT compiler that transforms Arri Schemas into highly optimized validation, parsing, coercion, and serialization functions. The result of the compilation also implements the [standard-schema](https://github.com/standard-schema/standard-schema) interface, meaning it can be passed into any library that accepts standard-schema.

```ts
const User = a.object({
    id: a.string(),
    email: a.nullable(a.string()),
    created: a.timestamp(),
});

const $$User = a.compile(User);

$$User.validate(someInput);
$$User.parse(someJson);
$$User.parseUnsafe(someJson);
$$User.coerce(someObject);
$$User.coerceUnsafe(someObject);
$$User.serialize({ id: '1', email: null, created: new Date() });
$$User.serializeUnsafe({ id: '1', email: null, created: new Date() });
```

In most cases, the compiled validators will be much faster than the standard utilities. However there is some overhead with compiling the schemas so ideally each validator would be compiled once. Additionally the resulting methods are created using [`new Function()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function) so they can only be used in an environment that you control such as a backend server. They WILL NOT work in a browser environment.

You can also use `a.compile` for code generation. Passing `true` as the second parameter will ensure that the compile result gives you access to the generated function bodies. This is disabled by default as of `v0.76.0` in order to reduce unwanted memory usage. (No need to carry around these large strings if they aren't going to be used.)

```ts
// pass true to the second parameter to get access to the generated function bodies
const $$User = a.compile(User, true);

$$User.compiledCode.validate; // the generated validation code
$$User.compiledCode.parse; // the generated parsing code
$$User.compiledCode.coerce; // the generated coercion code
$$User.compiledCode.serialize; // the generated serialization code
```

## Benchmarks

_Last Updated: 2025-03-19T21:46:43.732Z_
_Last Updated: 2024-12-27_

All benchmarks were run on my personal desktop. You can view the methodology used in [./benchmarks/src](./benchmark/src).

```txt
OS - Pop!_OS 22.04 LTS
CPU - AMD Ryzen 9 5900 12-Core Processor
RAM - 32GB
Graphics - AMD® Radeon rx 6900 xt
```

<!-- BENCHMARK_START -->

### Objects

The following type was used in these benchmarks. Equivalent schemas were created in each of the mentioned libraries.

```ts
interface TestUser {
    id: number; // integer,
    role: 'standard' | 'admin' | 'moderator';
    name: string;
    email: string | null;
    createdAt: number; // integer
    updatedAt: number; // integer
    settings:
        | {
              preferredTheme: 'light' | 'dark' | 'system';
              allowNotifications: boolean;
          }
        | undefined;
    recentNotifications: Array<
        | {
              type: 'POST_LIKE';
              userId: string;
              postId: string;
          }
        | {
              type: 'POST_COMMENT';
              userId: string;
              postId: string;
              commentText: string;
          }
    >;
}
```

#### Object Validation - Good Input

| Library                               | op/s       |
| ------------------------------------- | ---------- |
| **Arri (Compiled)**                   | 54,124,628 |
| TypeBox (Compiled)                    | 42,197,488 |
| Ajv - JTD (Compiled)                  | 31,927,096 |
| Arktype                               | 29,595,516 |
| Typia                                 | 28,381,607 |
| **Arri (Compiled) - Standard Schema** | 18,826,632 |
| Ajv - JSON Schema (Compiled)          | 11,420,306 |
| Ajv - JTD                             | 11,368,094 |
| Ajv - JSON Schema                     | 8,370,741  |
| **Arri**                              | 2,732,305  |
| **Arri - Standard Schema**            | 757,117    |
| TypeBox                               | 733,853    |
| Valibot                               | 607,841    |
| Zod                                   | 467,553    |

#### Object Validation - Bad Input

| Library                               | op/s       |
| ------------------------------------- | ---------- |
| **Arri (Compiled)**                   | 63,206,923 |
| TypeBox (Compiled)                    | 47,209,177 |
| Typia                                 | 30,610,871 |
| Ajv - JTD (Compiled)                  | 25,543,957 |
| Ajv - JTD                             | 13,095,043 |
| **Arri (Compiled) - Standard Schema** | 8,184,643  |
| Ajv - JSON Schema (Compiled)          | 4,543,106  |
| **Arri**                              | 4,237,065  |
| Ajv - JSON Schema                     | 3,790,517  |
| TypeBox                               | 906,797    |
| **Arri - Standard-Schema**            | 794,635    |
| Valibot                               | 485,994    |
| Zod                                   | 321,011    |
| Arktype                               | 139,720    |

#### Object Parsing - Good Input

| Library                               | op/s    |
| ------------------------------------- | ------- |
| JSON.parse                            | 773,939 |
| JSON.parse + Typebox (Compiled)       | 746,709 |
| Typia (json.createValidateParse)      | 736,675 |
| JSON.parse + Arktype                  | 736,157 |
| **Arri (Compiled)**                   | 722,323 |
| **Arri (Compiled) - Standard Schema** | 711,010 |
| **Arri - Standard Schema**            | 348,920 |
| **Arri**                              | 348,467 |
| JSON.parse + Valibot                  | 314,205 |
| JSON.parse + Zod                      | 280,872 |
| Ajv - JTD (Compiled)                  | 261,253 |
| JSON.parse + Typebox                  | 215,239 |

#### Object Parsing - Bad Input

| Library                               | op/s    |
| ------------------------------------- | ------- |
| JSON.parse                            | 871,925 |
| **Arri (Compiled)**                   | 796,037 |
| **Arri (Compiled) - Standard Schema** | 728,394 |
| Typia (json.createValidateParse)      | 556,550 |
| **Arri**                              | 415,938 |
| **Arri - StandardSchema**             | 395,654 |
| Ajv - JTD (Compiled)                  | 332,767 |
| JSON.parse + Valibot                  | 300,625 |
| JSON.parse + Zod                      | 215,862 |
| JSON.parse + Arktype                  | 119,465 |
| JSON.parse + Typebox (Compiled)       | 96,386  |
| JSON.parse + Typebox                  | 77,921  |

#### Object Serialization

| Library                                      | op/s      |
| -------------------------------------------- | --------- |
| **Arri (Compiled)**                          | 4,342,282 |
| **Arri (Compiled) - Validate and Serialize** | 3,869,687 |
| Ajv - JTD (Compiled)                         | 2,100,923 |
| Typia                                        | 1,823,903 |
| JSON.stringify                               | 1,635,149 |
| Typia - Validate and Serialize               | 1,570,486 |
| **Arri**                                     | 471,954   |

#### Object Coercion

| Library             | op/s       |
| ------------------- | ---------- |
| **Arri (Compiled)** | 19,743,175 |
| **Arri**            | 787,241    |
| Zod                 | 442,329    |
| TypeBox             | 403,062    |

### Integers

The following benchmarks measure how quickly each library operates on a single integer value.

#### Int Validation

| Library                               | op/s        |
| ------------------------------------- | ----------- |
| Ajv - JTD (Compiled)                  | 192,026,130 |
| TypeBox (Compiled)                    | 190,783,837 |
| **Arri (Compiled)**                   | 188,138,821 |
| Ajv - JSON Schema (Compiled)          | 182,920,826 |
| **Arri - Standard Schema**            | 110,055,872 |
| **Arri (Compiled) - Standard Schema** | 109,070,056 |
| **Arri**                              | 81,658,732  |
| Typia                                 | 61,029,032  |
| Arktype                               | 54,370,348  |
| TypeBox                               | 48,673,070  |
| Ajv - JTD                             | 31,204,944  |
| Ajv - JSON Schema                     | 31,075,953  |
| Valibot                               | 23,309,004  |
| Zod                                   | 1,277,690   |

#### Int Validation (Bad Input)

| Library                               | op/s        |
| ------------------------------------- | ----------- |
| TypeBox (Compiled)                    | 190,126,454 |
| **Arri (Compiled)**                   | 189,172,106 |
| Ajv - JSON Schema (Compiled)          | 75,375,601  |
| Ajv - JTD (Compiled)                  | 74,177,660  |
| Typia                                 | 58,363,051  |
| TypeBox                               | 45,205,805  |
| **Arri**                              | 42,222,871  |
| Ajv - JSON Schema                     | 19,876,104  |
| Ajv - JTD                             | 19,027,047  |
| **Arri (Compiled) - Standard Schema** | 17,164,858  |
| **Arri - Standard Schema**            | 12,296,640  |
| Valibot                               | 9,545,070   |
| Zod                                   | 799,307     |
| Arktype                               | 451,199     |

#### Int Parsing (Good Input)

| Library              | op/s        |
| -------------------- | ----------- |
| **Arri (Compiled)**  | 130,550,378 |
| **Arri**             | 49,495,612  |
| JSON.parse()         | 17,843,485  |
| Ajv - JTD (Compiled) | 9,664,631   |

#### Int Parsing (Bad Input)

| Library              | op/s       |
| -------------------- | ---------- |
| **Arri (Compiled)**  | 60,596,060 |
| JSON.parse()         | 11,390,955 |
| **Arri**             | 10,151,546 |
| Ajv - JTD (Compiled) | 8,524,414  |

#### Int Serialization

| Library                                      | op/s        |
| -------------------------------------------- | ----------- |
| **Arri (Compiled)**                          | 199,750,275 |
| **Arri (Compiled) - Validate and Serialize** | 190,585,727 |
| Ajv - JTD (Compiled)                         | 188,008,270 |
| Typia                                        | 108,341,757 |
| **Arri**                                     | 62,210,662  |
| Typia - Validate and Serialize               | 45,562,047  |
| JSON.stringify                               | 16,575,449  |

#### Int Coercion (Good Input)

| Library           | op/s       |
| ----------------- | ---------- |
| **Arri**          | 51,421,819 |
| TypeBox           | 35,333,297 |
| Ajv - JSON Schema | 21,583,903 |
| Zod               | 1,239,520  |

#### Int Coercion (Bad Input)

| Library           | op/s       |
| ----------------- | ---------- |
| **Arri**          | 10,442,645 |
| TypeBox           | 7,919,097  |
| Ajv - JSON Schema | 5,867,676  |
| Zod               | 737,348    |

<!-- BENCHMARK_END -->

## Development

### Building

Run `nx build @arrirpc/schema` to build the library.

### Running unit tests

Run `nx test @arrirpc/schema` to execute the unit tests via Vitest

### Benchmarking

Run `nx benchmark @arrirpc/schema` to execute benchmarks
