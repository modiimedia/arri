package arri_test

import (
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

func TestIsEventStream(t *testing.T) {
	stream := arri.TypedEventStream[struct{ Foo string }]{}
	arri.IsEventStream[struct{ Foo string }](stream)
}
