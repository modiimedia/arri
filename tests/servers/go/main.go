package main

import (
	"net/http"
	"strings"
	"time"

	"arrirpc.com/arri"
)

type AppContext struct {
	XTestHeader string
	request     *http.Request
	writer      http.ResponseWriter
}

func (c AppContext) Request() *http.Request {
	return c.request
}

func (c AppContext) Writer() http.ResponseWriter {
	return c.writer
}

func main() {
	mux := http.DefaultServeMux
	mux.HandleFunc("/routes/hello-world", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
		w.Write([]byte("hello world"))
	})
	app := arri.NewApp(
		mux,
		arri.AppOptions[AppContext]{
			AppVersion:     "10",
			RpcRoutePrefix: "/rpcs",
			OnRequest: func(r *http.Request, ac *AppContext) arri.RpcError {
				if len(ac.XTestHeader) == 0 &&
					r.URL.Path != "/" &&
					r.URL.Path != "/status" &&
					r.URL.Path != "/favicon.ico" &&
					!strings.HasSuffix(r.URL.Path, "__definition") {
					return arri.Error(401, "Missing test auth header 'x-test-header'")
				}
				return nil
			},
		},
		func(w http.ResponseWriter, r *http.Request) (*AppContext, arri.RpcError) {
			return &AppContext{
				request:     r,
				writer:      w,
				XTestHeader: r.Header.Get("x-test-header"),
			}, nil
		},
	)
	arri.ScopedRpc(&app, "tests", EmptyParamsGetRequest, arri.RpcOptions{Method: arri.HttpMethodGet})
	arri.ScopedRpc(&app, "tests", EmptyParamsPostRequest, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", EmptyResponseGetRequest, arri.RpcOptions{Method: arri.HttpMethodGet})
	arri.ScopedRpc(&app, "tests", EmptyResponsePostRequest, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendError, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendObject, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendObjectWithNullableFields, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendPartialObject, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendRecursiveObject, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendRecursiveUnion, arri.RpcOptions{})

	app.Run(arri.RunOptions{Port: 2020})
}

func DeprecatedRpc(_ arri.EmptyMessage, _ AppContext) (arri.EmptyMessage, arri.RpcError) {
	return arri.EmptyMessage{}, nil
}

type DefaultPayload struct {
	Message string
}

func EmptyParamsGetRequest(_ arri.EmptyMessage, _ AppContext) (DefaultPayload, arri.RpcError) {
	return DefaultPayload{Message: "ok"}, nil
}

func EmptyParamsPostRequest(_ arri.EmptyMessage, _ AppContext) (DefaultPayload, arri.RpcError) {
	return DefaultPayload{Message: "ok"}, nil
}

func EmptyResponseGetRequest(_ DefaultPayload, _ AppContext) (arri.EmptyMessage, arri.RpcError) {
	return arri.EmptyMessage{}, nil
}

func EmptyResponsePostRequest(_ DefaultPayload, _ AppContext) (arri.EmptyMessage, arri.RpcError) {
	return arri.EmptyMessage{}, nil
}

type SendErrorParams struct {
	Code    uint16
	Message string
}

func SendError(params SendErrorParams, _ AppContext) (arri.EmptyMessage, arri.RpcError) {
	return arri.EmptyMessage{}, arri.Error(uint32(params.Code), params.Message)
}

type ObjectWithEveryType struct {
	Any        any
	Boolean    bool
	String     string
	Timestamp  time.Time
	Float32    float32
	Float64    float64
	Int8       int8
	Uint8      uint8
	Int16      int16
	Uint16     uint16
	Int32      int32
	Uint32     uint32
	Int64      int64
	Uint64     uint64
	Enumerator string `enum:"A,B,C"`
	Array      []bool
	Object     struct {
		String    string
		Boolean   bool
		Timestamp time.Time
	}
	Record        map[string]uint64
	Discriminator struct {
		A *struct {
			Title string
		} `discriminator:"A"`
		B *struct {
			Title       string
			Description string
		} `discriminator:"B"`
	}
	NestedObject struct {
		Id        string
		Timestamp time.Time
		Data      struct {
			Id        string
			Timestamp time.Time
			Data      struct {
				Id        string
				Timestamp time.Time
			}
		}
	}
	NestedArray [][]struct {
		Id        string
		Timestamp time.Time
	}
}

func SendObject(params ObjectWithEveryType, _ AppContext) (ObjectWithEveryType, arri.RpcError) {
	return params, nil
}

type ObjectWithEveryNullableType struct {
	Any        arri.Nullable[any]
	Boolean    arri.Nullable[bool]
	String     arri.Nullable[string]
	Timestamp  arri.Nullable[time.Time]
	Float32    arri.Nullable[float32]
	Float64    arri.Nullable[float64]
	Int8       arri.Nullable[int8]
	Uint8      arri.Nullable[uint8]
	Int16      arri.Nullable[int16]
	Uint16     arri.Nullable[uint16]
	Int32      arri.Nullable[int32]
	Uint32     arri.Nullable[uint32]
	Int64      arri.Nullable[int64]
	Uint64     arri.Nullable[uint64]
	Enumerator arri.Nullable[string] `enum:"A,B,C"`
	Array      arri.Nullable[[]arri.Nullable[bool]]
	Object     arri.Nullable[struct {
		String    arri.Nullable[string]
		Boolean   arri.Nullable[bool]
		Timestamp arri.Nullable[time.Time]
	}]
	Record        arri.Nullable[map[string]arri.Nullable[uint64]]
	Discriminator arri.Nullable[struct {
		A *struct {
			Title arri.Nullable[string]
		} `discriminator:"B"`
		B *struct {
			Title       arri.Nullable[string]
			Description arri.Nullable[string]
		} `discriminator:"A"`
	}]
	NestedObject arri.Nullable[struct {
		Id        arri.Nullable[string]
		Timestamp arri.Nullable[time.Time]
		Data      arri.Nullable[struct {
			Id        arri.Nullable[string]
			Timestamp arri.Nullable[time.Time]
			Data      arri.Nullable[struct {
				Id        arri.Nullable[string]
				Timestamp arri.Nullable[time.Time]
			}]
		}]
	}]
	NestedArray arri.Nullable[[]arri.Nullable[[]arri.Nullable[struct {
		Id        arri.Nullable[string]
		Timestamp arri.Nullable[time.Time]
	}]]]
}

func SendObjectWithNullableFields(params ObjectWithEveryNullableType, _ AppContext) (ObjectWithEveryNullableType, arri.RpcError) {
	return params, nil
}

type ObjectWithEveryOptionalType struct {
	Any        arri.Option[any]
	Boolean    arri.Option[bool]
	String     arri.Option[string]
	Timestamp  arri.Option[time.Time]
	Float32    arri.Option[float32]
	Float64    arri.Option[float64]
	Int8       arri.Option[int8]
	Uint8      arri.Option[uint8]
	Int16      arri.Option[int16]
	Uint16     arri.Option[uint16]
	Int32      arri.Option[int32]
	Uint32     arri.Option[uint32]
	Int64      arri.Option[int64]
	Uint64     arri.Option[uint64]
	Enumerator arri.Option[string] `enum:"A,B,C"`
	Array      arri.Option[[]bool]
	Object     arri.Option[struct {
		String    string
		Boolean   bool
		Timestamp time.Time
	}]
	Record        arri.Option[map[string]uint64]
	Discriminator arri.Option[struct {
		A *struct {
			Title string
		} `discriminator:"A"`
		B *struct {
			Title       string
			Description string
		} `discriminator:"B"`
	}]
	NestedObject arri.Option[struct {
		Id        string
		Timestamp time.Time
		Data      struct {
			Id        string
			Timestamp time.Time
			Data      struct {
				Id        string
				Timestamp time.Time
			}
		}
	}]
	NestedArray arri.Option[[][]struct {
		Id        string
		Timestamp time.Time
	}]
}

func SendPartialObject(params ObjectWithEveryOptionalType, _ AppContext) (ObjectWithEveryOptionalType, arri.RpcError) {
	return params, nil
}

type RecursiveObject struct {
	Left  *RecursiveObject
	Right *RecursiveObject
	Value string
}

func SendRecursiveObject(params RecursiveObject, _ AppContext) (RecursiveObject, arri.RpcError) {
	return params, nil
}

type RecursiveUnion struct {
	Child *struct {
		Data RecursiveUnion
	} `discriminator:"CHILD" description:"Child node"`
	Children *struct {
		Data []RecursiveUnion
	} `discriminator:"CHILDREN" description:"List of children"`
	Text *struct {
		Data string
	} `discriminator:"TEXT" description:"Text node"`
	Shape *struct {
		Data struct {
			Width  float64
			Height float64
			Color  string
		}
	} `discriminator:"SHAPE" description:"Shape node"`
}

func SendRecursiveUnion(params RecursiveUnion, _ AppContext) (RecursiveUnion, arri.RpcError) {
	return params, nil
}
