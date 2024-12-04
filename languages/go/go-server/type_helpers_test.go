package arri_test

import (
	"testing"
	"time"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

func TestNullableIsArriModel(t *testing.T) {
	arri.IsArriModel(arri.Null[time.Time]())
	arri.IsArriModel(arri.NotNull(""))
}

func TestOrderedMapIsArriModel(t *testing.T) {
	arri.IsArriModel(arri.OrderedMapWithData(arri.Pair("A", 1), arri.Pair("B", 2)))
}
