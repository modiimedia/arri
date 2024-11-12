package arri_test

import (
	"reflect"
	"testing"

	arri "arri"
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
		Mapping: arri.Some(arri.OrderedMapWithData[arri.TypeDef](
			arri.Pair("A", arri.TypeDef{
				Metadata: arri.Some(arri.TypeDefMetadata{}),
				Properties: arri.Some(arri.OrderedMapWithData[arri.TypeDef](
					arri.Pair("foo", arri.TypeDef{Type: arri.Some(arri.String)}),
				)),
			}),
			arri.Pair("B", arri.TypeDef{
				Metadata: arri.Some(arri.TypeDefMetadata{}),
				Properties: arri.Some(arri.OrderedMapWithData[arri.TypeDef](
					arri.Pair("bar", arri.TypeDef{Type: arri.Some(arri.String)}),
				)),
			}),
		)),
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

func TestOrderedMapToTypeDef(t *testing.T) {
	expectedResult := &arri.TypeDef{
		Values: arri.Some(&arri.TypeDef{
			Type: arri.Some(arri.Boolean),
		}),
	}
	result, err := arri.ToTypeDef(arri.OrderedMap[bool]{}, arri.KeyCasingCamelCase)
	if err != nil {
		t.Fatal(err)
		return
	}
	if !reflect.DeepEqual(result, expectedResult) {
		t.Fatal(deepEqualErrString(result, expectedResult))
		return
	}
}

func TestNullableStringToTypeDef(t *testing.T) {
	expectedResult := &arri.TypeDef{
		Type:     arri.Some(arri.String),
		Nullable: arri.Some(true),
	}
	result, err := arri.ToTypeDef(arri.Null[string](), arri.KeyCasingCamelCase)
	if err != nil {
		t.Fatal(err)
		return
	}
	if !reflect.DeepEqual(result, expectedResult) {
		t.Fatal(deepEqualErrString(result, expectedResult))
		return
	}
}

func TestObjectWithEveryTypeToTypeDef(t *testing.T) {
	expectedResult := &arri.TypeDef{
		Metadata: arri.Some(arri.TypeDefMetadata{
			Id: arri.Some("objectWithEveryType"),
		}),
		Properties: arri.Some(arri.OrderedMapWithData(
			arri.Pair("string", arri.TypeDef{Type: arri.Some(arri.String)}),
			arri.Pair("boolean", arri.TypeDef{Type: arri.Some(arri.Boolean)}),
			arri.Pair("timestamp", arri.TypeDef{Type: arri.Some(arri.Timestamp)}),
			arri.Pair("float32", arri.TypeDef{Type: arri.Some(arri.Float32)}),
			arri.Pair("float64", arri.TypeDef{Type: arri.Some(arri.Float64)}),
			arri.Pair("int8", arri.TypeDef{Type: arri.Some(arri.Int8)}),
			arri.Pair("uint8", arri.TypeDef{Type: arri.Some(arri.Uint8)}),
			arri.Pair("int16", arri.TypeDef{Type: arri.Some(arri.Int16)}),
			arri.Pair("uint16", arri.TypeDef{Type: arri.Some(arri.Uint16)}),
			arri.Pair("int32", arri.TypeDef{Type: arri.Some(arri.Int32)}),
			arri.Pair("uint32", arri.TypeDef{Type: arri.Some(arri.Uint32)}),
			arri.Pair("int64", arri.TypeDef{Type: arri.Some(arri.Int64)}),
			arri.Pair("uint64", arri.TypeDef{Type: arri.Some(arri.Uint64)}),
			arri.Pair("enum", arri.TypeDef{Enum: arri.Some([]string{"FOO", "BAR", "BAZ"})}),
			arri.Pair("object",
				arri.TypeDef{
					Metadata: arri.Some(arri.TypeDefMetadata{Id: arri.Some("nestedObject")}),
					Properties: arri.Some(arri.OrderedMapWithData(
						arri.Pair("id", arri.TypeDef{Type: arri.Some(arri.String)}),
						arri.Pair("content", arri.TypeDef{Type: arri.Some(arri.String)}),
					)),
				},
			),
			arri.Pair("array", arri.TypeDef{Elements: arri.Some(&arri.TypeDef{Type: arri.Some(arri.Boolean)})}),
			arri.Pair("record", arri.TypeDef{Values: arri.Some(&arri.TypeDef{Type: arri.Some(arri.Boolean)})}),
			arri.Pair(
				"discriminator",
				arri.TypeDef{
					Discriminator: arri.Some("typeName"),
					Metadata: arri.Some(arri.TypeDefMetadata{
						Id: arri.Some("discriminator"),
					}),
					Mapping: arri.Some(arri.OrderedMapWithData(
						arri.Pair("A", arri.TypeDef{
							Metadata: arri.Some(arri.TypeDefMetadata{
								Id: arri.Some("discriminatorA"),
							}),
							Properties: arri.Some(arri.OrderedMapWithData(
								arri.Pair("id", arri.TypeDef{Type: arri.Some(arri.String)}),
							)),
						}),
						arri.Pair("B", arri.TypeDef{
							Metadata: arri.Some(arri.TypeDefMetadata{
								Id: arri.Some("discriminatorB"),
							}),
							Properties: arri.Some(arri.OrderedMapWithData(
								arri.Pair("id", arri.TypeDef{Type: arri.Some(arri.String)}),
								arri.Pair("name", arri.TypeDef{Type: arri.Some(arri.String)}),
							)),
						}),
						arri.Pair("C", arri.TypeDef{
							Metadata: arri.Some(arri.TypeDefMetadata{
								Id: arri.Some("discriminatorC"),
							}),
							Properties: arri.Some(arri.OrderedMapWithData(
								arri.Pair("id", arri.TypeDef{Type: arri.Some(arri.String)}),
								arri.Pair("name", arri.TypeDef{Type: arri.Some(arri.String)}),
								arri.Pair("date", arri.TypeDef{Type: arri.Some(arri.Timestamp)}),
							)),
						}),
					)),
				}),
			arri.Pair("any", arri.TypeDef{}),
		)),
	}
	result, err := arri.ToTypeDef(objectWithEveryType{}, arri.KeyCasingCamelCase)
	if err != nil {
		t.Fatal(err)
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
