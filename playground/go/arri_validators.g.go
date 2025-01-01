// cspell:disable
package main

import (
	arri "github.com/modiimedia/arri/languages/go/go-server"
	"github.com/tidwall/gjson"
)

func (_input_ *SayHelloParams) CompiledDecodeJSON(_data_ *gjson.Result, _dc_ *arri.DecoderContext) {
	if _dc_.Depth > _dc_.MaxDepth {
		_dc_.Errors = append(_dc_.Errors, arri.NewValidationError("exceeded max depth", _dc_.InstancePath, _dc_.SchemaPath))
		return
	}
	_depth_ := _dc_.Depth
	_instancePath_ := _dc_.InstancePath
	_schemaPath_ := _dc_.SchemaPath
	_Name_ := _data_.Get("name")
	if _Name_.Type == gjson.String {
		_input_.Name = _Name_.String()
	} else {
		_dc_.Errors = append(_dc_.Errors, arri.NewValidationError("expected string", _dc_.InstancePath, _dc_.SchemaPath))
	}

	_dc_.Depth = _depth_
	_dc_.InstancePath = _instancePath_
	_dc_.SchemaPath = _schemaPath_
}

func (_input_ SayHelloParams) CompiledEncodeJSON(_state_ *arri.EncodeState) error {
	_state_.Bytes = arri.AppendNormalizedStringV2(_state_.Bytes, _input_.Name)
	return nil
}

func (_input_ *SayHelloResponse) CompiledDecodeJSON(_data_ *gjson.Result, _dc_ *arri.DecoderContext) {
	if _dc_.Depth > _dc_.MaxDepth {
		_dc_.Errors = append(_dc_.Errors, arri.NewValidationError("exceeded max depth", _dc_.InstancePath, _dc_.SchemaPath))
		return
	}
	_depth_ := _dc_.Depth
	_instancePath_ := _dc_.InstancePath
	_schemaPath_ := _dc_.SchemaPath
	_Message_ := _data_.Get("message")
	if _Message_.Type == gjson.String {
		_input_.Message = _Message_.String()
	} else {
		_dc_.Errors = append(_dc_.Errors, arri.NewValidationError("expected string", _dc_.InstancePath, _dc_.SchemaPath))
	}

	_dc_.Depth = _depth_
	_dc_.InstancePath = _instancePath_
	_dc_.SchemaPath = _schemaPath_
}

func (_input_ SayHelloResponse) CompiledEncodeJSON(_state_ *arri.EncodeState) error {
	_state_.Bytes = arri.AppendNormalizedStringV2(_state_.Bytes, _input_.Message)
	return nil
}

func TestIsCompiledArriModel() {
	arri.IsCompiledArriModel(&SayHelloParams{})
	arri.IsCompiledArriModel(&SayHelloResponse{})
}
