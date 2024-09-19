package arri

import (
	"flag"
	"fmt"
	"net/http"
	"os"
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
			Version     Option[string]
			SchemaPath  string
		}{
			Title:       app.Options.AppName,
			Description: app.Options.AppDescription,
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
