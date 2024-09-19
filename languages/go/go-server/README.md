# Arri RPC - Go Server

Go implementation of [Arri RPC](/README.md). It uses the `net/http` package from the standard library, and can be used alongside other http libraries that make use of the standard `net/http` library.

## Table of Contents

-   [Usage](#usage)
    -   [Basic Example](#basic-example)
    -   [Defining Arri Models](#)

## Usage

### Basic Example

```go
package main

import (
    "arrirpc.com/arri"
)

// specify some app context that will be used in each request
type AppContext struct {
    IsLoggedIn bool
}

func main() {
    // creates a CLI app that accepts parameters for outputting an Arri app definition
	app := arri.NewApp(
		http.DefaultServeMux
		arri.AppOptions[AppContext]{},
        // function to create the your app context from the incoming http.Request
		(func(r *http.Request) (*AppContext, arri.RpcError) {
			ctx := AppContext{IsLoggedIn: false}
			return &ctx, nil
		}),
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

### Defining Arri Models

All Arri models are basic structs.
