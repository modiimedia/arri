package arri

import (
	"io"
	"net/http"
	"reflect"
	"strings"

	"github.com/iancoleman/strcase"
)

type RpcOptions struct {
	Path         string
	Method       HttpMethod
	Name         string
	Description  string
	IsDeprecated bool
}

func rpc[TParams, TResponse any, TContext Context](app *App[TContext], serviceName string, options RpcOptions, handler func(TParams, TContext) (TResponse, RpcError)) {
	handlerType := reflect.TypeOf(handler)
	rpcSchema, rpcError := ToRpcDef(handler, ArriHttpRpcOptions{})
	rpcName := rpcNameFromFunctionName(GetFunctionName(handler))
	if len(serviceName) > 0 {
		rpcName = serviceName + "." + rpcName
	}
	if len(serviceName) > 0 {
		rpcSchema.Http.Path = app.Options.RpcRoutePrefix + "/" + strcase.ToKebab(serviceName) + rpcSchema.Http.Path
	} else {
		rpcSchema.Http.Path = app.Options.RpcRoutePrefix + rpcSchema.Http.Path
	}
	if rpcError != nil {
		panic(rpcError)
	}
	if len(options.Method) > 0 {
		rpcSchema.Http.Method = strings.ToLower(options.Method)
	}
	if len(options.Path) > 0 {
		rpcSchema.Http.Path = app.Options.RpcRoutePrefix + options.Path
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
	hasParams := !isEmptyMessage(params)
	if hasParams {
		paramsDefContext := _NewTypeDefContext(app.Options.KeyCasing)
		paramsSchema, paramsSchemaErr := typeToTypeDef(params, paramsDefContext)
		if paramsSchemaErr != nil {
			panic(paramsSchemaErr)
		}
		if paramsSchema.Metadata.IsNone() {
			panic("Procedures cannot accept anonymous structs")
		}
		rpcSchema.Http.Params.Set(paramsName)
		app.Definitions.Set(paramsName, *paramsSchema)
	} else {
		rpcSchema.Http.Params.Unset()
	}
	response := handlerType.Out(0)
	if response.Kind() == reflect.Ptr {
		response = response.Elem()
	}
	responseName := getModelName(rpcName, response.Name(), "Response")
	hasResponse := !isEmptyMessage(response)
	if hasResponse {
		responseDefContext := _NewTypeDefContext(app.Options.KeyCasing)
		responseSchema, responseSchemaErr := typeToTypeDef(response, responseDefContext)
		if responseSchemaErr != nil {
			panic(responseSchemaErr)
		}
		if responseSchema.Metadata.IsNone() {
			panic("Procedures cannot return anonymous structs")
		}
		rpcSchema.Http.Response.Set(responseName)
		app.Definitions.Set(responseName, *responseSchema)
	} else {
		rpcSchema.Http.Response.Unset()
	}
	app.Procedures.Set(rpcName, *rpcSchema)
	onRequest := app.Options.OnRequest
	if onRequest == nil {
		onRequest = func(r *http.Request, t *TContext) RpcError {
			return nil
		}
	}
	onBeforeResponse := app.Options.OnBeforeResponse
	if onBeforeResponse == nil {
		onBeforeResponse = func(r *http.Request, t *TContext, a any) RpcError {
			return nil
		}
	}
	onAfterResponse := app.Options.OnAfterResponse
	if onAfterResponse == nil {
		onAfterResponse = func(r *http.Request, t *TContext, a any) RpcError {
			return nil
		}
	}
	onError := app.Options.OnError
	if onError == nil {
		onError = func(r *http.Request, t *TContext, err error) {}
	}
	paramsZero := reflect.Zero(reflect.TypeFor[TParams]())
	app.Mux.HandleFunc(rpcSchema.Http.Path, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "application/json")
		ctx, ctxErr := app.CreateContext(w, r)
		if ctxErr != nil {
			handleError(false, w, r, nil, ctxErr, onError)
			return
		}
		if strings.ToLower(r.Method) != rpcSchema.Http.Method {
			handleError(false, w, r, ctx, Error(404, "Not found"), onError)
			return
		}
		onRequestErr := onRequest(r, ctx)
		if onRequestErr != nil {
			handleError(false, w, r, ctx, onRequestErr, onError)
			return
		}
		params, paramsOk := paramsZero.Interface().(TParams)
		if !paramsOk {
			handleError(false, w, r, ctx, Error(500, "Error initializing empty params"), onError)
			return
		}
		if hasParams {
			switch rpcSchema.Http.Method {
			case HttpMethodGet:
				urlValues := r.URL.Query()
				fromUrlQueryErr := FromUrlQuery(urlValues, &params, app.Options.KeyCasing)
				if fromUrlQueryErr != nil {
					handleError(false, w, r, ctx, fromUrlQueryErr, onError)
					return
				}
			default:
				b, bErr := io.ReadAll(r.Body)
				if bErr != nil {
					handleError(false, w, r, ctx, Error(400, bErr.Error()), onError)
					return
				}
				fromJsonErr := DecodeJSON(b, &params, app.Options.KeyCasing)
				if fromJsonErr != nil {
					handleError(false, w, r, ctx, fromJsonErr, onError)
					return
				}
			}
		}
		response, responseErr := handler(params, *ctx)
		if responseErr != nil {
			payload := responseErr
			handleError(false, w, r, ctx, payload, onError)
			return
		}
		onBeforeResponseErr := onBeforeResponse(r, ctx, "")
		if onBeforeResponseErr != nil {
			handleError(false, w, r, ctx, onBeforeResponseErr, onError)
			return
		}
		w.WriteHeader(200)
		var body []byte
		if hasResponse {
			json, jsonErr := EncodeJSON(response, app.Options.KeyCasing)
			if jsonErr != nil {
				handleError(false, w, r, ctx, ErrorWithData(500, jsonErr.Error(), Some[any](jsonErr)), onError)
				return
			}
			body = json
		} else {
			body = []byte{}
		}
		w.Write([]byte(body))
		onAfterResponseErr := onAfterResponse(r, ctx, "")
		if onAfterResponseErr != nil {
			handleError(false, w, r, ctx, onAfterResponseErr, onError)
		}
	})
}

func getModelName(rpcName string, modelName string, fallbackSuffix string) string {
	if len(modelName) == 0 {
		return strcase.ToCamel(strings.Join(strings.Split(rpcName, "."), "_") + "_" + fallbackSuffix)
	}
	return modelName
}

func Rpc[TParams, TResponse any, TContext Context](app *App[TContext], handler func(TParams, TContext) (TResponse, RpcError), options RpcOptions) {
	rpc(app, "", options, handler)
}

func ScopedRpc[TParams, TResponse any, TContext Context](app *App[TContext], serviceName string, handler func(TParams, TContext) (TResponse, RpcError), options RpcOptions) {
	rpc(app, serviceName, options, handler)
}
