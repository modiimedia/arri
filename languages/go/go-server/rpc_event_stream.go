package arri

import (
	"fmt"
	"reflect"
	"strings"

	"github.com/iancoleman/strcase"
	"github.com/modiimedia/arri/languages/go/go-server/utils"
)

type UntypedEventStream interface {
	Start()
	Send(any) RpcError
	Close(notifyClient bool)
	Done() <-chan struct{}
}

func IsRawEventStream(input UntypedEventStream) bool {
	return true
}

type EventStream[T any] interface {
	Start()
	Send(T) RpcError
	Close(notifyClient bool)
	Done() <-chan struct{}
}

func IsEventStream[T any](input EventStream[T]) bool {
	return true
}

type TypedEventStream[T any] struct {
	rawStream UntypedEventStream
}

func NewTypedEventStream[T any](untypedStream UntypedEventStream) TypedEventStream[T] {
	return TypedEventStream[T]{rawStream: untypedStream}
}

func (es TypedEventStream[T]) Start() {
	es.rawStream.Start()
}

func (es TypedEventStream[T]) Send(val T) RpcError {
	return es.rawStream.Send(val)
}

func (es TypedEventStream[T]) Close(notifyClient bool) {
	es.rawStream.Close(notifyClient)
}

func (es TypedEventStream[T]) Done() <-chan struct{} {
	return es.rawStream.Done()
}

func EventStreamRpc[TParams, TResponse any, TMeta any](
	app *App[TMeta],
	handler func(TParams, EventStream[TResponse], Request[TMeta]) RpcError,
	options RpcOptions,
) {
	ScopedEventStreamRpc(app, "", handler, options)
}

func ScopedEventStreamRpc[TParams, TResponse any, TMeta any](
	app *App[TMeta],
	scope string,
	handler func(TParams, EventStream[TResponse], Request[TMeta]) RpcError,
	options RpcOptions,
) {
	handlerType := reflect.TypeOf(handler)
	rpcSchema, err := ToRpcDef(
		handler,
		RpcDefOptions{
			Path:          options.Path,
			Method:        options.Method,
			Description:   options.Description,
			IsDeprecated:  options.IsDeprecated,
			IsEventStream: true,
			Transports:    options.Transports,
		},
		app.options.DefaultTransports,
	)
	rpcName := rpcNameFromFunctionName(GetFunctionName(handler))
	encodingOpts := EncodingOptions{
		KeyCasing: app.options.KeyCasing,
		MaxDepth:  app.options.MaxDepth,
	}
	if len(scope) > 0 {
		rpcName = scope + "." + rpcName
	}
	if len(scope) > 0 {
		rpcSchema.Path = app.options.RpcRoutePrefix + "/" + strcase.ToKebab(scope) + rpcSchema.Path
	} else {
		rpcSchema.Path = app.options.RpcRoutePrefix + rpcSchema.Path
	}
	if err != nil {
		panic(err)
	}
	if len(options.Method) > 0 {
		rpcSchema.Method.Set(strings.ToLower(options.Method))
	}
	if len(options.Path) > 0 {
		rpcSchema.Path = app.options.RpcRoutePrefix + options.Path
	}
	if len(options.Description) > 0 {
		rpcSchema.Description.Set(options.Description)
	}
	if options.IsDeprecated {
		rpcSchema.IsDeprecated.Set(options.IsDeprecated)
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
		rpcSchema.Params.Set(paramsName)
		app.definitions.Set(paramsName, *paramsSchema)
	} else {
		rpcSchema.Params.Unset()
	}
	response := reflect.TypeFor[TResponse]()
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
		rpcSchema.Response.Set(responseName)
		app.definitions.Set(responseName, *responseSchema)
	} else {
		rpcSchema.Response.Unset()
	}
	app.procedures.Set(rpcName, *rpcSchema)
	paramsZero := reflect.Zero(reflect.TypeFor[TParams]())
	paramsValidator := CreateValidatorFor[TParams](paramsZero, encodingOpts, !hasParams)
	responseZero := reflect.Zero(reflect.TypeFor[TResponse]())
	responseValidator := CreateValidatorFor[TResponse](responseZero, encodingOpts, !hasResponse)
	for _, transport := range rpcSchema.Transports {
		adapter, ok := app.adapters[transport]
		if !ok {
			panic(fmt.Sprintf("Missing adapter for the following transport: \"%v\"", transport))
		}
		adapter.RegisterEventStreamRpc(
			rpcName,
			*rpcSchema,
			paramsValidator,
			responseValidator,
			func(p any, eventStream UntypedEventStream, req Request[TMeta]) RpcError {
				es := TypedEventStream[TResponse]{rawStream: eventStream}
				return handler(
					p.(TParams),
					es,
					req,
				)
			})
	}
}
