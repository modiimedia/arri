package arri

import (
	"testing"
	"time"
)

type message struct {
	Id        string
	Name      string
	Email     Nullable[string]
	CreatedAt time.Time
	UpdatedAt time.Time
	Message   string
}

func myTestFunc(_ message, _ any) (*message, error) {
	return &message{}, nil
}

func BenchmarkToRpcDef(b *testing.B) {
	for i := 0; i < b.N; i++ {
		ToRpcDef(myTestFunc, ArriHttpRpcOptions{Path: "/my-test-func", Method: HttpMethodPost})
	}
}
