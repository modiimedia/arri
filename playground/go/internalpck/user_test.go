package internalpck_test

import (
	"arri_go_playground/internalpck"
	"encoding/json"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

var testInput = []byte("{\"id\":\"12345\",\"name\":\"John Doe\",\"settings\":{\"prefersDarkMode\":false}}")

func BenchmarkUserDecodeJSON_Std(b *testing.B) {
	for i := 0; i < b.N; i++ {
		var user = internalpck.User{}
		err := json.Unmarshal(testInput, &user)
		if err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkUserDecodeJSON_Arri(b *testing.B) {
	for i := 0; i < b.N; i++ {
		var user = internalpck.User{}
		err := arri.DecodeJSON(testInput, &user, arri.EncodingOptions{})
		if err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkUserDecodeJSON_ArriPreCompiled(b *testing.B) {
	for i := 0; i < b.N; i++ {
		var user = internalpck.User{}
		err := arri.CompiledDecodeJSON(&user, testInput)
		if err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkUserEncodeJSON_Std(b *testing.B) {
	for i := 0; i < b.N; i++ {
		var user = internalpck.User{}
		_, err := json.Marshal(user)
		if err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkUserEncodeJSON_Arri(b *testing.B) {
	for i := 0; i < b.N; i++ {
		var user = internalpck.User{}
		_, err := arri.EncodeJSON(user, arri.EncodingOptions{})
		if err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkUserEncodeJSON_ArriPreCompiled(b *testing.B) {
	for i := 0; i < b.N; i++ {
		var user = internalpck.User{}
		_, err := arri.CompiledEncodeJSON(&user)
		if err != nil {
			b.Fatal(err)
		}
	}

}
