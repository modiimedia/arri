package main

import (
	"encoding/json"
	"fmt"
)

//// Optional Types ////

type Option[T any] struct {
	value T
	isSet bool
}

func Some[T any](value T) Option[T] {
	return Option[T]{
		isSet: true,
		value: value,
	}
}

func None[T any]() Option[T] {
	return Option[T]{isSet: false}
}

func (s *Option[T]) Unwrap() T {
	if s == nil || !s.isSet {
		panic("Cannot get from None type")
	}
	return s.value
}

func (s *Option[T]) UnwrapOr(fallback T) T {
	if s != nil && s.isSet {
		return s.value
	}
	return fallback
}

func (s *Option[T]) IsSome() bool {
	return s != nil && s.isSet
}

func (s *Option[_]) IsNone() bool {
	return s == nil || !s.isSet
}

func (s *Option[T]) MarshalJSON() ([]byte, error) {
	if s == nil || !s.isSet {
		return []byte{}, nil
	}
	return json.Marshal(s.value)
}

func (s *Option[T]) UnmarshalJSON(data []byte) error {
	if s == nil {
		s = &Option[T]{}
	}
	if string(data) == "" {
		s.isSet = false
		return nil
	}
	json.Unmarshal(data, &s.value)
	return nil
}

func (s Option[T]) String() string {
	if s.isSet {
		return fmt.Sprintf("Some(%v)", s.value)
	} else {
		return "None"
	}
}

//// Nullable Types ////

type Nullable[T any] struct {
	value T
	isSet bool
}

func Null[T any]() Nullable[T] {
	return Nullable[T]{isSet: false}
}

func NotNull[T any](value T) Nullable[T] {
	return Nullable[T]{value: value, isSet: true}
}

func (s *Nullable[_]) IsNull() bool {
	return s != nil && !s.isSet
}

func (s *Nullable[T]) Unwrap() T {
	if s != nil && s.isSet {
		return s.value
	}
	panic("cannot Get value isn't set")
}

func (s *Nullable[T]) UnwrapOr(other T) T {
	if s != nil && s.isSet {
		return s.value
	}
	return other

}

func (s Nullable[T]) MarshalJSON() ([]byte, error) {
	if s.isSet {
		return json.Marshal(s.value)
	}
	return []byte("null"), nil
}

func (s *Nullable[T]) UnmarshalJSON(data []byte) error {
	if s == nil {
		s = &Nullable[T]{}
	}
	if string(data) == "null" {
		s.isSet = false
		return nil
	}
	err := json.Unmarshal(data, &s.value)
	if err != nil {
		return err
	}
	s.isSet = true
	return nil
}

func (s Nullable[T]) String() string {
	if s.isSet {
		return fmt.Sprintf("NotNull(%v)", s.value)
	}
	return "Null"
}
