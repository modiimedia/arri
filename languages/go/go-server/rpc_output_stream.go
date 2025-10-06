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

func EventStreamRpc[TInput, TOutput any, TMeta any](
	app *App[TMeta],
	handler func(TInput, EventStream[TOutput], Request[TMeta]) RpcError,
	options RpcOptions,
) {
	ScopedEventStreamRpc(app, "", handler, options)
}

func ScopedEventStreamRpc[TInput, TOutput any, TMeta any](
	app *App[TMeta],
	scope string,
	handler func(TInput, EventStream[TOutput], Request[TMeta]) RpcError,
	options RpcOptions,
) {
	handlerType := reflect.TypeOf(handler)
	rpcSchema, err := ToRpcDef(
		handler,
		RpcDefOptions{
			Path:           options.Path,
			Method:         options.Method,
			Description:    options.Description,
			IsDeprecated:   options.IsDeprecated,
			OutputIsStream: true,
			Transports:     options.Transports,
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
		rpcSchema.Path = app.options.RpcPathPrefix + "/" + strcase.ToKebab(scope) + rpcSchema.Path
	} else {
		rpcSchema.Path = app.options.RpcPathPrefix + rpcSchema.Path
	}
	if err != nil {
		panic(err)
	}
	if len(options.Method) > 0 {
		rpcSchema.Method.Set(strings.ToLower(options.Method))
	}
	if len(options.Path) > 0 {
		rpcSchema.Path = app.options.RpcPathPrefix + options.Path
	}
	if len(options.Description) > 0 {
		rpcSchema.Description.Set(options.Description)
	}
	if options.IsDeprecated {
		rpcSchema.IsDeprecated.Set(options.IsDeprecated)
	}
	input := handlerType.In(0)
	if input.Kind() != reflect.Struct {
		panic("rpc input must be a struct. pointers and other types are not allowed.")
	}
	inputName := getModelName(rpcName, input.Name(), "Input")
	hasInput := !utils.IsEmptyMessage(input)
	if hasInput {
		inputDefContext := newTypeDefContext(encodingOpts)
		inputSchema, inputSchemaErr := typeToTypeDef(input, inputDefContext)
		if inputSchemaErr != nil {
			panic(inputSchemaErr)
		}
		if inputSchema.Metadata.IsNone() {
			panic("Procedures cannot accept anonymous structs")
		}
		rpcSchema.Input.Set(inputName)
		app.definitions.Set(inputName, *inputSchema)
	} else {
		rpcSchema.Input.Unset()
	}
	output := reflect.TypeFor[TOutput]()
	if output.Kind() == reflect.Ptr {
		output = output.Elem()
	}
	outputName := getModelName(rpcName, output.Name(), "Output")
	hasOutput := !utils.IsEmptyMessage(output)
	if hasOutput {
		outputDefContext := newTypeDefContext(encodingOpts)
		outputSchema, outputSchemaErr := typeToTypeDef(output, outputDefContext)
		if outputSchemaErr != nil {
			panic(outputSchemaErr)
		}
		rpcSchema.Output.Set(outputName)
		app.definitions.Set(outputName, *outputSchema)
	} else {
		rpcSchema.Output.Unset()
	}
	app.procedures.Set(rpcName, *rpcSchema)
	inputZero := reflect.Zero(reflect.TypeFor[TInput]())
	inputValidator := CreateValidatorFor[TInput](inputZero, encodingOpts, !hasInput)
	outputZero := reflect.Zero(reflect.TypeFor[TOutput]())
	outputValidator := CreateValidatorFor[TOutput](outputZero, encodingOpts, !hasOutput)
	for _, transport := range rpcSchema.Transports {
		adapter, ok := app.adapters[transport]
		if !ok {
			panic(fmt.Sprintf("Missing adapter for the following transport: \"%v\"", transport))
		}
		adapter.RegisterOutputStreamRpc(
			rpcName,
			*rpcSchema,
			inputValidator,
			outputValidator,
			func(p any, eventStream UntypedEventStream, req Request[TMeta]) RpcError {
				es := TypedEventStream[TOutput]{rawStream: eventStream}
				return handler(
					p.(TInput),
					es,
					req,
				)
			})
	}
}
