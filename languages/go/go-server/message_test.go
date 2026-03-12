package arri_test

import (
	"os"
	"reflect"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

var invocationMessageWithBody = arri.NewInvocationMessage("12345", "foo.fooFoo", arri.Some("1.2.5"), arri.ContentTypeJson, map[string]string{"foo": "hello foo"}, arri.Some([]byte("{\"message\":\"hello world\"}")))
var invocationMessageWithoutBody = arri.NewInvocationMessage("54321", "foo.fooFoo", arri.None[string](), arri.ContentTypeJson, arri.Headers{"foo": "hello foo", "bar": "hello bar"}, arri.None[[]byte]())
var invocationMessageWithBodyFilePath = "../../../tests/test-files/InvocationMessage_WithBody.txt"
var invocationMessageWithoutBodyFilePath = "../../../tests/test-files/InvocationMessage_WithoutBody.txt"

func TestEncodeInvocationMessage(t *testing.T) {
	dat, err := os.ReadFile(invocationMessageWithBodyFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result := invocationMessageWithBody.EncodeBytes()
	if !reflect.DeepEqual(result, dat) {
		t.Fatal(deepEqualErrString(string(result), string(dat)))
		return
	}
	dat, err = os.ReadFile(invocationMessageWithoutBodyFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result = invocationMessageWithoutBody.EncodeBytes()
	if !reflect.DeepEqual(result, dat) {
		t.Fatal(deepEqualErrString(string(result), string(dat)))
		return
	}
}

func TestDecodeInvocationMessage(t *testing.T) {
	dat, err := os.ReadFile(invocationMessageWithBodyFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result, err := arri.DecodeMessage(dat)
	if err != nil {
		t.Fatal(err)
		return
	}
	if !reflect.DeepEqual(result, invocationMessageWithBody) {
		t.Fatal(deepEqualErrString(result, invocationMessageWithBody))
		return
	}
	dat, err = os.ReadFile(invocationMessageWithoutBodyFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result, err = arri.DecodeMessage(dat)
	if err != nil {
		t.Fatal(err)
		return
	}
	if !reflect.DeepEqual(result, invocationMessageWithoutBody) {
		t.Fatal(deepEqualErrString(result, invocationMessageWithoutBody))
	}
}

var okMessageWithBody = arri.NewOkMessage("12345", arri.ContentTypeJson, map[string]string{}, arri.Some([]byte("{\"message\":\"hello world\"}")))
var okMessageWithoutBody = arri.NewOkMessage("54321", arri.ContentTypeJson, map[string]string{"foo": "foo"}, arri.None[[]byte]())
var okMessageWithBodyFilePath = "../../../tests/test-files/OkMessage_WithBody.txt"
var okMessageWithoutBodyFilePath = "../../../tests/test-files/OkMessage_WithoutBody.txt"

func TestEncodeOkMessage(t *testing.T) {
	dat, err := os.ReadFile(okMessageWithBodyFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result := okMessageWithBody.EncodeBytes()
	if !reflect.DeepEqual(result, dat) {
		t.Fatal(deepEqualErrString(string(result), string(dat)))
		return
	}
	dat, err = os.ReadFile(okMessageWithoutBodyFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result = okMessageWithoutBody.EncodeBytes()
	if !reflect.DeepEqual(result, dat) {
		t.Fatal(deepEqualErrString(string(result), string(dat)))
		return
	}
}

func TestDecodeServerSuccessMessage(t *testing.T) {
	dat, err := os.ReadFile(okMessageWithBodyFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result, err := arri.DecodeMessage(dat)
	if err != nil {
		t.Fatal(err)
		return
	}
	if !reflect.DeepEqual(result, okMessageWithBody) {
		t.Fatal(deepEqualErrString(result, okMessageWithBody))
		return
	}
	dat, err = os.ReadFile(okMessageWithoutBodyFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result, err = arri.DecodeMessage(dat)
	if err != nil {
		t.Fatal(err)
		return
	}
	if !reflect.DeepEqual(result, okMessageWithoutBody) {
		t.Fatal(deepEqualErrString(result, okMessageWithoutBody))
		return
	}
}

var heartbeatMessageWithInterval = arri.NewHeartbeatMessage(arri.Some[uint32](155))
var heartbeatMessageWithoutInterval = arri.NewHeartbeatMessage(arri.None[uint32]())
var heartbeatMessageWithIntervalFilePath = "../../../tests/test-files/HeartbeatMessage_WithInterval.txt"
var heartbeatMessageWithoutIntervalFilePath = "../../../tests/test-files/HeartbeatMessage_WithoutInterval.txt"

func TestEncodeHeartbeatMessage(t *testing.T) {
	dat, err := os.ReadFile(heartbeatMessageWithIntervalFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result := heartbeatMessageWithInterval.EncodeBytes()
	if !reflect.DeepEqual(result, dat) {
		t.Fatal(deepEqualErrString(string(result), string(dat)))
		return
	}
	dat, err = os.ReadFile(heartbeatMessageWithoutIntervalFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result = heartbeatMessageWithoutInterval.EncodeBytes()
	if !reflect.DeepEqual(result, dat) {
		t.Fatal(deepEqualErrString(string(result), string(dat)))
		return
	}
}

func TestDecodeHeartbeatMessage(t *testing.T) {
	dat, err := os.ReadFile(heartbeatMessageWithIntervalFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result, err := arri.DecodeMessage(dat)
	if err != nil {
		t.Fatal(err)
		return
	}
	if !reflect.DeepEqual(result, heartbeatMessageWithInterval) {
		t.Fatal(deepEqualErrString(result, heartbeatMessageWithInterval))
		return
	}
	dat, err = os.ReadFile(heartbeatMessageWithoutIntervalFilePath)
	if err != nil {
		t.Fatal(err)
		return
	}
	result, err = arri.DecodeMessage(dat)
	if err != nil {
		t.Fatal(err)
		return
	}
	if !reflect.DeepEqual(result, heartbeatMessageWithoutInterval) {
		t.Fatal(deepEqualErrString(result, heartbeatMessageWithoutInterval))
		return
	}
}
