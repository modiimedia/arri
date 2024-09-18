package arri

import (
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"reflect"
	"strings"

	"github.com/iancoleman/strcase"
)

type App[TContext any] struct {
	Mux                  *http.ServeMux
	Port                 uint32
	CreateContext        func(r *http.Request) (*TContext, RpcError)
	InitializationErrors []error
	Options              AppOptions[TContext]
	Procedures           *[]__orderedMapEntry__[RpcDef]
	Definitions          *[]__orderedMapEntry__[TypeDef]
}

func (app *App[TContext]) GetAppDefinition() AppDef {
	info := None[AppDefInfo]()
	name := None[string]()
	description := None[string]()
	version := None[string]()

	if len(app.Options.AppName) > 0 {
		name = Some(app.Options.AppName)
	}
	if len(app.Options.AppDescription) > 0 {
		description = Some(app.Options.AppDescription)
	}
	if len(app.Options.AppVersion) > 0 {
		version = Some(app.Options.AppVersion)
	}

	if name.IsSome() || description.IsSome() || version.IsSome() {
		info = Some(AppDefInfo{
			Name:        name,
			Description: description,
			Version:     version,
		})
	}

	return AppDef{
		SchemaVersion: "0.0.7",
		Info:          info,
		Procedures:    *app.Procedures,
		Definitions:   *app.Definitions,
	}
}

func (app *App[TContext]) Run(options RunOptions) error {
	defOutput := flag.String("def-out", "", "definition-out")
	appDefCmd := flag.NewFlagSet("def", flag.ExitOnError)
	appDefOutput := appDefCmd.String("output", "__definition.json", "output")
	if len(os.Args) >= 2 {
		switch os.Args[1] {
		case "def", "definition":
			appDefCmd.Parse(os.Args[2:])
			return appDefToFile(app.GetAppDefinition(), *appDefOutput, app.Options.KeyCasing)
		}
	}
	if len(os.Args) > 1 {
		flag.Parse()
	}
	if len(*defOutput) > 0 {
		err := appDefToFile(app.GetAppDefinition(), *defOutput, app.Options.KeyCasing)
		if err != nil {
			return err
		}
	}
	return startServer(app, options)
}

func appDefToFile(appDef AppDef, output string, keyCasing KeyCasing) error {
	appDefJson, appDefJsonErr := EncodeJSON(appDef, keyCasing)
	if appDefJsonErr != nil {
		return appDefJsonErr
	}
	writeFileErr := os.WriteFile(output, appDefJson, 0644)
	if writeFileErr != nil {
		return writeFileErr
	}
	return nil
}

func startServer[TContext any](app *App[TContext], options RunOptions) error {
	port := app.Port
	if port == 0 {
		port = 3000
	}
	keyFile := options.KeyFile
	certFile := options.CertFile
	if len(keyFile) > 0 && len(certFile) > 0 {
		fmt.Printf("Starting server at https://localhost:%v\n", port)
		return http.ListenAndServeTLS(fmt.Sprintf(":%v", port), certFile, keyFile, app.Mux)
	}
	fmt.Printf("Starting server at http://localhost:%v\n", port)
	return http.ListenAndServe(fmt.Sprintf(":%v", port), app.Mux)
}

type RunOptions struct {
	Port     uint32
	CertFile string
	KeyFile  string
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
	OnRequest         func(*http.Request, *TContext) RpcError
	OnBeforeResponse  func(*http.Request, *TContext, any) RpcError
	OnAfterResponse   func(*http.Request, *TContext, any) RpcError
	OnError           func(*http.Request, *TContext, error)
}

func NewApp[TContext any](mux *http.ServeMux, options AppOptions[TContext], createContext func(r *http.Request) (*TContext, RpcError)) App[TContext] {
	app := App[TContext]{
		Mux:                  mux,
		CreateContext:        createContext,
		Options:              options,
		InitializationErrors: []error{},
		Procedures:           &[]__orderedMapEntry__[RpcDef]{},
		Definitions:          &[]__orderedMapEntry__[TypeDef]{},
	}
	defPath := app.Options.RpcRoutePrefix + "/__definition"
	if len(app.Options.RpcDefinitionPath) > 0 {
		defPath = app.Options.RpcDefinitionPath
	}
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
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "application/json")
		ctx, ctxErr := app.CreateContext(r)
		if ctxErr != nil {
			handleError(false, w, r, ctx, ctxErr, onError)
			return
		}
		onRequestErr := onRequest(r, ctx)
		if onRequestErr != nil {
			handleError(false, w, r, ctx, onRequestErr, onError)
			return
		}
		if r.URL.Path != "/" {
			handleError(false, w, r, ctx, Error(404, "Not Round"), onError)
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
		onBeforeResponseErr := onBeforeResponse(r, ctx, response)
		if onBeforeResponseErr != nil {
			handleError(false, w, r, ctx, onBeforeResponseErr, onError)
			return
		}
		jsonResult, _ := EncodeJSON(response, app.Options.KeyCasing)
		w.Write(jsonResult)
		onAfterResponseErr := onAfterResponse(r, ctx, response)
		if onAfterResponseErr != nil {
			handleError(true, w, r, ctx, onAfterResponseErr, onError)
			return
		}
	})

	mux.HandleFunc(defPath, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "application/json")
		ctx, ctxErr := app.CreateContext(r)
		if ctxErr != nil {
			handleError(false, w, r, ctx, ctxErr, onError)
			return
		}
		onRequestError := onRequest(r, ctx)
		if onRequestError != nil {
			handleError(false, w, r, ctx, onRequestError, onError)
		}
		jsonResult, _ := EncodeJSON(app.GetAppDefinition(), app.Options.KeyCasing)
		beforeResponseErr := onBeforeResponse(r, ctx, jsonResult)
		if beforeResponseErr != nil {
			handleError(false, w, r, ctx, beforeResponseErr, onError)
			return
		}
		w.WriteHeader(200)
		w.Write(jsonResult)
		afterResponseErr := onAfterResponse(r, ctx, jsonResult)
		if afterResponseErr != nil {
			handleError(true, w, r, ctx, afterResponseErr, onError)
			return
		}
	})
	return app
}

func handleError[TContext any](
	responseSent bool,
	w http.ResponseWriter,
	r *http.Request,
	context *TContext,
	err RpcError,
	onError func(*http.Request, *TContext, error),
) {
	onError(r, context, err)
	if responseSent {
		return
	}
	w.WriteHeader(int(err.Code()))
	body := RpcErrorToJson(err)
	w.Write(body)
}

type RpcOptions struct {
	Path         string
	Method       HttpMethod
	Description  string
	IsDeprecated bool
}

func rpc[TParams, TResponse, TContext any](app *App[TContext], serviceName Option[string], options Option[RpcOptions], handler func(TParams, TContext) (TResponse, RpcError)) {
	handlerType := reflect.TypeOf(handler)
	rpcSchema, rpcError := ToRpcDef(handler, ArriHttpRpcOptions{})
	if serviceName.IsSome() {
		rpcSchema.Http.Path = app.Options.RpcRoutePrefix + "/" + strcase.ToKebab(serviceName.Unwrap()) + rpcSchema.Http.Path
	} else {
		rpcSchema.Http.Path = app.Options.RpcRoutePrefix + rpcSchema.Http.Path
	}
	if rpcError != nil {
		panic(rpcError)
	}
	if options.IsSome() {
		rpcSchema.Http.Method = strings.ToLower(options.Unwrap().Method)
		if len(options.Unwrap().Path) > 0 {
			rpcSchema.Http.Path = app.Options.RpcRoutePrefix + options.Unwrap().Path
		}
		if len(options.Unwrap().Description) > 0 {
			rpcSchema.Http.Description = Some(options.Unwrap().Description)
		}
		if options.Unwrap().IsDeprecated {
			rpcSchema.Http.IsDeprecated = Some(options.Unwrap().IsDeprecated)
		}
	}
	params := handlerType.In(0)
	hasParams := params.Name() != "EmptyMessage"
	if hasParams {
		paramsDefContext := _NewTypeDefContext(app.Options.KeyCasing)
		paramsSchema, paramsSchemaErr := typeToTypeDef(params, paramsDefContext)
		if paramsSchemaErr != nil {
			panic(paramsSchemaErr)
		}
		rpcSchema.Http.Params = Some(paramsSchema.Metadata.Unwrap().Id)
		*app.Definitions = __updateAOrderedMap__(*app.Definitions, __orderedMapEntry__[TypeDef]{Key: paramsSchema.Metadata.Unwrap().Id, Value: *paramsSchema})

	}
	response := handlerType.Out(0)
	if response.Kind() == reflect.Ptr {
		response = response.Elem()
	}
	hasResponse := response.Name() != "EmptyMessage"
	if hasResponse {
		responseDefContext := _NewTypeDefContext(app.Options.KeyCasing)
		responseSchema, responseSchemaErr := typeToTypeDef(response, responseDefContext)
		if responseSchemaErr != nil {
			panic(responseSchemaErr)
		}
		rpcSchema.Http.Response = Some(responseSchema.Metadata.Unwrap().Id)
		*app.Definitions = __updateAOrderedMap__(*app.Definitions, __orderedMapEntry__[TypeDef]{Key: responseSchema.Metadata.Unwrap().Id, Value: *responseSchema})
	}
	rpcName := rpcNameFromFunctionName(GetFunctionName(handler))
	if serviceName.IsSome() {
		rpcName = serviceName.Unwrap() + "." + rpcName
	}
	*app.Procedures = __updateAOrderedMap__(*app.Procedures, __orderedMapEntry__[RpcDef]{Key: rpcName, Value: *rpcSchema})
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
		ctx, ctxErr := app.CreateContext(r)
		if ctxErr != nil {
			handleError(false, w, r, nil, ctxErr, app.Options.OnError)
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

func Rpc[TParams, TResponse, TContext any](app *App[TContext], handler func(TParams, TContext) (TResponse, RpcError)) {
	rpc(app, None[string](), None[RpcOptions](), handler)
}

func RpcWithOptions[TParams, TResponse, TContext any](app *App[TContext], options RpcOptions, handler func(TParams, TContext) (TResponse, RpcError)) {
	rpc(app, None[string](), Some(options), handler)
}

func ScopedRpc[TParams, TResponse, TContext any](app *App[TContext], serviceName string, handler func(TParams, TContext) (TResponse, RpcError)) {
	rpc(app, Some(serviceName), None[RpcOptions](), handler)
}

func ScopedRpcWithOptions[TParams, TResponse, TContext any](app *App[TContext], serviceName string, options RpcOptions, handler func(TParams, TContext) (TResponse, RpcError)) {
	rpc(app, Some(serviceName), Some(options), handler)
}

func RegisterDef[TContext any](app *App[TContext], input any) {
	def, err := ToTypeDef(input, app.Options.KeyCasing)
	if err != nil {
		panic(err)
	}
	*app.Definitions = __updateAOrderedMap__(*app.Definitions, __orderedMapEntry__[TypeDef]{
		Key:   def.Metadata.Unwrap().Id,
		Value: *def,
	})
}
