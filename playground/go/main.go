package main

import (
	"fmt"
	"net/http"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

type ReqData struct {
	UserId arri.Option[string]
}

func main() {
	app := arri.NewApp(arri.AppOptions[ReqData]{})
	httpAdapter := arri.NewHttpAdapter(http.DefaultServeMux, arri.HttpAdapterOptions[ReqData]{AllowedOrigins: []string{"*"}})
	arri.RegisterTransport(&app, httpAdapter)
	arri.Rpc(&app, SayHello, arri.RpcOptions{Method: "GET"})
	app.Start()
}

type SayHelloParams struct {
	Name string
}

type SayHelloResponse struct {
	Message string
}

func SayHello(params SayHelloParams, req arri.Request[ReqData]) (SayHelloResponse, arri.RpcError) {
	return SayHelloResponse{Message: fmt.Sprintf("Hello %s", params.Name)}, nil
}
