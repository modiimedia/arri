package arri

import "time"

type EventStream[T any] interface {
	Start() // Send stream to client
	Send(T) RpcError
	Close(notifyClient bool)
	Done() <-chan struct{}
	SetHeartbeatInterval(time.Duration)
	SetHeartbeatEnabled(bool)
}

func IsEventStream[T any](input EventStream[T]) bool {
	return true
}

func EventStreamRpc[TParams, TResponse any, TMeta any](app *App[TMeta], handler func(TParams, EventStream[TResponse], Request[TMeta]) RpcError, options RpcOptions) {
	// TODO
}

func ScopedEventStreamRpc[TParams, TResponse any, TMeta any](app *App[TMeta], scope string, handler func(TParams, EventStream[TResponse], Request[TMeta]) RpcError, options RpcOptions) {
	// TODO
}
