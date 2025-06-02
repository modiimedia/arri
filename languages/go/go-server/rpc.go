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

func rpc[TParams, TResponse any, TMeta any](app *App[TMeta], serviceName string, options RpcOptions, handler func(TParams, Event[TMeta]) (TResponse, RpcError)) {
	handlerType := reflect.TypeOf(handler)
	rpcSchema, rpcError := ToRpcDef(handler, RpcDefOptions{
		Path:          options.Path,
		Method:        options.Method,
		Description:   options.Description,
		IsDeprecated:  options.IsDeprecated,
		IsEventStream: false,
		Transports:    options.Transports,
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
		rpcSchema.Path = app.options.RpcRoutePrefix + "/" + strcase.ToKebab(serviceName) + rpcSchema.Path
	} else {
		rpcSchema.Path = app.options.RpcRoutePrefix + rpcSchema.Path
	}
	if rpcError != nil {
		panic(rpcError)
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
		rpcSchema.Response.Set(responseName)
		app.definitions.Set(responseName, *responseSchema)
	} else {
		rpcSchema.Response.Unset()
	}
	app.procedures.Set(rpcName, *rpcSchema)
	paramsZero := reflect.Zero(reflect.TypeFor[TParams]())
	paramsValidator := CreateValidatorFor[TParams](paramsZero, encodingOpts)
	responseZero := reflect.Zero(reflect.TypeFor[TResponse]())
	responseValidator := CreateValidatorFor[TResponse](responseZero, encodingOpts)
	for _, transport := range rpcSchema.Transports {
		adapter, ok := app.adapters[transport]
		if !ok {
			panic(fmt.Sprintf("Missing adapter for the following transport: \"%v\"", transport))
		}
		adapter.RegisterRpc(
			rpcName,
			*rpcSchema,
			paramsValidator,
			responseValidator,
			func(a any, e Event[TMeta]) (any, RpcError) {
				return handler(a.(TParams), e)
			})
	}
}

func getModelName(rpcName string, modelName string, fallbackSuffix string) string {
	if len(modelName) == 0 {
		return strcase.ToCamel(strings.Join(strings.Split(rpcName, "."), "_") + "_" + fallbackSuffix)
	}
	return modelName
}

func Rpc[TParams, TResponse any, TMeta any](app *App[TMeta], handler func(TParams, Event[TMeta]) (TResponse, RpcError), options RpcOptions) {
	rpc(app, "", options, handler)
}

func ScopedRpc[TParams, TResponse any, TMeta any](app *App[TMeta], serviceName string, handler func(TParams, Event[TMeta]) (TResponse, RpcError), options RpcOptions) {
	rpc(app, serviceName, options, handler)
}
