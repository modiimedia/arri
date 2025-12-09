package arri_test

import (
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

func TestDecoderErrorIsRpcError(t *testing.T) {
	err := arri.NewDecoderError([]arri.ValidationError{})
	arri.IsRpcError(err)
}
