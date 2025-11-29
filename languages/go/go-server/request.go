package arri

import (
	"context"
	"time"
)

// Request interface that is available in every RPC call. It gives additional context about the RPC call
type Request[T any] struct {
	RpcName       string
	Time          time.Time
	Transport     string
	IpAddress     string
	ClientVersion string
	Headers       Headers // header keys are always lowercase
	Context       context.Context
	Props         T
}

func NewRequest[T any](
	context context.Context,
	rpcName string,
	transport string,
	ipAddress string,
	clientVersion string,
	headers map[string]string,
) *Request[T] {
	req := Request[T]{
		RpcName:       rpcName,
		Time:          time.Now(),
		Transport:     transport,
		IpAddress:     ipAddress,
		ClientVersion: clientVersion,
		Headers:       headers,
		Context:       context,
	}
	return &req
}
