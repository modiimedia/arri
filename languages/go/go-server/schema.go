package main

import (
	"errors"
	"fmt"
	"reflect"
)

type Message struct {
	Id       string
	Text     string
	PhotoUrl string
}

const (
	AString    = "string"
	ABoolean   = "boolean"
	ATimestamp = "timestamp"
	AFloat32   = "float32"
	AFloat64   = "float64"
	AInt8      = "int8"
	AInt16     = "int16"
	AInt32     = "int32"
	AInt64     = "int64"
	AUint8     = "uint8"
	AUint16    = "uint16"
	AUint32    = "uint32"
	AUint64    = "uint64"
)

type ArriType = string

type ArriTypeDefMetadata struct {
	Id           *string `json:"id,omitempty"`
	Description  *string `json:"description,omitempty"`
	IsDeprecated *bool   `json:"isDeprecated,omitempty"`
}

type ArriTypeDef struct {
	Metadata             *ArriTypeDefMetadata    `json:"metadata,omitempty"`
	Nullable             *bool                   `json:"nullable,omitempty"`
	Type                 *ArriType               `json:"type,omitempty"`
	Enum                 *[]string               `json:"enum,omitempty"`
	Elements             *ArriTypeDef            `json:"elements,omitempty"`
	Properties           *map[string]ArriTypeDef `json:"properties,omitempty"`
	AdditionalProperties *map[string]ArriTypeDef `json:"additionalProperties,omitempty"`
	Strict               *bool                   `json:"strict,omitempty"`
	Values               *ArriTypeDef            `json:"values,omitempty"`
	Discriminator        *string                 `json:"discriminator,omitempty"`
	Mapping              *map[string]ArriTypeDef `json:"mapping,omitempty"`
}

type ArriSchemaError struct{}

func ToTypeDef(value reflect.Value) (*ArriTypeDef, error) {
	var kind = value.Kind()
	fmt.Println(kind)
	switch kind {
	case reflect.Invalid:
		return nil, errors.ErrUnsupported
	case reflect.Bool:
		fallthrough
	case reflect.Int:
		fallthrough
	case reflect.Int8:
		fallthrough
	case reflect.Int16:
		fallthrough
	case reflect.Int32:
		fallthrough
	case reflect.Int64:
		fallthrough
	case reflect.Uint:
		fallthrough
	case reflect.Uint8:
		fallthrough
	case reflect.Uint16:
		fallthrough
	case reflect.Uint32:
		fallthrough
	case reflect.Uint64:
		return primitiveTypeToTypeDef(value)
	case reflect.Uintptr:
		return nil, errors.ErrUnsupported
	case reflect.Float32:
		fallthrough
	case reflect.Float64:
		return primitiveTypeToTypeDef(value)
	case reflect.Complex64:
		fallthrough
	case reflect.Complex128:
		fallthrough
	case reflect.Array:
		fallthrough
	case reflect.Chan:
		fallthrough
	case reflect.Func:
		fallthrough
	case reflect.Interface:
		fallthrough
	case reflect.Map:
		fallthrough
	case reflect.Ptr:
		return ToTypeDef(value.Addr())
	case reflect.Slice:
		return nil, errors.ErrUnsupported
	case reflect.String:
		return primitiveTypeToTypeDef(value)
	case reflect.Struct:
		return structToTypeDef(value)
	case reflect.UnsafePointer:
		return nil, errors.ErrUnsupported
	}
	return nil, errors.ErrUnsupported
}

func primitiveTypeToTypeDef(value reflect.Value) (*ArriTypeDef, error) {
	kind := value.Kind()
	switch kind {
	case reflect.Invalid:
		return nil, errors.ErrUnsupported
	case reflect.Bool:
		t := ABoolean
		return &ArriTypeDef{Type: &t}, nil
	case reflect.Int:
		t := AInt64
		return &ArriTypeDef{Type: &t}, nil
	case reflect.Int8:
		t := AInt8
		return &ArriTypeDef{Type: &t}, nil
	case reflect.Int16:
		t := AInt16
		return &ArriTypeDef{Type: &t}, nil
	case reflect.Int32:
		t := AInt32
		return &ArriTypeDef{Type: &t}, nil
	case reflect.Int64:
		t := AInt64
		return &ArriTypeDef{Type: &t}, nil
	case reflect.Uint:
		t := AUint64
		return &ArriTypeDef{Type: &t}, nil
	case reflect.Uint8:
		t := AUint8
		return &ArriTypeDef{Type: &t}, nil
	case reflect.Uint16:
		t := AUint16
		return &ArriTypeDef{Type: &t}, nil
	case reflect.Uint32:
		t := AUint32
		return &ArriTypeDef{Type: &t}, nil
	case reflect.Uint64:
		t := AUint64
		return &ArriTypeDef{Type: &t}, nil
	case reflect.Uintptr:
		return nil, errors.New("uintptr is not a type supported by Arri RPC")
	case reflect.Float32:
		t := AFloat32
		return &ArriTypeDef{Type: &t}, nil
	case reflect.Float64:
		t := AFloat64
		return &ArriTypeDef{Type: &t}, nil
	case reflect.Complex64:
		return nil, errors.New("Complex64 is not a type supported by Arri RPC")
	case reflect.Complex128:
		return nil, errors.New("Complex128 is not a type supported by Arri RPC")
	case reflect.Array:
		fallthrough
	case reflect.Chan:
		fallthrough
	case reflect.Func:
		fallthrough
	case reflect.Interface:
		fallthrough
	case reflect.Map:
		fallthrough
	case reflect.Ptr:
		fallthrough
	case reflect.Slice:
		return nil, fmt.Errorf("%+v is not a supported primitive type", kind)
	case reflect.String:
		t := AString
		return &ArriTypeDef{Type: &t}, nil
	case reflect.Struct:
		return nil, errors.New("cannot convert Struct to primitive type")
	case reflect.UnsafePointer:
		return nil, errors.New("cannot convert UnsafePointer to primitive type")
	default:
		return nil, fmt.Errorf("(%+v) is not a supported primitive type", kind)
	}
}

func structToTypeDef(input reflect.Value) (*ArriTypeDef, error) {
	kind := input.Kind()
	if kind != reflect.Struct {
		return nil, errors.ErrUnsupported
	}
	requiredFields := make(map[string]ArriTypeDef)
	for i := 0; i < input.NumField(); i++ {
		structFieldObj := input.Field(i)
		structFieldObjType := input.Type().Field(i)
		fieldResult, fieldError := ToTypeDef(structFieldObj)
		if fieldError != nil {
			return nil, fieldError
		}
		requiredFields[structFieldObjType.Name] = *fieldResult
	}
	return &ArriTypeDef{Properties: &requiredFields}, nil
}
