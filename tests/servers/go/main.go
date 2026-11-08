package main

import (
	"math/rand"
	"net/http"
	"strings"
	"time"

	arri "github.com/modiimedia/arri/languages/go/go-server"

	"github.com/google/uuid"
	"gopkg.in/loremipsum.v1"
)

type RpcEvent struct {
	XTestHeader string
	request     *http.Request
	writer      http.ResponseWriter
}

func (e RpcEvent) Request() *http.Request {
	return e.request
}

func (e RpcEvent) Writer() http.ResponseWriter {
	return e.writer
}

func main() {
	mux := http.DefaultServeMux
	mux.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
		w.Write([]byte("ok"))
	})
	mux.HandleFunc("/routes/hello-world", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
		w.Write([]byte("hello world"))
	})
	app := arri.NewApp(
		mux,
		arri.AppOptions[RpcEvent]{
			AppVersion:     "10",
			RpcRoutePrefix: "/rpcs",
			OnRequest: func(event *RpcEvent) arri.RpcError {
				event.Writer().Header().Set("Access-Control-Allow-Origin", "*")
				return nil
			},
			OnError: func(ac *RpcEvent, err error) {},
		},
		func(w http.ResponseWriter, r *http.Request) (*RpcEvent, arri.RpcError) {
			return &RpcEvent{
				request:     r,
				writer:      w,
				XTestHeader: r.Header.Get("x-test-header"),
			}, nil
		},
	)
	arri.Use(&app, func(r *http.Request, event RpcEvent, rpcName string) arri.RpcError {
		if len(event.XTestHeader) == 0 &&
			r.URL.Path != "/" &&
			r.URL.Path != "/status" &&
			r.URL.Path != "/favicon.ico" &&
			!strings.HasSuffix(r.URL.Path, "__definition") {
			return arri.Error(401, "Missing test auth header 'x-test-header'")
		}
		return nil
	})

	val := arri.OrderedMap[bool]{}
	val.Add(arri.Pair("A", true))

	arri.RegisterDef(&app, ManuallyAddedModel{}, arri.DefOptions{})
	arri.ScopedRpc(&app, "tests.nested", EmptyParamsGetRequest, arri.RpcOptions{Method: arri.HttpMethodGet})
	arri.ScopedRpc(&app, "tests.nested", EmptyParamsPostRequest, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests.nested", EmptyResponseGetRequest, arri.RpcOptions{Method: arri.HttpMethodGet})
	arri.ScopedRpc(&app, "tests.nested", EmptyResponsePostRequest, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", DeprecatedRpc, arri.RpcOptions{
		IsDeprecated: true,
		Description:  "If the target language supports it. Generated code should mark this procedure as deprecated.",
	})
	arri.RegisterDef(&app, DeprecatedRpcParams{}, arri.DefOptions{IsDeprecated: true})
	arri.ScopedRpc(&app, "tests", SendDiscriminatorWithEmptyObject, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendError, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendObject, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendObjectWithKebabCaseKeys, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendObjectWithNullableFields, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendObjectWithPascalCaseKeys, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendObjectWithSnakeCaseKeys, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendPartialObject, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendRecursiveObject, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendRecursiveUnionAdjacent, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendRecursiveUnionExternal, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendRecursiveUnionInternal, arri.RpcOptions{})
	arri.ScopedRpc(&app, "tests", SendUnionInternalGetRequest, arri.RpcOptions{
		Method:      arri.HttpMethodGet,
		Description: "GET requests send params through url query params. Only internally tagged unions can be represented this way.",
	})
	arri.ScopedRpc(&app, "tests", SendUnionVariantShapes, arri.RpcOptions{
		Description: "Union variants with no fields, only optional fields, a mix of required, optional, and nullable fields, and nested fields.",
	})
	arri.ScopedRpc(&app, "tests", SendUnionVariantTypes, arri.RpcOptions{
		Description: "Union variants of every value type, nested unions, and names that are reserved words in many languages.",
	})
	arri.ScopedEventStreamRpc(&app, "tests", StreamAutoReconnect, arri.RpcOptions{})
	arri.ScopedEventStreamRpc(&app, "tests", StreamConnectionErrorTest, arri.RpcOptions{Description: "This route will always return an error. The client should automatically retry with exponential backoff."})
	arri.ScopedEventStreamRpc(&app, "tests", StreamHeartbeatDetectionTest, arri.RpcOptions{Description: `Sends 5 messages quickly then starts sending messages slowly (1s) after that.
When heartbeat is enabled the client should keep the connection alive regardless of the slowdown of messages.
When heartbeat is disabled the client should open a new connection sometime after receiving the 5th message.`,
	})
	arri.ScopedEventStreamRpc(&app, "tests", StreamLargeObjects, arri.RpcOptions{Description: "Test to ensure that the client can handle receiving streams of large objects. When objects are large messages will sometimes get sent in chunks. Meaning you have to handle receiving a partial message"})
	arri.ScopedEventStreamRpc(&app, "tests", StreamMessages, arri.RpcOptions{})
	arri.ScopedEventStreamRpc(&app, "tests", StreamRetryWithNewCredentials, arri.RpcOptions{})
	arri.ScopedEventStreamRpc(&app, "tests", StreamTenEventsThenEnd, arri.RpcOptions{Description: "When the client receives the 'done' event, it should close the connection and NOT reconnect"})
	arri.ScopedEventStreamRpc(&app, "users", WatchUser, arri.RpcOptions{})
	app.Run(arri.RunOptions{Port: 2020})
}

type ManuallyAddedModel struct {
	Hello string
}

type DeprecatedRpcParams struct {
	DeprecatedField string `arri:"deprecated"`
}

func DeprecatedRpc(_ DeprecatedRpcParams, _ RpcEvent) (arri.EmptyMessage, arri.RpcError) {
	return arri.EmptyMessage{}, nil
}

type DiscriminatorWithEmptyObject struct {
	Empty    *DiscriminatorWithEmptyObjectEmpty    `discriminator:"EMPTY"`
	NotEmpty *DiscriminatorWithEmptyObjectNotEmpty `discriminator:"NOT_EMPTY"`
}

// alias of an anonymous struct so the definition doesn't get an id, matching the ts test server
type DiscriminatorWithEmptyObjectEmpty = struct{}

// alias of an anonymous struct so the definition doesn't get an id, matching the ts test server
type DiscriminatorWithEmptyObjectNotEmpty = struct {
	Foo string
	Bar float64
	Baz bool
}

func SendDiscriminatorWithEmptyObject(params DiscriminatorWithEmptyObject, _ RpcEvent) (DiscriminatorWithEmptyObject, arri.RpcError) {
	return params, nil
}

type DefaultPayload struct {
	Message string
}

func EmptyParamsGetRequest(_ arri.EmptyMessage, _ RpcEvent) (DefaultPayload, arri.RpcError) {
	return DefaultPayload{Message: "ok"}, nil
}

func EmptyParamsPostRequest(_ arri.EmptyMessage, _ RpcEvent) (DefaultPayload, arri.RpcError) {
	return DefaultPayload{Message: "ok"}, nil
}

func EmptyResponseGetRequest(_ DefaultPayload, _ RpcEvent) (arri.EmptyMessage, arri.RpcError) {
	return arri.EmptyMessage{}, nil
}

func EmptyResponsePostRequest(_ DefaultPayload, _ RpcEvent) (arri.EmptyMessage, arri.RpcError) {
	return arri.EmptyMessage{}, nil
}

type SendErrorParams struct {
	Code    uint16
	Message string
}

func SendError(params SendErrorParams, _ RpcEvent) (arri.EmptyMessage, arri.RpcError) {
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
	UnionExternal struct {
		arri.Union
		Object *struct {
			Id      string
			Content string
		}
		Array             *[]string
		Boolean           *bool
		NullableTimestamp *arri.Nullable[time.Time] `tag:"nullable-timestamp"`
	}
	UnionInternal struct {
		arri.Union `tagKey:"shape"`
		Rectangle  *struct {
			Width  float64
			Height float64
		}
		Circle *struct {
			Radius float64
		}
	}
	UnionAdjacent struct {
		arri.Union `tagKey:"kind" valueKey:"data"`
		Object     *struct {
			Id      string
			Content string
		}
		Array             *[]string
		Boolean           *bool
		NullableTimestamp *arri.Nullable[time.Time] `tag:"nullable-timestamp"`
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

func SendObject(params ObjectWithEveryType, _ RpcEvent) (ObjectWithEveryType, arri.RpcError) {
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
	UnionExternal arri.Nullable[struct {
		arri.Union
		Object *struct {
			Id      string
			Content string
		}
		Array             *[]string
		Boolean           *bool
		NullableTimestamp *arri.Nullable[time.Time] `tag:"nullable-timestamp"`
	}]
	UnionInternal arri.Nullable[struct {
		arri.Union `tagKey:"shape"`
		Rectangle  *struct {
			Width  float64
			Height float64
		}
		Circle *struct {
			Radius float64
		}
	}]
	UnionAdjacent arri.Nullable[struct {
		arri.Union `tagKey:"kind" valueKey:"data"`
		Object     *struct {
			Id      string
			Content string
		}
		Array             *[]string
		Boolean           *bool
		NullableTimestamp *arri.Nullable[time.Time] `tag:"nullable-timestamp"`
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

func SendObjectWithNullableFields(params ObjectWithEveryNullableType, _ RpcEvent) (ObjectWithEveryNullableType, arri.RpcError) {
	return params, nil
}

type ObjectWithKebabCaseKeys struct {
	CreatedAt     time.Time             `key:"created-at"`
	DisplayName   string                `key:"display-name"`
	EmailAddress  arri.Option[string]   `key:"email-address"`
	PhoneNumber   arri.Nullable[string] `key:"phone-number"`
	ExternalEvent arri.Nullable[struct {
		arri.Union
		UserCreated *struct {
			UserId string `key:"user-id"`
		} `tag:"user-created"`
		UserUpdated *struct {
			UserId string `key:"user-id"`
		} `tag:"user-updated"`
		UserDeleted *struct {
			UserId string `key:"user-id"`
		} `tag:"user-deleted"`
	}] `key:"external-event"`
	InternalEvent struct {
		arri.Union  `tagKey:"event-type"`
		UserCreated *struct {
			UserId string `key:"user-id"`
		} `tag:"user-created"`
		UserUpdated *struct {
			UserId    string                 `key:"user-id"`
			UpdatedAt arri.Option[time.Time] `key:"updated-at"`
		} `tag:"user-updated"`
	} `key:"internal-event"`
	AdjacentEvent struct {
		arri.Union  `tagKey:"event-type" valueKey:"event-data"`
		UserCreated *struct {
			UserId string `key:"user-id"`
		} `tag:"user-created"`
		UserUpdated *string `tag:"user-updated"`
	} `key:"adjacent-event"`
	IsAdmin arri.Option[bool] `key:"is-admin"`
}

func SendObjectWithKebabCaseKeys(params ObjectWithKebabCaseKeys, _ RpcEvent) (ObjectWithKebabCaseKeys, arri.RpcError) {
	return params, nil
}

type ObjectWithPascalCaseKeys struct {
	CreatedAt     time.Time             `key:"CreatedAt"`
	DisplayName   string                `key:"DisplayName"`
	EmailAddress  arri.Option[string]   `key:"EmailAddress"`
	PhoneNumber   arri.Nullable[string] `key:"PhoneNumber"`
	ExternalEvent arri.Nullable[struct {
		arri.Union
		UserCreated *struct {
			UserId string `key:"UserId"`
		} `tag:"UserCreated"`
		UserUpdated *struct {
			UserId string `key:"UserId"`
		} `tag:"UserUpdated"`
		UserDeleted *struct {
			UserId string `key:"UserId"`
		} `tag:"UserDeleted"`
	}] `key:"ExternalEvent"`
	InternalEvent struct {
		arri.Union  `tagKey:"EventType"`
		UserCreated *struct {
			UserId string `key:"UserId"`
		} `tag:"UserCreated"`
		UserUpdated *struct {
			UserId    string                 `key:"UserId"`
			UpdatedAt arri.Option[time.Time] `key:"UpdatedAt"`
		} `tag:"UserUpdated"`
	} `key:"InternalEvent"`
	AdjacentEvent struct {
		arri.Union  `tagKey:"EventType" valueKey:"EventData"`
		UserCreated *struct {
			UserId string `key:"UserId"`
		} `tag:"UserCreated"`
		UserUpdated *string `tag:"UserUpdated"`
	} `key:"AdjacentEvent"`
	IsAdmin arri.Option[bool] `key:"IsAdmin"`
}

func SendObjectWithPascalCaseKeys(params ObjectWithPascalCaseKeys, _ RpcEvent) (ObjectWithPascalCaseKeys, arri.RpcError) {
	return params, nil
}

type ObjectWithSnakeCaseKeys struct {
	CreatedAt     time.Time             `key:"created_at"`
	DisplayName   string                `key:"display_name"`
	EmailAddress  arri.Option[string]   `key:"email_address"`
	PhoneNumber   arri.Nullable[string] `key:"phone_number"`
	ExternalEvent arri.Nullable[struct {
		arri.Union
		UserCreated *struct {
			UserId string `key:"user_id"`
		} `tag:"user_created"`
		UserUpdated *struct {
			UserId string `key:"user_id"`
		} `tag:"user_updated"`
		UserDeleted *struct {
			UserId string `key:"user_id"`
		} `tag:"user_deleted"`
	}] `key:"external_event"`
	InternalEvent struct {
		arri.Union  `tagKey:"event_type"`
		UserCreated *struct {
			UserId string `key:"user_id"`
		} `tag:"user_created"`
		UserUpdated *struct {
			UserId    string                 `key:"user_id"`
			UpdatedAt arri.Option[time.Time] `key:"updated_at"`
		} `tag:"user_updated"`
	} `key:"internal_event"`
	AdjacentEvent struct {
		arri.Union  `tagKey:"event_type" valueKey:"event_data"`
		UserCreated *struct {
			UserId string `key:"user_id"`
		} `tag:"user_created"`
		UserUpdated *string `tag:"user_updated"`
	} `key:"adjacent_event"`
	IsAdmin arri.Option[bool] `key:"is_admin"`
}

func SendObjectWithSnakeCaseKeys(params ObjectWithSnakeCaseKeys, _ RpcEvent) (ObjectWithSnakeCaseKeys, arri.RpcError) {
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
	UnionExternal arri.Option[struct {
		arri.Union
		Object *struct {
			Id      string
			Content string
		}
		Array             *[]string
		Boolean           *bool
		NullableTimestamp *arri.Nullable[time.Time] `tag:"nullable-timestamp"`
	}]
	UnionInternal arri.Option[struct {
		arri.Union `tagKey:"shape"`
		Rectangle  *struct {
			Width  float64
			Height float64
		}
		Circle *struct {
			Radius float64
		}
	}]
	UnionAdjacent arri.Option[struct {
		arri.Union `tagKey:"kind" valueKey:"data"`
		Object     *struct {
			Id      string
			Content string
		}
		Array             *[]string
		Boolean           *bool
		NullableTimestamp *arri.Nullable[time.Time] `tag:"nullable-timestamp"`
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

func SendPartialObject(params ObjectWithEveryOptionalType, _ RpcEvent) (ObjectWithEveryOptionalType, arri.RpcError) {
	return params, nil
}

type RecursiveObject struct {
	Left  *RecursiveObject
	Right *RecursiveObject
	Value string
}

func SendRecursiveObject(params RecursiveObject, _ RpcEvent) (RecursiveObject, arri.RpcError) {
	return params, nil
}

type RecursiveUnionExternal struct {
	arri.Union
	Child    *RecursiveUnionExternal
	Children *[]RecursiveUnionExternal `description:"an array of child nodes"`
	Text     *string                   `description:"Text node"`
	Shape    *struct {
		Width  float64
		Height float64
		Color  string
	} `description:"Shape node"`
}

func SendRecursiveUnionExternal(params RecursiveUnionExternal, _ RpcEvent) (RecursiveUnionExternal, arri.RpcError) {
	return params, nil
}

type RecursiveUnionInternal struct {
	arri.Union `tagKey:"kind"`
	Child      *struct {
		Data RecursiveUnionInternal
	}
	Children *struct {
		Data []RecursiveUnionInternal `description:"an array of child nodes"`
	}
	Text *struct {
		Data string `description:"Text node"`
	}
	Shape *struct {
		Data struct {
			Width  float64
			Height float64
			Color  string
		} `description:"Shape node"`
	}
}

func SendRecursiveUnionInternal(params RecursiveUnionInternal, _ RpcEvent) (RecursiveUnionInternal, arri.RpcError) {
	return params, nil
}

type RecursiveUnionAdjacent struct {
	arri.Union `tagKey:"kind" valueKey:"data"`
	Child      *RecursiveUnionAdjacent
	Children   *[]RecursiveUnionAdjacent `description:"an array of child nodes"`
	Text       *string                   `description:"Text node"`
	Shape      *struct {
		Width  float64
		Height float64
		Color  string
	} `description:"Shape node"`
}

func SendRecursiveUnionAdjacent(params RecursiveUnionAdjacent, _ RpcEvent) (RecursiveUnionAdjacent, arri.RpcError) {
	return params, nil
}

type UnionInternalGetRequest struct {
	arri.Union `tagKey:"kind"`
	WithFields *struct {
		String         string
		NullableString arri.Nullable[string]
		Float64        float64
		Int64          int64
		Boolean        bool
		Timestamp      time.Time
		NullableEnum   arri.Nullable[string] `enum:"A,B"`
		OptionalString arri.Option[string]
	} `tag:"with-fields"`
	Empty *struct{}
}

func SendUnionInternalGetRequest(params UnionInternalGetRequest, _ RpcEvent) (UnionInternalGetRequest, arri.RpcError) {
	return params, nil
}

type UnionVariantShapes struct {
	Internal struct {
		arri.Union  `tagKey:"kind"`
		Empty       *struct{}
		AllOptional *struct {
			First  arri.Option[string]
			Second arri.Option[int32]
		} `tag:"all-optional"`
		Mixed *struct {
			Required string
			Nullable arri.Nullable[string]
			Optional arri.Option[string]
		}
		Nested *struct {
			Array  []struct{ Id string }
			Record map[string]int64
			Object struct{ Timestamp time.Time }
		}
	}
	External struct {
		arri.Union
		Empty       *struct{}
		AllOptional *struct {
			First  arri.Option[string]
			Second arri.Option[int32]
		} `tag:"all-optional"`
		Mixed *struct {
			Required string
			Nullable arri.Nullable[string]
			Optional arri.Option[string]
		}
	}
	Adjacent struct {
		arri.Union  `tagKey:"kind" valueKey:"data"`
		Empty       *struct{}
		AllOptional *struct {
			First  arri.Option[string]
			Second arri.Option[int32]
		} `tag:"all-optional"`
		Mixed *struct {
			Required string
			Nullable arri.Nullable[string]
			Optional arri.Option[string]
		}
	}
}

func SendUnionVariantShapes(params UnionVariantShapes, _ RpcEvent) (UnionVariantShapes, arri.RpcError) {
	return params, nil
}

type UnionVariantTypes struct {
	External struct {
		arri.Union
		String         *string
		Int64          *int64
		Uint64         *uint64
		Float64        *float64
		Enumerator     *string `enum:"A,B"`
		Record         *map[string]string
		Any            *any
		NullableString *arri.Nullable[string]
		NullableArray  *arri.Nullable[[]string]
		ExternalUnion  *struct {
			arri.Union
			Text *string
		}
		InternalUnion *struct {
			arri.Union `tagKey:"shape"`
			Circle     *struct{ Radius float64 }
		}
		AdjacentUnion *struct {
			arri.Union `tagKey:"kind" valueKey:"data"`
			Text       *string
		}
		Class   *string
		Default *string
	}
	Adjacent struct {
		arri.Union     `tagKey:"kind" valueKey:"data"`
		String         *string
		Int64          *int64
		Uint64         *uint64
		Float64        *float64
		Enumerator     *string `enum:"A,B"`
		Record         *map[string]string
		Any            *any
		NullableString *arri.Nullable[string]
		NullableArray  *arri.Nullable[[]string]
		ExternalUnion  *struct {
			arri.Union
			Text *string
		}
		InternalUnion *struct {
			arri.Union `tagKey:"shape"`
			Circle     *struct{ Radius float64 }
		}
		AdjacentUnion *struct {
			arri.Union `tagKey:"kind" valueKey:"data"`
			Text       *string
		}
		Class   *string
		Default *string
	}
	Internal struct {
		arri.Union `tagKey:"kind"`
		Class      *struct {
			For     string
			Default string
		}
		Default *struct {
			Class         string
			InternalUnion struct {
				arri.Union `tagKey:"shape"`
				Circle     *struct{ Radius float64 }
			}
			AdjacentUnion struct {
				arri.Union `tagKey:"kind" valueKey:"data"`
				Text       *string
			}
			ExternalUnion struct {
				arri.Union
				Text *string
			}
		}
	}
}

func SendUnionVariantTypes(params UnionVariantTypes, _ RpcEvent) (UnionVariantTypes, arri.RpcError) {
	return params, nil
}

type AutoReconnectParams struct {
	MessageCount uint8
}

type AutoReconnectResponse struct {
	Count   uint8
	Message string
}

func StreamAutoReconnect(params AutoReconnectParams, controller arri.SseController[AutoReconnectResponse], event RpcEvent) arri.RpcError {
	t := time.NewTicker(time.Millisecond)
	defer t.Stop()
	var msgCount uint8 = 0
	for {
		select {
		case <-t.C:
			msgCount++
			controller.Push(AutoReconnectResponse{Count: msgCount, Message: "Hello World " + string(msgCount)})
			if msgCount == params.MessageCount {
				controller.Close(false)
				return nil
			}
			if msgCount > params.MessageCount {
				panic("Request was not properly cancelled")
			}
		case <-controller.Done():
			return nil
		}
	}
}

type StreamHeartbeatDetectionTestParams struct {
	HeartbeatEnabled bool
}

type StreamHeartbeatDetectionTestResponse struct {
	Message string
}

func StreamHeartbeatDetectionTest(params StreamHeartbeatDetectionTestParams, stream arri.SseController[StreamHeartbeatDetectionTestResponse], _ RpcEvent) arri.RpcError {
	stream.SetHeartbeatInterval(time.Millisecond * 300)
	stream.SetHeartbeatEnabled(params.HeartbeatEnabled)
	for i := 0; i < 5; i++ {
		stream.Push(StreamHeartbeatDetectionTestResponse{Message: "hello world"})
	}
	t := time.NewTicker(time.Second * 2)
	for {
		select {
		case <-t.C:
			stream.Push(StreamHeartbeatDetectionTestResponse{Message: "Hello world"})
		case <-stream.Done():
			return nil
		}
	}
}

type StreamConnectionErrorTestParams struct {
	StatusCode    int32
	StatusMessage string
}

type StreamConnectionErrorTestResponse struct {
	Message string
}

func StreamConnectionErrorTest(
	params StreamConnectionErrorTestParams,
	controller arri.SseController[StreamConnectionErrorTestResponse],
	_ RpcEvent,
) arri.RpcError {
	return arri.Error(uint32(params.StatusCode), params.StatusMessage)
}

type StreamLargeObjectsResponse struct {
	Numbers []float64
	Objects []struct {
		Id    string
		Name  string
		Email string
	}
}

func StreamLargeObjects(params arri.EmptyMessage, controller arri.SseController[StreamLargeObjectsResponse], _ RpcEvent) arri.RpcError {
	t := time.NewTicker(time.Millisecond)
	defer t.Stop()
	for {
		select {
		case <-t.C:
			payload := randomLargeObjectResponse()
			controller.Push(payload)
		case <-controller.Done():
			return nil
		}
	}
}

func randomLargeObjectResponse() StreamLargeObjectsResponse {
	result := StreamLargeObjectsResponse{
		Numbers: []float64{},
		Objects: []struct {
			Id    string
			Name  string
			Email string
		}{},
	}
	for i := 0; i < 10000; i++ {
		result.Numbers = append(result.Numbers, rand.Float64())
		result.Objects = append(result.Objects, struct {
			Id    string
			Name  string
			Email string
		}{
			Id:    uuid.NewString(),
			Name:  loremipsum.New().Sentence(),
			Email: loremipsum.New().Sentence(),
		})
	}
	return result
}

type ChatMessageParams struct {
	ChannelId string
}

type ChatMessage struct {
	arri.DiscriminatorKey `discriminatorKey:"messageType"`
	*ChatMessageText      `discriminator:"TEXT"`
	*ChatMessageImage     `discriminator:"IMAGE"`
	*ChatMessageUrl       `discriminator:"URL"`
}

// alias of an anonymous struct so the definition doesn't get an id, matching the ts test server
type ChatMessageText = struct {
	Id        string
	ChannelId string
	UserId    string
	Date      time.Time
	Text      string
}

// alias of an anonymous struct so the definition doesn't get an id, matching the ts test server
type ChatMessageImage = struct {
	Id        string
	ChannelId string
	UserId    string
	Date      time.Time
	Image     string
}

// alias of an anonymous struct so the definition doesn't get an id, matching the ts test server
type ChatMessageUrl = struct {
	Id        string
	ChannelId string
	UserId    string
	Date      time.Time
	Url       string
}

func StreamMessages(params ChatMessageParams, controller arri.SseController[ChatMessage], event RpcEvent) arri.RpcError {
	t := time.NewTicker(time.Millisecond)
	for {
		select {
		case <-t.C:
			controller.Push(ChatMessage{ChatMessageText: &ChatMessageText{
				ChannelId: params.ChannelId,
				Text:      "Hello world",
			}})
		case <-controller.Done():
			return nil
		}
	}
}

// alias of an anonymous struct so the definition doesn't get an id, matching the ts test server
type TestsStreamRetryWithNewCredentialsResponse = struct {
	Message string
}

var usedTokens map[string]bool = map[string]bool{}

func StreamRetryWithNewCredentials(_ arri.EmptyMessage, controller arri.SseController[TestsStreamRetryWithNewCredentialsResponse], event RpcEvent) arri.RpcError {
	authToken := event.XTestHeader
	if len(authToken) == 0 {
		return arri.Error(400, "")
	}
	tokenWasUsed, ok := usedTokens[authToken]
	if ok && tokenWasUsed {
		return arri.Error(403, "Token has expired")
	}
	usedTokens[authToken] = true
	t := time.NewTicker(time.Millisecond)
	defer t.Stop()
	msgCount := 0
	for {
		select {
		case <-t.C:
			msgCount++
			controller.Push(TestsStreamRetryWithNewCredentialsResponse{Message: "ok"})
			if msgCount >= 10 {
				controller.Close(false)
				return nil
			}
		case <-controller.Done():
			return nil
		}
	}
}

func StreamTenEventsThenEnd(_ arri.EmptyMessage, controller arri.SseController[ChatMessage], event RpcEvent) arri.RpcError {
	t := time.NewTicker(time.Millisecond)
	defer t.Stop()
	msgCount := 0
	for {
		select {
		case <-t.C:
			msgCount++
			controller.Push(ChatMessage{
				ChatMessageText: &ChatMessageText{},
			})
			if msgCount > 10 {
				panic("Message count exceeded 10. This means the ticker was not properly cleaned up.")
			}
			if msgCount == 10 {
				controller.Close(true)
				return nil
			}
		case <-controller.Done():
			return nil
		}
	}
}

// alias of an anonymous struct so the definition doesn't get an id, matching the ts test server
type UsersWatchUserParams = struct {
	UserId string
}

// alias of an anonymous struct so the definition doesn't get an id, matching the ts test server
type UsersWatchUserResponse = struct {
	Id                  string
	Role                string                   `enum:"standard,admin"`
	Photo               arri.Nullable[UserPhoto] `description:"A profile picture"`
	CreatedAt           time.Time
	NumFollowers        int32
	Settings            UserSettings
	RecentNotifications []UsersWatchUserResponseRecentNotificationsElement
	Bookmarks           map[string]struct {
		PostId string
		UserId string
	}
	Bio        arri.Option[string]
	Metadata   map[string]any
	RandomList []any
}

type UserPhoto struct {
	Url         string
	Width       float64
	Height      float64
	Bytes       int64
	Nanoseconds uint64 `description:"When the photo was last updated in nanoseconds"`
}

// alias of an anonymous struct so the definition doesn't get an id, matching the ts test server
type UsersWatchUserResponseRecentNotificationsElement = struct {
	arri.DiscriminatorKey `discriminatorKey:"notificationType"`
	PostLike              *struct {
		PostId string
		UserId string
	} `discriminator:"POST_LIKE"`
	PostComment *struct {
		PostId      string
		UserId      string
		CommentText string
	} `discriminator:"POST_COMMENT"`
}

type UserSettings struct {
	NotificationsEnabled bool
	PreferredTheme       string `enum:"dark-mode,light-mode,system"`
}

func WatchUser(params UsersWatchUserParams, stream arri.SseController[UsersWatchUserResponse], event RpcEvent) arri.RpcError {
	t := time.NewTicker(time.Millisecond)
	defer t.Stop()
	msgCount := 0
	user := UsersWatchUserResponse{}
	for {
		select {
		case <-t.C:
			msgCount++
			stream.Push(user)
			if msgCount >= 10 {
				stream.Close(true)
				return nil
			}
		case <-stream.Done():
			return nil
		}

	}
}
