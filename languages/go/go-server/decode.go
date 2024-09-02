package main

import (
	"fmt"
	"reflect"

	"github.com/buger/jsonparser"
	"github.com/iancoleman/strcase"
	"github.com/tidwall/gjson"
)

func FromJson[T any](data []byte, v T) error {
	fmt.Println(jsonparser.Get(data))
	parsedResult := gjson.ParseBytes(data)
	value := reflect.ValueOf(v)
	typeFromJson(&parsedResult, &value)
	fmt.Println("RESULT", parsedResult)
	fmt.Println("TYPE_RESULT", v)
	return nil
}

func typeFromJson(data *gjson.Result, value *reflect.Value) error {
	switch value.Kind() {
	case reflect.Int8, reflect.Int16, reflect.Int32:
		return intFromJson(data, value)
	case reflect.Uint8, reflect.Uint16, reflect.Uint32:
	case reflect.Int64, reflect.Int:
	case reflect.Uint64, reflect.Uint:
	case reflect.String:
	case reflect.Bool:
	case reflect.Struct:
		return structFromJson(data, value)
	}
	return nil
}

func intFromJson(data *gjson.Result, value *reflect.Value) error {
	value.Set(reflect.ValueOf(data.Int()))
	return nil
}

func structFromJson(data *gjson.Result, value *reflect.Value) error {
	valueType := value.Type()
	for i := 0; i < value.NumField(); i++ {
		field := value.Field(i)
		fieldType := valueType.Field(i)
		fieldName := strcase.ToLowerCamel(fieldType.Name)
		fmt.Println("FIELD:", field.Kind())
		fmt.Println("FIELD_NAME:", fieldName)
		jsonResult := data.Get(fieldName)
		fmt.Println("FIELD RESULT:", jsonResult)
	}
	return nil
}
