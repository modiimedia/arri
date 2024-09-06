package arri

import (
	"strconv"
)

type Error interface {
	error
	ErrorResponse() ErrorResponse
}

type ErrorResponse struct {
	Code    uint32
	Message string
	Data    Option[any]
	Stack   Option[[]string]
}

func (e ErrorResponse) Error() string {
	return e.Message
}

func (e ErrorResponse) ErrorResponse() ErrorResponse {
	return e
}

func (e ErrorResponse) ToJson() []byte {
	output := []byte{}
	output = append(output, "{\"code\":"+strconv.FormatUint(uint64(e.Code), 32)...)
	output = append(output, ",\"message\":"...)
	appendNormalizedString(&output, e.Message)
	if e.Data.IsSome() {
		dataResult, dataErr := ToJson(e.Data.Unwrap(), KeyCasingCamelCase)
		if dataErr != nil {
			output = append(output, dataResult...)
		}
	}
	if e.Stack.IsSome() {
		output = append(output, "["...)
		stackVals := e.Stack.UnwrapOr([]string{})
		for i := 0; i < len(stackVals); i++ {
			if i != 0 {
				output = append(output, ","...)
			}
			output = append(output, stackVals[i]...)
		}
		output = append(output, "]"...)
	}
	output = append(output, "}"...)
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

func ErrorFromStatus(statusCode uint32) ErrorResponse {
	msg, foundMsg := statusMessages[statusCode]
	if foundMsg {
		return ErrorResponse{Code: statusCode, Message: msg}
	}
	return ErrorResponse{Code: statusCode, Message: "Unknown error"}

}
