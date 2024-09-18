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

func BenchmarkV2Encoding(b *testing.B) {
	e, err := arri.CompileJSONEncoder(basicJsonInput, arri.KeyCasingCamelCase)
	if err != nil {
		b.Fatalf(err.Error())
	}
	if e == nil {
		b.Fatalf("Encoder is nil")
	}
	ptr := unsafe.Pointer(&basicJsonInput)
	example, _ := e(ptr, arri.NewEncodingContext(arri.KeyCasingCamelCase))
	fmt.Println("RESULT", string(example))
	for i := 0; i < b.N; i++ {
		e(ptr, arri.NewEncodingContext(arri.KeyCasingCamelCase))
	}
}

func BenchmarkStdEncodingAgainstV2(b *testing.B) {
	for i := 0; i < b.N; i++ {
		_, err := json.Marshal(basicJsonInput)
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
