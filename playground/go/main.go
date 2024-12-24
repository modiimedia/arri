package main

import (
	"fmt"
	"net/http"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

func main() {
	app := arri.NewApp(http.DefaultServeMux, arri.AppOptions[arri.DefaultEvent]{}, arri.CreateDefaultEvent)
	arri.Rpc(&app, SayHello, arri.RpcOptions{})
	app.Run(arri.RunOptions{})
}

type SayHelloParams struct {
	Name string
}

type SayHelloResponse struct {
	Message string `enum:"HELLO,WORLD" enumName:"MESSAGE"`
}

func SayHello(params SayHelloParams, event arri.DefaultEvent) (SayHelloResponse, arri.RpcError) {
	return SayHelloResponse{Message: fmt.Sprintf("Hello %s", params.Name)}, nil
}
