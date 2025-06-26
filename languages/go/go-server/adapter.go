package arri

import (
	"net/http"
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
		handler func(any, Request[T]) (any, RpcError),
	)
	RegisterEventStreamRpc(
		name string,
		def RpcDef,
		paramValidator Validator,
		responseValidator Validator,
		handler func(any, UntypedEventStream, Request[T]) RpcError,
	)
	SetGlobalOptions(options AppOptions[T])
	Use(middleware func(req *Request[T]) RpcError)
	Start()
	HasStarted() bool
}

func IsTransportAdapter[T any](input TransportAdapter[T]) bool {
	return true
}

type HttpTransportAdapter[T any] interface {
	TransportAdapter[T]
	RegisterEndpoint(pattern string, handler func(w http.ResponseWriter, r *http.Request))
}

func IsHttpTransportAdapter[T any](input HttpTransportAdapter[T]) bool {
	return true
}

type Validator struct {
	DecodeJSON           func(body []byte) (any, RpcError)
	EncodeJSON           func(input any) ([]byte, error)
	DecodeURLQueryParams func(values url.Values) (any, RpcError)
}

func CreateValidatorFor[TParams any](paramsZero reflect.Value, encodingOpts EncodingOptions, isEmptyMessage bool) Validator {
	if isEmptyMessage {
		return Validator{
			DecodeJSON: func(body []byte) (any, RpcError) {
				return EmptyMessage{}, nil
			},
			DecodeURLQueryParams: func(values url.Values) (any, RpcError) {
				return EmptyMessage{}, nil
			},
			EncodeJSON: func(input any) ([]byte, error) {
				return []byte{}, nil
			},
		}
	}
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
