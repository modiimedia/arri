package main

import "testing"

func BenchmarkToTypeDef(b *testing.B) {
	for i := 0; i < b.N; i++ {
		ToTypeDef(basicJsonInput, KeyCasingCamelCase)
	}
}
