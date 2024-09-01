package main

import (
	"fmt"
	"log"
	"net/http"
)

const (
	Get    = "GET"
	Post   = "POST"
	Put    = "PUT"
	Patch  = "PATCH"
	Delete = "DELETE"
)

type MyCustomContext struct {
}

func main() {
	result, err := ToRpcDef(SayHello, ArriHttpRpcOptions{Method: HttpMethodPost})
	if err != nil {
		fmt.Println(err)
		return
	}
	jsonResult, _ := ToJson(result, KeyCasingCamelCase)
	fmt.Println(string(jsonResult))
	mux := http.DefaultServeMux
	options := AppOptions[MyCustomContext]{}
	app := NewApp(
		mux,
		options,
		(func(r *http.Request) (*MyCustomContext, *ErrorResponse) {
			return &MyCustomContext{}, nil
		}),
	)
	Rpc(app, GetUser)
	Rpc(app, UpdateUser)
	log.Fatal(http.ListenAndServe(":4040", mux))
}

func SayHello(msg Message) string {
	return msg.Text
}
