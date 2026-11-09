package arri

import (
	"errors"
	"fmt"
	"reflect"
	"strings"
	"sync"

	"github.com/iancoleman/strcase"
	"github.com/tidwall/gjson"
)

// Embed this in a struct to turn it into a tagged union.
// Every other field is a variant and must be a pointer. The non-nil field is the active variant.
//
// The JSON layout is configured with tags on the embedded field:
//   - no tags: externally tagged `{"rectangle":{"width":10}}`
//   - `tagKey:"shape"`: internally tagged `{"shape":"rectangle","width":10}`
//   - `tagKey:"kind" valueKey:"data"`: adjacently tagged `{"kind":"rectangle","data":{"width":10}}`
//
// Variant names default to the field name with the key casing applied. Use the `tag` tag to override it.
//
//	type Shape struct {
//		arri.Union `tagKey:"shape"`
//		Rectangle  *Rectangle
//		Circle     *Circle `tag:"CIRCLE"`
//	}
type Union struct{}

type unionVariant struct {
	FieldIndex int
	FieldName  string
	// the explicitly specified tag. when empty the tag is derived from the field name
	Tag string
}

type unionInfo struct {
	TagKey   string
	ValueKey string
	Variants []unionVariant
	// index of the variant to encode when no variant is set. -1 if every variant is recursive
	FallbackIndex int
}

func (u *unionInfo) isInternallyTagged() bool {
	return len(u.TagKey) > 0 && len(u.ValueKey) == 0
}

func (v unionVariant) tagName(keyCasing KeyCasing) string {
	if len(v.Tag) > 0 {
		return v.Tag
	}
	switch keyCasing {
	case KeyCasingPascalCase:
		return v.FieldName
	case KeyCasingSnakeCase:
		return strcase.ToSnake(v.FieldName)
	default:
		return strcase.ToLowerCamel(v.FieldName)
	}
}

type unionCacheEntry struct {
	info *unionInfo
	err  error
}

var unionCache sync.Map

// Returns nil when t isn't a union struct.
// Structs using the deprecated `discriminator` tags are treated as internally tagged unions.
func getUnionInfo(t reflect.Type) (*unionInfo, error) {
	if t.Kind() != reflect.Struct {
		return nil, nil
	}
	if cached, ok := unionCache.Load(t); ok {
		entry := cached.(unionCacheEntry)
		return entry.info, entry.err
	}
	info, err := parseUnionStruct(t)
	if info != nil && err == nil {
		info.FallbackIndex = -1
		for i, variant := range info.Variants {
			if !isRecursiveType(t.Field(variant.FieldIndex).Type.Elem(), []reflect.Type{t}) {
				info.FallbackIndex = i
				break
			}
		}
	}
	unionCache.Store(t, unionCacheEntry{info: info, err: err})
	return info, err
}

var unionType = reflect.TypeFor[Union]()
var discriminatorKeyType = reflect.TypeFor[DiscriminatorKey]()

func parseUnionStruct(t reflect.Type) (*unionInfo, error) {
	isUnion := false
	isLegacy := false
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		if field.Type == unionType {
			isUnion = true
		}
		if field.Type == discriminatorKeyType || len(field.Tag.Get("discriminator")) > 0 {
			isLegacy = true
		}
	}
	if isUnion && isLegacy {
		return nil, fmt.Errorf("%s cannot use arri.Union alongside the deprecated \"discriminator\" tags", t.String())
	}
	if isLegacy {
		return parseLegacyDiscriminatorStruct(t)
	}
	if !isUnion {
		return nil, nil
	}
	info := &unionInfo{}
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		if field.Type == unionType {
			info.TagKey = strings.TrimSpace(field.Tag.Get("tagKey"))
			info.ValueKey = strings.TrimSpace(field.Tag.Get("valueKey"))
			continue
		}
		if !field.IsExported() {
			continue
		}
		if field.Type.Kind() != reflect.Ptr {
			return nil, fmt.Errorf("union variant %s.%s must be a pointer", t.String(), field.Name)
		}
		info.Variants = append(info.Variants, unionVariant{
			FieldIndex: i,
			FieldName:  field.Name,
			Tag:        strings.TrimSpace(field.Tag.Get("tag")),
		})
	}
	if len(info.ValueKey) > 0 && len(info.TagKey) == 0 {
		return nil, fmt.Errorf("%s has a \"valueKey\" without a \"tagKey\". \"valueKey\" can only be used alongside \"tagKey\"", t.String())
	}
	if len(info.Variants) == 0 {
		return nil, fmt.Errorf("%s must have at least one variant", t.String())
	}
	return info, nil
}

func parseLegacyDiscriminatorStruct(t reflect.Type) (*unionInfo, error) {
	info := &unionInfo{TagKey: "type"}
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		if field.Type == discriminatorKeyType {
			discriminatorKey := strings.TrimSpace(field.Tag.Get("discriminatorKey"))
			if len(discriminatorKey) > 0 {
				info.TagKey = discriminatorKey
			}
			continue
		}
		discriminatorValue := field.Tag.Get("discriminator")
		if len(discriminatorValue) == 0 {
			return nil, fmt.Errorf("%s.%s is missing the \"discriminator\" tag. all discriminator subtypes must have the \"discriminator\" tag", t.String(), field.Name)
		}
		if field.Type.Kind() != reflect.Ptr || field.Type.Elem().Kind() != reflect.Struct {
			return nil, fmt.Errorf("%s.%s must be a pointer to a struct. all fields in discriminator structs must be a pointer to a struct", t.String(), field.Name)
		}
		info.Variants = append(info.Variants, unionVariant{
			FieldIndex: i,
			FieldName:  field.Name,
			Tag:        discriminatorValue,
		})
	}
	if len(info.Variants) == 0 {
		return nil, errors.New("cannot create discriminator schema for an empty struct")
	}
	return info, nil
}

// A type is recursive when its zero value can't be encoded without looping back to itself.
// Pointers, slices, maps, and nullable / optional values encode as null or empty so they never recurse.
func isRecursiveType(t reflect.Type, visited []reflect.Type) bool {
	if t.Kind() != reflect.Struct || t.Name() == "Time" || isNullableOrOptionalStruct(t) {
		return false
	}
	for _, v := range visited {
		if v == t {
			return true
		}
	}
	visited = append(visited, t)
	union, err := parseUnionStruct(t)
	if err != nil {
		return false
	}
	if union != nil {
		for _, variant := range union.Variants {
			if !isRecursiveType(t.Field(variant.FieldIndex).Type.Elem(), visited) {
				return false
			}
		}
		return true
	}
	for i := 0; i < t.NumField(); i++ {
		if isRecursiveType(t.Field(i).Type, visited) {
			return true
		}
	}
	return false
}

func isNullableOrOptionalStruct(t reflect.Type) bool {
	return strings.HasPrefix(t.Name(), "Nullable[") || strings.HasPrefix(t.Name(), "Option[")
}

//// Type Definitions ////

func unionToTypeDef(typeId Option[string], input reflect.Type, info *unionInfo, context TypeDefContext) (*TypeDef, error) {
	variants := OrderedMap[TypeDef]{}
	for _, variant := range info.Variants {
		field := input.Field(variant.FieldIndex)
		tag := variant.tagName(context.KeyCasing)
		if variants.Get(tag) != nil {
			return nil, fmt.Errorf("error at %s. %s has more than one variant with the tag \"%s\"", context.InstancePath, input.String(), tag)
		}
		var instancePath string
		if typeId.IsNone() {
			instancePath = context.InstancePath + "/" + tag
		} else {
			instancePath = "/" + typeId.Unwrap() + "/" + tag
		}
		enumValues, enumName := enumOptionsFromField(&field)
		variantDef, err := typeToTypeDef(
			field.Type.Elem(),
			context.copyWith(
				Some(context.CurrentDepth+1),
				None[[]string](),
				Some(instancePath),
				Some(context.SchemaPath+"/union/"+tag),
				Some(None[bool]()),
				enumValues,
				enumName,
			),
		)
		if err != nil {
			return nil, err
		}
		if info.isInternallyTagged() {
			if variantDef.Properties.IsNone() {
				return nil, fmt.Errorf("error at %s. %s.%s must be a pointer to a struct. internally tagged union variants must be objects", instancePath, input.String(), field.Name)
			}
			if variantDef.IsNullable.UnwrapOr(false) {
				return nil, fmt.Errorf("error at %s. %s.%s cannot be nullable. internally tagged union variants cannot be nullable", instancePath, input.String(), field.Name)
			}
			if variantDef.Properties.Value.Get(info.TagKey) != nil ||
				(variantDef.OptionalProperties.IsSome() && variantDef.OptionalProperties.Value.Get(info.TagKey) != nil) {
				return nil, fmt.Errorf("error at %s. %s.%s has a property named \"%s\" which conflicts with the union's tagKey", instancePath, input.String(), field.Name, info.TagKey)
			}
		}
		applyFieldMetadata(&field, variantDef)
		variants.Set(tag, *variantDef)
	}
	result := &TypeDef{
		Union:      Some(variants),
		IsNullable: context.IsNullable,
		Metadata:   Some(TypeDefMetadata{Id: typeId}),
	}
	if len(info.TagKey) > 0 {
		result.TagKey = Some(info.TagKey)
	}
	if len(info.ValueKey) > 0 {
		result.ValueKey = Some(info.ValueKey)
	}
	return result, nil
}

//// Encoding ////

func encodeUnionToJSON(v reflect.Value, info *unionInfo, c *EncodingContext) error {
	t := v.Type()
	activeIndex := -1
	for i, variant := range info.Variants {
		if v.Field(variant.FieldIndex).IsNil() {
			continue
		}
		if activeIndex >= 0 {
			return fmt.Errorf(
				"error at %+v. %s has more than one variant set (%s and %s). only one union variant can be set at a time",
				c.InstancePath,
				t.String(),
				info.Variants[activeIndex].FieldName,
				variant.FieldName,
			)
		}
		activeIndex = i
	}
	var value reflect.Value
	if activeIndex >= 0 {
		value = v.Field(info.Variants[activeIndex].FieldIndex).Elem()
	} else {
		if info.FallbackIndex < 0 {
			return fmt.Errorf("error at %+v. no variant of %s is set and every variant is recursive so there is no fallback", c.InstancePath, t.String())
		}
		activeIndex = info.FallbackIndex
		value = reflect.Zero(t.Field(info.Variants[activeIndex].FieldIndex).Type.Elem())
	}
	variant := info.Variants[activeIndex]
	field := t.Field(variant.FieldIndex)
	tag := variant.tagName(c.KeyCasing)
	instancePath := c.InstancePath
	schemaPath := c.SchemaPath
	c.CurrentDepth++
	c.SchemaPath = schemaPath + "/union/" + tag
	if info.isInternallyTagged() {
		// encodeStructToJSON() writes the tag as the first key of the variant
		c.DiscriminatorKey = info.TagKey
		c.DiscriminatorValue = tag
		err := encodeValueToJSON(value, c)
		c.DiscriminatorKey = ""
		c.DiscriminatorValue = ""
		if err != nil {
			return err
		}
	} else {
		c.Buffer = append(c.Buffer, '{')
		if len(info.TagKey) > 0 {
			c.Buffer = append(c.Buffer, "\""+info.TagKey+"\":\""+tag+"\",\""+info.ValueKey+"\":"...)
			c.InstancePath = instancePath + "/" + info.ValueKey
		} else {
			c.Buffer = append(c.Buffer, "\""+tag+"\":"...)
			c.InstancePath = instancePath + "/" + tag
		}
		enumValues, _ := enumOptionsFromField(&field)
		if enumValues.IsSome() {
			c.EnumValues[c.InstancePath] = enumValues.Value.Value
		}
		err := encodeValueToJSON(value, c)
		if err != nil {
			return err
		}
		c.Buffer = append(c.Buffer, '}')
	}
	c.CurrentDepth--
	c.InstancePath = instancePath
	c.SchemaPath = schemaPath
	return nil
}

//// Decoding ////

func unionFromJSON(data *gjson.Result, target reflect.Value, info *unionInfo, dc *DecoderContext) bool {
	contextSnapshot := dc.clone()
	t := target.Type()
	var tag string
	var value gjson.Result
	if len(info.TagKey) > 0 {
		tagResult := data.Get(info.TagKey)
		if tagResult.Type != gjson.String {
			dc.Errors = append(dc.Errors, NewValidationError(
				"missing union tag \""+info.TagKey+"\"",
				dc.InstancePath+"/"+info.TagKey,
				dc.SchemaPath+"/tagKey",
			))
			return false
		}
		tag = tagResult.String()
		if info.isInternallyTagged() {
			value = *data
		} else {
			value = data.Get(info.ValueKey)
			if !value.Exists() {
				dc.Errors = append(dc.Errors, NewValidationError(
					"missing union value \""+info.ValueKey+"\"",
					dc.InstancePath+"/"+info.ValueKey,
					dc.SchemaPath+"/valueKey",
				))
				return false
			}
		}
	} else {
		numKeys := 0
		data.ForEach(func(key, val gjson.Result) bool {
			numKeys++
			tag = key.String()
			value = val
			return true
		})
		if numKeys != 1 {
			dc.Errors = append(dc.Errors, NewValidationError(
				"expected an object with exactly one key",
				dc.InstancePath,
				dc.SchemaPath,
			))
			return false
		}
	}
	for _, variant := range info.Variants {
		if variant.tagName(dc.KeyCasing) != tag {
			continue
		}
		field := target.Field(variant.FieldIndex)
		fieldMeta := t.Field(variant.FieldIndex)
		innerTarget := reflect.New(fieldMeta.Type.Elem())
		dc.CurrentDepth++
		dc.SchemaPath = contextSnapshot.SchemaPath + "/union/" + tag
		if info.isInternallyTagged() {
			dc.InstancePath = contextSnapshot.InstancePath
		} else if len(info.ValueKey) > 0 {
			dc.InstancePath = contextSnapshot.InstancePath + "/" + info.ValueKey
		} else {
			dc.InstancePath = contextSnapshot.InstancePath + "/" + tag
		}
		enumValues, _ := enumOptionsFromField(&fieldMeta)
		dc.EnumValues = enumValues.UnwrapOr(None[[]string]()).UnwrapOr([]string{})
		success := typeFromJSON(&value, innerTarget.Elem(), dc)
		dc.CurrentDepth = contextSnapshot.CurrentDepth
		dc.SchemaPath = contextSnapshot.SchemaPath
		dc.InstancePath = contextSnapshot.InstancePath
		dc.EnumValues = contextSnapshot.EnumValues
		if !success {
			return false
		}
		for _, other := range info.Variants {
			otherField := target.Field(other.FieldIndex)
			otherField.Set(reflect.Zero(otherField.Type()))
		}
		field.Set(innerTarget)
		return true
	}
	instancePath := dc.InstancePath
	if len(info.TagKey) > 0 {
		instancePath += "/" + info.TagKey
	}
	dc.Errors = append(dc.Errors, NewValidationError(
		"\""+tag+"\" is not a valid union variant",
		instancePath,
		dc.SchemaPath+"/union",
	))
	return false
}
