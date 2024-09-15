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
	"time"
	"unicode/utf8"
	"unsafe"

	"github.com/iancoleman/strcase"
)

func ToJson(input interface{}, keyCasing KeyCasing) ([]byte, error) {
	buf := []byte{}
	val := reflect.ValueOf(input)
	err := typeToJson(
		val,
		&buf,
		_EncodingContext{
			KeyCasing:    keyCasing,
			MaxDepth:     10000,
			CurrentDepth: 0,
		},
	)
	if err != nil {
		return nil, err
	}
	return buf, nil
}

type _EncodingContext struct {
	MaxDepth           uint32
	CurrentDepth       uint32
	EnumValues         []string
	KeyCasing          KeyCasing
	DiscriminatorKey   string
	DiscriminatorValue string
}

func (context _EncodingContext) copyWith(
	CurrentDepth Option[uint32],
	EnumValues Option[[]string],
	DiscriminatorKey Option[string],
	DiscriminatorValue Option[string],
) _EncodingContext {
	currentDepth := CurrentDepth.UnwrapOr(context.CurrentDepth)
	enumValues := EnumValues.UnwrapOr(context.EnumValues)
	discriminatorKey := DiscriminatorKey.UnwrapOr(context.DiscriminatorKey)
	discriminatorValue := DiscriminatorValue.UnwrapOr(context.DiscriminatorValue)
	return _EncodingContext{
		MaxDepth:           context.MaxDepth,
		CurrentDepth:       currentDepth,
		EnumValues:         enumValues,
		KeyCasing:          context.KeyCasing,
		DiscriminatorKey:   discriminatorKey,
		DiscriminatorValue: discriminatorValue,
	}
}

func typeToJson(input reflect.Value, target *[]byte, context _EncodingContext) error {
	if context.CurrentDepth >= context.MaxDepth {
		return fmt.Errorf("max depth of %+v reached", context.MaxDepth)
	}
	kind := input.Kind()
	switch kind {
	case reflect.Bool:
		return boolToJson(input, target)
	case reflect.String:
		return stringToJson(input, target, context)
	case reflect.Int8, reflect.Int16, reflect.Int32, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Float32, reflect.Float64:
		return numberToJson(input, target)
	case reflect.Int, reflect.Uint, reflect.Int64, reflect.Uint64:
		return bigIntToJson(input, target)
	case reflect.Struct:
		if input.Type().Name() == "Time" {
			return timestampToJson(input, target)
		}
		return structToJson(input, target, context)
	case reflect.Array, reflect.Slice:
		return listToJson(input, target, context)
	case reflect.Ptr, reflect.UnsafePointer:
		if input.IsNil() {
			*target = append(*target, "null"...)
			return nil
		}
		el := input.Elem()
		return typeToJson(el, target, context)
	case reflect.Map:
		return mapToJson(input, target, context)
	case reflect.Interface:
		inner := input.Elem()
		if inner.Kind() == reflect.Invalid {
			return anyToJson(input, target, context)
		}
		return typeToJson(inner, target, context)
	case reflect.Invalid:
		return anyToJson(input, target, context)
	}

	return fmt.Errorf("unsupported Kind %s", kind)
}

func anyToJson(input reflect.Value, target *[]byte, _ _EncodingContext) error {
	result, err := json.Marshal(input.Interface())
	if err != nil {
		return err
	}
	*target = append(*target, result...)
	return nil
}

func mapToJson(input reflect.Value, target *[]byte, context _EncodingContext) error {
	*target = append(*target, "{"...)
	keys := input.MapKeys()
	orderedKeys := []string{}
	for i := 0; i < len(keys); i++ {
		key := keys[i]
		orderedKeys = append(orderedKeys, key.String())
	}
	sort.Strings(orderedKeys)
	ctx := context.copyWith(Some(context.CurrentDepth+1), Some([]string{}), Some(""), Some(""))
	for i := 0; i < len(orderedKeys); i++ {
		if i != 0 {
			*target = append(*target, ","...)
		}
		key := orderedKeys[i]
		*target = append(*target, "\""+key+"\":"...)
		value := input.MapIndex(reflect.ValueOf(key))
		fieldError := typeToJson(value, target, ctx)
		if fieldError != nil {
			return fieldError
		}
	}
	*target = append(*target, "}"...)
	return nil
}

func orderedMapEntryToJson(input reflect.Value, target *[]byte, context _EncodingContext) error {
	slice := input.Slice(0, input.Len())
	*target = append(*target, "{"...)
	seenKeys := map[string]bool{}
	for i := 0; i < slice.Len(); i++ {
		if i > 0 {
			*target = append(*target, ","...)
		}
		entry := slice.Index(i)
		key := entry.FieldByName("Key").String()
		hasSeenKey, keyExists := seenKeys[key]
		if keyExists && hasSeenKey {
			return fmt.Errorf("duplicate key \"" + key + "\"")
		}
		value := entry.FieldByName("Value")
		*target = append(*target, "\""+key+"\":"...)
		typeToJson(value, target, context)
	}
	*target = append(*target, "}"...)
	return nil
}

func listToJson(input reflect.Value, target *[]byte, context _EncodingContext) error {
	slice := input.Slice(0, input.Len())
	if strings.Contains(input.Type().Elem().Name(), "__orderedMapEntry__[") {
		return orderedMapEntryToJson(input, target, context)
	}
	*target = append(*target, "["...)
	for i := 0; i < slice.Len(); i++ {
		if i > 0 {
			*target = append(*target, ","...)
		}
		element := slice.Index(i)
		typeToJson(element, target, context)
	}
	*target = append(*target, "]"...)
	return nil
}

func timestampToJson(input reflect.Value, target *[]byte) error {
	timeValue, _ := input.Interface().(time.Time)
	*target = append(*target, "\""+timeValue.Format("2006-01-02T15:04:05.000Z")+"\""...)
	return nil
}

func boolToJson(input reflect.Value, target *[]byte) error {
	*target = strconv.AppendBool(*target, input.Bool())
	return nil
}

func numberToJson(input reflect.Value, target *[]byte) error {
	switch input.Kind() {
	case reflect.Int8, reflect.Int16, reflect.Int32:
		*target = strconv.AppendInt(*target, input.Int(), 10)
		return nil
	case reflect.Uint8, reflect.Uint16, reflect.Uint32:
		*target = strconv.AppendUint(*target, input.Uint(), 10)
		return nil
	case reflect.Float32, reflect.Float64:
		*target = append(*target, strconv.FormatFloat(input.Float(), 'f', -1, 64)...)
		return nil
	}
	return fmt.Errorf("unsupported Kind %s", input.Kind())
}

func bigIntToJson(input reflect.Value, target *[]byte) error {
	switch input.Kind() {
	case reflect.Int, reflect.Int64:
		*target = append(*target, "\""+fmt.Sprint(input.Int())+"\""...)
		return nil
	case reflect.Uint, reflect.Uint64:
		*target = append(*target, "\""+fmt.Sprint(input.Uint())+"\""...)
		return nil
	}
	return fmt.Errorf("unsupported Kind %s", input.Kind())
}

func structToJson(input reflect.Value, target *[]byte, context _EncodingContext) error {
	if IsDiscriminatorStruct(input.Type()) {
		return discriminatorToJson(input, target, context)
	}
	*target = append(*target, "{"...)
	numFields := 0
	if len(context.DiscriminatorKey) > 0 && len(context.DiscriminatorValue) > 0 {
		s := "\"" + context.DiscriminatorKey + "\":\"" + context.DiscriminatorValue + "\""
		*target = append(*target, s...)
		numFields++
	}
	for i := 0; i < input.NumField(); i++ {
		field := input.Field(i)
		fieldType := field.Type()
		structField := input.Type().Field(i)
		if !structField.IsExported() {
			continue
		}
		key := structField.Tag.Get("key")
		if len(key) == 0 {
			switch context.KeyCasing {
			case KeyCasingCamelCase:
				key = strcase.ToLowerCamel(structField.Name)
			case KeyCasingSnakeCase:
				key = strcase.ToSnake(structField.Name)
			case KeyCasingPascalCase:
				key = strcase.ToCamel(structField.Name)
			default:
				key = strcase.ToLowerCamel(structField.Name)
			}
		}
		enumTag := structField.Tag.Get("enum")
		enumValues := []string{}
		if len(enumTag) > 0 {
			vals := strings.Split(enumTag, ",")
			for i := 0; i < len(vals); i++ {
				val := strings.TrimSpace(vals[i])
				enumValues = append(enumValues, val)
			}
		}
		ctx := context.copyWith(Some(context.CurrentDepth+1), Some(enumValues), Some(""), Some(""))

		isOptional := isOptionalType(fieldType)
		if isOptional {
			didAppend, err := optionalTypeToJson(field, target, ctx, key, numFields > 0)
			if err != nil {
				return err
			}
			if didAppend {
				numFields++
			}
			continue
		}
		if numFields > 0 {
			*target = append(*target, ","...)
		}
		isNullable := isNullableType(fieldType)
		if isNullable {
			*target = append(*target, "\""+key+"\":"...)
			err := nullableTypeToJson(field, target, ctx)
			if err != nil {
				return err
			}
			continue
		}
		*target = append(*target, "\""+key+"\":"...)
		fieldErr := typeToJson(field, target, ctx)
		if fieldErr != nil {
			return fieldErr
		}
		numFields++
	}
	*target = append(*target, "}"...)
	return nil
}

func nullableTypeToJson(input reflect.Value, target *[]byte, context _EncodingContext) error {
	innerVal := extractNullableValue(&input)
	if innerVal != nil {
		return typeToJson(*innerVal, target, context)
	}
	*target = append(*target, "null"...)
	return nil
}

func optionalTypeToJson(input reflect.Value, target *[]byte, context _EncodingContext, keyName string, hasPreviousKeys bool) (didAdd bool, err error) {
	innerVal := extractOptionalValue(&input)
	if innerVal != nil {
		if hasPreviousKeys {
			*target = append(*target, ","...)
		}
		*target = append(*target, "\""+keyName+"\":"...)
		return true, typeToJson(*innerVal, target, context)
	}
	return false, nil
}

func discriminatorToJson(input reflect.Value, target *[]byte, context _EncodingContext) error {
	discriminatorKey := "type"
	for i := 0; i < input.NumField(); i++ {
		field := input.Field(i)
		fieldType := input.Type().Field(i)
		if i == 0 && fieldType.Name == "DiscriminatorKey" {
			discriminatorKeyTag := fieldType.Tag.Get("discriminatorKey")
			if len(discriminatorKeyTag) > 0 {
				discriminatorKey = strings.TrimSpace(discriminatorKeyTag)
			}
			continue
		}
		discriminatorValue := fieldType.Tag.Get("discriminator")
		if len(discriminatorValue) == 0 {
			return errors.New("all discriminator subtypes must have the \"discriminator\" tag")
		}
		if field.IsNil() {
			continue
		}
		subType := field.Elem()
		return structToJson(
			subType,
			target,
			context.copyWith(
				None[uint32](),
				None[[]string](),
				Some(discriminatorKey),
				Some(discriminatorValue),
			),
		)
	}
	return fmt.Errorf("error serializing %s. at least one field must not be nil", input.Type().Name())
}

func stringToJson(input reflect.Value, target *[]byte, context _EncodingContext) error {
	if len(context.EnumValues) > 0 {
		return enumToJson(input, target, context)
	}
	appendNormalizedString(target, input.String())
	return nil
}

func enumToJson(input reflect.Value, target *[]byte, context _EncodingContext) error {
	if input.Kind() != reflect.String {
		return fmt.Errorf("unsupported Kind %s", input.Kind())
	}
	val := input.String()
	for i := 0; i < len(context.EnumValues); i++ {
		if val == context.EnumValues[i] {
			*target = append(*target, "\""+val+"\""...)
			return nil
		}
	}
	return fmt.Errorf("expected one of the following values: %+v instead got %s", context.EnumValues, input.String())
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
