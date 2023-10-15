# JSON Type Definition Notes

This is a document outline how I'm using JSON Type Definition as a way to create universal type definitions that can be shared across multiple languages. Generally speaking, I've been very pleased with the specification and find it to be vastly superior to JSON Schema which unfortunately has industry-wide adoption. I think there's also a compelling number of cases where I'd opt for JSON Type Def + JSON over a binary format like protobufs just because of how simple JSON is.

If you're curious you can view the source code for this project [here](https://github.com/modiimedia/arri/tree/feature/migrate-to-jtd). There's also a beta release on npm. Although it's still pretty experimental. (Even though I'm using versions of it in production already LOL)

```bash
npm install arri@beta arri-validate@beta
```

## Background

### Arri RPC

I'm building an RPC framework, tentatively called "arri-rpc". The basics of how it works is that the server automatically produces an App Definition file based on what RPCs have been defined in the application. The App Definition is a JSON file that acts similarly to an Open API Specification but lists procedures instead of endpoints. It's also way more constrained making it easier to create code generators that are more reliable and of higher quality than the kind provided by the Open API ecosystem. (JSON Type Definition helps a lot with this part)

You define a RPC like this:

```ts
import { ArriApp } from "arri";
import { a } from "arri-validate";

const app = new ArriApp();

app.rpc("sayHello", {
    // specify the input and response using arri validate
    // arri validate handles parsing and serializing, while also acting as a helper for generating JSON Type Definitions
    params: a.object({
        name: a.string(),
    }),
    response: a.object({
        message: a.string(),
    }),
    // this is how to handle the request
    handler({ params }) {
        return {
            message: `Hello ${params.name}`,
        };
    },
});
```

Which will produce an app definition file like this:

```json
{
    "arriSchemaVersion": "0.0.2",
    "procedures": {
        "sayHello": {
            "method": "post", // the HTTP method of the RPC
            "path": "/say-hello", // the path for the RPC's endpoint
            "params": "SayHelloParams", // the name of the param object model (this can also be undefined)
            "response": "SayHelloResponse", // the name of the response object model (this can also be undefined)
        },
    },
    // each model is a JSON Type Definition. Only object schemas are allowed here.
    "models": {
        "SayHelloParams": {
            "properties": {
                "name": {
                    "type": "string"
                }
            }
        },
        "SayHelloResponse": {
            "properties": {
                "message": {
                    "type": "string"
                }
            }
        }
    },
};
```

Using this App Definition the arri code-generators can generate clients for various languages. Here is what using the TS client would look like:

```ts
await client.sayHello({ name: "John" });
// returns { "message": "Hello John" }
```

You can also nest procedures into services like so:

```json
{
    "procedures": {
        "messages.sayHello": {
            "method": "post",
            "path": "/say-hello",
            "params": "SayHelloParams",
            "response": "SayHelloResponse"
        }
    }
}
```

Which will result in a client like this:

```ts
await client.messages.sayHello({ name: "John" });
// returns { message: string }
```

#### Automated Client Generation

Because the app has all the information needed to generated the app definition file, client generation can becoming part of the dev server (or the build process when building for prod). Basically when the dev server does a hot-reload it also automatically regenerates any of the specified clients. This gives you the experience of "hot-reload" even when working with clients from other languages. You don't have to think about the code-generation step anymore.

#### "File-Based" RPC Router

Arri-RPC also comes with an optional file-based router for your procedures. Basically any file in the `procedures` directory that ends with `.rpc.ts` automatically get's registered as an RPC.

So with a file structure like this:

```txt
src
|-- procedures
   |-- sayHello.rpc.ts
   |-- users
       |-- getUser.rpc.ts
       |-- updateUser.rpc.ts
```

You get clients that look like this:

```ts
await client.sayHello();
await client.users.getUser();
await client.users.updateUser();
```

Example `.rpc.ts` file:

```ts
// src/procedures/sayHello.rpc.ts
import { defineRpc } from "arri";

export default defineRpc({
    params: a.object({
        name: a.string(),
    }),
    response: a.object({
        message: a.string(),
    }),
    handler({ params }) {
        return {
            message: `Hello ${params.name}`,
        };
    },
});
```

### Arri Validate

The Arri-RPC server framework also makes use of arri Validate which is a typescript data-modeling and validation library similar to [Zod](https://github.com/colinhacks/zod) and [Typebox](https://github.com/sinclairzx81/typebox).

It produces valid JSON Type Definition Schemas and supports Typescript type inference so you can reuse the types throughout your codebase

Basic Usage:

```ts
import { a } from "arri-validate";

export const User = a.object({
    id: a.string(),
    name: a.string(),
    bio: a.optional(a.string()),
    createdAt: a.timestamp(),
});

// Produces a valid type that matches the model defined above
export type User = a.infer<typeof User>;

/** TYPE GUARDS **/
// returns true
a.validate(User, { id: "1", name: "John", createdAt: new Date() });
// returns false
a.validate(User, { id: 1 });
a.validate(User, null);

/** JSON PARSING **/
// returns a User
a.parse(
    User,
    '{"id":"1","name":"John","createdAt":"2023-10-15T01:43:53.634Z"}',
);
// throws a validation error
a.parse(User, '{"id": 1}');
a.parse(User, null);

/** JSON SERIALIZATION **/
a.serialize(User, { id: "1", name: "John", createdAt: new Date() });
```

Additionally if you `JSON.stringify` an Arri Validate schema you will get a valid JSON Type Definition.

This code:

```ts
JSON.stringify(User);
```

will output this JSON

```json
{
    "properties": {
        "id": {
            "type": "string"
        },
        "name": {
            "type": "string"
        },
        "createdAt": {
            "type": "timestamp"
        }
    },
    "optionalProperties": {
        "bio": {
            "type": "string"
        }
    }
}
```

Arri Validate supports all of the data types outlined in the JSON Type Definition specification. The only feature it does not support is "ref schemas" which I will explain later on.

## Issues with the JSON Type Definition Specification

The following are pain points I've encountered that have either made me want to diverge from the specification or made me rely on additional information being stored in the `metadata` property.

### 1) Inability To Reference Schemas

It's really common to reuse data models across an application, but JSON Type Definition doesn't have a mechanism for referencing other schemas. Let's say we have a setup like the following:

```ts
const User = a.object({
    id: a.string(),
    name: a.string(),
    createdAt: a.timestamp(),
});

const UserList = a.object({
    count: a.int32(),
    items: a.array(User), // The User type is being nested inside of UserList here
});
```

In the resulting JSON Type Definitions, the "User" schema will be duplicated, once by itself and once inside the UserList.items property.

```json
{
    // rest of app definition JSON
    "models": {
        "User": {
            "properties": {
                "id": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "createdAt": {
                    "type": "timestamp"
                }
            }
        },
        "UserList": {
            "properties": {
                "count": {
                    "type": "int32"
                },
                "items": {
                    "elements": {
                        // the User model has been duplicated here
                        "properties": {
                            "id": {
                                "type": "string"
                            },
                            "name": {
                                "type": "string"
                            },
                            "createdAt": {
                                "type": "timestamp"
                            }
                        }
                    }
                }
            }
        }
    }
}
```

I don't think the duplication is a huge deal since humans won't be manually writing these app definitions. My issue is when it comes to generating client code based on these schemas. Ideally, we would not want to make a completely new class/interface/struct for the array of Users we would want to just reference the first type that was already generated.

So instead of this:

```ts
interface User {
    id: string;
    name: string;
    createdAt: Date;
}

interface UserList {
    count: number;
    items: UserListItemsItem[];
}

// a new type has been created here
interface UserListItemsItem {
    id: string;
    name: string;
    createdAt: Date;
}
```

I want to generate this:

```ts
interface User {
    id: string;
    name: string;
    createdAt: Date;
}

interface UserList {
    count: number;
    items: User[]; // the already created type has been referenced
}
```

The closest solution is ["Ref" schemas](https://jsontypedef.com/docs/jtd-in-5-minutes/#ref-schemas) but those only let you reuse sub-schemas. You can't use it to reference a separate schema. Now, I understand why ref has been limited. In JSON-Schema, resolving refs is a huge pain and it behaves differently depending on the implementation.

#### My Current Solution

The way that I've worked around this is by adding the ability to put an `id` field in the schema metadata. With this method, data still gets duplicated but now if we encounter a unique id we can check if the typedef has been already generated or not.

Additionally, I've decided not to utilize or support "ref schemas" in Arri Validate for the time being as I don't think there's much use for it in a ts validation library. It feels like "ref" is mostly for people manually writing schemas rather than someone using a schema builder.

Here's the result when making use of `metadata.id`

```ts
const User = a.object(
    {
        id: a.string(),
        name: a.string(),
        createdAt: a.timestamp(),
    },
    {
        id: "User",
    },
);

const UserList = a.object({
    count: a.int32(),
    items: a.array(User),
});
```

```json
{
    // rest of app definition JSON
    "models": {
        "User": {
            "metadata": {
                // This is the first time we've seen this ID
                // So the type will be generated in the client
                "id": "User"
            },
            "properties": {
                "id": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "createdAt": {
                    "type": "timestamp"
                }
            }
        },
        "UserList": {
            "properties": {
                "count": {
                    "type": "int32"
                },
                "items": {
                    "elements": {
                        "metadata": {
                            // This ID has already been processed so type generation will be skipped
                            // Instead we will just reference the existing type
                            "id": "User"
                        },
                        "properties": {
                            "id": {
                                "type": "string"
                            },
                            "name": {
                                "type": "string"
                            },
                            "createdAt": {
                                "type": "timestamp"
                            }
                        }
                    }
                }
            }
        }
    }
}
```

This has been working well enough for my use cases, but I'm curious if you think there might be a better way to do it. It would be cool if we could standardize this sort of logic. I do think that the inability to reference other schemas does create a pain point, but my approach may not be the most streamlined solution.

### 2) Adding and Removing Fields

Let's say I have the following RPC

```ts
app.rpc("getPosts", {
    params: a.object({
        limit: a.uint8(),
        type: a.stringEnum(["text", "video", "image"]),
    }),
    response: a.object({
        count: a.uint8(),
        items: a.array(Post),
    }),
    async handler({ params }) {
        // rest
    },
});
```

If I decided, "hmm we don't need the type parameter anymore" and delete it, all existing clients be broken because they will still be sending the deleted "type" field.

```ts
app.rpc("getPosts", {
    // all existing clients will continue to send the "type" field meaning they will receive an error
    params: a.object({
        limit: a.uint8(),
    }),
    // rest of rpc
});
```

Now there's two spec compliant ways to get around this:

1.  Set `additionalProperties` to `true`
2.  Make the `type` field optional and then wait for all clients to be updated or potentially just keep the optional `type` field around forever even though it isn't being used.

```ts
app.rpc("getPosts", {
    params: a.object(
        {
            limit: a.uint8(),
        },
        {
            additionalProperties: true,
        },
    ),
    // rest of rpc
});

app.rpc("getPosts", {
    params: a.object({
        limit: a.uint8(),
        type: a.optional(a.stringEnum(["text", "video", "image"])),
    }),
    // rest of rpc
});
```

This isn't ideal in my personal view, because it creates more mental overhead to keep track of when altering your parameters, and I would prefer that the framework could smartly handle these sorts of things by default. Nonetheless, it does solve the issue.

However we run into another issue, this time concerning the RPC response. What happens if we add a field to the response?

```ts
app.rpc("getPosts", {
    response: a.object({
        total: a.uint32(), // new field
        count: a.uint8(),
        items: a.array(Post),
    }),
    // rest of rpc
});
```

Well the default behavior outlined by the JSON Type Definition is that an error should be thrown if there are any additional properties not specified in the schema. That means when modifying your api, adding **ANY** field to **ANY** schema will potentially break every client. Even if you set the new field as optional it will break those clients, because they don't have the updated schema yet. (This is less an issue for web clients and more an issue for native clients like mobile where you have less control over when users get updates)

Now the spec compliant solution would be similar. Just set `additionalProperties` to `true` on any objects that you think you will be modified in the future. But that means you need to preemptively predict which objects might need properties added and if you miss one well then you are kind of screwed.

This brings me to what I believe is the central issue. **JSON Type Definition's default behavior is too strict when it comes to additional properties**. In my opinion, it would be far better if the spec just ignored properties not specified in the schema by default. With this approach, you are the least likely to accidentally introduce breaking changes when adding fields.

For example in JSON-Schema (and I _really_ dislike JSON-Schema btw) this is the default behavior. This makes adding fields to a response trivial, and usually this is the best way to handle backwards compatibility. You add a new field to the response, and mark the old one as deprecated until you feel it's safe to delete (or just never delete it haha...).

When working with protobufs you get similar behavior

```proto
// user.proto
syntax = "proto3"

// initial model
message User {
  string id = 1;
  string name = 2;
  uint64 createdAt = 3;
}

// modified model
message User {
  string id = 1;
  string name = 2;
  uint64 createdAt = 3;
  // old clients will just ignore this new field
  string bio = 4;
}
```

Actually with protobufs v3 you can delete old fields too so long as you don't reuse that field number.

```proto
syntax = "proto3"
// deleting the name field doesn't break anything
message User {
    string id = 1;
    uint64 createdAt = 3;
}
```

I know that that isn't really practical for a JSON based API unless you force every field to be optional, but it's still pretty cool.

#### My Solution

Because of these pain points I've been leaning towards just ignoring additional fields by default.

So Arri Validate would behave like this:

```ts
/** DEFAULT: ignore additional fields **/
const User = a.object({
    id: a.string(),
    name: a.string(),
});

// will return a User object with "bio" being stripped from the result
a.parse('{"id": "1", "name": "John", "bio": "hello world"');

/** Additional Properties: Do not ignore additional fields **/
const User = a.object(
    {
        id: a.string(),
        name: a.string(),
    },
    {
        additionalProperties: true,
    },
);

// will return a User object and "bio" will NOT be stripped from the result
a.parse('{"id": "1", "name": "John", "bio": "hello world"}');
```

This will probably work for my use case but this means I am diverging from the specification. An alternative solution would be to have Arri Validate set `additionalProperties` to `true` by default. But I think that's less clean, and it also means that every single inferred type would be something like this by default:

```ts
type User = {
    id: string;
    name: string;
    createdAt: Date;
} & Record<string, any>;
```

Which is ugly imho

##### Other Benefits of Ignoring Additional Fields

There is another benefit to ignoring additional fields as well and that's serialization and validation performance. If we have to check for additional fields that means we have to iterate over every key and sub-key just in case there's something not specified in the schema. But if we ignore additional keys we know exactly what fields to check so we can serialize and validate much quicker.

Right now Arri Validate comes with an experimental compiler that ignores additional keys by default. I'm not using it in production yet because it still breaks when running into certain schema combinations.

However as of right now it can serialize objects more than 2x faster than `JSON.stringify`.

```ts
const User = a.object({
    id: a.string(),
    name: a.string(),
    createdAt: a.timestamp(),
});

const UserValidator = a.compile(User);

UserValidator.serialize({ id: "1", name: "John", createdAt: new Date() });
```

The compiled validator can also validates objects much faster than competing libraries

```ts
const User a.object({
    id: a.string(),
    name: a.string(),
    createdAt: a.timestamp(),
})

// standard
a.validate(User, {id: "1", name: "John", createdAt: new Date()})

// compiled
const UserValidator = a.compile(User);
UserValidator.validate({id: "1", name: "John", createdAt: new Date()});
```

In the benchmarks I was running Arri Validate was getting the following numbers:

-   Uncompiled - 1,116,030 operations/sec
-   Compiled - 63,466,073 operations/sec

Which was much faster compared to other popular libraries:

-   Zod - 188,990 operations/sec
-   TypeBox - 313,026 operations/sec
-   TypeBox (Compiled) - 28,139,350 operations/sec
-   AJV - 2,989,452 operations/sec
-   AJV (Compiled) - 3,265,963 operations/sec

### 3) No Support For Larger Integers

Currently JSON Type Definition cannot be used in systems that require large integers. A common example is financial systems which often use integers when calculating transactions.

I would really like to be able to support `int64` and `uint64`. Both of these are pretty common data types present in a lot of programming languages. For example `int64` and `uint64` could be mapped to the followed language data types:

| Language   | int64 Type    | uint64 Type            |
| ---------- | ------------- | ---------------------- |
| Javascript | BigInt        | BigInt                 |
| Dart       | BigInt        | BigInt                 |
| Rust       | i64           | u64                    |
| Go         | int64         | uint64                 |
| Kotlin     | Long          | ULong                  |
| Swift      | Int64         | Uint64                 |
| C++        | long long int | unsigned long long int |

When encoding to JSON, `int64` and `uint64` could be serialized to strings. This would provide the best cross-language compatibility since JS numbers can't handle numbers that large without losing precision. This is how Protobufs serialize these values if you use the optional JSON encoding (See the docs concerning [JSON mapping](https://protobuf.dev/programming-guides/proto3/#json)). I believe Cap'n Proto also does the same thing. So there is a precedent for this.

In Arri Validate, I would implement something like this:

```ts
const LargeInt = a.int64();
const LargeUint = a.uint64();
```

Which would produce the following schemas:

```json
{
    "type": "int64"
}
```

```json
{
    "type": "uint64"
}
```

I'm already of the mind to just go ahead with adding this sort of feature so I can make use of it, but it does mean that I'm now using a "superset" of JSON Type Definition rather than being spec compliant.

Generally speaking though I would like to advocate that adding support for larger integers is worthwhile and is in keeping with the stated design goals of JSON Type Definition.

#### Potential Downside

One potential downside is that it complicates the serialization process particularly in the Javascript. If I were to add this you would no longer be able to just `JSON.stringify` an object produced by JSON Type Def. You would have to implement a custom serializer, since `JSON.stringify` cannot natively handle `BigInt`. I don't think it's a big deal in my case since Arri Validate could take of this when calling `a.serialize`, but if someone else wanted to implement this they'd have to add that additional logic.

I also haven't done a huge exploration to know which languages (if any) would have a hard time supporting 64 bit integers.

## Future Plans

Right now, all of the tooling is in Typescript, but I am designing this framework in such a way that it could be ported to other languages. So long as the server is able to create an App Definition JSON file then it can make use of the Arri code generators.

I currently have code generators for:

-   Typescript
-   Dart
-   Kotlin (In-progress)

But when I get time I would like to add support for

-   Swift
-   Rust
-   Go
-   C++

Probably client languages as first priority (web, mobile, and gaming). Followed by others.

Also the only server implementation is Typescript, since that's what I'm using for most of my client projects. In the future, I would like to create another implementation in a higher performance language like rust or go.

Rust is particularly interesting to me because I could create a proc macro that automatically registers a function as an RPC and then use it in-conjunction with `serde` to automatically serialize and deserialize the response and parameters. A crate could also be made that integrates with `serde` which automatically creates a JSON Type Definition for the struct.

So in my head it would be something like this: (Haven't written rust in a while)

```rust
// auto implement JSON serialization/deserialization, and JSON Type Def schema generation
#[derive(Serialize, Deserialize, JsonTypeDef)]
struct SayHelloParams {
    name: String,
}

#[derive(Serialize, Deserialize, JsonTypeDef)]
struct SayHelloResponse {
    message: String,
}

// auto register this RPC and add the params and response schemas
// to the App Definition JSON
#[rpc("sayHello")]
fn say_hello(params: SayHelloParams) -> SayHelloResponse {
    SayHelloResponse { message: format!("Hello {}", params.name) }
}
```

## Closing Thoughts

Anyway that's how I'm using JSON Type Definition in this project. Hopefully, you can provide some insight as to whether you think it would be worth diverging from the spec or finding a way to remain spec compliant. (Or maybe it'd be worth altering the spec itself? IDK what work goes into that) In an ideal world we could settle on a standardized way to approach these issues, which is why I wanted to contact you.

Over time I hope more people adopt JSON Type Definition. After I discovered it myself, I decided to never use JSON Schema again - even if I have to write the tooling myself! (Which I guess I'm already doing....)
