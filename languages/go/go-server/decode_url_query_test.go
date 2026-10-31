package arri_test

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"reflect"
	"strings"
	"testing"
	"time"

	arri "github.com/modiimedia/arri/languages/go/go-server"
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
	arri.DecodeQueryParams(completeUrlQueryInput, &target, options)
	if !reflect.DeepEqual(target, expectedResult) {
		t.Errorf("\n%+v\ndoes not equal\n%+v\n", target, expectedResult)
		return
	}
}

func TestFromUrlQueryWithEveryTypeWithBadInput(t *testing.T) {
	target := queryResultWithEveryType{}
	input := map[string][]string{}
	err := arri.DecodeQueryParams(input, &target, arri.EncodingOptions{})
	if err == nil {
		t.Fatalf("should return an error")
		return
	}
	if len(err.Errors) != 14 {
		t.Fatalf("should have 14 validation errors")
		return
	}
}

func BenchmarkFromUrlQueryWithEveryType(b *testing.B) {
	for i := 0; i < b.N; i++ {
		target := queryResultWithEveryType{}
		arri.DecodeQueryParams(completeUrlQueryInput, &target, options)
	}
}

func TestFromUrlQueryWithEveryOptionalType(t *testing.T) {
	target := queryResultWithEveryOptionalType{}
	initialErr := arri.DecodeQueryParams(map[string][]string{}, &target, options)
	if initialErr != nil {
		t.Error(initialErr.Error())
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
	err := arri.DecodeQueryParams(completeUrlQueryInput, &target, options)
	if err != nil {
		t.Error(err.Error())
		return
	}
	if !reflect.DeepEqual(target, expectedResult) {
		t.Errorf("\n%+v\ndoes not equal\n%+v\n", target, expectedResult)
		return
	}
}

type queryParamsWithKeyTag struct {
	UserId string `key:"user_id"`
	Limit  arri.Option[int32]
}

func TestFromUrlQueryWithKeyTag(t *testing.T) {
	target := queryParamsWithKeyTag{}
	err := arri.DecodeQueryParams(map[string][]string{"user_id": {"12345"}, "limit": {"10"}}, &target, options)
	if err != nil {
		t.Fatal(err.Errors)
	}
	expectedResult := queryParamsWithKeyTag{UserId: "12345", Limit: arri.Some[int32](10)}
	if !reflect.DeepEqual(target, expectedResult) {
		t.Fatalf("\n%+v\ndoes not equal\n%+v\n", target, expectedResult)
	}
	err = arri.DecodeQueryParams(map[string][]string{"userId": {"12345"}}, &target, options)
	if err == nil || len(err.Errors) != 1 || err.Errors[0].InstancePath != "/user_id" || err.Errors[0].SchemaPath != "/properties/user_id" {
		t.Fatalf("expected a missing field error for /user_id. got %+v", err)
	}
}

func TestFromUrlQueryWithUnion(t *testing.T) {
	target := unionInternal{Rectangle: &unionInternalRectangle{}}
	err := arri.DecodeQueryParams(map[string][]string{"shape": {"circle"}, "radius": {"2.5"}}, &target, options)
	if err != nil {
		t.Fatal(err.Errors)
	}
	expectedResult := unionInternal{Circle: &unionInternalCircle{Radius: 2.5}}
	if !reflect.DeepEqual(target, expectedResult) {
		t.Fatal(deepEqualErrString(target, expectedResult))
	}
	legacyTarget := legacyDiscriminator{}
	err = arri.DecodeQueryParams(map[string][]string{"typeName": {"B"}, "id": {"1"}, "name": {"John Doe"}}, &legacyTarget, options)
	if err != nil {
		t.Fatal(err.Errors)
	}
	expectedLegacyResult := legacyDiscriminator{B: &legacyDiscriminatorB{Id: "1", Name: "John Doe"}}
	if !reflect.DeepEqual(legacyTarget, expectedLegacyResult) {
		t.Fatal(deepEqualErrString(legacyTarget, expectedLegacyResult))
	}
}

func TestFromUrlQueryWithUnionErrors(t *testing.T) {
	cases := []struct {
		input        map[string][]string
		message      string
		instancePath string
		schemaPath   string
	}{
		{map[string][]string{"radius": {"2.5"}}, `missing union tag "shape"`, "/shape", "/tagKey"},
		{map[string][]string{"shape": {"triangle"}}, `"triangle" is not a valid union variant`, "/shape", "/union"},
		{map[string][]string{"shape": {"circle"}}, "missing required field", "/radius", "/union/circle/properties/radius"},
		{map[string][]string{"shape": {"circle"}, "radius": {"big"}}, "invalid syntax", "/radius", "/union/circle/properties/radius"},
	}
	for _, c := range cases {
		target := unionInternal{}
		err := arri.DecodeQueryParams(c.input, &target, options)
		if err == nil || len(err.Errors) != 1 {
			t.Fatalf("expected one error for %+v. got %+v", c.input, err)
		}
		e := err.Errors[0]
		if !strings.Contains(e.Message, c.message) || e.InstancePath != c.instancePath || e.SchemaPath != c.schemaPath {
			t.Fatalf("unexpected error for %+v. got %+v", c.input, e)
		}
	}
	externalTarget := unionExternal{}
	err := arri.DecodeQueryParams(map[string][]string{"boolean": {"true"}}, &externalTarget, options)
	if err == nil || !strings.Contains(err.Errors[0].Message, "only internally tagged unions") {
		t.Fatalf("expected externally tagged unions to be rejected. got %+v", err)
	}
}

func GetShape(params unionInternal, _ arri.DefaultEvent) (unionInternal, arri.RpcError) {
	return params, nil
}

type getNestedParams struct {
	Id     string
	Filter arri.Option[nestedObject]
}

func GetNested(params getNestedParams, _ arri.DefaultEvent) (getNestedParams, arri.RpcError) {
	return params, nil
}

func GetAdjacent(params unionAdjacent, _ arri.DefaultEvent) (unionAdjacent, arri.RpcError) {
	return params, nil
}

func TestGetRpcWithUnionParams(t *testing.T) {
	app := arri.NewApp(http.NewServeMux(), arri.AppOptions[arri.DefaultEvent]{}, arri.CreateDefaultEvent)
	arri.Rpc(&app, GetShape, arri.RpcOptions{Method: arri.HttpMethodGet})
	appDef := app.GetAppDefinition()
	path := appDef.Procedures.Values()[0].Http.Path
	request := httptest.NewRequest(http.MethodGet, path+"?shape=rectangle&width=10.5&height=5", nil)
	recorder := httptest.NewRecorder()
	app.Mux.ServeHTTP(recorder, request)
	expectedBody := `{"shape":"rectangle","width":10.5,"height":5}`
	if recorder.Code != 200 || recorder.Body.String() != expectedBody {
		t.Fatalf("expected 200 %s. got %d %s", expectedBody, recorder.Code, recorder.Body.String())
	}
	request = httptest.NewRequest(http.MethodGet, path+"?shape=triangle", nil)
	recorder = httptest.NewRecorder()
	app.Mux.ServeHTTP(recorder, request)
	if recorder.Code != 400 {
		t.Fatalf("expected 400. got %d %s", recorder.Code, recorder.Body.String())
	}
}

func TestGetRpcWithUnsupportedParams(t *testing.T) {
	cases := []struct {
		register func(app *arri.App[arri.DefaultEvent])
		message  string
	}{
		{
			func(app *arri.App[arri.DefaultEvent]) {
				arri.Rpc(app, GetNested, arri.RpcOptions{Method: arri.HttpMethodGet})
			},
			`"/filter" cannot be passed through url query params`,
		},
		{
			func(app *arri.App[arri.DefaultEvent]) {
				arri.Rpc(app, GetAdjacent, arri.RpcOptions{Method: arri.HttpMethodGet})
			},
			"only internally tagged unions can be used as url query params",
		},
	}
	for _, c := range cases {
		func() {
			defer func() {
				err := recover()
				if err == nil || !strings.Contains(fmt.Sprint(err), c.message) {
					t.Fatalf("expected a panic containing %q. got %v", c.message, err)
				}
			}()
			app := arri.NewApp(http.NewServeMux(), arri.AppOptions[arri.DefaultEvent]{}, arri.CreateDefaultEvent)
			c.register(&app)
		}()
	}
	// the same params are fine for other http methods
	app := arri.NewApp(http.NewServeMux(), arri.AppOptions[arri.DefaultEvent]{}, arri.CreateDefaultEvent)
	arri.Rpc(&app, GetNested, arri.RpcOptions{})
	arri.Rpc(&app, GetAdjacent, arri.RpcOptions{})
}
