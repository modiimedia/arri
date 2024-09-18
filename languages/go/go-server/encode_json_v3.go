package arri

import (
	"fmt"
	"reflect"
	"strconv"
	"sync"
	"time"
)

var jsonEncoderCache sync.Map = sync.Map{} // map[reflect.Type]jsonEncoder

type jsonEncoder = func(val reflect.Value, context *EncodingCtx) error

func EncodeJsonV3(input interface{}, keyCasing KeyCasing) ([]byte, error) {
	ctx := NewCompileEncoderContext(keyCasing)
	val := reflect.ValueOf(input)
	typ := val.Type()
	encoder, encoderErr := typeEncoder(typ, ctx)
	if encoderErr != nil {
		return nil, encoderErr
	}
	if encoder == nil {
		return nil, fmt.Errorf("Error creating encoder")
	}
	encodingCtx := NewEncodingContext(keyCasing)
	err := encoder(val, encodingCtx)
	if err != nil {
		return nil, err
	}
	return encodingCtx.target, nil
}

func typeEncoder(t reflect.Type, context *CompileEncoderContext) (jsonEncoder, error) {
	if fi, ok := jsonEncoderCache.Load(t); ok {
		return fi.(jsonEncoder), nil
	}
	encoderFn, encoderFnErr := newTypeEncoder(t, context)
	if encoderFnErr != nil {
		return nil, encoderFnErr
	}
	jsonEncoderCache.Store(t, encoderFn)
	return encoderFn, nil
}

func newTypeEncoder(t reflect.Type, context *CompileEncoderContext) (jsonEncoder, error) {
	switch t.Kind() {
	case reflect.String:
		if len(context.enumValues) > 0 {
			return newEnumEncoder(t, context)
		}
		return stringEncoder, nil
	case reflect.Bool:
		return boolEncoder, nil
	case reflect.Float32:
		return float32Encoder, nil
	case reflect.Float64:
		return float64Encoder, nil
	case reflect.Int8:
		return int8Encoder, nil
	case reflect.Int16:
		return int16Encoder, nil
	case reflect.Int32:
		return int32Encoder, nil
	case reflect.Int64:
		return int64Encoder, nil
	case reflect.Int:
		return intEncoder, nil
	case reflect.Struct:
		if t.Name() == "Time" {
			return timestampEncoder, nil
		}
		return newStructEncoder(t, context)
	case reflect.Array, reflect.Slice:
		return newArrayEncoder(t, context)
	}
	return nil, nil
}

func stringEncoder(val reflect.Value, context *EncodingCtx) error {
	appendNormalizedString(&context.target, val.String())
	return nil
}

func boolEncoder(val reflect.Value, context *EncodingCtx) error {
	context.target = strconv.AppendBool(context.target, val.Bool())
	return nil
}

func timestampEncoder(val reflect.Value, context *EncodingCtx) error {
	output := val.Interface().(time.Time).Format("2006-01-02T15:04:05.000Z")
	context.target = appendString(context.target, output, false)
	return nil
}

func float32Encoder(val reflect.Value, context *EncodingCtx) error {
	context.target = append(context.target, strconv.FormatFloat(val.Float(), 'f', -1, 64)...)
	return nil
}

func float64Encoder(val reflect.Value, context *EncodingCtx) error {
	context.target = append(context.target, strconv.FormatFloat(val.Float(), 'f', -1, 64)...)
	return nil
}

func int8Encoder(val reflect.Value, context *EncodingCtx) error {
	context.target = strconv.AppendInt(context.target, val.Int(), 10)
	return nil
}

func int16Encoder(val reflect.Value, context *EncodingCtx) error {
	context.target = append(context.target, fmt.Sprint(val.Interface().(int16))...)
	return nil
}

func int32Encoder(val reflect.Value, context *EncodingCtx) error {
	context.target = append(context.target, fmt.Sprint(val.Interface().(int32))...)
	return nil
}

func int64Encoder(val reflect.Value, context *EncodingCtx) error {
	context.target = append(context.target, '"')
	context.target = append(context.target, fmt.Sprint(val.Int())...)
	context.target = append(context.target, '"')
	return nil
}

func intEncoder(val reflect.Value, context *EncodingCtx) error {
	context.target = append(context.target, '"')
	context.target = append(context.target, fmt.Sprint(val.Int())...)
	context.target = append(context.target, '"')
	return nil
}

func newEnumEncoder(t reflect.Type, context *CompileEncoderContext) (jsonEncoder, error) {
	enumVals := context.enumValues
	return func(val reflect.Value, context *EncodingCtx) error {
		strVal := val.String()
		for _, v := range enumVals {
			if v == strVal {
				context.target = append(context.target, '"')
				context.target = append(context.target, strVal...)
				context.target = append(context.target, '"')
				return nil
			}
		}
		return fmt.Errorf("error at %v expected one of the following enum values %+v", context.instancePath, enumVals)
	}, nil
}

func newArrayEncoder(t reflect.Type, context *CompileEncoderContext) (jsonEncoder, error) {
	currentDepth := context.currentDepth
	instancePath := context.instancePath
	schemaPath := context.schemaPath

	context.currentDepth++
	context.instancePath = context.instancePath + "/[element]"
	context.schemaPath = context.instancePath + "/elements"
	subType := t.Elem()
	subTypeEncoder, err := typeEncoder(subType, context)
	if err != nil {
		return nil, err
	}
	if subTypeEncoder == nil {
		return nil, fmt.Errorf("unable to make element encoder")
	}
	context.currentDepth = currentDepth
	context.instancePath = instancePath
	context.schemaPath = schemaPath
	return func(val reflect.Value, context *EncodingCtx) error {
		slice := val.Slice(0, val.Len())
		context.target = append(context.target, '[')
		for i := 0; i < slice.Len(); i++ {
			if i > 0 {
				context.target = append(context.target, ',')
			}
			subTypeEncoder(slice.Index(i), context)
		}
		context.target = append(context.target, ']')
		return nil
	}, nil
}

type structField struct {
	fieldIndex int
	encoder    jsonEncoder
}

func newStructEncoder(t reflect.Type, context *CompileEncoderContext) (jsonEncoder, error) {
	fields := []structField{}
	currentDepth := context.currentDepth
	instancePath := context.instancePath
	schemaPath := context.schemaPath
	context.currentDepth++
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		if !field.IsExported() {
			continue
		}
		fieldName := getSerialKey(field.Name, context)
		context.instancePath = context.instancePath + "/" + fieldName
		context.schemaPath = context.schemaPath + "/properties/" + fieldName
		e, err := typeEncoder(field.Type, context)
		if err != nil {
			return nil, err
		}
		if e == nil {
			continue
		}
		fields = append(
			fields,
			structField{fieldIndex: i, encoder: func(val reflect.Value, context *EncodingCtx) error {
				if context.hasKeys {
					context.target = append(context.target, ',')
				}
				context.target = append(context.target, "\""+fieldName+"\":"...)
				err := e(val, context)
				return err
			},
			},
		)
	}
	context.currentDepth = currentDepth
	context.instancePath = instancePath
	context.schemaPath = schemaPath
	return func(val reflect.Value, context *EncodingCtx) error {
		context.target = append(context.target, '{')
		context.hasKeys = false
		for _, field := range fields {
			err := field.encoder(val.Field(field.fieldIndex), context)
			if err == nil && !context.hasKeys {
				context.hasKeys = true
			}
		}
		context.target = append(context.target, '}')
		return nil
	}, nil
}
