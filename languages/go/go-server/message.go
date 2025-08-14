package arri

import (
	"fmt"
	"strings"
)

const ARRI_VERSION = "0.0.8"

func ParseHeaderLine(input string) (key string, val string) {
	parts := strings.Split(input, ":")
	if len(parts) < 2 {
		return "", ""
	}
	key = parts[0]
	val = parts[1]
	return strings.TrimSpace(key), strings.TrimSpace(val)
}

type MessageType string

const (
	ClientMessage          MessageType = "CLIENT_MESSAGE"
	ServerSuccessMessage   MessageType = "SERVER_SUCCESS_MESSAGE"
	ServerFailureMessage   MessageType = "SERVER_FAILURE_MESSAGE"
	HeartbeatMessage       MessageType = "HEARTBEAT"
	ConnectionStartMessage MessageType = "CONNECTION_START"
	StreamStartMessage     MessageType = "STREAM_START"
	StreamDataMessage      MessageType = "STREAM_DATA"
	StreamEndMessage       MessageType = "STREAM_END"
)

type ContentType string

const (
	ContentTypeUnknown ContentType = ""
	ContentTypeJson    ContentType = "application/json"
)

type Message struct {
	ArriRpcVersion    string
	Type              MessageType
	RpcName           Option[string]
	ReqId             string
	Headers           map[string]string
	ContentType       Option[ContentType]
	Action            Option[string]
	Success           Option[bool]
	Error             Option[RpcError]
	HeartbeatInterval Option[uint32]
	Reason            Option[string]
	Body              Option[[]byte]
}

func (m Message) EncodeBytes() []byte {
	output := []byte{}
	allowBody := false
	allowError := false
	switch m.Type {
	case ConnectionStartMessage:
		output = append(output, "ARRIRPC/"+ARRI_VERSION+" CONNECTION_START\n"...)
		if m.HeartbeatInterval.IsSet {
			output = AppendHeader(output, "heartbeat-interval", fmt.Sprint(m.HeartbeatInterval.Value))
		}
	case HeartbeatMessage:
		output = append(output, "ARRIRPC/"+ARRI_VERSION+" HEARTBEAT\n"...)
		if m.HeartbeatInterval.IsSet {
			output = AppendHeader(output, "heartbeat-interval", fmt.Sprint(m.HeartbeatInterval.Value))
		}
	case ServerSuccessMessage:
		allowBody = true
		output = append(output, "ARRIRPC/"+ARRI_VERSION+" SUCCESS\n"...)
		if m.ContentType.IsSet {
			output = AppendHeader(output, "content-type", string(m.ContentType.Value))
		}
		if len(m.ReqId) > 0 {
			output = AppendHeader(output, "req-id", m.ReqId)
		}
	case ServerFailureMessage:
		allowError = true
		output = append(output, "ARRIRPC/"+ARRI_VERSION+" FAILURE\n"...)
		if m.ContentType.IsSet {
			output = AppendHeader(output, "content-type", string(m.ContentType.Value))
		}
		if len(m.ReqId) > 0 {
			output = AppendHeader(output, "req-id", m.ReqId)
		}
	case ClientMessage:
		allowBody = true
		if m.Action.IsSet {
			output = append(output, "ARRIRPC/"+ARRI_VERSION+" "+m.RpcName.Value+m.Action.Value+"\n"...)
		} else {
			output = append(output, "ARRIRPC/"+ARRI_VERSION+" "+m.RpcName.Value+"\n"...)
		}
		if m.ContentType.IsSet {
			output = AppendHeader(output, "content-type", string(m.ContentType.Value))
		}
		if len(m.ReqId) > 0 {
			output = AppendHeader(output, "req-id", m.ReqId)
		}
	case StreamStartMessage:
	case StreamDataMessage:
		allowBody = true
	case StreamEndMessage:
	}
	output = AppendCustomHeaders(output, m.Headers)
	output = append(output, '\n')
	if allowBody && m.Body.IsSet {
		output = append(output, m.Body.Value...)
	}
	if allowError && m.Error.IsSet {
		output = append(output, RpcErrorToJSON(m.Error.Value)...)
	}
	return output
}

func AppendHeader(input []byte, key string, value string) []byte {
	input = append(input, key+": "+value+"\n"...)
	return input
}

func AppendCustomHeaders(input []byte, headers map[string]string) []byte {
	for key, val := range headers {
		input = append(input, strings.ToLower(key)+": "+val+"\n"...)
	}
	return input
}

// DME = "Decode Message Error"
type DMECode = string

const (
	DMECode_MalformedMessage DMECode = "MALFORMED_MESSAGE"
	DMECode_CustomError      DMECode = "CUSTOM_ERROR"
)

type DecodeMessageError interface {
	error
	Code() DMECode
}

type decodeMessageError struct {
	code          DMECode
	customMessage Option[string]
}

func (e decodeMessageError) Error() string {
	if e.customMessage.IsSet {
		return e.customMessage.Value
	}
	switch e.code {
	case DMECode_MalformedMessage:
		return "malformed message"
	default:
		return "unknown error decoding message"
	}
}

func (e decodeMessageError) Code() DMECode {
	return e.code
}

func NewDecodeMessageError(code DMECode, customMessage Option[string]) DecodeMessageError {
	return decodeMessageError{code: code, customMessage: customMessage}
}

func NewDecodeMessageCustomError(err error) decodeMessageError {
	return decodeMessageError{code: DMECode_CustomError, customMessage: Some(err.Error())}
}
