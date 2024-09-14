package arri

import (
	"encoding/json"
	"fmt"
	"reflect"
	"strconv"
	"strings"
	"time"

	"github.com/iancoleman/strcase"
	"github.com/tidwall/gjson"
)

type DecodingError interface {
	RpcError
	Message() string
	InstancePath() string
	SchemaPath() string
}

type validationError struct {
	errors []validationErrorItem
}

type validationErrorItem struct {
	message      string
	instancePath string
	schemaPath   string
}

func newValidationErrorItem(message string, instancePath string, schemaPath string) validationErrorItem {
	return validationErrorItem{
		message:      message,
		instancePath: instancePath,
		schemaPath:   schemaPath,
	}
}

func (e validationError) Error() string {
	msg := "Invalid input. Affected properties ["

	for i := 0; i < len(e.errors); i++ {
		if i > 0 {
			msg += ", "
		}
		err := e.errors[i]
		msg += err.instancePath
	}
	msg += "]"
	return msg
}

func (e validationError) Message() string {
	return e.Error()
}

func (e validationError) ErrorResponse() ErrorResponse {
	data := map[string]any{}
	data["errors"] = e.errors
	return ErrorResponse{
		Code:    400,
		Message: e.Message(),
		Data:    Some[any](data),
		Stack:   None[[]string](),
	}
}

func newValidationError(errors []validationErrorItem) validationError {
	return validationError{errors: errors}
}

type ValidationContext struct {
	MaxDepth     uint32
	CurrentDepth uint32
	InstancePath string
	SchemaPath   string
	EnumValues   []string
	KeyCasing    KeyCasing
	Errors       *[]validationErrorItem
}

func (c ValidationContext) copyWith(CurrentDepth Option[uint32], EnumValues Option[[]string], InstancePath Option[string], SchemaPath Option[string]) ValidationContext {
	currentDepth := CurrentDepth.UnwrapOr(c.CurrentDepth)
	enumValues := EnumValues.UnwrapOr(c.EnumValues)
	instancePath := InstancePath.UnwrapOr(c.InstancePath)
	schemaPath := SchemaPath.UnwrapOr(c.SchemaPath)
	return ValidationContext{
		MaxDepth:     c.MaxDepth,
		CurrentDepth: currentDepth,
		EnumValues:   enumValues,
		InstancePath: instancePath,
		SchemaPath:   schemaPath,
		KeyCasing:    c.KeyCasing,
		Errors:       c.Errors,
	}
}

func FromJson[T any](data []byte, v *T, keyCasing KeyCasing) *validationError {
	parsedResult := gjson.ParseBytes(data)
	value := reflect.ValueOf(&v)
	errors := []validationErrorItem{}
	context := ValidationContext{
		MaxDepth:  10000,
		KeyCasing: keyCasing,
		Errors:    &errors,
	}
	typeFromJson(&parsedResult, &value, &context)
	if len(*context.Errors) > 0 {
		err := newValidationError(*context.Errors)
		return &err
	}
	return nil
}

func typeFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) bool {
	if context.CurrentDepth > context.MaxDepth {
		*context.Errors = append(
			*context.Errors,
			newValidationErrorItem(
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
		return floatFromJson(data, target, context, 32)
	case reflect.Float64:
		return floatFromJson(data, target, context, 64)
	case reflect.Int8:
		return intFromJson(data, target, context, 8)
	case reflect.Int16:
		return intFromJson(data, target, context, 16)
	case reflect.Int32:
		return intFromJson(data, target, context, 32)
	case reflect.Uint8:
		return uintFromJson(data, target, context, 8)
	case reflect.Uint16:
		return uintFromJson(data, target, context, 16)
	case reflect.Uint32:
		return uintFromJson(data, target, context, 32)
	case reflect.Int64, reflect.Int:
		return largeIntFromJson(data, target, context, false)
	case reflect.Uint64, reflect.Uint:
		return largeIntFromJson(data, target, context, true)
	case reflect.String:
		if len(context.EnumValues) > 0 {
			return enumFromJson(data, target, context)
		}
		return stringFromJson(data, target, context)
	case reflect.Bool:
		return boolFromJson(data, target, context)
	case reflect.Struct:
		if target.Type().Name() == "Time" {
			return timestampFromJson(data, target, context)
		}
		return structFromJson(data, target, context)
	case reflect.Ptr:
		if target.IsNil() {
			return true
		}
		elem := target.Elem()
		return typeFromJson(data, &elem, context)
	case reflect.Slice:
		return arrayFromJson(data, target, context)
	case reflect.Map:
		return mapFromJson(data, target, context)
	case reflect.Interface:
		subType := target.Elem()
		if subType.Kind() == reflect.Invalid {
			return anyFromJson(data, target, context)
		}
		return typeFromJson(data, &subType, context)
	}
	*context.Errors = append(
		*context.Errors,
		newValidationErrorItem(
			"unsupported type \""+kind.String()+"\"",
			context.InstancePath,
			context.SchemaPath,
		),
	)
	return false
}

func enumFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) bool {

	if data.Type != gjson.String {
		*context.Errors = append(
			*context.Errors,
			newValidationErrorItem(
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
	*context.Errors = append(
		*context.Errors,
		newValidationErrorItem(
			"expected on of the following string values "+fmt.Sprintf("%+v", context.EnumValues),
			context.InstancePath,
			context.SchemaPath,
		),
	)
	return false
}

func floatFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext, bitSize int) bool {
	if data.Type != gjson.Number {
		*context.Errors = append(
			*context.Errors,
			newValidationErrorItem(
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
			*context.Errors = append(
				*context.Errors,
				newValidationErrorItem("expected 32bit float got "+fmt.Sprint(value),
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

func timestampFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) bool {
	if data.Type != gjson.String {
		*context.Errors = append(*context.Errors,
			newValidationErrorItem(
				"expected RFC3339 date string got \""+data.Type.String()+"\"",
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
	value, parsingErr := time.ParseInLocation(time.RFC3339, data.String(), time.UTC)
	if parsingErr != nil {
		*context.Errors = append(
			*context.Errors,
			newValidationErrorItem(
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

func intFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext, bitSize int) bool {
	if data.Type != gjson.Number {
		*context.Errors = append(*context.Errors,
			newValidationErrorItem(
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
			*context.Errors = append(
				*context.Errors,
				newValidationErrorItem("expected number between -128 and 127 got "+fmt.Sprint(val),
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
			*context.Errors = append(
				*context.Errors,
				newValidationErrorItem(
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
			*context.Errors = append(*context.Errors,
				newValidationErrorItem(
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
		*context.Errors = append(*context.Errors,
			newValidationErrorItem("invalid bit size "+fmt.Sprint(bitSize),
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
}

func uintFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext, bitSize int) bool {
	if data.Type != gjson.Number {
		*context.Errors = append(*context.Errors,
			newValidationErrorItem(
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
			*context.Errors = append(*context.Errors,
				newValidationErrorItem(
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
			*context.Errors = append(*context.Errors, newValidationErrorItem(
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
			*context.Errors = append(*context.Errors,
				newValidationErrorItem(
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
		*context.Errors = append(*context.Errors,
			newValidationErrorItem("invalid bit size "+fmt.Sprint(bitSize),
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
}

func largeIntFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext, isUnsigned bool) bool {
	if data.Type != gjson.String {
		*context.Errors = append(*context.Errors,
			newValidationErrorItem(
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
			*context.Errors = append(*context.Errors,
				newValidationErrorItem(
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
		*context.Errors = append(*context.Errors,
			newValidationErrorItem(
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

func stringFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) bool {
	if data.Type != gjson.String {
		*context.Errors = append(
			*context.Errors,
			newValidationErrorItem(
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

func boolFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) bool {
	if !data.IsBool() {
		*context.Errors = append(*context.Errors,
			newValidationErrorItem(
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

func arrayFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) bool {
	if !data.IsArray() {
		*context.Errors = append(*context.Errors,
			newValidationErrorItem(
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
	for i := 0; i < numItems; i++ {
		element := json[i]
		subTarget := target.Index(i)
		ctx := context.copyWith(Some(context.CurrentDepth+1), None[[]string](), Some(context.InstancePath+"/"+fmt.Sprint(i)), Some(context.SchemaPath+"/elements"))
		success := typeFromJson(&element, &subTarget, &ctx)
		if !success {
			hasErr = true
			continue
		}
		reflect.Append(*target, subTarget)
	}
	return !hasErr
}

func mapFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) bool {
	if !data.IsObject() {
		*context.Errors = append(
			*context.Errors,
			newValidationErrorItem(
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
	for key, value := range json {
		keyVal := reflect.ValueOf(key)
		v := reflect.New(target.Type().Elem())
		innerTarget := v
		innerContext := context.copyWith(Some(context.CurrentDepth+1), None[[]string](), Some(context.InstancePath+"/"+key), Some(context.SchemaPath+"/values"))
		success := typeFromJson(&value, &innerTarget, &innerContext)
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
	return !hasError
}

func structFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) bool {
	targetType := target.Type()
	if IsDiscriminatorStruct(targetType) {
		return discriminatorStructFromJson(data, target, context)
	}
	hasErr := false
	for i := 0; i < target.NumField(); i++ {
		field := target.Field(i)
		fieldType := field.Type()
		fieldMeta := targetType.Field(i)
		fieldName := fieldMeta.Name
		switch context.KeyCasing {
		case KeyCasingCamelCase:
			fieldName = strcase.ToLowerCamel(fieldName)
		case KeyCasingPascalCase:
		case KeyCasingSnakeCase:
			fieldName = strcase.ToSnake(fieldName)
		default:
			fieldName = strcase.ToLowerCamel(fieldName)
		}
		jsonResult := data.Get(fieldName)
		enumValues := None[[]string]()
		enumTag := fieldMeta.Tag.Get("enum")
		if len(enumTag) > 0 {
			enumTags := strings.Split(enumTag, ",")
			vals := []string{}
			for i := 0; i < len(enumTags); i++ {
				tag := strings.TrimSpace(enumTags[i])
				vals = append(vals, tag)
			}
			enumValues = Some(vals)
		}
		isOptional := isOptionalType(fieldType)
		if isOptional {
			ctx := context.copyWith(
				Some(context.CurrentDepth+1),
				enumValues,
				Some(context.InstancePath+"/"+fieldName),
				Some(context.SchemaPath+"/optionalProperties/"+fieldName),
			)
			success := optionFromJson(&jsonResult, &field, &ctx)
			if !success {
				hasErr = true
			}
			continue
		}
		ctx := context.copyWith(
			Some(context.CurrentDepth+1),
			enumValues,
			Some(context.InstancePath+"/"+fieldName),
			Some(context.SchemaPath+"/properties/"+fieldName),
		)
		isNullable := isNullableType(fieldType)
		if isNullable {
			success := nullableFromJson(&jsonResult, &field, &ctx)
			if !success {
				hasErr = true
			}
			continue
		}
		success := typeFromJson(&jsonResult, &field, &ctx)
		if !success {
			hasErr = true
		}
	}
	return !hasErr
}

func anyFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) bool {
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
		err := json.Unmarshal(bytes, target.Interface())
		if err != nil {
			*context.Errors = append(*context.Errors,
				newValidationErrorItem(
					err.Error(),
					context.InstancePath,
					context.SchemaPath,
				),
			)
			return false
		}
	}
	return true
}

func discriminatorStructFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) bool {
	numFields := target.NumField()
	structType := target.Type()
	discriminatorKey := "type"
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
			*context.Errors = append(*context.Errors,
				newValidationErrorItem(
					"all discriminator fields must be a pointer to a struct",
					context.InstancePath,
					context.SchemaPath,
				),
			)
			return false
		}
		discriminatorValue := fieldMeta.Tag.Get("discriminator")
		if len(discriminatorValue) == 0 {
			*context.Errors = append(
				*context.Errors,
				newValidationErrorItem(
					"no discriminator value specified unable to unmarshal",
					context.InstancePath,
					context.SchemaPath,
				),
			)
			return false
		}
		jsonDiscriminatorValue := data.Get(discriminatorKey)
		if jsonDiscriminatorValue.Type != gjson.String {
			*context.Errors = append(*context.Errors,
				newValidationErrorItem(
					"missing discriminator field \""+discriminatorKey+"\"",
					context.InstancePath,
					context.SchemaPath,
				),
			)
			return false
		}
		if jsonDiscriminatorValue.String() != discriminatorValue {
			continue
		}
		innerTarget := reflect.New(field.Type().Elem())
		ctx := context.copyWith(Some(context.CurrentDepth+1), None[[]string](), None[string](), Some(context.SchemaPath+"/mapping/"+discriminatorValue))
		typeFromJson(data, &innerTarget, &ctx)
		field.Set(innerTarget)
		return true
	}
	*context.Errors = append(
		*context.Errors,
		newValidationErrorItem(
			"input didn't match any of the discriminator sub types",
			context.InstancePath,
			context.SchemaPath,
		),
	)
	return false
}

func optionFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) bool {
	if !data.Exists() {
		return false
	}
	val := target.FieldByName("Value")
	isSet := target.FieldByName("IsSet")
	success := typeFromJson(data, &val, context)
	if !success {
		return false
	}
	isSet.SetBool(true)
	return true
}

func nullableFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) bool {
	if data.Type == gjson.Null {
		return false
	}
	val := target.FieldByName("Value")
	isSet := target.FieldByName("IsSet")
	success := typeFromJson(data, &val, context)
	if !success {
		return false
	}
	isSet.SetBool(true)
	return true
}
