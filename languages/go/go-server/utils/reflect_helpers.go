package utils

import (
	"reflect"
	"strings"

	"github.com/iancoleman/strcase"
)

const (
	KeyCasingPascalCase = "PASCAL_CASE"
	KeyCasingCamelCase  = "CAMEL_CASE"
	KeyCasingSnakeCase  = "SNAKE_CASE"
)

func IsOptionalType(t reflect.Type) bool {
	if t.Kind() == reflect.Ptr {
		return IsOptionalType(t.Elem())
	}
	return t.Kind() == reflect.Struct && strings.HasPrefix(t.Name(), "Option[")
}

func OptionalHasValue(value *reflect.Value) bool {
	target := value
	if target.Kind() == reflect.Ptr {
		if target.IsNil() {
			return false
		}
		el := value.Elem()
		target = &el
	}
	isSome := target.Field(1)
	return isSome.Bool()
}

func IsNullableType(t reflect.Type) bool {
	return t.Kind() == reflect.Struct && strings.HasPrefix(t.Name(), "Nullable[")
}

func IsNullableTypeOrPointer(t reflect.Type) bool {
	if t.Kind() == reflect.Ptr {
		return IsNullableTypeOrPointer(t.Elem())
	}
	return t.Kind() == reflect.Struct && strings.HasPrefix(t.Name(), "Nullable[")
}

func NullableHasValue(val *reflect.Value) bool {
	target := val
	if target.Kind() == reflect.Ptr {
		if target.IsNil() {
			return false
		}
		el := val.Elem()
		target = &el
	}
	isSet := target.Field(1)
	return isSet.Bool()
}

func GetSerialKey(field *reflect.StructField, keyCasing string) string {
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

func IsEmptyMessage(t reflect.Type) bool {
	return t.Name() == "EmptyMessage" && strings.Contains(t.PkgPath(), "arri")
}
