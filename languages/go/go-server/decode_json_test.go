package arri_test

import (
	"encoding/json"
	"fmt"
	"os"
	"reflect"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

var _objectWithEveryTypeInput, _objectWithEveryTypeInputErr = os.ReadFile("../../../tests/test-files/ObjectWithEveryType.json")

func TestDecodeObjectWithEveryType(t *testing.T) {
	if _objectWithEveryTypeInputErr != nil {
		t.Error(_objectWithEveryTypeInputErr.Error())
		return
	}
	target := objectWithEveryType{}
	expectedResult := objectWithEveryType{
		String:    "",
		Boolean:   false,
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
		Enum:      "BAZ",
		Object: nestedObject{
			Id:      "1",
			Content: "hello world",
		},
		Array:         []bool{true, false, false},
		Record:        map[string]bool{"A": true, "B": false},
		UnionExternal: unionExternal{Array: &[]string{"hello", "world"}},
		UnionInternal: unionInternal{Circle: &unionInternalCircle{Radius: 2.5}},
		UnionAdjacent: unionAdjacent{NullableTimestamp: ptr(arri.NotNull(testDate))},
		Any:           "hello world",
	}
	decodeErr := arri.DecodeJSON(_objectWithEveryTypeInput, &target, arri.EncodingOptions{})
	if decodeErr != nil {
		t.Error(decodeErr.Error())
		return
	}
	if !reflect.DeepEqual(target, expectedResult) {
		expectedResult.Record = map[string]bool{"B": false, "A": true}
		if !reflect.DeepEqual(target, expectedResult) {
			t.Errorf("\n%+v\ndoes not equal\n%+v", target, expectedResult)
			return
		}
	}

}

func TestDecodeObjectWithOptionalFields(t *testing.T) {
	noUndefinedInput, err := os.ReadFile("../../../tests/test-files/ObjectWithOptionalFields_NoUndefined.json")
	if err != nil {
		t.Error(err.Error())
		return
	}
	noUndefinedTarget := objectWithOptionalFields{}
	noUndefinedExpectedResult := objectWithOptionalFields{
		String:        arri.Some(""),
		Boolean:       arri.Some(false),
		Timestamp:     arri.Some(testDate),
		Float32:       arri.Some[float32](1.5),
		Float64:       arri.Some(1.5),
		Int8:          arri.Some[int8](1),
		Uint8:         arri.Some[uint8](1),
		Int16:         arri.Some[int16](10),
		Uint16:        arri.Some[uint16](10),
		Int32:         arri.Some[int32](100),
		Uint32:        arri.Some[uint32](100),
		Int64:         arri.Some[int64](1000),
		Uint64:        arri.Some[uint64](1000),
		Enum:          arri.Some("BAZ"),
		Object:        arri.Some(nestedObject{Id: "1", Content: "hello world"}),
		Array:         arri.Some([]bool{true, false, false}),
		Record:        arri.Some(map[string]bool{"A": true, "B": false}),
		UnionExternal: arri.Some(unionExternal{Array: &[]string{"hello", "world"}}),
		UnionInternal: arri.Some(unionInternal{Circle: &unionInternalCircle{Radius: 2.5}}),
		UnionAdjacent: arri.Some(unionAdjacent{NullableTimestamp: ptr(arri.NotNull(testDate))}),
		Any:           arri.Some[any]("hello world"),
	}
	noUndefinedDecodingErr := arri.DecodeJSON(noUndefinedInput, &noUndefinedTarget, arri.EncodingOptions{})
	if noUndefinedDecodingErr != nil {
		t.Error(noUndefinedDecodingErr.Error())
		return
	}
	if !reflect.DeepEqual(noUndefinedTarget, noUndefinedExpectedResult) {
		noUndefinedExpectedResult.Record.Set(map[string]bool{"B": false, "A": true})
		if !reflect.DeepEqual(noUndefinedTarget, noUndefinedExpectedResult) {
			t.Error(deepEqualErrString(noUndefinedTarget, noUndefinedExpectedResult))
			return
		}
	}
	allUndefinedInput, err := os.ReadFile("../../../tests/test-files/ObjectWithOptionalFields_AllUndefined.json")
	if err != nil {
		t.Error(err.Error())
		return
	}
	allUndefinedTarget := objectWithOptionalFields{}
	allUndefinedExpectedResult := objectWithOptionalFields{}
	allUndefinedDecodingErr := arri.DecodeJSON(allUndefinedInput, &allUndefinedTarget, arri.EncodingOptions{})
	if allUndefinedDecodingErr != nil {
		t.Error(allUndefinedDecodingErr.Error())
		return
	}
	if !reflect.DeepEqual(allUndefinedTarget, allUndefinedExpectedResult) {
		t.Error(deepEqualErrString(allUndefinedTarget, allUndefinedExpectedResult))
		return
	}
}

func TestDecodeObjectWithNullableFieldsAllNull(t *testing.T) {
	input, inputErr := os.ReadFile("../../../tests/test-files/ObjectWithNullableFields_AllNull.json")
	if inputErr != nil {
		t.Error(inputErr.Error())
		return
	}
	result := objectWithNullableFields{}
	expectedResult := objectWithNullableFields{}
	err := arri.DecodeJSON(input, &result, arri.EncodingOptions{})
	if err != nil {
		t.Error(err.Error())
		return
	}
	if !reflect.DeepEqual(result, expectedResult) {
		t.Error(deepEqualErrString(result, expectedResult))
		return
	}
}

func TestDecodeObjectWithNullableFieldsNoNull(t *testing.T) {
	input, inputErr := os.ReadFile("../../../tests/test-files/ObjectWithNullableFields_NoNull.json")
	if inputErr != nil {
		t.Error(inputErr.Error())
		return
	}
	result := objectWithNullableFields{}
	expectedResult := objectWithNullableFields{
		String:        arri.NotNull(""),
		Boolean:       arri.NotNull(true),
		Timestamp:     arri.NotNull(testDate),
		Float32:       arri.NotNull[float32](1.5),
		Float64:       arri.NotNull(1.5),
		Int8:          arri.NotNull[int8](1),
		Uint8:         arri.NotNull[uint8](1),
		Int16:         arri.NotNull[int16](10),
		Uint16:        arri.NotNull[uint16](10),
		Int32:         arri.NotNull[int32](100),
		Uint32:        arri.NotNull[uint32](100),
		Int64:         arri.NotNull[int64](1000),
		Uint64:        arri.NotNull[uint64](1000),
		Enum:          arri.NotNull("BAZ"),
		Object:        arri.NotNull(nestedObject{Id: "", Content: ""}),
		Array:         arri.NotNull([]bool{true, false, false}),
		Record:        arri.NotNull(map[string]bool{"A": true, "B": false}),
		UnionExternal: arri.NotNull(unionExternal{Array: &[]string{"hello", "world"}}),
		UnionInternal: arri.NotNull(unionInternal{Circle: &unionInternalCircle{Radius: 2.5}}),
		UnionAdjacent: arri.NotNull(unionAdjacent{Boolean: ptr(true)}),
		Any: arri.NotNull[any](map[string]any{
			"message": "hello world",
		}),
	}
	err := arri.DecodeJSON(input, &result, arri.EncodingOptions{})
	if err != nil {
		t.Error(err.Error())
		return
	}
	if !reflect.DeepEqual(result, expectedResult) {
		expectedResult.Record.Set(map[string]bool{"B": false, "A": true})
		if !reflect.DeepEqual(result, expectedResult) {
			t.Error(deepEqualErrString(result, expectedResult))
			return
		}
	}

}

type userWithPrivateFields struct {
	Id      string
	Name    string
	isAdmin bool
}

var userWithPrivateFieldsInput = []byte(`{"id":"1","name":"John Doe","isAdmin":true}`)

func TestDecodedPrivateFields(t *testing.T) {
	target := userWithPrivateFields{}
	err := arri.DecodeJSON(userWithPrivateFieldsInput, &target, arri.EncodingOptions{})
	if err != nil {
		t.Fatal(err.Error())
	}
	if target.isAdmin {
		t.Fatal("isAdmin should be false")
	}
}

type benchUser struct {
	Id       string              `json:"id"`
	Name     arri.Option[string] `json:"name"`
	Email    string              `json:"email"`
	IsAdmin  bool                `json:"isAdmin"`
	Role     string              `enum:"STANDARD,ADMIN"`
	Metadata struct {
		Foo string `json:"foo"`
		Bar bool   `json:"bar"`
		Baz string `json:"baz"`
	} `json:"metadata"`
}

var benchUserInput = []byte(`{"id":"1","role":"ADMIN","email":"johndoe@gmail.com","isAdmin":true,"metadata":{"foo":"FOO","bar":true,"baz":"BAZ"}}`)

func TestDecodeStdUser(t *testing.T) {
	target := benchUser{}
	json.Unmarshal(benchUserInput, &target)
	err := arri.DecodeJSON(benchUserInput, &target, arri.EncodingOptions{})
	if err != nil {
		t.Error(err.Error())
		return
	}
}

func BenchmarkArriDecodeUser(b *testing.B) {
	for i := 0; i < b.N; i++ {
		user := benchUser{}
		arri.DecodeJSON(benchUserInput, &user, arri.EncodingOptions{})
	}
}

func BenchmarkStdDecodeUser(b *testing.B) {
	for i := 0; i < b.N; i++ {
		user := benchUser{}
		json.Unmarshal(benchUserInput, &user)
	}
}

func BenchmarkArriDecodeObjectWithEveryType(b *testing.B) {
	for i := 0; i < b.N; i++ {
		target := objectWithEveryType{}
		arri.DecodeJSON(_objectWithEveryTypeInput, &target, arri.EncodingOptions{})
	}
}

func BenchmarkStdDecodeObjectWithEveryType(b *testing.B) {
	for i := 0; i < b.N; i++ {
		target := objectWithEveryType{}
		json.Unmarshal(_objectWithEveryTypeInput, &target)
	}
}

func TestDecodeRecursiveObject(t *testing.T) {
	expectedResult := recursiveObject{
		Left: &recursiveObject{
			Left: &recursiveObject{
				Left: nil,
				Right: &recursiveObject{
					Left:  nil,
					Right: nil,
				},
			},
			Right: nil,
		},
		Right: &recursiveObject{},
	}
	input, inputErr := os.ReadFile("../../../tests/test-files/RecursiveObject.json")
	if inputErr != nil {
		t.Fatal(inputErr)
		return
	}
	result := recursiveObject{}
	resultErr := arri.DecodeJSON(input, &result, arri.EncodingOptions{})
	if resultErr != nil {
		errMsg, _ := arri.EncodeJSON(resultErr, arri.EncodingOptions{})
		fmt.Println(string(errMsg))
		t.Fatal(resultErr)
		return
	}
	if !reflect.DeepEqual(result, expectedResult) {
		t.Fatal(deepEqualErrString(result, expectedResult))
		return
	}

}

func TestDecodeNothing(t *testing.T) {
	result := struct {
		String  string
		Float32 float32
	}{}
	err := arri.DecodeJSON([]byte{}, &result, arri.EncodingOptions{})
	if err == nil {
		t.Error("Should return an error")
		return
	}
}

func TestDecodeBadStringInput(t *testing.T) {
	target := objectWithEveryType{}
	emptyInput := ""
	objectInput := "{}"
	err := arri.DecodeJSON([]byte(emptyInput), &target, arri.EncodingOptions{})
	if err == nil {
		t.Fatalf("should have an error")
	}
	if len(err.Errors) != 1 {
		t.Fatalf("should return 1 error")
	}
	err = arri.DecodeJSON([]byte(objectInput), &target, arri.EncodingOptions{})
	if err == nil {
		t.Fatalf("should have errors")
		return
	}
	if len(err.Errors) != 20 {
		t.Fatalf("should have 20 errors. got %d: %+v", len(err.Errors), err.Errors)
		return
	}
}

func TestDecodeLongArrays(t *testing.T) {
	type nestedArrays struct {
		Items  []string
		Nested [][]int32
		Nulls  []arri.Nullable[string]
	}
	input := []byte(`{"items":["a","b","c","d","e","f","g","h","i","j"],"nested":[[1,2,3,4,5],[],[],[],[6]],"nulls":[null,null,null,null,"a"]}`)
	var result nestedArrays
	err := arri.DecodeJSON(input, &result, arri.EncodingOptions{})
	if err != nil {
		t.Fatalf("%+v", err.Errors)
	}
	if len(result.Items) != 10 || result.Items[9] != "j" {
		t.Fatalf("unexpected items %+v", result.Items)
	}
	if len(result.Nested) != 5 || len(result.Nested[0]) != 5 || result.Nested[4][0] != 6 {
		t.Fatalf("unexpected nested arrays %+v", result.Nested)
	}
	if len(result.Nulls) != 5 || result.Nulls[4].Unwrap() != "a" {
		t.Fatalf("unexpected nullable items %+v", result.Nulls)
	}
}

func TestDecodeArraysRespectMaxDepth(t *testing.T) {
	type deep struct {
		Value [][][]int32
	}
	var result deep
	err := arri.DecodeJSON([]byte(`{"value":[[[1]]]}`), &result, arri.EncodingOptions{MaxDepth: 2})
	if err == nil {
		t.Fatal("expected arrays nested past the max depth to fail")
	}
	err = arri.DecodeJSON([]byte(`{"value":[[[1]]]}`), &result, arri.EncodingOptions{MaxDepth: 10})
	if err != nil {
		t.Fatalf("%+v", err.Errors)
	}
}
