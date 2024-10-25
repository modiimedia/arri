package arri_test

import (
	"reflect"
	"testing"

	arri "arrirpc.com/arri"
)

func TestStringToTypeDef(t *testing.T) {
	expectedResult := &arri.TypeDef{
		Type: arri.Some("string"),
	}
	result, err := arri.ToTypeDef("hello world", arri.KeyCasingCamelCase)
	if err != nil {
		t.Fatalf(err.Error())
		return
	}
	nullableResult, nullableErr := arri.ToTypeDef(arri.NotNull("hello world"), arri.KeyCasingCamelCase)
	if nullableErr != nil {
		t.Fatalf(nullableErr.Error())
		return
	}
	if !reflect.DeepEqual(result, expectedResult) {
		t.Fatal(deepEqualErrString(result, expectedResult))
		return
	}
	expectedResult.Nullable = arri.Some(true)
	if !reflect.DeepEqual(nullableResult, expectedResult) {
		t.Fatal(deepEqualErrString(nullableResult, expectedResult))
		return
	}
}

func TestArrayToTypeDef(t *testing.T) {
	expectedResult := &arri.TypeDef{
		Elements: arri.Some(&arri.TypeDef{Type: arri.Some("string")}),
	}
	result, err := arri.ToTypeDef([]string{"foo", "bar"}, arri.KeyCasingCamelCase)
	if err != nil {
		t.Fatalf(err.Error())
		return
	}
	if !reflect.DeepEqual(result, expectedResult) {
		t.Fatalf(deepEqualErrString(result, expectedResult))
		return
	}
	nullableResult, nullableErr := arri.ToTypeDef(arri.Null[[]string](), arri.KeyCasingCamelCase)
	expectedResult.Nullable = arri.Some(true)
	if nullableErr != nil {
		t.Fatalf(nullableErr.Error())
		return
	}
	if !reflect.DeepEqual(nullableResult, expectedResult) {
		t.Fatalf(deepEqualErrString(nullableResult, expectedResult))
		return
	}
}

func TestDiscriminatorToTypeDef(t *testing.T) {
	expectedResult := &arri.TypeDef{
		Metadata:      arri.Some(arri.TypeDefMetadata{}),
		Discriminator: arri.Some("type"),
		Mapping: arri.Some([]arri.OrderedMapEntry[arri.TypeDef]{
			{
				Value: arri.TypeDef{
					Metadata: arri.Some(arri.TypeDefMetadata{}),
					Properties: arri.Some([]arri.OrderedMapEntry[arri.TypeDef]{
						{
							Value: arri.TypeDef{Type: arri.Some(arri.String)},
							Key:   "foo",
						},
					}),
				},
				Key: "A",
			},
			{
				Value: arri.TypeDef{
					Metadata: arri.Some(arri.TypeDefMetadata{}),
					Properties: arri.Some([]arri.OrderedMapEntry[arri.TypeDef]{
						{
							Value: arri.TypeDef{Type: arri.Some(arri.String)},
							Key:   "bar",
						},
					}),
				},
				Key: "B",
			},
		}),
	}
	result, resultErr := arri.ToTypeDef(struct {
		A *struct{ Foo string } `discriminator:"A"`
		B *struct{ Bar string } `discriminator:"B"`
	}{}, arri.KeyCasingCamelCase)
	if resultErr != nil {
		t.Fatal(resultErr.Error())
		return
	}
	if !reflect.DeepEqual(result, expectedResult) {
		t.Fatal(deepEqualErrString(result, expectedResult))
		return
	}
}

func BenchmarkToTypeDef(b *testing.B) {
	for i := 0; i < b.N; i++ {
		arri.ToTypeDef(objectWithEveryTypeInput, arri.KeyCasingCamelCase)
	}
}
