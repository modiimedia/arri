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

type ValidationError struct {
	Message      string
	InstancePath string
	SchemaPath   string
}

func (e *ValidationError) Error() string {
	return e.Message + " at \"" + e.InstancePath + "\""
}

func NewValidationError(Message string, InstancePath string, SchemaPath string) ValidationError {
	return ValidationError{Message: Message, InstancePath: InstancePath, SchemaPath: SchemaPath}
}

type ValidationContext struct {
	MaxDepth     uint32
	CurrentDepth uint32
	InstancePath string
	SchemaPath   string
	EnumValues   []string
	KeyCasing    KeyCasing
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
	}
}

func FromJson[T any](data []byte, v *T, keyCasing KeyCasing) *ValidationError {
	parsedResult := gjson.ParseBytes(data)
	value := reflect.ValueOf(&v)
	context := ValidationContext{
		MaxDepth:  10000,
		KeyCasing: keyCasing,
	}
	err := typeFromJson(&parsedResult, &value, &context)
	if err != nil {
		return err
	}
	return nil
}

func typeFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) *ValidationError {
	if context.CurrentDepth > context.MaxDepth {
		err := NewValidationError("exceeded max depth", context.InstancePath, context.SchemaPath)
		return &err
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
			return nil
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
	err := NewValidationError("unsupported type \""+kind.String()+"\"", context.InstancePath, context.SchemaPath)
	return &err
}

func enumFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) *ValidationError {
	defaultErr := NewValidationError("expected on of the following string "+fmt.Sprintf("%+v", context.EnumValues), context.InstancePath, context.SchemaPath)
	if data.Type != gjson.String {
		return &defaultErr
	}
	val := data.String()
	for i := 0; i < len(context.EnumValues); i++ {
		enumVal := context.EnumValues[i]
		if val == enumVal {
			target.SetString(val)
			return nil
		}
	}
	return &defaultErr
}

func floatFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext, bitSize int) *ValidationError {
	if data.Type != gjson.Number {
		err := NewValidationError("expected number got \""+data.Type.String()+"\"", context.InstancePath, context.SchemaPath)
		return &err
	}
	value := data.Float()
	if bitSize == 32 {
		if value > FLOAT32_MAX || value < FLOAT32_MIN {
			err := NewValidationError("expected 32bit float got "+fmt.Sprint(value), context.InstancePath, context.SchemaPath)
			return &err
		}
		target.Set(reflect.ValueOf(float32(value)))
		return nil
	}
	target.Set(reflect.ValueOf(value))
	return nil
}

func timestampFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) *ValidationError {
	if data.Type != gjson.String {
		err := NewValidationError("expected RFC3339 date string got \""+data.Type.String()+"\"", context.InstancePath, context.SchemaPath)
		return &err
	}
	value, parsingErr := time.ParseInLocation(time.RFC3339, data.String(), time.UTC)
	if parsingErr != nil {
		err := NewValidationError(parsingErr.Error(), context.InstancePath, context.SchemaPath)
		return &err
	}
	target.Set(reflect.ValueOf(value))
	return nil
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

func intFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext, bitSize int) *ValidationError {
	if data.Type != gjson.Number {
		err := NewValidationError("expected number got \""+data.Type.String()+"\"", context.InstancePath, context.SchemaPath)
		return &err
	}
	val := data.Int()
	switch bitSize {
	case 8:
		if val > INT8_MAX || val < INT8_MIN {
			err := NewValidationError("expected number between -128 and 127 got "+fmt.Sprint(val), context.InstancePath, context.SchemaPath)
			return &err
		}
		target.Set(reflect.ValueOf(int8(val)))
		return nil
	case 16:
		if val > INT16_MAX || val < INT16_MIN {
			err := NewValidationError("expected number between -32768 and 32767 got "+fmt.Sprint(val), context.InstancePath, context.SchemaPath)
			return &err
		}
		target.Set(reflect.ValueOf(int16(val)))
		return nil
	case 32:
		if val > INT32_MAX || val < INT32_MIN {
			err := NewValidationError("expected number between -2147483648 and 2147483647 got "+fmt.Sprint(val), context.InstancePath, context.SchemaPath)
			return &err
		}
		target.Set(reflect.ValueOf(int32(val)))
		return nil
	default:
		err := NewValidationError("invalid bit size "+fmt.Sprint(bitSize), context.InstancePath, context.SchemaPath)
		return &err
	}
}

func uintFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext, bitSize int) *ValidationError {
	if data.Type != gjson.Number {
		err := NewValidationError("expected number got \""+data.Type.String()+"\"", context.InstancePath, context.SchemaPath)
		return &err
	}
	val := data.Uint()
	switch bitSize {
	case 8:
		if val > UINT8_MAX {
			err := NewValidationError("expected number between 0 and 255 got "+fmt.Sprint(val), context.InstancePath, context.SchemaPath)
			return &err
		}
		target.Set(reflect.ValueOf(uint8(val)))
		return nil
	case 16:
		if val > UINT16_MAX {
			err := NewValidationError("expected number between 0 and 65535 got "+fmt.Sprint(val), context.InstancePath, context.SchemaPath)
			return &err
		}
		target.Set(reflect.ValueOf(uint16(val)))
		return nil
	case 32:
		if val > UINT32_MAX {
			err := NewValidationError("expected number between 0 and 4294967295 got "+fmt.Sprint(val), context.InstancePath, context.SchemaPath)
			return &err
		}
		target.Set(reflect.ValueOf(uint32(val)))
		return nil
	default:
		err := NewValidationError("invalid bit size "+fmt.Sprint(bitSize), context.InstancePath, context.SchemaPath)
		return &err
	}
}

func largeIntFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext, isUnsigned bool) *ValidationError {
	if data.Type != gjson.String {
		err := NewValidationError("expected stringified number got \""+data.Type.String()+"\"", context.InstancePath, context.SchemaPath)
		return &err
	}
	if isUnsigned {
		val, convErr := strconv.ParseUint(data.String(), 10, 64)
		if convErr != nil {
			err := NewValidationError(convErr.Error(), context.InstancePath, context.SchemaPath)
			return &err
		}
		target.SetUint(val)
		return nil
	}
	val, convErr := strconv.ParseInt(data.String(), 10, 64)
	if convErr != nil {
		err := NewValidationError(convErr.Error(), context.InstancePath, context.SchemaPath)
		return &err
	}
	target.SetInt(val)
	return nil
}

func stringFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) *ValidationError {
	if data.Type != gjson.String {
		err := NewValidationError("expected string got \""+data.Type.String()+"\"", context.InstancePath, context.SchemaPath)
		return &err
	}
	target.SetString(data.String())
	return nil
}

func boolFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) *ValidationError {
	if !data.IsBool() {
		err := NewValidationError("expected boolean got \""+data.Type.String()+"\"", context.InstancePath, context.SchemaPath)
		return &err
	}
	target.SetBool(data.Bool())
	return nil
}

func arrayFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) *ValidationError {
	if !data.IsArray() {
		err := NewValidationError("expected array got \""+data.Type.String()+"\"", context.InstancePath, context.SchemaPath)
		return &err
	}
	json := data.Array()
	numItems := len(json)
	target.Grow(numItems)
	target.SetLen(numItems)
	for i := 0; i < numItems; i++ {
		element := json[i]
		subTarget := target.Index(i)
		ctx := context.copyWith(Some(context.CurrentDepth+1), None[[]string](), Some(context.InstancePath+"/"+fmt.Sprint(i)), Some(context.SchemaPath+"/elements"))
		err := typeFromJson(&element, &subTarget, &ctx)
		if err != nil {
			return err
		}
		reflect.Append(*target, subTarget)
	}
	return nil
}

func mapFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) *ValidationError {
	if !data.IsObject() {
		err := NewValidationError("expected object got \""+data.Type.String()+"\"", context.InstancePath, context.SchemaPath)
		return &err
	}
	json := data.Map()
	numKeys := len(json)
	target.Set(reflect.MakeMapWithSize(target.Type(), numKeys))
	for key, value := range json {
		keyVal := reflect.ValueOf(key)
		v := reflect.New(target.Type().Elem())
		innerTarget := v
		innerContext := context.copyWith(Some(context.CurrentDepth+1), None[[]string](), Some(context.InstancePath+"/"+key), Some(context.SchemaPath+"/values"))
		innerErr := typeFromJson(&value, &innerTarget, &innerContext)
		if innerErr != nil {
			return innerErr
		}
		if innerTarget.Kind() == reflect.Pointer {
			target.SetMapIndex(keyVal, innerTarget.Elem())
		} else {
			target.SetMapIndex(keyVal, innerTarget)
		}
	}
	return nil
}

func structFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) *ValidationError {
	targetType := target.Type()
	if IsDiscriminatorStruct(targetType) {
		return discriminatorStructFromJson(data, target, context)
	}
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
			err := optionFromJson(&jsonResult, &field, &ctx)
			if err != nil {
				return err
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
			err := nullableFromJson(&jsonResult, &field, &ctx)
			if err != nil {
				return err
			}
			continue
		}
		err := typeFromJson(&jsonResult, &field, &ctx)
		if err != nil {
			return err
		}
	}
	return nil
}

func anyFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) *ValidationError {
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
			valErr := NewValidationError(err.Error(), context.InstancePath, context.SchemaPath)
			return &valErr
		}
	}
	return nil
}

func discriminatorStructFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) *ValidationError {
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
			err := NewValidationError("all discriminator fields must be a pointer to a struct", context.InstancePath, context.SchemaPath)
			return &err
		}
		discriminatorValue := fieldMeta.Tag.Get("discriminator")
		if len(discriminatorValue) == 0 {
			err := NewValidationError("no discriminator value specified unable to unmarshal", context.InstancePath, context.SchemaPath)
			return &err
		}
		jsonDiscriminatorValue := data.Get(discriminatorKey)
		if jsonDiscriminatorValue.Type != gjson.String {
			err := NewValidationError("missing discriminator field \""+discriminatorKey+"\"", context.InstancePath, context.SchemaPath)
			return &err
		}
		if jsonDiscriminatorValue.String() != discriminatorValue {
			continue
		}
		innerTarget := reflect.New(field.Type().Elem())
		ctx := context.copyWith(Some(context.CurrentDepth+1), None[[]string](), None[string](), Some(context.SchemaPath+"/mapping/"+discriminatorValue))
		err := typeFromJson(data, &innerTarget, &ctx)
		if err != nil {
			return err
		}
		field.Set(innerTarget)
		return nil
	}
	err := NewValidationError("input didn't match any of the discriminator sub types", context.InstancePath, context.SchemaPath)
	return &err
}

func optionFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) *ValidationError {
	if !data.Exists() {
		return nil
	}
	val := target.FieldByName("Value")
	isSet := target.FieldByName("IsSet")
	err := typeFromJson(data, &val, context)
	if err != nil {
		return err
	}
	isSet.SetBool(true)
	return nil
}

func nullableFromJson(data *gjson.Result, target *reflect.Value, context *ValidationContext) *ValidationError {
	if data.Type == gjson.Null {
		return nil
	}
	val := target.FieldByName("Value")
	isSet := target.FieldByName("IsSet")
	err := typeFromJson(data, &val, context)
	if err != nil {
		return err
	}
	isSet.SetBool(true)
	return nil
}
