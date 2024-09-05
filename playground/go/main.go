package main

import (
	arri "arri/languages/go/go-server"
	"fmt"
	"log"
	"net/http"
)

type MyCustomContext struct{}

func onRequest(r *http.Request, c MyCustomContext) *arri.ErrorResponse {
	fmt.Println("NEW REQUEST", r.URL.Path)
	return nil
}

func main() {
	mux := http.DefaultServeMux
	options := arri.AppOptions[MyCustomContext]{
		AppName:        "My Awesome App",
		AppVersion:     "1",
		AppDescription: "Hello",
		RpcRoutePrefix: "/procedures",
		OnRequest:      onRequest,
		OnError: func(r *http.Request, mcc *MyCustomContext, err error) {
			fmt.Println("NEW ERROR", r.URL.Path, err.Error())
		},
	}
	app := arri.NewApp(
		mux,
		options,
		// create the RPC context for each request
		// this is generic so users can user whatever struct they want for their context
		(func(r *http.Request) (*MyCustomContext, *arri.ErrorResponse) {
			return &MyCustomContext{}, nil
		}),
	)
	// register an RPC
	arri.Rpc(&app, GetUser)
	arri.Rpc(&app, DeleteUser)
	arri.RegisterDef(&app, arri.Message{})
	// register an RPC with a custom HTTP method and path
	arri.RpcWithOptions(&app, arri.RpcOptions{
		Method: arri.HttpMethodPatch,
		Path:   "/update-user",
	}, UpdateUser)
	appErr := app.Run(arri.RunOptions{})
	if appErr != nil {
		log.Fatal(appErr)
		return
	}
}

type UserParams struct {
	UserId string
}
type User struct {
	Id      string
	Name    arri.Option[string]
	Email   string
	IsAdmin bool
	Foo     string
}

func DeleteUser(params UserParams, context MyCustomContext) (*User, *arri.ErrorResponse) {
	return &User{Id: params.UserId, Name: arri.None[string]()}, nil
}

func GetUser(params UserParams, context MyCustomContext) (*User, *arri.ErrorResponse) {
	return &User{Id: params.UserId}, nil
}

func UpdateUser(params User, context MyCustomContext) (*User, *arri.ErrorResponse) {
	return &params, nil
}
