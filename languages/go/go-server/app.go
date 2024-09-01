package main

import (
	"fmt"
	"net/http"
	"strings"
)

type App[TContext any] struct {
	Mux                  *http.ServeMux
	CreateContext        func(r *http.Request) (*TContext, *ErrorResponse)
	InitializationErrors []error
	Options              AppOptions[TContext]
	Procedures           map[string]ArriRpcDef
	Models               map[string]ArriTypeDef
}

type AppOptions[TContext any] struct {
	AppName string
	// The current app version. Generated clients will send this in the "client-version" header
	AppVersion string
	// write a description from the generated clients
	AppDescription string
	// set the default key casing for all RPC inputs and outputs
	KeyCasing KeyCasing
	// if not set it will default to "/procedures"
	RpcRoutePrefix string
	// if not set it will default to "/{RpcRoutePrefix}/__definition"
	RpcDefinitionPath string
	OnRequest         *func(*http.Request, *TContext) *ErrorResponse
	OnBeforeResponse  *func(*http.Request, *TContext, *any) *ErrorResponse
	OnAfterResponse   *func(*http.Request, *TContext, *any) *ErrorResponse
	OnError           *func(*http.Request, *TContext, error)
}

func NewApp[TContext any](mux *http.ServeMux, options AppOptions[TContext], createContext func(r *http.Request) (*TContext, *ErrorResponse)) App[TContext] {
	return App[TContext]{
		Mux:                  mux,
		CreateContext:        createContext,
		Options:              options,
		InitializationErrors: []error{},
		Procedures:           map[string]ArriRpcDef{},
		Models:               map[string]ArriTypeDef{},
	}
}

func Rpc[TParams, TResponse, TContext any](app App[TContext], handler func(TParams, TContext) (*TResponse, *ErrorResponse)) {
	rpcSchema, rpcError := ToRpcDef(handler, ArriHttpRpcOptions{})
	rpcName := rpcNameFromFunctionName(GetFunctionName(handler))
	if rpcError != nil {
		app.InitializationErrors = append(app.InitializationErrors, rpcError)
		return
	}
	app.Procedures[rpcName] = *rpcSchema
	app.Mux.HandleFunc(rpcSchema.Http.Path, func(w http.ResponseWriter, r *http.Request) {
		if strings.ToLower(r.Method) != rpcSchema.Http.Method {
			w.WriteHeader(404)
			errResponse, _ := ToJson(ErrorResponse{Code: 404, Message: "Not found"}, KeyCasingCamelCase)
			w.Write(errResponse)
			return
		}
		var ctx *TContext = nil
		if app.CreateContext != nil {
			ctxResult, ctxErr := app.CreateContext(r)
			if ctxErr != nil {
				w.WriteHeader(int(ctxErr.Code))
				jsonResult, _ := ToJson(ctxErr, KeyCasingCamelCase)
				w.Write(jsonResult)
				return
			}
			ctx = ctxResult
		}
		fmt.Println("CONTEXT", ctx)
		w.WriteHeader(200)
		body := "success"
		w.Write([]byte(body))
	})
}
