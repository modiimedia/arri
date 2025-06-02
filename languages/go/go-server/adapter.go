package arri

import (
	"net/url"
	"reflect"
)

type TransportAdapter[T any] interface {
	TransportId() string
	RegisterRpc(
		name string,
		def RpcDef,
		paramValidator Validator,
		responseValidator Validator,
		handler func(any, Event[T]) (any, RpcError),
	)
	RegisterEventStreamRpc(
		name string,
		def RpcDef,
		paramValidator Validator,
		responseValidator Validator,
		handler func(any, EventStream[any], Event[T]) RpcError,
	)
	SetHooks(hooks AppHooks[T])
	SetGlobalOptions(options AppOptions)
	Use(middleware func(event *Event[T]) RpcError)
	Start()
}

func IsTransportAdapter[T any](input TransportAdapter[T]) bool {
	return true
}

type Validator struct {
	DecodeJSON           func(body []byte) (any, RpcError)
	EncodeJSON           func(input any) ([]byte, error)
	DecodeURLQueryParams func(values url.Values) (any, RpcError)
}

func CreateValidatorFor[TParams any](paramsZero reflect.Value, encodingOpts EncodingOptions) Validator {
	return Validator{
		DecodeJSON: func(body []byte) (any, RpcError) {
			params, paramsOk := paramsZero.Interface().(TParams)
			if !paramsOk {
				return params, Error(500, "error initializing empty params")
			}
			err := DecodeJSON(body, &params, encodingOpts)
			return params, err
		},
		DecodeURLQueryParams: func(values url.Values) (any, RpcError) {
			params, paramsOk := paramsZero.Interface().(TParams)
			if !paramsOk {
				return params, Error(500, "error initializing empty params")
			}
			err := DecodeQueryParams(values, &params, encodingOpts)
			return params, err
		},
		EncodeJSON: func(input any) ([]byte, error) {
			result, err := EncodeJSON(input, encodingOpts)
			return result, err
		},
	}
}
