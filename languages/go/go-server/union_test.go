package arri_test

import (
	"os"
	"reflect"
	"strings"
	"testing"
	"time"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

func readTestFile(t *testing.T, filename string) []byte {
	result, err := os.ReadFile("../../../tests/test-files/" + filename)
	if err != nil {
		t.Fatal(err)
	}
	return result
}

// encodes the value and compares it to the test file. then decodes the test file and compares it to the value
func assertUnionRoundTrip[T any](t *testing.T, filename string, value T) {
	t.Helper()
	reference := readTestFile(t, filename)
	encoded, err := arri.EncodeJSON(value, arri.EncodingOptions{})
	if err != nil {
		t.Fatalf("%s: %s", filename, err.Error())
	}
	if string(encoded) != string(reference) {
		t.Fatalf("%s:\n%s\nis not equal to\n%s", filename, string(encoded), string(reference))
	}
	var decoded T
	decodeErr := arri.DecodeJSON(reference, &decoded, arri.EncodingOptions{})
	if decodeErr != nil {
		t.Fatalf("%s: %+v", filename, decodeErr.Errors)
	}
	if !reflect.DeepEqual(decoded, value) {
		t.Fatalf("%s: %s", filename, deepEqualErrString(decoded, value))
	}
}

func TestUnionExternal(t *testing.T) {
	assertUnionRoundTrip(t, "UnionExternal_Object.json", unionExternal{Object: &nestedObject{Id: "1", Content: "hello world"}})
	assertUnionRoundTrip(t, "UnionExternal_Array.json", unionExternal{Array: &[]string{"hello", "world"}})
	assertUnionRoundTrip(t, "UnionExternal_Boolean.json", unionExternal{Boolean: ptr(true)})
	assertUnionRoundTrip(t, "UnionExternal_Timestamp.json", unionExternal{NullableTimestamp: ptr(arri.NotNull(testDate))})
	assertUnionRoundTrip(t, "UnionExternal_TimestampNull.json", unionExternal{NullableTimestamp: ptr(arri.Null[time.Time]())})
}

func TestUnionInternal(t *testing.T) {
	assertUnionRoundTrip(t, "UnionInternal_Rectangle.json", unionInternal{Rectangle: &unionInternalRectangle{Width: 10.7, Height: 5.3}})
}

func TestUnionAdjacent(t *testing.T) {
	assertUnionRoundTrip(t, "UnionAdjacent_Object.json", unionAdjacent{Object: &nestedObject{Id: "1", Content: "hello world"}})
	assertUnionRoundTrip(t, "UnionAdjacent_TimestampNull.json", unionAdjacent{NullableTimestamp: ptr(arri.Null[time.Time]())})
}

func TestLegacyDiscriminator(t *testing.T) {
	assertUnionRoundTrip(t, "LegacyDiscriminator.json", legacyDiscriminator{C: &legacyDiscriminatorC{Id: "1", Name: "John Doe", Date: testDate}})
}

func TestEncodeUnionFallback(t *testing.T) {
	cases := []struct {
		input    any
		expected string
	}{
		{unionExternal{}, `{"object":{"id":"","content":""}}`},
		{unionInternal{}, `{"shape":"rectangle","width":0,"height":0}`},
		{unionAdjacent{}, `{"kind":"object","data":{"id":"","content":""}}`},
		{recursiveUnion{}, `{"children":[]}`},
	}
	for _, c := range cases {
		result, err := arri.EncodeJSON(c.input, arri.EncodingOptions{})
		if err != nil {
			t.Fatal(err)
		}
		if string(result) != c.expected {
			t.Fatalf("\n%s\nis not equal to\n%s", string(result), c.expected)
		}
	}
}

func TestEncodeUnionMultipleVariantsError(t *testing.T) {
	inputs := []any{
		unionExternal{Boolean: ptr(true), Array: &[]string{}},
		unionInternal{Rectangle: &unionInternalRectangle{}, Circle: &unionInternalCircle{}},
		// nested errors must bubble up
		objectWithEveryType{UnionAdjacent: unionAdjacent{Boolean: ptr(true), Object: &nestedObject{}}},
		[]unionExternal{{Boolean: ptr(true), Object: &nestedObject{}}},
	}
	for _, input := range inputs {
		_, err := arri.EncodeJSON(input, arri.EncodingOptions{})
		if err == nil {
			t.Fatalf("expected an error when encoding %+v", input)
		}
		if !strings.Contains(err.Error(), "more than one variant") {
			t.Fatalf("unexpected error: %s", err.Error())
		}
	}
}

type recursiveUnion struct {
	arri.Union
	Child    *recursiveUnion
	Children *[]recursiveUnion
	Text     *string
}

func TestRecursiveUnion(t *testing.T) {
	input := recursiveUnion{Child: &recursiveUnion{Children: &[]recursiveUnion{{Text: ptr("hi")}, {Child: &recursiveUnion{}}}}}
	expected := `{"child":{"children":[{"text":"hi"},{"child":{"children":[]}}]}}`
	encoded, err := arri.EncodeJSON(input, arri.EncodingOptions{})
	if err != nil {
		t.Fatal(err)
	}
	if string(encoded) != expected {
		t.Fatalf("\n%s\nis not equal to\n%s", string(encoded), expected)
	}
	var decoded recursiveUnion
	decodeErr := arri.DecodeJSON(encoded, &decoded, arri.EncodingOptions{})
	if decodeErr != nil {
		t.Fatalf("%+v", decodeErr.Errors)
	}
	// empty arrays are decoded as nil slices
	expectedDecoded := recursiveUnion{Child: &recursiveUnion{Children: &[]recursiveUnion{{Text: ptr("hi")}, {Child: &recursiveUnion{Children: ptr[[]recursiveUnion](nil)}}}}}
	if !reflect.DeepEqual(decoded, expectedDecoded) {
		t.Fatal(deepEqualErrString(decoded, expectedDecoded))
	}
	def, defErr := arri.ToTypeDef(recursiveUnion{}, options)
	if defErr != nil {
		t.Fatal(defErr)
	}
	expectedDef := &arri.TypeDef{
		Metadata: arri.Some(arri.TypeDefMetadata{Id: arri.Some("recursiveUnion")}),
		Union: arri.Some(arri.OrderedMapWithData(
			arri.Pair("child", arri.TypeDef{Ref: arri.Some("recursiveUnion")}),
			arri.Pair("children", arri.TypeDef{Elements: arri.Some(&arri.TypeDef{Ref: arri.Some("recursiveUnion")})}),
			arri.Pair("text", arri.TypeDef{Type: arri.Some(arri.String)}),
		)),
	}
	if !reflect.DeepEqual(def, expectedDef) {
		t.Fatal(deepEqualErrString(def, expectedDef))
	}
}

type unionWithMetadata struct {
	arri.Union `tagKey:"type" valueKey:"value"`
	Status     *string `enum:"ACTIVE,INACTIVE" description:"the current status"`
	OldStatus  *string `tag:"OLD_STATUS" arri:"deprecated"`
}

func TestUnionVariantTags(t *testing.T) {
	def, err := arri.ToTypeDef(unionWithMetadata{}, arri.EncodingOptions{KeyCasing: arri.KeyCasingSnakeCase})
	if err != nil {
		t.Fatal(err)
	}
	expectedDef := &arri.TypeDef{
		Metadata: arri.Some(arri.TypeDefMetadata{Id: arri.Some("unionWithMetadata")}),
		TagKey:   arri.Some("type"),
		ValueKey: arri.Some("value"),
		Union: arri.Some(arri.OrderedMapWithData(
			arri.Pair("status", arri.TypeDef{
				Enum:     arri.Some([]string{"ACTIVE", "INACTIVE"}),
				Metadata: arri.Some(arri.TypeDefMetadata{Description: arri.Some("the current status")}),
			}),
			arri.Pair("OLD_STATUS", arri.TypeDef{
				Type:     arri.Some(arri.String),
				Metadata: arri.Some(arri.TypeDefMetadata{IsDeprecated: arri.Some(true)}),
			}),
		)),
	}
	if !reflect.DeepEqual(def, expectedDef) {
		t.Fatal(deepEqualErrString(def, expectedDef))
	}
	// enum variants fall back to the first enum value
	encoded, encodeErr := arri.EncodeJSON(unionWithMetadata{Status: ptr("")}, arri.EncodingOptions{})
	if encodeErr != nil {
		t.Fatal(encodeErr)
	}
	if string(encoded) != `{"type":"status","value":"ACTIVE"}` {
		t.Fatal(string(encoded))
	}
	var decoded unionWithMetadata
	decodeErr := arri.DecodeJSON([]byte(`{"type":"status","value":"UNKNOWN"}`), &decoded, arri.EncodingOptions{})
	if decodeErr == nil {
		t.Fatal("expected invalid enum values to be rejected")
	}
	decodeErr = arri.DecodeJSON([]byte(`{"type":"OLD_STATUS","value":"foo"}`), &decoded, arri.EncodingOptions{})
	if decodeErr != nil {
		t.Fatal(decodeErr.Errors)
	}
	if decoded.OldStatus == nil || *decoded.OldStatus != "foo" || decoded.Status != nil {
		t.Fatalf("%+v", decoded)
	}
}

func TestDecodeUnionErrors(t *testing.T) {
	cases := []struct {
		input   string
		target  any
		message string
	}{
		{`{"triangle":{"base":10}}`, &unionExternal{}, `"triangle" is not a valid union variant`},
		{`{"boolean":true,"array":[]}`, &unionExternal{}, "expected an object with exactly one key"},
		{`{}`, &unionExternal{}, "expected an object with exactly one key"},
		{`{"boolean":"true"}`, &unionExternal{}, "expected boolean"},
		{`{"width":10}`, &unionInternal{}, `missing union tag "shape"`},
		{`{"shape":"triangle","base":10}`, &unionInternal{}, `"triangle" is not a valid union variant`},
		{`{"kind":"boolean"}`, &unionAdjacent{}, `missing union value "data"`},
		{`{"kind":5,"data":true}`, &unionAdjacent{}, `missing union tag "kind"`},
		{`true`, &unionAdjacent{}, "expected object"},
	}
	for _, c := range cases {
		var err *arri.DecoderError
		switch target := c.target.(type) {
		case *unionExternal:
			err = arri.DecodeJSON([]byte(c.input), target, arri.EncodingOptions{})
		case *unionInternal:
			err = arri.DecodeJSON([]byte(c.input), target, arri.EncodingOptions{})
		case *unionAdjacent:
			err = arri.DecodeJSON([]byte(c.input), target, arri.EncodingOptions{})
		}
		if err == nil {
			t.Fatalf("expected an error when decoding %s", c.input)
		}
		found := false
		for _, e := range err.Errors {
			if strings.Contains(e.Message, c.message) {
				found = true
			}
		}
		if !found {
			t.Fatalf("expected error containing %q when decoding %s. got %+v", c.message, c.input, err.Errors)
		}
	}
}

type unionMixedWithDiscriminator struct {
	arri.Union
	A *struct{ Foo string } `discriminator:"A"`
}

type unionValueKeyWithoutTagKey struct {
	arri.Union `valueKey:"data"`
	A          *string
}

type unionWithNonPointerVariant struct {
	arri.Union
	A string
}

type unionInternalWithNonObject struct {
	arri.Union `tagKey:"type"`
	A          *string
}

type unionInternalWithNullable struct {
	arri.Union `tagKey:"type"`
	A          *arri.Nullable[nestedObject]
}

type unionInternalWithTagConflict struct {
	arri.Union `tagKey:"id"`
	A          *nestedObject
}

type unionWithDuplicateTags struct {
	arri.Union
	A *string `tag:"b"`
	B *string
}

type unionWithAllRecursiveVariants struct {
	arri.Union
	A *unionWithAllRecursiveVariants
}

func TestInvalidUnionTypeDefs(t *testing.T) {
	cases := []struct {
		input   any
		message string
	}{
		{unionMixedWithDiscriminator{}, `cannot use arri.Union alongside the deprecated "discriminator" tags`},
		{unionValueKeyWithoutTagKey{}, `"valueKey" can only be used alongside "tagKey"`},
		{unionWithNonPointerVariant{}, "must be a pointer"},
		{unionInternalWithNonObject{}, "internally tagged union variants must be objects"},
		{unionInternalWithNullable{}, "internally tagged union variants cannot be nullable"},
		{unionInternalWithTagConflict{}, "conflicts with the union's tagKey"},
		{unionWithDuplicateTags{}, `more than one variant with the tag "b"`},
	}
	for _, c := range cases {
		_, err := arri.ToTypeDef(c.input, options)
		if err == nil {
			t.Fatalf("expected an error for %T", c.input)
		}
		if !strings.Contains(err.Error(), c.message) {
			t.Fatalf("expected error containing %q for %T. got %q", c.message, c.input, err.Error())
		}
	}
	_, err := arri.EncodeJSON(unionWithAllRecursiveVariants{}, arri.EncodingOptions{})
	if err == nil || !strings.Contains(err.Error(), "every variant is recursive") {
		t.Fatalf("expected recursive fallback error. got %v", err)
	}
}

func BenchmarkEncodeJSONUnion(b *testing.B) {
	input := unionAdjacent{Object: &nestedObject{Id: "1", Content: "hello world"}}
	for i := 0; i < b.N; i++ {
		arri.EncodeJSON(input, arri.EncodingOptions{})
	}
}

func BenchmarkDecodeJSONUnion(b *testing.B) {
	input := []byte(`{"kind":"object","data":{"id":"1","content":"hello world"}}`)
	for i := 0; i < b.N; i++ {
		var target unionAdjacent
		arri.DecodeJSON(input, &target, arri.EncodingOptions{})
	}
}
