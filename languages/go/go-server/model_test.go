package arri_test

import (
	"fmt"
	"reflect"
	"strconv"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
	"github.com/tidwall/gjson"
)

type customDateFormat struct {
	seconds uint64
}

// DecodeJSON implements arri.ArriModel.
func (c customDateFormat) DecodeJSON(d *gjson.Result, t reflect.Value, dc *arri.DecoderContext) bool {
	jsonVal := d.String()
	seconds, err := strconv.ParseUint(jsonVal, 10, 64)
	if err != nil {
		dc.Errors = append(dc.Errors, arri.NewValidationError("error parsing seconds", dc.InstancePath, dc.SchemaPath))
		return false
	}
	val := customDateFormat{seconds: seconds}
	t.Set(reflect.ValueOf(val))
	return true
}

// EncodeJSON implements arri.ArriModel.
func (c customDateFormat) EncodeJSON(options arri.EncodingOptions) ([]byte, error) {
	val := []byte{}
	arri.AppendNormalizedString(&val, fmt.Sprint(c.seconds))
	return val, nil
}

// TypeDef implements arri.ArriModel.
func (c customDateFormat) TypeDef(tc arri.TypeDefContext) (*arri.TypeDef, error) {
	return &arri.TypeDef{Type: arri.Some(arri.Uint64)}, nil
}

func TestIsArriModel(t *testing.T) {
	if !arri.IsArriModel(arri.Null[string]()) {
		t.Fatal()
	}
	if !arri.IsArriModel(arri.OrderedMapWithData(arri.Pair("", ""))) {
		t.Fatal()
	}
	if !arri.IsArriModel(customDateFormat{}) {
		t.Fatal()
	}
}

func TestSerializeDeserializeCustomModel(t *testing.T) {
	target := customDateFormat{seconds: 12345}
	output, err := arri.EncodeJSON(target, options)
	if err != nil {
		t.Fatal(err)
		return
	}
	if string(output) != "\"12345\"" {
		t.Fatal()
		return
	}
	decodeErr := arri.DecodeJSON([]byte("\"54321\""), &target, options)
	if decodeErr != nil {
		t.Fatal(decodeErr)
		return
	}
	if target.seconds != 54321 {
		t.Fatal()
	}
}
