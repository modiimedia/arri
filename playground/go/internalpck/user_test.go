package internalpck_test

import (
	"arri_go_playground/internalpck"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

var json = []byte("{\"id\":\"12345\",\"name\":\"John Doe\"}")

func BenchmarkUserDecodeJSON(b *testing.B) {
	for i := 0; i < b.N; i++ {
		var user = internalpck.User{}
		err := arri.DecodeJSON(json, &user, arri.EncodingOptions{})
		if err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkUserDecodeJSONPreCompiled(b *testing.B) {
	for i := 0; i < b.N; i++ {
		var user = internalpck.User{}
		err := arri.CompiledDecodeJSON(&user, json)
		if err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkUserEncodeJSON(b *testing.B) {
	for i := 0; i < b.N; i++ {
		var user = internalpck.User{}
		_, err := arri.EncodeJSON(user, arri.EncodingOptions{})
		if err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkUserEncodeJSONPreCompiled(b *testing.B) {
	for i := 0; i < b.N; i++ {
		var user = internalpck.User{}
		_, err := arri.CompiledEncodeJSON(&user)
		if err != nil {
			b.Fatal(err)
		}
	}

}
