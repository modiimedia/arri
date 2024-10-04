package arri_test

import (
	"encoding/json"
	"os"
	"reflect"
	"testing"
	"time"

	arri "arrirpc.com/arri"
)

var testDate = time.Date(2001, time.January, 01, 16, 0, 0, 0, time.UTC)
var basicJsonInput = objectWithEveryType{
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

func TestEncodeJson(t *testing.T) {
	reference, referenceErr := os.ReadFile("../../../tests/test-files/ObjectWithEveryType.json")
	if referenceErr != nil {
		t.Fatal(referenceErr)
		return
	}
	json, err := arri.EncodeJSON(basicJsonInput, arri.KeyCasingCamelCase)
	if err != nil {
		t.Fatal(err)
		return
	}
	if string(json) != string(reference) {
		t.Fatal("\n", string(json), "\nis not equal to\n", string(reference))
		return
	}
}

func BenchmarkEncodeJson(b *testing.B) {
	for i := 0; i < b.N; i++ {
		arri.EncodeJSON(basicJsonInput, arri.KeyCasingCamelCase)
	}
}

func BenchmarkEncodeJsonStd(b *testing.B) {
	for i := 0; i < b.N; i++ {
		json.Marshal(basicJsonInput)
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

func TestEncodeJsonWithOptionalFields(t *testing.T) {
	noUndefReference, noUndefReferenceErr := os.ReadFile("../../../tests/test-files/ObjectWithOptionalFields_NoUndefined.json")
	if noUndefReferenceErr != nil {
		t.Fatalf(noUndefReferenceErr.Error())
	}
	noUndefResult, noUndefResultErr := arri.EncodeJSON(_objectWithOptionalFieldsInput, arri.KeyCasingCamelCase)
	if noUndefResultErr != nil {
		t.Fatalf(noUndefResultErr.Error())
	}
	if !reflect.DeepEqual(noUndefResult, noUndefReference) {
		t.Fatal("\n", string(noUndefResult), "\nis not equal to\n", string(noUndefReference))
	}
	allUndefInput := objectWithOptionalFields{}
	allUndefReference, allUndefReferenceErr := os.ReadFile("../../../tests/test-files/ObjectWithOptionalFields_AllUndefined.json")
	if noUndefReferenceErr != nil {
		t.Fatalf(allUndefReferenceErr.Error())
	}
	allUndefResult, allUndefResultErr := arri.EncodeJSON(allUndefInput, arri.KeyCasingCamelCase)
	if allUndefResultErr != nil {
		t.Fatalf(allUndefResultErr.Error())
	}
	if !reflect.DeepEqual(allUndefResult, allUndefReference) {
		t.Fatal("\n", string(allUndefResult), "\nis not equal to\n", string(allUndefReference))
	}
}

func BenchmarkEncodeJsonWithOptionalFields(b *testing.B) {
	for i := 0; i < b.N; i++ {
		arri.EncodeJSON(_objectWithOptionalFieldsInput, arri.KeyCasingCamelCase)
	}
}

func BenchmarkEncodeJsonWithOptionalFieldsStd(b *testing.B) {
	for i := 0; i < b.N; i++ {
		json.Marshal(_objectWithOptionalFieldsInput)
	}
}

var _objectWithNullableFieldsNoNullInput = objectWithNullableFields{
	String:    arri.NotNull(""),
	Boolean:   arri.NotNull(true),
	Timestamp: arri.NotNull(testDate),
	Float32:   arri.NotNull[float32](1.5),
	Float64:   arri.NotNull(1.5),
	Int8:      arri.NotNull[int8](1),
	Uint8:     arri.NotNull[uint8](1),
	Int16:     arri.NotNull[int16](10),
	Uint16:    arri.NotNull[uint16](10),
	Int32:     arri.NotNull[int32](100),
	Uint32:    arri.NotNull[uint32](100),
	Int64:     arri.NotNull[int64](1000),
	Uint64:    arri.NotNull[uint64](1000),
	Enum:      arri.NotNull("BAZ"),
	Object:    arri.NotNull(nestedObject{Id: "", Content: ""}),
	Array:     arri.NotNull([]bool{true, false, false}),
	Record: arri.NotNull(map[string]bool{
		"A": true,
		"B": false,
	}),
	Discriminator: arri.NotNull(
		discriminator{
			C: &discriminatorC{
				Id:   "",
				Name: "",
				Date: testDate,
			},
		},
	),
	Any: arri.NotNull[any](
		struct {
			Message string `json:"message"`
		}{
			Message: "hello world",
		},
	),
}
var _objectWithNullableFieldsAllNullInput = objectWithNullableFields{
	String:        arri.Null[string](),
	Boolean:       arri.Null[bool](),
	Timestamp:     arri.Null[time.Time](),
	Float32:       arri.Null[float32](),
	Float64:       arri.Null[float64](),
	Int8:          arri.Null[int8](),
	Uint8:         arri.Null[uint8](),
	Int16:         arri.Null[int16](),
	Uint16:        arri.Null[uint16](),
	Int32:         arri.Null[int32](),
	Uint32:        arri.Null[uint32](),
	Int64:         arri.Null[int64](),
	Uint64:        arri.Null[uint64](),
	Enum:          arri.Null[string](),
	Object:        arri.Null[nestedObject](),
	Array:         arri.Null[[]bool](),
	Record:        arri.Null[map[string]bool](),
	Discriminator: arri.Null[discriminator](),
	Any:           arri.Null[any](),
}

func TestEncodeJsonWithNullableFields(t *testing.T) {
	reference, referenceErr := os.ReadFile("../../../tests/test-files/ObjectWithNullableFields_NoNull.json")
	if referenceErr != nil {
		t.Fatalf(referenceErr.Error())
	}
	result, err := arri.EncodeJSON(_objectWithNullableFieldsNoNullInput, arri.KeyCasingCamelCase)
	if err != nil {
		t.Fatalf(err.Error())
	}
	if !reflect.DeepEqual(result, reference) {
		t.Fatal("\n", string(result), "\nis not equal to\n", string(reference))
	}
	allNullReference, allNullReferenceErr := os.ReadFile("../../../tests/test-files/ObjectWithNullableFields_AllNull.json")
	if allNullReferenceErr != nil {
		t.Fatalf(allNullReferenceErr.Error())
	}
	allNullResult, allNullErr := arri.EncodeJSON(_objectWithNullableFieldsAllNullInput, arri.KeyCasingCamelCase)
	if allNullErr != nil {
		t.Fatalf(allNullErr.Error())
	}
	if !reflect.DeepEqual(allNullResult, allNullReference) {
		t.Fatal("\n", string(allNullResult), "\nis not equal to\n", string(allNullReference))
	}
}

func BenchmarkEncodeJsonWithNullableFields(b *testing.B) {
	for i := 0; i < b.N; i++ {
		arri.EncodeJSON(_objectWithNullableFieldsNoNullInput, arri.KeyCasingCamelCase)
	}
}

func BenchmarkEncodeJsonWithNullableFieldsStd(b *testing.B) {
	for i := 0; i < b.N; i++ {
		json.Marshal(_objectWithNullableFieldsNoNullInput)
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

func TestEncodeJsonRecursiveObject(t *testing.T) {
	reference, referenceErr := os.ReadFile("../../../tests/test-files/RecursiveObject.json")
	if referenceErr != nil {
		t.Errorf(referenceErr.Error())
	}

	result, err := arri.EncodeJSON(_recursiveObjectInput, arri.KeyCasingCamelCase)
	if err != nil {
		t.Errorf(err.Error())
	}
	if !reflect.DeepEqual(result, reference) {
		t.Fatal("\n", string(result), "\nis not equal to\n", string(reference))
	}
}

func BenchmarkEncodeJsonRecursiveObject(b *testing.B) {
	for i := 0; i < b.N; i++ {
		arri.EncodeJSON(_recursiveObjectInput, arri.KeyCasingCamelCase)
	}
}

func BenchmarkEncodeJsonRecursiveObjectStd(b *testing.B) {
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

func BenchmarkEncodeJsonUser(b *testing.B) {
	for i := 0; i < b.N; i++ {
		arri.EncodeJSON(_benchUserEncodingInput, arri.KeyCasingCamelCase)
	}
}

func BenchmarkEncodeJsonUserStd(b *testing.B) {
	for i := 0; i < b.N; i++ {
		json.Marshal(_benchUserEncodingInput)
	}
}
