_This is a work in progress_

# Arri Type Definition

This documents defines the Arri Type Definition (ATD) specification for Arri RPC. Currently ATD's are a modified version of [JSON Typedef](https://jsontypedef.com).

## Table of Contents

- [Goals](#goals)
- [Schema Forms](#schema-forms)
- [Global Keywords](#global-keywords)

## Goals

The primary goal of this specification is to provide a data format for describing data types in order to facilitate code generation. It should be portable, easy to parse, and make it easy to produce consistent results across programming languages.

ATD schemas are not intended to be written by hand. Their intended workflow is to be automatically produced from application code and then used as an input for outputting code in X languages.

## Schema Forms

Arri Type Definitions are JSON documents that can take on one of eight forms.

- The [empty form](#empty-schema-form)
- The [type form](#type-schema-form)
- The [enum form](#enum-schema-form)
- The [elements form](#elements-schema-form)
- The [properties form](#properties-schema-form)
- The [values form](#values-schema-form)
- The [discriminator form](#discriminator-schema-form)
- The [ref form](#ref-schema-form)

### "Empty" Schema Form

```json
{}
```

This schema form accepts any value, and rejects nothing. This is equivalent to `any` in typescript.

### "Type" Schema Form

This schema form is used to specify scalar value types. For example:

```json
{ "type": "boolean" }
```

Will accept `true` or `false`, and reject everything else.

The following is the list of all values that you can put for type:

| type      | What it accepts (When using JSON)                                             | Example                   |
| --------- | ----------------------------------------------------------------------------- | ------------------------- |
| boolean   | `true` or `false`                                                             | `true`                    |
| string    | JSON string                                                                   | "foo"                     |
| timestamp | JSON string containing an RFC3339 timestamp                                   | "1985-04-12T23:20:50.52Z" |
| float32   | JSON number                                                                   | 3.14                      |
| float64   | JSON number                                                                   | 3.14                      |
| int8      | Whole JSON numbers that fit in a signed 8-bit integer                         | 127                       |
| uint8     | Whole JSON numbers that fit in an unsigned 8-bit integer                      | 255                       |
| int16     | Whole JSON numbers that fit in a signed 16-bit integer                        | 32767                     |
| uint16    | Whole JSON numbers that fit in an unsigned 16-bit integer                     | 65535                     |
| int32     | Whole JSON numbers that fit in a signed 32-bit integer                        | 2147483647                |
| uint32    | Whole JSON numbers that fit in an unsigned 32-bit integer                     | 4294967295                |
| int64     | JSON string containing a whole number that fits in a signed 64-bit integer    | "9223372036854775807"     |
| uint64    | JSON string containing a whole number that fits in an unsigned 64-bit integer | "18446744073709551615"    |

### "Enum" Schema Form

The enum schema is used to say that something needs to be a string in a given list of strings. For example,

```json
{ "enum": ["FOO", "BAR", "BAZ"] }
```

Accepts only "FOO", "BAR", and "BAZ". Everything else is rejected.

You can only do an enum of strings.

### "Elements" Schema Form

This schema form is used to describe arrays. The value of the elements field is another ATD schema. For example,

```json
{ "elements": { "type": "string" } }
```

Accepts arrays where every element is a string. While

```json
{ "elements": { "type": "boolean" } }
```

Accepts arrays where every element is a boolean.

### "Properties" Schema Form

To describe objects use the "properties" schema. For example,

```json
{
    "properties": {
        "name": { "type": "string" },
        "isAdmin": { "type": "boolean" }
    }
}
```

Accepts objects that have a `name` property (of which the value must be a string) and an `isAdmin` property (of which the value must be a boolean). If the object has any _extra_ properties they are ignored. So both of the following JSON inputs will pass validation:

```json
{ "name": "Abraham Lincoln", "isAdmin": true }
{ "name": "Abraham Lincoln", "isAdmin": true, "extra": "stuff" }
```

But the following input is invalid:

```json
{ "name": "Abraham Lincoln", "isAdmin": "yes" }
```

#### Optional Properties

If it's OK for a property to be missing, then you can use `optionalProperties`:

```json
{
    "properties": {
        "name": { "type": "string" },
        "isAdmin": { "type": "boolean" }
    },
    "optionalProperties": {
        "middleName": { "type": "string" }
    }
}
```

If there's a `middleName` property on the object it must be a string. But if the `middleName` property isn't there, that's also OK. So both of these inputs are valid:

```json
{ "name": "Abraham Lincoln", "isAdmin": true }
{ "name": "Abraham Lincoln", "isAdmin": true, "middleName": "Tecumseh"}
```

However the following input is not valid:

```json
{ "name": "Abraham Lincoln", "isAdmin": true, "middleName": null }
```

#### Strict Mode

By default, **properties / optionalProperties** will accept inputs with "extra" properties not mentioned explicitly in the schema. If you need to reject inputs that have any properties not mentioned explicitly in the schema you can use **"isStrict": true**. For example:

```json
{
    "properties": {
        "name": { "type": "string" },
        "isAdmin": { "type": "boolean" }
    },
    "isStrict": true
}
```

Would reject:

```json
{ "name": "Abraham Lincoln", "isAdmin": true, "extra": "stuff" }
```

While:

```json
{
    "properties": {
        "name": { "type": "string" },
        "isAdmin": { "type": "boolean" }
    }
}
```

Would accept that same input

### "Values" Schema Form

To describe a record/dictionary, where you don't know the keys but you do know what type the values should have, use a "values" schema. The value of the **values** keyword is another ATD schema. For example,

```json
{ "values": { "type": "boolean" } }
```

Accepts objects where all the values are booleans. So it would acccept `{}` or `{"a": true, "b": false}`.

Be aware that only string keys are supported.

### "Discriminator" Schema Form

To describe objects that work like a tagged union (aka: "discriminated union", or "sum type"), use a "discriminator" schema.

A "discriminator" schema has two keywords:

- `discriminator` which tells you what property is the "tag" property
- `mapping` which tells you what schema to use, based on the value of the "tag" property.

For example, let's say you have messages that look like this:

```json
{ "eventType": "USER_CREATED", "id": "users/123" }
{ "eventType": "USER_CREATED", "id": "users/456" }
{ "eventType": "USER_PAYMENT_PLAN_CHANGED", "id": "users/789", "plan": "PAID" }
{ "eventType": "USER_PAYMENT_PLAN_CHANGED", "id": "users/123", "plan": "FREE" }
{ "eventType": "USER_DELETED", "id": "users/456", "softDelete": false }
```

There are three kinds of messages. `USER_CREATED` messages look like this:

```json
{
    "properties": {
        "id": { "type": "string" }
    }
}
```

`USER_PAYMENT_PLAN_CHANGED` messages look like this:

```json
{
    "properties": {
        "id": { "type": "string" },
        "plan": { "enum": ["FREE", "PAID"] }
    }
}
```

And `USER_DELETED` messages look like this:

```json
{
    "properties": {
        "id": { "type": "string" },
        "softDelete": { "type": "boolean" }
    }
}
```

With a "discriminator" schema, you can tie all three of those schemas together and tell ATD that you decide which on is relevant based on the value of `eventType`. So the final schema for our messages looks like this:

```json
{
    "discriminator": "eventType",
    "mapping": {
        "USER_CREATED": {
            "properties": {
                "id": { "type": "string" }
            }
        },
        "USER_PAYMENT_PLAN_CHANGED": {
            "properties": {
                "id": { "type": "string" },
                "plan": { "enum": ["FREE", "PAID"] }
            }
        },
        "USER_DELETED": {
            "properties": {
                "id": { "type": "string" },
                "softDelete": { "type": "boolean" }
            }
        }
    }
}
```

That schema would accept all of the messages in our example above. If the input doesn’t have a eventType property, or if the eventType property isn’t one of the three values mentioned in the mapping, then the input is rejected.

You can only use the ["Properties" Schema Form](#properties-schema-form) in the schemas you put directly in mapping. You can’t use any other kind of schema, otherwise things would become ambiguous.

### "Ref" Schema Form

The ref schema is used to close self-referential schemas in order to represent recursive types. The root parent of a ref schema must be a ["Properties" Schema Form](#properties-schema-form) or a ["Discriminator" Schema Form](#discriminator-schema-form). Additionally the root parent must have an `id` property in their metadata, or they must be defined at the root of the `definition` field. (See further down)

Having a recursive schema of a different form is invalid ATD. For example,

```json
{
    "properties": {
        "left": {
            "ref": "BinaryTree",
            "isNullable": true
        },
        "right": {
            "ref": "BinaryTree",
            "isNullable": true
        },
        "metadata": {
            "id": "BinaryTree"
        }
    }
}
```

Accepts

```json
{
    "left": {
        "left": {
            "left": null,
            "right": null
        },
        "right": null
    },
    "right": {
        "left": null,
        "right": null
    }
}
```

## Global Keywords

### The `isNullable` keyword

You can put `isNullable` on any schema (regardless of which "form" it takes), and that will make `null` an acceptable value for the schema.

For example,

```json
{ "type": "string", "isNullable": true }
```

Will accept `"foo"` and `null`

Note: you can't put `isNullable` on a schema in a [discriminator **mapping**](#discriminator-schema-form). If you want a discriminator to be nullable, you have to put it at the same level as the `discriminator` and `mapping` keywords.

### The `metadata` keyword

The `metadata` keyword is legal on any schema, and if it's present it has to be a JSON object. `metadata` has no affect on validation instead it is used to convey additional information to the target code generator(s). Arri has a few reserved in `metadata` keywords which have an explicit meaning. They are:

| key            | description                                                                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id             | A unique ID that will be used as the type name when running code generators. Used for "properties", "discriminator", and "enum" schemas only.                                      |
| description    | A string that will be added as a code comment in the target code generator                                                                                                         |
| isDeprecated   | A boolean that indicates that code generators should mark a field or type as "deprecate"                                                                                           |
| deprecatedNote | A string that will be added as a deprecation message by code generators if deprecation messages are supported by the target language. This should be used alongside `isDeprecated` |

Aside from those keywords there is no constraint on what you can put inside `metadata`

For example,

```json
{
    "properties": {
        "id": {
            "type": "string"
        },
        "name": {
            "type": "string"
        },
        "isAdmin": {
            "type": "boolean",
            "metadata": {
                "isDeprecated": true
            }
        }
    },
    "metadata": {
        "id": "User",
        "description": "This is a user"
    }
}
```

Will be tell the code generators to output Typescript like this:

```ts
/**
 * This is a user
 */
interface User {
    id: string;
    name: string;
    /**
     * @deprecated
     */
    isAdmin: boolean;
}
```

And rust like this:

```rust
// This is a user
pub struct User {
    pub id: String,
    pub name: String,
    #[deprecated]
    pub isAdmin: Boolean,
}
```
