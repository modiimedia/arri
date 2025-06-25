package arri_test

import (
	"net/http"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

func TestWsAdapterFulfillsInterface(t *testing.T) {
	adapter := arri.NewWsAdapter[any](http.DefaultServeMux)
	arri.IsTransportAdapter[any](adapter)
}
