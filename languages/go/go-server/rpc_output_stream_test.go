package arri_test

import (
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

func TestIsEventStream(t *testing.T) {
	stream := arri.TypedStream[struct{ Foo string }]{}
	arri.IsStream[struct{ Foo string }](stream)
}
