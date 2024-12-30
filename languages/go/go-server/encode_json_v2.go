package arri

import (
	"bytes"
	"fmt"
	"strconv"
	"sync"
	"time"
	"unsafe"

	ogreflect "reflect"

	"github.com/goccy/go-reflect"
	"github.com/iancoleman/strcase"
)

type EncodingV2State struct {
	bytes.Buffer

	ptrLevel uint
	ptrSeen  map[any]struct{}
}

const startDetectingCyclesAfter = 1000

var encodeStatePool sync.Pool

type encoder func(*buffer, unsafe.Pointer) error

func newEncodeSate() *EncodingV2State {
	if v := encodeStatePool.Get(); v != nil {
		e := v.(*EncodingV2State)
		e.Reset()
		if len(e.ptrSeen) > 0 {
			panic("ptrEncoder.encode should have emptied ptrSeen via defers")
		}
		e.ptrLevel = 0
		return e
	}
	return &EncodingV2State{ptrSeen: map[any]struct{}{}}
}

var (
	typeToEncoderMap sync.Map
	bufpool          = sync.Pool{
		New: func() interface{} {
			return &buffer{
				b: make([]byte, 0, 1024),
			}
		},
	}
)

type buffer struct {
	b []byte
}

func EncodeJSONV2(input any, options EncodingOptions) ([]byte, error) {
	typ, ptr := reflect.TypeAndPtrOf(input)
	typeID := reflect.TypeID(typ)

	buf := bufpool.Get().(*buffer)
	buf.b = buf.b[:0]
	defer bufpool.Put(buf)
	if enc, ok := typeToEncoderMap.Load(typeID); ok {
		if err := enc.(encoder)(buf, ptr); err != nil {
			return nil, err
		}

		// allocate a new buffer required length only
		b := make([]byte, len(buf.b))
		copy(b, buf.b)
		return b, nil
	}

	// First time,
	// builds a optimized path by type and caches it with typeID.
	enc, err := compile(typ)
	if err != nil {
		return nil, err
	}
	typeToEncoderMap.Store(typeID, enc)
	if err := enc(buf, ptr); err != nil {
		return nil, err
	}

	// allocate a new buffer required length only
	b := make([]byte, len(buf.b))
	copy(b, buf.b)
	return b, nil
}

func compile(typ reflect.Type) (encoder, error) {
	switch typ.Kind() {

	case reflect.String:
		return compileString(typ)
	case reflect.Bool:
		return compileBool(typ)
	case reflect.Float32:
		return compileFloat32(typ)
	case reflect.Float64:
		return compileFloat64(typ)
	case reflect.Int8:
		return compileInt8(typ)
	case reflect.Uint8:
		return compileUint8(typ)
	case reflect.Int16:
		return compileInt16(typ)
	case reflect.Uint16:
		return compileUint16(typ)
	case reflect.Int32:
		return compileInt32(typ)
	case reflect.Uint32:
		return compileUint32(typ)
	case reflect.Int:
		return compileInt(typ)
	case reflect.Int64:
		return compileInt64(typ)
	case reflect.Uint:
		return compileUint(typ)
	case reflect.Uint64:
		return compileUint64(typ)
	case reflect.Struct:
		if typ.Name() == "Time" {
			return compileDateTime(typ)
		}
		return compileStruct(typ)
	case reflect.Slice:
		return compileSlice(typ)
	case reflect.Array:
		return compileArray(typ)
	case reflect.Map:
		return compileMap(typ)
	case reflect.Ptr:
		return compilePtr(typ)
	case reflect.Interface:
		return compileAny(typ)
	}
	return nil, fmt.Errorf("unsupported type: %+v", typ)
}

func compileDateTime(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*time.Time)(p)
		output := value.Format("2006-01-02T15:04:05.000Z")
		buf.b = append(buf.b, '"')
		buf.b = append(buf.b, output...)
		buf.b = append(buf.b, '"')
		return nil
	}, nil
}

func compileString(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*string)(p)
		buf.b = AppendNormalizedStringV2(buf.b, value)
		return nil
	}, nil
}

func compileFloat32(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*float32)(p)
		buf.b = append(buf.b, strconv.FormatFloat(float64(value), 'f', -1, 64)...)
		return nil
	}, nil
}

func compileFloat64(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*float64)(p)
		buf.b = append(buf.b, strconv.FormatFloat(value, 'f', -1, 64)...)
		return nil
	}, nil
}

func compileInt8(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*int8)(p)
		buf.b = strconv.AppendInt(buf.b, int64(value), 10)
		return nil
	}, nil
}

func compileUint8(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*uint8)(p)
		buf.b = strconv.AppendUint(buf.b, uint64(value), 10)
		return nil
	}, nil
}

func compileInt16(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*int16)(p)
		buf.b = strconv.AppendInt(buf.b, int64(value), 10)
		return nil
	}, nil
}

func compileUint16(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*int16)(p)
		buf.b = strconv.AppendUint(buf.b, uint64(value), 10)
		return nil
	}, nil
}

func compileInt32(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*int32)(p)
		buf.b = strconv.AppendInt(buf.b, int64(value), 10)
		return nil
	}, nil
}

func compileUint32(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*int32)(p)
		buf.b = strconv.AppendUint(buf.b, uint64(value), 10)
		return nil
	}, nil
}

func compileInt(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*int)(p)
		buf.b = append(buf.b, '"')
		buf.b = strconv.AppendInt(buf.b, int64(value), 10)
		buf.b = append(buf.b, '"')
		return nil
	}, nil
}

func compileUint(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*uint)(p)
		buf.b = append(buf.b, '"')
		buf.b = strconv.AppendUint(buf.b, uint64(value), 10)
		buf.b = append(buf.b, '"')
		return nil
	}, nil
}

func compileInt64(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*int64)(p)
		buf.b = append(buf.b, '"')
		buf.b = strconv.AppendInt(buf.b, value, 10)
		buf.b = append(buf.b, '"')
		return nil
	}, nil
}

func compileUint64(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*uint64)(p)
		buf.b = append(buf.b, '"')
		buf.b = strconv.AppendUint(buf.b, value, 10)
		buf.b = append(buf.b, '"')
		return nil
	}, nil
}

func compileBool(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*bool)(p)
		buf.b = strconv.AppendBool(buf.b, value)
		return nil
	}, nil
}

func compileStruct(typ reflect.Type) (encoder, error) {
	encoders := []encoder{}
	for i := 0; i < typ.NumField(); i++ {
		field := typ.Field(i)
		enc, err := compile(field.Type)
		if err != nil {
			return nil, err
		}
		offset := field.Offset
		encoders = append(encoders, func(buf *buffer, p unsafe.Pointer) error {
			if i > 0 {
				buf.b = append(buf.b, ',')
			}
			buf.b = append(buf.b, '"')
			buf.b = append(buf.b, strcase.ToLowerCamel(field.Name)...)
			buf.b = append(buf.b, '"')
			buf.b = append(buf.b, ':')
			return enc(buf, unsafe.Pointer(uintptr(p)+offset))
		})
	}
	return func(buf *buffer, p unsafe.Pointer) error {
		buf.b = append(buf.b, '{')
		for _, enc := range encoders {
			if err := enc(buf, p); err != nil {
				return err
			}
		}
		buf.b = append(buf.b, '}')
		return nil
	}, nil
}

func compileSlice(typ reflect.Type) (encoder, error) {
	el := typ.Elem()
	_, err := compile(el)
	if err != nil {
		return nil, err
	}
	return func(buf *buffer, p unsafe.Pointer) error {
		val := *(*[]any)(p)
		_ = unsafe.Sizeof(p)
		buf.b = append(buf.b, '[')
		for i := 0; i < len(val); i++ {
			if i > 0 {
				buf.b = append(buf.b, ',')
			}
			// elEncoder(buf, unsafe.Add(p, uintptr(i)*size))
		}
		buf.b = append(buf.b, ']')
		return nil
	}, nil
}

func compileArray(typ reflect.Type) (encoder, error) {
	el := typ.Elem()
	elEncoder, err := compile(el)
	if err != nil {
		return nil, err
	}
	return func(buf *buffer, p unsafe.Pointer) error {
		val := *(*[]any)(p)
		size := unsafe.Sizeof(p)
		buf.b = append(buf.b, '[')
		for i := 0; i < len(val); i++ {
			if i > 0 {
				buf.b = append(buf.b, ',')
			}
			elEncoder(buf, unsafe.Add(p, uintptr(i)*size))
		}
		buf.b = append(buf.b, ']')
		return nil
	}, nil
}

func compileMap(typ reflect.Type) (encoder, error) {
	if typ.Key().Kind() != reflect.String {
		return nil, fmt.Errorf("only string keys are supported in maps")
	}
	el := typ.Elem()
	_, err := compile(el)
	if err != nil {
		return nil, err
	}
	return func(buf *buffer, p unsafe.Pointer) error {
		val := *(*map[string]any)(p)
		size := unsafe.Sizeof(p)
		if val == nil {
			buf.b = append(buf.b, '{')
			buf.b = append(buf.b, '}')
			return nil
		}
		buf.b = append(buf.b, '{')
		for i := 0; i < len(val); i++ {
			_ = unsafe.Add(p, uintptr(i)*size)
			// fmt.Println(innerPtr, *(*string)(innerPtr))
		}
		buf.b = append(buf.b, '}')
		return nil
	}, nil
}

func compilePtr(typ reflect.Type) (encoder, error) {
	el := typ.Elem()
	_, err := compile(el)
	if err != nil {
		return nil, err
	}
	return func(buf *buffer, p unsafe.Pointer) error {
		// fmt.Println("POINTER", p)
		return nil
	}, nil
}

func compileAny(_ reflect.Type) (encoder, error) {
	return func(b *buffer, p unsafe.Pointer) error {
		return nil
		val := (*any)(p)
		// fmt.Println("VAL", val)
		v := ogreflect.ValueOf(val)
		encodeValueToJSON(v, &EncodingContext{Buffer: b.b, KeyCasing: KeyCasingCamelCase})
		return nil
	}, nil
}
