package arri

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/lxzan/gws"
	"github.com/oklog/ulid/v2"
)

type handleObj struct {
	HandlerType         string // "STANDARD" | "OUTPUT_STREAM"
	StandardHandler     func(*gws.Conn, Message) ([]byte, RpcError)
	OutputStreamHandler func(*gws.Conn, Message) RpcError
}

type WsAdapter[T any] struct {
	middlewares     [](func(req *Request[T]) RpcError)
	streams         map[string]map[string]*WsEventStream
	globalOptions   AppOptions[T]
	httpRegister    HttpTransportAdapter[T]
	options         WsAdapterOptions[T]
	handlers        map[string]handleObj
	forwardedIpAddr map[string]string
}

type WsAdapterOptions[T any] struct {
	OnUpgrade                func(r *http.Request, connection *gws.Conn) // TODO: type the ws connection
	ConnectionPath           string
	TrustXForwardedForHeader bool // defaults to "/ws"
}

func (w *WsAdapter[T]) OnOpen(socket *gws.Conn) {
	if w.streams == nil {
		w.streams = map[string]map[string]*WsEventStream{}
	}
	sessionId := ulid.Make().String()
	socket.Session().Store("internal-session-id", sessionId)
	w.streams[sessionId] = map[string]*WsEventStream{}
	fmt.Println("new session", sessionId)
	_ = socket.SetDeadline(time.Now().Add(w.globalOptions.HeartbeatInterval + 10*time.Second))
	fmt.Println("[num streams] after open", w.streams)
}

func (w *WsAdapter[T]) OnClose(socket *gws.Conn, err error) {
	fmt.Println("on close")
	if w.streams == nil {
		return
	}
	sessionId, exists := socket.Session().Load("internal-session-id")
	sessionIdStr, ok := sessionId.(string)
	fmt.Println("closing session:", sessionIdStr)
	if !exists || !ok {
		fmt.Println("session not found")
		return
	}
	streams := w.streams[sessionIdStr]
	for _, val := range streams {
		go func() {
			val.Close(false)
		}()
	}
	delete(w.streams, sessionIdStr)
	fmt.Println("[num streams] after close:", w.streams)
}

func (w WsAdapter[T]) OnPing(socket *gws.Conn, payload []byte) {
	_ = socket.SetDeadline(time.Now().Add(w.globalOptions.HeartbeatInterval + 10*time.Second))
	_ = socket.WritePong(nil)
}

func (w WsAdapter[T]) OnPong(socket *gws.Conn, payload []byte) {
}

func (w WsAdapter[T]) OnMessage(socket *gws.Conn, message *gws.Message) {
	defer message.Close()
	sessionId := getWsSessionId(socket)
	_ = socket.SetDeadline(time.Now().Add(w.globalOptions.HeartbeatInterval + 10*time.Second))
	encodingOptions := EncodingOptions{KeyCasing: w.globalOptions.KeyCasing, MaxDepth: w.globalOptions.MaxDepth}
	arriMsg, err := DecodeMessage(message.Bytes())
	fmt.Println("MESSAGE", arriMsg)
	if err != nil {
		msgStr := message.Data.String()
		if msgStr == "ping" || msgStr == "PING" {
			return
		}
		payload := NewErrorMessage(
			arriMsg.ReqId,
			arriMsg.ContentType.UnwrapOr(ContentTypeJson),
			Headers{},
			Error(400, err.Error()),
		)
		socket.WriteAsync(gws.OpcodeText, payload.EncodeBytes(), func(err error) {})
		return
	}
	contentType := arriMsg.ContentType.UnwrapOr(ContentTypeJson)
	switch arriMsg.Type {
	case InvocationMessage:
		handler, ok := w.handlers[arriMsg.RpcName.UnwrapOr("")]
		if !ok {
			errBody, _ := EncodeJSON(Error(404, "Procedure not found"), encodingOptions)
			socket.WriteAsync(gws.OpcodeText, errBody, func(err error) {})
			return
		}
		if handler.StandardHandler != nil {
			go func() {
				response, err := handler.StandardHandler(socket, arriMsg)
				if err != nil {
					errMsg := NewErrorMessage(arriMsg.ReqId, contentType, Headers{}, err)
					socket.WriteAsync(gws.OpcodeText, errMsg.EncodeBytes(), func(err error) {})
					return
				}
				okMsg := NewOkMessage(arriMsg.ReqId, contentType, Headers{}, Some(response))
				socket.WriteAsync(gws.OpcodeText, okMsg.Body.UnwrapOr([]byte{}), func(err error) {})
			}()
			return
		}
		if handler.OutputStreamHandler != nil {
			go func() {
				err := handler.OutputStreamHandler(socket, arriMsg)
				if err != nil {
					fmt.Println("REQ_ID", arriMsg.ReqId, err)
					errMsg := NewErrorMessage(arriMsg.ReqId, contentType, Headers{}, err)
					socket.WriteAsync(gws.OpcodeText, errMsg.EncodeBytes(), func(err error) {})
					return
				}
			}()
			return
		}
	case StreamCancelMessage:
		go func() {
			streams := w.streams[sessionId]
			if streams == nil {
				fmt.Println("No streams found for session:", sessionId)
				return
			}
			stream := streams[arriMsg.ReqId]
			if stream == nil {
				fmt.Println("Couldn't find stream:", sessionId, arriMsg.ReqId)
				return
			}
			stream.Close(true)
			delete(w.streams[sessionId], arriMsg.ReqId)
		}()
		return
	}
	errMsg := NewErrorMessage(arriMsg.ReqId, ContentTypeJson, Headers{}, Error(400, "invalid message"))
	socket.WriteAsync(gws.OpcodeText, errMsg.EncodeBytes(), func(err error) {})
	socket.WriteClose(1000, errMsg.EncodeBytes())
}

func NewWsAdapter[T any](httpAdapter HttpTransportAdapter[T], options WsAdapterOptions[T]) *WsAdapter[T] {
	adapter := &WsAdapter[T]{
		httpRegister: httpAdapter,
		middlewares:  [](func(req *Request[T]) RpcError){},
		options:      options,
		streams:      map[string]map[string]*WsEventStream{},
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
		if ws.options.OnUpgrade != nil {
			ws.options.OnUpgrade(r, c)
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
	if w.handlers == nil {
		w.handlers = map[string]handleObj{}
	}
	w.handlers[name] = handleObj{
		HandlerType: "STANDARD",
		StandardHandler: func(conn *gws.Conn, msg Message) ([]byte, RpcError) {
			if msg.Type != InvocationMessage {
				return []byte{}, Error(400, fmt.Sprintf("Expected RPC invocation message. Got %s", msg.Type))
			}
			ctx := context.Background()
			params, resErr := paramValidator.DecodeJSON(msg.Body.UnwrapOr([]byte{}))
			if resErr != nil {
				return []byte{}, resErr
			}
			ipAddr := conn.RemoteAddr().String()
			if w.options.TrustXForwardedForHeader {
				// TODO get the forwarded IP addr
			}
			req := NewRequest[T](ctx, name, w.TransportId(), ipAddr, msg.ClientVersion.UnwrapOr(""), map[string]string{})
			res, resErr := handler(params, *req)
			if resErr != nil {
				return []byte{}, resErr
			}
			body, err := responseValidator.EncodeJSON(res)
			if err != nil {
				return []byte{}, Error(500, fmt.Sprintf("Error serializing response, %s", err))
			}
			response := NewOkMessage(msg.ReqId, ContentTypeJson, Headers{}, Some(body))
			return response.EncodeBytes(), nil
		},
	}
}

func (w *WsAdapter[T]) RegisterOutputStreamRpc(
	name string,
	def RpcDef,
	paramValidator Validator,
	responseValidator Validator,
	handler func(any, UntypedStream, Request[T]) RpcError,
) {
	if w.handlers == nil {
		w.handlers = map[string]handleObj{}
	}
	w.handlers[name] = handleObj{
		HandlerType: "OUTPUT_STREAM",
		OutputStreamHandler: func(conn *gws.Conn, msg Message) RpcError {
			if msg.Type != InvocationMessage {
				return Error(400, fmt.Sprintf("Expected RPC invocation message. Got %s", msg.Type))
			}
			params, resErr := paramValidator.DecodeJSON(msg.Body.UnwrapOr([]byte{}))
			if resErr != nil {
				return resErr
			}
			ipAddr := conn.RemoteAddr().String()
			if w.options.TrustXForwardedForHeader {
				// TODO
			}
			sessionId := getWsSessionId(conn)
			if w.streams[sessionId] == nil {
				w.streams[sessionId] = map[string]*WsEventStream{}
			}
			req := NewRequest[T](context.Background(), name, w.TransportId(), ipAddr, msg.ClientVersion.UnwrapOr(""), map[string]string{})
			stream := NewWsEventStream[any](conn, msg.ReqId, msg.ContentType.UnwrapOr(ContentTypeJson), w.globalOptions.KeyCasing)
			w.streams[sessionId][msg.ReqId] = stream
			fmt.Println("before ES handler")
			err := handler(params, stream, *req)
			fmt.Println("after ES handler")
			return err
		},
	}
}

func getWsSessionId(c *gws.Conn) string {
	sessionId, exists := c.Session().Load("internal-session-id")
	if !exists {
		return ""
	}
	sessionIdStr, ok := sessionId.(string)
	if !ok {
		return ""
	}
	return sessionIdStr
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
	for _, val := range w.streams {
		for _, stream := range val {
			stream.Close(false)
		}
	}
	return nil
}

type WsEventStream struct {
	reqId             string
	hasStarted        bool
	contentType       ContentType
	conn              *gws.Conn
	doneChannel       chan struct{}
	keyCasing         KeyCasing
	heartbeatTicker   *time.Ticker
	heartbeatInterval time.Duration
	heartbeatEnabled  bool
}

func NewWsEventStream[T any](
	conn *gws.Conn,
	reqId string,
	contentType ContentType,
	keyCasing KeyCasing,
) *WsEventStream {
	controller := WsEventStream{
		conn:              conn,
		hasStarted:        false,
		reqId:             reqId,
		contentType:       contentType,
		keyCasing:         keyCasing,
		heartbeatInterval: time.Second * 20,
		heartbeatEnabled:  true,
		doneChannel:       make(chan struct{}),
	}
	return &controller
}

func (es *WsEventStream) Start() {
	hbInterval := uint32(es.heartbeatInterval.Milliseconds())
	msg := NewStreamStartMessage(es.reqId, es.contentType, Some(hbInterval), Headers{})
	es.conn.WriteAsync(gws.OpcodeText, msg.EncodeBytes(), func(err error) {
		if err != nil {
			fmt.Println("Error starting WS event stream:", err)
		}
	})
	es.heartbeatTicker = time.NewTicker(es.heartbeatInterval)
	es.hasStarted = true
	go func() {
		defer es.heartbeatTicker.Stop()
		for {
			select {
			case <-es.heartbeatTicker.C:
				msg := NewHeartbeatMessage(Some(hbInterval))
				es.conn.WriteAsync(gws.OpcodeText, msg.EncodeBytes(), func(err error) {})
			case <-es.Done():
				fmt.Println("DONE in start()")
				return
			}
		}
	}()

}

func (es *WsEventStream) Send(message any) RpcError {
	if !es.hasStarted {
		es.Start()
	}
	body, err := EncodeJSON(message, EncodingOptions{KeyCasing: es.keyCasing})
	if err != nil {
		return Error(500, err.Error())
	}
	msg := NewStreamDataMessage(es.reqId, None[string](), body)
	es.conn.WriteAsync(gws.OpcodeText, msg.EncodeBytes(), func(err error) {})
	return nil
}

func (es *WsEventStream) Close(notifyClient bool) {
	if notifyClient {
		msg := NewStreamEndMessage(es.reqId, None[string]())
		es.conn.WriteAsync(gws.OpcodeText, msg.EncodeBytes(), func(err error) {
			fmt.Println("Error sending STREAM_END message to client:", err)

		})
	}
	if es.heartbeatTicker != nil {
		es.heartbeatTicker.Stop()
		es.heartbeatTicker = nil
	}

	es.doneChannel <- struct{}{}
}

func (es *WsEventStream) Done() <-chan struct{} {
	return es.doneChannel
}
