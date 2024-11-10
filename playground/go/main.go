package main

import (
	"net/http"

	"github.com/modiimedia/arri"
)

func main() {
	app := arri.NewApp(http.DefaultServeMux, arri.AppOptions[arri.DefaultContext]{}, arri.CreateDefaultContext)
	arri.Rpc(&app, SayHello, arri.RpcOptions{})
	app.Run(arri.RunOptions{})
}

type SayHelloParams struct {
	Name string
}

type SayHelloResponse struct {
	Message string
}

func SayHello(params SayHelloParams, ctx arri.DefaultContext) (SayHelloResponse, arri.RpcError) {
	return SayHelloResponse{Message: "Hello " + params.Name}, nil
}
