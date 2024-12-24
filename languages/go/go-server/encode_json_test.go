package arri_test

import (
	"encoding/json"
	"os"
	"reflect"
	"testing"
	"time"

	arri "github.com/modiimedia/arri/languages/go/go-server"
)

var testDate = time.Date(2001, time.January, 01, 16, 0, 0, 0, time.UTC)
var objectWithEveryTypeInput = objectWithEveryType{
	String:        "",
	Boolean:       false,
	Timestamp:     testDate,
	Float32:       1.5,
	Float64:       1.5,
	Int8:          1,
	Uint8:         1,
	Int16:         10,
	Uint16:        10,
	Int32:         100,
	Uint32:        100,
	Int64:         1000,
	Uint64:        1000,
	Enum:          "BAZ",
	Object:        nestedObject{Id: "1", Content: "hello world"},
	Array:         []bool{true, false, false},
	Record:        map[string]bool{"A": true, "B": false},
	Discriminator: discriminator{C: &discriminatorC{Id: "", Name: "", Date: testDate}},
	Any:           "hello world",
}

var jsonEncoder = arri.NewEncoder(arri.EncodingOptions{})

func TestEncodeJSON(t *testing.T) {
	reference, referenceErr := os.ReadFile("../../../tests/test-files/ObjectWithEveryType.json")
	if referenceErr != nil {
		t.Fatal(referenceErr)
		return
	}
	json, err := jsonEncoder.EncodeJSON(objectWithEveryTypeInput)
	if err != nil {
		t.Fatal(err)
		return
	}
	if string(json) != string(reference) {
		t.Fatal("\n", string(json), "\nis not equal to\n", string(reference))
		return
	}
}

func BenchmarkEncodeJSON(b *testing.B) {
	for i := 0; i < b.N; i++ {
		jsonEncoder.EncodeJSON(objectWithEveryTypeInput)
	}
}

func BenchmarkEncodeJSONStd(b *testing.B) {
	for i := 0; i < b.N; i++ {
		json.Marshal(objectWithEveryTypeInput)
	}
}

var _objectWithOptionalFieldsInput = objectWithOptionalFields{
	String:    arri.Some(""),
	Boolean:   arri.Some(false),
	Timestamp: arri.Some(testDate),
	Float32:   arri.Some[float32](1.5),
	Float64:   arri.Some(1.5),
	Int8:      arri.Some[int8](1),
	Uint8:     arri.Some[uint8](1),
	Int16:     arri.Some[int16](10),
	Uint16:    arri.Some[uint16](10),
	Int32:     arri.Some[int32](100),
	Uint32:    arri.Some[uint32](100),
	Int64:     arri.Some[int64](1000),
	Uint64:    arri.Some[uint64](1000),
	Enum:      arri.Some("BAZ"),
	Object:    arri.Some(nestedObject{Id: "1", Content: "hello world"}),
	Array:     arri.Some([]bool{true, false, false}),
	Record: arri.Some(map[string]bool{
		"A": true,
		"B": false,
	}),
	Discriminator: arri.Some(
		discriminator{
			C: &discriminatorC{
				Id:   "",
				Name: "",
				Date: testDate,
			},
		},
	),
	Any: arri.Some[any]("hello world"),
}

func TestEncodeJSONWithOptionalFields(t *testing.T) {
	noUndefReference, noUndefReferenceErr := os.ReadFile("../../../tests/test-files/ObjectWithOptionalFields_NoUndefined.json")
	if noUndefReferenceErr != nil {
		t.Fatal(noUndefReferenceErr.Error())
	}
	noUndefResult, noUndefResultErr := jsonEncoder.EncodeJSON(_objectWithOptionalFieldsInput)
	if noUndefResultErr != nil {
		t.Fatal(noUndefResultErr.Error())
	}
	if !reflect.DeepEqual(noUndefResult, noUndefReference) {
		t.Fatal("\n", string(noUndefResult), "\nis not equal to\n", string(noUndefReference))
	}
	allUndefInput := objectWithOptionalFields{}
	allUndefReference, allUndefReferenceErr := os.ReadFile("../../../tests/test-files/ObjectWithOptionalFields_AllUndefined.json")
	if noUndefReferenceErr != nil {
		t.Fatal(allUndefReferenceErr.Error())
	}
	allUndefResult, allUndefResultErr := jsonEncoder.EncodeJSON(allUndefInput)
	if allUndefResultErr != nil {
		t.Fatal(allUndefResultErr.Error())
	}
	if !reflect.DeepEqual(allUndefResult, allUndefReference) {
		t.Fatal("\n", string(allUndefResult), "\nis not equal to\n", string(allUndefReference))
	}
}

func BenchmarkEncodeJSONWithOptionalFields(b *testing.B) {
	for i := 0; i < b.N; i++ {
		jsonEncoder.EncodeJSON(_objectWithOptionalFieldsInput)
	}
}

func BenchmarkEncodeJSONWithOptionalFieldsStd(b *testing.B) {
	for i := 0; i < b.N; i++ {
		json.Marshal(_objectWithOptionalFieldsInput)
	}
}

var objectWithNullableFieldsAllNullInput = objectWithNullableFields{}
var objectWithNullableFieldsNoNullInput = objectWithNullableFields{
	String:        arri.NotNull(""),
	Boolean:       arri.NotNull(true),
	Timestamp:     arri.NotNull(testDate),
	Float32:       arri.NotNull[float32](1.5),
	Float64:       arri.NotNull(1.5),
	Int8:          arri.NotNull[int8](1),
	Uint8:         arri.NotNull[uint8](1),
	Int16:         arri.NotNull[int16](10),
	Uint16:        arri.NotNull[uint16](10),
	Int32:         arri.NotNull[int32](100),
	Uint32:        arri.NotNull[uint32](100),
	Int64:         arri.NotNull[int64](1000),
	Uint64:        arri.NotNull[uint64](1000),
	Enum:          arri.NotNull("BAZ"),
	Object:        arri.NotNull(nestedObject{Id: "", Content: ""}),
	Array:         arri.NotNull([]bool{true, false, false}),
	Record:        arri.NotNull(arri.OrderedMapWithData(arri.Pair("A", true), arri.Pair("B", false))),
	Discriminator: arri.NotNull(discriminator{C: &discriminatorC{Id: "", Name: "", Date: testDate}}),
	Any:           arri.NotNull[any](struct{ Message string }{Message: "hello world"}),
}

func TestEncodeJSONWithNullableFields(t *testing.T) {
	allNullReference, allNullReferenceErr := os.ReadFile("../../../tests/test-files/ObjectWithNullableFields_AllNull.json")
	if allNullReferenceErr != nil {
		t.Fatal(allNullReferenceErr)
		return
	}
	allNullResult, allNullErr := jsonEncoder.EncodeJSON(objectWithNullableFieldsAllNullInput)
	if allNullErr != nil {
		t.Fatal(allNullErr)
		return
	}
	if string(allNullReference) != string(allNullResult) {
		t.Fatal(deepEqualErrString(string(allNullResult), string(allNullReference)))
		return
	}
	noNullReference, noNullReferenceErr := os.ReadFile("../../../tests/test-files/ObjectWithNullableFields_NoNull.json")
	if noNullReferenceErr != nil {
		t.Fatal(noNullReferenceErr)
		return
	}
	noNullResult, noNullErr := jsonEncoder.EncodeJSON(objectWithNullableFieldsNoNullInput)
	if noNullErr != nil {
		t.Fatal(noNullErr)
		return
	}
	if string(noNullResult) != string(noNullReference) {
		t.Fatal(deepEqualErrString(string(noNullResult), string(noNullReference)))
		return
	}
}

func BenchmarkEncodeJSONWithNullableFields(b *testing.B) {
	for i := 0; i < b.N; i++ {
		jsonEncoder.EncodeJSON(objectWithNullableFieldsNoNullInput)
	}
}

func BenchmarkEncodeJSONWithNullableFieldsStd(b *testing.B) {
	for i := 0; i < b.N; i++ {
		json.Marshal(objectWithNullableFieldsNoNullInput)
	}
}

var _recursiveObjectInput = recursiveObject{
	Left: &recursiveObject{
		Left: &recursiveObject{
			Left:  nil,
			Right: &recursiveObject{},
		},
		Right: nil,
	},
	Right: &recursiveObject{},
}

func TestEncodeJSONRecursiveObject(t *testing.T) {
	reference, referenceErr := os.ReadFile("../../../tests/test-files/RecursiveObject.json")
	if referenceErr != nil {
		t.Fatal(referenceErr.Error())
	}

	result, err := jsonEncoder.EncodeJSON(_recursiveObjectInput)
	if err != nil {
		t.Fatal(err.Error())
	}
	if !reflect.DeepEqual(result, reference) {
		t.Fatal("\n", string(result), "\nis not equal to\n", string(reference))
	}
}

func BenchmarkEncodeJSONRecursiveObject(b *testing.B) {
	for i := 0; i < b.N; i++ {
		jsonEncoder.EncodeJSON(_recursiveObjectInput)
	}
}

func BenchmarkEncodeJSONRecursiveObjectStd(b *testing.B) {
	for i := 0; i < b.N; i++ {
		json.Marshal(_recursiveObjectInput)
	}
}

type bUser struct {
	Id                  int32
	Role                string `enum:"standard,admin,moderator"`
	Name                string
	Email               arri.Nullable[string]
	CreatedAt           int32
	UpdatedAt           int32
	Settings            arri.Option[bUserSettings]
	RecentNotifications []bUserNotification
}

type bUserSettings struct {
	PreferredTheme     string `enum:"light,dark,system"`
	AllowNotifications bool
}

type bUserNotification struct {
	PostLike    *bUserNotificationPostLike    `discriminator:"POST_LIKE"`
	PostComment *bUserNotificationPostComment `discriminator:"POST_COMMENT"`
}

type bUserNotificationPostLike struct {
	UserId string
	PostId string
}

type bUserNotificationPostComment struct {
	UserId      string
	PostId      string
	CommentText string
}

var _benchUserEncodingInput = bUser{
	Id:        12345,
	Role:      "moderator",
	Name:      "John Doe",
	Email:     arri.Null[string](),
	CreatedAt: 0,
	UpdatedAt: 0,
	Settings: arri.Some(bUserSettings{
		PreferredTheme:     "system",
		AllowNotifications: true,
	}),
	RecentNotifications: []bUserNotification{
		{
			PostLike: &bUserNotificationPostLike{
				PostId: "1",
				UserId: "1",
			},
		},
		{
			PostComment: &bUserNotificationPostComment{
				PostId:      "1",
				UserId:      "1",
				CommentText: "",
			},
		},
	},
}

func BenchmarkEncodeJSONUser(b *testing.B) {
	for i := 0; i < b.N; i++ {
		jsonEncoder.EncodeJSON(_benchUserEncodingInput)
	}
}

func BenchmarkEncodeJSONUserStd(b *testing.B) {
	for i := 0; i < b.N; i++ {
		json.Marshal(_benchUserEncodingInput)
	}
}
