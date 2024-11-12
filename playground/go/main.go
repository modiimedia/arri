package main

import (
	"fmt"
	"net/http"

	arri "github.com/modiimedia/arri/languages/go/go-server"
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
	Message string `enum:"HELLO,WORLD" enumName:"MESSAGE"`
}

func SayHello(params SayHelloParams, ctx arri.DefaultContext) (SayHelloResponse, arri.RpcError) {
	return SayHelloResponse{Message: fmt.Sprintf("Hello %s", params.Name)}, nil
}
