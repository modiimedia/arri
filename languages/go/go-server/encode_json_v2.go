package arri

import (
	"fmt"
	"reflect"
	"sync"
	"time"
	"unsafe"
)

type ValueEncoder interface {
	Encode(ptr unsafe.Pointer, ctx *EncodingContext) error
}

var encodingCache sync.Map = sync.Map{}

func EncodeJSONV2(input any, options EncodingOptions) ([]byte, error) {
	ctx := NewEncodingContext(options)
	t := reflect.TypeOf(input)
	p := unsafe.Pointer(&input)
	existing, ok := encodingCache.Load(t)
	if existing != nil && ok {
		err := existing.(ValueEncoder).Encode(p, ctx)
		if err != nil {
			return nil, err
		}
		return ctx.Buffer, nil
	}
	encoder, err := createTypeEncoder(t, *ctx)
	if err != nil {
		return nil, err
	}
	encodingCache.Store(t, encoder)
	ctx = NewEncodingContext(options)
	err = encoder.Encode(p, ctx)
	if err != nil {
		return nil, err
	}
	return ctx.Buffer, nil
}

func createTypeEncoder(t reflect.Type, _ EncodingContext) (ValueEncoder, error) {
	switch t.Kind() {
	case reflect.String:
		return stringEncoder{}, nil
	case reflect.Int:
		return IntEncoder{}, nil
	case reflect.Uint:
		return uintEncoder{}, nil
	case reflect.Int8:
		return int8Encoder{}, nil
	case reflect.Uint8:
		return uint8Encoder{}, nil
	case reflect.Int16:
		return int16Encoder{}, nil
	case reflect.Uint16:
		return uint16Encoder{}, nil
	case reflect.Int32:
		return int32Encoder{}, nil
	case reflect.Uint32:
		return uint32Encoder{}, nil
	case reflect.Int64:
		return int64Encoder{}, nil
	case reflect.Uint64:
		return uint64Encoder{}, nil
	case reflect.Struct:
		if t.PkgPath() == "time" && t.Name() == "Time" {
			return timeEncoder{}, nil
		}
	}
	return nil, nil
}

type stringEncoder struct{}

func (e stringEncoder) Encode(ptr unsafe.Pointer, ctx *EncodingContext) error {
	str := *((*string)(ptr))
	AppendNormalizedStringV2(ctx.Buffer, str)
	return nil
}

//// NUMBERS ////

type IntEncoder struct{}

func (e IntEncoder) Encode(ptr unsafe.Pointer, ctx *EncodingContext) error {
	i := *((*int)(ptr))
	ctx.Buffer = append(ctx.Buffer, '"')
	ctx.Buffer = append(ctx.Buffer, fmt.Sprint(i)...)
	ctx.Buffer = append(ctx.Buffer, '"')
	return nil
}

type uintEncoder struct{}

func (e uintEncoder) Encode(ptr unsafe.Pointer, ctx *EncodingContext) error {
	i := *((*uint)(ptr))
	ctx.Buffer = append(ctx.Buffer, '"')
	ctx.Buffer = append(ctx.Buffer, fmt.Sprint(i)...)
	ctx.Buffer = append(ctx.Buffer, '"')
	return nil
}

type int8Encoder struct{}

func (e int8Encoder) Encode(ptr unsafe.Pointer, ctx *EncodingContext) error {
	i := *((*int8)(ptr))
	ctx.Buffer = append(ctx.Buffer, fmt.Sprint(i)...)
	return nil
}

type uint8Encoder struct{}

func (e uint8Encoder) Encode(ptr unsafe.Pointer, ctx *EncodingContext) error {
	i := *((*uint8)(ptr))
	ctx.Buffer = append(ctx.Buffer, fmt.Sprint(i)...)
	return nil
}

type int16Encoder struct{}

func (e int16Encoder) Encode(ptr unsafe.Pointer, cxt *EncodingContext) error {
	i := *((*int16)(ptr))
	cxt.Buffer = append(cxt.Buffer, fmt.Sprint(i)...)
	return nil
}

type uint16Encoder struct{}

func (e uint16Encoder) Encode(ptr unsafe.Pointer, ctx *EncodingContext) error {
	i := *((*uint16)(ptr))
	ctx.Buffer = append(ctx.Buffer, fmt.Sprint(i)...)
	return nil
}

type int32Encoder struct{}

func (e int32Encoder) Encode(ptr unsafe.Pointer, ctx *EncodingContext) error {
	i := *((*int32)(ptr))
	ctx.Buffer = append(ctx.Buffer, fmt.Sprint(i)...)
	return nil
}

type uint32Encoder struct{}

func (e uint32Encoder) Encode(ptr unsafe.Pointer, ctx *EncodingContext) error {
	i := *((*uint32)(ptr))
	ctx.Buffer = append(ctx.Buffer, fmt.Sprint(i)...)
	return nil
}

type int64Encoder struct{}

func (e int64Encoder) Encode(ptr unsafe.Pointer, ctx *EncodingContext) error {
	i := *((*int64)(ptr))
	ctx.Buffer = append(ctx.Buffer, '"')
	ctx.Buffer = append(ctx.Buffer, fmt.Sprint(i)...)
	ctx.Buffer = append(ctx.Buffer, '"')
	return nil
}

type uint64Encoder struct{}

func (e uint64Encoder) Encode(ptr unsafe.Pointer, ctx *EncodingContext) error {
	i := *((*uint64)(ptr))
	ctx.Buffer = append(ctx.Buffer, '"')
	ctx.Buffer = append(ctx.Buffer, fmt.Sprint(i)...)
	ctx.Buffer = append(ctx.Buffer, '"')
	return nil
}

// date time
type timeEncoder struct{}

func (e timeEncoder) Encode(ptr unsafe.Pointer, ctx *EncodingContext) error {
	t := *((*time.Time)(ptr))
	output := t.Format("2006-01-02T15:04:05.000Z")
	ctx.Buffer = appendString(ctx.Buffer, output, false)
	return nil
}
