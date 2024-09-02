package main

import (
	"reflect"
	"testing"
)

func TestDecodeUser(t *testing.T) {
	input := []byte(`{"id":"1","name":"john doe","email":"johndoe@gmail.com","isAdmin":true}`)
	target := User{}
	expectedResult := User{Id: "1", Name: Some("john doe"), Email: "johndoe@gmail.com", IsAdmin: true}
	FromJson(input, target)
	if !reflect.DeepEqual(target, expectedResult) {
		t.Errorf("\n%+v\ndoes not equal\n%+v", target, expectedResult)
		return
	}
}
