package main

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/iancoleman/strcase"
)

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
	Metadata           *ArriTypeDefMetadata    `json:"metadata,omitempty"`
	Nullable           *bool                   `json:"nullable,omitempty"`
	Type               *ArriType               `json:"type,omitempty"`
	Enum               *[]string               `json:"enum,omitempty"`
	Elements           *ArriTypeDef            `json:"elements,omitempty"`
	Properties         *map[string]ArriTypeDef `json:"properties,omitempty"`
	OptionalProperties *map[string]ArriTypeDef `json:"optionalProperties,omitempty"`
	Strict             *bool                   `json:"strict,omitempty"`
	Values             *ArriTypeDef            `json:"values,omitempty"`
	Discriminator      *string                 `json:"discriminator,omitempty"`
	Mapping            *map[string]ArriTypeDef `json:"mapping,omitempty"`
	Ref                *string                 `json:"ref,omitempty"`
}

type ArriSchemaError struct{}

func ToTypeDef(input interface{}) (*ArriTypeDef, error) {
	context := _TypeDefContext{IsNullable: nil}
	return toTypeDef(reflect.TypeOf(input), context)
}

type _TypeDefContext struct {
	ParentStructs []string
	InstancePath  string
	SchemaPath    string
	IsNullable    *bool
	EnumValues    *[]string
}

func (context _TypeDefContext) copyWith(ParentStructs *[]string, InstancePath *string, SchemaPath *string, IsNullable *bool, EnumValues *[]string) _TypeDefContext {
	structs := context.ParentStructs
	if ParentStructs != nil {
		structs = *ParentStructs
	}
	instancePath := context.InstancePath
	if InstancePath != nil {
		instancePath = *InstancePath
	}
	schemaPath := context.SchemaPath
	if SchemaPath != nil {
		schemaPath = *SchemaPath
	}
	isNullable := context.IsNullable
	if IsNullable != nil {
		isNullable = IsNullable
	}
	enumValues := context.EnumValues
	if EnumValues != nil {
		enumValues = EnumValues
	}
	return _TypeDefContext{
		ParentStructs: structs,
		InstancePath:  instancePath,
		SchemaPath:    schemaPath,
		IsNullable:    isNullable,
		EnumValues:    enumValues,
	}

}

func toTypeDef(input reflect.Type, context _TypeDefContext) (*ArriTypeDef, error) {
	switch input.Kind() {
	case reflect.Invalid:
		return nil, errors.ErrUnsupported
	case
		reflect.String,
		reflect.Bool,
		reflect.Float32,
		reflect.Float64,
		reflect.Int,
		reflect.Int8,
		reflect.Int16,
		reflect.Int32,
		reflect.Int64,
		reflect.Uint,
		reflect.Uint16,
		reflect.Uint32,
		reflect.Uint64:
		return primitiveTypeToTypeDef(input, context)
	case
		reflect.Uintptr,
		reflect.Complex64,
		reflect.Complex128,
		reflect.Chan,
		reflect.Func,
		reflect.Interface,
		reflect.Map:
		return nil, errors.ErrUnsupported
	case reflect.Pointer:
		return toTypeDef(input.Elem(), context)
	case
		reflect.Array,
		reflect.Slice:
		return nil, errors.ErrUnsupported
	case reflect.Struct:
		if input.Name() == "Time" {
			t := ATimestamp
			return &ArriTypeDef{Type: &t, Nullable: context.IsNullable}, nil
		}
		return structToTypeDef(input, context)
	case reflect.UnsafePointer:
		return nil, errors.ErrUnsupported
	}
	return nil, errors.ErrUnsupported
}

func primitiveTypeToTypeDef(value reflect.Type, context _TypeDefContext) (*ArriTypeDef, error) {
	kind := value.Kind()
	switch kind {
	case reflect.Invalid:
		return nil, errors.ErrUnsupported
	case reflect.Bool:
		t := ABoolean
		return &ArriTypeDef{Type: &t, Nullable: context.IsNullable}, nil
	case reflect.Int:
		t := AInt64
		return &ArriTypeDef{Type: &t, Nullable: context.IsNullable}, nil
	case reflect.Int8:
		t := AInt8
		return &ArriTypeDef{Type: &t, Nullable: context.IsNullable}, nil
	case reflect.Int16:
		t := AInt16
		return &ArriTypeDef{Type: &t, Nullable: context.IsNullable}, nil
	case reflect.Int32:
		t := AInt32
		return &ArriTypeDef{Type: &t, Nullable: context.IsNullable}, nil
	case reflect.Int64:
		t := AInt64
		return &ArriTypeDef{Type: &t, Nullable: context.IsNullable}, nil
	case reflect.Uint:
		t := AUint64
		return &ArriTypeDef{Type: &t, Nullable: context.IsNullable}, nil
	case reflect.Uint8:
		t := AUint8
		return &ArriTypeDef{Type: &t, Nullable: context.IsNullable}, nil
	case reflect.Uint16:
		t := AUint16
		return &ArriTypeDef{Type: &t, Nullable: context.IsNullable}, nil
	case reflect.Uint32:
		t := AUint32
		return &ArriTypeDef{Type: &t, Nullable: context.IsNullable}, nil
	case reflect.Uint64:
		t := AUint64
		return &ArriTypeDef{Type: &t, Nullable: context.IsNullable}, nil
	case reflect.Uintptr:
		return nil, errors.New("uintptr is not a type supported by Arri RPC")
	case reflect.Float32:
		t := AFloat32
		return &ArriTypeDef{Type: &t, Nullable: context.IsNullable}, nil
	case reflect.Float64:
		t := AFloat64
		return &ArriTypeDef{Type: &t, Nullable: context.IsNullable}, nil
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
		if context.EnumValues != nil {
			return &ArriTypeDef{Enum: context.EnumValues, Nullable: context.IsNullable}, nil
		}
		t := AString
		return &ArriTypeDef{Type: &t, Nullable: context.IsNullable}, nil
	case reflect.Struct:
		return nil, errors.New("cannot convert Struct to primitive type")
	case reflect.UnsafePointer:
		return nil, errors.New("cannot convert UnsafePointer to primitive type")
	default:
		return nil, fmt.Errorf("(%+v) is not a supported primitive type", kind)
	}
}

func isDiscriminatorStruct(input reflect.Type) bool {
	if input.Kind() != reflect.Struct {
		return false
	}
	for i := 0; i < input.NumField(); i++ {
		var discriminatorTag = input.Field(i).Tag.Get("discriminator")
		if len(discriminatorTag) > 0 {
			return true
		}
	}
	return false
}

func structToTypeDef(input reflect.Type, context _TypeDefContext) (*ArriTypeDef, error) {
	structName := input.Name()
	for i := 0; i < len(context.ParentStructs); i++ {
		name := context.ParentStructs[i]
		if name == structName {
			return &ArriTypeDef{Ref: &structName}, nil
		}
	}
	context.ParentStructs = append(context.ParentStructs, structName)
	kind := input.Kind()
	if kind != reflect.Struct {
		return nil, errors.ErrUnsupported
	}
	if input.NumField() == 0 {
		return nil, errors.New("cannot create schema for an empty struct")
	}

	requiredFields := make(map[string]ArriTypeDef)
	optionalFields := make(map[string]ArriTypeDef)
	for i := 0; i < input.NumField(); i++ {
		field := input.Field(i)
		isDiscriminator := len(field.Tag.Get("discriminator")) > 0
		if isDiscriminator {
			return taggedUnionToTypeDef(structName, input, context)
		}
		key := field.Tag.Get("key")
		if len(key) == 0 {
			key = strcase.ToLowerCamel(field.Name)
		}
		var nullable *bool = nil
		var deprecated = false
		description := field.Tag.Get("description")
		annotations := strings.Split(field.Tag.Get("annotations"), ",")
		for i := 0; i < len(annotations); i++ {
			annotation := annotations[i]
			switch annotation {
			case "nullable":
				t := true
				nullable = &t
			case "deprecated":
				deprecated = true
			}
		}
		var enumValues *[]string
		if len(field.Tag.Get("enum")) > 0 {
			valueList := []string{}
			values := strings.Split(field.Tag.Get("enum"), ",")
			for i := 0; i < len(values); i++ {
				value := values[i]
				valueList = append(valueList, strings.TrimSpace(value))
			}
			enumValues = &valueList

		}
		tRef := true
		isOptional := nullable != &tRef && field.Type.Kind() == reflect.Ptr
		instancePath := context.InstancePath + "/" + key
		schemaPath := context.SchemaPath + "/properties/" + key
		fieldResult, fieldError := toTypeDef(field.Type, context.copyWith(nil, &instancePath, &schemaPath, nullable, enumValues))
		if fieldError != nil {
			return nil, fieldError
		}
		if len(description) > 0 || deprecated {
			if fieldResult.Metadata == nil {
				fieldResult.Metadata = &ArriTypeDefMetadata{}
			}
			if len(description) > 0 {
				fieldResult.Metadata.Description = &description
			}
			if deprecated {
				fieldResult.Metadata.IsDeprecated = &deprecated
			}
		}
		if isOptional {
			optionalFields[key] = *fieldResult
		} else {
			requiredFields[key] = *fieldResult
		}
	}
	if len(optionalFields) > 0 {
		return &ArriTypeDef{
			Properties:         &requiredFields,
			OptionalProperties: &optionalFields,
			Nullable:           context.IsNullable,
			Metadata:           &ArriTypeDefMetadata{Id: &structName}}, nil
	}
	return &ArriTypeDef{
		Properties: &requiredFields,
		Nullable:   context.IsNullable,
		Metadata:   &ArriTypeDefMetadata{Id: &structName}}, nil
}

func taggedUnionToTypeDef(name string, input reflect.Type, context _TypeDefContext) (*ArriTypeDef, error) {
	kind := input.Kind()
	if kind != reflect.Struct {
		return nil, errors.ErrUnsupported
	}
	if input.NumField() == 0 {
		return nil, errors.New("cannot create schema for an empty struct")
	}
	mapping := make(map[string]ArriTypeDef)
	for i := 0; i < input.NumField(); i++ {
		field := input.Field(i)
		discriminatorValue := field.Tag.Get("discriminator")
		if len(discriminatorValue) == 0 {
			return nil, errors.New("all discriminator subtypes must have the \"discriminator\" tag")
		}
		if field.Type.Kind() != reflect.Ptr {
			return nil, errors.New("all fields in discriminators structs must be a pointer to a struct")
		}
		if isDiscriminatorStruct(field.Type.Elem()) {
			return nil, errors.New("the direct child of a discriminator struct cannot be another discriminator struct")
		}
		schemaPath := context.SchemaPath + "/mapping/" + discriminatorValue
		fieldResult, fieldError := structToTypeDef(field.Type.Elem(), context.copyWith(&context.ParentStructs, nil, &schemaPath, nil, nil))
		if fieldError != nil {
			return nil, fieldError
		}
		mapping[discriminatorValue] = *fieldResult
	}
	discriminatorKey := "type"
	return &ArriTypeDef{Discriminator: &discriminatorKey, Mapping: &mapping, Metadata: &ArriTypeDefMetadata{Id: &name}}, nil
}

const (
	Active   = "ACTIVE"
	Inactive = "INACTIVE"
)

type MessageStatus = string

type Message struct {
	Id        string
	Status    string `enum:"ACTIVE,INACTIVE"`
	CreatedAt time.Time
	UpdatedAt time.Time
	Text      string
}

type Shape struct {
	Rectangle *Rectangle  `discriminator:"RECTANGLE"`
	Circle    *Circle     `discriminator:"CIRCLE"`
	Child     *ShapeChild `discriminator:"CHILD"`
}

type Rectangle struct {
	Width  float64
	Height float64
}

type Circle struct {
	Radius float64
}

type ShapeChild struct {
	Child Shape
}
