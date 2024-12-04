package arri

import (
	"encoding/json"
	"fmt"
	"reflect"

	"github.com/tidwall/gjson"
)

type DiscriminatorKey struct{}

//// Optional Types ////

type Option[T any] struct {
	Value T
	IsSet bool
}

func Some[T any](value T) Option[T] {
	result := Option[T]{
		IsSet: true,
		Value: value,
	}
	return result
}

func None[T any]() Option[T] {
	result := Option[T]{IsSet: false}
	return result
}

func (s Option[T]) Unwrap() T {
	if !s.IsSet {
		panic("Cannot get from None type")
	}
	return s.Value
}

func (s Option[T]) UnwrapOr(fallback T) T {
	if s.IsSet {
		return s.Value
	}
	return fallback
}

func (s Option[T]) IsSome() bool {
	return s.IsSet
}

func (s Option[_]) IsNone() bool {
	return !s.IsSet
}

func (o *Option[T]) Set(val T) {
	o.Value = val
	o.IsSet = true
}

func (o *Option[T]) Unset() {
	o.IsSet = false
}

func (s Option[T]) String() string {
	if s.IsSet {
		return fmt.Sprintf("Some(%v)", s.Value)
	} else {
		return "None"
	}
}

type Nullable[T any] struct {
	Value T
	IsSet bool
}

func Null[T any]() Nullable[T] {
	return Nullable[T]{IsSet: false}
}

func NotNull[T any](value T) Nullable[T] {
	return Nullable[T]{Value: value, IsSet: true}
}

func (s Nullable[_]) IsNull() bool {
	return !s.IsSet
}

func (s Nullable[T]) Unwrap() T {
	if s.IsSet {
		return s.Value
	}
	panic("cannot Unwrap value isn't set")
}

func (s Nullable[T]) UnwrapOr(other T) T {
	if s.IsSet {
		return s.Value
	}
	return other
}

func (s *Nullable[T]) Set(value T) {
	s.Value = value
	s.IsSet = true
}

func (s *Nullable[T]) Unset() {
	s.IsSet = false
}

func (s Nullable[T]) MarshalJSON() ([]byte, error) {
	if s.IsNull() {
		return json.Marshal(s.Value)
	}
	return []byte("null"), nil
}

func (s *Nullable[T]) UnmarshalJSON(data []byte) error {
	if s == nil {
		s = &Nullable[T]{}
	}
	if string(data) == "null" {
		s.IsSet = false
		return nil
	}
	err := json.Unmarshal(data, &s.Value)
	if err != nil {
		return err
	}
	s.IsSet = true
	return nil
}

func (s Nullable[T]) EncodeJSON(keyCasing KeyCasing) ([]byte, error) {
	if s.IsNull() {
		return []byte("null"), nil
	}
	return EncodeJSON(s.Value, keyCasing)
}

func (s Nullable[T]) String() string {
	if s.IsSet {
		return fmt.Sprintf("NotNull(%v)", s.Value)
	}
	return "Null"
}

type EmptyMessage struct{}

/// PAIR

type pair[a, b any] struct {
	Left  a
	Right b
}

func Pair[a, b any](left a, right b) pair[a, b] {
	return pair[a, b]{
		Left:  left,
		Right: right,
	}
}

/// ORDERED MAP

type OrderedMap[T interface{}] struct {
	keys   []string
	values []T
}

func (m *OrderedMap[T]) Add(items ...pair[string, T]) {
	for i := 0; i < len(items); i++ {
		pair := items[i]
		m.Set(pair.Left, pair.Right)
	}
}

func OrderedMapWithData[T any](items ...pair[string, T]) OrderedMap[T] {
	result := OrderedMap[T]{}
	result.Add(items...)
	return result
}

func (m *OrderedMap[T]) Set(key string, value T) {
	if m.values == nil {
		m.values = []T{}
		m.keys = []string{}
	}
	var targetIndex *int = nil
	for i := 0; i < len(m.keys); i++ {
		el := m.keys[i]
		if el == key {
			targetIndex = &i
			break
		}
	}
	if targetIndex != nil {
		m.values[*targetIndex] = value
		return
	}
	m.values = append(m.values, value)
	m.keys = append(m.keys, key)
}

func (m *OrderedMap[T]) Get(key string) *T {
	var targetIndex *int = nil
	for i := 0; i < len(m.keys); i++ {
		if m.keys[i] == key {
			targetIndex = &i
			break
		}
	}
	if targetIndex != nil {
		return &m.values[*targetIndex]
	}
	return nil
}

func (m OrderedMap[T]) Len() int {
	if m.keys == nil {
		return 0
	}
	return len(m.keys)
}

func (m OrderedMap[T]) MarshalJSON() ([]byte, error) {
	result := []byte{}
	result = append(result, '{')
	for i := 0; i < len(m.keys); i++ {
		key := m.keys[i]
		value := m.values[i]
		if i > 0 {
			result = append(result, ',')
		}
		AppendNormalizedString(&result, key)
		result = append(result, ':')
		innerResult, innerResultErr := json.Marshal(value)
		if innerResultErr != nil {
			return nil, innerResultErr
		}
		result = append(result, innerResult...)
	}
	result = append(result, '}')
	return result, nil
}

func (m OrderedMap[T]) EncodeJSON(keyCasing KeyCasing) ([]byte, error) {
	result := []byte{}
	result = append(result, '{')
	for i := 0; i < len(m.keys); i++ {
		key := m.keys[i]
		value := m.values[i]
		if i > 0 {
			result = append(result, ',')
		}
		AppendNormalizedString(&result, key)
		result = append(result, ':')
		innerResult, innerResultErr := EncodeJSON(value, keyCasing)
		if innerResultErr != nil {
			return nil, innerResultErr
		}
		result = append(result, innerResult...)
	}
	result = append(result, '}')
	return result, nil
}

func (m OrderedMap[T]) String() string {
	result := "OrderedMap["
	for i := 0; i < len(m.keys); i++ {
		if i > 0 {
			result += " "
		}
		key := m.keys[i]
		val := m.values[i]
		result += key
		result += ":"
		result += fmt.Sprintf("%+v", val)
	}
	result += "]"
	return result
}

func (m OrderedMap[T]) DecodeJSON(data *gjson.Result, target reflect.Value, dc *DecoderContext) bool {
	switch data.Type {
	case gjson.Null, gjson.False, gjson.String, gjson.Number:
		dc.Errors = append(dc.Errors, NewValidationError("expected object", dc.InstancePath, dc.SchemaPath))
		return false
	}
	valuesResult := []T{}
	keysResult := []string{}
	gjsonMap := data.Map()
	instancePath := dc.InstancePath
	schemaPath := dc.SchemaPath
	dc.SchemaPath = dc.SchemaPath + "/values"
	dc.CurrentDepth++
	for key, value := range gjsonMap {
		valueTarget := reflect.New(reflect.TypeFor[T]())
		dc.InstancePath = instancePath + "/" + key
		valueResult := typeFromJSON(&value, valueTarget, dc)
		if !valueResult {
			return false
		}
		valuesResult = append(valuesResult, *valueTarget.Interface().(*T))
		keysResult = append(keysResult, key)
	}
	dc.InstancePath = instancePath
	dc.SchemaPath = schemaPath
	dc.CurrentDepth--
	result := OrderedMap[T]{
		keys:   keysResult,
		values: valuesResult,
	}
	target.Set(reflect.ValueOf(result))
	return true
}

func (m OrderedMap[T]) ToTypeDef(keyCasing KeyCasing) (*TypeDef, error) {
	subDef, subDefErr := TypeToTypeDef(reflect.TypeFor[T](), keyCasing)
	if subDefErr != nil {
		return nil, subDefErr
	}
	result := TypeDef{Values: Some(subDef)}
	return &result, nil
}
