package arri

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/rs/cors"
)

type HttpAdapter[T any] struct {
	Mux           *http.ServeMux
	middlewares   [](func(req *Request[T]) RpcError)
	options       HttpAdapterOptions[T]
	globalOptions AppOptions[T]
	server        *http.Server
}

type HttpAdapterOptions[T any] struct {
	Port                     uint32
	KeyFile                  string
	CertFile                 string
	AllowedOrigins           []string
	AllowedMethods           []HttpMethod
	AllowCredentials         bool
	AllowedHeaders           []string
	TrustXForwardedForHeader bool
	OnRequest                func(req *Request[T], httpReq *http.Request) RpcError
}

func NewHttpAdapter[T any](mux *http.ServeMux, options HttpAdapterOptions[T]) *HttpAdapter[T] {
	return &HttpAdapter[T]{
		Mux:         mux,
		options:     options,
		middlewares: [](func(req *Request[T]) RpcError){},
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
	handler func(any, Request[T]) (any, RpcError),
) {
	encodingOptions := EncodingOptions{KeyCasing: a.globalOptions.KeyCasing, MaxDepth: a.globalOptions.MaxDepth}
	a.Mux.HandleFunc(def.Path, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			handlePreflightRequest(w)
			return
		}
		headers := convertHttpHeaders(r.Header)
		ipAddr := r.RemoteAddr
		if a.options.TrustXForwardedForHeader {
			xForwardedFor := r.Header.Get("X-Forwarded-For")
			if len(xForwardedFor) > 0 {
				ipAddr = xForwardedFor
			}
		}
		req := NewRequest[T](r.Context(), name, a.TransportId(), ipAddr, headers["client-version"], headers)
		method := def.Method.UnwrapOr(HttpMethodPost)
		if strings.ToLower(r.Method) != method {
			err := Error(404, "")
			handleError(false, w, req, err, a.globalOptions.OnError, encodingOptions)
			return
		}
		w.Header().Add("Content-Type", "application/json")
		if a.options.OnRequest != nil {
			err := a.options.OnRequest(req, r)
			if err != nil {
				handleError(false, w, req, err, a.globalOptions.OnError, encodingOptions)
				return
			}
		}
		err := a.globalOptions.OnRequest(req)
		if err != nil {
			handleError(false, w, req, err, a.globalOptions.OnError, encodingOptions)
			return
		}
		var params any
		switch method {
		case HttpMethodGet:
			result, err := paramValidator.DecodeURLQueryParams(r.URL.Query())
			if err != nil {
				handleError(false, w, req, err, a.globalOptions.OnError, encodingOptions)
				return
			}
			params = result
		default:
			b, err := io.ReadAll(r.Body)
			if err != nil {
				handleError(false, w, req, Error(400, err.Error()), a.globalOptions.OnError, encodingOptions)
				return
			}
			result, decodeErr := paramValidator.DecodeJSON(b)
			if decodeErr != nil {
				handleError(false, w, req, decodeErr, a.globalOptions.OnError, encodingOptions)
				return
			}
			params = result
		}
		for _, middleware := range a.middlewares {
			err := middleware(req)
			if err != nil {
				handleError(false, w, req, err, a.globalOptions.OnError, encodingOptions)
				return
			}
		}
		response, err := handler(params, *req)
		if err != nil {
			handleError(false, w, req, err, a.globalOptions.OnError, encodingOptions)
			return
		}
		err = a.globalOptions.OnBeforeResponse(req, params, response)
		if err != nil {
			handleError(false, w, req, err, a.globalOptions.OnError, encodingOptions)
			return
		}
		payload, payloadErr := responseValidator.EncodeJSON(response)
		if payloadErr != nil {
			handleError(false, w, req, ErrorWithData(500, payloadErr.Error(), Some[any](payloadErr)), a.globalOptions.OnError, encodingOptions)
			return
		}
		w.WriteHeader(200)
		w.Write(payload)
		err = a.globalOptions.OnAfterResponse(req, params, response)
		if err != nil {
			handleError(true, w, req, err, a.globalOptions.OnError, encodingOptions)
			return
		}
	})
}

func convertHttpHeaders(input http.Header) Headers {
	headers := map[string]string{}
	for key, val := range input {
		headers[strings.ToLower(key)] = strings.Join(val, ",")
	}
	return headers
}

func (a *HttpAdapter[T]) RegisterOutputStreamRpc(
	name string,
	def RpcDef,
	paramValidator Validator,
	responseValidator Validator,
	handler func(any, UntypedStream, Request[T]) RpcError,
) {
	encodingOptions := EncodingOptions{KeyCasing: a.globalOptions.KeyCasing, MaxDepth: a.globalOptions.MaxDepth}
	a.Mux.HandleFunc(def.Path, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			handlePreflightRequest(w)
			return
		}
		headers := convertHttpHeaders(r.Header)
		ipAddr := r.RemoteAddr
		if a.options.TrustXForwardedForHeader {
			xForwardedFor := r.Header.Get("X-Forwarded-For")
			if len(xForwardedFor) > 0 {
				ipAddr = xForwardedFor
			}
		}
		req := NewRequest[T](r.Context(), name, a.TransportId(), ipAddr, headers["client-version"], headers)
		method := def.Method.UnwrapOr(HttpMethodPost)
		if strings.ToLower(r.Method) != method {
			err := Error(404, "")
			handleError(false, w, req, err, a.globalOptions.OnError, encodingOptions)
			return
		}
		w.Header().Add("Content-Type", "application/json")
		err := a.globalOptions.OnRequest(req)
		if err != nil {
			handleError(false, w, req, err, a.globalOptions.OnError, encodingOptions)
			return
		}
		var params any
		switch method {
		case HttpMethodGet:
			result, err := paramValidator.DecodeURLQueryParams(r.URL.Query())
			if err != nil {
				handleError(false, w, req, err, a.globalOptions.OnError, encodingOptions)
				return
			}
			params = result
		default:
			b, err := io.ReadAll(r.Body)
			if err != nil {
				handleError(false, w, req, Error(400, err.Error()), a.globalOptions.OnError, encodingOptions)
				return
			}
			result, decodeErr := paramValidator.DecodeJSON(b)
			if decodeErr != nil {
				handleError(false, w, req, decodeErr, a.globalOptions.OnError, encodingOptions)
				return
			}
			params = result
		}
		for _, middleware := range a.middlewares {
			err := middleware(req)
			if err != nil {
				handleError(false, w, req, err, a.globalOptions.OnError, encodingOptions)
				return
			}
		}
		stream := NewHttpEventStream[any](w, r, a.globalOptions.KeyCasing)
		responseErr := handler(params, stream, *req)
		if responseErr != nil {
			handleError(
				false,
				w,
				req,
				responseErr,
				a.globalOptions.OnError,
				encodingOptions,
			)
			return
		}
	})

}

func (a *HttpAdapter[T]) Start() error {
	if a.HasStarted() {
		return nil
	}
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
	server := &http.Server{Addr: fmt.Sprintf(":%v", port), Handler: httpHandler}
	if len(a.options.KeyFile) > 0 && len(a.options.CertFile) > 0 {
		printStartHttpMessage(port, true, a.globalOptions)
		a.server = server
		return server.ListenAndServeTLS(a.options.CertFile, a.options.KeyFile)
	}
	printStartHttpMessage(port, false, a.globalOptions)
	a.server = server
	return server.ListenAndServe()
}

func (a *HttpAdapter[T]) Close(ctx context.Context) error {
	if a.server == nil {
		return nil
	}
	err := a.server.Shutdown(ctx)
	if err != nil {
		return err
	}
	a.server = nil
	return nil
}

func (a *HttpAdapter[T]) HasStarted() bool {
	return a.server != nil
}

func (a *HttpAdapter[T]) Use(middleware func(req *Request[T]) RpcError) {
	a.middlewares = append(a.middlewares, middleware)
}

func (a *HttpAdapter[T]) SetGlobalOptions(options AppOptions[T]) {
	a.globalOptions = options
}

func (a HttpAdapter[T]) RegisterEndpoint(pattern string, handler func(w http.ResponseWriter, r *http.Request)) {
	a.Mux.HandleFunc(pattern, handler)
}

func printStartHttpMessage[T any](port uint32, isHttps bool, options AppOptions[T]) {
	protocol := "http"
	if isHttps {
		protocol = "https"
	}
	baseUrl := fmt.Sprintf("%v://localhost:%v", protocol, port)
	fmt.Printf("Starting server at %v\n", baseUrl)
	if !options.DisableRpcDefinitionPath {
		fmt.Printf("Definition path: %v\n", baseUrl+options.RpcDefinitionPath)
	}
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
	req *Request[TMeta],
	err RpcError,
	onError func(*Request[TMeta], error),
	encodingOptions EncodingOptions,
) {
	onError(req, err)
	if responseSent {
		return
	}
	w.Header().Set("err-code", fmt.Sprint(err.Code()))
	w.Header().Set("err-msg", fmt.Sprint(err.Error()))
	w.WriteHeader(int(err.Code()))
	body := RpcErrorToJSON(err, encodingOptions)
	w.Write(body)
}

type HttpEventStream struct {
	responseController *http.ResponseController
	writer             http.ResponseWriter
	request            *http.Request
	headersSent        bool
	keyCasing          KeyCasing
	cancelFunc         context.CancelFunc
	context            context.Context
	heartbeatTicker    *time.Ticker
	heartbeatInterval  time.Duration
	heartbeatEnabled   bool
}

func NewHttpEventStream[T any](w http.ResponseWriter, r *http.Request, keyCasing KeyCasing) *HttpEventStream {
	rc := http.NewResponseController(w)
	ctx, cancelFunc := context.WithCancel(r.Context())
	controller := HttpEventStream{
		responseController: rc,
		writer:             w,
		request:            r,
		keyCasing:          keyCasing,
		cancelFunc:         cancelFunc,
		context:            ctx,
		heartbeatInterval:  time.Second * 20,
		heartbeatEnabled:   true,
	}
	return &controller
}

func IsHttp2(r *http.Request) bool {
	return len(r.Header.Get(":path")) > 0 || len(r.Header.Get(":method")) > 0
}

func (controller *HttpEventStream) startStream() {
	controller.writer.Header().Set("Content-Type", "text/event-stream")
	controller.writer.Header().Set("Cache-Control", "private, no-cache, no-store, no-transform, must-revalidate, max-age=0")
	if controller.heartbeatEnabled {
		controller.writer.Header().Set("heartbeat-interval", strconv.FormatInt(controller.heartbeatInterval.Milliseconds(), 10))
	}

	// prevent nginx from buffering the response
	controller.writer.Header().Set("x-accel-buffering", "no")

	if !IsHttp2(controller.request) {
		controller.writer.Header().Set("Connection", "keep-alive")
		controller.writer.Header().Set("Transfer-Encoding", "chunked")
	}

	controller.writer.WriteHeader(200)
	controller.responseController.EnableFullDuplex()
	controller.responseController.Flush()
	controller.headersSent = true
	fmt.Fprintf(controller.writer, "event: start\ndata: connection successful\n\n")
	controller.heartbeatTicker = time.NewTicker(controller.heartbeatInterval)
	go func() {
		defer controller.heartbeatTicker.Stop()
		for {
			select {
			case <-controller.heartbeatTicker.C:
				fmt.Fprintf(controller.writer, "event: heartbeat\ndata:\n\n")
				controller.responseController.Flush()
			case <-controller.Done():
				return
			}
		}
	}()
}

func (controller *HttpEventStream) Start() {
	if !controller.headersSent {
		controller.startStream()
	}
	fmt.Fprintf(controller.writer, "event: start\ndata: connection successful\n\n")
	controller.responseController.Flush()
}

func (controller *HttpEventStream) Send(message any) RpcError {
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

func (controller *HttpEventStream) Close(notifyClient bool) {
	if !controller.headersSent {
		controller.startStream()
	}
	if notifyClient {
		fmt.Fprint(controller.writer, "event: end\ndata: done\n\n")
		controller.responseController.Flush()
	}
	controller.cancelFunc()
}

func (controller *HttpEventStream) Done() <-chan struct{} {
	return controller.context.Done()
}
