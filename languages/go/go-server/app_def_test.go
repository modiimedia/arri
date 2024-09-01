package main

import "testing"

func myTestFunc(_ Message) (Shape, error) {
	return Shape{}, nil
}

func BenchmarkToRpcDef(b *testing.B) {
	for i := 0; i < b.N; i++ {
		ToRpcDef(myTestFunc, ArriHttpRpcOptions{Path: "/my-test-func", Method: HttpMethodPost})
	}
}
