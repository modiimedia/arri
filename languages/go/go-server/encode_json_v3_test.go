package arri_test

import (
	arri "arri/languages/go/go-server"
	"encoding/json"
	"fmt"
	"testing"
)

func BenchmarkV3Encoding(b *testing.B) {
	result, _ := arri.EncodeJsonV3(basicJsonInput, arri.KeyCasingCamelCase)
	fmt.Println("RESULT", string(result))
	for i := 0; i < b.N; i++ {
		arri.EncodeJsonV3(basicJsonInput, arri.KeyCasingCamelCase)
	}
}

func BenchmarkStdVsV3Encoding(b *testing.B) {
	for i := 0; i < b.N; i++ {
		json.Marshal(basicJsonInput)
	}
}
