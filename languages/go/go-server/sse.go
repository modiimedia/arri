package arri

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"reflect"
	"strings"

	"github.com/iancoleman/strcase"
)

type SseController[T any] interface {
	Push(T) RpcError
	Close()
	Done() <-chan struct{}
}

type defaultSseController[T any] struct {
	responseController *http.ResponseController
	writer             http.ResponseWriter
	request            *http.Request
	headersSent        bool
	keyCasing          KeyCasing
	cancelFunc         context.CancelFunc
	context            context.Context
}

func newDefaultSseController[T any](w http.ResponseWriter, r *http.Request, keyCasing KeyCasing) *defaultSseController[T] {
	rc := http.NewResponseController(w)
	ctx, cancelFunc := context.WithCancel(r.Context())
	controller := defaultSseController[T]{
		responseController: rc,
		writer:             w,
		request:            r,
		keyCasing:          keyCasing,
		cancelFunc:         cancelFunc,
		context:            ctx,
	}
	return &controller
}

func (controller *defaultSseController[T]) startStream() {
	controller.writer.Header().Set("Access-Control-Expose-Headers", "Content-Type")
	controller.writer.Header().Set("Content-Type", "text/event-stream")
	controller.writer.Header().Set("Cache-Control", "no-cache")
	controller.writer.Header().Set("Connection", "keep-alive")
	controller.writer.WriteHeader(200)
	controller.headersSent = true
}

func (controller *defaultSseController[T]) Push(message T) RpcError {
	if !controller.headersSent {
		controller.startStream()
	}
	body, bodyErr := EncodeJSON(message, controller.keyCasing)
	if bodyErr != nil {
		return Error(500, bodyErr.Error())
	}
	fmt.Fprintf(controller.writer, "event: message\ndata: %s\n\n", string(body))
	controller.responseController.Flush()
	return nil
}

func (controller *defaultSseController[T]) Close() {
	if !controller.headersSent {
		controller.startStream()
	}
	fmt.Fprint(controller.writer, "event: done\ndata: done\n\n")
	controller.responseController.Flush()
	controller.cancelFunc()
}

func (controller *defaultSseController[T]) Done() <-chan struct{} {
	return controller.context.Done()
}

func eventStreamRpc[TParams, TResponse any, TContext Context](app *App[TContext], serviceName string, options RpcOptions, handler func(TParams, SseController[TResponse], TContext) RpcError) {
	handlerType := reflect.TypeOf(handler)
	rpcSchema, rpcError := ToRpcDef(
		handler,
		ArriHttpRpcOptions{
			IsEventStream: true,
			IsDeprecated:  options.IsDeprecated,
			Description:   options.Description,
			Method:        options.Method,
		},
	)
	if rpcError != nil {
		panic(rpcError)
	}
	if len(serviceName) > 0 {
		rpcSchema.Http.Path = app.Options.RpcRoutePrefix + "/" + strcase.ToKebab(serviceName) + rpcSchema.Http.Path
	} else {
		rpcSchema.Http.Path = app.Options.RpcRoutePrefix + rpcSchema.Http.Path
	}
	if len(options.Path) > 0 {
		rpcSchema.Http.Path = app.Options.RpcRoutePrefix + options.Path
	}
	params := handlerType.In(0)
	if params.Kind() != reflect.Struct {
		panic("rpc params must be a struct. pointers and other types are not allowed.")
	}
	hasParams := !(params.Name() == "EmptyMessage" && params.PkgPath() == "arrirpc.com/arri")
	if hasParams {
		paramsDefContext := _NewTypeDefContext(app.Options.KeyCasing)
		paramsSchema, paramsSchemaErr := typeToTypeDef(params, paramsDefContext)
		if paramsSchemaErr != nil {
			panic(paramsSchemaErr)
		}
		if paramsSchema.Metadata.IsNone() {
			panic("Procedures cannot accept anonymous structs")
		}
		rpcSchema.Http.Params = paramsSchema.Metadata.Unwrap().Id
		*app.Definitions = __updateAOrderedMap__(*app.Definitions, __orderedMapEntry__[TypeDef]{Key: paramsSchema.Metadata.Unwrap().Id.Unwrap(), Value: *paramsSchema})
	}
	response := reflect.TypeFor[TResponse]()
	if response.Kind() == reflect.Ptr {
		response = response.Elem()
	}
	hasResponse := !(response.Name() == "EmptyMessage" && response.PkgPath() == "arrirpc.com/arri")
	if hasResponse {
		responseDefContext := _NewTypeDefContext(app.Options.KeyCasing)
		responseSchema, responseSchemaErr := typeToTypeDef(response, responseDefContext)
		if responseSchemaErr != nil {
			panic(responseSchemaErr)
		}
		if responseSchema.Metadata.IsNone() {
			panic("Procedures cannot return anonymous structs")
		}
		rpcSchema.Http.Response = responseSchema.Metadata.Unwrap().Id
		*app.Definitions = __updateAOrderedMap__(*app.Definitions, __orderedMapEntry__[TypeDef]{Key: responseSchema.Metadata.Unwrap().Id.Unwrap(), Value: *responseSchema})
	}
	rpcName := rpcNameFromFunctionName(GetFunctionName(handler))
	if len(serviceName) > 0 {
		rpcName = serviceName + "." + rpcName
	}
	*app.Procedures = __updateAOrderedMap__(*app.Procedures, __orderedMapEntry__[RpcDef]{Key: rpcName, Value: *rpcSchema})
	onRequest, _, onAfterResponse, onError := getHooks(app)
	paramsZero := reflect.Zero(reflect.TypeFor[TParams]())
	app.Mux.HandleFunc(rpcSchema.Http.Path, func(w http.ResponseWriter, r *http.Request) {
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
		sseController := newDefaultSseController[TResponse](w, r, app.Options.KeyCasing)
		responseErr := handler(params, sseController, *ctx)
		if responseErr != nil {
			handleError(false, w, r, ctx, responseErr, onError)
			return
		}
		onAfterResponseErr := onAfterResponse(r, ctx, "")
		if onAfterResponseErr != nil {
			handleError(false, w, r, ctx, onAfterResponseErr, onError)
		}
	})
}

func EventStreamRpc[TParams, TResponse any, TContext Context](app *App[TContext], handler func(TParams, SseController[TResponse], TContext) RpcError, options RpcOptions) {
	eventStreamRpc(app, "", options, handler)
}

func getHooks[TContext Context](app *App[TContext]) (func(*http.Request, *TContext) RpcError, func(*http.Request, *TContext, any) RpcError, func(*http.Request, *TContext, any) RpcError, func(*http.Request, *TContext, error)) {
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
	return onRequest, onBeforeResponse, onAfterResponse, onError
}
