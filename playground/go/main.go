package main

import (
	"fmt"
	"net/http"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

type Props struct{}

func main() {
	app := arri.NewApp(http.DefaultServeMux, arri.AppOptions[Props]{
		OnRequest: func(req *arri.Request[Props]) arri.RpcError {
			req.SetResponseHeader("Access-Control-Allow-Origin", "*")
			return nil
		},
	})
	arri.Rpc(&app, SayHello, arri.RpcOptions{})
	app.Run(arri.RunOptions{})
}

type SayHelloParams struct {
	Name string
}

type SayHelloResponse struct {
	Message string
}

func SayHello(params SayHelloParams, req arri.Request[Props]) (SayHelloResponse, arri.RpcError) {
	return SayHelloResponse{Message: fmt.Sprintf("Hello %s", params.Name)}, nil
}
