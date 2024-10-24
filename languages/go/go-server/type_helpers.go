package arri

import (
	"encoding/json"
	"fmt"
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

func (s Option[T]) MarshalJSON() ([]byte, error) {
	if !s.IsNone() {
		return []byte{}, nil
	}
	return json.Marshal(s.Value)
}

func (s *Option[T]) UnmarshalJSON(data []byte) error {
	if s == nil {
		s = &Option[T]{}
	}
	if string(data) == "" {
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

func (s Option[T]) String() string {
	if s.IsSet {
		return fmt.Sprintf("Some(%v)", s.Value)
	} else {
		return "None"
	}
}

//// Nullable Types ////

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

func (s Nullable[T]) String() string {
	if s.IsSet {
		return fmt.Sprintf("NotNull(%v)", s.Value)
	}
	return "Null"
}

type EmptyMessage struct{}

type Result[TVal any] struct {
	value TVal
	err   RpcError
	isOk  bool
}

func Ok[TVal any](value TVal) Result[TVal] {
	return Result[TVal]{
		value: value,
		isOk:  true,
	}
}

func Err[TVal any](err RpcError) Result[TVal] {
	return Result[TVal]{
		err:  err,
		isOk: false,
	}
}

func (r Result[TVal]) IsOk() bool {
	return r.isOk
}

func (r Result[TVal]) IsErr() bool {
	return !r.isOk
}

func (r Result[TVal]) Unwrap() TVal {
	if !r.isOk {
		panic("unable to unwrap value from errored result")
	}
	return r.value
}

func (r Result[TVal]) UnwrapOr(fallback TVal) TVal {
	if r.isOk {
		return r.value
	}
	return fallback
}

func (r Result[TVal]) UnwrapErr() error {
	if r.isOk {
		panic("unable to unwrap err from okay result")
	}
	return r.err
}
