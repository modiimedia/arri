package arri

import (
	"fmt"
	"strconv"
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
	InvocationMessage      MessageType = "INVOCATION"
	OkMessage              MessageType = "OK"
	ErrorMessage           MessageType = "ERROR"
	HeartbeatMessage       MessageType = "HEARTBEAT"
	ConnectionStartMessage MessageType = "CONNECTION_START"
	StreamDataMessage      MessageType = "STREAM_DATA"
	StreamEndMessage       MessageType = "STREAM_END"
	StreamCancelMessage    MessageType = "STREAM_CANCEL"
)

type ContentType string

const (
	ContentTypeUnknown ContentType = ""
	ContentTypeJson    ContentType = "application/json"
)

func ContentTypeFromString(input string) ContentType {
	switch input {
	case string(ContentTypeJson):
		return ContentTypeJson
	default:
		return ContentTypeUnknown
	}
}

type Message struct {
	ArriRpcVersion    string
	Type              MessageType
	RpcName           Option[string]
	ReqId             string
	MsgId             Option[string]
	CustomHeaders     Headers
	ClientVersion     Option[string]
	ContentType       Option[ContentType]
	Action            Option[string]
	ErrCode           Option[uint32]
	ErrMsg            Option[string]
	HeartbeatInterval Option[uint32]
	Reason            Option[string]
	Body              Option[[]byte]
}

func (m Message) EncodeBytes() []byte {
	output := []byte{}
	allowBody := false
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
	case OkMessage:
		allowBody = true
		output = append(output, "ARRIRPC/"+ARRI_VERSION+" OK\n"...)
		if m.ContentType.IsSet {
			output = AppendHeader(output, "content-type", string(m.ContentType.Value))
		}
		if len(m.ReqId) > 0 {
			output = AppendHeader(output, "req-id", m.ReqId)
		}
	case ErrorMessage:
		output = append(output, "ARRIRPC/"+ARRI_VERSION+" ERROR\n"...)
		if m.ContentType.IsSet {
			output = AppendHeader(output, "content-type", string(m.ContentType.Value))
		}
		if len(m.ReqId) > 0 {
			output = AppendHeader(output, "req-id", m.ReqId)
		}
		output = AppendHeader(output, "err-code", fmt.Sprint(m.ErrCode.UnwrapOr(0)))
		output = AppendHeader(output, "err-msg", m.ErrMsg.UnwrapOr(""))
	case InvocationMessage:
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
		if m.ClientVersion.IsSet {
			output = AppendHeader(output, "client-version", m.ClientVersion.Value)
		}
	case StreamDataMessage:
		allowBody = true
		output = append(output, "ARRIRPC/"+ARRI_VERSION+" STREAM_DATA\n"...)
		if m.ContentType.IsSet {
			output = AppendHeader(output, "content-type", string(m.ContentType.Value))
		}
		if len(m.ReqId) > 0 {
			output = AppendHeader(output, "req-id", m.ReqId)
		}
		if m.MsgId.IsSet {
			output = AppendHeader(output, "msg-id", m.MsgId.Value)
		}
	case StreamEndMessage:
		output = append(output, "ARRIRPC/"+ARRI_VERSION+" STREAM_END\n"...)
		if len(m.ReqId) > 0 {
			output = AppendHeader(output, "req-id", m.ReqId)
		}
		output = AppendHeader(output, "reason", m.Reason.UnwrapOr(""))
	case StreamCancelMessage:
		output = append(output, "ARRIRPC/"+ARRI_VERSION+" STREAM_CANCEL\n"...)
		if len(m.ReqId) > 0 {
			output = AppendHeader(output, "req-id", m.ReqId)
		}
		output = AppendHeader(output, "reason", m.Reason.UnwrapOr(""))
	}
	output = AppendCustomHeaders(output, m.CustomHeaders)
	output = append(output, '\n')
	if allowBody && m.Body.IsSet {
		output = append(output, m.Body.Value...)
	}
	return output
}

func AppendHeader(input []byte, key string, value string) []byte {
	input = append(input, key+": "+value+"\n"...)
	return input
}

func AppendCustomHeaders(input []byte, headers Headers) []byte {
	for key, val := range headers {
		input = append(input, key+": "+val+"\n"...)
	}
	return input
}

func NewClientMessage(
	reqId string,
	rpcName string,
	clientVersion Option[string],
	contentType ContentType,
	headers Headers,
	body Option[[]byte],
) Message {
	return Message{
		ArriRpcVersion: ARRI_VERSION,
		Type:           InvocationMessage,
		RpcName:        Some(rpcName),
		ReqId:          reqId,
		ContentType:    Some(contentType),
		ClientVersion:  clientVersion,
		CustomHeaders:  headers,
		Body:           body,
	}
}

func NewServerSuccessMessage(
	reqId string,
	contentType ContentType,
	headers Headers,
	body Option[[]byte],
) Message {
	return Message{
		ArriRpcVersion: ARRI_VERSION,
		Type:           OkMessage,
		ReqId:          reqId,
		ContentType:    Some(contentType),
		CustomHeaders:  headers,
		Body:           body,
	}
}

func NewServerFailureMessage(
	reqId string,
	contentType ContentType,
	headers Headers,
	err RpcError,
) Message {
	body := []byte{'{'}
	hasFields := false
	if err.Data().IsSet {
		dataJson, err := EncodeJSON(err.Data().Value, EncodingOptions{})
		if err == nil {
			body = append(body, "\"data\":"...)
			body = append(body, dataJson...)
			hasFields = true
		}
	}
	if err.Trace().IsSet {
		traceJson, err := EncodeJSON(err.Trace().Value, EncodingOptions{})
		if err == nil {
			if hasFields {
				body = append(body, ',')
			}
			body = append(body, "\"trace\":"...)
			body = append(body, traceJson...)
			hasFields = true
		}
	}
	return Message{
		ArriRpcVersion: ARRI_VERSION,
		Type:           ErrorMessage,
		ReqId:          reqId,
		ContentType:    Some(contentType),
		CustomHeaders:  headers,
		ErrCode:        Some(err.Code()),
		ErrMsg:         Some(err.Error()),
		Body:           Some(body),
	}
}

func NewConnectionStartMessage(heartbeatInterval Option[uint32]) Message {
	return Message{Type: ConnectionStartMessage, HeartbeatInterval: heartbeatInterval}
}

func NewHeartbeatMessage(heartbeatInterval uint32) Message {
	return Message{Type: HeartbeatMessage, HeartbeatInterval: Some(heartbeatInterval)}
}

func NewStreamStartMessage(reqId string, contentType ContentType, heartbeatInterval Option[uint32], customHeaders Headers) Message {
	return Message{
		Type:              OkMessage,
		ContentType:       Some(contentType),
		ReqId:             reqId,
		HeartbeatInterval: heartbeatInterval,
		CustomHeaders:     customHeaders,
	}
}

func NewStreamDataMessage(reqId string, msgId Option[string], body []byte) Message {
	return Message{
		Type:  StreamDataMessage,
		ReqId: reqId,
		MsgId: msgId,
		Body:  Some(body),
	}
}

func DecodeMessage(input []byte) (Message, DecodeMessageError) {
	msgType := None[MessageType]()
	procedure := None[string]()
	reqId := None[string]()
	msgId := None[string]()
	errCode := None[uint32]()
	errMsg := None[string]()
	reason := None[string]()
	clientVersion := None[string]()
	contentType := None[ContentType]()
	heartbeatInterval := None[uint32]()
	customHeaders := Headers{}
	currentLine := []byte{}
	bodyStartIndex := -1
	action := None[string]()

	var processLine = func() DecodeMessageError {
		lineStr := string(currentLine)
		if !msgType.IsSet {
			lineParts := strings.Split(lineStr, " ")
			if len(lineParts) < 2 {
				return NewDecodeMessageError(
					DMECode_MalformedMessage,
					Some("Invalid client message. Must start with ARRIRPC/{version} {procedureName}"),
				)
			}
			_ = lineParts[0]
			typeValue := lineParts[1]
			switch typeValue {
			case "OK":
				msgType.Set(OkMessage)
			case "ERROR":
				msgType.Set(ErrorMessage)
			case "CONNECTION_START":
				msgType.Set(ConnectionStartMessage)
			case "STREAM_DATA":
				msgType.Set(StreamDataMessage)
			case "STREAM_END":
				msgType.Set(StreamEndMessage)
			case "STREAM_CANCEL":
				msgType.Set(StreamCancelMessage)
			case "HEARTBEAT":
				msgType.Set(HeartbeatMessage)
			default:
				msgType.Set(InvocationMessage)
				procedure.Set(strings.TrimSpace(typeValue))
			}
			if len(lineParts) > 2 {
				action.Set(lineParts[2])
			}
			currentLine = []byte{}
			return nil
		}
		key, val := ParseHeaderLine(lineStr)
		switch key {
		case "client-version":
			clientVersion.Set(val)
		case "req-id":
			reqId.Set(val)
		case "content-type":
			contentType.Set(ContentTypeFromString(val))
		case "heartbeat-interval":
			parsedVal, err := strconv.ParseUint(val, 10, 32)
			if err == nil {
				heartbeatInterval.Set(uint32(parsedVal))
			}
		case "reason":
			reason.Set(val)
		case "msg-id":
			msgId.Set(val)
		case "err-code":
			parsedVal, err := strconv.ParseUint(val, 10, 32)
			if err == nil {
				errCode.Set(uint32(parsedVal))
			}
		case "err-msg":
			errMsg.Set(val)
		default:
			customHeaders.Set(key, val)
		}
		currentLine = []byte{}
		return nil
	}

	for i, char := range input {
		if char == '\n' && input[i+1] == '\n' {
			err := processLine()
			if err != nil {
				return Message{}, err
			}
			bodyStartIndex = i + 2
			break
		}
		if char == '\n' {
			err := processLine()
			if err != nil {
				return Message{}, err
			}
			continue
		}
		currentLine = append(currentLine, char)
	}

	if msgType.IsNone() {
		return Message{}, NewDecodeMessageError(DMECode_MalformedMessage, Some("missing arrirpc version"))
	}
	if bodyStartIndex < 0 {
		return Message{}, NewDecodeMessageError(DMECode_MalformedMessage, Some("must terminate headers with the following character sequence \n\n"))
	}

	var body Option[[]byte]
	rawBody := input[bodyStartIndex:]
	if len(rawBody) > 0 {
		body = Some(rawBody)
	} else {
		body = None[[]byte]()
	}

	switch msgType.Value {
	case InvocationMessage:
		if procedure.IsNone() {
			return Message{}, NewDecodeMessageError(DMECode_MalformedMessage, Some("missing procedure name"))
		}
		return Message{
			ArriRpcVersion: ARRI_VERSION,
			ReqId:          reqId.Value,
			RpcName:        procedure,
			Type:           msgType.Value,
			ContentType:    contentType,
			ClientVersion:  clientVersion,
			CustomHeaders:  customHeaders,
			Body:           body,
		}, nil

	case OkMessage:
		return Message{
			ArriRpcVersion: ARRI_VERSION,
			ReqId:          reqId.Value,
			Type:           msgType.Value,
			ContentType:    contentType,
			CustomHeaders:  customHeaders,
			Body:           body,
		}, nil
	case ErrorMessage:
		return Message{
			ArriRpcVersion: ARRI_VERSION,
			ReqId:          reqId.Value,
			Type:           msgType.Value,
			ContentType:    contentType,
			CustomHeaders:  customHeaders,
			ErrMsg:         errMsg,
			ErrCode:        errCode,
			Body:           body,
		}, nil
	case StreamDataMessage:
		return Message{
			ArriRpcVersion: ARRI_VERSION,
			Type:           msgType.Value,
			ReqId:          reqId.Value,
			MsgId:          msgId,
			Body:           body,
		}, nil
	case StreamEndMessage:
		return Message{
			ArriRpcVersion: ARRI_VERSION,
			Type:           msgType.Value,
			ReqId:          reqId.Value,
			Reason:         reason,
		}, nil
	default:
		return Message{}, NewDecodeMessageCustomError(fmt.Errorf("Not implemented: " + string(msgType.Value)))
	}

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
