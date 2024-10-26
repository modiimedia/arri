package arri

import (
	"net/http"
)

type Context interface {
	Request() *http.Request
	Writer() http.ResponseWriter
}

type DefaultContext struct {
	request *http.Request
	writer  http.ResponseWriter
}

func (c DefaultContext) Request() *http.Request {
	return c.request
}

func (c DefaultContext) Writer() http.ResponseWriter {
	return c.writer
}

func CreateDefaultContext(w http.ResponseWriter, r *http.Request) (*DefaultContext, RpcError) {
	ctx := DefaultContext{
		request: r,
		writer:  w,
	}
	return &ctx, nil
}
