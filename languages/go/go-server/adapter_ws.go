package arri

type WsAdapter[T any] struct {
	middlewares   [](func(req *Request[T]) RpcError)
	globalOptions AppOptions[T]
	httpRegister  HttpTransportAdapter[T]
}

func NewWsAdapter[T any](httpAdapter HttpTransportAdapter[T]) *WsAdapter[T] {
	return &WsAdapter[T]{
		httpRegister: httpAdapter,
		middlewares:  [](func(req *Request[T]) RpcError){},
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

func (ws *WsAdapter[T]) Use(middleware func(req *Request[T]) RpcError) {
	ws.middlewares = append(ws.middlewares, middleware)
}

func (ws WsAdapter[T]) Start() {
	if !ws.httpRegister.HasStarted() {
		ws.httpRegister.Start()
	}
}

func (ws WsAdapter[T]) HasStarted() bool {
	return ws.httpRegister.HasStarted()
}
