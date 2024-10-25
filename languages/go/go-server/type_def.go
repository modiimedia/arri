package arri

import (
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/iancoleman/strcase"
)

const (
	String    = "string"
	Boolean   = "boolean"
	Timestamp = "timestamp"
	Float32   = "float32"
	Float64   = "float64"
	Int8      = "int8"
	Int16     = "int16"
	Int32     = "int32"
	Int64     = "int64"
	Uint8     = "uint8"
	Uint16    = "uint16"
	Uint32    = "uint32"
	Uint64    = "uint64"
)

type Type = string

type TypeDefMetadata struct {
	Id           Option[string] `key:"id"`
	Description  Option[string] `key:"description"`
	IsDeprecated Option[bool]   `key:"isDeprecated"`
}

type TypeDef struct {
	Metadata           Option[TypeDefMetadata]            `key:"metadata" `
	Nullable           Option[bool]                       `key:"nullable"`
	Type               Option[Type]                       `key:"type"`
	Enum               Option[[]string]                   `key:"enum"`
	Elements           Option[*TypeDef]                   `key:"elements"`
	Properties         Option[[]OrderedMapEntry[TypeDef]] `key:"properties"`
	OptionalProperties Option[[]OrderedMapEntry[TypeDef]] `key:"optionalProperties"`
	Strict             Option[bool]                       `key:"strict"`
	Values             Option[*TypeDef]                   `key:"values"`
	Discriminator      Option[string]                     `key:"discriminator"`
	Mapping            Option[map[string]TypeDef]         `key:"mapping"`
	Ref                Option[string]                     `key:"ref"`
}

type OrderedMapEntry[T interface{}] struct {
	Key   string
	Value T
}

func __updateAOrderedMap__[T interface{}](state []OrderedMapEntry[T], newValue OrderedMapEntry[T]) []OrderedMapEntry[T] {
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

type typeDefContext struct {
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

func _NewTypeDefContext(keyCasing KeyCasing) typeDefContext {
	casing := KeyCasingCamelCase
	switch keyCasing {
	case KeyCasingCamelCase, KeyCasingSnakeCase, KeyCasingPascalCase:
		casing = keyCasing
	case "":
		casing = keyCasing
	}
	return typeDefContext{
		KeyCasing:    casing,
		MaxDepth:     1000,
		InstancePath: "",
		IsNullable:   None[bool](),
		EnumName:     None[string](),
		EnumValues:   None[[]string](),
	}

}

func (context typeDefContext) copyWith(
	CurrentDepth Option[uint32],
	ParentStructs Option[[]string],
	InstancePath Option[string],
	SchemaPath Option[string],
	IsNullable Option[Option[bool]],
	EnumValues Option[Option[[]string]],
	EnumName Option[Option[string]],
) typeDefContext {
	return typeDefContext{
		KeyCasing:     context.KeyCasing,
		MaxDepth:      context.MaxDepth,
		CurrentDepth:  CurrentDepth.UnwrapOr(context.CurrentDepth),
		ParentStructs: ParentStructs.UnwrapOr(context.ParentStructs),
		InstancePath:  InstancePath.UnwrapOr(context.InstancePath),
		SchemaPath:    SchemaPath.UnwrapOr(context.SchemaPath),
		IsNullable:    IsNullable.UnwrapOr(context.IsNullable),
		EnumValues:    EnumValues.UnwrapOr(context.EnumValues),
		EnumName:      EnumName.UnwrapOr(context.EnumName),
	}
}

func ToTypeDef(input interface{}, keyCasing KeyCasing) (*TypeDef, error) {
	context := _NewTypeDefContext(keyCasing)
	return typeToTypeDef(reflect.TypeOf(input), context)
}

func typeToTypeDef(input reflect.Type, context typeDefContext) (*TypeDef, error) {
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
		reflect.Uint8,
		reflect.Uint16,
		reflect.Uint32,
		reflect.Uint64:
		return primitiveTypeToTypeDef(input, context)
	case reflect.Ptr:
		return typeToTypeDef(input.Elem(), context)
	case reflect.Map:
		return mapToTypeDef(input, context)
	case
		reflect.Array,
		reflect.Slice:
		return arrayToTypeDef(input, context)
	case reflect.Struct:
		if isNullableType(input) {
			subType := extractNullableType(input)
			return typeToTypeDef(
				subType,
				context.copyWith(None[uint32](),
					None[[]string](),
					None[string](),
					None[string](),
					Some(Some(true)),
					None[Option[[]string]](),
					None[Option[string]](),
				),
			)
		}
		if input.Name() == "Time" {
			t := Timestamp
			return &TypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
		}
		return structToTypeDef(input, context)
	case reflect.Interface:
		return &TypeDef{Nullable: context.IsNullable}, nil
	default:
		return nil, fmt.Errorf("error at %s. %s is not a supported type", context.InstancePath, input.Kind())
	}
}

func primitiveTypeToTypeDef(value reflect.Type, context typeDefContext) (*TypeDef, error) {
	kind := value.Kind()
	switch kind {
	case reflect.Bool:
		t := Boolean
		return &TypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Int:
		t := Int64
		return &TypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Int8:
		t := Int8
		return &TypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Int16:
		t := Int16
		return &TypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Int32:
		t := Int32
		return &TypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Int64:
		t := Int64
		return &TypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Uint:
		t := Uint64
		return &TypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Uint8:
		t := Uint8
		return &TypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Uint16:
		t := Uint16
		return &TypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Uint32:
		t := Uint32
		return &TypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Uint64:
		t := Uint64
		return &TypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Float32:
		t := Float32
		return &TypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.Float64:
		t := Float64
		return &TypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
	case reflect.String:
		if context.EnumValues.IsSome() {
			metadata := None[TypeDefMetadata]()
			if context.EnumName.IsSome() {
				metadata = Some(TypeDefMetadata{Id: Some(context.EnumName.Unwrap())})
			}
			return &TypeDef{
				Enum:     context.EnumValues,
				Nullable: context.IsNullable,
				Metadata: metadata,
			}, nil
		}
		t := String
		return &TypeDef{Type: Some(t), Nullable: context.IsNullable}, nil
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

func nameFromInstancePath(instancePath string) string {
	parts := strings.Split(instancePath, "/")
	return strcase.ToCamel(strings.Join(parts, "_"))
}

func structToTypeDef(input reflect.Type, context typeDefContext) (*TypeDef, error) {
	structName := input.Name()
	typeId := Some(structName)
	isAnonymous := len(input.PkgPath()) == 0 || strings.ContainsAny(structName, " []")
	if isAnonymous {
		typeId = None[string]()
	}
	// if len(context.ParentStructs) == 0 && isAnonymous {
	// 	return nil, fmt.Errorf("root level type definitions cannot be anonymous structs")
	// }
	if typeId.IsSome() {
		for i := 0; i < len(context.ParentStructs); i++ {
			name := context.ParentStructs[i]
			if name == typeId.Unwrap() {
				return &TypeDef{Ref: typeId}, nil
			}
		}
		context.ParentStructs = append(context.ParentStructs, typeId.Unwrap())

	}
	kind := input.Kind()
	if kind != reflect.Struct {
		return nil, errors.ErrUnsupported
	}
	if input.NumField() == 0 && input.Name() != "DiscriminatorKey" {
		return nil, errors.New("cannot create schema for an empty struct")
	}
	requiredFields := []OrderedMapEntry[TypeDef]{}
	optionalFields := []OrderedMapEntry[TypeDef]{}
	for i := 0; i < input.NumField(); i++ {
		field := input.Field(i)
		isDiscriminator := len(field.Tag.Get("discriminator")) > 0 || field.Type.Name() == "DiscriminatorKey"
		if isDiscriminator {
			return taggedUnionToTypeDef(typeId, input, context)
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
		var instancePath string
		if isAnonymous {
			instancePath = context.InstancePath + "/" + key
		} else {
			instancePath = "/" + typeId.Unwrap() + "/" + key
		}
		schemaPath := context.SchemaPath + "/properties/" + key
		newDepth := context.CurrentDepth + 1
		fieldResult, fieldError := typeToTypeDef(
			fieldType,
			context.copyWith(
				Some(newDepth),
				None[[]string](),
				Some(instancePath),
				Some(schemaPath),
				None[Option[bool]](),
				enumValues,
				enumName,
			),
		)
		if fieldError != nil {
			return nil, fieldError
		}
		if len(description) > 0 || deprecated {
			if fieldResult.Metadata.IsNone() {
				fieldResult.Metadata = Some(TypeDefMetadata{})
			}
			desc := None[string]()
			isDeprecated := None[bool]()
			if len(description) > 0 {
				desc.Set(description)
			}
			if deprecated {
				isDeprecated.Set(deprecated)
			}
			if desc.IsSome() || isDeprecated.IsSome() {
				fieldResult.Metadata.Set(TypeDefMetadata{
					Id:           fieldResult.Metadata.Unwrap().Id,
					Description:  desc,
					IsDeprecated: isDeprecated,
				})
			}
		}
		if isOptional {
			optionalFields = __updateAOrderedMap__(optionalFields, OrderedMapEntry[TypeDef]{Key: key, Value: *fieldResult})
		} else {
			requiredFields = __updateAOrderedMap__(requiredFields, OrderedMapEntry[TypeDef]{Key: key, Value: *fieldResult})

		}
	}
	if len(optionalFields) > 0 {
		return &TypeDef{
			Properties:         Some(requiredFields),
			OptionalProperties: Some(optionalFields),
			Nullable:           context.IsNullable,
			Metadata:           Some(TypeDefMetadata{Id: typeId})}, nil
	}
	return &TypeDef{
		Properties: Some(requiredFields),
		Nullable:   context.IsNullable,
		Metadata:   Some(TypeDefMetadata{Id: typeId}),
	}, nil
}

func extractOptionalType(input reflect.Type) reflect.Type {
	kind := input.Kind()
	if kind == reflect.Ptr {
		return input.Elem()
	}
	field, _ := input.FieldByName("Value")
	return field.Type
}

func extractNullableType(input reflect.Type) reflect.Type {
	field, _ := input.FieldByName("Value")
	return field.Type
}

func taggedUnionToTypeDef(name Option[string], input reflect.Type, context typeDefContext) (*TypeDef, error) {
	kind := input.Kind()
	if kind != reflect.Struct {
		return nil, errors.ErrUnsupported
	}
	if input.NumField() == 0 {
		return nil, errors.New("cannot create schema for an empty struct")
	}
	discriminatorKey := "type"
	mapping := make(map[string]TypeDef)
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
	return &TypeDef{Discriminator: Some(discriminatorKey), Mapping: Some(mapping), Metadata: Some(TypeDefMetadata{Id: name})}, nil
}

func arrayToTypeDef(input reflect.Type, context typeDefContext) (*TypeDef, error) {
	kind := input.Kind()
	if kind != reflect.Array && kind != reflect.Slice {
		return nil, fmt.Errorf("error at %s. expected kind 'reflect.Array' or 'reflect.Slice'. got '%s'", context.InstancePath, kind)
	}
	subType := input.Elem()
	instancePath := context.InstancePath + "/[element]"
	schemaPath := context.SchemaPath + "/elements"
	subTypeResult, err := typeToTypeDef(
		subType,
		context.copyWith(
			None[uint32](),
			None[[]string](),
			Some(instancePath),
			Some(schemaPath),
			Some(None[bool]()),
			None[Option[[]string]](),
			None[Option[string]](),
		),
	)
	if err != nil {
		return nil, err
	}
	r := Some(subTypeResult)
	return &TypeDef{Elements: r, Nullable: context.IsNullable}, nil
}

func mapToTypeDef(input reflect.Type, context typeDefContext) (*TypeDef, error) {
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
	nullable := None[bool]()
	if subType.Kind() == reflect.Ptr {
		nullable = Some(true)
	}
	depth := context.CurrentDepth + 1
	subTypeResult, err := typeToTypeDef(
		subType, context.copyWith(
			Some(depth),
			None[[]string](),
			Some(instancePath),
			Some(schemaPath),
			Some(nullable),
			None[Option[[]string]](),
			None[Option[string]](),
		),
	)
	if err != nil {
		return nil, err
	}
	r := Some(subTypeResult)
	return &TypeDef{Values: r, Nullable: context.IsNullable}, nil
}
