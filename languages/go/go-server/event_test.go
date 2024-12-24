package arri_test

import (
	"net/http"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

type CustomEvent struct {
	req *http.Request
	res http.ResponseWriter
}

func (e CustomEvent) Request() *http.Request {
	return e.req
}

func (e CustomEvent) Writer() http.ResponseWriter {
	return e.res
}

func TestIsEvent(t *testing.T) {
	if !arri.IsEvent(arri.DefaultEvent{}) {
		t.Fatal()
	}
	if !arri.IsEvent(CustomEvent{}) {
		t.Fatal()
	}
}
