package main

import (
	"log"
	"net/http"

	arri "arrirpc.com/arri"
)

// extend this with custom properties
type AppContext struct {
	w http.ResponseWriter
	r *http.Request
}

func (c AppContext) Request() *http.Request {
	return c.r
}

func (c AppContext) Writer() http.ResponseWriter {
	return c.w
}

func CreateAppContext(w http.ResponseWriter, r *http.Request) (*AppContext, arri.RpcError) {
	ctx := AppContext{
		w: w,
		r: r,
	}
	return &ctx, nil
}

var mux = http.DefaultServeMux

func main() {
	app := arri.NewApp(
		mux,
		arri.AppOptions[AppContext]{
			RpcRoutePrefix: "/procedures",
		},
		CreateAppContext,
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
	arri.Rpc(&app, DoSomething, arri.RpcOptions{})

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

func SayHello(params GreetingParams, ctx AppContext) (GreetingResponse, arri.RpcError) {
	return GreetingResponse{Message: "Hello " + params.Name}, nil
}

func DoSomething(params GreetingParams, ctx AppContext) (GreetingResponse, arri.RpcError) {
	return GreetingResponse{}, nil
}

func SayGoodbye(params GreetingParams, ctx AppContext) (GreetingResponse, arri.RpcError) {
	return GreetingResponse{Message: "Goodbye " + params.Name}, nil
}
