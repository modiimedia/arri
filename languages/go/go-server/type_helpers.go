package main

import (
	"encoding/json"
	"fmt"
)

//// Optional Types ////

type Option[T any] struct {
	Value T
	IsSet bool
}

func Some[T any](value T) Option[T] {
	return Option[T]{
		IsSet: true,
		Value: value,
	}
}

func None[T any]() Option[T] {
	return Option[T]{IsSet: false}
}

func (s *Option[T]) Unwrap() T {
	if s == nil || !s.IsSet {
		panic("Cannot get from None type")
	}
	return s.Value
}

func (s *Option[T]) UnwrapOr(fallback T) T {
	if s != nil && s.IsSet {
		return s.Value
	}
	return fallback
}

func (s *Option[T]) IsSome() bool {
	return s != nil && s.IsSet
}

func (s *Option[_]) IsNone() bool {
	return s == nil || !s.IsSet
}

func (s Option[T]) MarshalJSON() ([]byte, error) {
	if !s.IsSet {
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

func (s *Nullable[_]) IsNull() bool {
	return s != nil && !s.IsSet
}

func (s *Nullable[T]) Unwrap() T {
	if s != nil && s.IsSet {
		return s.Value
	}
	panic("cannot Get value isn't set")
}

func (s *Nullable[T]) UnwrapOr(other T) T {
	if s != nil && s.IsSet {
		return s.Value
	}
	return other

}

func (s Nullable[T]) MarshalJSON() ([]byte, error) {
	if s.IsSet {
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
