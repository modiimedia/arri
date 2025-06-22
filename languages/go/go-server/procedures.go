package arri

import (
	"io"
	"net/http"
	"reflect"
	"strings"

	"github.com/iancoleman/strcase"
	"github.com/modiimedia/arri/languages/go/go-server/utils"
)

type RpcOptions struct {
	Path         string
	Method       HttpMethod
	Name         string
	Description  string
	IsDeprecated bool
}

func rpc[TParams, TResponse any, TMeta any](app *App[TMeta], serviceName string, options RpcOptions, handler func(TParams, Request[TMeta]) (TResponse, RpcError)) {
	handlerType := reflect.TypeOf(handler)
	rpcSchema, rpcError := ToRpcDef(handler, ArriHttpRpcOptions{})
	rpcName := rpcNameFromFunctionName(GetFunctionName(handler))
	encodingOpts := EncodingOptions{
		KeyCasing: app.options.KeyCasing,
		MaxDepth:  app.options.MaxDepth,
	}
	if len(serviceName) > 0 {
		rpcName = serviceName + "." + rpcName
	}
	if len(serviceName) > 0 {
		rpcSchema.Http.Path = app.options.RpcRoutePrefix + "/" + strcase.ToKebab(serviceName) + rpcSchema.Http.Path
	} else {
		rpcSchema.Http.Path = app.options.RpcRoutePrefix + rpcSchema.Http.Path
	}
	if rpcError != nil {
		panic(rpcError)
	}
	if len(options.Method) > 0 {
		rpcSchema.Http.Method = strings.ToLower(options.Method)
	}
	if len(options.Path) > 0 {
		rpcSchema.Http.Path = app.options.RpcRoutePrefix + options.Path
	}
	if len(options.Description) > 0 {
		rpcSchema.Http.Description.Set(options.Description)
	}
	if options.IsDeprecated {
		rpcSchema.Http.IsDeprecated.Set(options.IsDeprecated)
	}
	params := handlerType.In(0)
	if params.Kind() != reflect.Struct {
		panic("rpc params must be a struct. pointers and other types are not allowed.")
	}
	paramsName := getModelName(rpcName, params.Name(), "Params")
	hasParams := !utils.IsEmptyMessage(params)
	if hasParams {
		paramsDefContext := newTypeDefContext(encodingOpts)
		paramsSchema, paramsSchemaErr := typeToTypeDef(params, paramsDefContext)
		if paramsSchemaErr != nil {
			panic(paramsSchemaErr)
		}
		if paramsSchema.Metadata.IsNone() {
			panic("Procedures cannot accept anonymous structs")
		}
		rpcSchema.Http.Params.Set(paramsName)
		app.definitions.Set(paramsName, *paramsSchema)
	} else {
		rpcSchema.Http.Params.Unset()
	}
	response := handlerType.Out(0)
	if response.Kind() == reflect.Ptr {
		response = response.Elem()
	}
	responseName := getModelName(rpcName, response.Name(), "Response")
	hasResponse := !utils.IsEmptyMessage(response)
	if hasResponse {
		responseDefContext := newTypeDefContext(encodingOpts)
		responseSchema, responseSchemaErr := typeToTypeDef(response, responseDefContext)
		if responseSchemaErr != nil {
			panic(responseSchemaErr)
		}
		if responseSchema.Metadata.IsNone() {
			panic("Procedures cannot return anonymous structs")
		}
		rpcSchema.Http.Response.Set(responseName)
		app.definitions.Set(responseName, *responseSchema)
	} else {
		rpcSchema.Http.Response.Unset()
	}
	app.procedures.Set(rpcName, *rpcSchema)
	onRequest := app.options.OnRequest
	if onRequest == nil {
		onRequest = func(t *Request[TMeta]) RpcError {
			return nil
		}
	}
	onBeforeResponse := app.options.OnBeforeResponse
	if onBeforeResponse == nil {
		onBeforeResponse = func(t *Request[TMeta], a any) RpcError {
			return nil
		}
	}
	onAfterResponse := app.options.OnAfterResponse
	if onAfterResponse == nil {
		onAfterResponse = func(t *Request[TMeta], a any) RpcError {
			return nil
		}
	}
	onError := app.options.OnError
	if onError == nil {
		onError = func(t *Request[TMeta], err error) {}
	}
	paramsZero := reflect.Zero(reflect.TypeFor[TParams]())
	app.Mux.HandleFunc(rpcSchema.Http.Path, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			handlePreflightRequest(w)
			return
		}
		setResponseHeader := func(key string, val string) {
			w.Header().Set(key, val)
		}
		w.Header().Add("Content-Type", "application/json")
		req := NewRequest[TMeta](r.Context(), rpcName, "http", r.RemoteAddr, r.Header.Get("client-version"), headersFromHttpHeaders(r.Header), setResponseHeader)
		if strings.ToLower(r.Method) != rpcSchema.Http.Method {
			handleError(false, w, req, Error(404, "Not found"), onError)
			return
		}
		err := onRequest(req)
		if err != nil {
			handleError(false, w, req, err, onError)
			return
		}

		if len(app.middleware) > 0 {
			for i := 0; i < len(app.middleware); i++ {
				fn := app.middleware[i]
				err := fn(req)
				if err != nil {
					handleError(false, w, req, err, onError)
					return
				}
			}
		}

		params, paramsOk := paramsZero.Interface().(TParams)
		if !paramsOk {
			handleError(false, w, req, Error(500, "Error initializing empty params"), onError)
			return
		}
		if hasParams {
			switch rpcSchema.Http.Method {
			case HttpMethodGet:
				urlValues := r.URL.Query()
				fromUrlQueryErr := DecodeQueryParams(urlValues, &params, encodingOpts)
				if fromUrlQueryErr != nil {
					handleError(false, w, req, fromUrlQueryErr, onError)
					return
				}
			default:
				b, err := io.ReadAll(r.Body)
				if err != nil {
					handleError(false, w, req, Error(400, err.Error()), onError)
					return
				}
				fromJSONErr := DecodeJSON(b, &params, encodingOpts)
				if fromJSONErr != nil {
					handleError(false, w, req, fromJSONErr, onError)
					return
				}
			}
		}

		response, err := handler(params, *req)
		if err != nil {
			payload := err
			handleError(false, w, req, payload, onError)
			return
		}

		err = onBeforeResponse(req, "")
		if err != nil {
			handleError(false, w, req, err, onError)
			return
		}

		w.WriteHeader(200)
		var body []byte
		if hasResponse {
			json, err := EncodeJSON(response, encodingOpts)
			if err != nil {
				handleError(false, w, req, ErrorWithData(500, err.Error(), Some[any](err)), onError)
				return
			}
			body = json
		} else {
			body = []byte{}
		}
		w.Write([]byte(body))

		err = onAfterResponse(req, "")
		if err != nil {
			handleError(true, w, req, err, onError)
		}
	})
}

func getModelName(rpcName string, modelName string, fallbackSuffix string) string {
	if len(modelName) == 0 {
		return strcase.ToCamel(strings.Join(strings.Split(rpcName, "."), "_") + "_" + fallbackSuffix)
	}
	return modelName
}

func Rpc[TParams, TResponse any, TProps any](app *App[TProps], handler func(TParams, Request[TProps]) (TResponse, RpcError), options RpcOptions) {
	rpc(app, "", options, handler)
}

func ScopedRpc[TParams, TResponse any, TProps any](app *App[TProps], serviceName string, handler func(TParams, Request[TProps]) (TResponse, RpcError), options RpcOptions) {
	rpc(app, serviceName, options, handler)
}

func handlePreflightRequest(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Method", "*")
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.WriteHeader(200)
	w.Write([]byte("ok"))
}
