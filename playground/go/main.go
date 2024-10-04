package main

import (
	"log"
	"net/http"

	arri "arrirpc.com/arri"
)

// extend this with custom properties
type AppContext struct{}

var mux = http.DefaultServeMux

func main() {
	app := arri.NewApp(
		mux,
		arri.AppOptions[AppContext]{
			RpcRoutePrefix: "/procedures",
		},
		(func(r *http.Request) (*AppContext, arri.RpcError) {
			ctx := AppContext{}
			return &ctx, nil
		}),
	)
	// register an RPC
	arri.Rpc(
		&app,
		SayHello,
		arri.RpcOptions{
			// manually specify the http method
			Method: arri.HttpMethodGet,
		},
	)
	arri.Rpc(&app, SayGoodbye, arri.RpcOptions{})

	appErr := app.Run(arri.RunOptions{Port: 3000})
	if appErr != nil {
		log.Fatal(appErr)
		return
	}
}

type GreetingParams struct {
	Name string
}
type GreetingResponse struct {
	Message string
}

func SayHello(params GreetingParams, context AppContext) (GreetingResponse, arri.RpcError) {
	return GreetingResponse{Message: "Hello " + params.Name}, nil
}

func SayGoodbye(params GreetingParams, context AppContext) (GreetingResponse, arri.RpcError) {
	return GreetingResponse{Message: "Goodbye " + params.Name}, nil
}
