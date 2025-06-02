package arri

import (
	"time"
)

// Event interface that is available in every RPC call
type Event[T any] struct {
	RpcName       string
	ReqStart      time.Time
	Transport     string
	IpAddress     string
	ClientVersion string
	Headers       map[string]string
	Metadata      T
}

func NewEvent[T any](rpcName string, transport string, ipAddress string, clientVersion string, headers map[string]string) *Event[T] {
	event := Event[T]{
		RpcName:       rpcName,
		ReqStart:      time.Now(),
		Transport:     transport,
		IpAddress:     ipAddress,
		ClientVersion: clientVersion,
		Headers:       headers,
	}
	return &event
}
