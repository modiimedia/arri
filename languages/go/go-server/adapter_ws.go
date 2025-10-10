package arri

import (
	"context"
	"fmt"
	"net/http"

	"github.com/coder/websocket"
)

type WsAdapter[T any] struct {
	middlewares   [](func(req *Request[T]) RpcError)
	globalOptions AppOptions[T]
	httpRegister  HttpTransportAdapter[T]
	options       WsAdapterOptions[T]
}

type WsAdapterOptions[T any] struct {
	OnUpgrade      func(req *Request[T], connection any) // TODO: type the ws connection
	ConnectionPath string                                // defaults to "/ws"
}

func NewWsAdapter[T any](httpAdapter HttpTransportAdapter[T], options WsAdapterOptions[T]) *WsAdapter[T] {
	adapter := &WsAdapter[T]{
		httpRegister: httpAdapter,
		middlewares:  [](func(req *Request[T]) RpcError){},
		options:      options,
	}
	return adapter
}

func setupWsConnectionHandler[T any](ws *WsAdapter[T]) {
	connectionPath := ws.options.ConnectionPath
	if len(connectionPath) == 0 {
		connectionPath = "/ws"
	}
	encodingOptions := EncodingOptions{
		KeyCasing: ws.globalOptions.KeyCasing,
		MaxDepth:  ws.globalOptions.MaxDepth,
	}
	ws.httpRegister.RegisterEndpoint(connectionPath, func(w http.ResponseWriter, r *http.Request) {
		c, err := websocket.Accept(w, r, nil)
		if err != nil {
			payload, _ := EncodeJSON(ErrorWithData(400, err.Error(), Some[any](err)), encodingOptions)
			w.WriteHeader(400)
			w.Write(payload)
			return
		}
		defer c.CloseNow()
		// TODO: actually implement WS stuff
	})
}

func (_ WsAdapter[T]) TransportId() string {
	return "ws"
}

func (wa *WsAdapter[T]) RegisterRpc(name string, def RpcDef, paramValidator Validator, responseValidator Validator, handler func(any, Request[T]) (any, RpcError)) {
	// TODO
}

func (wa *WsAdapter[T]) RegisterOutputStreamRpc(
	name string,
	def RpcDef,
	paramValidator Validator,
	responseValidator Validator,
	handler func(any, UntypedStream, Request[T]) RpcError,
) {
	// TODO
}

func (ws *WsAdapter[T]) SetGlobalOptions(options AppOptions[T]) {
	ws.globalOptions = options
}

func (ws *WsAdapter[T]) Use(middleware func(req *Request[T]) RpcError) {
	ws.middlewares = append(ws.middlewares, middleware)
}

func (ws WsAdapter[T]) Start() error {
	connectionPath := ws.options.ConnectionPath
	if len(connectionPath) == 0 {
		connectionPath = "/ws"
	}
	if !ws.httpRegister.HasStarted() {
		fmt.Printf("WS Connection path: %s\n", connectionPath)
		return ws.httpRegister.Start()
	}

	fmt.Printf("WS Connection path: %s\n", connectionPath)
	return nil
}

func (ws WsAdapter[T]) HasStarted() bool {
	return ws.httpRegister.HasStarted()
}

func (ws WsAdapter[T]) Close(ctx context.Context) error {
	if ws.httpRegister.HasStarted() {
		err := ws.httpRegister.Close(ctx)
		if err != nil {
			return err
		}
	}
	// shutdown all active ws connections
	return nil
}
