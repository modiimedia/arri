package utils_test

import (
	"reflect"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
	"github.com/modiimedia/arri/languages/go/go-server/utils"
)

type Foo struct {
	Foo string
	Bar int
	Baz bool
}

func TestIsOptionType(t *testing.T) {
	stringInput := arri.None[string]()
	structInput := arri.Some(Foo{})

	if !utils.IsOptionalType(reflect.TypeOf(stringInput)) {
		t.Fatal()
	}

	if !utils.IsOptionalType(reflect.TypeOf(&stringInput)) {
		t.Fatal()
	}

	if !utils.IsOptionalType(reflect.TypeOf(structInput)) {
		t.Fatal()
	}

	if !utils.IsOptionalType(reflect.TypeOf(&structInput)) {
		t.Fatal()
	}

	if utils.IsOptionalType(reflect.TypeOf(Foo{})) {
		t.Fatalf("foo is not a valid optional")
	}

	if utils.IsOptionalType(reflect.TypeOf("Hello world")) {
		t.Fatalf("string is not a valid optional")
	}
}

func TestIsNullableType(t *testing.T) {
	stringInput := arri.Null[string]()
	structInput := arri.NotNull(Foo{})

	if !utils.IsNullableType(reflect.TypeOf(stringInput)) {
		t.Fatal()
	}

	if !utils.IsNullableType(reflect.TypeOf(structInput)) {
		t.Fatal()
	}

	if utils.IsNullableType(reflect.TypeOf(Foo{})) {
		t.Fatal()
	}

	if utils.IsNullableType(reflect.TypeOf("Hello world")) {
		t.Fatal()
	}
}

func BenchmarkIsNullableType(b *testing.B) {
	v := reflect.TypeOf("")
	for i := 0; i < b.N; i++ {
		utils.IsNullableType(v)
	}

}
