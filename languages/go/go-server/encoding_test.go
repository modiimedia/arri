package main

import (
	"arri-server/arri_json"
	"os"
	"testing"
	"time"
)

type nestedObject struct {
	Id      string
	Content string
}

type objectWithEveryType struct {
	String        string
	Boolean       bool
	Timestamp     time.Time
	Float32       float32
	Float64       float64
	Int8          int8
	Uint8         uint8
	Int16         int16
	Uint16        uint16
	Int32         int32
	Uint32        uint32
	Int64         int64
	Uint64        uint64
	Enum          string `enum:"FOO,BAR,BAZ"`
	Object        nestedObject
	Array         []bool
	Record        map[string]bool
	Discriminator discriminator
	Any           any
}

type discriminator struct {
	DiscriminatorKey `discriminatorKey:"typeName"`
	A                *discriminatorA `discriminator:"A"`
	B                *discriminatorB `discriminator:"B"`
	C                *discriminatorC `discriminator:"C"`
}

type discriminatorA struct {
	Id string
}

type discriminatorB struct {
	Id   string
	Name string
}

type discriminatorC struct {
	Id   string
	Name string
	Date time.Time
}

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

func TestBasicJsonEncoding(t *testing.T) {
	reference, referenceErr := os.ReadFile("../../../tests/test-files/ObjectWithEveryType.json")
	if referenceErr != nil {
		t.Fatal(referenceErr)
		return
	}
	json, err := ToJson(basicJsonInput, CamelCase)
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
		arri_json.Marshal(basicJsonInput, CamelCase)
	}
}

func BenchmarkArriJsonEncoding(b *testing.B) {
	for i := 0; i < b.N; i++ {
		ToJson(basicJsonInput, CamelCase)
	}
}
