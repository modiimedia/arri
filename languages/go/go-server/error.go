package arri

import (
	"strconv"

	"github.com/tidwall/gjson"
)

type RpcError interface {
	error
	Code() uint32
	Data() Option[any]
}

type errorResponse struct {
	code    uint32
	message string
	data    Option[any]
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

func RpcErrorFromJson(input []byte) (RpcError, DecoderError) {
	parsed := gjson.ParseBytes(input)
	code := parsed.Get("code")
	message := parsed.Get("message")
	data := parsed.Get("data")
	// stack := parsed.Get("stack")

	if code.Type != gjson.Number {
		return errorResponse{}, NewDecoderError([]ValidationError{NewValidationError("expected number got "+code.Type.String(), "/code", "")})
	}
	if message.Type != gjson.String {
		return errorResponse{}, NewDecoderError([]ValidationError{NewValidationError("expected string got "+message.Type.String(), "/message", "")})
	}

	finalCode := code.Uint()
	finalMessage := message.String()
	finalData := None[any]()
	// finalStack := None[[]string]()
	if data.Type == gjson.JSON {
		finalData.Set(data.Value())
	}
	// if stack.Type == gjson.JSON && len(stack.Array()) > 0 {
	// 	arr := stack.Array()
	// 	stack := []string{}
	// 	for _, e := range arr {
	// 		if e.Type == gjson.String {
	// 			stack = append(stack, e.String())
	// 		}
	// 	}
	// 	finalStack.Set(stack)
	// }
	return errorResponse{
		code:    uint32(finalCode),
		message: finalMessage,
		data:    finalData,
	}, nil
}

func RpcErrorToJSON(err RpcError) []byte {
	output := []byte{}
	output = append(output, "{\"code\":"+strconv.FormatUint(uint64(err.Code()), 10)...)
	output = append(output, ",\"message\":"...)
	AppendNormalizedString(&output, err.Error())
	if err.Data().IsSome() {
		dataResult, dataErr := EncodeJSON(err.Data().Unwrap(), EncodingOptions{})
		if dataErr == nil {
			output = append(output, ",\"data\":"...)
			output = append(output, dataResult...)
		}
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
	return errorResponse{
		code:    statusCode,
		message: msg,
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
	return errorResponse{
		code:    statusCode,
		message: msg,
		data:    data,
	}
}
