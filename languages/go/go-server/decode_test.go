package main

import (
	"encoding/json"
	"reflect"
	"testing"
)

func TestDecodeUser(t *testing.T) {
	input := []byte(`{"id":"1","name":"john doe","email":"johndoe@gmail.com","isAdmin":true}`)
	target := User{}
	expectedResult := User{Id: "1", Name: Some("john doe"), Email: "johndoe@gmail.com", IsAdmin: true}
	FromJson(input, &target)
	if !reflect.DeepEqual(target, expectedResult) {
		t.Errorf("\n%+v\ndoes not equal\n%+v", target, expectedResult)
		return
	}
	input2 := []byte(`{"id":"1","email":"johndoe@gmail.com","isAdmin":true}`)
	target2 := User{}
	expectedResult2 := User{Id: "1", Name: None[string](), Email: "johndoe@gmail.com", IsAdmin: true}
	FromJson(input2, &target2)
	if !reflect.DeepEqual(target2, expectedResult2) {
		t.Errorf("\n%+v\ndoes not equal\n%+v", target2, expectedResult2)
		return
	}

}

type benchUser struct {
	Id      string
	Name    Nullable[string]
	Email   string
	IsAdmin bool
}

var benchUserInput = []byte(`{"id":"1","name":"john doe","email":"johndoe@gmail.com","isAdmin":true}`)

func BenchmarkStdDecodeUser(b *testing.B) {
	for i := 0; i < b.N; i++ {
		user := benchUser{}
		json.Unmarshal(benchUserInput, &user)
	}
}

func BenchmarkArriDecodeUser(b *testing.B) {
	for i := 0; i < b.N; i++ {
		user := benchUser{}
		FromJson(benchUserInput, &user)
	}
}
