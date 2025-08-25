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
		if m.ClientVersion.IsSet {
			output = AppendHeader(output, "client-version", m.ClientVersion.Value)
		}
	case StreamStartMessage:
	case StreamDataMessage:
		allowBody = true
		output = append(output, "ARRIRPC/"+ARRI_VERSION+" "+"STREAM_DATA\n"...)
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
	}
	output = AppendCustomHeaders(output, m.CustomHeaders)
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
		Type:           ClientMessage,
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
		Type:           ServerSuccessMessage,
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
	return Message{
		ArriRpcVersion: ARRI_VERSION,
		Type:           ServerFailureMessage,
		ReqId:          reqId,
		ContentType:    Some(contentType),
		CustomHeaders:  headers,
		Error:          Some(err),
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
		Type:              StreamStartMessage,
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
			case "SUCCESS":
				msgType.Set(ServerSuccessMessage)
			case "FAILURE":
				msgType.Set(ServerFailureMessage)
			case "CONNECTION_START":
				msgType.Set(ConnectionStartMessage)
			case "STREAM_START":
				msgType.Set(StreamStartMessage)
			case "STREAM_DATA":
				msgType.Set(StreamDataMessage)
			case "STREAM_END":
				msgType.Set(StreamEndMessage)
			case "HEARTBEAT":
				msgType.Set(HeartbeatMessage)
			default:
				msgType.Set(ClientMessage)
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
		case "msg-id":
			msgId.Set(val)
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
	case ClientMessage:
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

	case ServerSuccessMessage:
		return Message{
			ArriRpcVersion: ARRI_VERSION,
			ReqId:          reqId.Value,
			Type:           msgType.Value,
			ContentType:    contentType,
			CustomHeaders:  customHeaders,
			Body:           body,
		}, nil
	case ServerFailureMessage:
		var err RpcError
		if body.IsSome() {
			err = Error(0, "unknown error")
		} else {
			parsed, paringErr := RpcErrorFromJson(body.Value)
			if paringErr != nil {
				err = Error(0, "unknown error")
			} else {
				err = parsed
			}
		}
		return Message{
			ArriRpcVersion: ARRI_VERSION,
			ReqId:          reqId.Value,
			Type:           msgType.Value,
			ContentType:    contentType,
			CustomHeaders:  customHeaders,
			Error:          Some(err),
		}, nil
	case StreamStartMessage:
		return Message{
			ArriRpcVersion:    ARRI_VERSION,
			Type:              msgType.Value,
			ContentType:       contentType,
			ReqId:             reqId.Value,
			HeartbeatInterval: heartbeatInterval,
			CustomHeaders:     customHeaders,
		}, nil
	case StreamDataMessage:
		return Message{
			ArriRpcVersion: ARRI_VERSION,
			Type:           msgType.Value,
			ReqId:          reqId.Value,
			MsgId:          msgId,
			Body:           body,
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
