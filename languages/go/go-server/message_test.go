package arri_test

import (
	"os"
	"reflect"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

var serverMessageWithBody = arri.NewServerSuccessMessage("12345", arri.ContentTypeJson, map[string]string{}, arri.Some([]byte("{\"message\":\"hello world\"}")))
var serverMessageWithoutBody = arri.NewServerSuccessMessage("", arri.ContentTypeJson, map[string]string{"foo": "foo"}, arri.None[[]byte]())

var serverMessageWithBodyFilePath = "../../../tests/test-files/ServerSuccessMessage_WithBody.txt"
var serverMessageWithoutBodyFilePath = "../../../tests/test-files/ServerSuccessMessage_WithoutBody.txt"

func TestEncodeServerSuccessMessage(t *testing.T) {
	dat, err := os.ReadFile(serverMessageWithBodyFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result := serverMessageWithBody.EncodeBytes()
	if !reflect.DeepEqual(result, dat) {
		t.Fatal(deepEqualErrString(string(result), string(dat)))
		return
	}
	dat, err = os.ReadFile(serverMessageWithoutBodyFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result = serverMessageWithoutBody.EncodeBytes()
	if !reflect.DeepEqual(result, dat) {
		t.Fatal(deepEqualErrString(string(result), string(dat)))
		return
	}
}

func TestDecodeServerSuccessMessage(t *testing.T) {
	dat, err := os.ReadFile(serverMessageWithBodyFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result, err := arri.DecodeMessage(dat)
	if err != nil {
		t.Fatal(err)
		return
	}
	if !reflect.DeepEqual(result, serverMessageWithBody) {
		t.Fatal(deepEqualErrString(result, serverMessageWithBody))
		return
	}
	dat, err = os.ReadFile(serverMessageWithoutBodyFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result, err = arri.DecodeMessage(dat)
	if err != nil {
		t.Fatal(err)
		return
	}
	if !reflect.DeepEqual(result, serverMessageWithoutBody) {
		t.Fatal(deepEqualErrString(result, serverMessageWithoutBody))
		return
	}
}
