package arri_test

import (
	"os"
	"reflect"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

var clientMessageWithBody = arri.NewClientMessage("12345", "foo.fooFoo", arri.Some("1.2.5"), arri.ContentTypeJson, map[string]string{"foo": "hello foo"}, arri.Some([]byte("{\"message\":\"hello world\"}")))
var clientMessageWithoutBody = arri.NewClientMessage("54321", "foo.fooFoo", arri.None[string](), arri.ContentTypeJson, arri.Headers{"foo": "hello foo", "bar": "hello bar"}, arri.None[[]byte]())
var clientMessageWithBodyFilePath = "../../../tests/test-files/InvocationMessage_WithBody.txt"
var clientMessageWithoutBodyFilePath = "../../../tests/test-files/InvocationMessage_WithoutBody.txt"

func TestEncodeClientMessage(t *testing.T) {
	dat, err := os.ReadFile(clientMessageWithBodyFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result := clientMessageWithBody.EncodeBytes()
	if !reflect.DeepEqual(result, dat) {
		t.Fatal(deepEqualErrString(string(result), string(dat)))
		return
	}
	dat, err = os.ReadFile(clientMessageWithoutBodyFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result = clientMessageWithoutBody.EncodeBytes()
	if !reflect.DeepEqual(result, dat) {
		t.Fatal(deepEqualErrString(string(result), string(dat)))
		return
	}
}

func TestDecodeClientMessage(t *testing.T) {
	dat, err := os.ReadFile(clientMessageWithBodyFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result, err := arri.DecodeMessage(dat)
	if err != nil {
		t.Fatal(err)
		return
	}
	if !reflect.DeepEqual(result, clientMessageWithBody) {
		t.Fatal(deepEqualErrString(result, clientMessageWithBody))
		return
	}
	dat, err = os.ReadFile(clientMessageWithoutBodyFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result, err = arri.DecodeMessage(dat)
	if err != nil {
		t.Fatal(err)
		return
	}
	if !reflect.DeepEqual(result, clientMessageWithoutBody) {
		t.Fatal(deepEqualErrString(result, clientMessageWithoutBody))
	}
}

var serverMessageWithBody = arri.NewServerSuccessMessage("12345", arri.ContentTypeJson, map[string]string{}, arri.Some([]byte("{\"message\":\"hello world\"}")))
var serverMessageWithoutBody = arri.NewServerSuccessMessage("54321", arri.ContentTypeJson, map[string]string{"foo": "foo"}, arri.None[[]byte]())
var serverMessageWithBodyFilePath = "../../../tests/test-files/OkMessage_WithBody.txt"
var serverMessageWithoutBodyFilePath = "../../../tests/test-files/OkMessage_WithoutBody.txt"

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
