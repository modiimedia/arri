package arri

import (
	"flag"
	"fmt"
	"net/http"
	"os"
)

type App[TEvent Event] struct {
	Mux                  *http.ServeMux
	createEvent          func(w http.ResponseWriter, r *http.Request) (*TEvent, RpcError)
	initializationErrors []error
	options              AppOptions[TEvent]
	middleware           []Middleware[TEvent]
	procedures           *OrderedMap[RpcDef]
	definitions          *OrderedMap[TypeDef]
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
		Info:          info,
		Procedures:    *app.procedures,
		Definitions:   *app.definitions,
	}
}

func (app *App[TEvent]) Run(options RunOptions) error {
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

func printServerStartMessages[TEvent Event](app *App[TEvent], port uint32, isHttps bool) {
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

func startServer[TEvent Event](app *App[TEvent], options RunOptions) error {
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

type AppOptions[TEvent Event] struct {
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
	OnRequest         func(*TEvent) RpcError
	OnBeforeResponse  func(*TEvent, any) RpcError
	OnAfterResponse   func(*TEvent, any) RpcError
	OnError           func(*TEvent, error)
}

func NewApp[TEvent Event](mux *http.ServeMux, options AppOptions[TEvent], createEvent func(w http.ResponseWriter, r *http.Request) (*TEvent, RpcError)) App[TEvent] {
	app := App[TEvent]{
		Mux:                  mux,
		createEvent:          createEvent,
		options:              options,
		initializationErrors: []error{},
		middleware:           []Middleware[TEvent]{},
		procedures:           &OrderedMap[RpcDef]{},
		definitions:          &OrderedMap[TypeDef]{},
	}
	defPath := app.options.RpcRoutePrefix + "/__definition"
	encodingOptions := EncodingOptions{
		KeyCasing: app.options.KeyCasing,
		MaxDepth:  app.options.MaxDepth,
	}
	if len(app.options.RpcDefinitionPath) > 0 {
		defPath = app.options.RpcDefinitionPath
	}
	onRequest := app.options.OnRequest
	if onRequest == nil {
		onRequest = func(t *TEvent) RpcError {
			return nil
		}
	}
	onBeforeResponse := app.options.OnBeforeResponse
	if onBeforeResponse == nil {
		onBeforeResponse = func(t *TEvent, a any) RpcError {
			return nil
		}
	}
	onAfterResponse := app.options.OnAfterResponse
	if onAfterResponse == nil {
		onAfterResponse = func(t *TEvent, a any) RpcError {
			return nil
		}
	}
	onError := app.options.OnError
	if onError == nil {
		onError = func(t *TEvent, err error) {}
	}
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			handlePreflightRequest(w)
			return
		}
		w.Header().Add("Content-Type", "application/json")
		event, err := app.createEvent(w, r)
		if err != nil {
			handleError(false, w, event, err, onError)
			return
		}
		err = onRequest(event)
		if err != nil {
			handleError(false, w, event, err, onError)
			return
		}
		if r.URL.Path != "/" {
			handleError(false, w, event, Error(404, ""), onError)
			return
		}
		w.WriteHeader(200)
		response := struct {
			Title       string
			Description string
			Version     Option[string]
			SchemaPath  string
		}{
			Title:       app.options.AppName,
			Description: app.options.AppDescription,
			Version:     None[string](),
			SchemaPath:  defPath,
		}
		if len(response.Title) == 0 {
			response.Title = "Arri-RPC Server"
		}
		if len(response.Description) == 0 {
			response.Description = "This server utilizes Arri-RPC. Visit the schema path to see all of the available procedures."
		}
		if len(options.AppVersion) > 0 {
			response.Version = Some(options.AppVersion)
		}
		err = onBeforeResponse(event, response)
		if err != nil {
			handleError(false, w, event, err, onError)
			return
		}
		jsonResult, _ := EncodeJSON(response, encodingOptions)
		w.Write(jsonResult)
		onAfterResponseErr := onAfterResponse(event, response)
		if onAfterResponseErr != nil {
			handleError(true, w, event, onAfterResponseErr, onError)
			return
		}
	})

	mux.HandleFunc(defPath, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			handlePreflightRequest(w)
			return
		}
		w.Header().Add("Content-Type", "application/json")
		event, err := app.createEvent(w, r)
		if err != nil {
			handleError(false, w, event, err, onError)
			return
		}
		err = onRequest(event)
		if err != nil {
			handleError(false, w, event, err, onError)
		}
		jsonResult, _ := EncodeJSON(app.GetAppDefinition(), encodingOptions)
		beforeResponseErr := onBeforeResponse(event, jsonResult)
		if beforeResponseErr != nil {
			handleError(false, w, event, beforeResponseErr, onError)
			return
		}
		w.WriteHeader(200)
		w.Write(jsonResult)
		err = onAfterResponse(event, jsonResult)
		if err != nil {
			handleError(true, w, event, err, onError)
			return
		}
	})
	return app
}

func handleError[TEvent Event](
	responseSent bool,
	w http.ResponseWriter,
	event *TEvent,
	err RpcError,
	onError func(*TEvent, error),
) {
	onError(event, err)
	if responseSent {
		return
	}
	w.WriteHeader(int(err.Code()))
	body := RpcErrorToJSON(err)
	w.Write(body)
}

type DefOptions struct {
	IsDeprecated bool
	Description  string
}

func RegisterDef[TEvent Event](app *App[TEvent], input any, options DefOptions) {
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
