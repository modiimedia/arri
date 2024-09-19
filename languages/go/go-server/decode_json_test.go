package arri_test

import (
	arri "arri/languages/go/go-server"
	"encoding/json"
	"os"
	"reflect"
	"testing"
)

var _objectWithEveryTypeInput, _objectWithEveryTypeInputErr = os.ReadFile("../../../tests/test-files/ObjectWithEveryType.json")

func TestDecodeObjectWithEveryType(t *testing.T) {
	if _objectWithEveryTypeInputErr != nil {
		t.Errorf(_objectWithEveryTypeInputErr.Error())
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
		Array:  []bool{true, false, false},
		Record: map[string]bool{"A": true, "B": false},
		Discriminator: discriminator{C: &discriminatorC{
			Id:   "",
			Name: "",
			Date: testDate,
		}},
		Any: "hello world",
	}
	decodeErr := arri.DecodeJSON(_objectWithEveryTypeInput, &target, arri.KeyCasingCamelCase)
	if decodeErr != nil {
		t.Errorf(decodeErr.Error())
		return
	}
	if !reflect.DeepEqual(target, expectedResult) {
		t.Errorf("\n%+v\ndoes not equal\n%+v", target, expectedResult)
		return
	}

}

func TestDecodeObjectWithOptionalFields(t *testing.T) {
	noUndefinedInput, noUndefinedInputError := os.ReadFile("../../../tests/test-files/ObjectWithOptionalFields_NoUndefined.json")
	if noUndefinedInputError != nil {
		t.Errorf(noUndefinedInputError.Error())
		return
	}
	noUndefinedTarget := objectWithOptionalFields{}
	noUndefinedExpectedResult := objectWithOptionalFields{
		String:    arri.Some(""),
		Boolean:   arri.Some(false),
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
		Enum:      arri.Some("BAZ"),
		Object:    arri.Some(nestedObject{Id: "1", Content: "hello world"}),
		Array:     arri.Some([]bool{true, false, false}),
		Record: arri.Some(map[string]bool{
			"A": true,
			"B": false,
		}),
		Discriminator: arri.Some(
			discriminator{
				C: &discriminatorC{
					Id:   "",
					Name: "",
					Date: testDate,
				},
			},
		),
		Any: arri.Some[any]("hello world"),
	}
	noUndefinedDecodingErr := arri.DecodeJSON(noUndefinedInput, &noUndefinedTarget, arri.KeyCasingCamelCase)
	if noUndefinedDecodingErr != nil {
		t.Errorf(noUndefinedDecodingErr.Error())
		return
	}
	if !reflect.DeepEqual(noUndefinedTarget, noUndefinedExpectedResult) {
		t.Errorf("\n%+v\ndoes not equal\n%+v", noUndefinedTarget, noUndefinedExpectedResult)
		return
	}
	allUndefinedInput, allUndefinedInputErr := os.ReadFile("../../../tests/test-files/ObjectWithOptionalFields_AllUndefined.json")
	if allUndefinedInputErr != nil {
		t.Errorf(allUndefinedInputErr.Error())
		return
	}
	allUndefinedTarget := objectWithOptionalFields{}
	allUndefinedExpectedResult := objectWithOptionalFields{}
	allUndefinedDecodingErr := arri.DecodeJSON(allUndefinedInput, &allUndefinedTarget, arri.KeyCasingCamelCase)
	if allUndefinedDecodingErr != nil {
		t.Errorf(allUndefinedDecodingErr.Error())
		return
	}
	if !reflect.DeepEqual(allUndefinedTarget, allUndefinedExpectedResult) {
		t.Errorf("\n%+v\ndoes not equal\n%+v", allUndefinedTarget, allUndefinedExpectedResult)
		return
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
	err := arri.DecodeJSON(userWithPrivateFieldsInput, &target, arri.KeyCasingCamelCase)
	if err != nil {
		t.Fatalf(err.Error())
	}
	if target.isAdmin {
		t.Fatalf("isAdmin should be false")
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
	err := arri.DecodeJSON(benchUserInput, &target, arri.KeyCasingCamelCase)
	if err != nil {
		t.Errorf(err.Error())
		return
	}
}

func BenchmarkStdDecodeObjectWithEveryType(b *testing.B) {
	for i := 0; i < b.N; i++ {
		target := objectWithEveryType{}
		json.Unmarshal(_objectWithEveryTypeInput, &target)
	}
}
func BenchmarkArriDecodeObjectWithEveryType(b *testing.B) {
	for i := 0; i < b.N; i++ {
		target := objectWithEveryType{}
		arri.DecodeJSON(_objectWithEveryTypeInput, &target, arri.KeyCasingCamelCase)
	}
}

func BenchmarkStdDecodeUser(b *testing.B) {
	for i := 0; i < b.N; i++ {
		user := benchUser{}
		json.Unmarshal(benchUserInput, &user)
	}
}

func BenchmarkArriDecodeUser(b *testing.B) {
	for i := 0; i < b.N; i++ {
		user := benchUser{}
		arri.DecodeJSON(benchUserInput, &user, arri.KeyCasingCamelCase)
	}
}
