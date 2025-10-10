package arri

import (
	"fmt"
	"runtime"
)

type RpcError interface {
	error
	Code() uint32
	Data() Option[any]
	Trace() Option[[]string]
}

func IsRpcError(input RpcError) bool {
	return true
}

type errorResponse struct {
	code    uint32
	message string
	data    Option[any]
	trace   Option[[]string]
}

func (e errorResponse) Error() string {
	return e.message
}

func (e errorResponse) Code() uint32 {
	return e.code
}

func (e errorResponse) Data() Option[any] {
	return e.data
}

func (e errorResponse) Trace() Option[[]string] {
	return e.trace
}

func RpcErrorToJSON(err RpcError, encodingOption EncodingOptions, allowTrace bool) []byte {
	output := []byte{}
	output = append(output, '{')
	data := err.Data()
	trace := err.Trace()
	output = append(output, "\"code\":"+fmt.Sprint(err.Code())...)
	output = append(output, ",\"message\":"...)
	AppendNormalizedString(&output, err.Error())
	if data.IsSet {
		dataJson, err := EncodeJSON(data.Value, encodingOption)
		if err == nil {
			output = append(output, ",\"data\":"...)
			output = append(output, dataJson...)
		}
	}
	if allowTrace && trace.IsSet {
		traceJson, err := EncodeJSON(trace.Value, encodingOption)
		if err == nil {
			output = append(output, ",\"trace\":"...)
			output = append(output, traceJson...)
		}
	}
	output = append(output, '}')
	return output
}

var statusMessages = map[uint32]string{
	400: "Bad request",
	401: "Unauthorized",
	402: "Payment required",
	403: "Forbidden",
	404: "Not found",
	405: "Method not allowed",
	406: "Not acceptable",
	407: "Proxy authentication required",
	408: "Request timeout",
	409: "Conflict",
	410: "Gone",
	411: "Length required",
	412: "Precondition failed",
	414: "URI too long",
	415: "Unsupported media type",
	416: "Range not satisfiable",
	417: "Expectation failed",
	418: "I'm a teapot",
	421: "Misdirected request",
	422: "Unprocessable content",
	423: "Locked",
	424: "Failed dependency",
	425: "Too early",
	428: "Precondition required",
	429: "Too many requests",
	431: "Request header fields too large",
	451: "Unavailable for legal reasons",
	500: "Internal server error",
	501: "Not implemented",
	502: "Bad gateway",
	503: "Service unavailable",
	504: "Gateway timeout",
	505: "HTTP version not supported",
	506: "Variant also negotiates",
	507: "Insufficient storage",
	508: "Loop detected",
	510: "Not extended",
	511: "Network authentication required",
}

// An Arri RPC error. If message is empty arri will replace it with a default message based on the status code.
func Error(statusCode uint32, message string) errorResponse {
	msg := message
	if len(message) == 0 {
		defaultMsg, foundDefaultMsg := statusMessages[statusCode]
		if foundDefaultMsg {
			msg = defaultMsg
		} else {
			msg = "Unknown error"
		}
	}
	trace := None[[]string]()
	// TODO: make this configurable so that prod servers don't leak stack traces
	trace.Set(traceFromCaller("RpcError", msg))
	return errorResponse{
		code:    statusCode,
		message: msg,
		trace:   trace,
	}
}

// An Arri RPC error with arbitrary data. If message is empty arri will replace it with a default message based on the status code.
func ErrorWithData(statusCode uint32, message string, data Option[any]) errorResponse {
	msg := message
	if len(message) == 0 {
		defaultMsg, foundDefaultMsg := statusMessages[statusCode]
		if foundDefaultMsg {
			msg = defaultMsg
		} else {
			msg = "Unknown error"
		}
	}
	trace := None[[]string]()
	// TODO: make this configurable so that prod servers don't leak stack traces
	trace.Set(traceFromCaller("RpcError", msg))
	return errorResponse{
		code:    statusCode,
		message: msg,
		data:    data,
		trace:   trace,
	}
}

func traceFromCaller(errorName string, errorMessage string) []string {
	// pcs will store program counters
	var pcs [10]uintptr
	// skip 0: Callers, skip 1: bar, skip 2: foo, skip 3: main
	n := runtime.Callers(2, pcs[:])
	frames := runtime.CallersFrames(pcs[:n])
	trace := []string{}
	line1 := ""
	if len(errorName) > 0 {
		line1 += errorName
		line1 += ""
	} else {
		line1 += "Error"
	}
	if len(errorMessage) > 0 {
		line1 += ": "
		line1 += errorMessage
	}
	trace = append(trace, line1)
	for {
		frame, more := frames.Next()
		trace = append(trace, "at "+frame.Function+" ("+frame.File+":"+fmt.Sprint(frame.Line)+")")
		if !more {
			break
		}
	}
	return trace
}
