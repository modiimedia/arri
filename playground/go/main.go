package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/modiimedia/arri"
)

func main() {
	app := arri.NewApp(http.DefaultServeMux, arri.AppOptions[arri.DefaultContext]{}, arri.CreateDefaultContext)
	arri.Rpc(&app, SayHello, arri.RpcOptions{})
	arri.EventStreamRpc(&app, SayHelloStream, arri.RpcOptions{Method: arri.HttpMethodGet})
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
func SayHelloStream(params SayHelloParams, controller arri.SseController[SayHelloResponse], ctx arri.DefaultContext) arri.RpcError {
	t := time.NewTicker(time.Second * 1)
	controller.SetPingInterval(time.Millisecond * 500)
	defer t.Stop()
	for {
		select {
		case <-t.C:
			controller.Push(SayHelloResponse{Message: "Hello " + params.Name})
		case <-controller.Done():
			return nil
		}
	}
}

type Shape struct {
	arri.DiscriminatorKey `discriminatorKey:"shapeType"`
	*Rectangle            `discriminator:"RECTANGLE"`
	*Circle               `discriminator:"CIRCLE"`
}

type Rectangle struct {
	Width  float64
	Height float64
}

type Circle struct {
	Radius float64
}
