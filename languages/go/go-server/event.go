package arri

import (
	"net/http"
)

// Event interface that is available in every RPC call
type Event interface {
	Request() *http.Request
	Writer() http.ResponseWriter
}

// type helper function to help you know if you've fulfilled the IsEvent interface
func IsEvent(input Event) bool {
	return true
}

type DefaultEvent struct {
	request *http.Request
	writer  http.ResponseWriter
}

func (c DefaultEvent) Request() *http.Request {
	return c.request
}

func (c DefaultEvent) Writer() http.ResponseWriter {
	return c.writer
}

func CreateDefaultEvent(w http.ResponseWriter, r *http.Request) (*DefaultEvent, RpcError) {
	event := DefaultEvent{
		request: r,
		writer:  w,
	}
	return &event, nil
}
