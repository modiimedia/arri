package internalpck

import (
	"strconv"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
	"github.com/tidwall/gjson"
)

func (_input_ *User) CompiledDecodeJSON(_data_ *gjson.Result, _dc_ *arri.DecoderContext) {
	currentDepth := _dc_.CurrentDepth
	instancePath := _dc_.InstancePath
	schemaPath := _dc_.SchemaPath
	if _data_.Type != gjson.JSON {
		err := arri.NewValidationError("expected object got "+_data_.Type.String(), _dc_.InstancePath, _dc_.SchemaPath)
		_dc_.Errors = append(_dc_.Errors, err)
		return
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
	_settingsData_ := _data_.Get("settings")
	_dc_.CurrentDepth = currentDepth + 1
	_dc_.InstancePath = instancePath + "/settings"
	_dc_.SchemaPath = schemaPath + "/properties/settings"
	_input_.Settings = __compileDecodeJSONSettingsImpl__(&_settingsData_, _dc_)
	_dc_.CurrentDepth = currentDepth
	_dc_.InstancePath = instancePath
	_dc_.SchemaPath = schemaPath
}

func (_input_ User) CompiledEncodeJSON(_state_ *arri.EncodeState) error {
	_state_.Bytes = append(_state_.Bytes, '{')
	_state_.Bytes = append(_state_.Bytes, "\"id\":"...)
	_state_.Bytes = arri.AppendNormalizedStringV2(_state_.Bytes, _input_.Id)
	_state_.Bytes = append(_state_.Bytes, ",\"name\":"...)
	_state_.Bytes = arri.AppendNormalizedStringV2(_state_.Bytes, _input_.Name)
	if _input_.IsAdmin.IsSome() {
		_state_.Bytes = append(_state_.Bytes, ",\"isAdmin\":"...)
		_state_.Bytes = strconv.AppendBool(_state_.Bytes, _input_.IsAdmin.Unwrap())
	}
	_state_.Bytes = append(_state_.Bytes, ",\"settings\":"...)
	_input_.Settings.CompiledEncodeJSON(_state_)
	_state_.Bytes = append(_state_.Bytes, '}')
	return nil
}

func (_input_ *Settings) CompiledDecodeJSON(_data_ *gjson.Result, _dc_ *arri.DecoderContext) {
	if _data_.Type != gjson.JSON {
		_dc_.Errors = append(_dc_.Errors, arri.NewValidationError("expected object", _dc_.InstancePath, _dc_.SchemaPath))
		return
	}
	PrefersDarkMode := _data_.Get("prefersDarkMode")
	if PrefersDarkMode.Type == gjson.True {
		_input_.PrefersDarkMode = true
	} else if PrefersDarkMode.Type == gjson.False {
		_input_.PrefersDarkMode = false
	} else {
		_dc_.Errors = append(_dc_.Errors, arri.NewValidationError("expect boolean", _dc_.InstancePath, _dc_.SchemaPath))
	}
}

func (_input_ Settings) CompiledEncodeJSON(_state_ *arri.EncodeState) error {
	_state_.Bytes = append(_state_.Bytes, '{')
	_state_.Bytes = append(_state_.Bytes, "\"prefersDarkMode\":"...)
	_state_.Bytes = strconv.AppendBool(_state_.Bytes, _input_.PrefersDarkMode)
	_state_.Bytes = append(_state_.Bytes, '}')
	return nil
}

func __compileDecodeJSONSettingsImpl__(_data_ *gjson.Result, _dc_ *arri.DecoderContext) Settings {
	_result_ := &Settings{}
	_result_.CompiledDecodeJSON(_data_, _dc_)
	return *_result_
}

func TestIsCompiledArriModel(t *testing.T) {
	arri.IsCompiledArriModel(&User{})
	arri.IsCompiledArriModel(&Settings{})
}
