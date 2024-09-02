package main

import (
	"fmt"
	"reflect"

	"github.com/iancoleman/strcase"
	"github.com/tidwall/gjson"
)

func FromJson[T any](data []byte, v *T) error {
	parsedResult := gjson.ParseBytes(data)
	value := reflect.ValueOf(&v)
	typeFromJson(&parsedResult, &value)
	return nil
}

func typeFromJson(data *gjson.Result, target *reflect.Value) error {
	switch target.Kind() {
	case reflect.Int8, reflect.Int16, reflect.Int32:
		return intFromJson(data, target)
	case reflect.Uint8, reflect.Uint16, reflect.Uint32:
	case reflect.Int64, reflect.Int:
	case reflect.Uint64, reflect.Uint:
	case reflect.String:
		return stringFromJson(data, target)
	case reflect.Bool:
		return boolFromJson(data, target)
	case reflect.Struct:
		return structFromJson(data, target)
	case reflect.Ptr:
		if target.IsNil() {
			return nil
		}
		elem := target.Elem()
		return typeFromJson(data, &elem)
	}
	return nil
}

func intFromJson(data *gjson.Result, target *reflect.Value) error {
	target.Set(reflect.ValueOf(data.Int()))
	return nil
}

func stringFromJson(data *gjson.Result, target *reflect.Value) error {
	if data.Type != gjson.String {
		return fmt.Errorf("expected string")
	}
	target.SetString(data.String())
	return nil
}

func boolFromJson(data *gjson.Result, target *reflect.Value) error {
	if !data.IsBool() {
		return fmt.Errorf("expected boolean")
	}
	target.SetBool(data.Bool())
	return nil
}

func structFromJson(data *gjson.Result, target *reflect.Value) error {
	targetType := target.Type()
	for i := 0; i < target.NumField(); i++ {
		field := target.Field(i)
		fieldType := field.Type()
		fieldMeta := targetType.Field(i)
		fieldName := strcase.ToLowerCamel(fieldMeta.Name)
		jsonResult := data.Get(fieldName)
		isOptional := isOptionalType(fieldType)
		if isOptional {
			err := optionFromJson(&jsonResult, &field)
			if err != nil {
				return err
			}
			continue
		}
		isNullable := isNullableType(fieldType)
		if isNullable {
			err := nullableFromJson(&jsonResult, &field)
			if err != nil {
				return err
			}
			continue
		}
		err := typeFromJson(&jsonResult, &field)
		if err != nil {
			return err
		}
	}
	return nil
}

func optionFromJson(data *gjson.Result, target *reflect.Value) error {
	if !data.Exists() {
		return nil
	}
	val := target.FieldByName("Value")
	isSet := target.FieldByName("IsSet")
	err := typeFromJson(data, &val)
	if err != nil {
		return err
	}
	isSet.SetBool(true)
	return nil
}

func nullableFromJson(data *gjson.Result, target *reflect.Value) error {
	if data.Type == gjson.Null {
		return nil
	}
	val := target.FieldByName("Value")
	isSet := target.FieldByName("IsSet")
	err := typeFromJson(data, &val)
	if err != nil {
		return err
	}
	isSet.SetBool(true)
	return nil
}
