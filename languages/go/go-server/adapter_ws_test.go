package arri_test

import (
	"net/http"
	"testing"

	"github.com/lxzan/gws"
	arri "github.com/modiimedia/arri/languages/go/go-server"
)

func TestWsAdapterFulfillsInterface(t *testing.T) {
	adapter := arri.NewWsAdapter(
		arri.NewHttpAdapter(http.DefaultServeMux, arri.HttpAdapterOptions[any]{}),
		arri.WsAdapterOptions[any]{},
	)
	arri.IsTransportAdapter(adapter)
}

func TestWsEventStreamFulfillsInterface(t *testing.T) {
	stream := arri.NewWsEventStream[any](&gws.Conn{}, "", arri.ContentTypeJson, arri.KeyCasingCamelCase)
	arri.IsStream(stream)
}
