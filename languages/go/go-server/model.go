package arri

import (
	"reflect"

	"github.com/tidwall/gjson"
)

type ArriModel interface {
	EncodeJSON(options EncodingOptions) ([]byte, error)
	DecodeJSON(d *gjson.Result, t reflect.Value, dc *DecoderContext) bool
	TypeDef(tc TypeDefContext) (*TypeDef, error)
}

// helper function to know if you've implemented the ArriModel interface
func IsArriModel(input ArriModel) bool {
	return true
}

type CompiledArriModel interface {
	CompiledEncodeJSON(state *EncodeState) error
	CompiledDecodeJSON(data *gjson.Result, dc *DecoderContext)
}

func IsCompiledArriModel(input CompiledArriModel) bool {
	return true
}

func CompiledDecodeJSON(target CompiledArriModel, data []byte) *DecoderError {
	parsedData := gjson.ParseBytes(data)
	dc := DecoderContext{
		MaxDepth:     5000,
		CurrentDepth: 0,
		SchemaPath:   "",
		InstancePath: "",
		KeyCasing:    KeyCasingCamelCase,
		Errors:       []ValidationError{},
		EnumValues:   []string{},
	}

	target.CompiledDecodeJSON(&parsedData, &dc)
	if len(dc.Errors) > 0 {
		finalErr := NewDecoderError(dc.Errors)
		return &finalErr
	}
	return nil
}

func CompiledEncodeJSON(input CompiledArriModel) ([]byte, error) {
	encodeState := NewEncodeState()
	err := input.CompiledEncodeJSON(encodeState)
	if err != nil {
		return encodeState.Bytes, err
	}
	return encodeState.Bytes, nil
}
