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
	decodeErr := arri.FromJson(_objectWithEveryTypeInput, &target, arri.KeyCasingCamelCase)
	if decodeErr != nil {
		t.Errorf(decodeErr.Error())
		return
	}
	if !reflect.DeepEqual(target, expectedResult) {
		t.Errorf("\n%+v\ndoes not equal\n%+v", target, expectedResult)
		return
	}

}

type benchUser struct {
	Id       string              `json:"id"`
	Name     arri.Option[string] `json:"name"`
	Email    string              `json:"email"`
	IsAdmin  bool                `json:"isAdmin"`
	Metadata struct {
		Foo string `json:"foo"`
		Bar bool   `json:"bar"`
		Baz string `json:"baz"`
	} `json:"metadata"`
}

var benchUserInput = []byte(`{"id":"1","email":"johndoe@gmail.com","isAdmin":true,"metadata":{"foo":"FOO","bar":true,"baz":"BAZ"}}`)

func TestDecodeStdUser(t *testing.T) {
	target := benchUser{}
	json.Unmarshal(benchUserInput, &target)
	err := arri.FromJson(benchUserInput, &target, arri.KeyCasingCamelCase)
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
		arri.FromJson(_objectWithEveryTypeInput, &target, arri.KeyCasingCamelCase)
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
		arri.FromJson(benchUserInput, &user, arri.KeyCasingCamelCase)
	}
}
