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

type AType = string

type ATypeMetadata struct {
	Id           string         `key:"id"`
	Description  Option[string] `key:"description"`
	IsDeprecated Option[bool]   `key:"isDeprecated"`
}

type ATypeDef struct {
	Metadata           Option[ATypeMetadata]                    `key:"metadata" `
	Nullable           Option[bool]                             `key:"nullable"`
	Type               Option[AType]                            `key:"type"`
	Enum               Option[[]string]                         `key:"enum"`
	Elements           *ATypeDef                                `key:"elements"`
	Properties         Option[[]__aOrderedMapEntry__[ATypeDef]] `key:"properties"`
	OptionalProperties Option[[]__aOrderedMapEntry__[ATypeDef]] `key:"optionalProperties"`
	Strict             Option[bool]                             `key:"strict"`
	Values             *ATypeDef                                `key:"values"`
	Discriminator      Option[string]                           `key:"discriminator"`
	Mapping            Option[map[string]ATypeDef]              `key:"mapping"`
	Ref                Option[string]                           `key:"ref"`
}

type __aOrderedMapEntry__[T interface{}] struct {
	Key   string
	Value T
}

func __updateAOrderedMap__[T interface{}](state []__aOrderedMapEntry__[T], newValue __aOrderedMapEntry__[T]) []__aOrderedMapEntry__[T] {
	var targetIndex *int = nil
	for i := 0; i < len(state); i++ {
		value := state[i]
		if value.Key == newValue.Key {
			targetIndex = &i
			break
		}
	}
	if targetIndex != nil {
		state[*targetIndex] = newValue
		return state
	}
	state = append(state, newValue)
	return state
}

const (
	KeyCasingPascalCase = "PASCAL_CASE"
	KeyCasingCamelCase  = "CAMEL_CASE"
	KeyCasingSnakeCase  = "SNAKE_CASE"
)

type KeyCasing = string

type _TypeDefContext struct {
	KeyCasing     KeyCasing
	MaxDepth      uint32
	CurrentDepth  uint32
	ParentStructs []string
	InstancePath  string
	SchemaPath    string
	IsNullable    Option[bool]
	EnumName      Option[string]
	EnumValues    Option[[]string]
}

func _NewTypeDefContext(keyCasing KeyCasing) _TypeDefContext {
	casing := KeyCasingCamelCase
	switch keyCasing {
	case KeyCasingCamelCase, KeyCasingSnakeCase, KeyCasingPascalCase:
		casing = keyCasing
	case "":
		casing = keyCasing
	}
	return _TypeDefContext{
		KeyCasing:    casing,
		MaxDepth:     1000,
		InstancePath: "",
		IsNullable:   None[bool](),
		EnumName:     None[string](),
		EnumValues:   None[[]string](),
	}

}

func (context _TypeDefContext) copyWith(
	CurrentDepth Option[uint32],
	ParentStructs Option[[]string],
	InstancePath Option[string],
	SchemaPath Option[string],
	IsNullable Option[Option[bool]],
	EnumValues Option[Option[[]string]],
	EnumName Option[Option[string]],
) _TypeDefContext {
	depth := CurrentDepth.UnwrapOr(context.CurrentDepth)
	structs := ParentStructs.UnwrapOr(context.ParentStructs)
	instancePath := InstancePath.UnwrapOr(context.InstancePath)
	schemaPath := SchemaPath.UnwrapOr(context.SchemaPath)
	isNullable := IsNullable.UnwrapOr(context.IsNullable)
	enumValues := EnumValues.UnwrapOr(context.EnumValues)
	enumName := EnumName.UnwrapOr(context.EnumName)
	return _TypeDefContext{
		KeyCasing:     context.KeyCasing,
		MaxDepth:      context.MaxDepth,
		CurrentDepth:  depth,
		ParentStructs: structs,
		InstancePath:  instancePath,
		SchemaPath:    schemaPath,
		IsNullable:    isNullable,
		EnumValues:    enumValues,
		EnumName:      enumName,
	}

}

func ToTypeDef(input interface{}, keyCasing KeyCasing) (*ATypeDef, error) {
	context := _NewTypeDefContext(keyCasing)
	return typeToTypeDef(reflect.TypeOf(input), context)
}

func typeToTypeDef(input reflect.Type, context _TypeDefContext) (*ATypeDef, error) {
	if context.CurrentDepth >= context.MaxDepth {
		return nil, fmt.Errorf("error at %s. max depth of %+v reached", context.InstancePath, context.MaxDepth)
	}
	switch input.Kind() {
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
	case reflect.Pointer:
		return typeToTypeDef(input.Elem(), context)
	case reflect.Map:
		return mapToTypeDef(input, context)
	case
		reflect.Array,
		reflect.Slice:
		return arrayToTypeDef(input, context)
	case reflect.Struct:
		if input.Name() == "Time" {
			t := ATimestamp
			return &ATypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
		}
		return structToTypeDef(input, context)
	case reflect.Interface:
		return &ATypeDef{Nullable: context.IsNullable}, nil
	default:
		return nil, fmt.Errorf("error at %s. %s is not a supported type", context.InstancePath, input.Kind())
	}
}

func primitiveTypeToTypeDef(value reflect.Type, context _TypeDefContext) (*ATypeDef, error) {
	kind := value.Kind()
	switch kind {
	case reflect.Bool:
		t := ABoolean
		return &ATypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Int:
		t := AInt64
		return &ATypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Int8:
		t := AInt8
		return &ATypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Int16:
		t := AInt16
		return &ATypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Int32:
		t := AInt32
		return &ATypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Int64:
		t := AInt64
		return &ATypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Uint:
		t := AUint64
		return &ATypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Uint8:
		t := AUint8
		return &ATypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Uint16:
		t := AUint16
		return &ATypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Uint32:
		t := AUint32
		return &ATypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Uint64:
		t := AUint64
		return &ATypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Float32:
		t := AFloat32
		return &ATypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Float64:
		t := AFloat64
		return &ATypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.String:
		if context.EnumValues.IsSome() {
			metadata := None[ATypeMetadata]()
			if context.EnumName.IsSome() {
				metadata = Some(ATypeMetadata{Id: context.EnumName.Unwrap()})
			}
			return &ATypeDef{
				Enum:     context.EnumValues,
				Nullable: context.IsNullable,
				Metadata: metadata,
			}, nil
		}
		t := AString
		return &ATypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	default:
		return nil, fmt.Errorf("error at %s. '%s' is not a supported primitive type", context.InstancePath, kind)
	}
}

func IsDiscriminatorStruct(input reflect.Type) bool {
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

func structToTypeDef(input reflect.Type, context _TypeDefContext) (*ATypeDef, error) {
	structName := input.Name()
	for i := 0; i < len(context.ParentStructs); i++ {
		name := context.ParentStructs[i]
		if name == structName {
			return &ATypeDef{Ref: Some(structName)}, nil
		}
	}
	context.ParentStructs = append(context.ParentStructs, structName)
	kind := input.Kind()
	if kind != reflect.Struct {
		return nil, errors.ErrUnsupported
	}
	if input.NumField() == 0 && input.Name() != "DiscriminatorKey" {
		return nil, errors.New("cannot create schema for an empty struct")
	}

	requiredFields := []__aOrderedMapEntry__[ATypeDef]{}
	optionalFields := []__aOrderedMapEntry__[ATypeDef]{}
	for i := 0; i < input.NumField(); i++ {
		field := input.Field(i)
		isDiscriminator := len(field.Tag.Get("discriminator")) > 0 || field.Type.Name() == "DiscriminatorKey"
		if isDiscriminator {
			return taggedUnionToTypeDef(structName, input, context)
		}
		key := field.Tag.Get("key")
		if len(key) == 0 {
			switch context.KeyCasing {
			case KeyCasingCamelCase:
				key = strcase.ToLowerCamel(field.Name)
			case KeyCasingSnakeCase:
				key = strcase.ToSnake(field.Name)
			case KeyCasingPascalCase:
				key = strcase.ToCamel(field.Name)
			default:
				key = strcase.ToLowerCamel(field.Name)
			}
		}
		var deprecated = false
		annotations := strings.Split(field.Tag.Get("arri"), ",")
		for i := 0; i < len(annotations); i++ {
			annotation := annotations[i]
			switch annotation {
			case "deprecated":
				deprecated = true
			}
		}
		fieldType := field.Type
		description := field.Tag.Get("description")
		enumValues := None[Option[[]string]]()
		enumName := None[Option[string]]()
		if len(field.Tag.Get("enum")) > 0 {
			valueList := []string{}
			values := strings.Split(field.Tag.Get("enum"), ",")
			for i := 0; i < len(values); i++ {
				value := values[i]
				valueList = append(valueList, strings.TrimSpace(value))
			}
			enumValues = Some(Some(valueList))
		}
		if len(field.Tag.Get("enumName")) > 0 {
			s := strings.TrimSpace(field.Tag.Get("enumName"))
			enumName = Some(Some(s))
		}
		isOptional := isOptionalType(fieldType)
		if isOptional {
			fieldType = extractOptionalType(fieldType)
		}
		isNullable := None[Option[bool]]()
		if isNullableType(fieldType) {
			isNullable = Some(Some(true))
			fieldType = extractNullableType(fieldType)
		}
		isOptional2 := isOptionalType(fieldType)
		if isOptional2 {
			fieldType = extractOptionalType(fieldType)
		}

		instancePath := "/" + structName + "/" + key
		schemaPath := context.SchemaPath + "/properties/" + key
		newDepth := context.CurrentDepth + 1
		fieldResult, fieldError := typeToTypeDef(
			fieldType,
			context.copyWith(
				Some(newDepth),
				None[[]string](),
				Some(instancePath),
				Some(schemaPath),
				isNullable,
				enumValues,
				enumName,
			),
		)
		if fieldError != nil {
			return nil, fieldError
		}
		if len(description) > 0 || deprecated {
			if fieldResult.Metadata.IsNone() {
				fieldResult.Metadata = Some(ATypeMetadata{})
			}
			if len(description) > 0 {
				fieldResult.Metadata.value.Description = Some(description)
			}
			if deprecated {
				fieldResult.Metadata.value.IsDeprecated = Some(deprecated)
			}
		}
		if isOptional {
			optionalFields = __updateAOrderedMap__(optionalFields, __aOrderedMapEntry__[ATypeDef]{Key: key, Value: *fieldResult})
		} else {
			requiredFields = __updateAOrderedMap__(requiredFields, __aOrderedMapEntry__[ATypeDef]{Key: key, Value: *fieldResult})

		}
	}
	if len(optionalFields) > 0 {
		return &ATypeDef{
			Properties:         Some(requiredFields),
			OptionalProperties: Some(optionalFields),
			Nullable:           context.IsNullable,
			Metadata:           Some(ATypeMetadata{Id: structName})}, nil
	}
	return &ATypeDef{
		Properties: Some(requiredFields),
		Nullable:   context.IsNullable,
		Metadata:   Some(ATypeMetadata{Id: structName}),
	}, nil
}

func extractOptionalType(input reflect.Type) reflect.Type {
	kind := input.Kind()
	if kind == reflect.Ptr {
		return input.Elem()
	}
	field, _ := input.FieldByName("value")
	return field.Type
}

func extractNullableType(input reflect.Type) reflect.Type {
	field, _ := input.FieldByName("value")
	return field.Type
}

func taggedUnionToTypeDef(name string, input reflect.Type, context _TypeDefContext) (*ATypeDef, error) {
	kind := input.Kind()
	if kind != reflect.Struct {
		return nil, errors.ErrUnsupported
	}
	if input.NumField() == 0 {
		return nil, errors.New("cannot create schema for an empty struct")
	}
	discriminatorKey := "type"
	mapping := make(map[string]ATypeDef)
	for i := 0; i < input.NumField(); i++ {
		field := input.Field(i)
		// we only accept "DiscriminatorKey" if it's the first key in the struct
		if i == 0 && field.Type.Name() == "DiscriminatorKey" {
			discriminatorKeyTag := field.Tag.Get("discriminatorKey")
			if len(discriminatorKeyTag) > 0 {
				discriminatorKey = strings.TrimSpace(discriminatorKeyTag)
			}
			continue
		}
		discriminatorValue := field.Tag.Get("discriminator")
		if len(discriminatorValue) == 0 {
			return nil, errors.New("all discriminator subtypes must have the \"discriminator\" tag")
		}
		if field.Type.Kind() != reflect.Ptr {
			return nil, errors.New("all fields in discriminators structs must be a pointer to a struct")
		}
		if IsDiscriminatorStruct(field.Type.Elem()) {
			return nil, errors.New("the direct child of a discriminator struct cannot be another discriminator struct")
		}
		schemaPath := context.SchemaPath + "/mapping/" + discriminatorValue
		fieldResult, fieldError := structToTypeDef(
			field.Type.Elem(),
			context.copyWith(
				None[uint32](),
				None[[]string](),
				None[string](),
				Some(schemaPath),
				None[Option[bool]](),
				None[Option[[]string]](),
				None[Option[string]](),
			),
		)
		if fieldError != nil {
			return nil, fieldError
		}
		mapping[discriminatorValue] = *fieldResult
	}
	return &ATypeDef{Discriminator: Some(discriminatorKey), Mapping: Some(mapping), Metadata: Some(ATypeMetadata{Id: name})}, nil
}

func arrayToTypeDef(input reflect.Type, context _TypeDefContext) (*ATypeDef, error) {
	kind := input.Kind()
	if kind != reflect.Array && kind != reflect.Slice {
		return nil, fmt.Errorf("error at %s. expected kind 'reflect.Array' or 'reflect.Slice'. got '%s'", context.InstancePath, kind)
	}
	subType := input.Elem()
	instancePath := context.InstancePath + "/[element]"
	schemaPath := context.SchemaPath + "/elements"
	nullable := false
	subTypeResult, err := typeToTypeDef(
		subType,
		context.copyWith(
			None[uint32](),
			None[[]string](),
			Some(instancePath),
			Some(schemaPath),
			Some(Some(nullable)),
			None[Option[[]string]](),
			None[Option[string]](),
		),
	)
	if err != nil {
		return nil, err
	}
	return &ATypeDef{Elements: subTypeResult}, nil
}

func mapToTypeDef(input reflect.Type, context _TypeDefContext) (*ATypeDef, error) {
	kind := input.Kind()
	if kind != reflect.Map {
		return nil, fmt.Errorf("error at %s. expected kind 'reflect.Map'. got '%s'", context.InstancePath, kind)
	}
	subType := input.Elem()
	keyType := input.Key()
	if keyType.Kind() != reflect.String {
		return nil, fmt.Errorf("error at %s. arri only supports string keys", context.InstancePath)
	}
	instancePath := context.InstancePath + "/[key]"
	schemaPath := context.SchemaPath + "/values"
	nullable := subType.Kind() == reflect.Ptr
	depth := context.CurrentDepth + 1
	subTypeResult, err := typeToTypeDef(
		subType, context.copyWith(
			Some(depth),
			None[[]string](),
			Some(instancePath),
			Some(schemaPath),
			Some(Some(nullable)),
			None[Option[[]string]](),
			None[Option[string]](),
		),
	)
	if err != nil {
		return nil, err
	}
	return &ATypeDef{Values: subTypeResult}, nil
}

const (
	Active   = "ACTIVE"
	Inactive = "INACTIVE"
)

type ArriModel interface {
	ToJson(KeyCasing KeyCasing) ([]byte, error)
}

type MessageStatus = string

type Message struct {
	Id        string
	Status    string `enum:"ACTIVE,INACTIVE" enumName:"Status"`
	CreatedAt time.Time
	UpdatedAt time.Time
	Text      string
	Other     interface{}
}

func (m *Message) ToJson(casing KeyCasing) ([]byte, error) {
	return ToJson(m, casing)
}

type Shape struct {
	DiscriminatorKey `discriminatorKey:"typeName"`
	*Rectangle       `discriminator:"RECTANGLE"`
	*Circle          `discriminator:"CIRCLE"`
	*Child           `discriminator:"CHILD"`
	*Children        `discriminator:"CHILDREN"`
}

type DiscriminatorKey struct{}

type Rectangle struct {
	Width  float64
	Height float64
}

type Circle struct {
	Radius float64
}

type Child struct {
	Child Nullable[Shape]
}

type Children struct {
	Children Nullable[[]Shape]
}
