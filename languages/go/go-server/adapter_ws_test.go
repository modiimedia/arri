package arri_test

import (
	"net/http"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

func TestWsAdapterFulfillsInterface(t *testing.T) {
	adapter := arri.NewWsAdapter(
		arri.NewHttpAdapter(http.DefaultServeMux, arri.HttpAdapterOptions[any]{}),
		arri.WsAdapterOptions[any]{},
	)
	arri.IsTransportAdapter(adapter)
}
