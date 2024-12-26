package arri

import (
	"fmt"
	"net/url"
	"reflect"
	"strconv"
	"strings"
	"time"

	"github.com/iancoleman/strcase"
	"github.com/modiimedia/arri/languages/go/go-server/utils"
)

func FromUrlQuery[T any](values url.Values, target *T, options EncodingOptions) *DecoderError {
	reflectValue := reflect.ValueOf(target).Elem()
	errors := []ValidationError{}
	ctx := DecoderContext{KeyCasing: options.KeyCasing, Errors: errors}
	if reflectValue.Kind() != reflect.Struct {
		err := NewDecoderError(
			[]ValidationError{
				NewValidationError("only structs can be decoded from url query params", ctx.InstancePath, ctx.SchemaPath),
			},
		)
		return &err
	}
	numFields := reflectValue.NumField()
	targetType := reflectValue.Type()
	for i := 0; i < numFields; i++ {
		field := reflectValue.Field(i)
		fieldMeta := targetType.Field(i)
		fieldType := field.Type()
		key := fieldMeta.Name
		switch ctx.KeyCasing {
		case KeyCasingCamelCase:
			key = strcase.ToLowerCamel(key)
		case KeyCasingPascalCase:
		case KeyCasingSnakeCase:
			key = strcase.ToSnake(key)
		default:
			key = strcase.ToLowerCamel(key)
		}
		enumTag := fieldMeta.Tag.Get("enum")
		enumValues := []string{}
		if len(enumTag) > 0 {
			vals := strings.Split(enumTag, ",")
			for i := 0; i < len(vals); i++ {
				enumValues = append(enumValues, strings.TrimSpace(vals[i]))
			}

		}
		urlValue := values.Get(key)
		isOptional := utils.IsOptionalType(fieldType)
		if isOptional {
			ctx := ctx.copyWith(
				None[uint32](),
				Some(enumValues),
				Some(ctx.InstancePath+"/"+key),
				Some(ctx.SchemaPath+"/optionalProperties"),
			)
			optionalTypeFromUrlQuery(urlValue, &field, &ctx)
			continue
		}
		hasUrlValue := values.Has(key)
		if !hasUrlValue {
			ctx.Errors = append(ctx.Errors,
				NewValidationError("missing required field", "/"+key, "/properties/"+key),
			)
			continue
		}
		ctx := ctx.copyWith(
			None[uint32](),
			Some(enumValues),
			Some(ctx.InstancePath+"/"+key),
			Some(ctx.SchemaPath+"/optionalProperties"),
		)
		isNullable := utils.IsNullableTypeOrPointer(fieldType)
		if isNullable {
			nullableTypeFromUrlQuery(urlValue, &field, &ctx)
			continue
		}
		typeFromUrlQuery(urlValue, &field, &ctx)
	}
	if len(ctx.Errors) > 0 {
		err := NewDecoderError(ctx.Errors)
		return &err
	}
	return nil
}

func optionalTypeFromUrlQuery(value string, target *reflect.Value, context *DecoderContext) bool {
	if value == "" {
		return true
	}
	innerTarget := target.FieldByName("Value")
	isSet := target.FieldByName("IsSet")
	success := typeFromUrlQuery(value, &innerTarget, context)
	if !success {
		return false
	}
	isSet.SetBool(true)
	return true
}

func nullableTypeFromUrlQuery(value string, target *reflect.Value, context *DecoderContext) bool {
	if value == "null" || value == "NULL" || value == "Null" {
		return true
	}
	innerValue := target.FieldByName("Value")
	isSet := target.FieldByName("IsSet")
	success := typeFromUrlQuery(value, &innerValue, context)
	if !success {
		return false
	}
	isSet.SetBool(true)
	return true
}

func typeFromUrlQuery(value string, target *reflect.Value, context *DecoderContext) bool {
	kind := target.Kind()
	switch kind {
	case reflect.Bool:
		return boolFromUrlQuery(value, target, context)
	case reflect.String:
		if len(context.EnumValues) > 0 {
			return enumFromUrlQuery(value, target, context)
		}
		target.SetString(value)
		return true
	case reflect.Float32:
		parsedVal, parsingErr := strconv.ParseFloat(value, 32)
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
		target.Set(reflect.ValueOf(float32(parsedVal)))
		return true
	case reflect.Float64:
		parsedVal, parsingErr := strconv.ParseFloat(value, 64)
		if parsingErr != nil {
			context.Errors = append(context.Errors,
				NewValidationError(
					parsingErr.Error(),
					context.InstancePath,
					context.SchemaPath,
				),
			)
			return false
		}
		target.SetFloat(parsedVal)
		return true
	case reflect.Int8:
		return intFromUrlQuery(value, target, context, false, 8)
	case reflect.Uint8:
		return intFromUrlQuery(value, target, context, true, 8)
	case reflect.Int16:
		return intFromUrlQuery(value, target, context, false, 16)
	case reflect.Uint16:
		return intFromUrlQuery(value, target, context, true, 16)
	case reflect.Int32:
		return intFromUrlQuery(value, target, context, false, 32)
	case reflect.Uint32:
		return intFromUrlQuery(value, target, context, true, 32)
	case reflect.Int64, reflect.Int:
		return intFromUrlQuery(value, target, context, false, 64)
	case reflect.Uint64, reflect.Uint:
		return intFromUrlQuery(value, target, context, true, 64)
	case reflect.Array, reflect.Slice:
		context.Errors = append(
			context.Errors,
			NewValidationError(
				"decoding lists from url query strings is not supported",
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	case reflect.Struct:
		if target.Type().Name() == "Time" {
			return timestampFromUrlQuery(value, target, context)
		}
		context.Errors = append(
			context.Errors,
			NewValidationError(
				"decoding nested objects from url query strings is not supported",
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	case reflect.Ptr:
		subTarget := target.Elem()
		return typeFromUrlQuery(value, &subTarget, context)
	case reflect.Map:
		context.Errors = append(
			context.Errors,
			NewValidationError(
				"decoding nested objects from url query strings is not supported",
				context.InstancePath,
				context.SchemaPath,
			),
		)
		return false
	}
	context.Errors = append(
		context.Errors,
		NewValidationError(
			"unsupported type",
			context.InstancePath,
			context.SchemaPath,
		),
	)
	return false
}

func boolFromUrlQuery(value string, target *reflect.Value, context *DecoderContext) bool {
	switch value {
	case "true", "TRUE", "1":
		target.SetBool(true)
		return true
	case "false", "FALSE", "0":
		target.SetBool(false)
		return true
	}
	context.Errors = append(
		context.Errors,
		NewValidationError(
			"cannot convert \""+value+"\" to a boolean",
			context.InstancePath,
			context.SchemaPath,
		),
	)
	return false
}

func enumFromUrlQuery(value string, target *reflect.Value, context *DecoderContext) bool {
	for i := 0; i < len(context.EnumValues); i++ {
		enumVal := context.EnumValues[i]
		if enumVal == value {
			target.SetString(enumVal)
			return true
		}
	}
	context.Errors = append(
		context.Errors,
		NewValidationError(
			fmt.Sprintf("expected on of the following values %+v", context.EnumValues),
			context.InstancePath,
			context.SchemaPath,
		),
	)
	return false
}

func intFromUrlQuery(value string, target *reflect.Value, context *DecoderContext, isUnsigned bool, bitSize int) bool {
	if isUnsigned {
		parsedVal, parsingErr := strconv.ParseUint(value, 10, bitSize)
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
		switch bitSize {
		case 8:
			target.Set(reflect.ValueOf(uint8(parsedVal)))
		case 16:
			target.Set(reflect.ValueOf(uint16(parsedVal)))
		case 32:
			target.Set(reflect.ValueOf(uint32(parsedVal)))
		default:
			target.SetUint(parsedVal)
		}
		return true
	}
	parsedVal, parsingErr := strconv.ParseInt(value, 10, bitSize)
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

	switch bitSize {
	case 8:
		target.Set(reflect.ValueOf(int8(parsedVal)))
	case 16:
		target.Set(reflect.ValueOf(int16(parsedVal)))
	case 32:
		target.Set(reflect.ValueOf(int32(parsedVal)))
	default:
		target.SetInt(parsedVal)
	}
	return true
}

func timestampFromUrlQuery(value string, target *reflect.Value, context *DecoderContext) bool {
	parsedValue, parsingErr := time.ParseInLocation(time.RFC3339, value, time.UTC)
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
	target.Set(reflect.ValueOf(parsedValue))
	return true
}
