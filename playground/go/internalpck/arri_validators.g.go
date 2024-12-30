package internalpck

import (
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
	"github.com/tidwall/gjson"
)

func (_input_ *User) CompiledDecodeJSON(_data_ *gjson.Result, _dc_ *arri.DecoderContext) *arri.ValidationError {
	if _data_.Type != gjson.JSON {
		err := arri.NewValidationError("expected object got "+_data_.Type.String(), _dc_.InstancePath, _dc_.SchemaPath)
		return &err
	}
	id := _data_.Get("id")
	if id.Type == gjson.String {
		_input_.Id = id.String()
	} else {
		_dc_.Errors = append(
			_dc_.Errors,
			arri.NewValidationError(
				"expected string got "+id.Type.String(),
				_dc_.InstancePath+"/id",
				_dc_.SchemaPath+"/properties/id",
			),
		)
	}
	name := _data_.Get("name")
	if name.Type == gjson.String {
		_input_.Name = name.String()
	} else {
		_dc_.Errors = append(
			_dc_.Errors,
			arri.NewValidationError(
				"expected string got "+id.Type.String(),
				_dc_.InstancePath+"/name",
				_dc_.SchemaPath+"/properties/name",
			),
		)
	}
	isAdmin := _data_.Get("isAdmin")
	if isAdmin.Type == gjson.True {
		_input_.IsAdmin.Set(true)
	} else if isAdmin.Type == gjson.False {
		_input_.IsAdmin.Set(false)
	}
	return nil
}

func (_input_ User) CompiledEncodeJSON(_state_ *arri.EncodeState) error {
	_state_.Bytes = append(_state_.Bytes, '{')
	_state_.Bytes = append(_state_.Bytes, "\"id\":"...)
	_state_.Bytes = arri.AppendNormalizedStringV2(_state_.Bytes, _input_.Id)
	_state_.Bytes = append(_state_.Bytes, ",\"name\":"...)
	_state_.Bytes = arri.AppendNormalizedStringV2(_state_.Bytes, _input_.Name)
	_state_.Bytes = append(_state_.Bytes, '}')
	return nil
}

func TestIsCompiledArriModel(t *testing.T) {
	arri.IsCompiledArriModel(&User{})
}
