package main

import (
	arri "arri/languages/go/go-server"
	"log"
	"net/http"
)

// extend this with custom properties
type AppContext struct{}

var mux = http.DefaultServeMux

func main() {
	options := arri.AppOptions[AppContext]{
		RpcRoutePrefix: "/procedures",
	}
	app := arri.NewApp(
		mux,
		options,
		(func(r *http.Request) (*AppContext, arri.RpcError) {
			ctx := AppContext{}
			return &ctx, nil
		}),
	)
	// register an RPC
	arri.RpcWithOptions(&app, arri.RpcOptions{Method: arri.HttpMethodGet}, SayHello)
	arri.Rpc(&app, SayGoodbye)

	appErr := app.Run(arri.RunOptions{})
	if appErr != nil {
		log.Fatal(appErr)
		return
	}
}

type SayHelloParams struct {
	FirstName string
	LastName  string
}
type SayHelloResponse struct {
	Message string
}

func SayHello(params SayHelloParams, context AppContext) (*SayHelloResponse, arri.RpcError) {
	return &SayHelloResponse{Message: "Hello " + params.FirstName + " " + params.LastName}, nil
}

type SayGoodbyeResponse struct {
	Message string
}

func SayGoodbye(_ arri.EmptyMessage, context AppContext) (*SayGoodbyeResponse, arri.RpcError) {
	return &SayGoodbyeResponse{Message: "Goodbye"}, nil
}
