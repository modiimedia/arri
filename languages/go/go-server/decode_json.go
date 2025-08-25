package arri

import (
	"encoding/json"
	"fmt"
	"reflect"
	"strconv"
	"strings"
	"time"

	"github.com/iancoleman/strcase"
	"github.com/modiimedia/arri/languages/go/go-server/utils"
	"github.com/tidwall/gjson"
)

type DecoderError interface {
	error
	Code() uint32
	Data() Option[any]
	Errors() []ValidationError
}

type decoderError struct {
	errors []ValidationError
}

func (e decoderError) Code() uint32 {
	return 400
}

func (e decoderError) Errors() []ValidationError {
	if e.errors == nil {
		return []ValidationError{}
	}
	return e.errors
}

func (e decoderError) Error() string {
	if e.errors == nil {
		return ""
	}
	if len(e.errors) == 0 {
		return "Invalid input."
	}
	msg := "Invalid input. Affected properties ["

	for i := 0; i < len(e.errors); i++ {
		if i > 0 {
			msg += ", "
		}
		err := e.errors[i]
		msg += err.InstancePath
		if err.InstancePath == "" && err.SchemaPath == "" {
			return err.Message
		}
	}
	msg += "]"
	return msg
}

func (e decoderError) Data() Option[any] {
	return Some[any](e)
}

func (e decoderError) EncodeJSON(options EncodingOptions) ([]byte, error) {
	return EncodeJSON(e.errors, options)
}

func NewDecoderError(errors []ValidationError) DecoderError {
	return decoderError{errors: errors}
}

type ValidationError struct {
	Message      string
	InstancePath string
	SchemaPath   string
}

func NewValidationError(message string, instancePath string, schemaPath string) ValidationError {
	return ValidationError{
		Message:      message,
		InstancePath: instancePath,
		SchemaPath:   schemaPath,
	}
}

type DecoderContext struct {
	MaxDepth     uint32
	CurrentDepth uint32
	InstancePath string
	SchemaPath   string
	EnumValues   []string
	KeyCasing    KeyCasing
	Errors       []ValidationError
}

func (dc DecoderContext) clone() DecoderContext {
	return DecoderContext{
		MaxDepth:     dc.MaxDepth,
		CurrentDepth: dc.CurrentDepth,
		EnumValues:   dc.EnumValues,
		InstancePath: dc.InstancePath,
		SchemaPath:   dc.SchemaPath,
		KeyCasing:    dc.KeyCasing,
		Errors:       dc.Errors,
	}
}

type EncodingOptions struct {
	KeyCasing KeyCasing
	MaxDepth  uint32
}

func NewSerializationOptions(keyCasing KeyCasing, maxDepth uint32) EncodingOptions {
	return EncodingOptions{KeyCasing: keyCasing, MaxDepth: maxDepth}
}

func DecodeJSON[T any](data []byte, v *T, options EncodingOptions) DecoderError {
	parsedResult := gjson.ParseBytes(data)
	value := reflect.ValueOf(&v)
	if !parsedResult.Exists() {
		t := value.Type()
		if utils.IsNullableTypeOrPointer(t) || utils.IsOptionalType(t) {
			return nil
		}
		err := NewDecoderError([]ValidationError{NewValidationError("expected JSON input but received nothing", "", "")})
		return err
	}
	errors := []ValidationError{}
	keyCasing := options.KeyCasing
	if len(keyCasing) == 0 {
		keyCasing = KeyCasingCamelCase
	}
	maxDepth := options.MaxDepth
	if maxDepth == 0 {
		maxDepth = 200
	}
	dc := DecoderContext{
		MaxDepth:  maxDepth,
		KeyCasing: keyCasing,
		Errors:    errors,
	}
	ok := typeFromJSON(&parsedResult, value, &dc)
	if len(dc.Errors) > 0 {
		err := NewDecoderError(dc.Errors)
		return err
	}
	if !ok {
		err := NewDecoderError([]ValidationError{})
		return err
	}

	return nil
}

func typeFromJSON(data *gjson.Result, target reflect.Value, dc *DecoderContext) bool {
	if dc.CurrentDepth > dc.MaxDepth {
		dc.Errors = append(
			dc.Errors,
			NewValidationError(
				"exceeded max depth",
				dc.InstancePath,
				dc.SchemaPath,
			),
		)
		return false
	}
	kind := target.Kind()
	switch kind {
	case reflect.Float32:
		return floatFromJSON(data, target, dc, 32)
	case reflect.Float64:
		return floatFromJSON(data, target, dc, 64)
	case reflect.Int8:
		return intFromJSON(data, target, dc, 8)
	case reflect.Int16:
		return intFromJSON(data, target, dc, 16)
	case reflect.Int32:
		return intFromJSON(data, target, dc, 32)
	case reflect.Uint8:
		return uintFromJSON(data, target, dc, 8)
	case reflect.Uint16:
		return uintFromJSON(data, target, dc, 16)
	case reflect.Uint32:
		return uintFromJSON(data, target, dc, 32)
	case reflect.Int64, reflect.Int:
		return largeIntFromJSON(data, target, dc, false)
	case reflect.Uint64, reflect.Uint:
		return largeIntFromJSON(data, target, dc, true)
	case reflect.String:
		if len(dc.EnumValues) > 0 {
			return enumFromJSON(data, target, dc)
		}
		return stringFromJSON(data, target, dc)
	case reflect.Bool:
		return boolFromJSON(data, target, dc)
	case reflect.Struct:
		t := target.Type()
		if t.Name() == "Time" {
			return timestampFromJSON(data, target, dc)
		}
		if utils.IsOptionalType(t) {
			return optionFromJSON(data, target, dc)
		}
		if utils.IsNullableTypeOrPointer(t) {
			return nullableFromJSON(data, target, dc)
		}
		if t.Implements(reflect.TypeFor[ArriModel]()) {
			return target.Interface().(ArriModel).DecodeJSON(data, target, dc)
		}
		return structFromJSON(data, target, dc)
	case reflect.Slice, reflect.Array:
		return arrayFromJSON(data, target, dc)
	case reflect.Map:
		return mapFromJSON(data, target, dc)
	case reflect.Ptr:
		return pointerFromJSON(data, target, dc)
	case reflect.Interface:
		subType := target.Elem()
		if subType.Kind() == reflect.Invalid {
			return anyFromJSON(data, target, dc)
		}
		return typeFromJSON(data, subType, dc)
	}
	dc.Errors = append(
		dc.Errors,
		NewValidationError(
			"unsupported type \""+kind.String()+"\"",
			dc.InstancePath,
			dc.SchemaPath,
		),
	)
	return false
}

func pointerFromJSON(data *gjson.Result, target reflect.Value, dc *DecoderContext) bool {
	switch data.Type {
	case gjson.Null:
		return true
	}
	if target.IsNil() {
		el := reflect.New(target.Type().Elem())
		target.Set(el)
	}
	el := target.Elem()
	return typeFromJSON(data, el, dc)
}

func enumFromJSON(data *gjson.Result, target reflect.Value, dc *DecoderContext) bool {
	if data.Type != gjson.String {
		dc.Errors = append(
			dc.Errors,
			NewValidationError(
				"expected on of the following string values "+fmt.Sprintf("%+v", dc.EnumValues),
				dc.InstancePath,
				dc.SchemaPath,
			),
		)
		return false
	}
	val := data.String()
	for i := 0; i < len(dc.EnumValues); i++ {
		enumVal := dc.EnumValues[i]
		if val == enumVal {
			target.SetString(val)
			return true
		}
	}
	dc.Errors = append(
		dc.Errors,
		NewValidationError(
			"expected on of the following string values "+fmt.Sprintf("%+v", dc.EnumValues),
			dc.InstancePath,
			dc.SchemaPath,
		),
	)
	return false
}

func floatFromJSON(data *gjson.Result, target reflect.Value, context *DecoderContext, bitSize int) bool {
	if data.Type != gjson.Number {
		context.Errors = append(
			context.Errors,
			NewValidationError(
				"expected number got \""+data.Type.String()+"\"",
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
	value := data.Float()
	if bitSize == 32 {
		if value > FLOAT32_MAX || value < FLOAT32_MIN {
			context.Errors = append(
				context.Errors,
				NewValidationError("expected 32bit float got "+fmt.Sprint(value),
					context.InstancePath,
					context.SchemaPath,
				),
			)
			return false
		}
		target.Set(reflect.ValueOf(float32(value)))
		return true
	}
	target.Set(reflect.ValueOf(value))
	return true
}

func timestampFromJSON(data *gjson.Result, target reflect.Value, context *DecoderContext) bool {
	if data.Type != gjson.String {
		context.Errors = append(context.Errors,
			NewValidationError(
				"expected RFC3339 date string got \""+data.Type.String()+"\"",
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
	value, parsingErr := time.ParseInLocation(time.RFC3339, data.String(), time.UTC)
	if parsingErr != nil {
		context.Errors = append(
			context.Errors,
			NewValidationError(
				parsingErr.Error(),
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
	target.Set(reflect.ValueOf(value))
	return true
}

const (
	INT8_MAX    = 127
	INT8_MIN    = -128
	INT16_MAX   = 32767
	INT16_MIN   = -32768
	INT32_MAX   = 2147483647
	INT32_MIN   = -2147483648
	UINT8_MAX   = 255
	UINT16_MAX  = 65535
	UINT32_MAX  = 4294967295
	FLOAT32_MAX = 3.40282347e+38
	FLOAT32_MIN = -3.40282347e+38
)

func intFromJSON(data *gjson.Result, target reflect.Value, context *DecoderContext, bitSize int) bool {
	if data.Type != gjson.Number {
		context.Errors = append(context.Errors,
			NewValidationError(
				"expected number got \""+data.Type.String()+"\"",
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
	val := data.Int()
	switch bitSize {
	case 8:
		if val > INT8_MAX || val < INT8_MIN {
			context.Errors = append(
				context.Errors,
				NewValidationError("expected number between -128 and 127 got "+fmt.Sprint(val),
					context.InstancePath,
					context.SchemaPath,
				),
			)
			return false
		}
		target.Set(reflect.ValueOf(int8(val)))
		return true
	case 16:
		if val > INT16_MAX || val < INT16_MIN {
			context.Errors = append(
				context.Errors,
				NewValidationError(
					"expected number between -32768 and 32767 got "+fmt.Sprint(val),
					context.InstancePath,
					context.SchemaPath,
				),
			)
			return false
		}
		target.Set(reflect.ValueOf(int16(val)))
		return true
	case 32:
		if val > INT32_MAX || val < INT32_MIN {
			context.Errors = append(context.Errors,
				NewValidationError(
					"expected number between -2147483648 and 2147483647 got "+fmt.Sprint(val),
					context.InstancePath,
					context.SchemaPath,
				),
			)
			return false
		}
		target.Set(reflect.ValueOf(int32(val)))
		return true
	default:
		context.Errors = append(context.Errors,
			NewValidationError("invalid bit size "+fmt.Sprint(bitSize),
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
}

func uintFromJSON(data *gjson.Result, target reflect.Value, context *DecoderContext, bitSize int) bool {
	if data.Type != gjson.Number {
		context.Errors = append(context.Errors,
			NewValidationError(
				"expected number got \""+data.Type.String()+"\"",
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
	val := data.Uint()
	switch bitSize {
	case 8:
		if val > UINT8_MAX {
			context.Errors = append(context.Errors,
				NewValidationError(
					"expected number between 0 and 255 got "+fmt.Sprint(val),
					context.InstancePath,
					context.SchemaPath,
				),
			)
			return false
		}
		target.Set(reflect.ValueOf(uint8(val)))
		return true
	case 16:
		if val > UINT16_MAX {
			context.Errors = append(context.Errors, NewValidationError(
				"expected number between 0 and 65535 got "+fmt.Sprint(val),
				context.InstancePath,
				context.SchemaPath,
			),
			)
			return false
		}
		target.Set(reflect.ValueOf(uint16(val)))
		return true
	case 32:
		if val > UINT32_MAX {
			context.Errors = append(context.Errors,
				NewValidationError(
					"expected number between 0 and 4294967295 got "+fmt.Sprint(val),
					context.InstancePath,
					context.SchemaPath,
				),
			)
			return false
		}
		target.Set(reflect.ValueOf(uint32(val)))
		return true
	default:
		context.Errors = append(context.Errors,
			NewValidationError("invalid bit size "+fmt.Sprint(bitSize),
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
}

func largeIntFromJSON(data *gjson.Result, target reflect.Value, context *DecoderContext, isUnsigned bool) bool {
	if data.Type != gjson.String {
		context.Errors = append(context.Errors,
			NewValidationError(
				"expected stringified number got \""+data.Type.String()+"\"",
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
	if isUnsigned {
		val, convErr := strconv.ParseUint(data.String(), 10, 64)
		if convErr != nil {
			context.Errors = append(context.Errors,
				NewValidationError(
					convErr.Error(),
					context.InstancePath,
					context.SchemaPath,
				),
			)
			return false
		}
		target.SetUint(val)
		return true
	}
	val, convErr := strconv.ParseInt(data.String(), 10, 64)
	if convErr != nil {
		context.Errors = append(context.Errors,
			NewValidationError(
				convErr.Error(),
				context.InstancePath,
				context.SchemaPath,
			),
		)

		return false
	}
	target.SetInt(val)
	return true
}

func stringFromJSON(data *gjson.Result, target reflect.Value, context *DecoderContext) bool {
	if data.Type != gjson.String {
		context.Errors = append(
			context.Errors,
			NewValidationError(
				"expected string got \""+data.Type.String()+"\"",
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
	target.SetString(data.String())
	return true
}

func boolFromJSON(data *gjson.Result, target reflect.Value, context *DecoderContext) bool {
	if !data.IsBool() {
		context.Errors = append(context.Errors,
			NewValidationError(
				"expected boolean got \""+data.Type.String()+"\"",
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
	target.SetBool(data.Bool())
	return true
}

func arrayFromJSON(data *gjson.Result, target reflect.Value, context *DecoderContext) bool {
	target.SetZero()
	if !data.IsArray() {
		context.Errors = append(context.Errors,
			NewValidationError(
				"expected array got \""+data.Type.String()+"\"",
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
	json := data.Array()
	numItems := len(json)
	target.Grow(numItems)
	target.SetLen(numItems)
	hasErr := false

	currCtx := context.clone()
	context.EnumValues = []string{}
	context.CurrentDepth++
	context.SchemaPath = context.SchemaPath + "/elements"
	for i := 0; i < numItems; i++ {
		element := json[i]
		subTarget := target.Index(i)
		context.InstancePath = currCtx.InstancePath + "/" + fmt.Sprint(i)
		success := typeFromJSON(&element, subTarget, context)
		context.CurrentDepth--
		if !success {
			hasErr = true
			continue
		}
		reflect.Append(target, subTarget)
	}
	context.EnumValues = currCtx.EnumValues
	context.CurrentDepth = currCtx.CurrentDepth
	context.InstancePath = currCtx.InstancePath
	context.SchemaPath = currCtx.SchemaPath
	return !hasErr
}

func mapFromJSON(data *gjson.Result, target reflect.Value, context *DecoderContext) bool {
	target.SetZero()
	if !data.IsObject() {
		context.Errors = append(
			context.Errors,
			NewValidationError(
				"expected object got \""+data.Type.String()+"\"",
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
	json := data.Map()
	numKeys := len(json)
	target.Set(reflect.MakeMapWithSize(target.Type(), numKeys))
	hasError := false

	contextSnapshot := context.clone()
	context.CurrentDepth++
	context.SchemaPath = context.SchemaPath + "/values"
	context.EnumValues = []string{}

	for key, value := range json {
		keyVal := reflect.ValueOf(key)
		v := reflect.New(target.Type().Elem())
		innerTarget := v
		context.InstancePath = contextSnapshot.InstancePath + "/" + key
		success := typeFromJSON(&value, innerTarget, context)
		if !success {
			hasError = true
			continue
		}
		if innerTarget.Kind() == reflect.Pointer {
			target.SetMapIndex(keyVal, innerTarget.Elem())
		} else {
			target.SetMapIndex(keyVal, innerTarget)
		}
	}

	context.CurrentDepth = contextSnapshot.CurrentDepth
	context.SchemaPath = contextSnapshot.SchemaPath
	context.InstancePath = contextSnapshot.InstancePath
	context.EnumValues = contextSnapshot.EnumValues
	return !hasError
}

func structFromJSON(data *gjson.Result, target reflect.Value, dc *DecoderContext) bool {
	if !data.IsObject() {
		dc.Errors = append(dc.Errors, NewValidationError("expected object", dc.InstancePath, dc.SchemaPath))
		return false
	}
	targetType := target.Type()
	if IsDiscriminatorStruct(targetType) {
		return discriminatorStructFromJSON(data, target, dc)
	}
	hasErr := false
	contextSnapshot := dc.clone()
	dc.CurrentDepth++
	dc.EnumValues = []string{}
	for i := 0; i < target.NumField(); i++ {
		field := target.Field(i)
		fieldType := field.Type()
		fieldMeta := targetType.Field(i)
		fieldName := fieldMeta.Name
		if !fieldMeta.IsExported() {
			continue
		}
		keyTag := fieldMeta.Tag.Get("key")
		if len(keyTag) > 0 {
			fieldName = keyTag
		} else {
			switch dc.KeyCasing {
			case KeyCasingCamelCase:
				fieldName = strcase.ToLowerCamel(fieldName)
			case KeyCasingPascalCase:
			case KeyCasingSnakeCase:
				fieldName = strcase.ToSnake(fieldName)
			default:
				fieldName = strcase.ToLowerCamel(fieldName)
			}
		}
		jsonResult := data.Get(fieldName)
		enumValues := []string{}
		enumTag := fieldMeta.Tag.Get("enum")
		if len(enumTag) > 0 {
			enumTags := strings.Split(enumTag, ",")
			vals := []string{}
			for i := 0; i < len(enumTags); i++ {
				tag := strings.TrimSpace(enumTags[i])
				vals = append(vals, tag)
			}
			enumValues = vals
		}
		isOptional := utils.IsOptionalType(fieldType)
		if isOptional {
			dc.InstancePath = contextSnapshot.InstancePath + "/" + fieldName
			dc.SchemaPath = contextSnapshot.SchemaPath + "/optionalProperties/" + fieldName
			dc.EnumValues = enumValues
			success := optionFromJSON(&jsonResult, field, dc)
			if !success {
				hasErr = true
			}
			continue
		}
		dc.InstancePath = contextSnapshot.InstancePath + "/" + fieldName
		dc.SchemaPath = contextSnapshot.SchemaPath + "/properties/" + fieldName
		dc.EnumValues = enumValues
		isNullable := utils.IsNullableTypeOrPointer(fieldType)
		if isNullable {
			success := nullableFromJSON(&jsonResult, field, dc)
			if !success {
				hasErr = true
			}
			continue
		}
		success := typeFromJSON(&jsonResult, field, dc)
		if !success {
			hasErr = true
		}
	}
	dc.CurrentDepth = contextSnapshot.CurrentDepth
	dc.InstancePath = contextSnapshot.InstancePath
	dc.SchemaPath = contextSnapshot.SchemaPath
	dc.EnumValues = contextSnapshot.EnumValues
	return !hasErr
}

func anyFromJSON(data *gjson.Result, target reflect.Value, context *DecoderContext) bool {
	switch data.Type {
	case gjson.False, gjson.True:
		target.Set(reflect.ValueOf(data.Bool()))
	case gjson.String:
		target.Set(reflect.ValueOf(data.String()))
	case gjson.Null:
	case gjson.Number:
		target.Set(reflect.ValueOf(data.Num))
	default:
		bytes := []byte(data.Raw)
		innerTarget := target.Interface()
		err := json.Unmarshal(bytes, &innerTarget)
		if err != nil {
			context.Errors = append(context.Errors,
				NewValidationError(
					err.Error(),
					context.InstancePath,
					context.SchemaPath,
				),
			)
			return false
		}
		target.Set(reflect.ValueOf(innerTarget))
	}
	return true
}

func discriminatorStructFromJSON(data *gjson.Result, target reflect.Value, dc *DecoderContext) bool {
	numFields := target.NumField()
	structType := target.Type()
	discriminatorKey := "type"
	contextSnapshot := dc.clone()
	for i := 0; i < numFields; i++ {
		field := target.Field(i)
		fieldMeta := structType.Field(i)
		fieldType := field.Type()
		if fieldMeta.Name == "DiscriminatorKey" {
			dKeyTag := fieldMeta.Tag.Get("discriminatorKey")
			if len(dKeyTag) > 0 {
				discriminatorKey = dKeyTag
			}
			continue
		}
		if fieldType.Kind() != reflect.Ptr || fieldType.Elem().Kind() != reflect.Struct {
			dc.Errors = append(dc.Errors,
				NewValidationError(
					"all discriminator fields must be a pointer to a struct",
					dc.InstancePath,
					dc.SchemaPath,
				),
			)
			return false
		}
		discriminatorValue := fieldMeta.Tag.Get("discriminator")
		if len(discriminatorValue) == 0 {
			dc.Errors = append(
				dc.Errors,
				NewValidationError(
					"no discriminator value specified unable to unmarshal",
					dc.InstancePath,
					dc.SchemaPath,
				),
			)
			return false
		}
		jsonDiscriminatorValue := data.Get(discriminatorKey)
		if jsonDiscriminatorValue.Type != gjson.String {
			dc.Errors = append(dc.Errors,
				NewValidationError(
					"missing discriminator field \""+discriminatorKey+"\"",
					dc.InstancePath,
					dc.SchemaPath,
				),
			)
			return false
		}
		if jsonDiscriminatorValue.String() != discriminatorValue {
			continue
		}
		innerTarget := reflect.New(field.Type().Elem())
		dc.SchemaPath = contextSnapshot.SchemaPath + "/mapping/" + discriminatorValue
		dc.CurrentDepth++
		dc.EnumValues = []string{}
		typeFromJSON(data, innerTarget, dc)
		dc.SchemaPath = contextSnapshot.SchemaPath
		dc.InstancePath = contextSnapshot.InstancePath
		dc.EnumValues = contextSnapshot.EnumValues
		field.Set(innerTarget)
		return true
	}
	dc.Errors = append(
		dc.Errors,
		NewValidationError(
			"input didn't match any of the discriminator sub types",
			dc.InstancePath,
			dc.SchemaPath,
		),
	)
	return false
}

func optionFromJSON(data *gjson.Result, target reflect.Value, context *DecoderContext) bool {
	if !data.Exists() {
		return true
	}
	val := target.FieldByName("Value")
	isSet := target.FieldByName("IsSet")
	success := typeFromJSON(data, val, context)
	if !success {
		return false
	}
	isSet.SetBool(true)
	return true
}

func nullableFromJSON(data *gjson.Result, target reflect.Value, context *DecoderContext) bool {
	if !data.Exists() {
		return false
	}
	if data.Type == gjson.Null {
		return true
	}
	val := target.FieldByName("Value")
	isSet := target.FieldByName("IsSet")
	success := typeFromJSON(data, val, context)
	if !success {
		return false
	}
	isSet.SetBool(true)
	return true
}
