package arri_test

import (
	"net/http"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

func TestHttpAdapterImplementsDesiredInterfaces(t *testing.T) {
	adapter := arri.NewHttpAdapter(http.DefaultServeMux, arri.HttpAdapterOptions[any]{})
	arri.IsTransportAdapter(adapter)
	arri.IsHttpTransportAdapter(adapter)
}

func TestHttpSseControllerImplementsEventStreamController(t *testing.T) {
	stream := arri.HttpEventStream{}
	arri.IsRawEventStream(&stream)
}
