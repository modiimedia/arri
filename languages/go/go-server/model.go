package arri

import (
	"reflect"

	"github.com/tidwall/gjson"
)

type ArriModel interface {
	EncodeJSON(keyCasing string) ([]byte, error)
	DecodeJSON(d *gjson.Result, t reflect.Value, dc *DecoderContext) bool
	TypeDef(tc TypeDefContext) (*TypeDef, error)
}

// helper function to know if you've implemented the ArriModel interface
func IsArriModel(input ArriModel) bool {
	return true
}
