package arri

import (
	"reflect"
	"strings"
)

func extractOptionalValue(input *reflect.Value) *reflect.Value {
	kind := input.Kind()
	if kind == reflect.Ptr {
		if input.IsNil() {
			return nil
		}
		el := input.Elem()
		return &el
	}
	if input.IsZero() {
		return nil
	}
	isSet := input.FieldByName("IsSet").Bool()
	if !isSet {
		return nil
	}
	value := input.FieldByName("Value")
	return &value
}

func isOptionalType(input reflect.Type) bool {
	return (input.Kind() == reflect.Ptr &&
		input.Elem().Kind() == reflect.Struct &&
		strings.Contains(input.Elem().Name(), "Option[")) ||
		input.Kind() == reflect.Struct &&
			strings.Contains(input.Name(), "Option[")
}

func extractNullableValue(input *reflect.Value) *reflect.Value {
	isSet := input.FieldByName("IsSet").Bool()
	if !isSet {
		return nil
	}
	value := input.FieldByName("Value")
	return &value
}

func isNullableType(input reflect.Type) bool {
	return (input.Kind() == reflect.Struct && input != nil && strings.Contains(input.Name(), "Nullable[")) ||
		input.Kind() == reflect.Ptr && isNullableType(input.Elem())
}
