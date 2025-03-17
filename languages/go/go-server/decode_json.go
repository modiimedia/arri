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

type DecoderError struct {
	Errors []ValidationError
}

func (e DecoderError) Code() uint32 {
	return 400
}

func (e DecoderError) Error() string {
	if len(e.Errors) == 0 {
		return "Invalid input."
	}
	msg := "Invalid input. Affected properties ["

	for i := 0; i < len(e.Errors); i++ {
		if i > 0 {
			msg += ", "
		}
		err := e.Errors[i]
		msg += err.InstancePath
		if err.InstancePath == "" && err.SchemaPath == "" {
			return err.Message
		}
	}
	msg += "]"
	return msg
}

func (e DecoderError) Data() Option[any] {
	return Some[any](e)
}

func (e DecoderError) EncodeJSON(options EncodingOptions) ([]byte, error) {
	return EncodeJSON(e.Errors, options)
}

func NewDecoderError(errors []ValidationError) DecoderError {
	return DecoderError{Errors: errors}
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

func (c DecoderContext) clone() DecoderContext {
	return DecoderContext{
		MaxDepth:     c.MaxDepth,
		CurrentDepth: c.CurrentDepth,
		EnumValues:   c.EnumValues,
		InstancePath: c.InstancePath,
		SchemaPath:   c.SchemaPath,
		KeyCasing:    c.KeyCasing,
		Errors:       c.Errors,
	}
}

func (c DecoderContext) copyWith(CurrentDepth Option[uint32], EnumValues Option[[]string], InstancePath Option[string], SchemaPath Option[string]) DecoderContext {
	currentDepth := CurrentDepth.UnwrapOr(c.CurrentDepth)
	enumValues := EnumValues.UnwrapOr(c.EnumValues)
	instancePath := InstancePath.UnwrapOr(c.InstancePath)
	schemaPath := SchemaPath.UnwrapOr(c.SchemaPath)
	return DecoderContext{
		MaxDepth:     c.MaxDepth,
		CurrentDepth: currentDepth,
		EnumValues:   enumValues,
		InstancePath: instancePath,
		SchemaPath:   schemaPath,
		KeyCasing:    c.KeyCasing,
		Errors:       c.Errors,
	}
}

type EncodingOptions struct {
	KeyCasing KeyCasing
	MaxDepth  uint32
}

func NewSerializationOptions(keyCasing KeyCasing, maxDepth uint32) EncodingOptions {
	return EncodingOptions{KeyCasing: keyCasing, MaxDepth: maxDepth}
}

func DecodeJSON[T any](data []byte, v *T, options EncodingOptions) *DecoderError {
	parsedResult := gjson.ParseBytes(data)
	value := reflect.ValueOf(&v)
	if !parsedResult.Exists() {
		t := value.Type()
		if utils.IsNullableTypeOrPointer(t) || utils.IsOptionalType(t) {
			return nil
		}
		err := NewDecoderError([]ValidationError{NewValidationError("expected JSON input but received nothing", "", "")})
		return &err
	}
	errors := []ValidationError{}
	keyCasing := options.KeyCasing
	if len(keyCasing) == 0 {
		keyCasing = KeyCasingCamelCase
	}
	maxDepth := options.MaxDepth
	if maxDepth == 0 {
		maxDepth = 10000
	}
	context := DecoderContext{
		MaxDepth:  maxDepth,
		KeyCasing: keyCasing,
		Errors:    errors,
	}
	ok := typeFromJSON(&parsedResult, value, &context)
	if len(context.Errors) > 0 {
		err := NewDecoderError(context.Errors)
		return &err
	}
	if !ok {
		err := NewDecoderError([]ValidationError{})
		return &err
	}

	return nil
}

func typeFromJSON(data *gjson.Result, target reflect.Value, context *DecoderContext) bool {
	if context.CurrentDepth > context.MaxDepth {
		context.Errors = append(
			context.Errors,
			NewValidationError(
				"exceeded max depth",
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
	kind := target.Kind()
	switch kind {
	case reflect.Float32:
		return floatFromJSON(data, target, context, 32)
	case reflect.Float64:
		return floatFromJSON(data, target, context, 64)
	case reflect.Int8:
		return intFromJSON(data, target, context, 8)
	case reflect.Int16:
		return intFromJSON(data, target, context, 16)
	case reflect.Int32:
		return intFromJSON(data, target, context, 32)
	case reflect.Uint8:
		return uintFromJSON(data, target, context, 8)
	case reflect.Uint16:
		return uintFromJSON(data, target, context, 16)
	case reflect.Uint32:
		return uintFromJSON(data, target, context, 32)
	case reflect.Int64, reflect.Int:
		return largeIntFromJSON(data, target, context, false)
	case reflect.Uint64, reflect.Uint:
		return largeIntFromJSON(data, target, context, true)
	case reflect.String:
		if len(context.EnumValues) > 0 {
			return enumFromJSON(data, target, context)
		}
		return stringFromJSON(data, target, context)
	case reflect.Bool:
		return boolFromJSON(data, target, context)
	case reflect.Struct:
		t := target.Type()
		if t.Name() == "Time" {
			return timestampFromJSON(data, target, context)
		}
		if utils.IsOptionalType(t) {
			return optionFromJSON(data, target, context)
		}
		if utils.IsNullableTypeOrPointer(t) {
			return nullableFromJSON(data, target, context)
		}
		if t.Implements(reflect.TypeFor[ArriModel]()) {
			return target.Interface().(ArriModel).DecodeJSON(data, target, context)
		}
		return structFromJSON(data, target, context)
	case reflect.Slice, reflect.Array:
		return arrayFromJSON(data, target, context)
	case reflect.Map:
		return mapFromJSON(data, target, context)
	case reflect.Ptr:
		return pointerFromJSON(data, target, context)
	case reflect.Interface:
		subType := target.Elem()
		if subType.Kind() == reflect.Invalid {
			return anyFromJSON(data, target, context)
		}
		return typeFromJSON(data, subType, context)
	}
	context.Errors = append(
		context.Errors,
		NewValidationError(
			"unsupported type \""+kind.String()+"\"",
			context.InstancePath,
			context.SchemaPath,
		),
	)
	return false
}

func pointerFromJSON(data *gjson.Result, target reflect.Value, context *DecoderContext) bool {
	switch data.Type {
	case gjson.Null:
		return true
	}
	if target.IsNil() {
		el := reflect.New(target.Type().Elem())
		target.Set(el)
	}
	el := target.Elem()
	return typeFromJSON(data, el, context)
}

func enumFromJSON(data *gjson.Result, target reflect.Value, context *DecoderContext) bool {
	if data.Type != gjson.String {
		context.Errors = append(
			context.Errors,
			NewValidationError(
				"expected on of the following string values "+fmt.Sprintf("%+v", context.EnumValues),
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
	val := data.String()
	for i := 0; i < len(context.EnumValues); i++ {
		enumVal := context.EnumValues[i]
		if val == enumVal {
			target.SetString(val)
			return true
		}
	}
	context.Errors = append(
		context.Errors,
		NewValidationError(
			"expected on of the following string values "+fmt.Sprintf("%+v", context.EnumValues),
			context.InstancePath,
			context.SchemaPath,
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

func structFromJSON(data *gjson.Result, target reflect.Value, c *DecoderContext) bool {
	if !data.IsObject() {
		c.Errors = append(c.Errors, NewValidationError("expected object", c.InstancePath, c.SchemaPath))
		return false
	}
	targetType := target.Type()
	if IsDiscriminatorStruct(targetType) {
		return discriminatorStructFromJSON(data, target, c)
	}
	hasErr := false
	contextSnapshot := c.clone()
	c.CurrentDepth++
	c.EnumValues = []string{}
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
			switch c.KeyCasing {
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
			c.InstancePath = contextSnapshot.InstancePath + "/" + fieldName
			c.SchemaPath = contextSnapshot.SchemaPath + "/optionalProperties/" + fieldName
			c.EnumValues = enumValues
			success := optionFromJSON(&jsonResult, field, c)
			if !success {
				hasErr = true
			}
			continue
		}
		c.InstancePath = contextSnapshot.InstancePath + "/" + fieldName
		c.SchemaPath = contextSnapshot.SchemaPath + "/properties/" + fieldName
		c.EnumValues = enumValues
		isNullable := utils.IsNullableTypeOrPointer(fieldType)
		if isNullable {
			success := nullableFromJSON(&jsonResult, field, c)
			if !success {
				hasErr = true
			}
			continue
		}
		success := typeFromJSON(&jsonResult, field, c)
		if !success {
			hasErr = true
		}
	}
	c.CurrentDepth = contextSnapshot.CurrentDepth
	c.InstancePath = contextSnapshot.InstancePath
	c.SchemaPath = contextSnapshot.SchemaPath
	c.EnumValues = contextSnapshot.EnumValues
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

func discriminatorStructFromJSON(data *gjson.Result, target reflect.Value, c *DecoderContext) bool {
	numFields := target.NumField()
	structType := target.Type()
	discriminatorKey := "type"
	contextSnapshot := c.clone()
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
			c.Errors = append(c.Errors,
				NewValidationError(
					"all discriminator fields must be a pointer to a struct",
					c.InstancePath,
					c.SchemaPath,
				),
			)
			return false
		}
		discriminatorValue := fieldMeta.Tag.Get("discriminator")
		if len(discriminatorValue) == 0 {
			c.Errors = append(
				c.Errors,
				NewValidationError(
					"no discriminator value specified unable to unmarshal",
					c.InstancePath,
					c.SchemaPath,
				),
			)
			return false
		}
		jsonDiscriminatorValue := data.Get(discriminatorKey)
		if jsonDiscriminatorValue.Type != gjson.String {
			c.Errors = append(c.Errors,
				NewValidationError(
					"missing discriminator field \""+discriminatorKey+"\"",
					c.InstancePath,
					c.SchemaPath,
				),
			)
			return false
		}
		if jsonDiscriminatorValue.String() != discriminatorValue {
			continue
		}
		innerTarget := reflect.New(field.Type().Elem())
		c.SchemaPath = contextSnapshot.SchemaPath + "/mapping/" + discriminatorValue
		c.CurrentDepth++
		c.EnumValues = []string{}
		typeFromJSON(data, innerTarget, c)
		c.SchemaPath = contextSnapshot.SchemaPath
		c.InstancePath = contextSnapshot.InstancePath
		c.EnumValues = contextSnapshot.EnumValues
		field.Set(innerTarget)
		return true
	}
	c.Errors = append(
		c.Errors,
		NewValidationError(
			"input didn't match any of the discriminator sub types",
			c.InstancePath,
			c.SchemaPath,
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
