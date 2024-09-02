package main

import (
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
	OnRequest         func(*http.Request, TContext) *ErrorResponse
	OnBeforeResponse  func(*http.Request, TContext, any) *ErrorResponse
	OnAfterResponse   func(*http.Request, TContext, any) *ErrorResponse
	OnError           func(*http.Request, *TContext, error)
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
	onRequest := app.Options.OnRequest
	if onRequest == nil {
		onRequest = func(r *http.Request, t TContext) *ErrorResponse {
			return nil
		}
	}
	onBeforeResponse := app.Options.OnBeforeResponse
	if onBeforeResponse == nil {
		onBeforeResponse = func(r *http.Request, t TContext, a any) *ErrorResponse {
			return nil
		}
	}
	onAfterResponse := app.Options.OnAfterResponse
	if onAfterResponse == nil {
		onAfterResponse = func(r *http.Request, t TContext, a any) *ErrorResponse {
			return nil
		}
	}
	onError := app.Options.OnError
	if onError == nil {
		onError = func(r *http.Request, t *TContext, err error) {}
	}
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		ctx, ctxErr := app.CreateContext(r)
		if ctxErr != nil {
			handleError(false, w, r, ctx, *ctxErr, onError)
			return
		}
		onRequestErr := onRequest(r, *ctx)
		if onRequestErr != nil {
			handleError(false, w, r, ctx, *onRequestErr, onError)
			return
		}
		if r.URL.Path != "/" {
			handleError(false, w, r, ctx, ErrorResponse{Code: 404, Message: "Not found"}, onError)
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
		onBeforeResponseErr := onBeforeResponse(r, *ctx, response)
		if onBeforeResponseErr != nil {
			handleError[TContext](false, w, r, ctx, *onBeforeResponseErr, onError)
			return
		}
		jsonResult, _ := ToJson(response, app.Options.KeyCasing)
		w.Write(jsonResult)
		onAfterResponseErr := onAfterResponse(r, *ctx, response)
		if onAfterResponseErr != nil {
			handleError(true, w, r, ctx, *onAfterResponseErr, onError)
			return
		}
	})

	mux.HandleFunc(defPath, func(w http.ResponseWriter, r *http.Request) {
		jsonResult, _ := ToJson(app.GetAppDefinition(), app.Options.KeyCasing)
		w.WriteHeader(200)
		w.Write(jsonResult)
	})
	return app
}

func handleError[TContext any](
	responseSent bool,
	w http.ResponseWriter,
	r *http.Request,
	context *TContext,
	err ErrorResponse,
	onError func(*http.Request, *TContext, error),
) {
	onError(r, context, err)
	if responseSent {
		return
	}
	w.WriteHeader(int(err.Code))
	body, _ := ToJson(err, KeyCasingCamelCase)
	w.Write(body)
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
	*app.Definitions = __updateAOrderedMap__(*app.Definitions, __aOrderedMapEntry__[ATypeDef]{Key: paramSchema.Metadata.value.Id, Value: *paramSchema})
	response := handlerType.Out(0)
	responseSchema, _ := typeToTypeDef(response, typeDefContext)
	*app.Definitions = __updateAOrderedMap__(*app.Definitions, __aOrderedMapEntry__[ATypeDef]{Key: responseSchema.Metadata.value.Id, Value: *responseSchema})
	rpcName := rpcNameFromFunctionName(GetFunctionName(handler))
	*app.Procedures = __updateAOrderedMap__(*app.Procedures, __aOrderedMapEntry__[ARpcDef]{Key: rpcName, Value: *rpcSchema})
	onRequest := app.Options.OnRequest
	if onRequest == nil {
		onRequest = func(r *http.Request, t TContext) *ErrorResponse {
			return nil
		}
	}
	onBeforeResponse := app.Options.OnBeforeResponse
	if onBeforeResponse == nil {
		onBeforeResponse = func(r *http.Request, t TContext, a any) *ErrorResponse {
			return nil
		}
	}
	onAfterResponse := app.Options.OnAfterResponse
	if onAfterResponse == nil {
		onAfterResponse = func(r *http.Request, t TContext, a any) *ErrorResponse {
			return nil
		}
	}
	onError := app.Options.OnError
	if onError == nil {
		onError = func(r *http.Request, t *TContext, err error) {}
	}
	app.Mux.HandleFunc(rpcSchema.Http.Path, func(w http.ResponseWriter, r *http.Request) {
		ctx, ctxErr := app.CreateContext(r)
		if ctxErr != nil {
			handleError(false, w, r, nil, *ctxErr, app.Options.OnError)
			return
		}
		if strings.ToLower(r.Method) != rpcSchema.Http.Method {
			handleError(false, w, r, ctx, ErrorResponse{Code: 404, Message: "Not found"}, onError)
			return
		}
		onRequestErr := onRequest(r, *ctx)
		if onRequestErr != nil {
			handleError(false, w, r, ctx, *onRequestErr, onError)
			return
		}
		onBeforeResponseErr := onBeforeResponse(r, *ctx, "")
		if onBeforeResponseErr != nil {
			handleError(false, w, r, ctx, *onBeforeResponseErr, onError)
			return
		}
		w.WriteHeader(200)
		body := "success"
		w.Write([]byte(body))
		onAfterResponseErr := onAfterResponse(r, *ctx, "")
		if onAfterResponseErr != nil {
			handleError(false, w, r, ctx, *onAfterResponseErr, onError)
		}
	})
}

func Rpc[TParams, TResponse, TContext any](app *App[TContext], handler func(TParams, TContext) (*TResponse, *ErrorResponse)) {
	rpc(app, nil, handler)
}

func RpcWithOptions[TParams, TResponse, TContext any](app *App[TContext], options RpcOptions, handler func(TParams, TContext) (*TResponse, *ErrorResponse)) {
	rpc(app, &options, handler)
}
