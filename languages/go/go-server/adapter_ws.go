package arri

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/lxzan/gws"
)

type WsAdapter[T any] struct {
	middlewares   [](func(req *Request[T]) RpcError)
	globalOptions AppOptions[T]
	httpRegister  HttpTransportAdapter[T]
	options       WsAdapterOptions[T]
	handlers      map[string]func(Message) ([]byte, RpcError)
}

type WsAdapterOptions[T any] struct {
	OnUpgrade      func(req *Request[T], connection any) // TODO: type the ws connection
	ConnectionPath string                                // defaults to "/ws"
}

func (w WsAdapter[T]) OnOpen(socket *gws.Conn) {
	_ = socket.SetDeadline(time.Now().Add(w.globalOptions.HeartbeatInterval + 10*time.Second))
}

func (w WsAdapter[T]) OnClose(socket *gws.Conn, err error) {
	// TODO
}

func (w WsAdapter[T]) OnPing(socket *gws.Conn, payload []byte) {
	_ = socket.SetDeadline(time.Now().Add(w.globalOptions.HeartbeatInterval + 10*time.Second))
	_ = socket.WritePong(nil)
}

func (w WsAdapter[T]) OnPong(socket *gws.Conn, payload []byte) {}

func (w WsAdapter[T]) OnMessage(socket *gws.Conn, message *gws.Message) {
	defer message.Close()
	msg, err := DecodeMessage(message.Bytes())
	if err != nil {
		errBody, _ := EncodeJSON(err, EncodingOptions{KeyCasing: w.globalOptions.KeyCasing, MaxDepth: w.globalOptions.MaxDepth})
		socket.WriteAsync(gws.OpcodeText, errBody, func(err error) {})
		return
	}
	// TODO
}

func NewWsAdapter[T any](httpAdapter HttpTransportAdapter[T], options WsAdapterOptions[T]) *WsAdapter[T] {
	adapter := &WsAdapter[T]{
		httpRegister: httpAdapter,
		middlewares:  [](func(req *Request[T]) RpcError){},
		options:      options,
	}
	setupWsConnectionHandler(adapter)
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
		upgrader := gws.NewUpgrader(ws, &gws.ServerOption{})
		c, err := upgrader.Upgrade(w, r)
		if err != nil {
			payload, _ := EncodeJSON(ErrorWithData(400, err.Error(), Some[any](err)), encodingOptions)
			w.WriteHeader(400)
			w.Write(payload)
			return
		}
		go func() {
			c.ReadLoop()
		}()
	})
}

func (_ WsAdapter[T]) TransportId() string {
	return "ws"
}

func (w *WsAdapter[T]) RegisterRpc(name string, def RpcDef, paramValidator Validator, responseValidator Validator, handler func(any, Request[T]) (any, RpcError)) {
	w.handlers[name] = func(msg Message) ([]byte, RpcError) {
		if msg.Type != InvocationMessage {
			return []byte{}, Error(400, fmt.Sprintf("Expected RPC invocation message. Got %s", msg.Type))
		}
		ctx := context.Background()
		params, resErr := paramValidator.DecodeJSON(msg.Body.UnwrapOr([]byte{}))
		if resErr != nil {
			return []byte{}, resErr
		}
		req := NewRequest[T](ctx, name, w.TransportId(), "", "", map[string]string{})
		res, resErr := handler(params, *req)
		if resErr != nil {
			return []byte{}, resErr
		}
		body, err := responseValidator.EncodeJSON(res)
		if err != nil {
			return []byte{}, Error(500, fmt.Sprintf("Error serializing response, %s", err))
		}
		return body, nil
	}
}

func (w *WsAdapter[T]) RegisterOutputStreamRpc(
	name string,
	def RpcDef,
	paramValidator Validator,
	responseValidator Validator,
	handler func(any, UntypedStream, Request[T]) RpcError,
) {
	// TODO
}

func (w *WsAdapter[T]) SetGlobalOptions(options AppOptions[T]) {
	w.globalOptions = options
}

func (w *WsAdapter[T]) Use(middleware func(req *Request[T]) RpcError) {
	w.middlewares = append(w.middlewares, middleware)
}

func (w WsAdapter[T]) Start() error {
	connectionPath := w.options.ConnectionPath
	if len(connectionPath) == 0 {
		connectionPath = "/ws"
	}
	if !w.httpRegister.HasStarted() {
		fmt.Printf("WS Connection path: %s\n", connectionPath)
		return w.httpRegister.Start()
	}

	fmt.Printf("WS Connection path: %s\n", connectionPath)
	return nil
}

func (w WsAdapter[T]) HasStarted() bool {
	return w.httpRegister.HasStarted()
}

func (w WsAdapter[T]) Close(ctx context.Context) error {
	if w.httpRegister.HasStarted() {
		err := w.httpRegister.Close(ctx)
		if err != nil {
			return err
		}
	}
	// shutdown all active ws connections
	return nil
}
