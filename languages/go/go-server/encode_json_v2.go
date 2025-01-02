package arri

import (
	"fmt"
	"strconv"
	"strings"
	"sync"
	"time"
	"unsafe"

	ogreflect "reflect"

	"github.com/goccy/go-reflect"
	"github.com/iancoleman/strcase"
)

const startDetectingCyclesAfter = 1000

var encodeStatePool sync.Pool

type encoder func(*buffer, unsafe.Pointer) error

type EncodeState struct {
	Bytes        []byte
	SchemaPath   string
	InstancePath string
	CurrentDepth uint32
	MaxDepth     uint32
}

func NewEncodeState() *EncodeState {
	return &EncodeState{
		Bytes:        []byte{},
		SchemaPath:   "",
		InstancePath: "",
		CurrentDepth: 0,
		MaxDepth:     5000,
	}
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
	b     []byte
	depth uint32
}

type compileEncoderCtx struct {
	maxDepth           uint32
	discriminatorKey   string
	discriminatorValue string
	enumValues         []string
}

func newCompileEncoderCtx() *compileEncoderCtx {
	return &compileEncoderCtx{
		maxDepth:           1000,
		discriminatorKey:   "",
		discriminatorValue: "",
		enumValues:         []string{},
	}
}

func EncodeJSONV2(input any, options EncodingOptions) ([]byte, error) {
	typ, ptr := reflect.TypeAndPtrOf(input)
	typeID := reflect.TypeID(typ)
	buf := &buffer{b: []byte{}}
	// buf := bufpool.Get().(*buffer)
	// buf.b = buf.b[:0]
	// defer bufpool.Put(buf)
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
	enc, err := compileJSONEncoder(typ, compileEncoderCtx{})
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

func compileJSONEncoder(typ reflect.Type, ctx compileEncoderCtx) (encoder, error) {
	switch typ.Kind() {
	case reflect.String:
		return compileStringJSONEncoder(typ)
	case reflect.Bool:
		return compileBoolJSONEncoder(typ)
	case reflect.Float32:
		return compileFloat32JSONEncoder(typ)
	case reflect.Float64:
		return compileFloat64JSONEncoder(typ)
	case reflect.Int8:
		return compileInt8JSONEncoder(typ)
	case reflect.Uint8:
		return compileUint8JSONEncoder(typ)
	case reflect.Int16:
		return compileInt16JSONEncoder(typ)
	case reflect.Uint16:
		return compileUint16JSONEncoder(typ)
	case reflect.Int32:
		return compileInt32JSONEncoder(typ)
	case reflect.Uint32:
		return compileUint32JSONEncoder(typ)
	case reflect.Int:
		return compileIntJSONEncoder(typ)
	case reflect.Int64:
		return compileInt64JSONEncoder(typ)
	case reflect.Uint:
		return compileUintJSONEncoder(typ)
	case reflect.Uint64:
		return compileUint64JSONEncoder(typ)
	case reflect.Struct:
		if typ.Name() == "Time" {
			return compileDateTimeJSONEncoder(typ, ctx)
		}
		if isDiscriminatorStructV2(typ, ctx) {
			return compileDiscriminatorJSONEncoder(typ, ctx)
		}
		return compileStructJSONEncoder(typ, ctx)
	case reflect.Slice:
		return compileSliceJSONEncoder(typ, ctx)
	case reflect.Array:
		return compileArrayJSONEncoder(typ, ctx)
	case reflect.Map:
		return compileMapJSONEncoder(typ, ctx)
	case reflect.Ptr:
		return compilePtrJSONEncoder(typ, ctx)
	case reflect.Interface:
		return compileAnyJSONEncoder(typ, ctx)
	}
	return nil, fmt.Errorf("unsupported type: %+v", typ)
}

func compileDateTimeJSONEncoder(_ reflect.Type, ctx compileEncoderCtx) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*time.Time)(p)
		output := value.Format("2006-01-02T15:04:05.000Z")
		buf.b = append(buf.b, '"')
		buf.b = append(buf.b, output...)
		buf.b = append(buf.b, '"')
		return nil
	}, nil
}

func compileStringJSONEncoder(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*string)(p)
		buf.b = AppendNormalizedStringV2(buf.b, value)
		return nil
	}, nil
}

func compileFloat32JSONEncoder(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*float32)(p)
		buf.b = append(buf.b, strconv.FormatFloat(float64(value), 'f', -1, 64)...)
		return nil
	}, nil
}

func compileFloat64JSONEncoder(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*float64)(p)
		buf.b = append(buf.b, strconv.FormatFloat(value, 'f', -1, 64)...)
		return nil
	}, nil
}

func compileInt8JSONEncoder(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*int8)(p)
		buf.b = strconv.AppendInt(buf.b, int64(value), 10)
		return nil
	}, nil
}

func compileUint8JSONEncoder(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*uint8)(p)
		buf.b = strconv.AppendUint(buf.b, uint64(value), 10)
		return nil
	}, nil
}

func compileInt16JSONEncoder(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*int16)(p)
		buf.b = strconv.AppendInt(buf.b, int64(value), 10)
		return nil
	}, nil
}

func compileUint16JSONEncoder(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*int16)(p)
		buf.b = strconv.AppendUint(buf.b, uint64(value), 10)
		return nil
	}, nil
}

func compileInt32JSONEncoder(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*int32)(p)
		buf.b = strconv.AppendInt(buf.b, int64(value), 10)
		return nil
	}, nil
}

func compileUint32JSONEncoder(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*int32)(p)
		buf.b = strconv.AppendUint(buf.b, uint64(value), 10)
		return nil
	}, nil
}

func compileIntJSONEncoder(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*int)(p)
		buf.b = append(buf.b, '"')
		buf.b = strconv.AppendInt(buf.b, int64(value), 10)
		buf.b = append(buf.b, '"')
		return nil
	}, nil
}

func compileUintJSONEncoder(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*uint)(p)
		buf.b = append(buf.b, '"')
		buf.b = strconv.AppendUint(buf.b, uint64(value), 10)
		buf.b = append(buf.b, '"')
		return nil
	}, nil
}

func compileInt64JSONEncoder(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*int64)(p)
		buf.b = append(buf.b, '"')
		buf.b = strconv.AppendInt(buf.b, value, 10)
		buf.b = append(buf.b, '"')
		return nil
	}, nil
}

func compileUint64JSONEncoder(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*uint64)(p)
		buf.b = append(buf.b, '"')
		buf.b = strconv.AppendUint(buf.b, value, 10)
		buf.b = append(buf.b, '"')
		return nil
	}, nil
}

func compileBoolJSONEncoder(_ reflect.Type) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		value := *(*bool)(p)
		buf.b = strconv.AppendBool(buf.b, value)
		return nil
	}, nil
}

func compileStructJSONEncoder(typ reflect.Type, ctx compileEncoderCtx) (encoder, error) {
	encoders := []encoder{}
	hasDiscriminator := len(ctx.discriminatorKey) > 0 && len(ctx.discriminatorValue) > 0
	for i := 0; i < typ.NumField(); i++ {
		field := typ.Field(i)
		enc, err := compileJSONEncoder(field.Type, ctx)
		if err != nil {
			return nil, err
		}
		offset := field.Offset
		encoders = append(encoders, func(buf *buffer, p unsafe.Pointer) error {
			if hasDiscriminator {
				buf.b = append(buf.b, "\""+ctx.discriminatorKey+"\":\""+ctx.discriminatorValue+"\""...)
			}
			if hasDiscriminator || i > 0 {
				buf.b = append(buf.b, ',')
			}
			buf.b = append(buf.b, '"')
			buf.b = append(buf.b, strcase.ToLowerCamel(field.Name)...)
			buf.b = append(buf.b, '"')
			buf.b = append(buf.b, ':')
			innerPtr := unsafe.Pointer(uintptr(p) + offset)
			return enc(buf, innerPtr)
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

func compileSliceJSONEncoder(typ reflect.Type, ctx compileEncoderCtx) (encoder, error) {
	el := typ.Elem()
	elEncoder, err := compileJSONEncoder(el, ctx)
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

func compileArrayJSONEncoder(typ reflect.Type, ctx compileEncoderCtx) (encoder, error) {
	el := typ.Elem()
	elEncoder, err := compileJSONEncoder(el, ctx)
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
			err := elEncoder(buf, unsafe.Add(p, uintptr(i)*size))
			if err != nil {
				return err
			}
		}
		buf.b = append(buf.b, ']')
		return nil
	}, nil
}

func compileMapJSONEncoder(typ reflect.Type, ctx compileEncoderCtx) (encoder, error) {
	if typ.Key().Kind() != reflect.String {
		return nil, fmt.Errorf("only string keys are supported in maps")
	}
	el := typ.Elem()
	elEncoder, err := compileJSONEncoder(el, ctx)
	if err != nil {
		return nil, err
	}
	return func(buf *buffer, p unsafe.Pointer) error {
		val := *(*map[string]any)(p)
		if val == nil {
			buf.b = append(buf.b, '{')
			buf.b = append(buf.b, '}')
			return nil
		}
		buf.b = append(buf.b, '{')
		hasKeys := false
		for k, v := range val {
			if hasKeys {
				buf.b = append(buf.b, ',')
			}
			buf.b = AppendNormalizedStringV2(buf.b, k)
			buf.b = append(buf.b, ':')
			innerPtr := unsafe.Pointer(&v)
			err := elEncoder(buf, innerPtr)
			if err != nil {
				return err
			}
			hasKeys = true
		}

		buf.b = append(buf.b, '}')
		return nil
	}, nil
}

func compilePtrJSONEncoder(typ reflect.Type, ctx compileEncoderCtx) (encoder, error) {
	el := typ.Elem()
	elEncoder, err := compileJSONEncoder(el, ctx)
	if err != nil {
		return nil, err
	}

	return func(buf *buffer, p unsafe.Pointer) error {
		val := *(**any)(p)
		if val == nil {
			buf.b = append(buf.b, "null"...)
			return nil
		}
		innerPtr := unsafe.Pointer(val)
		err := elEncoder(buf, innerPtr)
		if err != nil {
			return err
		}
		return nil
	}, nil
}

func compileAnyJSONEncoder(_ reflect.Type, ctx compileEncoderCtx) (encoder, error) {
	return func(buf *buffer, p unsafe.Pointer) error {
		// return nil
		val := (*any)(p)
		// fmt.Println("VAL", val)
		v := ogreflect.ValueOf(val)
		encodeValueToJSON(v, &EncodingContext{Buffer: buf.b, KeyCasing: KeyCasingCamelCase})
		return nil
	}, nil
}

func compileDiscriminatorJSONEncoder(typ reflect.Type, ctx compileEncoderCtx) (encoder, error) {
	discriminatorKey := "type"
	encoders := []encoder{}
	offsetsToCheck := []uintptr{}
	fallbackSet := false
	fallback := buffer{b: []byte{}}
	for i := 0; i < typ.NumField(); i++ {
		field := typ.Field(i)
		if field.Name == "DiscriminatorKey" {
			keyName := field.Tag.Get("discriminatorKey")
			if len(keyName) > 0 {
				discriminatorKey = keyName
			}
			continue
		}
		discriminatorValue := strings.TrimSpace(field.Tag.Get("discriminator"))
		ctx.discriminatorKey = discriminatorKey
		ctx.discriminatorValue = discriminatorValue
		enc, err := compileJSONEncoder(field.Type.Elem(), ctx)
		if err != nil {
			return nil, err
		}
		if !fallbackSet {
			// 	fallbackValue := reflect.Zero(field.Type.Elem()).Interface()
			// 	fmt.Println("FALLBACK_VAL", fallbackValue)
			// 	fmt.Println("FALLBACK_ADDR", &fallbackValue)
			// 	err := enc(&fallback, unsafe.Pointer(&fallbackValue))
			// 	if err != nil {
			// 		return nil, err
			// 	}
			// 	fallbackSet = true
		}
		offset := field.Offset
		offsetsToCheck = append(offsetsToCheck, offset)
		encoders = append(encoders, enc)
		ctx.discriminatorKey = ""
		ctx.discriminatorValue = ""
	}
	return func(buf *buffer, p unsafe.Pointer) error {
		innerPtr, enc := getDiscriminatorEncoder(p, encoders, offsetsToCheck)
		if innerPtr == nil && enc == nil {
			buf.b = append(buf.b, fallback.b...)
			return nil
		}
		return enc(buf, innerPtr)
	}, nil
}

func getDiscriminatorEncoder(p unsafe.Pointer, encoders []encoder, offsetsToCheck []uintptr) (unsafe.Pointer, encoder) {
	for i := 0; i < len(offsetsToCheck); i++ {
		offset := offsetsToCheck[i]
		innerPtr := unsafe.Pointer(uintptr(p) + offset)
		if innerPtr != nil {
			return innerPtr, encoders[i]
		}
	}
	panic("invalid discriminator")
}

func isDiscriminatorStructV2(typ reflect.Type, ctx compileEncoderCtx) bool {
	kind := typ.Kind()
	if kind != reflect.Struct {
		return false
	}
	fieldLen := typ.NumField()
	for i := 0; i < fieldLen; i++ {
		field := typ.Field(i)
		if field.Name == "DiscriminatorKey" {
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