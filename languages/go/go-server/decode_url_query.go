package arri

import (
	"errors"
	"fmt"
	"net/url"
	"reflect"
	"strconv"
	"time"

	"github.com/modiimedia/arri/languages/go/go-server/utils"
)

func DecodeQueryParams[T any](values url.Values, target *T, options EncodingOptions) *DecoderError {
	reflectValue := reflect.ValueOf(target).Elem()
	keyCasing := options.KeyCasing
	if len(keyCasing) == 0 {
		keyCasing = KeyCasingCamelCase
	}
	ctx := DecoderContext{KeyCasing: keyCasing, Errors: []ValidationError{}}
	if reflectValue.Kind() != reflect.Struct {
		err := NewDecoderError(
			[]ValidationError{
				NewValidationError("only structs can be decoded from url query params", ctx.InstancePath, ctx.SchemaPath),
			},
		)
		return &err
	}
	structFromUrlQuery(values, reflectValue, &ctx)
	if len(ctx.Errors) > 0 {
		err := NewDecoderError(ctx.Errors)
		return &err
	}
	return nil
}

func structFromUrlQuery(values url.Values, target reflect.Value, ctx *DecoderContext) bool {
	targetType := target.Type()
	union, unionErr := getUnionInfo(targetType)
	if unionErr != nil {
		ctx.Errors = append(ctx.Errors, NewValidationError(unionErr.Error(), ctx.InstancePath, ctx.SchemaPath))
		return false
	}
	if union != nil {
		return unionFromUrlQuery(values, target, union, ctx)
	}
	hasErr := false
	ctxSnapshot := ctx.clone()
	for i := 0; i < target.NumField(); i++ {
		field := target.Field(i)
		fieldMeta := targetType.Field(i)
		if !fieldMeta.IsExported() {
			continue
		}
		fieldType := field.Type()
		key := utils.GetSerialKey(&fieldMeta, ctx.KeyCasing)
		enumValues, _ := enumOptionsFromField(&fieldMeta)
		urlValue := values.Get(key)
		ctx.CurrentDepth = ctxSnapshot.CurrentDepth + 1
		ctx.InstancePath = ctxSnapshot.InstancePath + "/" + key
		ctx.EnumValues = enumValues.UnwrapOr(None[[]string]()).UnwrapOr([]string{})
		if utils.IsOptionalType(fieldType) {
			ctx.SchemaPath = ctxSnapshot.SchemaPath + "/optionalProperties/" + key
			if !optionalTypeFromUrlQuery(urlValue, &field, ctx) {
				hasErr = true
			}
			continue
		}
		ctx.SchemaPath = ctxSnapshot.SchemaPath + "/properties/" + key
		if !values.Has(key) {
			ctx.Errors = append(ctx.Errors,
				NewValidationError("missing required field", ctx.InstancePath, ctx.SchemaPath),
			)
			hasErr = true
			continue
		}
		var success bool
		if utils.IsNullableTypeOrPointer(fieldType) {
			success = nullableTypeFromUrlQuery(urlValue, &field, ctx)
		} else {
			success = typeFromUrlQuery(urlValue, &field, ctx)
		}
		if !success {
			hasErr = true
		}
	}
	ctx.CurrentDepth = ctxSnapshot.CurrentDepth
	ctx.InstancePath = ctxSnapshot.InstancePath
	ctx.SchemaPath = ctxSnapshot.SchemaPath
	ctx.EnumValues = ctxSnapshot.EnumValues
	return !hasErr
}

// Only internally tagged unions are supported. The tag and the variant's fields are all top level params.
func unionFromUrlQuery(values url.Values, target reflect.Value, info *unionInfo, ctx *DecoderContext) bool {
	if !info.isInternallyTagged() {
		ctx.Errors = append(ctx.Errors, NewValidationError(
			"only internally tagged unions can be decoded from url query params",
			ctx.InstancePath,
			ctx.SchemaPath,
		))
		return false
	}
	if !values.Has(info.TagKey) {
		ctx.Errors = append(ctx.Errors, NewValidationError(
			"missing union tag \""+info.TagKey+"\"",
			ctx.InstancePath+"/"+info.TagKey,
			ctx.SchemaPath+"/tagKey",
		))
		return false
	}
	tag := values.Get(info.TagKey)
	targetType := target.Type()
	for _, variant := range info.Variants {
		if variant.tagName(ctx.KeyCasing) != tag {
			continue
		}
		variantType := targetType.Field(variant.FieldIndex).Type.Elem()
		if variantType.Kind() != reflect.Struct {
			ctx.Errors = append(ctx.Errors, NewValidationError(
				"internally tagged union variants must be structs",
				ctx.InstancePath,
				ctx.SchemaPath+"/union/"+tag,
			))
			return false
		}
		innerTarget := reflect.New(variantType)
		schemaPath := ctx.SchemaPath
		ctx.SchemaPath = schemaPath + "/union/" + tag
		success := structFromUrlQuery(values, innerTarget.Elem(), ctx)
		ctx.SchemaPath = schemaPath
		if !success {
			return false
		}
		for _, other := range info.Variants {
			otherField := target.Field(other.FieldIndex)
			otherField.Set(reflect.Zero(otherField.Type()))
		}
		target.Field(variant.FieldIndex).Set(innerTarget)
		return true
	}
	ctx.Errors = append(ctx.Errors, NewValidationError(
		"\""+tag+"\" is not a valid union variant",
		ctx.InstancePath+"/"+info.TagKey,
		ctx.SchemaPath+"/union",
	))
	return false
}

// Returns an error when values of the schema can't be passed through url query params.
// Supported schemas are objects or internally tagged unions of objects where every property is a primitive or enum.
func validateUrlQueryTypeDef(def *TypeDef) error {
	if def.Union.IsSome() {
		if def.TagKey.IsNone() || def.ValueKey.IsSome() {
			return errors.New("only internally tagged unions can be used as url query params")
		}
		for _, entry := range def.Union.Value.Entries() {
			variant := entry.Right
			if err := validateUrlQueryProperties(&variant, "/"+entry.Left); err != nil {
				return err
			}
		}
		return nil
	}
	if def.Properties.IsNone() {
		return errors.New("url query params must be an object or an internally tagged union")
	}
	return validateUrlQueryProperties(def, "")
}

func validateUrlQueryProperties(def *TypeDef, path string) error {
	properties := []pair[string, TypeDef]{}
	if def.Properties.IsSome() {
		properties = append(properties, def.Properties.Value.Entries()...)
	}
	if def.OptionalProperties.IsSome() {
		properties = append(properties, def.OptionalProperties.Value.Entries()...)
	}
	for _, property := range properties {
		if property.Right.Type.IsNone() && property.Right.Enum.IsNone() {
			return fmt.Errorf(
				"\"%s/%s\" cannot be passed through url query params. only strings, booleans, numbers, timestamps, and enums are supported",
				path,
				property.Left,
			)
		}
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
