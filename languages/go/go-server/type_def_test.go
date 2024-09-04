package arri_test

import (
	arri "arri/languages/go/go-server"
	"testing"
)

func BenchmarkToTypeDef(b *testing.B) {
	for i := 0; i < b.N; i++ {
		arri.ToTypeDef(basicJsonInput, arri.KeyCasingCamelCase)
	}
}
