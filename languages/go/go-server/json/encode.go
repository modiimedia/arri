package arri_json

import (
	"encoding/json"
	"fmt"
	"reflect"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/iancoleman/strcase"
)

type ArriJsonEncodable interface {
	EncodeJSON(keyCasing string) ([]byte, error)
}

type encodingCtx struct {
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

func newEncodingCtx(keyCasing string) *encodingCtx {
	return &encodingCtx{
		keyCasing:    keyCasing,
		buffer:       []byte{},
		instancePath: "",
		schemaPath:   "",
		hasKeys:      false,
		enumValues:   []string{},
	}
}

func Encode(input any, keyCasing string) ([]byte, error) {
	ctx := newEncodingCtx(keyCasing)
	value := reflect.ValueOf(input)
	err := encodeValue(value, ctx)
	if err != nil {
		return nil, err
	}
	return ctx.buffer, nil
}

func encodeValue(v reflect.Value, c *encodingCtx) error {
	// if v.IsNil() {
	// 	c.buffer = append(c.buffer, "null"...)
	// 	return nil
	// }
	kind := v.Kind()
	switch kind {
	case reflect.String:
		if c.enumValues != nil && len(c.enumValues) > 0 {
			return encodeEnum(v, c)
		}
		return encodeString(v, c)
	case reflect.Bool:
		return encodeBool(v, c)
	case reflect.Float32, reflect.Float64:
		return encodeFloat(v, c)
	case reflect.Int8, reflect.Int16, reflect.Int32:
		return encodeSmallInt(v, c)
	case reflect.Uint8, reflect.Uint16, reflect.Uint32:
		return encodeSmallUint(v, c)
	case reflect.Int64, reflect.Int:
		return encodeInt64(v, c)
	case reflect.Uint64, reflect.Uint:
		return encodeUint64(v, c)
	case reflect.Struct:
		t := v.Type()
		if t.Implements(reflect.TypeFor[ArriJsonEncodable]()) {
			result, err := v.Interface().(ArriJsonEncodable).EncodeJSON(c.keyCasing)
			if err != nil {
				return err
			}
			c.buffer = append(c.buffer, result...)
			return nil
		}
		if t.Name() == "Time" {
			return encodeTimestamp(v, c)
		}
		if isDiscriminatorStruct(t) {
			return encodeDiscriminator(v, c)
		}
		return encodeStruct(v, c)
	case reflect.Array, reflect.Slice:
		return encodeArray(v, c)
	case reflect.Map:
		return encodeMap(v, c)
	case reflect.Ptr, reflect.UnsafePointer:
		return encodePointer(v, c)
	}
	return encodeInterface(v, c)
}

func encodeInterface(v reflect.Value, c *encodingCtx) error {
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

func encodeString(v reflect.Value, c *encodingCtx) error {
	AppendNormalizedString(&c.buffer, v.String())
	return nil
}

func encodeBool(v reflect.Value, c *encodingCtx) error {
	c.buffer = strconv.AppendBool(c.buffer, v.Bool())
	return nil
}

func encodeFloat(v reflect.Value, c *encodingCtx) error {
	c.buffer = append(c.buffer, strconv.FormatFloat(v.Float(), 'f', -1, 64)...)
	return nil
}

func encodeSmallInt(v reflect.Value, c *encodingCtx) error {
	c.buffer = strconv.AppendInt(c.buffer, v.Int(), 10)
	return nil
}

func encodeSmallUint(v reflect.Value, c *encodingCtx) error {
	c.buffer = strconv.AppendUint(c.buffer, v.Uint(), 10)
	return nil
}

func encodeInt64(v reflect.Value, c *encodingCtx) error {
	c.buffer = append(c.buffer, '"')
	c.buffer = append(c.buffer, fmt.Sprint(v.Int())...)
	c.buffer = append(c.buffer, '"')
	return nil
}

func encodeUint64(v reflect.Value, c *encodingCtx) error {
	c.buffer = append(c.buffer, '"')
	c.buffer = append(c.buffer, fmt.Sprint(v.Uint())...)
	c.buffer = append(c.buffer, '"')
	return nil
}

func encodeTimestamp(v reflect.Value, c *encodingCtx) error {
	output := v.Interface().(time.Time).Format("2006-01-02T15:04:05.000Z")
	c.buffer = appendString(c.buffer, output, false)
	return nil
}

func encodeEnum(v reflect.Value, c *encodingCtx) error {
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

func encodeStruct(v reflect.Value, c *encodingCtx) error {
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
			err := encodeValue(fieldValue.Field(0), c)
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
		err := encodeValue(fieldValue, c)
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

func getSerialKey(field *reflect.StructField, keyCasing string) string {
	keyTag := field.Tag.Get("key")
	if len(keyTag) > 0 {
		return keyTag
	}
	switch keyCasing {
	case "CAMEL_CASE":
		return strcase.ToLowerCamel(field.Name)
	case "PASCAL_CASE":
		return field.Name
	case "SNAKE_CASE":
		return strcase.ToSnake(field.Name)
	}
	return strcase.ToLowerCamel(field.Name)
}

func isOptionalType(input reflect.Type) bool {
	t := input
	if t.Kind() == reflect.Ptr {
		t = t.Elem()
	}
	return t.Kind() == reflect.Struct && strings.HasPrefix(t.Name(), "Option[")
}

func optionalHasValue(value *reflect.Value) bool {
	target := value
	if target.Kind() == reflect.Ptr {
		if target.IsNil() {
			return false
		}
		el := value.Elem()
		target = &el
	}
	isSome := target.Field(1)
	return isSome.Bool()
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

func encodeDiscriminator(v reflect.Value, c *encodingCtx) error {
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
		err := encodeValue(fieldValue, c)
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

func encodeArray(v reflect.Value, c *encodingCtx) error {
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
		err := encodeValue(slice.Index(i), c)
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

func encodeMap(v reflect.Value, c *encodingCtx) error {
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
		err := encodeValue(v.MapIndex(key), c)
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

func encodePointer(v reflect.Value, c *encodingCtx) error {
	if v.IsNil() {
		c.buffer = append(c.buffer, "null"...)
		return nil
	}
	innerV := v.Elem()
	return encodeValue(innerV, c)
}
