package arri

import (
	"context"
	"strings"
	"time"
)

type Request[T any] struct {
	RpcName           string
	Time              time.Time
	Transport         string
	IpAddress         string
	ClientVersion     string
	Path              string
	Headers           Headers
	setResponseHeader func(key string, val string)
	Context           context.Context
	Props             T
}

func (req *Request[T]) SetResponseHeader(key string, val string) {
	if req.setResponseHeader == nil {
		return
	}
	req.setResponseHeader(key, val)
}

func NewRequest[T any](context context.Context, rpcName string, transport string, ipAddress string, clientVersion string, headers map[string]string, setResponseHeader func(key string, val string)) *Request[T] {
	req := Request[T]{
		RpcName:           rpcName,
		Time:              time.Now(),
		Transport:         transport,
		IpAddress:         ipAddress,
		ClientVersion:     clientVersion,
		Headers:           headers,
		Context:           context,
		setResponseHeader: setResponseHeader,
	}
	return &req
}

func headersFromHttpHeaders(httpHeaders map[string][]string) Headers {
	headers := map[string]string{}
	for key, val := range httpHeaders {
		headers[key] = strings.Join(val, ",")
	}
	return headers
}

type Headers map[string]string

func (h Headers) Get(key string) string {
	if h == nil {
		h = map[string]string{}
	}
	result, ok := h[key]
	if !ok {
		return ""
	}
	return result
}

func (h Headers) Set(key string, val string) {
	if h == nil {
		h = map[string]string{}
	}
	h[key] = val
}
