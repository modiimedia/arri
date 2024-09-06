package arri

import (
	"fmt"
	"net/url"
	"reflect"
	"strconv"
	"strings"
	"time"

	"github.com/iancoleman/strcase"
)

func FromUrlQuery[T any](values url.Values, target *T, keyCasing KeyCasing) *ValidationError {
	reflectValue := reflect.ValueOf(target).Elem()
	ctx := ValidationContext{KeyCasing: keyCasing}
	if reflectValue.Kind() != reflect.Struct {
		err := NewValidationError("only structs can be decoded from url query params", ctx.InstancePath, ctx.SchemaPath)
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
		isOptional := isOptionalType(fieldType)
		if isOptional {
			ctx := ctx.copyWith(
				None[uint32](),
				Some(enumValues),
				Some(ctx.InstancePath+"/"+key),
				Some(ctx.SchemaPath+"/optionalProperties"),
			)
			err := optionalTypeFromUrlQuery(urlValue, &field, &ctx)
			if err != nil {
				return err
			}
			continue
		}
		hasUrlValue := values.Has(key)
		if !hasUrlValue {
			return &ValidationError{Message: "missing required field", InstancePath: "/" + key, SchemaPath: "/properties/" + key}
		}
		ctx := ctx.copyWith(
			None[uint32](),
			Some(enumValues),
			Some(ctx.InstancePath+"/"+key),
			Some(ctx.SchemaPath+"/optionalProperties"),
		)
		isNullable := isNullableType(fieldType)
		if isNullable {
			err := nullableTypeFromUrlQuery(urlValue, &field, &ctx)
			if err != nil {
				return err
			}
			continue
		}
		err := typeFromUrlQuery(urlValue, &field, &ctx)
		if err != nil {
			return err
		}
	}
	return nil
}

func optionalTypeFromUrlQuery(value string, target *reflect.Value, context *ValidationContext) *ValidationError {
	if value == "" {
		return nil
	}
	innerTarget := target.FieldByName("Value")
	isSet := target.FieldByName("IsSet")
	err := typeFromUrlQuery(value, &innerTarget, context)
	if err != nil {
		return err
	}
	isSet.SetBool(true)
	return nil
}

func nullableTypeFromUrlQuery(value string, target *reflect.Value, context *ValidationContext) *ValidationError {
	if value == "null" || value == "NULL" || value == "Null" {
		return nil
	}
	innerValue := target.FieldByName("Value")
	isSet := target.FieldByName("IsSet")
	err := typeFromUrlQuery(value, &innerValue, context)
	if err != nil {
		return err
	}
	isSet.SetBool(true)
	return nil
}

func typeFromUrlQuery(value string, target *reflect.Value, context *ValidationContext) *ValidationError {
	kind := target.Kind()
	switch kind {
	case reflect.Bool:
		return boolFromUrlQuery(value, target, context)
	case reflect.String:
		if len(context.EnumValues) > 0 {
			return enumFromUrlQuery(value, target, context)
		}
		target.SetString(value)
		return nil
	case reflect.Float32:
		parsedVal, parsingErr := strconv.ParseFloat(value, 32)
		if parsingErr != nil {
			err := NewValidationError(parsingErr.Error(), context.InstancePath, context.SchemaPath)
			return &err
		}
		target.Set(reflect.ValueOf(float32(parsedVal)))
		return nil
	case reflect.Float64:
		parsedVal, parsingErr := strconv.ParseFloat(value, 64)
		if parsingErr != nil {
			err := NewValidationError(parsingErr.Error(), context.InstancePath, context.SchemaPath)
			return &err
		}
		target.SetFloat(parsedVal)
		return nil
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
		err := NewValidationError("decoding lists from url query strings is not supported", context.InstancePath, context.SchemaPath)
		return &err
	case reflect.Struct:
		if target.Type().Name() == "Time" {
			return timestampFromUrlQuery(value, target, context)
		}
		err := NewValidationError("decoding nested objects from url query strings is not supported", context.InstancePath, context.SchemaPath)
		return &err
	case reflect.Ptr:
		subTarget := target.Elem()
		return typeFromUrlQuery(value, &subTarget, context)
	case reflect.Map:
		err := NewValidationError("decoding nested objects from url query strings is not supported", context.InstancePath, context.SchemaPath)
		return &err
	}
	err := NewValidationError("unsupported type", context.InstancePath, context.SchemaPath)
	return &err
}

func boolFromUrlQuery(value string, target *reflect.Value, context *ValidationContext) *ValidationError {
	switch value {
	case "true", "TRUE", "1":
		target.SetBool(true)
		return nil
	case "false", "FALSE", "0":
		target.SetBool(false)
		return nil
	}
	err := NewValidationError("cannot convert \""+value+"\" to a boolean", context.InstancePath, context.SchemaPath)
	return &err
}

func enumFromUrlQuery(value string, target *reflect.Value, context *ValidationContext) *ValidationError {
	for i := 0; i < len(context.EnumValues); i++ {
		enumVal := context.EnumValues[i]
		if enumVal == value {
			target.SetString(enumVal)
			return nil
		}
	}
	err := NewValidationError(fmt.Sprintf("expected on of the following values %+v", context.EnumValues), context.InstancePath, context.SchemaPath)
	return &err
}

func intFromUrlQuery(value string, target *reflect.Value, context *ValidationContext, isUnsigned bool, bitSize int) *ValidationError {
	if isUnsigned {
		parsedVal, parsingErr := strconv.ParseUint(value, 10, bitSize)
		if parsingErr != nil {
			err := NewValidationError(parsingErr.Error(), context.InstancePath, context.SchemaPath)
			return &err
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
		return nil
	}
	parsedVal, parsingErr := strconv.ParseInt(value, 10, bitSize)
	if parsingErr != nil {
		err := NewValidationError(parsingErr.Error(), context.InstancePath, context.SchemaPath)
		return &err
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
	return nil
}

func timestampFromUrlQuery(value string, target *reflect.Value, context *ValidationContext) *ValidationError {
	parsedValue, parsingErr := time.ParseInLocation(time.RFC3339, value, time.UTC)
	if parsingErr != nil {
		err := NewValidationError(parsingErr.Error(), context.InstancePath, context.SchemaPath)
		return &err
	}
	target.Set(reflect.ValueOf(parsedValue))
	return nil
}
