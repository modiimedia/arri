package arri_test

import (
	"reflect"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

var clientMessage = arri.ClientMessage{
	ArriRpcVersion: "0.0.8",
	RpcName:        "example.foo.bar",
	ContentType:    "application/json",
	ReqId:          arri.Some("15"),
	ClientVersion:  arri.Some("1"),
	CustomHeaders:  arri.Headers{"foo": "foo"},
	Body:           arri.Some([]byte("{\"message\":\"hello world\"}")),
}
var clientMessageEncoded = []byte(`ARRIRPC/0.0.8 example.foo.bar
content-type: application/json
req-id: 15
client-version: 1
foo: foo

{"message":"hello world"}`)
var successServerMessage = arri.ServerMessage{
	ArriRpcVersion: "0.0.8",
	Success:        true,
	ContentType:    "application/json",
	ReqId:          arri.Some("15"),
	CustomHeaders:  arri.Headers{"foo": "foo"},
	Body:           arri.Some([]byte("{\"message\":\"hello world\"}")),
}
var successServerMessageEncoded = []byte(`ARRIRPC/0.0.8 SUCCESS
content-type: application/json
req-id: 15
foo: foo

{"message":"hello world"}`)
var failureServerMessage = arri.ServerMessage{
	ArriRpcVersion: "0.0.8",
	Success:        false,
	ContentType:    "application/json",
	ReqId:          arri.Some("15"),
	CustomHeaders:  arri.Headers{"foo": "foo"},
	Body:           arri.Some([]byte(`{"code":12345,"message":"there was an error"}`)),
}
var failureServerMessageEncoded = []byte(`ARRIRPC/0.0.8 FAILURE
content-type: application/json
req-id: 15
foo: foo

{"code":12345,"message":"there was an error"}`)

func TestEncodeClientMessage(t *testing.T) {
	result := clientMessage.EncodeBytes()
	if !reflect.DeepEqual(result, clientMessageEncoded) {
		t.Fatal(deepEqualErrString(string(result), string(clientMessageEncoded)))
		return
	}
}

func TestDecodeClientMessage(t *testing.T) {
	result, err := arri.DecodeClientMessage(clientMessageEncoded)
	if err != nil {
		t.Fatal(err)
		return
	}
	if !reflect.DeepEqual(result, clientMessage) {
		t.Fatal(deepEqualErrString(result, clientMessage))
		return
	}
}

func TestEncodeServerSuccessMessage(t *testing.T) {
	result := successServerMessage.EncodeBytes()
	if !reflect.DeepEqual(result, successServerMessageEncoded) {
		t.Fatal(deepEqualErrString(result, successServerMessageEncoded))
		return
	}
}
func TestDecodeServerSuccessMessage(t *testing.T) {
	result, err := arri.DecodeServerMessage(successServerMessageEncoded)
	if err != nil {
		t.Fatal(err)
		return
	}
	if !reflect.DeepEqual(result, successServerMessage) {
		t.Fatal(deepEqualErrString(result, successServerMessage))
		return
	}
}
func TestEncodeServerFailureMessage(t *testing.T) {
	result := failureServerMessage.EncodeBytes()
	if !reflect.DeepEqual(result, failureServerMessageEncoded) {
		t.Fatal(deepEqualErrString(string(result), string(failureServerMessageEncoded)))
		return
	}
}
func TestDecodeServerFailureMessage(t *testing.T) {
	result, err := arri.DecodeServerMessage(failureServerMessageEncoded)
	if err != nil {
		t.Fatal(err)
		return
	}
	if !reflect.DeepEqual(result, failureServerMessage) {
		t.Fatal(deepEqualErrString(result, failureServerMessage))
		return
	}
}
