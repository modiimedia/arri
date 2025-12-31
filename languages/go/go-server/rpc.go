package arri

import (
	"fmt"
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
	Transports   []string
}

func rpc[TInput, TOutput any, TMeta any](app *App[TMeta], serviceName string, options RpcOptions, handler func(TInput, Request[TMeta]) (TOutput, RpcError)) {
	handlerType := reflect.TypeOf(handler)
	rpcSchema, rpcError := ToRpcDef(handler, RpcDefOptions{
		Path:           options.Path,
		Method:         options.Method,
		Description:    options.Description,
		IsDeprecated:   options.IsDeprecated,
		OutputIsStream: false,
		Transports:     options.Transports,
	}, app.options.DefaultTransports)
	rpcName := rpcNameFromFunctionName(GetFunctionName(handler))
	encodingOpts := EncodingOptions{
		KeyCasing: app.options.KeyCasing,
		MaxDepth:  app.options.MaxDepth,
	}
	if len(serviceName) > 0 {
		rpcName = serviceName + "." + rpcName
	}
	if len(serviceName) > 0 {
		rpcSchema.Path = app.options.RpcPathPrefix + "/" + FormatServicePath(serviceName) + rpcSchema.Http.Path
	} else {
		rpcSchema.Path = app.options.RpcPathPrefix + rpcSchema.Path
	}
	if rpcError != nil {
		panic(rpcError)
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
	output := handlerType.Out(0)
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
		adapter.RegisterRpc(
			rpcName,
			*rpcSchema,
			inputValidator,
			outputValidator,
			func(a any, e Request[TMeta]) (any, RpcError) {
				return handler(a.(TInput), e)
			},
		)
	}
}

func getModelName(rpcName string, modelName string, fallbackSuffix string) string {
	if len(modelName) == 0 {
		return strcase.ToCamel(strings.Join(strings.Split(rpcName, "."), "_") + "_" + fallbackSuffix)
	}
	return modelName
}

func Rpc[TInput, TOutput any, TMeta any](app *App[TMeta], handler func(TInput, Request[TMeta]) (TOutput, RpcError), options RpcOptions) {
	rpc(app, "", options, handler)
}

func ScopedRpc[TInput, TOutput any, TMeta any](app *App[TMeta], serviceName string, handler func(TInput, Request[TMeta]) (TOutput, RpcError), options RpcOptions) {
	rpc(app, serviceName, options, handler)
}

func FormatServicePath(path string) string {
	result := ""
	for index, part := range strings.Split(path, ".") {
		if index > 0 {
			result += "/"
		}
		result += strcase.ToKebab(part)
	}
	return result
}
