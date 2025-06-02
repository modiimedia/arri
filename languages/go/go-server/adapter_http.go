package arri

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/rs/cors"
)

type HttpAdapter[T any] struct {
	Mux           *http.ServeMux
	middlewares   [](func(event *Event[T]) RpcError)
	hooks         AppHooks[T]
	options       HttpAdapterOptions
	globalOptions AppOptions
}

type HttpAdapterOptions struct {
	Port             uint32
	KeyFile          string
	CertFile         string
	AllowedOrigins   []string
	AllowedMethods   []HttpMethod
	AllowCredentials bool
	AllowedHeaders   []string
}

func NewHttpAdapter[T any](mux *http.ServeMux, options HttpAdapterOptions) *HttpAdapter[T] {
	return &HttpAdapter[T]{
		Mux:         mux,
		options:     options,
		middlewares: [](func(event *Event[T]) RpcError){},
	}
}

func (a HttpAdapter[T]) TransportId() string {
	return "http"
}

func (a *HttpAdapter[T]) RegisterRpc(
	name string,
	def RpcDef,
	paramValidator Validator,
	responseValidator Validator,
	handler func(any, Event[T]) (any, RpcError),
) {
	a.Mux.HandleFunc(def.Path, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			handlePreflightRequest(w)
			return
		}
		headers := map[string]string{}
		for key, val := range r.Header {
			headers[key] = strings.Join(val, ",")
		}
		event := NewEvent[T](name, a.TransportId(), r.RemoteAddr, headers["client-version"], headers)
		method := def.Method.UnwrapOr(HttpMethodPost)
		if strings.ToLower(r.Method) != method {
			err := Error(404, "")
			handleError(false, w, event, err, a.hooks.OnError)
			return
		}
		w.Header().Add("Content-Type", "application/json")
		err := a.hooks.OnRequest(event)
		if err != nil {
			handleError(false, w, event, err, a.hooks.OnError)
			return
		}
		var params any
		switch method {
		case HttpMethodGet:
			result, err := paramValidator.DecodeURLQueryParams(r.URL.Query())
			if err != nil {
				handleError(false, w, event, err, a.hooks.OnError)
				return
			}
			params = result
			break
		default:
			b, err := io.ReadAll(r.Body)
			if err != nil {
				handleError(false, w, event, Error(400, err.Error()), a.hooks.OnError)
				return
			}
			result, decodeErr := paramValidator.DecodeJSON(b)
			if decodeErr != nil {
				handleError(false, w, event, decodeErr, a.hooks.OnError)
				return
			}
			params = result
			break
		}
		for _, middleware := range a.middlewares {
			err := middleware(event)
			if err != nil {
				handleError(false, w, event, err, a.hooks.OnError)
				return
			}
		}
		response, err := handler(params, *event)
		if err != nil {
			handleError(false, w, event, err, a.hooks.OnError)
			return
		}
		err = a.hooks.OnBeforeResponse(event, params, response)
		if err != nil {
			handleError(false, w, event, err, a.hooks.OnError)
			return
		}
		payload, payloadErr := responseValidator.EncodeJSON(response)
		if payloadErr != nil {
			handleError(false, w, event, ErrorWithData(500, payloadErr.Error(), Some[any](payloadErr)), a.hooks.OnError)
			return
		}
		w.WriteHeader(200)
		w.Write(payload)
		err = a.hooks.OnAfterResponse(event, params, response)
		if err != nil {
			handleError(true, w, event, err, a.hooks.OnError)
			return
		}
	})
}

func (a *HttpAdapter[T]) RegisterEventStreamRpc(
	name string,
	def RpcDef,
	paramValidator Validator,
	responseValidator Validator,
	handler func(any, EventStream[any], Event[T]) RpcError,
) {
	a.Mux.HandleFunc(def.Path, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			handlePreflightRequest(w)
			return
		}
		headers := map[string]string{}
		for key, val := range r.Header {
			headers[key] = strings.Join(val, ",")
		}
		event := NewEvent[T](name, a.TransportId(), r.RemoteAddr, headers["client-version"], headers)
		method := def.Method.UnwrapOr(HttpMethodPost)
		if strings.ToLower(r.Method) != method {
			err := Error(404, "")
			handleError(false, w, event, err, a.hooks.OnError)
			return
		}
		w.Header().Add("Content-Type", "application/json")
		err := a.hooks.OnRequest(event)
		if err != nil {
			handleError(false, w, event, err, a.hooks.OnError)
			return
		}
		var params any
		switch method {
		case HttpMethodGet:
			result, err := paramValidator.DecodeURLQueryParams(r.URL.Query())
			if err != nil {
				handleError(false, w, event, err, a.hooks.OnError)
				return
			}
			params = result
			break
		default:
			b, err := io.ReadAll(r.Body)
			if err != nil {
				handleError(false, w, event, Error(400, err.Error()), a.hooks.OnError)
				return
			}
			result, decodeErr := paramValidator.DecodeJSON(b)
			if decodeErr != nil {
				handleError(false, w, event, decodeErr, a.hooks.OnError)
				return
			}
			params = result
			break
		}
		for _, middleware := range a.middlewares {
			err := middleware(event)
			if err != nil {
				handleError(false, w, event, err, a.hooks.OnError)
				return
			}
		}
		stream := NewHttpEventStream[any](w, r, a.globalOptions.KeyCasing)
		responseErr := handler(params, stream, *event)
		if responseErr != nil {
			handleError(false, w, event, responseErr, a.hooks.OnError)
			return
		}
	})

}

func (a HttpAdapter[T]) Start() {
	port := a.options.Port
	if a.options.Port == 0 {
		port = 3000
	}
	methods := []string{}
	for _, val := range a.options.AllowedMethods {
		methods = append(methods, strings.ToUpper(val))
	}
	c := cors.Options{
		AllowedOrigins:   a.options.AllowedOrigins,
		AllowedMethods:   methods,
		AllowCredentials: a.options.AllowCredentials,
	}
	httpHandler := cors.New(c).Handler(a.Mux)
	if len(a.options.KeyFile) > 0 && len(a.options.CertFile) > 0 {
		printStartHttpMessage(port, true)
		http.ListenAndServeTLS(fmt.Sprintf(":%v", port), a.options.CertFile, a.options.KeyFile, httpHandler)
		return
	}
	printStartHttpMessage(port, false)
	http.ListenAndServe(fmt.Sprintf(":%v", port), httpHandler)
}

func (a HttpAdapter[T]) Use(middleware func(event *Event[T]) RpcError) {
	a.middlewares = append(a.middlewares, middleware)
}

func (a *HttpAdapter[T]) SetHooks(hooks AppHooks[T]) {
	a.hooks = hooks
}

func (a *HttpAdapter[T]) SetGlobalOptions(options AppOptions) {
	a.globalOptions = options
}

func printStartHttpMessage(port uint32, isHttps bool) {
	protocol := "http"
	if isHttps {
		protocol = "https"
	}
	baseUrl := fmt.Sprintf("%v://localhost:%v", protocol, port)
	fmt.Printf("Starting server at %v\n", baseUrl)
	// if len(app.options.RpcRoutePrefix) > 0 {
	// 	fmt.Printf("Procedures path: %v%v\n", baseUrl, app.options.RpcRoutePrefix)
	// }
	// defPath := app.options.RpcDefinitionPath
	// if len(defPath) == 0 {
	// 	defPath = "/__definition"
	// }
	// fmt.Printf("App Definition Path: %v%v\n\n", baseUrl, app.options.RpcRoutePrefix+defPath)
}

func handlePreflightRequest(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Method", "*")
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.WriteHeader(200)
	w.Write([]byte("ok"))
}

func handleError[TMeta any](
	responseSent bool,
	w http.ResponseWriter,
	event *Event[TMeta],
	err RpcError,
	onError func(*Event[TMeta], error),
) {
	onError(event, err)
	if responseSent {
		return
	}
	w.WriteHeader(int(err.Code()))
	body := RpcErrorToJSON(err)
	w.Write(body)
}

type HttpEventStream[T any] struct {
	responseController *http.ResponseController
	writer             http.ResponseWriter
	request            *http.Request
	headersSent        bool
	keyCasing          KeyCasing
	cancelFunc         context.CancelFunc
	context            context.Context
	pingTicker         *time.Ticker
	pingDuration       time.Duration
}

func NewHttpEventStream[T any](w http.ResponseWriter, r *http.Request, keyCasing KeyCasing) *HttpEventStream[T] {
	rc := http.NewResponseController(w)
	ctx, cancelFunc := context.WithCancel(r.Context())
	controller := HttpEventStream[T]{
		responseController: rc,
		writer:             w,
		request:            r,
		keyCasing:          keyCasing,
		cancelFunc:         cancelFunc,
		context:            ctx,
		pingDuration:       time.Second * 10,
	}
	return &controller
}

func isHttp2(r *http.Request) bool {
	return len(r.Header.Get(":path")) > 0 || len(r.Header.Get(":method")) > 0
}

func (controller *HttpEventStream[T]) startStream() {
	controller.writer.Header().Set("Content-Type", "text/event-stream")
	controller.writer.Header().Set("Cache-Control", "private, no-cache, no-store, no-transform, must-revalidate, max-age=0")

	// prevent nginx from buffering the response
	controller.writer.Header().Set("x-accel-buffering", "no")

	if !isHttp2(controller.request) {
		controller.writer.Header().Set("Connection", "keep-alive")
		controller.writer.Header().Set("Transfer-Encoding", "chunked")
	}

	controller.writer.WriteHeader(200)
	controller.responseController.EnableFullDuplex()
	controller.responseController.Flush()
	controller.headersSent = true
	controller.pingTicker = time.NewTicker(controller.pingDuration)
	go func() {
		defer controller.pingTicker.Stop()
		for {
			select {
			case <-controller.pingTicker.C:
				fmt.Fprintf(controller.writer, "event: ping\ndata:")
				controller.responseController.Flush()
			case <-controller.Done():
				return
			}
		}
	}()
}

func (controller *HttpEventStream[T]) Start() {
	if !controller.headersSent {
		controller.startStream()
	}
	fmt.Fprintf(controller.writer, "event: start\ndata: connection successful\n\n")
	controller.responseController.Flush()
}

func (controller *HttpEventStream[T]) Send(message T) RpcError {
	if !controller.headersSent {
		controller.startStream()
	}
	body, bodyErr := EncodeJSON(message, EncodingOptions{KeyCasing: controller.keyCasing})
	if bodyErr != nil {
		return Error(500, bodyErr.Error())
	}
	fmt.Fprintf(controller.writer, "event: message\ndata: %s\n\n", string(body))
	controller.responseController.Flush()
	return nil
}

func (controller *HttpEventStream[T]) Close(notifyClient bool) {
	if !controller.headersSent {
		controller.startStream()
	}
	if notifyClient {
		fmt.Fprint(controller.writer, "event: done\ndata: done\n\n")
		controller.responseController.Flush()
	}
	controller.cancelFunc()
}

func (controller *HttpEventStream[T]) Done() <-chan struct{} {
	return controller.context.Done()
}

func (controller HttpEventStream[T]) SetPingInterval(val time.Duration) {
	controller.pingDuration = val
}
