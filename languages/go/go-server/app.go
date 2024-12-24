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
		SchemaVersion: "0.0.7",
		Info:          info,
		Procedures:    *app.procedures,
		Definitions:   *app.definitions,
	}
}

func (app *App[TEvent]) Run(options RunOptions) error {
	defOutput := flag.String("def-out", "", "definition-out")
	appDefCmd := flag.NewFlagSet("def", flag.ExitOnError)
	appDefOutput := appDefCmd.String("output", "__definition.json", "output")
	if len(os.Args) >= 2 {
		switch os.Args[1] {
		case "def", "definition":
			appDefCmd.Parse(os.Args[2:])
			return appDefToFile(app.GetAppDefinition(), *appDefOutput, app.options.KeyCasing)
		}
	}
	if len(os.Args) > 1 {
		flag.Parse()
	}
	if len(*defOutput) > 0 {
		err := appDefToFile(app.GetAppDefinition(), *defOutput, app.options.KeyCasing)
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
	// if not set it will default to "/procedures"
	RpcRoutePrefix string
	// if not set it will default to "/{RpcRoutePrefix}/__definition"
	RpcDefinitionPath string
	OnRequest         func(*http.Request, *TEvent) RpcError
	OnBeforeResponse  func(*http.Request, *TEvent, any) RpcError
	OnAfterResponse   func(*http.Request, *TEvent, any) RpcError
	OnError           func(*http.Request, *TEvent, error)
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
	if len(app.options.RpcDefinitionPath) > 0 {
		defPath = app.options.RpcDefinitionPath
	}
	onRequest := app.options.OnRequest
	if onRequest == nil {
		onRequest = func(r *http.Request, t *TEvent) RpcError {
			return nil
		}
	}
	onBeforeResponse := app.options.OnBeforeResponse
	if onBeforeResponse == nil {
		onBeforeResponse = func(r *http.Request, t *TEvent, a any) RpcError {
			return nil
		}
	}
	onAfterResponse := app.options.OnAfterResponse
	if onAfterResponse == nil {
		onAfterResponse = func(r *http.Request, t *TEvent, a any) RpcError {
			return nil
		}
	}
	onError := app.options.OnError
	if onError == nil {
		onError = func(r *http.Request, t *TEvent, err error) {}
	}
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "application/json")
		event, err := app.createEvent(w, r)
		if err != nil {
			handleError(false, w, r, event, err, onError)
			return
		}
		err = onRequest(r, event)
		if err != nil {
			handleError(false, w, r, event, err, onError)
			return
		}
		if r.URL.Path != "/" {
			handleError(false, w, r, event, Error(404, ""), onError)
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
		err = onBeforeResponse(r, event, response)
		if err != nil {
			handleError(false, w, r, event, err, onError)
			return
		}
		jsonResult, _ := EncodeJSON(response, app.options.KeyCasing)
		w.Write(jsonResult)
		onAfterResponseErr := onAfterResponse(r, event, response)
		if onAfterResponseErr != nil {
			handleError(true, w, r, event, onAfterResponseErr, onError)
			return
		}
	})

	mux.HandleFunc(defPath, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "application/json")
		event, err := app.createEvent(w, r)
		if err != nil {
			handleError(false, w, r, event, err, onError)
			return
		}
		err = onRequest(r, event)
		if err != nil {
			handleError(false, w, r, event, err, onError)
		}
		jsonResult, _ := EncodeJSON(app.GetAppDefinition(), app.options.KeyCasing)
		beforeResponseErr := onBeforeResponse(r, event, jsonResult)
		if beforeResponseErr != nil {
			handleError(false, w, r, event, beforeResponseErr, onError)
			return
		}
		w.WriteHeader(200)
		w.Write(jsonResult)
		err = onAfterResponse(r, event, jsonResult)
		if err != nil {
			handleError(true, w, r, event, err, onError)
			return
		}
	})
	return app
}

func handleError[TEvent Event](
	responseSent bool,
	w http.ResponseWriter,
	r *http.Request,
	event *TEvent,
	err RpcError,
	onError func(*http.Request, *TEvent, error),
) {
	onError(r, event, err)
	if responseSent {
		return
	}
	w.WriteHeader(int(err.Code()))
	body := RpcErrorToJson(err)
	w.Write(body)
}

type DefOptions struct {
	IsDeprecated bool
	Description  string
}

func RegisterDef[TEvent Event](app *App[TEvent], input any, options DefOptions) {
	def, err := ToTypeDef(input, app.options.KeyCasing)
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
