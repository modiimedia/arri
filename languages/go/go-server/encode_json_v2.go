package arri

import (
	"fmt"
	"reflect"
	"sync"
	"unsafe"

	"github.com/iancoleman/strcase"
	"github.com/viant/xunsafe"
)

type Ctx struct {
	target       []byte
	currentDepth uint32
	maxDepth     uint32
	enumValues   []string
	keyCasing    KeyCasing
}

func (c *Ctx) Reset() {
	c.target = []byte{}
	c.currentDepth = 0
	c.maxDepth = 0
	c.enumValues = []string{}
	c.keyCasing = KeyCasingCamelCase
}

var encodingJsonV2SyncPool = sync.Pool{}

func newEncodingContext(keyCasing KeyCasing) *Ctx {
	if v := encodingJsonV2SyncPool.Get(); v != nil {
		e := v.(*Ctx)
		e.Reset()
		e.keyCasing = keyCasing
		return e
	}
	return &Ctx{
		target:       []byte{},
		currentDepth: 0,
		maxDepth:     0,
		enumValues:   []string{},
		keyCasing:    keyCasing,
	}
}

func EncodeJSONCompiled(input interface{}, keyCasing KeyCasing) ([]byte, error) {
	target := []byte{}
	ctx := newEncodingContext(keyCasing)
	defer encodingJsonV2SyncPool.Put(ctx)
	typ := reflect.TypeOf(input)
	ptr := xunsafe.EnsurePointer(input)
	structToJSON(ptr, typ, ctx)
	return target, nil
}

func fieldToJSON(input unsafe.Pointer, field *xunsafe.Field, ctx *Ctx) error {
	switch field.Type.Kind() {
	case reflect.Int:
		return intToJSON(input, field, ctx)
	case reflect.Int8:
	case reflect.Int16:
	case reflect.Int32:
	case reflect.Int64:
	case reflect.Uint:
	case reflect.Uint8:
	case reflect.Uint16:
	case reflect.Uint32:
	case reflect.Uint64:
	case reflect.Struct:
	}
	return nil
}

func intToJSON(input unsafe.Pointer, field *xunsafe.Field, ctx *Ctx) error {
	val := field.Value(input).(int)
	ctx.target = append(ctx.target, fmt.Sprint(val)...)
	return nil
}

func structToJSON(input unsafe.Pointer, t reflect.Type, ctx *Ctx) error {
	ctx.target = append(ctx.target, '{')
	for i := 0; i < t.NumField(); i++ {
		field := xunsafe.FieldByIndex(t, i)
		fieldPtr := field.ValuePointer(input)
		fieldName := strcase.ToLowerCamel(field.Name)
		ctx.target = append(ctx.target, "\""+fieldName+"\":"...)
		fieldToJSON(fieldPtr, field, ctx)
	}
	ctx.target = append(ctx.target, '}')
	return nil
}
