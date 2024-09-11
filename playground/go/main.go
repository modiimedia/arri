package main

import (
	arri "arri/languages/go/go-server"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type MyCustomContext struct {
	ReqId      string
	ReqStart   time.Time
	IsLoggedIn bool
}

func onRequest(r *http.Request, c *MyCustomContext) arri.RpcError {
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
		(func(r *http.Request) (*MyCustomContext, arri.RpcError) {
			ctx := MyCustomContext{
				ReqId:    uuid.New().String(),
				ReqStart: time.Now(),
			}
			return &ctx, nil
		}),
	)
	// register an RPC
	arri.ScopedRpcWithOptions(
		&app,
		"users",
		arri.RpcOptions{Method: arri.HttpMethodGet},
		GetUser,
	)
	arri.ScopedRpc(&app, "users", DeleteUser)
	arri.ScopedRpc(&app, "users", UpdateUser)
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
	Id        string
	Name      arri.Nullable[string]
	Email     string
	IsAdmin   bool
	CreatedAt time.Time
}

func DeleteUser(params UserParams, context MyCustomContext) (*User, arri.RpcError) {
	return &User{Id: params.UserId, Name: arri.Null[string]()}, nil
}

func GetUser(params UserParams, context MyCustomContext) (*User, arri.RpcError) {
	return &User{
		Id:        params.UserId,
		Name:      arri.NotNull("John Doe"),
		CreatedAt: time.Now(),
	}, nil
}

func UpdateUser(params User, context MyCustomContext) (*User, arri.RpcError) {
	return &params, nil
}
