package arri_test

import (
	"testing"
	"time"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

func TestNullableIsArriModel(t *testing.T) {
	arri.IsArriModel(arri.Null[time.Time]())
	arri.IsArriModel(arri.NotNull(""))
}

func TestOrderedMapIsArriModel(t *testing.T) {
	arri.IsArriModel(arri.OrderedMapWithData(arri.Pair("A", 1), arri.Pair("B", 2)))
}

func TestOrderedMapEncodeToJSON(t *testing.T) {
	input := arri.OrderedMapWithData(arri.Pair("A", uint32(1)), arri.Pair("B", uint32(1)), arri.Pair("F", uint32(10)))
	bytes, err := arri.EncodeJSON(input, options)
	if err != nil {
		t.Fatal(err)
		return
	}
	result := string(bytes)
	expectedResult := "{\"A\":1,\"B\":1,\"F\":10}"
	if result != expectedResult {
		t.Fatal(deepEqualErrString(result, expectedResult))
	}
	input.Set("A", 10)
	bytes, err = arri.EncodeJSON(input, options)
	if err != nil {
		t.Fatal(err)
		return
	}
	result = string(bytes)
	expectedResult = "{\"A\":10,\"B\":1,\"F\":10}"
	if result != expectedResult {
		t.Fatal(deepEqualErrString(result, expectedResult))
		return
	}
	input.Add(arri.Pair("G", uint32(2)))
	bytes, err = arri.EncodeJSON(input, options)
	if err != nil {
		t.Fatal(err)
		return
	}
	result = string(bytes)
	expectedResult = "{\"A\":10,\"B\":1,\"F\":10,\"G\":2}"
	if result != expectedResult {
		t.Fatal(deepEqualErrString(result, expectedResult))
		return
	}
}
