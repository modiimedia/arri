package arri_test

import (
	"net/http"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

func TestHttpAdapterImplementsTransportAdapter(t *testing.T) {
	adapter := arri.NewHttpAdapter[any](http.DefaultServeMux, arri.HttpAdapterOptions{})
	arri.IsTransportAdapter(adapter)
}

func TestHttpSseControllerImplementsEventStreamController(t *testing.T) {
	stream := arri.HttpEventStream[any]{}
	arri.IsEventStream[any](&stream)
}
