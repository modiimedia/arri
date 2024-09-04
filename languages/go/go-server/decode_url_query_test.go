package arri_test

import (
	"arri"
	"reflect"
	"testing"
	"time"
)

type queryResultWithEveryType struct {
	String    string
	Boolean   bool
	Timestamp time.Time
	Float32   float32
	Float64   float64
	Int8      int8
	Uint8     uint8
	Int16     int16
	Uint16    uint16
	Int32     int32
	Uint32    uint32
	Int64     int64
	Uint64    uint64
	Enum      string `enum:"FOO,BAR,BAZ"`
}

type queryResultWithEveryOptionalType struct {
	String    arri.Option[string]
	Boolean   arri.Option[bool]
	Timestamp arri.Option[time.Time]
	Float32   arri.Option[float32]
	Float64   arri.Option[float64]
	Int8      arri.Option[int8]
	Uint8     arri.Option[uint8]
	Int16     arri.Option[int16]
	Uint16    arri.Option[uint16]
	Int32     arri.Option[int32]
	Uint32    arri.Option[uint32]
	Int64     arri.Option[int64]
	Uint64    arri.Option[uint64]
	Enum      arri.Option[string] `enum:"FOO,BAR,BAZ"`
}

type queryResultWithEveryNullableType struct {
	String    arri.Nullable[string]
	Boolean   arri.Nullable[bool]
	Timestamp arri.Nullable[time.Time]
	Float32   arri.Nullable[float32]
	Float64   arri.Nullable[float64]
	Int8      arri.Nullable[int8]
	Uint8     arri.Nullable[uint8]
	Int16     arri.Nullable[int16]
	Uint16    arri.Nullable[uint16]
	Int32     arri.Nullable[int32]
	Uint32    arri.Nullable[uint32]
	Int64     arri.Nullable[int64]
	Uint64    arri.Nullable[uint64]
	Enum      arri.Nullable[string] `enum:"FOO,BAR,BAZ"`
}

var completeUrlQueryInput = map[string][]string{
	"string":    {"hello world"},
	"boolean":   {"true"},
	"timestamp": {"2001-01-01T16:00:00.000Z"},
	"float32":   {"1.5"},
	"float64":   {"1.5"},
	"int8":      {"1"},
	"uint8":     {"1"},
	"int16":     {"10"},
	"uint16":    {"10"},
	"int32":     {"100"},
	"uint32":    {"100"},
	"int64":     {"1000"},
	"uint64":    {"1000"},
	"enum":      {"BAR"},
}

func TestFromUrlQueryWithEveryType(t *testing.T) {
	target := queryResultWithEveryType{}
	expectedResult := queryResultWithEveryType{
		String:    "hello world",
		Boolean:   true,
		Timestamp: testDate,
		Float32:   1.5,
		Float64:   1.5,
		Int8:      1,
		Uint8:     1,
		Int16:     10,
		Uint16:    10,
		Int32:     100,
		Uint32:    100,
		Int64:     1000,
		Uint64:    1000,
		Enum:      "BAR",
	}
	arri.FromUrlQuery(completeUrlQueryInput, &target, arri.KeyCasingCamelCase)
	if !reflect.DeepEqual(target, expectedResult) {
		t.Errorf("\n%+v\ndoes not equal\n%+v\n", target, expectedResult)
		return
	}
}

func BenchmarkFromUrlQueryWithEveryType(b *testing.B) {
	for i := 0; i < b.N; i++ {
		target := queryResultWithEveryType{}
		arri.FromUrlQuery(completeUrlQueryInput, &target, arri.KeyCasingCamelCase)
	}
}

func TestFromUrlQueryWithEveryOptionalType(t *testing.T) {
	target := queryResultWithEveryOptionalType{}
	initialErr := arri.FromUrlQuery(map[string][]string{}, &target, arri.KeyCasingCamelCase)
	if initialErr != nil {
		t.Errorf(initialErr.Error())
		return
	}
	if !reflect.DeepEqual(target, queryResultWithEveryOptionalType{}) {
		t.Errorf("\n%+v\ndoes not equal\n%+v\n", target, initialErr)
		return
	}
	expectedResult := queryResultWithEveryOptionalType{
		String:    arri.Some("hello world"),
		Boolean:   arri.Some(true),
		Timestamp: arri.Some(testDate),
		Float32:   arri.Some[float32](1.5),
		Float64:   arri.Some(1.5),
		Int8:      arri.Some[int8](1),
		Uint8:     arri.Some[uint8](1),
		Int16:     arri.Some[int16](10),
		Uint16:    arri.Some[uint16](10),
		Int32:     arri.Some[int32](100),
		Uint32:    arri.Some[uint32](100),
		Int64:     arri.Some[int64](1000),
		Uint64:    arri.Some[uint64](1000),
		Enum:      arri.Some("BAR"),
	}
	err := arri.FromUrlQuery(completeUrlQueryInput, &target, arri.KeyCasingCamelCase)
	if err != nil {
		t.Errorf(err.Error())
		return
	}
	if !reflect.DeepEqual(target, expectedResult) {
		t.Errorf("\n%+v\ndoes not equal\n%+v\n", target, expectedResult)
		return
	}
}
