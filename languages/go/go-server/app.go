package arri

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
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
	var wg sync.WaitGroup
	ctx, cancel := context.WithCancel(context.Background())

	for _, adapter := range app.adapters {
		wg.Add(1)
		go func() {
			defer wg.Done()
			adapter.Start()
		}()
	}

	// Handle OS signals for graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	select {
	case <-sigChan:
		fmt.Println("Initiating graceful shutdown...")
	case <-ctx.Done():
		fmt.Println("Context cancelled. Initiating graceful shutdown...")
	}

	// Create a context with a timeout for graceful shutdown
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	// Shut down servers gracefully
	for key, adapter := range app.adapters {
		if err := adapter.Close(shutdownCtx); err != nil {
			log.Printf("[%v] Error closing: %v", key, err)
		}
	}

	// Wait for all goroutines to finish
	wg.Wait()
	fmt.Println("All servers closed.")
	cancel() // Cancel the main context
	return nil
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
	// automatically prefix the path of all procedures. Must start with a "/".
	RpcPathPrefix string
	// if not set it will default to "/{RpcRoutePrefix}/__definition"
	RpcDefinitionPath string
	// do not make the app definition publicly available
	DisableRpcDefinitionPath bool
	// do not setup a default http handler for the "/" route
	DisableHomeRoute  bool
	DefaultTransports []string
	// how long to send a "ping" message during persistent connections in ms
	// default is 20000ms
	PingInterval     uint32
	OnRequest        func(*Request[T]) RpcError
	OnBeforeResponse func(req *Request[T], params any, response any) RpcError
	OnAfterResponse  func(req *Request[T], params any, response any) RpcError
	OnError          func(req *Request[T], err error)
	// how often to send a heartbeat message over open connections default is 20 seconds
	HeartbeatInterval time.Duration
	// Enables stack traces in error responses
	Debug bool
}

type AppHooks[T any] struct {
	OnRequest        func(*Request[T]) RpcError
	OnBeforeResponse func(req *Request[T], params any, response any) RpcError
	OnAfterResponse  func(req *Request[T], params any, response any) RpcError
	OnError          func(req *Request[T], err error)
}

func NewApp[T any](options AppOptions[T]) App[T] {
	transports := options.DefaultTransports
	if len(transports) == 0 {
		transports = []string{}
	}
	if len(options.RpcPathPrefix) > 0 {
		if options.RpcPathPrefix[0] != '/' {
			panic("RpcPathPrefix must begin with a \"/\"")
		}
	}
	app := App[T]{
		options:           options,
		middleware:        []Middleware[T]{},
		procedures:        &OrderedMap[RpcDef]{},
		definitions:       &OrderedMap[TypeDef]{},
		transports:        transports,
		defaultTransports: options.DefaultTransports,
		adapters:          map[string]TransportAdapter[T]{},
	}
	if len(app.options.AppName) == 0 {
		app.options.AppName = "Arri-RPC Server"
	}
	if len(app.options.AppDescription) == 0 {
		if app.options.DisableRpcDefinitionPath {
			app.options.AppDescription = "This server utilizes Arri-RPC"
		} else {
			app.options.AppDescription = "This server utilizes Arri-RPC. Visit the definition path to see all of the available procedures."
		}
	}
	if len(app.options.RpcDefinitionPath) == 0 {
		app.options.RpcDefinitionPath = app.options.RpcPathPrefix + "/app-definition"
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

type homePageInfo struct {
	Name           Option[string] `key:"name" json:"name"`
	Description    Option[string] `key:"description" json:"description"`
	Version        Option[string] `key:"version" json:"version"`
	DefinitionPath Option[string] `key:"definitionPath" json:"definitionPath"`
}

func RegisterTransport[TMeta any](app *App[TMeta], transportAdapter TransportAdapter[TMeta]) {
	transportId := transportAdapter.TransportId()
	transportAdapter.SetGlobalOptions(app.options)
	_, alreadySet := app.adapters[transportId]
	if alreadySet {
		fmt.Printf("WARNING a transport adapter has already been registered for \"%s\"\n", transportId)
	}
	app.adapters[transportId] = transportAdapter
	httpAdapter, isHttpAdapter := transportAdapter.(HttpTransportAdapter[TMeta])
	if isHttpAdapter {
		encodingOptions := EncodingOptions{
			KeyCasing: app.options.KeyCasing,
			MaxDepth:  app.options.MaxDepth,
		}
		if !app.options.DisableHomeRoute {
			httpAdapter.RegisterEndpoint("/", func(w http.ResponseWriter, r *http.Request) {
				name := None[string]()
				description := None[string]()
				version := None[string]()
				definitionPath := None[string]()
				if len(app.options.AppName) > 0 {
					name.Set(app.options.AppName)
				}
				if len(app.options.AppDescription) > 0 {
					description.Set(app.options.AppDescription)
				}
				if len(app.options.AppVersion) > 0 {
					version.Set(app.options.AppVersion)
				}
				if !app.options.DisableRpcDefinitionPath {
					definitionPath.Set(app.options.RpcDefinitionPath)
				}
				info := homePageInfo{
					Name:           name,
					Description:    description,
					Version:        version,
					DefinitionPath: definitionPath,
				}
				payload, err := EncodeJSON(info, encodingOptions)
				if err != nil {
					w.WriteHeader(500)
					payload, _ := EncodeJSON(Error(500, err.Error()), encodingOptions)
					w.Write(payload)
					return
				}
				w.Write(payload)
			})
		}
		if !app.options.DisableRpcDefinitionPath {
			httpAdapter.RegisterEndpoint(app.options.RpcDefinitionPath, func(w http.ResponseWriter, r *http.Request) {
				payload, err := EncodeJSON(app.GetAppDefinition(), encodingOptions)
				if err != nil {
					w.WriteHeader(500)
					payload, _ := EncodeJSON(Error(500, err.Error()), encodingOptions)
					w.Write(payload)
					return
				}
				w.Write(payload)
			})
		}
	}
	shouldAppend := true
	for _, val := range app.transports {
		if val == transportId {
			shouldAppend = false
			// no need to append to transport list
			break
		}
	}
	if shouldAppend {
		app.transports = append(app.transports, transportId)
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
