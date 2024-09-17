package arri

import (
	"fmt"
	"reflect"
	"sync"
	"unsafe"

	"github.com/iancoleman/strcase"
)

type encoder = func(input unsafe.Pointer, context *Ctx) ([]byte, error)

var encoderPool = sync.Pool{}

type Ctx struct {
	target       []byte
	currentDepth uint32
	maxDepth     uint32
	enumValues   []string
	keyCasing    KeyCasing
	instancePath string
	schemaPath   string
	hasKeys      bool
}

func (c *Ctx) Reset() {
	c.target = []byte{}
	c.currentDepth = 0
	c.maxDepth = 0
	c.enumValues = []string{}
	c.keyCasing = KeyCasingCamelCase
	c.hasKeys = false
}

func (c *Ctx) SetEnumValues(vals []string) {
	c.enumValues = vals
}

func (c *Ctx) SetDepth(depth uint32) {
	c.currentDepth = depth

}

func (c *Ctx) SetInstancePath(path string) {
	c.instancePath = path
}

func (c *Ctx) SetSchemaPath(path string) {
	c.schemaPath = path
}

func NewEncodingContext(keyCasing KeyCasing) *Ctx {
	return &Ctx{
		target:       []byte{},
		currentDepth: 0,
		maxDepth:     10000,
		enumValues:   []string{},
		keyCasing:    keyCasing,
	}
}

func CompileJSONEncoder(input interface{}, keyCasing KeyCasing) (encoder, error) {
	ctx := NewEncodingContext(keyCasing)
	t := reflect.TypeOf(input)
	return typeToJSONEncoder(t, ctx)
}

func typeToJSONEncoder(t reflect.Type, ctx *Ctx) (encoder, error) {
	if ctx.currentDepth > ctx.maxDepth {
		return nil, fmt.Errorf("max depth exceeded: %v", ctx.instancePath)
	}
	switch t.Kind() {
	case reflect.Int8:
		return int8ToJSONEncoder(t, ctx)
	case reflect.Int16:
	case reflect.Int32:
	case reflect.Int64:
	case reflect.Int:
		return intToJSONEncoder(t, ctx)
	case reflect.Uint8:
	case reflect.Uint16:
	case reflect.Uint32:
	case reflect.Uint64:
	case reflect.Uint:
	case reflect.Struct:
		return structToJSONEncoder(t, ctx)
	}
	return nil, nil
}

func intToJSONEncoder(_ reflect.Type, _ *Ctx) (encoder, error) {
	return func(input unsafe.Pointer, context *Ctx) ([]byte, error) {
		context.target = append(context.target, fmt.Sprintf("\"%v\"", *(*int)(input))...)
		return context.target, nil
	}, nil
}

func int8ToJSONEncoder(_ reflect.Type, _ *Ctx) (encoder, error) {
	return func(input unsafe.Pointer, context *Ctx) ([]byte, error) {
		context.target = append(context.target, fmt.Sprint(*(*int8)(input))...)
		return context.target, nil
	}, nil
}

func structToJSONEncoder(t reflect.Type, ctx *Ctx) (encoder, error) {
	encoders := []encoder{}
	instancePath := ctx.instancePath
	schemaPath := ctx.schemaPath
	currentDepth := ctx.currentDepth
	ctx.hasKeys = false
	ctx.currentDepth++
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		fieldName := strcase.ToLowerCamel(field.Name)
		fmt.Println("FIELD", fieldName, "TYPE", field.Type.Kind())
		switch ctx.keyCasing {
		case KeyCasingCamelCase:
		case KeyCasingPascalCase:
		case KeyCasingSnakeCase:
		default:
			msg := fmt.Sprintf("Unsupported key casing at %v expected one of [%v, %v, %v]", ctx.instancePath, KeyCasingCamelCase, KeyCasingPascalCase, KeyCasingSnakeCase)
			panic(msg)
		}
		ctx.target = append(ctx.target, `"`+fieldName+`":`...)
		ctx.instancePath = instancePath + "/" + fieldName
		ctx.schemaPath = schemaPath + "/properties/" + fieldName
		e, err := typeToJSONEncoder(field.Type, ctx)
		if e == nil {
			continue
		}
		if err != nil {
			panic(err)
		}
		encoders = append(encoders, func(input unsafe.Pointer, context *Ctx) ([]byte, error) {
			if context.hasKeys {
				context.target = append(context.target, ',')
			}
			context.target = appendString(context.target, "\""+fieldName+"\":", false)
			result, err := e(unsafe.Pointer(uintptr(input)+field.Offset), context)
			if err == nil {
				context.hasKeys = true
				return nil, err
			}
			return result, err
		})
	}
	ctx.currentDepth = currentDepth
	ctx.schemaPath = schemaPath
	ctx.instancePath = instancePath
	ctx.hasKeys = false
	return func(input unsafe.Pointer, context *Ctx) ([]byte, error) {
		context.target = append(context.target, '{')
		for _, e := range encoders {
			e(input, context)
		}
		context.target = append(context.target, '}')
		return context.target, nil
	}, nil
}
