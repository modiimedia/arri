package arri

import (
	"flag"
	"fmt"
	"net/http"
	"os"
)

type App[TMeta any] struct {
	Mux               *http.ServeMux
	middleware        []Middleware[TMeta]
	procedures        *OrderedMap[RpcDef]
	definitions       *OrderedMap[TypeDef]
	transports        []string
	defaultTransports []string
	options           AppOptions
	hooks             AppHooks[TMeta]
	adapters          map[string]TransportAdapter[TMeta]
}

func (app *App[TEvent]) GetAppDefinition() AppDef {
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

func (app *App[TEvent]) Run(options RunOptions) error {
	if len(app.transports) == 0 {
		panic("Must specify at least one transport to run the app")
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
	return startServer(app, options)
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

func printServerStartMessages[TMeta any](app *App[TMeta], port uint32, isHttps bool) {
	protocol := "http"
	if isHttps {
		protocol = "https"
	}
	baseUrl := fmt.Sprintf("%v://localhost:%v", protocol, port)
	fmt.Printf("Starting server at %v\n", baseUrl)
	if len(app.options.RpcRoutePrefix) > 0 {
		fmt.Printf("Procedures path: %v%v\n", baseUrl, app.options.RpcRoutePrefix)
	}
	defPath := app.options.RpcDefinitionPath
	if len(defPath) == 0 {
		defPath = "/__definition"
	}
	fmt.Printf("App Definition Path: %v%v\n\n", baseUrl, app.options.RpcRoutePrefix+defPath)
}

func startServer[TMeta any](app *App[TMeta], options RunOptions) error {
	port := options.Port
	if port == 0 {
		port = 3000
	}
	keyFile := options.KeyFile
	certFile := options.CertFile
	if len(keyFile) > 0 && len(certFile) > 0 {
		printServerStartMessages(app, port, true)
		return http.ListenAndServeTLS(fmt.Sprintf(":%v", port), certFile, keyFile, app.Mux)
	}
	printServerStartMessages(app, port, false)
	return http.ListenAndServe(fmt.Sprintf(":%v", port), app.Mux)
}

type RunOptions struct {
	Port     uint32
	CertFile string
	KeyFile  string
}

type AppOptions struct {
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
	PingInterval uint32
}

type AppHooks[TMeta any] struct {
	OnRequest        func(*Event[TMeta]) RpcError
	OnBeforeResponse func(event *Event[TMeta], params any, response any) RpcError
	OnAfterResponse  func(event *Event[TMeta], params any, response any) RpcError
	OnError          func(event *Event[TMeta], err error)
}

func NewApp[TMeta any](mux *http.ServeMux, options AppOptions, hooks AppHooks[TMeta]) App[TMeta] {
	transports := options.DefaultTransports
	if len(transports) == 0 {
		transports = []string{}
	}
	app := App[TMeta]{
		Mux:               mux,
		options:           options,
		middleware:        []Middleware[TMeta]{},
		procedures:        &OrderedMap[RpcDef]{},
		definitions:       &OrderedMap[TypeDef]{},
		transports:        transports,
		defaultTransports: options.DefaultTransports,
		hooks:             hooks,
	}
	if len(app.options.RpcDefinitionPath) == 0 {
		app.options.RpcDefinitionPath = app.options.RpcRoutePrefix + "/app-definition"
	}
	if app.hooks.OnRequest == nil {
		app.hooks.OnRequest = func(t *Event[TMeta]) RpcError {
			return nil
		}
	}
	if app.hooks.OnBeforeResponse == nil {
		app.hooks.OnBeforeResponse = func(t *Event[TMeta], _ any, __ any) RpcError {
			return nil
		}
	}
	if app.hooks.OnAfterResponse == nil {
		app.hooks.OnAfterResponse = func(t *Event[TMeta], _ any, __ any) RpcError {
			return nil
		}
	}
	if app.hooks.OnError == nil {
		app.hooks.OnError = func(t *Event[TMeta], err error) {}
	}
	if app.options.PingInterval == 0 {
		app.options.PingInterval = 20000
	}
	return app
}

func UseAdapter[TMeta any](app *App[TMeta], adapter TransportAdapter[TMeta]) {
	transportId := adapter.TransportId()
	app.adapters[transportId] = adapter
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
