package arri

import (
	"flag"
	"os"
)

type App[T any] struct {
	middleware        []Middleware[T]
	procedures        *OrderedMap[RpcDef]
	definitions       *OrderedMap[TypeDef]
	transports        []string
	defaultTransports []string
	options           AppOptions[T]
	adapters          map[string]TransportAdapter[T]
}

func (app *App[TMeta]) GetAppDefinition() AppDef {
	info := None[AppDefInfo]()
	name := None[string]()
	description := None[string]()
	version := None[string]()

	if len(app.options.AppName) > 0 {
		name = Some(app.options.AppName)
	}
	if len(app.options.AppDescription) > 0 {
		description = Some(app.options.AppDescription)
	}
	if len(app.options.AppVersion) > 0 {
		version = Some(app.options.AppVersion)
	}

	if name.IsSome() || description.IsSome() || version.IsSome() {
		info = Some(AppDefInfo{
			Name:        name,
			Description: description,
			Version:     version,
		})
	}

	return AppDef{
		SchemaVersion: "0.0.8",
		Transports:    app.transports,
		Info:          info,
		Procedures:    *app.procedures,
		Definitions:   *app.definitions,
	}
}

func (app *App[TMeta]) Start() error {
	if len(app.transports) == 0 {
		panic("Must register at least one transport adapter")
	}
	defOutput := flag.String("def-out", "", "definition-out")
	appDefCmd := flag.NewFlagSet("def", flag.ExitOnError)
	appDefOutput := appDefCmd.String("output", "__definition.json", "output")
	encodingOptions := EncodingOptions{
		KeyCasing: app.options.KeyCasing,
		MaxDepth:  app.options.MaxDepth,
	}
	if len(os.Args) >= 2 {
		switch os.Args[1] {
		case "def", "definition":
			appDefCmd.Parse(os.Args[2:])
			return appDefToFile(app.GetAppDefinition(), *appDefOutput, encodingOptions)
		}
	}
	if len(os.Args) > 1 {
		flag.Parse()
	}
	if len(*defOutput) > 0 {
		err := appDefToFile(app.GetAppDefinition(), *defOutput, encodingOptions)
		if err != nil {
			return err
		}
	}
	panic("NOT IMPLEMENTED")
	// TODO: start all adapters
}

func appDefToFile(appDef AppDef, output string, options EncodingOptions) error {
	appDefJSON, appDefJSONErr := EncodeJSON(appDef, options)
	if appDefJSONErr != nil {
		return appDefJSONErr
	}
	writeFileErr := os.WriteFile(output, appDefJSON, 0644)
	if writeFileErr != nil {
		return writeFileErr
	}
	return nil
}

type AppOptions[T any] struct {
	AppName string
	// The current app version. Generated clients will send this in the "client-version" header
	AppVersion string
	// write a description from the generated clients
	AppDescription string
	// set the default key casing for all RPC inputs and outputs
	KeyCasing KeyCasing
	// max depth that a json input or output can be
	MaxDepth uint32
	// if not set it will default to "/procedures"
	RpcRoutePrefix string
	// if not set it will default to "/{RpcRoutePrefix}/__definition"
	RpcDefinitionPath string
	DefaultTransports []string
	// how long to send a "ping" message during persistent connections in ms
	// default is 20000ms
	PingInterval     uint32
	OnRequest        func(*Request[T]) RpcError
	OnBeforeResponse func(req *Request[T], params any, response any) RpcError
	OnAfterResponse  func(req *Request[T], params any, response any) RpcError
	OnError          func(req *Request[T], err error)
}

type AppHooks[TMeta any] struct {
	OnRequest        func(*Request[TMeta]) RpcError
	OnBeforeResponse func(req *Request[TMeta], params any, response any) RpcError
	OnAfterResponse  func(req *Request[TMeta], params any, response any) RpcError
	OnError          func(req *Request[TMeta], err error)
}

func NewApp[T any](options AppOptions[T]) App[T] {
	transports := options.DefaultTransports
	if len(transports) == 0 {
		transports = []string{}
	}
	app := App[T]{
		options:           options,
		middleware:        []Middleware[T]{},
		procedures:        &OrderedMap[RpcDef]{},
		definitions:       &OrderedMap[TypeDef]{},
		transports:        transports,
		defaultTransports: options.DefaultTransports,
	}
	if len(app.options.RpcDefinitionPath) == 0 {
		app.options.RpcDefinitionPath = app.options.RpcRoutePrefix + "/app-definition"
	}
	if app.options.OnRequest == nil {
		app.options.OnRequest = func(t *Request[T]) RpcError {
			return nil
		}
	}
	if app.options.OnBeforeResponse == nil {
		app.options.OnBeforeResponse = func(t *Request[T], _ any, __ any) RpcError {
			return nil
		}
	}
	if app.options.OnAfterResponse == nil {
		app.options.OnAfterResponse = func(t *Request[T], _ any, __ any) RpcError {
			return nil
		}
	}
	if app.options.OnError == nil {
		app.options.OnError = func(t *Request[T], err error) {}
	}
	if app.options.PingInterval == 0 {
		app.options.PingInterval = 20000
	}
	return app
}

func RegisterTransport[TMeta any](app *App[TMeta], transportAdapter TransportAdapter[TMeta]) {
	transportId := transportAdapter.TransportId()
	transportAdapter.SetGlobalOptions(app.options)
	app.adapters[transportId] = transportAdapter
	for _, val := range app.transports {
		if val == transportId {
			// no need to append to transport list
			break
		}
		app.transports = append(app.transports, val)
	}
}

func RegisterDef[T any](app *App[T], input any, options TypeDefOptions) {
	encodingOpts := EncodingOptions{
		KeyCasing: app.options.KeyCasing,
		MaxDepth:  app.options.MaxDepth,
	}
	def, err := ToTypeDef(input, encodingOpts)
	if err != nil {
		panic(err)
	}
	if def.Metadata.IsNone() || def.Metadata.Unwrap().Id.IsNone() {
		panic("cannot register anonymous structs as a definition")
	}
	if options.IsDeprecated {
		def.Metadata.Value.IsDeprecated = Some(options.IsDeprecated)
	}
	if len(options.Description) > 0 {
		def.Metadata.Value.Description = Some(options.Description)
	}
	app.definitions.Set(def.Metadata.Unwrap().Id.Unwrap(), *def)
}
