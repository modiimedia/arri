package arri

import (
	"fmt"
	"net/http"
)

type WsAdapter[T any] struct {
	Mux           *http.ServeMux
	middlewares   [](func(req *Request[T]) RpcError)
	globalOptions AppOptions[T]
}

func NewWsAdapter[T any](mux *http.ServeMux) *WsAdapter[T] {
	return &WsAdapter[T]{
		Mux:         mux,
		middlewares: [](func(req *Request[T]) RpcError){},
	}
}

func (_ WsAdapter[T]) TransportId() string {
	return "ws"
}

func (wa *WsAdapter[T]) RegisterRpc(name string, def RpcDef, paramValidator Validator, responseValidator Validator, handler func(any, Request[T]) (any, RpcError)) {
	// TODO
}

func (wa *WsAdapter[T]) RegisterEventStreamRpc(
	name string,
	def RpcDef,
	paramValidator Validator,
	responseValidator Validator,
	handler func(any, UntypedEventStream, Request[T]) RpcError,
) {
	// TODO
}

func (ws *WsAdapter[T]) SetGlobalOptions(options AppOptions[T]) {
	ws.globalOptions = options
}

func (ws *WsAdapter[T]) Use(middlware func(req *Request[T]) RpcError) {
	// TODO
}

func (ws WsAdapter[T]) Start() {
	fmt.Println("Start() not yet implemented for WsAdapter")
}
