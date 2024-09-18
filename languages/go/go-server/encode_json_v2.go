package arri

import (
	"fmt"
	"reflect"
	"sync"
	"time"
	"unsafe"

	"github.com/iancoleman/strcase"
)

type encoder = func(input unsafe.Pointer, context *EncodingCtx) ([]byte, error)

var encoderPool = sync.Pool{}

type CompileEncoderContext struct {
	currentDepth       uint32
	maxDepth           uint32
	enumValues         []string
	keyCasing          KeyCasing
	instancePath       string
	schemaPath         string
	encoders           map[string]encoder
	discriminatorKey   string
	discriminatorValue string
}

func NewCompileEncoderContext(keyCasing KeyCasing) *CompileEncoderContext {
	return &CompileEncoderContext{
		currentDepth: 0,
		maxDepth:     10000,
		keyCasing:    keyCasing,
		enumValues:   []string{},
		instancePath: "",
		schemaPath:   "",
		encoders:     map[string]encoder{},
	}
}

type EncodingCtx struct {
	target       []byte
	enumValues   []string
	instancePath string
	schemaPath   string
	hasKeys      bool
}

func (c *EncodingCtx) Reset() {
	c.target = []byte{}
	c.enumValues = []string{}
	c.hasKeys = false
}

func (c *EncodingCtx) SetEnumValues(vals []string) {
	c.enumValues = vals
}

func (c *EncodingCtx) SetInstancePath(path string) {
	c.instancePath = path
}

func (c *EncodingCtx) SetSchemaPath(path string) {
	c.schemaPath = path
}

func NewEncodingContext(keyCasing KeyCasing) *EncodingCtx {
	return &EncodingCtx{
		target:     []byte{},
		enumValues: []string{},
	}
}

func CompileJSONEncoder(input interface{}, keyCasing KeyCasing) (encoder, error) {
	ctx := NewCompileEncoderContext(keyCasing)
	t := reflect.TypeOf(input)
	return typeToJSONEncoder(t, ctx)
}

func typeToJSONEncoder(t reflect.Type, ctx *CompileEncoderContext) (encoder, error) {
	if ctx.currentDepth > ctx.maxDepth {
		return nil, fmt.Errorf("max depth exceeded: %v", ctx.instancePath)
	}
	switch t.Kind() {
	case reflect.String:
		if len(ctx.enumValues) > 0 {
			return enumToJSONEncoder(t, ctx)
		}
		return stringJSONEncoder, nil
	case reflect.Float32:
		return float32JSONEncoder, nil
	case reflect.Float64:
		return float64JSONEncoder, nil
	case reflect.Int8:
		return int8JSONEncoder, nil
	case reflect.Int16:
		return int16JSONEncoder, nil
	case reflect.Int32:
		return int32JSONEncoder, nil
	case reflect.Int64:
		return int64JSONEncoder, nil
	case reflect.Int:
		return intJSONEncoder, nil
	case reflect.Uint8:
		return uint8JSONEncoder, nil
	case reflect.Uint16:
		return uint16JSONEncoder, nil
	case reflect.Uint32:
		return uint32JSONEncoder, nil
	case reflect.Uint64:
		return uint64JSONEncoder, nil
	case reflect.Uint:
		return uintJSONEncoder, nil
	case reflect.Array:
		fmt.Println("ARRAY_TYPE")
		return arrayToJSONEncoder(t, ctx)
	case reflect.Struct:
		if t.Name() == "Time" {
			return timestampJSONEncoder, nil
		}
		return structToJSONEncoder(t, ctx)
	case reflect.Ptr:
		return ptrToJSONEncoder(t, ctx)
	}
	return nil, nil
}

func ptrToJSONEncoder(t reflect.Type, ctx *CompileEncoderContext) (encoder, error) {
	e, err := typeToJSONEncoder(t.Elem(), ctx)
	if err != nil {
		return nil, err
	}
	return func(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
		val := *(*any)(input)
		if val == nil {
			return nil, nil
		}
		return e(input, context)
	}, nil
}

func stringJSONEncoder(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
	appendNormalizedString(&context.target, *(*string)(input))
	return context.target, nil
}

func timestampJSONEncoder(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
	timeValue := (*time.Time)(input).Format("2006-01-02T15:04:05.000Z")
	context.target = appendString(context.target, timeValue, false)
	return context.target, nil
}

func float32JSONEncoder(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
	context.target = append(context.target, fmt.Sprint(*(*float32)(input))...)
	return context.target, nil
}

func float64JSONEncoder(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
	context.target = append(context.target, fmt.Sprint(*(*float64)(input))...)
	return context.target, nil
}

func int8JSONEncoder(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
	context.target = append(context.target, fmt.Sprint(*(*int8)(input))...)
	return context.target, nil
}

func int16JSONEncoder(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
	context.target = append(context.target, fmt.Sprint(*(*int16)(input))...)
	return context.target, nil
}

func int32JSONEncoder(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
	context.target = append(context.target, fmt.Sprint(*(*int32)(input))...)
	return context.target, nil
}

func int64JSONEncoder(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
	context.target = append(context.target, '"')
	context.target = append(context.target, fmt.Sprint(*(*int64)(input))...)
	context.target = append(context.target, '"')
	return context.target, nil
}

func intJSONEncoder(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
	context.target = append(context.target, '"')
	context.target = append(context.target, fmt.Sprint(*(*int)(input))...)
	context.target = append(context.target, '"')
	return context.target, nil
}

func uint8JSONEncoder(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
	context.target = append(context.target, fmt.Sprint(*(*uint8)(input))...)
	return context.target, nil
}

func uint16JSONEncoder(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
	context.target = append(context.target, fmt.Sprint(*(*uint16)(input))...)
	return context.target, nil
}

func uint32JSONEncoder(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
	context.target = append(context.target, fmt.Sprint(*(*uint32)(input))...)
	return context.target, nil
}

func uint64JSONEncoder(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
	context.target = append(context.target, '"')
	context.target = append(context.target, fmt.Sprint(*(*uint64)(input))...)
	context.target = append(context.target, '"')
	return context.target, nil
}

func uintJSONEncoder(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
	context.target = append(context.target, '"')
	context.target = append(context.target, fmt.Sprint(*(*uint)(input))...)
	context.target = append(context.target, '"')
	return context.target, nil
}

func enumToJSONEncoder(_ reflect.Type, ctx *CompileEncoderContext) (encoder, error) {
	return func(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
		possibleVals := ctx.enumValues
		val := *(*string)(input)
		for _, item := range ctx.enumValues {
			if item == val {
				context.target = appendString(context.target, item, false)
				return context.target, nil
			}
		}
		return nil, fmt.Errorf("error serializing at %v expected one of the following values %+v", context.instancePath, possibleVals)
	}, nil
}

func arrayToJSONEncoder(t reflect.Type, ctx *CompileEncoderContext) (encoder, error) {
	innerType := t.Elem()
	depth := ctx.currentDepth
	ctx.currentDepth++
	// innerEncoder, innerEncoderError := typeToJSONEncoder(innerType, ctx)
	ctx.currentDepth = depth
	fmt.Println("INNER_TYPE", unsafe.Pointer(&innerType))
	return func(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
		val := *(*[]any)(input)
		fmt.Println("ARRAY_VAL", val)
		context.target = append(context.target, '[')
		context.target = append(context.target, ']')
		return context.target, nil
	}, nil
}

func structToJSONEncoder(t reflect.Type, ctx *CompileEncoderContext) (encoder, error) {
	existingEncoder := ctx.encoders[t.Name()]
	if existingEncoder != nil {
		return existingEncoder, nil
	}
	if IsDiscriminatorStruct(t) {
		return nil, nil
		return discriminatorToJSONEncoder(t, ctx)
	}
	encoders := []encoder{}
	instancePath := ctx.instancePath
	schemaPath := ctx.schemaPath
	currentDepth := ctx.currentDepth
	ctx.currentDepth++
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		fieldName := getSerialKey(field.Name, ctx)
		ctx.instancePath = instancePath + "/" + fieldName
		ctx.schemaPath = schemaPath + "/properties/" + fieldName
		e, err := typeToJSONEncoder(field.Type, ctx)
		if e == nil {
			continue
		}
		if err != nil {
			panic(err)
		}
		encoders = append(encoders, func(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
			if context.hasKeys {
				context.target = append(context.target, ',')
			}
			context.target = append(context.target, `"`+fieldName+`":`...)
			result, err := e(unsafe.Pointer(uintptr(input)+field.Offset), context)
			if err == nil && !context.hasKeys && result != nil {
				context.hasKeys = true
				return result, nil
			}
			return result, err
		})
	}
	ctx.currentDepth = currentDepth
	ctx.schemaPath = schemaPath
	ctx.instancePath = instancePath
	discriminatorKey := ctx.discriminatorKey
	discriminatorValue := ctx.discriminatorValue
	result := func(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
		context.hasKeys = false
		context.target = append(context.target, '{')
		if len(discriminatorKey) > 0 {
			context.target = append(context.target, "\""+discriminatorKey+"\":\""+discriminatorValue+"\""...)
			context.hasKeys = true
		}
		for _, e := range encoders {
			e(input, context)
		}
		context.target = append(context.target, '}')
		return context.target, nil
	}
	ctx.encoders[t.Name()] = result
	return result, nil
}

func discriminatorToJSONEncoder(t reflect.Type, ctx *CompileEncoderContext) (encoder, error) {
	discriminatorKey := "type"
	encoders := []encoder{}
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		if field.Name == "DiscriminatorKey" {
			keyName := field.Tag.Get("discriminatorKey")
			if len(keyName) > 0 {
				discriminatorKey = keyName
				continue
			}
		}
		ctx.discriminatorKey = discriminatorKey
		discriminatorValue := field.Tag.Get("Discriminator")
		ctx.discriminatorValue = discriminatorValue
		fieldTypeEncoder, fieldTypeEncoderErr := typeToJSONEncoder(field.Type, ctx)
		if fieldTypeEncoderErr != nil {
			return nil, fieldTypeEncoderErr
		}
		fieldEncoder := func(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
			ptr := unsafe.Pointer(uintptr(input) + field.Offset)
			val := *(*any)(ptr)
			if val == nil {
				return nil, nil
			}
			result, err := fieldTypeEncoder(ptr, context)
			if err == nil && !context.hasKeys && result != nil {
				return result, nil
			}
			return result, err
		}
		encoders = append(encoders, fieldEncoder)
	}
	ctx.discriminatorKey = ""
	ctx.discriminatorValue = ""
	return func(input unsafe.Pointer, context *EncodingCtx) ([]byte, error) {
		for _, e := range encoders {
			result, err := e(input, context)
			if result != nil {
				return result, err
			}
			if err != nil {
				return nil, err
			}
		}
		return nil, fmt.Errorf("error serializing at %v. all fields are nil", context.instancePath)
	}, nil
}

func getSerialKey(fieldName string, context *CompileEncoderContext) string {
	switch context.keyCasing {
	case KeyCasingCamelCase:
		return strcase.ToLowerCamel(fieldName)
	case KeyCasingPascalCase:
		return fieldName
	case KeyCasingSnakeCase:
		return strcase.ToSnake(fieldName)
	}
	msg := fmt.Sprintf("Unsupported key casing at %v expected one of [%v, %v, %v]", context.instancePath, KeyCasingCamelCase, KeyCasingPascalCase, KeyCasingSnakeCase)
	panic(msg)
}
