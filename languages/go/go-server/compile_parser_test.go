package arri_test

import (
	"fmt"
	"testing"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

func TestGetPackageLocations(t *testing.T) {
	packages, err := arri.GetPackages(".")
	if err != nil {
		t.Fatal(err)
		return
	}
	fmt.Println(packages)
}
