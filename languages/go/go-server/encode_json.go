package arri

import (
	"encoding/json"
	"errors"
	"fmt"
	"math/bits"
	"reflect"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode/utf8"
	"unsafe"
)

type compileEncoderCtx struct {
	keyCasing          KeyCasing
	enumValues         []string
	maxDepth           uint32
	currentDepth       uint32
	instancePath       string
	schemaPath         string
	discriminatorKey   string
	discriminatorValue string
	parentStructs      map[string]bool
}

func newCompileEncoderCtx(keyCasing KeyCasing) *compileEncoderCtx {
	return &compileEncoderCtx{
		keyCasing:          keyCasing,
		enumValues:         []string{},
		maxDepth:           10000,
		currentDepth:       0,
		instancePath:       "",
		schemaPath:         "",
		discriminatorKey:   "",
		discriminatorValue: "",
		parentStructs:      map[string]bool{},
	}
}

func (c compileEncoderCtx) copyWith(
	currentDepth Option[uint32],
	enumValues Option[[]string],
	instancePath Option[string],
	schemaPath Option[string],
	discriminatorKey Option[string],
	discriminatorValue Option[string],
) compileEncoderCtx {
	return compileEncoderCtx{
		keyCasing:          c.keyCasing,
		maxDepth:           c.maxDepth,
		currentDepth:       currentDepth.UnwrapOr(c.currentDepth),
		enumValues:         enumValues.UnwrapOr(c.enumValues),
		instancePath:       instancePath.UnwrapOr(c.instancePath),
		schemaPath:         schemaPath.UnwrapOr(c.schemaPath),
		discriminatorKey:   discriminatorKey.UnwrapOr(c.discriminatorKey),
		discriminatorValue: discriminatorValue.UnwrapOr(c.discriminatorValue),
	}
}

type encodingCtx struct {
	buffer       []byte
	instancePath string
	schemaPath   string
	currentDepth uint32
	hasKeys      bool
}

func newEncodingCtx() *encodingCtx {
	return &encodingCtx{
		buffer:       []byte{},
		instancePath: "",
		schemaPath:   "",
		hasKeys:      false,
	}
}

var jsonEncoderCache sync.Map = sync.Map{} // map[reflect.Type]jsonEncoder

type jsonEncoder = func(val reflect.Value, context *encodingCtx) error

func EncodeJSON(input interface{}, keyCasing KeyCasing) ([]byte, error) {
	ctx := newCompileEncoderCtx(keyCasing)
	val := reflect.ValueOf(input)
	typ := val.Type()
	encoder, encoderErr := typeEncoder(typ, ctx)
	if encoderErr != nil {
		return nil, encoderErr
	}
	if encoder == nil {
		return nil, fmt.Errorf("Error creating encoder")
	}
	encodingCtx := newEncodingCtx()
	err := encoder(val, encodingCtx)
	if err != nil {
		return nil, err
	}
	return encodingCtx.buffer, nil
}

func typeEncoder(t reflect.Type, context *compileEncoderCtx) (jsonEncoder, error) {
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

func newTypeEncoder(t reflect.Type, context *compileEncoderCtx) (jsonEncoder, error) {
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
	case reflect.Int8, reflect.Int16, reflect.Int32:
		return smallIntEncoder, nil
	case reflect.Int64, reflect.Int:
		return largeIntEncoder, nil
	case reflect.Uint8, reflect.Uint16, reflect.Uint32:
		return smallUintEncoder, nil
	case reflect.Uint64, reflect.Uint:
		return largeUintEncoder, nil
	case reflect.Struct:
		if t.Name() == "Time" {
			return timestampEncoder, nil
		}
		if isOptionalType(t) {
			return newOptionEncoder(t, context)
		}
		if isNullableType(t) {
			return newNullableEncoder(t, context)
		}
		if isDiscriminatorStruct(t) {
			return newDiscriminatorEncoder(t, context)
		}
		return newStructEncoder(t, context)
	case reflect.Array, reflect.Slice:
		return newArrayEncoder(t, context)
	case reflect.Map:
		return newMapEncoder(t, context)
	case reflect.Ptr, reflect.UnsafePointer:
		return newPtrEncoder(t, context)
	}
	return func(val reflect.Value, context *encodingCtx) error {
		result, err := json.Marshal(val.Interface())
		if err != nil {
			return err
		}
		context.buffer = append(context.buffer, result...)
		return nil
	}, nil
}

func newPtrEncoder(t reflect.Type, context *compileEncoderCtx) (jsonEncoder, error) {
	innerT := t.Elem()
	innerEncoder, innerEncoderErr := typeEncoder(innerT, context)
	if innerEncoderErr != nil {
		return nil, innerEncoderErr
	}
	if innerEncoder == nil {
		return nil, nil
	}
	return func(val reflect.Value, context *encodingCtx) error {
		if val.IsNil() {
			context.buffer = append(context.buffer, "null"...)
			return nil
		}
		return innerEncoder(val.Elem(), context)
	}, nil
}

func stringEncoder(val reflect.Value, context *encodingCtx) error {
	appendNormalizedString(&context.buffer, val.String())
	return nil
}

func boolEncoder(val reflect.Value, context *encodingCtx) error {
	context.buffer = strconv.AppendBool(context.buffer, val.Bool())
	return nil
}

func timestampEncoder(val reflect.Value, context *encodingCtx) error {
	output := val.Interface().(time.Time).Format("2006-01-02T15:04:05.000Z")
	context.buffer = appendString(context.buffer, output, false)
	return nil
}

func float32Encoder(val reflect.Value, context *encodingCtx) error {
	context.buffer = append(context.buffer, strconv.FormatFloat(val.Float(), 'f', -1, 64)...)
	return nil
}

func float64Encoder(val reflect.Value, context *encodingCtx) error {
	context.buffer = append(context.buffer, strconv.FormatFloat(val.Float(), 'f', -1, 64)...)
	return nil
}

func smallIntEncoder(val reflect.Value, context *encodingCtx) error {
	context.buffer = strconv.AppendInt(context.buffer, val.Int(), 10)
	return nil
}

func largeIntEncoder(val reflect.Value, context *encodingCtx) error {
	context.buffer = append(context.buffer, '"')
	context.buffer = append(context.buffer, fmt.Sprint(val.Int())...)
	context.buffer = append(context.buffer, '"')
	return nil
}

func smallUintEncoder(val reflect.Value, context *encodingCtx) error {
	context.buffer = strconv.AppendUint(context.buffer, val.Uint(), 10)
	return nil
}

func largeUintEncoder(val reflect.Value, context *encodingCtx) error {
	context.buffer = append(context.buffer, '"')
	context.buffer = append(context.buffer, fmt.Sprint(val.Uint())...)
	context.buffer = append(context.buffer, '"')
	return nil
}

func newEnumEncoder(t reflect.Type, context *compileEncoderCtx) (jsonEncoder, error) {
	enumVals := context.enumValues
	return func(val reflect.Value, context *encodingCtx) error {
		strVal := val.String()
		for _, v := range enumVals {
			if v == strVal {
				context.buffer = append(context.buffer, '"')
				context.buffer = append(context.buffer, strVal...)
				context.buffer = append(context.buffer, '"')
				return nil
			}
		}
		return fmt.Errorf("error at %v expected one of the following enum values %+v", context.instancePath, enumVals)
	}, nil
}

func newArrayEncoder(t reflect.Type, context *compileEncoderCtx) (jsonEncoder, error) {
	if strings.HasPrefix(t.Elem().Name(), "OrderedMapEntry[") {
		return newOrderedMapEntryToJsonEncoder(t, context)
	}
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
	context.currentDepth--
	context.instancePath = instancePath
	context.schemaPath = schemaPath
	return func(val reflect.Value, context *encodingCtx) error {
		slice := val.Slice(0, val.Len())
		context.currentDepth++
		context.buffer = append(context.buffer, '[')
		for i := 0; i < slice.Len(); i++ {
			if i > 0 {
				context.buffer = append(context.buffer, ',')
			}
			subTypeEncoder(slice.Index(i), context)
		}
		context.buffer = append(context.buffer, ']')
		context.currentDepth--
		return nil
	}, nil
}

type structField struct {
	fieldIndex int
	encoder    jsonEncoder
}

func newStructEncoder(t reflect.Type, context *compileEncoderCtx) (jsonEncoder, error) {
	structName := t.Name()
	if len(structName) > 0 {
		isRecursiveLoop, hasRecursiveLoopKey := context.parentStructs[structName]
		if hasRecursiveLoopKey && isRecursiveLoop {
			return func(val reflect.Value, context *encodingCtx) error {
				if fi, ok := jsonEncoderCache.Load(t); ok {
					return fi.(jsonEncoder)(val, context)
				}
				return fmt.Errorf("unable to initialize encoder")
			}, nil
		}
	}
	fields := []structField{}
	instancePath := context.instancePath
	if len(structName) > 0 {
		context.parentStructs[structName] = true
	}
	schemaPath := context.schemaPath
	discriminatorKey := context.discriminatorKey
	discriminatorValue := context.discriminatorValue
	context.discriminatorKey = ""
	context.discriminatorValue = ""
	isDiscriminatorSubType := len(discriminatorKey) > 0
	context.currentDepth++
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		if !field.IsExported() {
			continue
		}
		fieldName := getSerialKey(&field, context.keyCasing)
		context.instancePath = context.instancePath + "/" + fieldName
		if isOptionalType(field.Type) {
			context.schemaPath = "/optionalProperties/" + fieldName
			e, err := typeEncoder(field.Type, context)
			if err != nil {
				return nil, err
			}
			if e == nil {
				continue
			}
			fields = append(
				fields,
				structField{
					fieldIndex: i,
					encoder: func(val reflect.Value, context *encodingCtx) error {
						if !optionalHasValue(&val) {
							return nil
						}
						if context.hasKeys {
							context.buffer = append(context.buffer, ',')
						}
						context.buffer = append(context.buffer, "\""+fieldName+"\":"...)
						err := e(val, context)
						if err == nil && !context.hasKeys {
							context.hasKeys = true
						}
						return err
					},
				},
			)
			continue
		}
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
			structField{fieldIndex: i, encoder: func(val reflect.Value, context *encodingCtx) error {
				if context.hasKeys {
					context.buffer = append(context.buffer, ',')
				}
				context.buffer = append(context.buffer, "\""+fieldName+"\":"...)
				err := e(val, context)
				if err == nil && !context.hasKeys {
					context.hasKeys = true
				}
				return err
			},
			},
		)
	}
	context.currentDepth--
	context.instancePath = instancePath
	context.schemaPath = schemaPath
	if len(structName) > 0 {
		delete(context.parentStructs, structName)
	}
	return func(val reflect.Value, context *encodingCtx) error {
		context.buffer = append(context.buffer, '{')
		context.hasKeys = isDiscriminatorSubType
		if isDiscriminatorSubType {
			context.buffer = append(context.buffer, "\""+discriminatorKey+"\":\""+discriminatorValue+"\""...)
		}
		context.currentDepth++
		for _, field := range fields {
			err := field.encoder(val.Field(field.fieldIndex), context)
			if err != nil {
				return err
			}
		}
		context.currentDepth--
		context.buffer = append(context.buffer, '}')
		return nil
	}, nil
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

func newDiscriminatorEncoder(t reflect.Type, context *compileEncoderCtx) (jsonEncoder, error) {
	isRecursiveLoop, hasRecursiveLoopKey := context.parentStructs[t.Name()]
	if hasRecursiveLoopKey && isRecursiveLoop {
		return func(val reflect.Value, context *encodingCtx) error {
			if fi, ok := jsonEncoderCache.Load(t); ok {
				return fi.(jsonEncoder)(val, context)
			}
			return fmt.Errorf("unabled to initialize encoder")
		}, nil
	}
	discriminatorKey := "type"
	schemaPath := context.schemaPath
	targetFields := []int{}
	encoders := map[int]jsonEncoder{}
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		discriminatorKeyTag := field.Tag.Get("discriminatorKey")
		if len(discriminatorKeyTag) > 0 {
			discriminatorKey = discriminatorKeyTag
			continue
		}
		discriminatorValue := field.Tag.Get("discriminator")
		context.schemaPath = schemaPath + "/mapping/" + discriminatorValue
		context.discriminatorKey = discriminatorKey
		context.discriminatorValue = discriminatorValue
		innerEncoder, err := typeEncoder(field.Type.Elem(), context)
		if err != nil {
			return nil, err
		}
		if innerEncoder == nil {
			continue
		}
		encoders[i] = innerEncoder
		targetFields = append(targetFields, i)
	}
	context.schemaPath = schemaPath
	context.discriminatorKey = ""
	context.discriminatorValue = ""
	return func(val reflect.Value, context *encodingCtx) error {
		for i := 0; i < len(targetFields); i++ {
			fieldIndex := targetFields[i]
			field := val.Field(fieldIndex)
			if field.IsNil() {
				continue
			}
			return encoders[fieldIndex](field.Elem(), context)
		}
		return fmt.Errorf("error encoding at %v. all discriminator subtypes are nil", context.instancePath)
	}, nil
}

func newOptionEncoder(t reflect.Type, context *compileEncoderCtx) (jsonEncoder, error) {
	innerValue := t.Field(0)
	innerValueEncoder, innerValueEncoderError := typeEncoder(innerValue.Type, context)
	if innerValueEncoderError != nil {
		return nil, innerValueEncoderError
	}
	if innerValueEncoder == nil {
		return nil, nil
	}
	return func(val reflect.Value, context *encodingCtx) error {
		unwrapped := val.Field(0)
		return innerValueEncoder(unwrapped, context)
	}, nil
}

func newNullableEncoder(t reflect.Type, context *compileEncoderCtx) (jsonEncoder, error) {
	innerVal := t.Field(0)
	innerValEncoder, innerValEncoderErr := typeEncoder(innerVal.Type, context)
	if innerValEncoderErr != nil {
		return nil, innerValEncoderErr
	}
	if innerValEncoder == nil {
		return nil, nil
	}
	return func(val reflect.Value, context *encodingCtx) error {
		if !nullableHasValue(&val) {
			context.buffer = append(context.buffer, "null"...)
			return nil
		}
		return innerValEncoder(val.Field(0), context)
	}, nil
}

func newMapEncoder(t reflect.Type, context *compileEncoderCtx) (jsonEncoder, error) {
	instancePath := context.instancePath
	schemaPath := context.schemaPath
	innerT := t.Elem()
	context.instancePath = instancePath + "/[key]"
	context.schemaPath = schemaPath + "/values"
	innerEncoder, innerEncoderErr := typeEncoder(innerT, context)
	if innerEncoderErr != nil {
		return nil, innerEncoderErr
	}
	if innerEncoder == nil {
		return nil, nil
	}
	return func(val reflect.Value, context *encodingCtx) error {
		instancePath := context.instancePath
		context.buffer = append(context.buffer, '{')
		keys := map[string]reflect.Value{}
		keyVals := []string{}
		for _, key := range val.MapKeys() {
			keyName := key.String()
			keys[keyName] = key
			keyVals = append(keyVals, keyName)
		}
		sort.Strings(keyVals)
		for i, keyName := range keyVals {
			key := keys[keyName]
			context.instancePath = context.instancePath + "/" + key.String()
			if i > 0 {
				context.buffer = append(context.buffer, ',')
			}
			context.buffer = append(context.buffer, "\""+key.String()+"\":"...)
			err := innerEncoder(val.MapIndex(key), context)
			if err != nil {
				return err
			}
		}
		context.buffer = append(context.buffer, '}')
		context.instancePath = instancePath
		return nil
	}, nil
}

func newOrderedMapEntryToJsonEncoder(t reflect.Type, context *compileEncoderCtx) (jsonEncoder, error) {
	subType, subTypeExists := t.Elem().FieldByName("Value")
	if !subTypeExists {
		return nil, errors.New("value doesn't exit")
	}
	subEncoder, subEncoderErr := typeEncoder(subType.Type, context)
	if subEncoderErr != nil {
		return nil, subEncoderErr
	}
	if subEncoder == nil {
		return nil, nil
	}
	return func(val reflect.Value, context *encodingCtx) error {
		slice := val.Slice(0, val.Len())
		context.buffer = append(context.buffer, "{"...)
		seenKeys := map[string]bool{}
		for i := 0; i < slice.Len(); i++ {
			if i > 0 {
				context.buffer = append(context.buffer, ","...)
			}
			entry := slice.Index(i)
			key := entry.FieldByName("Key").String()
			hasSeenKey, keyExists := seenKeys[key]
			if keyExists && hasSeenKey {
				return fmt.Errorf("duplicate key \"" + key + "\"")
			}
			value := entry.FieldByName("Value")
			context.buffer = append(context.buffer, "\""+key+"\":"...)
			subEncoder(value, context)
		}
		context.buffer = append(context.buffer, "}"...)
		return nil
	}, nil
}

const (
	lsb = 0x0101010101010101
	msb = 0x8080808080808080
)

var hex = "0123456789abcdef"

//nolint:govet
func stringToUint64Slice(s string) []uint64 {
	return *(*[]uint64)(unsafe.Pointer(&reflect.SliceHeader{
		Data: ((*reflect.StringHeader)(unsafe.Pointer(&s))).Data,
		Len:  len(s) / 8,
		Cap:  len(s) / 8,
	}))
}

func appendString[Bytes []byte | string](dst []byte, src Bytes, escapeHTML bool) []byte {
	dst = append(dst, '"')
	start := 0
	for i := 0; i < len(src); {
		if b := src[i]; b < utf8.RuneSelf {
			if htmlSafeSet[b] || (!escapeHTML && safeSet[b]) {
				i++
				continue
			}
			dst = append(dst, src[start:i]...)
			switch b {
			case '\\', '"':
				dst = append(dst, '\\', b)
			case '\b':
				dst = append(dst, '\\', 'b')
			case '\f':
				dst = append(dst, '\\', 'f')
			case '\n':
				dst = append(dst, '\\', 'n')
			case '\r':
				dst = append(dst, '\\', 'r')
			case '\t':
				dst = append(dst, '\\', 't')
			default:
				// This encodes bytes < 0x20 except for \b, \f, \n, \r and \t.
				// If escapeHTML is set, it also escapes <, >, and &
				// because they can lead to security holes when
				// user-controlled strings are rendered into JSON
				// and served to some browsers.
				dst = append(dst, '\\', 'u', '0', '0', hex[b>>4], hex[b&0xF])
			}
			i++
			start = i
			continue
		}
		// TODO(https://go.dev/issue/56948): Use generic utf8 functionality.
		// For now, cast only a small portion of byte slices to a string
		// so that it can be stack allocated. This slows down []byte slightly
		// due to the extra copy, but keeps string performance roughly the same.
		n := len(src) - i
		if n > utf8.UTFMax {
			n = utf8.UTFMax
		}
		c, size := utf8.DecodeRuneInString(string(src[i : i+n]))
		if c == utf8.RuneError && size == 1 {
			dst = append(dst, src[start:i]...)
			dst = append(dst, `\ufffd`...)
			i += size
			start = i
			continue
		}
		// U+2028 is LINE SEPARATOR.
		// U+2029 is PARAGRAPH SEPARATOR.
		// They are both technically valid characters in JSON strings,
		// but don't work in JSONP, which has to be evaluated as JavaScript,
		// and can lead to security holes there. It is valid JSON to
		// escape them, so we do so unconditionally.
		// See https://en.wikipedia.org/wiki/JSON#Safety.
		if c == '\u2028' || c == '\u2029' {
			dst = append(dst, src[start:i]...)
			dst = append(dst, '\\', 'u', '2', '0', '2', hex[c&0xF])
			i += size
			start = i
			continue
		}
		i += size
	}
	dst = append(dst, src[start:]...)
	dst = append(dst, '"')
	return dst
}

// safeSet holds the value true if the ASCII character with the given array
// position can be represented inside a JSON string without any further
// escaping.
//
// All values are true except for the ASCII control characters (0-31), the
// double quote ("), and the backslash character ("\").
var safeSet = [utf8.RuneSelf]bool{
	' ':      true,
	'!':      true,
	'"':      false,
	'#':      true,
	'$':      true,
	'%':      true,
	'&':      true,
	'\'':     true,
	'(':      true,
	')':      true,
	'*':      true,
	'+':      true,
	',':      true,
	'-':      true,
	'.':      true,
	'/':      true,
	'0':      true,
	'1':      true,
	'2':      true,
	'3':      true,
	'4':      true,
	'5':      true,
	'6':      true,
	'7':      true,
	'8':      true,
	'9':      true,
	':':      true,
	';':      true,
	'<':      true,
	'=':      true,
	'>':      true,
	'?':      true,
	'@':      true,
	'A':      true,
	'B':      true,
	'C':      true,
	'D':      true,
	'E':      true,
	'F':      true,
	'G':      true,
	'H':      true,
	'I':      true,
	'J':      true,
	'K':      true,
	'L':      true,
	'M':      true,
	'N':      true,
	'O':      true,
	'P':      true,
	'Q':      true,
	'R':      true,
	'S':      true,
	'T':      true,
	'U':      true,
	'V':      true,
	'W':      true,
	'X':      true,
	'Y':      true,
	'Z':      true,
	'[':      true,
	'\\':     false,
	']':      true,
	'^':      true,
	'_':      true,
	'`':      true,
	'a':      true,
	'b':      true,
	'c':      true,
	'd':      true,
	'e':      true,
	'f':      true,
	'g':      true,
	'h':      true,
	'i':      true,
	'j':      true,
	'k':      true,
	'l':      true,
	'm':      true,
	'n':      true,
	'o':      true,
	'p':      true,
	'q':      true,
	'r':      true,
	's':      true,
	't':      true,
	'u':      true,
	'v':      true,
	'w':      true,
	'x':      true,
	'y':      true,
	'z':      true,
	'{':      true,
	'|':      true,
	'}':      true,
	'~':      true,
	'\u007f': true,
}

// htmlSafeSet holds the value true if the ASCII character with the given
// array position can be safely represented inside a JSON string, embedded
// inside of HTML <script> tags, without any additional escaping.
//
// All values are true except for the ASCII control characters (0-31), the
// double quote ("), the backslash character ("\"), HTML opening and closing
// tags ("<" and ">"), and the ampersand ("&").
var htmlSafeSet = [utf8.RuneSelf]bool{
	' ':      true,
	'!':      true,
	'"':      false,
	'#':      true,
	'$':      true,
	'%':      true,
	'&':      false,
	'\'':     true,
	'(':      true,
	')':      true,
	'*':      true,
	'+':      true,
	',':      true,
	'-':      true,
	'.':      true,
	'/':      true,
	'0':      true,
	'1':      true,
	'2':      true,
	'3':      true,
	'4':      true,
	'5':      true,
	'6':      true,
	'7':      true,
	'8':      true,
	'9':      true,
	':':      true,
	';':      true,
	'<':      false,
	'=':      true,
	'>':      false,
	'?':      true,
	'@':      true,
	'A':      true,
	'B':      true,
	'C':      true,
	'D':      true,
	'E':      true,
	'F':      true,
	'G':      true,
	'H':      true,
	'I':      true,
	'J':      true,
	'K':      true,
	'L':      true,
	'M':      true,
	'N':      true,
	'O':      true,
	'P':      true,
	'Q':      true,
	'R':      true,
	'S':      true,
	'T':      true,
	'U':      true,
	'V':      true,
	'W':      true,
	'X':      true,
	'Y':      true,
	'Z':      true,
	'[':      true,
	'\\':     false,
	']':      true,
	'^':      true,
	'_':      true,
	'`':      true,
	'a':      true,
	'b':      true,
	'c':      true,
	'd':      true,
	'e':      true,
	'f':      true,
	'g':      true,
	'h':      true,
	'i':      true,
	'j':      true,
	'k':      true,
	'l':      true,
	'm':      true,
	'n':      true,
	'o':      true,
	'p':      true,
	'q':      true,
	'r':      true,
	's':      true,
	't':      true,
	'u':      true,
	'v':      true,
	'w':      true,
	'x':      true,
	'y':      true,
	'z':      true,
	'{':      true,
	'|':      true,
	'}':      true,
	'~':      true,
	'\u007f': true,
}

func appendNormalizedString(target *[]byte, s string) {
	valLen := len(s)
	if valLen == 0 {
		*target = append(*target, `""`...)
		return
	}
	*target = append(*target, `"`...)
	var (
		i, j int
	)
	if valLen >= 8 {
		chunks := stringToUint64Slice(s)
		for _, n := range chunks {
			// combine masks before checking for the MSB of each byte. We include
			// `n` in the mask to check whether any of the *input* byte MSBs were
			// set (i.e. the byte was outside the ASCII range).
			mask := n | (n - (lsb * 0x20)) |
				((n ^ (lsb * '"')) - lsb) |
				((n ^ (lsb * '\\')) - lsb)
			if (mask & msb) != 0 {
				j = bits.TrailingZeros64(mask&msb) / 8
				goto ESCAPE_END
			}
		}
		valLen := len(s)
		for i := len(chunks) * 8; i < valLen; i++ {
			if needEscapeNormalizeUTF8[s[i]] {
				j = i
				goto ESCAPE_END
			}
		}
		*target = append(*target, s...)
		*target = append(*target, `"`...)
		return
	}
ESCAPE_END:
	for j < valLen {
		c := s[j]

		if !needEscapeNormalizeUTF8[c] {
			// fast path: most of the time, printable ascii characters are used
			j++
			continue
		}

		switch c {
		case '\\', '"':
			*target = append(*target, s[i:j]...)
			*target = append(*target, "\\"...)
			*target = append(*target, c)
			i = j + 1
			j = j + 1
			continue

		case '\n':
			*target = append(*target, s[i:j]...)
			*target = append(*target, "\\n"...)
			i = j + 1
			j = j + 1
			continue

		case '\r':
			*target = append(*target, s[i:j]...)
			*target = append(*target, "\\r"...)
			i = j + 1
			j = j + 1
			continue

		case '\t':
			*target = append(*target, s[i:j]...)
			*target = append(*target, "\\t"...)
			i = j + 1
			j = j + 1
			continue

		case 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x0B, 0x0C, 0x0E, 0x0F, // 0x00-0x0F
			0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F: // 0x10-0x1F
			*target = append(*target, s[i:j]...)
			*target = append(*target, `\u00`...)
			*target = append(*target, hex[c>>4])
			*target = append(*target, hex[c&0xF])
			i = j + 1
			j = j + 1
			continue
		}

		state, size := decodeRuneInString(s[j:])
		switch state {
		case runeErrorState:
			*target = append(*target, s[i:j]...)
			*target = append(*target, `\ufffd`...)
			i = j + 1
			j = j + 1
			continue
			// U+2028 is LINE SEPARATOR.
			// U+2029 is PARAGRAPH SEPARATOR.
			// They are both technically valid characters in JSON strings,
			// but don't work in JSONP, which has to be evaluated as JavaScript,
			// and can lead to security holes there. It is valid JSON to
			// escape them, so we do so unconditionally.
			// See http://timelessrepo.com/json-isnt-a-javascript-subset for discussion.
		case lineSepState:
			*target = append(*target, s[i:j]...)
			*target = append(*target, `\u2028`...)
			i = j + 3
			j = j + 3
			continue
		case paragraphSepState:
			*target = append(*target, s[i:j]...)
			*target = append(*target, `\u2029`...)
			i = j + 3
			j = j + 3
			continue
		}
		j += size
	}
	*target = append(*target, s[i:]...)
	*target = append(*target, `"`...)
}

const (
	// The default lowest and highest continuation byte.
	locb = 128 //0b10000000
	hicb = 191 //0b10111111

	// These names of these constants are chosen to give nice alignment in the
	// table below. The first nibble is an index into acceptRanges or F for
	// special one-byte cases. The second nibble is the Rune length or the
	// Status for the special one-byte case.
	xx = 0xF1 // invalid: size 1
	as = 0xF0 // ASCII: size 1
	s1 = 0x02 // accept 0, size 2
	s2 = 0x13 // accept 1, size 3
	s3 = 0x03 // accept 0, size 3
	s4 = 0x23 // accept 2, size 3
	s5 = 0x34 // accept 3, size 4
	s6 = 0x04 // accept 0, size 4
	s7 = 0x44 // accept 4, size 4
)

// first is information about the first byte in a UTF-8 sequence.
var first = [256]uint8{
	//   1   2   3   4   5   6   7   8   9   A   B   C   D   E   F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x00-0x0F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x10-0x1F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x20-0x2F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x30-0x3F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x40-0x4F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x50-0x5F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x60-0x6F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x70-0x7F
	//   1   2   3   4   5   6   7   8   9   A   B   C   D   E   F
	xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, // 0x80-0x8F
	xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, // 0x90-0x9F
	xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, // 0xA0-0xAF
	xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, // 0xB0-0xBF
	xx, xx, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, // 0xC0-0xCF
	s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, // 0xD0-0xDF
	s2, s3, s3, s3, s3, s3, s3, s3, s3, s3, s3, s3, s3, s4, s3, s3, // 0xE0-0xEF
	s5, s6, s6, s6, s7, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, // 0xF0-0xFF
}

const (
	lineSep      = byte(168) //'\u2028'
	paragraphSep = byte(169) //'\u2029'
)

type decodeRuneState int

const (
	validUTF8State decodeRuneState = iota
	runeErrorState
	lineSepState
	paragraphSepState
)

func decodeRuneInString(s string) (decodeRuneState, int) {
	n := len(s)
	s0 := s[0]
	x := first[s0]
	if x >= as {
		// The following code simulates an additional check for x == xx and
		// handling the ASCII and invalid cases accordingly. This mask-and-or
		// approach prevents an additional branch.
		mask := rune(x) << 31 >> 31 // Create 0x0000 or 0xFFFF.
		if rune(s[0])&^mask|utf8.RuneError&mask == utf8.RuneError {
			return runeErrorState, 1
		}
		return validUTF8State, 1
	}
	sz := int(x & 7)
	if n < sz {
		return runeErrorState, 1
	}
	s1 := s[1]
	switch x >> 4 {
	case 0:
		if s1 < locb || hicb < s1 {
			return runeErrorState, 1
		}
	case 1:
		if s1 < 0xA0 || hicb < s1 {
			return runeErrorState, 1
		}
	case 2:
		if s1 < locb || 0x9F < s1 {
			return runeErrorState, 1
		}
	case 3:
		if s1 < 0x90 || hicb < s1 {
			return runeErrorState, 1
		}
	case 4:
		if s1 < locb || 0x8F < s1 {
			return runeErrorState, 1
		}
	}
	if sz <= 2 {
		return validUTF8State, 2
	}
	s2 := s[2]
	if s2 < locb || hicb < s2 {
		return runeErrorState, 1
	}
	if sz <= 3 {
		// separator character prefixes: [2]byte{226, 128}
		if s0 == 226 && s1 == 128 {
			switch s2 {
			case lineSep:
				return lineSepState, 3
			case paragraphSep:
				return paragraphSepState, 3
			}
		}
		return validUTF8State, 3
	}
	s3 := s[3]
	if s3 < locb || hicb < s3 {
		return runeErrorState, 1
	}
	return validUTF8State, 4
}

var needEscapeHTMLNormalizeUTF8 = [256]bool{
	'"':  true,
	'&':  true,
	'<':  true,
	'>':  true,
	'\\': true,
	0x00: true,
	0x01: true,
	0x02: true,
	0x03: true,
	0x04: true,
	0x05: true,
	0x06: true,
	0x07: true,
	0x08: true,
	0x09: true,
	0x0a: true,
	0x0b: true,
	0x0c: true,
	0x0d: true,
	0x0e: true,
	0x0f: true,
	0x10: true,
	0x11: true,
	0x12: true,
	0x13: true,
	0x14: true,
	0x15: true,
	0x16: true,
	0x17: true,
	0x18: true,
	0x19: true,
	0x1a: true,
	0x1b: true,
	0x1c: true,
	0x1d: true,
	0x1e: true,
	0x1f: true,
	/* 0x20 - 0x7f */
	0x80: true,
	0x81: true,
	0x82: true,
	0x83: true,
	0x84: true,
	0x85: true,
	0x86: true,
	0x87: true,
	0x88: true,
	0x89: true,
	0x8a: true,
	0x8b: true,
	0x8c: true,
	0x8d: true,
	0x8e: true,
	0x8f: true,
	0x90: true,
	0x91: true,
	0x92: true,
	0x93: true,
	0x94: true,
	0x95: true,
	0x96: true,
	0x97: true,
	0x98: true,
	0x99: true,
	0x9a: true,
	0x9b: true,
	0x9c: true,
	0x9d: true,
	0x9e: true,
	0x9f: true,
	0xa0: true,
	0xa1: true,
	0xa2: true,
	0xa3: true,
	0xa4: true,
	0xa5: true,
	0xa6: true,
	0xa7: true,
	0xa8: true,
	0xa9: true,
	0xaa: true,
	0xab: true,
	0xac: true,
	0xad: true,
	0xae: true,
	0xaf: true,
	0xb0: true,
	0xb1: true,
	0xb2: true,
	0xb3: true,
	0xb4: true,
	0xb5: true,
	0xb6: true,
	0xb7: true,
	0xb8: true,
	0xb9: true,
	0xba: true,
	0xbb: true,
	0xbc: true,
	0xbd: true,
	0xbe: true,
	0xbf: true,
	0xc0: true,
	0xc1: true,
	0xc2: true,
	0xc3: true,
	0xc4: true,
	0xc5: true,
	0xc6: true,
	0xc7: true,
	0xc8: true,
	0xc9: true,
	0xca: true,
	0xcb: true,
	0xcc: true,
	0xcd: true,
	0xce: true,
	0xcf: true,
	0xd0: true,
	0xd1: true,
	0xd2: true,
	0xd3: true,
	0xd4: true,
	0xd5: true,
	0xd6: true,
	0xd7: true,
	0xd8: true,
	0xd9: true,
	0xda: true,
	0xdb: true,
	0xdc: true,
	0xdd: true,
	0xde: true,
	0xdf: true,
	0xe0: true,
	0xe1: true,
	0xe2: true,
	0xe3: true,
	0xe4: true,
	0xe5: true,
	0xe6: true,
	0xe7: true,
	0xe8: true,
	0xe9: true,
	0xea: true,
	0xeb: true,
	0xec: true,
	0xed: true,
	0xee: true,
	0xef: true,
	0xf0: true,
	0xf1: true,
	0xf2: true,
	0xf3: true,
	0xf4: true,
	0xf5: true,
	0xf6: true,
	0xf7: true,
	0xf8: true,
	0xf9: true,
	0xfa: true,
	0xfb: true,
	0xfc: true,
	0xfd: true,
	0xfe: true,
	0xff: true,
}

var needEscapeNormalizeUTF8 = [256]bool{
	'"':  true,
	'\\': true,
	0x00: true,
	0x01: true,
	0x02: true,
	0x03: true,
	0x04: true,
	0x05: true,
	0x06: true,
	0x07: true,
	0x08: true,
	0x09: true,
	0x0a: true,
	0x0b: true,
	0x0c: true,
	0x0d: true,
	0x0e: true,
	0x0f: true,
	0x10: true,
	0x11: true,
	0x12: true,
	0x13: true,
	0x14: true,
	0x15: true,
	0x16: true,
	0x17: true,
	0x18: true,
	0x19: true,
	0x1a: true,
	0x1b: true,
	0x1c: true,
	0x1d: true,
	0x1e: true,
	0x1f: true,
	/* 0x20 - 0x7f */
	0x80: true,
	0x81: true,
	0x82: true,
	0x83: true,
	0x84: true,
	0x85: true,
	0x86: true,
	0x87: true,
	0x88: true,
	0x89: true,
	0x8a: true,
	0x8b: true,
	0x8c: true,
	0x8d: true,
	0x8e: true,
	0x8f: true,
	0x90: true,
	0x91: true,
	0x92: true,
	0x93: true,
	0x94: true,
	0x95: true,
	0x96: true,
	0x97: true,
	0x98: true,
	0x99: true,
	0x9a: true,
	0x9b: true,
	0x9c: true,
	0x9d: true,
	0x9e: true,
	0x9f: true,
	0xa0: true,
	0xa1: true,
	0xa2: true,
	0xa3: true,
	0xa4: true,
	0xa5: true,
	0xa6: true,
	0xa7: true,
	0xa8: true,
	0xa9: true,
	0xaa: true,
	0xab: true,
	0xac: true,
	0xad: true,
	0xae: true,
	0xaf: true,
	0xb0: true,
	0xb1: true,
	0xb2: true,
	0xb3: true,
	0xb4: true,
	0xb5: true,
	0xb6: true,
	0xb7: true,
	0xb8: true,
	0xb9: true,
	0xba: true,
	0xbb: true,
	0xbc: true,
	0xbd: true,
	0xbe: true,
	0xbf: true,
	0xc0: true,
	0xc1: true,
	0xc2: true,
	0xc3: true,
	0xc4: true,
	0xc5: true,
	0xc6: true,
	0xc7: true,
	0xc8: true,
	0xc9: true,
	0xca: true,
	0xcb: true,
	0xcc: true,
	0xcd: true,
	0xce: true,
	0xcf: true,
	0xd0: true,
	0xd1: true,
	0xd2: true,
	0xd3: true,
	0xd4: true,
	0xd5: true,
	0xd6: true,
	0xd7: true,
	0xd8: true,
	0xd9: true,
	0xda: true,
	0xdb: true,
	0xdc: true,
	0xdd: true,
	0xde: true,
	0xdf: true,
	0xe0: true,
	0xe1: true,
	0xe2: true,
	0xe3: true,
	0xe4: true,
	0xe5: true,
	0xe6: true,
	0xe7: true,
	0xe8: true,
	0xe9: true,
	0xea: true,
	0xeb: true,
	0xec: true,
	0xed: true,
	0xee: true,
	0xef: true,
	0xf0: true,
	0xf1: true,
	0xf2: true,
	0xf3: true,
	0xf4: true,
	0xf5: true,
	0xf6: true,
	0xf7: true,
	0xf8: true,
	0xf9: true,
	0xfa: true,
	0xfb: true,
	0xfc: true,
	0xfd: true,
	0xfe: true,
	0xff: true,
}

var publicKeyCharacters = map[byte]bool{
	byte('A'): true,
	byte('B'): true,
	byte('C'): true,
	byte('D'): true,
	byte('E'): true,
	byte('F'): true,
	byte('G'): true,
	byte('H'): true,
	byte('I'): true,
	byte('J'): true,
	byte('K'): true,
	byte('L'): true,
	byte('M'): true,
	byte('N'): true,
	byte('O'): true,
	byte('P'): true,
	byte('Q'): true,
	byte('R'): true,
	byte('S'): true,
	byte('T'): true,
	byte('U'): true,
	byte('V'): true,
	byte('W'): true,
	byte('X'): true,
	byte('Y'): true,
	byte('Z'): true,
}

func isPublicKey(key string) bool {
	result, ok := publicKeyCharacters[key[0]]
	return ok && result
}
