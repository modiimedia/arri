package arri

import (
	"reflect"
	"strings"

	"github.com/iancoleman/strcase"
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
	isSetResults := input.MethodByName("IsSome").Call([]reflect.Value{})
	if !isSetResults[0].Bool() {
		return nil
	}
	return &input.MethodByName("Unwrap").Call([]reflect.Value{})[0]
}

func isOptionalType(input reflect.Type) bool {
	t := input
	if t.Kind() == reflect.Ptr {
		t = t.Elem()
	}
	if t.Kind() == reflect.Struct {
		_, methodExists := t.MethodByName("IsSome")
		if methodExists {
			return true
		}
	}
	return false
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

func getSerialKey(field *reflect.StructField, keyCasing KeyCasing) string {
	keyTag := field.Tag.Get("key")
	if len(keyTag) > 0 {
		return keyTag
	}
	switch keyCasing {
	case KeyCasingCamelCase:
		return strcase.ToLowerCamel(field.Name)
	case KeyCasingPascalCase:
		return field.Name
	case KeyCasingSnakeCase:
		return strcase.ToSnake(field.Name)
	}
	return strcase.ToLowerCamel(field.Name)
}
