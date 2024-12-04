package arri

import (
	"encoding/json"
	"fmt"
	"reflect"
	"sort"
	"strconv"
	"time"
)

type jsonEncodingCtx struct {
	keyCasing          string
	buffer             []byte
	instancePath       string
	schemaPath         string
	currentDepth       uint32
	hasKeys            bool
	enumValues         []string
	discriminatorKey   string
	discriminatorValue string
}

func newJsonEncodingCtx(keyCasing string) *jsonEncodingCtx {
	return &jsonEncodingCtx{
		keyCasing:    keyCasing,
		buffer:       []byte{},
		instancePath: "",
		schemaPath:   "",
		hasKeys:      false,
		enumValues:   []string{},
	}
}

func EncodeJSON(input any, keyCasing string) ([]byte, error) {
	ctx := newJsonEncodingCtx(keyCasing)
	value := reflect.ValueOf(input)
	err := encodeValueToJSON(value, ctx)
	if err != nil {
		return nil, err
	}
	return ctx.buffer, nil
}

func encodeValueToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	kind := v.Kind()
	switch kind {
	case reflect.String:
		if len(c.enumValues) > 0 {
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
		if isNullableType(t) {
			return encodeNullableToJSON(v, c)
		}
		if t.Implements(reflect.TypeFor[ArriModel]()) {
			result, err := v.Interface().(ArriModel).EncodeJSON(c.keyCasing)
			if err != nil {
				return err
			}
			c.buffer = append(c.buffer, result...)
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

func encodeNullableToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	valid := v.Field(1).Bool()
	if valid {
		value := v.Field(0)
		return encodeValueToJSON(value, c)
	}
	c.buffer = append(c.buffer, "null"...)
	return nil
}

func encodeInterfaceToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	if !v.IsValid() {
		c.buffer = append(c.buffer, "null"...)
		return nil
	}
	if v.IsZero() {
		c.buffer = append(c.buffer, "null"...)
		return nil
	}
	result, err := json.Marshal(v.Interface())
	if err != nil {
		return err
	}
	c.buffer = append(c.buffer, result...)
	return nil
}

func encodeStringToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	AppendNormalizedString(&c.buffer, v.String())
	return nil
}

func encodeBoolToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	c.buffer = strconv.AppendBool(c.buffer, v.Bool())
	return nil
}

func encodeFloatToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	c.buffer = append(c.buffer, strconv.FormatFloat(v.Float(), 'f', -1, 64)...)
	return nil
}

func encodeSmallIntToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	c.buffer = strconv.AppendInt(c.buffer, v.Int(), 10)
	return nil
}

func encodeSmallUintToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	c.buffer = strconv.AppendUint(c.buffer, v.Uint(), 10)
	return nil
}

func encodeInt64ToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	c.buffer = append(c.buffer, '"')
	c.buffer = append(c.buffer, fmt.Sprint(v.Int())...)
	c.buffer = append(c.buffer, '"')
	return nil
}

func encodeUint64ToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	c.buffer = append(c.buffer, '"')
	c.buffer = append(c.buffer, fmt.Sprint(v.Uint())...)
	c.buffer = append(c.buffer, '"')
	return nil
}

func encodeTimestampToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	output := v.Interface().(time.Time).Format("2006-01-02T15:04:05.000Z")
	c.buffer = appendString(c.buffer, output, false)
	return nil
}

func encodeEnumToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	strVal := v.String()
	enumVals := c.enumValues
	for _, v := range enumVals {
		if v == strVal {
			c.buffer = append(c.buffer, '"')
			c.buffer = append(c.buffer, strVal...)
			c.buffer = append(c.buffer, '"')
			return nil
		}
	}
	return fmt.Errorf("error at %v expected one of the following enum values %+v", c.instancePath, enumVals)
}

func encodeStructToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	t := v.Type()
	discriminatorKey := c.discriminatorKey
	discriminatorValue := c.discriminatorValue
	c.discriminatorKey = ""
	c.discriminatorValue = ""
	isDiscriminatorSubType := len(discriminatorKey) > 0
	oldInstancePath := c.instancePath
	oldSchemaPath := c.schemaPath
	c.hasKeys = isDiscriminatorSubType
	c.currentDepth++
	c.buffer = append(c.buffer, '{')
	if isDiscriminatorSubType {
		c.buffer = append(c.buffer, "\""+discriminatorKey+"\":\""+discriminatorValue+"\""...)
	}
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		if !field.IsExported() {
			continue
		}
		fieldName := getSerialKey(&field, c.keyCasing)
		fieldValue := v.Field(i)
		c.instancePath = c.instancePath + "/" + fieldName
		if isOptionalType(field.Type) {
			c.schemaPath = "/optionalProperties/" + fieldName
			if !optionalHasValue(&fieldValue) {
				c.instancePath = oldInstancePath
				c.schemaPath = oldSchemaPath
				continue
			}
			if c.hasKeys {
				c.buffer = append(c.buffer, ',')
			}
			c.buffer = append(c.buffer, "\""+fieldName+"\":"...)
			err := encodeValueToJSON(fieldValue.Field(0), c)
			if err != nil {
				return err
			}
			c.hasKeys = true
			c.instancePath = oldInstancePath
			c.schemaPath = oldSchemaPath
			continue
		}
		if c.hasKeys {
			c.buffer = append(c.buffer, ',')
		}
		c.buffer = append(c.buffer, "\""+fieldName+"\":"...)
		err := encodeValueToJSON(fieldValue, c)
		if err != nil {
			return nil
		}
		c.hasKeys = true
		c.instancePath = oldInstancePath
		c.schemaPath = oldSchemaPath
	}
	c.buffer = append(c.buffer, '}')
	c.hasKeys = false
	c.currentDepth--
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

func encodeDiscriminatorToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	t := v.Type()
	discriminatorKey := "type"
	schemaPath := c.schemaPath
	instancePath := c.instancePath
	c.currentDepth++
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		discriminatorKeyTag := field.Tag.Get("discriminatorKey")
		if len(discriminatorKeyTag) > 0 {
			discriminatorKey = discriminatorKeyTag
			continue
		}
		discriminatorValue := field.Tag.Get("discriminator")
		c.schemaPath = schemaPath + "/mapping/" + discriminatorValue
		c.discriminatorKey = discriminatorKey
		c.discriminatorValue = discriminatorValue
		fieldValue := v.Field(i)
		if field.Type.Kind() != reflect.Ptr {
			return fmt.Errorf("all discriminator subtypes must be a struct pointer at %+v", c.instancePath)
		}
		if fieldValue.IsNil() {
			continue
		}
		err := encodeValueToJSON(fieldValue, c)
		if err != nil {
			return err
		}
		c.schemaPath = schemaPath
		c.instancePath = instancePath
		c.currentDepth--
		c.discriminatorKey = ""
		c.discriminatorValue = ""
		return nil
	}
	return fmt.Errorf("all discriminator subtypes are nil")
}

func encodeArrayToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	instancePath := c.instancePath
	schemaPath := c.schemaPath
	c.currentDepth++
	if v.IsNil() {
		c.buffer = append(c.buffer, "[]"...)
		return nil
	}
	slice := v.Slice(0, v.Len())
	c.buffer = append(c.buffer, '[')
	for i := 0; i < slice.Len(); i++ {
		if i > 0 {
			c.buffer = append(c.buffer, ',')
		}
		c.instancePath = instancePath + "/" + fmt.Sprint(i)
		c.schemaPath = schemaPath + "/elements"
		err := encodeValueToJSON(slice.Index(i), c)
		if err != nil {
			return err
		}
	}
	c.buffer = append(c.buffer, ']')
	c.currentDepth--
	c.instancePath = instancePath
	c.schemaPath = schemaPath
	return nil
}

func encodeMapToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	instancePath := c.instancePath
	schemaPath := c.schemaPath
	c.schemaPath = schemaPath + "/values"
	c.currentDepth++
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
	c.buffer = append(c.buffer, '{')
	for i, keyName := range keyVals {
		key := keys[keyName]
		c.instancePath = c.instancePath + "/" + keyName
		if i > 0 {
			c.buffer = append(c.buffer, ',')
		}
		AppendNormalizedString(&c.buffer, keyName)
		c.buffer = append(c.buffer, ':')
		err := encodeValueToJSON(v.MapIndex(key), c)
		if err != nil {
			return err
		}
	}
	c.buffer = append(c.buffer, '}')
	c.currentDepth--
	c.instancePath = instancePath
	c.schemaPath = schemaPath
	return nil
}

func encodePointerToJSON(v reflect.Value, c *jsonEncodingCtx) error {
	if v.IsNil() {
		c.buffer = append(c.buffer, "null"...)
		return nil
	}
	innerV := v.Elem()
	return encodeValueToJSON(innerV, c)
}
