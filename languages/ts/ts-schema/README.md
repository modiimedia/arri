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
- [Tree-Shakeable Imports](#tree-shakeable-imports)
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

// returns ResultSuccess<User>
a.parse(User, `{"id": "1", "name": "John Doe"}`);
// returns ResultFailure
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

## Tree-Shakeable Imports

For those that are concerned about bundle sizes you can use Arri's optional modular import syntax. This makes it so that bundlers can remove unused Arri functions from JS bundles at build time. You can also enforce this in your codebase using the [arri/prefer-modular-imports](/languages/ts/eslint-plugin/README.md) lint rule.

Using the modular import syntax Arri's bundle size can be as small as 4kb depending on how many functions you import.

```ts
// tree-shakeable (no `a` prefix)
import { string, boolean, object } from '@arrirpc/schema';
const User = object({
    id: string(),
    name: string(),
    isAdmin: boolean(),
});

// tree-shakeable (with `a` prefix)
import * as a from '@arrirpc/schema';
const User = a.object({
    id: a.string(),
    name: a.string(),
    isAdmin: a.boolean(),
});

// NOT tree-shakeable
import { a } from '@arrirpc/schema';
const User = a.object({
    id: a.string(),
    name: a.string(),
    isAdmin: a.boolean(),
});
```

Click [here](/languages/ts/ts-schema-benchmarks/README.md#bundle-size) to see how Arri Schema's bundle sizes compares to the rest of the ecosystem.

### Why isn't this the default?

Just personal preference. I find manually importing individual functions to be a bad developer experience.

```ts
// not a fan
import { foo, bar, baz } from 'foo';
```

Additionally, having an explicitly exported `a` namespace means that when I type `a.{something}` that the TS language server will autocomplete the available functions even if I haven't imported `@arrirpc/schema` yet. If we didn't have that explicit export, then you would not get autocomplete for `a.{something}` until you added the `import * as a` line to your file.

```ts
// this has to be added before you get autocomplete for `a.{whatever}`
import * as a from '@arrirpc/schema';
```

However I understand that keeping small bundle sizes can be important which is why I've allowed both options:

```ts
// if you care about bundle size use one of these two
import * as a from '@arrirpc/schema';
import { string, object, etc } from '@arrirpc/schema';

// if you aren't as particular about bundle sizes then use this
import { a } from '@arrirpc/schema';
```

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
 *   email?: string | undefined;
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

### Undefinable

This is similar to `a.optional()` except that when initializing the object the key will still be required.

```ts
const Foo = a.object({
    foo: a.undefinable(a.string()),
});
type Foo = a.infer<typeof Foo>;

const fooInstance: Foo = {
    // this field must still be present
    // while with a.optional() we could omit the key
    foo: undefined,
};
```

As far as parsing and validating goes this functions exactly the same as `a.optional()`.

```ts
const User = a.object({
    id: a.string(),
    email: a.undefinable(a.string()),
    date: a.timestamp();
})

/**
 * Resulting type (Notice how the email key is still required)
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

_Last Updated: 2025-06-09T18:41:32.823Z_

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
| **Arri (Compiled)**                   | 54,207,983 |
| TypeBox (Compiled)                    | 42,991,276 |
| Arktype                               | 28,628,730 |
| Typia                                 | 28,500,181 |
| **Arri (Compiled) - Standard Schema** | 19,420,723 |
| Ajv - JSON Schema (Compiled)          | 11,612,359 |
| Ajv - JSON Schema                     | 11,337,540 |
| Zod/v4                                | 3,080,359  |
| **Arri**                              | 2,719,630  |
| **Arri - Standard Schema**            | 760,346    |
| TypeBox                               | 720,807    |
| Valibot                               | 594,403    |
| Zod                                   | 463,499    |

#### Object Validation - Bad Input

| Library                               | op/s       |
| ------------------------------------- | ---------- |
| **Arri (Compiled)**                   | 60,871,312 |
| TypeBox (Compiled)                    | 47,747,764 |
| Typia                                 | 31,195,589 |
| **Arri (Compiled) - Standard Schema** | 8,314,141  |
| Ajv - JSON Schema (Compiled)          | 4,523,107  |
| Ajv - JSON Schema                     | 4,315,160  |
| **Arri**                              | 3,992,012  |
| TypeBox                               | 891,805    |
| **Arri - Standard-Schema**            | 757,845    |
| Valibot                               | 496,579    |
| Zod                                   | 352,986    |
| Arktype                               | 149,079    |
| Zod/v4                                | 100,355    |

#### Object Parsing - Good Input

| Library                               | op/s    |
| ------------------------------------- | ------- |
| JSON.parse                            | 801,513 |
| JSON.parse + Typebox (Compiled)       | 754,820 |
| **Arri (Compiled)**                   | 753,155 |
| JSON.parse + Arktype                  | 748,862 |
| **Arri (Compiled) - Standard Schema** | 745,964 |
| Typia (json.createValidateParse)      | 726,365 |
| JSON.parse + Zod/v4                   | 555,511 |
| **Arri**                              | 365,992 |
| **Arri - Standard Schema**            | 365,640 |
| JSON.parse + Valibot                  | 319,333 |
| JSON.parse + Zod                      | 285,161 |
| JSON.parse + Typebox                  | 215,169 |

#### Object Parsing - Bad Input

| Library                               | op/s    |
| ------------------------------------- | ------- |
| JSON.parse                            | 846,547 |
| **Arri (Compiled)**                   | 779,979 |
| **Arri (Compiled) - Standard Schema** | 718,259 |
| Typia (json.createValidateParse)      | 552,892 |
| **Arri**                              | 414,169 |
| **Arri (StandardSchema)**             | 391,092 |
| JSON.parse + Valibot                  | 289,960 |
| JSON.parse + Zod                      | 220,650 |
| JSON.parse + Arktype                  | 120,295 |
| JSON.parse + Typebox (Compiled)       | 99,136  |
| JSON.parse + Zod/v4                   | 80,506  |
| JSON.parse + Typebox                  | 77,380  |

#### Object Serialization

| Library                                      | op/s      |
| -------------------------------------------- | --------- |
| **Arri (Compiled)**                          | 3,984,935 |
| **Arri (Compiled) - Validate and Serialize** | 3,583,501 |
| Typia                                        | 1,793,677 |
| JSON.stringify                               | 1,645,335 |
| Typia - Validate and Serialize               | 1,540,510 |
| **Arri**                                     | 450,120   |

#### Object Coercion

| Library             | op/s       |
| ------------------- | ---------- |
| **Arri (Compiled)** | 19,370,221 |
| Zod/v4              | 2,267,229  |
| **Arri**            | 738,461    |
| Zod                 | 450,168    |
| TypeBox             | 403,602    |

### Integers

The following benchmarks measure how quickly each library operates on a single integer value.

#### Int Validation

| Library                               | op/s        |
| ------------------------------------- | ----------- |
| **Arri (Compiled)**                   | 188,029,099 |
| TypeBox (Compiled)                    | 186,595,706 |
| Ajv - JSON Schema (Compiled)          | 182,332,718 |
| **Arri (Compiled) - Standard Schema** | 108,964,372 |
| **Arri - Standard Schema**            | 108,193,957 |
| **Arri**                              | 84,093,924  |
| Typia                                 | 58,164,521  |
| Arktype                               | 57,782,710  |
| Ajv - JSON Schema                     | 50,350,825  |
| TypeBox                               | 46,450,527  |
| Valibot                               | 22,202,298  |
| Zod/v4                                | 18,948,463  |
| Zod                                   | 1,269,812   |

#### Int Validation (Bad Input)

| Library                               | op/s        |
| ------------------------------------- | ----------- |
| TypeBox (Compiled)                    | 188,306,861 |
| **Arri (Compiled)**                   | 186,071,486 |
| Ajv - JSON Schema (Compiled)          | 69,251,304  |
| Typia                                 | 60,060,635  |
| TypeBox                               | 44,860,799  |
| **Arri**                              | 39,998,319  |
| Ajv - JSON Schema                     | 25,013,168  |
| **Arri (Compiled) - Standard Schema** | 15,998,638  |
| **Arri - Standard Schema**            | 11,765,466  |
| Valibot                               | 9,831,763   |
| Zod                                   | 766,604     |
| Arktype                               | 439,401     |
| Zod/v4                                | 100,168     |

#### Int Parsing (Good Input)

| Library             | op/s        |
| ------------------- | ----------- |
| **Arri (Compiled)** | 136,350,248 |
| **Arri**            | 49,111,714  |
| JSON.parse()        | 21,047,855  |

#### Int Parsing (Bad Input)

| Library             | op/s       |
| ------------------- | ---------- |
| **Arri (Compiled)** | 60,790,411 |
| JSON.parse()        | 12,746,512 |
| **Arri**            | 9,824,069  |

#### Int Serialization

| Library                                      | op/s        |
| -------------------------------------------- | ----------- |
| **Arri (Compiled) - Validate and Serialize** | 194,120,420 |
| **Arri (Compiled)**                          | 186,143,375 |
| Typia                                        | 107,523,528 |
| **Arri**                                     | 59,302,746  |
| Typia - Validate and Serialize               | 47,194,163  |
| JSON.stringify                               | 17,049,686  |

#### Int Coercion (Good Input)

| Library           | op/s       |
| ----------------- | ---------- |
| **Arri**          | 50,428,605 |
| TypeBox           | 34,878,937 |
| Ajv - JSON Schema | 32,125,175 |
| Zod/v4            | 14,351,655 |
| Zod               | 1,197,013  |

#### Int Coercion (Bad Input)

| Library           | op/s       |
| ----------------- | ---------- |
| **Arri**          | 10,088,606 |
| TypeBox           | 8,117,032  |
| Ajv - JSON Schema | 6,979,847  |
| Zod               | 762,348    |
| Zod/v4            | 99,086     |

<!-- BENCHMARK_END -->

## Development

### Building

Run `nx build @arrirpc/schema` to build the library.

### Running unit tests

Run `nx test @arrirpc/schema` to execute the unit tests via Vitest

### Benchmarking

Run `nx benchmark @arrirpc/schema` to execute benchmarks
