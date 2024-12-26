package arri

import (
	"fmt"
	"reflect"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/modiimedia/arri/languages/go/go-server/utils"
)

type EncodingContext struct {
	KeyCasing          string
	Buffer             []byte
	InstancePath       string
	SchemaPath         string
	CurrentDepth       uint32
	HasKeys            bool
	EnumValues         []string
	DiscriminatorKey   string
	DiscriminatorValue string
}

func NewEncodingContext(keyCasing string) *EncodingContext {
	return &EncodingContext{
		KeyCasing:    keyCasing,
		Buffer:       []byte{},
		InstancePath: "",
		SchemaPath:   "",
		HasKeys:      false,
		EnumValues:   []string{},
	}
}

func EncodeJSON(input any, options EncodingOptions) ([]byte, error) {
	ctx := NewEncodingContext(options.KeyCasing)
	value := reflect.ValueOf(input)
	err := encodeValueToJSON(value, ctx)
	if err != nil {
		return nil, err
	}
	return ctx.Buffer, nil
}

func encodeValueToJSON(v reflect.Value, c *EncodingContext) error {
	kind := v.Kind()
	switch kind {
	case reflect.String:
		if len(c.EnumValues) > 0 {
			return encodeEnumToJSON(v, c)
		}
		return encodeStringToJSON(v, c)
	case reflect.Bool:
		return encodeBoolToJSON(v, c)
	case reflect.Float32, reflect.Float64:
		return encodeFloatToJSON(v, c)
	case reflect.Int8, reflect.Int16, reflect.Int32:
		return encodeSmallIntToJSON(v, c)
	case reflect.Uint8, reflect.Uint16, reflect.Uint32:
		return encodeSmallUintToJSON(v, c)
	case reflect.Int64, reflect.Int:
		return encodeInt64ToJSON(v, c)
	case reflect.Uint64, reflect.Uint:
		return encodeUint64ToJSON(v, c)
	case reflect.Struct:
		t := v.Type()
		if utils.IsNullableType(t) {
			return encodeNullableToJSON(v, c)
		}
		if t.Implements(reflect.TypeFor[ArriModel]()) {
			result, err := v.Interface().(ArriModel).EncodeJSON(EncodingOptions{KeyCasing: c.KeyCasing})
			if err != nil {
				return err
			}
			c.Buffer = append(c.Buffer, result...)
			return nil
		}
		if t.Name() == "Time" {
			return encodeTimestampToJSON(v, c)
		}
		if isDiscriminatorStruct(t) {
			return encodeDiscriminatorToJSON(v, c)
		}
		return encodeStructToJSON(v, c)
	case reflect.Array, reflect.Slice:
		return encodeArrayToJSON(v, c)
	case reflect.Map:
		return encodeMapToJSON(v, c)
	case reflect.Ptr, reflect.UnsafePointer:
		return encodePointerToJSON(v, c)
	}
	return encodeInterfaceToJSON(v, c)
}

func encodeNullableToJSON(v reflect.Value, c *EncodingContext) error {
	valid := v.Field(1).Bool()
	if valid {
		value := v.Field(0)
		return encodeValueToJSON(value, c)
	}
	c.Buffer = append(c.Buffer, "null"...)
	return nil
}

func encodeInterfaceToJSON(v reflect.Value, c *EncodingContext) error {
	if !v.IsValid() {
		c.Buffer = append(c.Buffer, "null"...)
		return nil
	}
	if v.IsZero() {
		c.Buffer = append(c.Buffer, "null"...)
		return nil
	}
	result, err := EncodeJSON(v.Interface(), EncodingOptions{KeyCasing: c.KeyCasing})
	if err != nil {
		return err
	}
	c.Buffer = append(c.Buffer, result...)
	return nil
}

func encodeStringToJSON(v reflect.Value, c *EncodingContext) error {
	AppendNormalizedString(&c.Buffer, v.String())
	return nil
}

func encodeBoolToJSON(v reflect.Value, c *EncodingContext) error {
	c.Buffer = strconv.AppendBool(c.Buffer, v.Bool())
	return nil
}

func encodeFloatToJSON(v reflect.Value, c *EncodingContext) error {
	c.Buffer = append(c.Buffer, strconv.FormatFloat(v.Float(), 'f', -1, 64)...)
	return nil
}

func encodeSmallIntToJSON(v reflect.Value, c *EncodingContext) error {
	c.Buffer = strconv.AppendInt(c.Buffer, v.Int(), 10)
	return nil
}

func encodeSmallUintToJSON(v reflect.Value, c *EncodingContext) error {
	c.Buffer = strconv.AppendUint(c.Buffer, v.Uint(), 10)
	return nil
}

func encodeInt64ToJSON(v reflect.Value, c *EncodingContext) error {
	c.Buffer = append(c.Buffer, '"')
	c.Buffer = append(c.Buffer, fmt.Sprint(v.Int())...)
	c.Buffer = append(c.Buffer, '"')
	return nil
}

func encodeUint64ToJSON(v reflect.Value, c *EncodingContext) error {
	c.Buffer = append(c.Buffer, '"')
	c.Buffer = append(c.Buffer, fmt.Sprint(v.Uint())...)
	c.Buffer = append(c.Buffer, '"')
	return nil
}

func encodeTimestampToJSON(v reflect.Value, c *EncodingContext) error {
	output := v.Interface().(time.Time).Format("2006-01-02T15:04:05.000Z")
	c.Buffer = appendString(c.Buffer, output, false)
	return nil
}

func encodeEnumToJSON(v reflect.Value, c *EncodingContext) error {
	strVal := v.String()
	enumVals := c.EnumValues
	for _, v := range enumVals {
		if v == strVal {
			c.Buffer = append(c.Buffer, '"')
			c.Buffer = append(c.Buffer, strVal...)
			c.Buffer = append(c.Buffer, '"')
			return nil
		}
	}
	c.Buffer = append(c.Buffer, '"')
	c.Buffer = append(c.Buffer, enumVals[0]...)
	c.Buffer = append(c.Buffer, '"')
	return nil
}

func encodeStructToJSON(v reflect.Value, c *EncodingContext) error {
	t := v.Type()
	discriminatorKey := c.DiscriminatorKey
	discriminatorValue := c.DiscriminatorValue
	c.DiscriminatorKey = ""
	c.DiscriminatorValue = ""
	isDiscriminatorSubType := len(discriminatorKey) > 0
	oldInstancePath := c.InstancePath
	oldSchemaPath := c.SchemaPath
	c.HasKeys = isDiscriminatorSubType
	c.CurrentDepth++
	c.Buffer = append(c.Buffer, '{')
	if isDiscriminatorSubType {
		c.Buffer = append(c.Buffer, "\""+discriminatorKey+"\":\""+discriminatorValue+"\""...)
	}
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		if !field.IsExported() {
			continue
		}
		fieldName := utils.GetSerialKey(&field, c.KeyCasing)
		fieldValue := v.Field(i)
		enumTag := field.Tag.Get("enum")
		if len(enumTag) > 0 {
			rawEnumVals := strings.Split(enumTag, ",")
			enumVals := []string{}
			for i := 0; i < len(rawEnumVals); i++ {
				enumVals = append(enumVals, strings.TrimSpace(rawEnumVals[i]))
			}
			c.EnumValues = enumVals
		}
		c.InstancePath = c.InstancePath + "/" + fieldName
		if utils.IsOptionalType(field.Type) {
			c.SchemaPath = "/optionalProperties/" + fieldName
			if !utils.OptionalHasValue(&fieldValue) {
				c.InstancePath = oldInstancePath
				c.SchemaPath = oldSchemaPath
				continue
			}
			if c.HasKeys {
				c.Buffer = append(c.Buffer, ',')
			}
			c.Buffer = append(c.Buffer, "\""+fieldName+"\":"...)
			err := encodeValueToJSON(fieldValue.Field(0), c)
			if err != nil {
				return err
			}
			if len(c.EnumValues) > 0 {
				c.EnumValues = []string{}
			}
			c.HasKeys = true
			c.InstancePath = oldInstancePath
			c.SchemaPath = oldSchemaPath
			continue
		}
		if c.HasKeys {
			c.Buffer = append(c.Buffer, ',')
		}
		c.Buffer = append(c.Buffer, "\""+fieldName+"\":"...)
		err := encodeValueToJSON(fieldValue, c)
		if err != nil {
			return nil
		}
		if len(c.EnumValues) > 0 {
			c.EnumValues = []string{}
		}
		c.HasKeys = true
		c.InstancePath = oldInstancePath
		c.SchemaPath = oldSchemaPath
	}
	c.Buffer = append(c.Buffer, '}')
	c.HasKeys = false
	c.CurrentDepth--
	return nil
}

func isDiscriminatorStruct(t reflect.Type) bool {
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		if field.Type.Name() == "DiscriminatorKey" {
			continue
		}
		if field.Type.Kind() != reflect.Ptr {
			return false
		}
		if field.Type.Elem().Kind() != reflect.Struct {
			return false
		}
		if len(field.Tag.Get("discriminator")) == 0 {
			return false
		}
	}
	return true
}

func encodeDiscriminatorToJSON(v reflect.Value, c *EncodingContext) error {
	t := v.Type()
	discriminatorKey := "type"
	schemaPath := c.SchemaPath
	instancePath := c.InstancePath
	c.CurrentDepth++
	var firstFieldVal = None[reflect.Value]()
	var firstFieldDiscriminatorValue string = ""
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		discriminatorKeyTag := field.Tag.Get("discriminatorKey")
		if len(discriminatorKeyTag) > 0 {
			discriminatorKey = discriminatorKeyTag
			continue
		}
		discriminatorValue := field.Tag.Get("discriminator")
		c.SchemaPath = schemaPath + "/mapping/" + discriminatorValue
		c.DiscriminatorKey = discriminatorKey
		c.DiscriminatorValue = discriminatorValue
		fieldValue := v.Field(i)
		if firstFieldVal.IsNone() {
			firstFieldVal.Set(fieldValue)
			firstFieldDiscriminatorValue = discriminatorValue
		}
		if field.Type.Kind() != reflect.Ptr {
			return fmt.Errorf("all discriminator subtypes must be a struct pointer at %+v", c.InstancePath)
		}
		if fieldValue.IsNil() {
			continue
		}
		err := encodeValueToJSON(fieldValue, c)
		if err != nil {
			return err
		}
		c.SchemaPath = schemaPath
		c.InstancePath = instancePath
		c.CurrentDepth--
		c.DiscriminatorKey = ""
		c.DiscriminatorValue = ""
		return nil
	}
	if firstFieldVal.IsSome() {
		c.SchemaPath = schemaPath + "/mapping/" + firstFieldDiscriminatorValue
		c.DiscriminatorKey = discriminatorKey
		c.DiscriminatorValue = firstFieldDiscriminatorValue
		val := reflect.Zero(firstFieldVal.Unwrap().Type().Elem())
		err := encodeValueToJSON(val, c)
		if err != nil {
			return err
		}
		c.SchemaPath = schemaPath
		c.InstancePath = instancePath
		c.CurrentDepth--
		c.DiscriminatorKey = ""
		c.DiscriminatorValue = ""
		return nil
	}
	return fmt.Errorf("all discriminator subtypes are nil")
}

func encodeArrayToJSON(v reflect.Value, c *EncodingContext) error {
	instancePath := c.InstancePath
	schemaPath := c.SchemaPath
	c.CurrentDepth++
	if v.IsNil() {
		c.Buffer = append(c.Buffer, "[]"...)
		return nil
	}
	slice := v.Slice(0, v.Len())
	c.Buffer = append(c.Buffer, '[')
	for i := 0; i < slice.Len(); i++ {
		if i > 0 {
			c.Buffer = append(c.Buffer, ',')
		}
		c.InstancePath = instancePath + "/" + fmt.Sprint(i)
		c.SchemaPath = schemaPath + "/elements"
		err := encodeValueToJSON(slice.Index(i), c)
		if err != nil {
			return err
		}
	}
	c.Buffer = append(c.Buffer, ']')
	c.CurrentDepth--
	c.InstancePath = instancePath
	c.SchemaPath = schemaPath
	return nil
}

func encodeMapToJSON(v reflect.Value, c *EncodingContext) error {
	instancePath := c.InstancePath
	schemaPath := c.SchemaPath
	c.SchemaPath = schemaPath + "/values"
	c.CurrentDepth++
	keys := map[string]reflect.Value{}
	keyVals := []string{}
	for _, key := range v.MapKeys() {
		if key.Kind() != reflect.String {
			return fmt.Errorf("error at %s, map keys must be strings", instancePath)
		}
		keyName := key.String()
		keys[keyName] = key
		keyVals = append(keyVals, keyName)
	}
	sort.Strings(keyVals)
	c.Buffer = append(c.Buffer, '{')
	for i, keyName := range keyVals {
		key := keys[keyName]
		c.InstancePath = c.InstancePath + "/" + keyName
		if i > 0 {
			c.Buffer = append(c.Buffer, ',')
		}
		AppendNormalizedString(&c.Buffer, keyName)
		c.Buffer = append(c.Buffer, ':')
		err := encodeValueToJSON(v.MapIndex(key), c)
		if err != nil {
			return err
		}
	}
	c.Buffer = append(c.Buffer, '}')
	c.CurrentDepth--
	c.InstancePath = instancePath
	c.SchemaPath = schemaPath
	return nil
}

func encodePointerToJSON(v reflect.Value, c *EncodingContext) error {
	if v.IsNil() {
		c.Buffer = append(c.Buffer, "null"...)
		return nil
	}
	innerV := v.Elem()
	return encodeValueToJSON(innerV, c)
}
