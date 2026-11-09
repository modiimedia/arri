package arri_test

import (
	"fmt"
	"reflect"
	"time"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

type nestedObject struct {
	Id      string `json:"id"`
	Content string `json:"content"`
}

type objectWithEveryType struct {
	String        string          `json:"string"`
	Boolean       bool            `json:"boolean"`
	Timestamp     time.Time       `json:"timestamp"`
	Float32       float32         `json:"float32"`
	Float64       float64         `json:"float64"`
	Int8          int8            `json:"int8"`
	Uint8         uint8           `json:"uint8"`
	Int16         int16           `json:"int16"`
	Uint16        uint16          `json:"uint16"`
	Int32         int32           `json:"int32"`
	Uint32        uint32          `json:"uint32"`
	Int64         int64           `json:"int64"`
	Uint64        uint64          `json:"uint64"`
	Enum          string          `enum:"FOO,BAR,BAZ" json:"enum"`
	Object        nestedObject    `json:"object"`
	Array         []bool          `json:"array"`
	Record        map[string]bool `json:"record"`
	UnionExternal unionExternal   `json:"unionExternal"`
	UnionInternal unionInternal   `json:"unionInternal"`
	UnionAdjacent unionAdjacent   `json:"unionAdjacent"`
	Any           any             `json:"any"`
}

type unionExternal struct {
	arri.Union
	Object            *nestedObject
	Array             *[]string
	Boolean           *bool
	NullableTimestamp *arri.Nullable[time.Time] `tag:"nullable-timestamp"`
}

type unionInternal struct {
	arri.Union `tagKey:"shape"`
	Rectangle  *unionInternalRectangle
	Circle     *unionInternalCircle
}

type unionInternalRectangle struct {
	Width  float64
	Height float64
}

type unionInternalCircle struct {
	Radius float64
}

type unionAdjacent struct {
	arri.Union        `tagKey:"kind" valueKey:"data"`
	Object            *nestedObject
	Array             *[]string
	Boolean           *bool
	NullableTimestamp *arri.Nullable[time.Time] `tag:"nullable-timestamp"`
}

type legacyDiscriminator struct {
	arri.DiscriminatorKey `discriminatorKey:"typeName"`
	A                     *legacyDiscriminatorA `discriminator:"A"`
	B                     *legacyDiscriminatorB `discriminator:"B"`
	C                     *legacyDiscriminatorC `discriminator:"C"`
}

type legacyDiscriminatorA struct {
	Id string
}

type legacyDiscriminatorB struct {
	Id   string
	Name string
}

type legacyDiscriminatorC struct {
	Id   string
	Name string
	Date time.Time
}

type objectWithOptionalFields struct {
	String        arri.Option[string]
	Boolean       arri.Option[bool]
	Timestamp     arri.Option[time.Time]
	Float32       arri.Option[float32]
	Float64       arri.Option[float64]
	Int8          arri.Option[int8]
	Uint8         arri.Option[uint8]
	Int16         arri.Option[int16]
	Uint16        arri.Option[uint16]
	Int32         arri.Option[int32]
	Uint32        arri.Option[uint32]
	Int64         arri.Option[int64]
	Uint64        arri.Option[uint64]
	Enum          arri.Option[string] `enum:"FOO,BAR,BAZ"`
	Object        arri.Option[nestedObject]
	Array         arri.Option[[]bool]
	Record        arri.Option[map[string]bool]
	UnionExternal arri.Option[unionExternal]
	UnionInternal arri.Option[unionInternal]
	UnionAdjacent arri.Option[unionAdjacent]
	Any           arri.Option[any]
}

type objectWithNullableFields struct {
	String        arri.Nullable[string]
	Boolean       arri.Nullable[bool]
	Timestamp     arri.Nullable[time.Time]
	Float32       arri.Nullable[float32]
	Float64       arri.Nullable[float64]
	Int8          arri.Nullable[int8]
	Uint8         arri.Nullable[uint8]
	Int16         arri.Nullable[int16]
	Uint16        arri.Nullable[uint16]
	Int32         arri.Nullable[int32]
	Uint32        arri.Nullable[uint32]
	Int64         arri.Nullable[int64]
	Uint64        arri.Nullable[uint64]
	Enum          arri.Nullable[string] `enum:"FOO,BAR,BAZ"`
	Object        arri.Nullable[nestedObject]
	Array         arri.Nullable[[]bool]
	Record        arri.Nullable[map[string]bool]
	UnionExternal arri.Nullable[unionExternal]
	UnionInternal arri.Nullable[unionInternal]
	UnionAdjacent arri.Nullable[unionAdjacent]
	Any           arri.Nullable[any]
}

type recursiveObject struct {
	Left  *recursiveObject
	Right *recursiveObject
}

func deepEqualErrString(result any, expectedResult any) string {
	t := reflect.TypeOf(result)
	if t.Kind() == reflect.Struct || (t.Kind() == reflect.Ptr && t.Elem().Kind() == reflect.Struct) {
		resultOutput, resultErr := arri.EncodeJSON(result, arri.EncodingOptions{})
		expectedResultOutput, expectedResultErr := arri.EncodeJSON(expectedResult, arri.EncodingOptions{})
		if resultErr == nil && expectedResultErr == nil {
			return "\n" + string(resultOutput) + "\nis not equal to\n" + string(expectedResultOutput)
		}
	}
	return "\n" + fmt.Sprint(result) + "\nis not equal to\n" + fmt.Sprint(expectedResult)
}

func ptr[T any](value T) *T {
	return &value
}
