package main

import (
	"fmt"
	"net/http"
	"reflect"
	"strings"
)

type App[TContext any] struct {
	Mux                  *http.ServeMux
	CreateContext        func(r *http.Request) (*TContext, *ErrorResponse)
	InitializationErrors []error
	Options              AppOptions[TContext]
	Procedures           *[]__aOrderedMapEntry__[ARpcDef]
	Definitions          *[]__aOrderedMapEntry__[ATypeDef]
}

func (app *App[TContext]) GetAppDefinition() AAppDef {

	return AAppDef{
		SchemaVersion: "0.0.7",
		Info: &AAppDefInfo{
			Name:        app.Options.AppName,
			Description: app.Options.AppDescription,
			Version:     app.Options.AppVersion,
		},
		Procedures:  *app.Procedures,
		Definitions: *app.Definitions,
	}
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
	app := App[TContext]{
		Mux:                  mux,
		CreateContext:        createContext,
		Options:              options,
		InitializationErrors: []error{},
		Procedures:           &[]__aOrderedMapEntry__[ARpcDef]{},
		Definitions:          &[]__aOrderedMapEntry__[ATypeDef]{},
	}
	defPath := app.Options.RpcRoutePrefix + "/__definition"
	if len(app.Options.RpcDefinitionPath) > 0 {
		defPath = app.Options.RpcDefinitionPath
	}
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			w.WriteHeader(404)
			jsonResult, _ := ToJson(ErrorResponse{Code: 404, Message: "Not found"}, KeyCasingCamelCase)
			w.Write(jsonResult)
			return
		}
		w.WriteHeader(200)
		response := struct {
			Title       string
			Description string
			Version     *string
			SchemaPath  string
		}{
			Title:       app.Options.AppName,
			Description: app.Options.AppDescription,
			Version:     &app.Options.AppVersion,
			SchemaPath:  defPath,
		}
		jsonResult, _ := ToJson(response, app.Options.KeyCasing)
		w.Write(jsonResult)
	})

	mux.HandleFunc(defPath, func(w http.ResponseWriter, r *http.Request) {
		jsonResult, _ := ToJson(app.GetAppDefinition(), app.Options.KeyCasing)
		w.WriteHeader(200)
		w.Write(jsonResult)
	})
	return app
}

type RpcOptions struct {
	Path         string
	Method       HttpMethod
	Description  string
	IsDeprecated bool
}

func rpc[TParams, TResponse, TContext any](app *App[TContext], options *RpcOptions, handler func(TParams, TContext) (*TResponse, *ErrorResponse)) {
	handlerType := reflect.TypeOf(handler)
	rpcSchema, rpcError := ToRpcDef(handler, ArriHttpRpcOptions{})
	rpcSchema.Http.Path = app.Options.RpcRoutePrefix + rpcSchema.Http.Path
	if rpcError != nil {
		panic(rpcError)
	}
	if options != nil {
		rpcSchema.Http.Method = options.Method
		if len(options.Path) > 0 {
			rpcSchema.Http.Path = app.Options.RpcRoutePrefix + options.Path
		}
		if len(options.Description) > 0 {
			rpcSchema.Http.Description = &options.Description
		}
		if options.IsDeprecated {
			rpcSchema.Http.IsDeprecated = &options.IsDeprecated
		}
	}
	params := reflect.TypeOf(handler).In(0)
	typeDefContext := _NewTypeDefContext(app.Options.KeyCasing)
	paramSchema, _ := typeToTypeDef(params, typeDefContext)
	*app.Definitions = __updateAOrderedMap__(*app.Definitions, __aOrderedMapEntry__[ATypeDef]{Key: paramSchema.Metadata.Id, Value: *paramSchema})
	response := handlerType.Out(0)
	responseSchema, _ := typeToTypeDef(response, typeDefContext)
	*app.Definitions = __updateAOrderedMap__(*app.Definitions, __aOrderedMapEntry__[ATypeDef]{Key: responseSchema.Metadata.Id, Value: *responseSchema})
	rpcName := rpcNameFromFunctionName(GetFunctionName(handler))
	*app.Procedures = __updateAOrderedMap__(*app.Procedures, __aOrderedMapEntry__[ARpcDef]{Key: rpcName, Value: *rpcSchema})
	for i := 0; i < len(*app.Procedures); i++ {
		fmt.Println((*app.Procedures)[i].Key)
	}
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

func Rpc[TParams, TResponse, TContext any](app *App[TContext], handler func(TParams, TContext) (*TResponse, *ErrorResponse)) {
	rpc(app, nil, handler)
}

func RpcWithOptions[TParams, TResponse, TContext any](app *App[TContext], options RpcOptions, handler func(TParams, TContext) (*TResponse, *ErrorResponse)) {
	rpc(app, &options, handler)
}
