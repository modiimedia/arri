package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

const (
	Get = "GET"
	Post = "POST"
	Put = "PUT"
	Patch = "PATCH"
	Delete = "DELETE"
)

type HttpMethod string

type HttpRpc[TParams any, TResponse any, TContext any] struct {
	Name string
	Path string
	Method HttpMethod
	Handler func (TContext, TParams) (TResponse, error)
	PostHandler *(func (TContext, TParams, TResponse))
}


type GetUserParams struct {
	UserId string `json:"user_id"`
}

type User struct {
	Id string `json:"id"`
	Name string `json:"name"`
	Email *string `json:"email"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// @Rpc("/users/get-user")
func GetUser(params GetUserParams, req *http.Request) (*User, *ArriServerError) {
	var user = User{
		Id: params.UserId,
		Name: "John Doe",
		Email: nil,
		CreatedAt: time.Time{},
		UpdatedAt: time.Time{},
	}
	return &user, nil
}

func HandleGetUser_ArriGenerated(w http.ResponseWriter, req *http.Request) {
	var body = req.Body
	var params GetUserParams
	var err = json.NewDecoder(body).Decode(&params)
	if (err != nil) {
		http.Error(w, err.Error(), 400)
		return
	}
	fmt.Printf("%s", params)
	var response, responseError = GetUser(params, req)
	if responseError != nil {
		http.Error(w, responseError.Message, responseError.Code)
		return			
	}
	var payload, payloadErr = json.Marshal(response)
	if payloadErr != nil {
		http.Error(w, payloadErr.Error(), 500)
		return
	}
	fmt.Fprintf(w, "%s", string(payload))
}

func main() {
	var mux = http.NewServeMux()
	mux.HandleFunc("/users/get-user", HandleGetUser_ArriGenerated)
	http.ListenAndServe(":4040", mux)
}