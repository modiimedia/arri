// cspell:disable
package internalpck

import (
	arri "github.com/modiimedia/arri/languages/go/go-server"
	"github.com/tidwall/gjson"
	"strconv"
)

func (_input_ *User) CompiledDecodeJSON(_data_ *gjson.Result, _dc_ *arri.DecoderContext) {
	if _dc_.Depth > _dc_.MaxDepth {
		_dc_.Errors = append(_dc_.Errors, arri.NewValidationError("exceeded max depth", _dc_.InstancePath, _dc_.SchemaPath))
		return
	}
	_depth_ := _dc_.Depth
	_instancePath_ := _dc_.InstancePath
	_schemaPath_ := _dc_.SchemaPath
	_Id_ := _data_.Get("id")
	if _Id_.Type == gjson.String {
		_input_.Id = _Id_.String()
	} else {
		_dc_.Errors = append(_dc_.Errors, arri.NewValidationError("expected string", _dc_.InstancePath, _dc_.SchemaPath))
	}
	_Name_ := _data_.Get("name")
	if _Name_.Type == gjson.String {
		_input_.Name = _Name_.String()
	} else {
		_dc_.Errors = append(_dc_.Errors, arri.NewValidationError("expected string", _dc_.InstancePath, _dc_.SchemaPath))
	}
	_IsAdmin_ := _data_.Get("isAdmin")
	if _IsAdmin_.Type == gjson.True {
		_input_.IsAdmin.Set(true)
	} else if _IsAdmin_.Type == gjson.False {
		_input_.IsAdmin.Set(false)
	}
	_Settings_ := _data_.Get("settings")
	if _Settings_.Type == gjson.JSON {
		_settingsprefersDarkModeData_ := Settings{}
		_settingsprefersDarkModeData_.CompiledDecodeJSON(&_Settings_, _dc_)
		_input_.Settings = _settingsprefersDarkModeData_
	} else {
		_dc_.Errors = append(_dc_.Errors, arri.NewValidationError("expect object", _dc_.InstancePath, _dc_.SchemaPath))
	}

	_dc_.Depth = _depth_
	_dc_.InstancePath = _instancePath_
	_dc_.SchemaPath = _schemaPath_
}

func (_input_ User) CompiledEncodeJSON(_state_ *arri.EncodeState) error {
	_state_.Bytes = arri.AppendNormalizedStringV2(_state_.Bytes, _input_.Id)
	_state_.Bytes = arri.AppendNormalizedStringV2(_state_.Bytes, _input_.Name)
	if _input_.IsAdmin.IsSome() {
		_state_.Bytes = strconv.AppendBool(_state_.Bytes, _input_.IsAdmin.Unwrap())
	}
	_input_.Settings.CompiledEncodeJSON(_state_)
	return nil
}

func (_input_ *Settings) CompiledDecodeJSON(_data_ *gjson.Result, _dc_ *arri.DecoderContext) {
	if _dc_.Depth > _dc_.MaxDepth {
		_dc_.Errors = append(_dc_.Errors, arri.NewValidationError("exceeded max depth", _dc_.InstancePath, _dc_.SchemaPath))
		return
	}
	_depth_ := _dc_.Depth
	_instancePath_ := _dc_.InstancePath
	_schemaPath_ := _dc_.SchemaPath
	_PrefersDarkMode_ := _data_.Get("prefersDarkMode")
	if _PrefersDarkMode_.Type == gjson.True {
		_input_.PrefersDarkMode = true
	} else if _PrefersDarkMode_.Type == gjson.False {
		_input_.PrefersDarkMode = false
	} else {
		_dc_.Errors = append(_dc_.Errors, arri.NewValidationError("expected bool", _dc_.InstancePath, _dc_.SchemaPath))
	}

	_dc_.Depth = _depth_
	_dc_.InstancePath = _instancePath_
	_dc_.SchemaPath = _schemaPath_
}

func (_input_ Settings) CompiledEncodeJSON(_state_ *arri.EncodeState) error {
	_state_.Bytes = strconv.AppendBool(_state_.Bytes, _input_.PrefersDarkMode)
	return nil
}

func TestIsCompiledArriModel() {
	arri.IsCompiledArriModel(&User{})
	arri.IsCompiledArriModel(&Settings{})
}
