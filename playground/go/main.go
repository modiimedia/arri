package main

import (
	"log"
	"net/http"

	arri "arrirpc.com/arri"
)

// extend this with custom properties
type RpcContext struct {
	writer  http.ResponseWriter
	request *http.Request
}

func (c RpcContext) Request() *http.Request {
	return c.request
}

func (c RpcContext) Writer() http.ResponseWriter {
	return c.writer
}

func CreateAppContext(w http.ResponseWriter, r *http.Request) (*RpcContext, arri.RpcError) {
	ctx := RpcContext{writer: w, request: r}
	return &ctx, nil
}

var mux = http.DefaultServeMux

func main() {
	app := arri.NewApp(
		mux,
		arri.AppOptions[RpcContext]{
			RpcRoutePrefix: "/procedures",
		},
		CreateAppContext,
	)
	// register an RPC
	arri.Rpc(
		&app,
		SayHello,
		arri.RpcOptions{Method: arri.HttpMethodGet}, // manually specify the http method

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

func SayHello(params GreetingParams, ctx RpcContext) (GreetingResponse, arri.RpcError) {
	return GreetingResponse{Message: "Hello " + params.Name}, nil
}

func SayGoodbye(params GreetingParams, ctx RpcContext) (GreetingResponse, arri.RpcError) {
	return GreetingResponse{Message: "Goodbye " + params.Name}, nil
}
