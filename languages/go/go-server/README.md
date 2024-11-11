# Arri RPC - Go Server

Go implementation of [Arri RPC](/README.md). It uses the `net/http` package from the standard library, and can be used alongside other http libraries that make use of the standard `net/http` library.

## Table of Contents

-   [Quickstart](#quickstart)
-   [Basic Example](#basic-example)
-   [Creating HTTP Procedures](#creating-http-procedures)
-   [Creating Event Stream Procedures](#creating-event-stream-procedures)
-   [Defining Messages](#defining-messages)
    -   [Primitive Types](#primitive-types)
    -   [Enums](#enums)
    -   [Arrays and Slices](#arrays-and-slices)
    -   [Objects](#objects)
    -   [Maps](#maps)
    -   [Discriminated Unions / Tagged Unions](#discriminated-unions--tagged-unions)
    -   [Recursive Types](#recursive-types)
    -   [Optional Fields](#optional-fields)
    -   [Nullable Types](#nullable-types)

## Quickstart

```bash
# npm
npx arri init [project-name]
cd [project-name]
npm install
npm run dev

# pnpm
pnpm dlx arri init [project-name]
cd [project-name]
pnpm install
pnpm run dev
```

## Basic Example

```go
package main

import (
    "github.com/modiimedia/arri"
)

func main() {
    // creates a CLI app that accepts parameters for outputting an Arri app definition
	app := arri.NewApp(
		http.DefaultServeMux
		arri.AppOptions[arri.DefaultContext]{},
		arri.CreateDefaultContext,
	)

    // register procedures
    arri.Rpc(&app, SayHello, arri.RpcOptions{})
    arri.Rpc(&app, SayGoodbye, arri.RpcOptions{})

    // run the app on port 3000
	err := app.Run(arri.RunOptions{Port: 3000})
	if err != nil {
		log.Fatal(err)
		return
	}
}

// Procedure inputs and outputs must be structs
type GreetingParams struct { Name string }
type GreetingResponse struct { Message string }

// RPCs take 2 inputs and have two outputs
// The first input will be registered as the RPC params.
// The second input will be whatever type you have defined to be the AppContext
// The first output will be the OK response sent back to the client
// The second output will be the Error response sent back to the client
func SayHello(params GreetingParams, context AppContext) (GreetingResponse, arri.RpcError) {
    return GreetingResponse{ Message: "Hello " + params.name }, nil
}

func SayGoodbye(params GreetingParams, context AppContext) (GreetingResponse, arri.RpcError) {
    return GreetingResponse{ Message: "Goodbye " + params.name }, nil
}
```

## Creating HTTP Procedures

First create your RPC function

```go
type GreetingParams struct {
	Name string
}
type GreetingResponse struct {
	Message string
}

func SayHello(
	params GreetingParams,
	c arri.DefaultContext,
) (GreetingResponse, arri.RpcError) {
	return GreetingResponse{Message: fmt.SprintF("Hello %s", params.Name)}, nil
}
```

Then register it on the app instance

```go
// will create the following endpoint:
// POST "/say-hello"
arri.Rpc(&app, SayHello, arri.RpcOptions{})

// will create the following endpoint:
// "/greeter/say-hello"
// client generators will group this rpc under the "greeter" service
arri.ScopedRpc(&app, "greeter", SayHello, arri.RpcOptions{})
```

### Creating Event Stream Procedures

First create your Event Stream RPC function

```go
type GreetingParams struct {
	Name string
}
type GreetingResponse struct {
	Message string
}

// send an event every second
func StreamGreeting(
	params GreetingParams,
	controller arri.SseController[GreetingResponse],
	context arri.DefaultContext,
) arri.RpcError {
	t := time.NewTicker(time.Second)
	msgCount = 0
	defer t.Stop()
	for {
		select {
			case <-t.C:
				msgCount++
				controller.Push(GreetingResponse{Message: "Hello " + params.Name + " " + fmt.Sprint(msgCount)})
			case <-controller.Done():
				// exit when the connection closes
				return nil
		}
	}
}
```

Then register it on the App instance:

```go
// creates the following endpoint:
// POST /stream-greeting
arri.EventStreamRpc(&app, StreamGreeting, arri.RpcOptions{})

// creates the following endpoint:
// POST /greeter/stream-greeting
// client generators will group this rpc under the "greeter" service
arri.ScopedEventStreamRpc(&app, "greeter", StreamGreeting, arri.RpcOptions{})
```

#### The `SseController` Interface

```go
type SseController[T any] interface {
	// Push a new event to the client
	// Will return an RpcError if there was an issue with serializing the response
	Push(T) RpcError
	// Close the connection
	// If notifyClient is set to true then a "done" event will be sent to the client.
	// Spec compliant Arri clients will not auto-reconnect after receiving a "done" event
	Close(notifyClient bool)
	// Will fire when the connection has been closed either by the server or the client
	Done() <-chan struct{}
	// Change how often a "ping" event is sent to the client. Default is (10 seconds)
	SetPingInterval(time.Duration)
}
```

## Defining Messages

All parameters and responses are structs. Arri uses the Go reflect library to validate incoming requests based on these structs. It also automatically convert these structs into [Arri Type Definitions (ATD)](/specifications/arri_type_definition.md) which the client generators can use during client generation. This means you don't need to do any additional work to get type-safe clients.

For example this struct:

```go
type User struct {
	Id string
	Name string
	IsAdmin bool
}
```

will be converted to this

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
            "type": "boolean"
        }
    },
    "metadata": {
        "id": "User"
    }
}
```

which the TS client generator will use to create this: (See [here](/README.md#client-generators) for a complete list of generators)

```ts
export interface User {
    id: string;
    name: string;
    isAdmin: boolean;
}
```

### Primitive Types

The following primitive types are supported:

| Go        | Arri Type Definition (ATD) |
| --------- | -------------------------- |
| string    | {"type": "string"}         |
| bool      | {"type": "boolean"}        |
| time.Time | {"type": "timestamp"}      |
| float32   | {"type": "float32"}        |
| float64   | {"type": "float64"}        |
| int8      | {"type": "int8"}           |
| int16     | {"type": "int16"}          |
| int32     | {"type": "int32"}          |
| int64     | {"type": "int64"}          |
| int       | {"type": "int64"}          |
| uint8     | {"type": "uint8"}          |
| uint16    | {"type": "uint16"}         |
| uint32    | {"type": "uint32"}         |
| uint64    | {"type": "uint64"}         |
| uint      | {"type": "uint64"}         |

### Enums

Use the `enum` tag on `string` fields to define enums for the generated clients. Enums must be a `string`.

Also note that the first defined value will be treated as the default value by generated clients.

```go
type User struct {
	Id string
	Name string
	Role string `enum:"STANDARD,ADMIN"`
}
```

Outputted ATD:

```json
{
    "enum": ["STANDARD", "ADMIN"],
    "metadata": {
        "id": "UserRole"
    }
}
```

You can also manually defined the name of the enum in generated clients using the `enumName` tag

```go
type User struct {
	Id string
	Name string
	Role string `enum:"STANDARD,ADMIN" enumName:"Role"`
}
```

Outputted JTD:

```json
{
    "enum": ["STANDARD", "ADMIN"],
    "metadata": {
        "id": "Role"
    }
}
```

### Arrays and Slices

Both arrays and slices are supported

```go
[]string
```

Outputted ATD:

```json
{
    "elements": {
        "type": "string"
    }
}
```

### Objects

Arri supports structs so long as all the fields are one of arri's supported types

```go
type User struct {
    Id string
    Name string
}

type Post struct {
    Id string
    Author User     // nested structs are okay too
    Content string
}
```

#### Inlined Structs

Inline structs are supported so long as they aren't the root type in an RPC input/response

##### This is okay

```go
type PostParams {
    PostId string
}
type Post struct {
    Id string
    // nested inlined struct
    Author struct {
        Id string
        Name string
    }
}

func GetPost(params PostParams, c arri.DefaultContext) (Post, arri.RpcError) {
    // rpc content
}
```

##### This will cause a panic

```go
func GetPost(
    // inlined structs cannot go here
    params struct{PostId string},
    c arri.DefaultContext,
)
(
    // inlined structs cannot go here
    struct{
        Id string,
        Author struct{
            Id string,
            Name string,
        },
        Content string,
    },
    arri.RpcError,
) {
    // rpc content
}
```

### Maps

Arri supports maps with string keys. Attempting to use non-string keys for RPC inputs/outputs will cause a panic when the server starts.

Map values can be any of the supported go types.

```go
map[string]bool
```

outputted ATD:

```json
{
    "values": {
        "type": "boolean"
    }
}
```

### Discriminated Unions / Tagged Unions

Since go doesn't have discriminated unions we have created the following convention for defining such data types.

-   A discriminated union must have a root struct type which will act as the "parent" type
-   All "subtypes" are fields that contain a pointer to a struct. They can be either named structs or inlined.
-   All "subtype" fields must have the `discriminator` tag, which defines the value of the `"type"` field during serialization. Clients will use this value to determine which subtype has been sent by the server.

#### Example

Here we are creating a `Shape` parent type with the `Rectangle` and `Circle` type

```go
type Shape struct {
	Rectangle *Rectangle `discriminator:"RECTANGLE"`
	Circle *Circle `discriminator:"CIRCLE"`
}
type Rectangle struct {
	Width float32
	Height float32
}
type Circle struct {
	Radius float32
}

// The following are also valid
type Shape struct {
	*Rectangle `discriminator:"RECTANGLE"`
	*Circle `discriminator:"CIRCLE"`
}
type Shape struct {
	Rectangle struct{
		Width float32
		Height float32
	} `discriminator:"RECTANGLE"`
	Circle struct{
		Radius float32
	} `discriminator:"CIRCLE"`
}
```

Outputted JTD:

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
            "metadata": {
                "id": "Rectangle"
            }
        },
        "CIRCLE": {
            "properties": {
                "radius": {
                    "type": "float32"
                }
            },
            "metadata": {
                "id": "Circle"
            }
        }
    },
    "metadata": {
        "id": "Shape"
    }
}
```

The outputed JSON will look something like this:

```go
// initialize a rectangle shape
myShape := Shape{Rectangle: &Rectangle{Width: 10, Height: 20}}
// serialize to json
result, _ := arri.EncodeJSON(myShape, arri.KeyCasingCamelCase)
// print the result
fmt.Println(string(result))
```

```json
{
    "type": "RECTANGLE",
    "width": 10,
    "height": 20
}
```

#### Overriding discriminator field

By default arri will put the discriminator value in the "type" field for clients to determine when subtype has been sent.

```json
{
    "type": "RECTANGLE",
    "width": 10,
    "height": 20
}
{
	"type": "CIRCLE",
	"radius": 20
}
```

You can override this by using the `discriminatorKey` tag in conjunction with the `DiscriminatorKey` helper provided by arri

```go
type Shape struct {
	arri.DiscriminatorKey `discriminatorKey:"kind"`
	Rectangle *Rectangle `discriminator:"RECTANGLE"`
	Circle *Circle `discriminator:"CIRCLE"`
}
```

Now the outputted JSON will look something like this:

```json
{
	"kind": "RECTANGLE",
	"width": 10,
	"height": 20
}
{
	"kind": "CIRCLE",
	"radius": 20
}
```

### Recursive Types

Recursive types are supported so long as all of the field types are supported by arri

```go
type BinaryTree struct {
	Left: *BinaryTree
	Right: *BinaryTree
}
```

Outputted JTD:

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

### Optional Fields

By default arri treats all fields as required. You can define optional fields using the `arri.Option` type

```go
type User struct {
    Id string
    Name arri.Option[string]
    Email arri.Option[string]
}
```

Outputted ATD:

```json
{
    "properties": {
        "id": { "type": "string" }
    },
    "optionalProperties": {
        "name": { "type": "string" },
        "email": { "type": "string" }
    },
    "metadata": {
        "id": "User"
    }
}
```

Example outputted JSON:

```json
// with set optional values
{
    "id": "1",
    "name": "john doe",
    "email": "johndoe@gmail.com"
}

// with unset optional values
{
    "id": "1",
}
```

#### Working With `arri.Option`

```go
// initializing options
optionalString := arri.Some("hello world") // initialize optional with value
optionalString := arri.None[string]() // initialize optional with no value

// working with options
optionalString.Unwrap() // extract the inner value. panics if there is no value
optionalString.UnwrapOr("some-fallback") // extract the inner value if it exist. otherwise use the fallback
optionalString.IsSome() // returns true if inner value has been set
optionalString.IsNone() // returns true if inner value has not been set
optionalString.Set("hello world again") // update the inner value
optionalString.Unset() // unset the inner value
```

```go
type Option[T] interface {
    Unwrap() T bool
    Set(val T)
    Unset()
}
```

### Nullable Types

All pointers are treated as nullable with the exception of maps and arrays which will be serialized as empty objects and empty arrays respectively.

In cases where you don't want to use pointers you can use the `arri.Nullable` type.

```go
type User struct {
    Id string
    Name *string // this is treated as nullable during encoding/decoding
    Email arri.Nullable[string] // this is also treated as nullable during encoding/decoding
}
```

Outputted ATD:

```json
{
    "properties": {
        "id": {
            "type": "string"
        },
        "name": {
            "type": "string",
            "nullable": true
        },
        "email": {
            "type": "string",
            "nullable": true
        }
    },
    "metadata": {
        "id": "User"
    }
}
```

Example outputted JSON:

```json
// with set nullable values / set pointers
{
    "id": "1",
    "name": "john doe",
    "email": "johndoe@gmail.com"
}

// with unset nullable values / unset pointers
{
    "id": "1",
    "name": null,
    "email": null
}
```

#### Working with `arri.Nullable`

```go
// initializing nullable types
nullableString := arri.NotNull("hello world") // initialize nullable with value
nullableString := arri.Null[string]() // initialize nullable without value

// working with nullables
nullableString.Unwrap() // extract the inner value. panics if not set
nullableString.UnwrapOr("some-fallback") // extract the inner value if it exists. if it doesn't exists return the fallback
nullableString.IsNull() // returns true if null
nullableString.Set("hello world again") // update the inner value
nullableString.Unset() // unset the inner value
```
