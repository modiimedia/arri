package main

import (
	arri "github.com/modiimedia/arri/languages/go/go-server"
	"github.com/tidwall/gjson"
)

func (_input_ *SayHelloParams) CompiledDecodeJSON(_data_ *gjson.Result, _dc_ *arri.DecoderContext) *arri.ValidationError {
	if _data_.Type != gjson.JSON {
		_err_ := arri.NewValidationError("expected object got "+_data_.Type.String(), _dc_.InstancePath, _dc_.SchemaPath)
		return &_err_
	}

	name := _data_.Get("name")
	if name.Type == gjson.String {
		_input_.Name = name.String()
	} else {
		_dc_.Errors = append(_dc_.Errors, arri.NewValidationError("expected string", _dc_.InstancePath+"/name", _dc_.SchemaPath+"/properties/name"))
	}
	return nil
}

func (_input_ SayHelloParams) CompiledEncodeJSON(_state_ *arri.EncodeState) error {
	_state_.Bytes = append(_state_.Bytes, '{')
	_state_.Bytes = append(_state_.Bytes, "\"name\":"...)
	_state_.Bytes = arri.AppendNormalizedStringV2(_state_.Bytes, _input_.Name)
	_state_.Bytes = append(_state_.Bytes, '}')
	return nil
}

func (_input_ *SayHelloResponse) CompiledDecodeJSON(_data_ *gjson.Result, _dc_ *arri.DecoderContext) *arri.ValidationError {
	if _data_.Type != gjson.JSON {
		_err_ := arri.NewValidationError("expected object got "+_data_.Type.String(), _dc_.InstancePath, _dc_.SchemaPath)
		_dc_.Errors = append(_dc_.Errors, _err_)
		return &_err_
	}
	message := _data_.Get("message")
	if message.Type == gjson.String {
		_input_.Message = message.String()
	} else {
		_dc_.Errors = append(_dc_.Errors, arri.NewValidationError("expected string", _dc_.InstancePath+"/message", _dc_.SchemaPath+"/properties/message"))
	}
	return nil
}

func (_input_ SayHelloResponse) CompiledEncodeJSON(_state_ *arri.EncodeState) error {
	_state_.Bytes = append(_state_.Bytes, '{')
	_state_.Bytes = append(_state_.Bytes, "\"message\":"...)
	_state_.Bytes = arri.AppendNormalizedStringV2(_state_.Bytes, _input_.Message)
	_state_.Bytes = append(_state_.Bytes, '}')
	return nil
}

func TestIsCompiledArriModel() {
	arri.IsCompiledArriModel(&SayHelloParams{})
	arri.IsCompiledArriModel(&SayHelloResponse{})
}
