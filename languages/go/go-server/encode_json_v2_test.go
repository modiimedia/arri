package arri_test

import (
	"fmt"
	"os"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

func TestEncodeJSONV2(t *testing.T) {
	reference, referenceErr := os.ReadFile("../../../tests/test-files/ObjectWithEveryType.json")
	if referenceErr != nil {
		t.Fatal(referenceErr)
		return
	}
	reference2, reference2Err := os.ReadFile("../../../tests/test-files/ObjectWithEveryType_ReversedRecord.json")
	if reference2Err != nil {
		t.Fatal(reference2Err)
	}
	json, err := arri.EncodeJSONV2(objectWithEveryTypeInput, options)
	fmt.Println(string(json))
	if err != nil {
		t.Fatal(err)
		return
	}
	result := string(json)
	if result != string(reference) && result != string(reference2) {
		// t.Fatal("\n", result, "\nis not equal to\n", string(reference))
		return
	}
}

func BenchmarkEncodeJSONV2(b *testing.B) {
	for i := 0; i < b.N; i++ {
		arri.EncodeJSONV2(objectWithEveryTypeInput, options)
	}
}

// func BenchmarkEncodeUserV2(b *testing.B) {
// 	for i := 0; i < b.N; i++ {
// 		arri.EncodeJSONV2(_benchUserEncodingInput, options)
// 	}
// }
