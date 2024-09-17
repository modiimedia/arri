package arri_test

import (
	arri "arri/languages/go/go-server"
	"encoding/json"
	"fmt"
	"os"
	"testing"
	"time"
	"unsafe"
)

var testDate = time.Date(2001, time.January, 01, 16, 0, 0, 0, time.UTC)
var basicJsonInput = objectWithEveryType{
	String:        "",
	Boolean:       false,
	Timestamp:     testDate,
	Float32:       1.5,
	Float64:       1.5,
	Int8:          1,
	Uint8:         1,
	Int16:         10,
	Uint16:        10,
	Int32:         100,
	Uint32:        100,
	Int64:         1000,
	Uint64:        1000,
	Enum:          "BAZ",
	Object:        nestedObject{Id: "1", Content: "hello world"},
	Array:         []bool{true, false, false},
	Record:        map[string]bool{"A": true, "B": false},
	Discriminator: discriminator{C: &discriminatorC{Id: "", Name: "", Date: testDate}},
	Any:           "hello world",
}

type userV2 struct {
	Int8      int8
	Uint8     uint8
	Int16     int16
	Uint16    uint16
	Int32     int32
	Uint32    uint32
	Int64     int64
	Uint64    uint64
	Foo       int8
	Bar       int8
	Baz       int8
	BazBaz    int8
	BazBazBaz int8
}

var userV2Input userV2 = userV2{
	Int8:   1,
	Uint8:  1,
	Int16:  10,
	Uint16: 10,
	Int32:  100,
	Uint32: 100,
	Int64:  1000,
	Uint64: 1000,
}

func BenchmarkV2Encoding(b *testing.B) {
	e, err := arri.CompileJSONEncoder(userV2Input, arri.KeyCasingCamelCase)
	if err != nil {
		b.Fatalf(err.Error())
	}
	if e == nil {
		b.Fatalf("Encoder is nil")
	}
	ptr := unsafe.Pointer(&userV2Input)
	example, _ := e(ptr, arri.NewEncodingContext(arri.KeyCasingCamelCase))
	fmt.Println("RESULT", string(example))
	for i := 0; i < b.N; i++ {
		e(ptr, arri.NewEncodingContext(arri.KeyCasingCamelCase))
	}
}

func BenchmarkStdEncodingAgainstV2(b *testing.B) {
	result, _ := json.Marshal(userV2Input)
	fmt.Println("RESULT", string(result))
	for i := 0; i < b.N; i++ {
		_, err := json.Marshal(userV2Input)
		if err != nil {
			b.Fatalf(err.Error())
		}
	}
}

func TestBasicJsonEncoding(t *testing.T) {
	reference, referenceErr := os.ReadFile("../../../tests/test-files/ObjectWithEveryType.json")
	if referenceErr != nil {
		t.Fatal(referenceErr)
		return
	}
	json, err := arri.EncodeJSON(basicJsonInput, arri.KeyCasingCamelCase)
	if err != nil {
		t.Fatal(err)
		return
	}
	if string(json) != string(reference) {
		t.Fatal("\n", string(json), "\nis not equal to\n", string(reference))
		return
	}
}

func BenchmarkStdJsonEncoding(b *testing.B) {
	for i := 0; i < b.N; i++ {
		json.Marshal(basicJsonInput)
	}
}

func BenchmarkArriJsonEncoding(b *testing.B) {
	for i := 0; i < b.N; i++ {
		arri.EncodeJSON(basicJsonInput, arri.KeyCasingCamelCase)
	}
}
