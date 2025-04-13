package arri

import (
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/iancoleman/strcase"
	"github.com/modiimedia/arri/languages/go/go-server/utils"
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
	Metadata           Option[TypeDefMetadata]     `key:"metadata" `
	IsNullable         Option[bool]                `key:"isNullable"`
	Type               Option[Type]                `key:"type"`
	Enum               Option[[]string]            `key:"enum"`
	Elements           Option[*TypeDef]            `key:"elements"`
	Properties         Option[OrderedMap[TypeDef]] `key:"properties"`
	OptionalProperties Option[OrderedMap[TypeDef]] `key:"optionalProperties"`
	IsStrict           Option[bool]                `key:"isStrict"`
	Values             Option[*TypeDef]            `key:"values"`
	Discriminator      Option[string]              `key:"discriminator"`
	Mapping            Option[OrderedMap[TypeDef]] `key:"mapping"`
	Ref                Option[string]              `key:"ref"`
}

const (
	KeyCasingPascalCase = "PASCAL_CASE"
	KeyCasingCamelCase  = "CAMEL_CASE"
	KeyCasingSnakeCase  = "SNAKE_CASE"
)

type KeyCasing = string

type TypeDefContext struct {
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

func newTypeDefContext(options EncodingOptions) TypeDefContext {
	casing := options.KeyCasing
	maxDepth := options.MaxDepth
	switch options.KeyCasing {
	case KeyCasingCamelCase, KeyCasingSnakeCase, KeyCasingPascalCase:
		casing = options.KeyCasing
	case "":
		casing = KeyCasingCamelCase
	}
	if maxDepth == 0 {
		maxDepth = 1000
	}
	return TypeDefContext{
		KeyCasing:    casing,
		MaxDepth:     maxDepth,
		InstancePath: "",
		IsNullable:   None[bool](),
		EnumName:     None[string](),
		EnumValues:   None[[]string](),
	}
}

func (context TypeDefContext) copyWith(
	CurrentDepth Option[uint32],
	ParentStructs Option[[]string],
	InstancePath Option[string],
	SchemaPath Option[string],
	IsNullable Option[Option[bool]],
	EnumValues Option[Option[[]string]],
	EnumName Option[Option[string]],
) TypeDefContext {
	return TypeDefContext{
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

func ToTypeDef(input interface{}, options EncodingOptions) (*TypeDef, error) {
	context := newTypeDefContext(options)
	return typeToTypeDef(reflect.TypeOf(input), context)
}

func TypeToTypeDef(input reflect.Type, options EncodingOptions) (*TypeDef, error) {
	context := newTypeDefContext(options)
	return typeToTypeDef(input, context)
}

func typeToTypeDef(input reflect.Type, context TypeDefContext) (*TypeDef, error) {
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
		newContext := context
		newContext.IsNullable = Some(true)
		return typeToTypeDef(input.Elem(), newContext)
	case reflect.Map:
		return mapToTypeDef(input, context)
	case
		reflect.Array,
		reflect.Slice:
		return arrayToTypeDef(input, context)
	case reflect.Struct:
		if input.Implements(reflect.TypeFor[ArriModel]()) {
			return reflect.New(input).Interface().(ArriModel).TypeDef(context)
		}
		if utils.IsNullableTypeOrPointer(input) {
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
			return &TypeDef{Type: Some(t), IsNullable: context.IsNullable}, nil
		}
		return structToTypeDef(input, context)
	case reflect.Interface:
		return &TypeDef{IsNullable: context.IsNullable}, nil
	default:
		return nil, fmt.Errorf("error at %s. %s is not a supported type", context.InstancePath, input.Kind())
	}
}

func primitiveTypeToTypeDef(value reflect.Type, context TypeDefContext) (*TypeDef, error) {
	kind := value.Kind()
	switch kind {
	case reflect.Bool:
		t := Boolean
		return &TypeDef{Type: Some(t), IsNullable: context.IsNullable}, nil
	case reflect.Int:
		t := Int64
		return &TypeDef{Type: Some(t), IsNullable: context.IsNullable}, nil
	case reflect.Int8:
		t := Int8
		return &TypeDef{Type: Some(t), IsNullable: context.IsNullable}, nil
	case reflect.Int16:
		t := Int16
		return &TypeDef{Type: Some(t), IsNullable: context.IsNullable}, nil
	case reflect.Int32:
		t := Int32
		return &TypeDef{Type: Some(t), IsNullable: context.IsNullable}, nil
	case reflect.Int64:
		t := Int64
		return &TypeDef{Type: Some(t), IsNullable: context.IsNullable}, nil
	case reflect.Uint:
		t := Uint64
		return &TypeDef{Type: Some(t), IsNullable: context.IsNullable}, nil
	case reflect.Uint8:
		t := Uint8
		return &TypeDef{Type: Some(t), IsNullable: context.IsNullable}, nil
	case reflect.Uint16:
		t := Uint16
		return &TypeDef{Type: Some(t), IsNullable: context.IsNullable}, nil
	case reflect.Uint32:
		t := Uint32
		return &TypeDef{Type: Some(t), IsNullable: context.IsNullable}, nil
	case reflect.Uint64:
		t := Uint64
		return &TypeDef{Type: Some(t), IsNullable: context.IsNullable}, nil
	case reflect.Float32:
		t := Float32
		return &TypeDef{Type: Some(t), IsNullable: context.IsNullable}, nil
	case reflect.Float64:
		t := Float64
		return &TypeDef{Type: Some(t), IsNullable: context.IsNullable}, nil
	case reflect.String:
		if context.EnumValues.IsSome() {
			metadata := None[TypeDefMetadata]()
			if context.EnumName.IsSome() {
				metadata = Some(TypeDefMetadata{Id: Some(context.EnumName.Unwrap())})
			}
			return &TypeDef{
				Enum:       context.EnumValues,
				IsNullable: context.IsNullable,
				Metadata:   metadata,
			}, nil
		}
		t := String
		return &TypeDef{Type: Some(t), IsNullable: context.IsNullable}, nil
	default:
		return nil, fmt.Errorf("error at %s. '%s' is not a supported primitive type", context.InstancePath, kind)
	}
}

func IsDiscriminatorStruct(input reflect.Type) bool {
	if input.Kind() != reflect.Struct {
		return false
	}
	numFields := input.NumField()
	if numFields == 0 {
		return false
	}
	for i := 0; i < numFields; i++ {
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

func structToTypeDef(input reflect.Type, context TypeDefContext) (*TypeDef, error) {
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
				return &TypeDef{Ref: typeId, IsNullable: context.IsNullable}, nil
			}
		}
		context.ParentStructs = append(context.ParentStructs, typeId.Unwrap())

	}
	kind := input.Kind()
	if kind != reflect.Struct {
		return nil, errors.ErrUnsupported
	}
	// if input.NumField() == 0 && input.Name() != "DiscriminatorKey" {
	// 	return nil, errors.New("cannot create schema for an empty struct")
	// }
	requiredFields := OrderedMap[TypeDef]{}
	optionalFields := OrderedMap[TypeDef]{}
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
		isOptional := utils.IsOptionalType(fieldType)
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
				Some(None[bool]()),
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
			optionalFields.Set(key, *fieldResult)
		} else {
			requiredFields.Set(key, *fieldResult)
		}
	}
	if optionalFields.Len() > 0 {
		return &TypeDef{
			Properties:         Some(requiredFields),
			OptionalProperties: Some(optionalFields),
			IsNullable:         context.IsNullable,
			Metadata:           Some(TypeDefMetadata{Id: typeId})}, nil
	}
	return &TypeDef{
		Properties: Some(requiredFields),
		IsNullable: context.IsNullable,
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

func taggedUnionToTypeDef(name Option[string], input reflect.Type, context TypeDefContext) (*TypeDef, error) {
	kind := input.Kind()
	if kind != reflect.Struct {
		return nil, errors.ErrUnsupported
	}
	if input.NumField() == 0 {
		return nil, errors.New("cannot create discriminator schema for an empty struct")
	}
	discriminatorKey := "type"
	mapping := OrderedMap[TypeDef]{}
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
		description := None[string]()
		descriptionTag := field.Tag.Get("description")
		if len(descriptionTag) > 0 {
			description = Some(descriptionTag)
		}
		schemaPath := context.SchemaPath + "/mapping/" + discriminatorValue
		fieldResult, fieldError := structToTypeDef(
			field.Type.Elem(),
			context.copyWith(
				None[uint32](),
				None[[]string](),
				None[string](),
				Some(schemaPath),
				Some(None[bool]()),
				None[Option[[]string]](),
				None[Option[string]](),
			),
		)
		if fieldError != nil {
			return nil, fieldError
		}
		if description.IsSome() {
			meta := fieldResult.Metadata
			if meta.IsNone() {
				meta = Some(TypeDefMetadata{Description: description})
			} else {
				meta.Value.Description = description
			}
			fieldResult.Metadata = meta
		}
		mapping.Set(discriminatorValue, *fieldResult)
	}
	return &TypeDef{
		Discriminator: Some(discriminatorKey),
		Mapping:       Some(mapping),
		IsNullable:    context.IsNullable,
		Metadata:      Some(TypeDefMetadata{Id: name}),
	}, nil
}

func arrayToTypeDef(input reflect.Type, context TypeDefContext) (*TypeDef, error) {
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
	return &TypeDef{Elements: r, IsNullable: context.IsNullable}, nil
}

func mapToTypeDef(input reflect.Type, context TypeDefContext) (*TypeDef, error) {
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
	return &TypeDef{Values: r, IsNullable: context.IsNullable}, nil
}
