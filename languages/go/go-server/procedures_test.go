package arri_test

import (
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

func TestFormatServicePath(t *testing.T) {
	result := arri.FormatServicePath("foo")
	expectedResult := "foo"
	if result != expectedResult {
		t.Errorf("Expected %s. Got %s", expectedResult, result)
	}
	// TODO: this test will pass when issue #179 get's fixed
	// result = arri.FormatServicePath("v1.foo")
	// expectedResult = "v1/foo"
	// if result != expectedResult {
	// 	t.Errorf("Expected %s. Got %s", expectedResult, result)
	// }
	result = arri.FormatServicePath("users.metadata.userMessages")
	expectedResult = "users/metadata/user-messages"
	if result != "users/metadata/user-messages" {
		t.Errorf("Expected %s. Got %s", expectedResult, result)
	}
}
