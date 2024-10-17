package arri_test

import (
	"testing"

	arri "arrirpc.com/arri"
)

func BenchmarkToTypeDef(b *testing.B) {
	for i := 0; i < b.N; i++ {
		arri.ToTypeDef(basicJsonInput, arri.KeyCasingCamelCase)
	}
}
