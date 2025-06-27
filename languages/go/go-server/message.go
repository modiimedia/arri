package arri

import (
	"strings"
)

type ClientMessage struct {
	ArriRpcVersion string
	RpcName        string
	ReqId          Option[string]
	ContentType    string
	ClientVersion  Option[string]
	CustomHeaders  Headers
	Body           Option[[]byte]
}

func NewClientMessage(
	arriRpcVersion string,
	rpcName string,
	reqId Option[string],
	contentType string,
	clientVersion Option[string],
	customHeaders Headers,
	body Option[[]byte],
) ClientMessage {
	return ClientMessage{
		ArriRpcVersion: arriRpcVersion,
		RpcName:        rpcName,
		ReqId:          reqId,
		ContentType:    contentType,
		ClientVersion:  clientVersion,
		CustomHeaders:  customHeaders,
		Body:           body,
	}
}

func (cm ClientMessage) EncodeBytes() []byte {
	output := []byte("ARRIRPC/")
	output = append(output, cm.ArriRpcVersion+" "+cm.RpcName+"\n"...)
	output = append(output, "content-type: "+cm.ContentType+"\n"...)
	if cm.ReqId.IsSet {
		output = append(output, "req-id: "+cm.ReqId.Value+"\n"...)
	}
	if cm.ClientVersion.IsSet {
		output = append(output, "client-version: "+cm.ClientVersion.Value+"\n"...)
	}
	for key, val := range cm.CustomHeaders {
		output = append(output, strings.ToLower(key)+": "+val+"\n"...)
	}
	output = append(output, '\n')
	if cm.Body.IsSome() {
		output = append(output, cm.Body.Value...)
	}
	return output
}

func ParseHeaderLine(input string) (key string, val string) {
	parts := strings.Split(input, ":")
	if len(parts) < 2 {
		return "", ""
	}
	key = parts[0]
	val = parts[1]
	return strings.TrimSpace(key), strings.TrimSpace(val)
}

func DecodeClientMessage(input []byte) (ClientMessage, DecodeMessageError) {
	procedure := None[string]()
	reqId := None[string]()
	clientVersion := None[string]()
	contentType := None[string]()
	customHeaders := Headers{}
	currentLine := []byte{}
	bodyStartIndex := -1

	var processLine = func() DecodeMessageError {
		lineStr := string(currentLine)
		if !procedure.IsSet {
			lineParts := strings.Split(lineStr, " ")
			if len(lineParts) < 2 {
				return NewDecodeMessageError(
					DMECode_MalformedMessage,
					Some("Invalid client message. Must start with ARRIRPC/{version} {procedureName}"),
				)
			}
			_ = lineParts[0]
			rpcName := lineParts[1]
			procedure.Set(strings.TrimSpace(rpcName))
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
			contentType.Set(val)
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
				return ClientMessage{}, err
			}
			bodyStartIndex = i + 2
			break
		}
		if char == '\n' {
			err := processLine()
			if err != nil {
				return ClientMessage{}, err
			}
			continue
		}
		currentLine = append(currentLine, char)
	}

	if procedure.IsNone() {
		return ClientMessage{}, NewDecodeMessageError(DMECode_MalformedMessage, Some("missing arrirpc version"))
	}

	if bodyStartIndex < 0 {
		return NewClientMessage(
			"0.0.8",
			procedure.Value,
			reqId,
			contentType.UnwrapOr("application/json"),
			clientVersion,
			customHeaders,
			None[[]byte](),
		), nil
	}

	return NewClientMessage(
		"0.0.8",
		procedure.Value,
		reqId,
		contentType.UnwrapOr("application/json"),
		clientVersion,
		customHeaders,
		Some(input[bodyStartIndex:]),
	), nil
}

type ServerMessage struct {
	ArriRpcVersion string
	Success        bool
	ReqId          Option[string]
	ContentType    string
	CustomHeaders  Headers
	Body           Option[[]byte]
}

func NewServerMessage(arriRpcVersion string,
	success bool,
	reqId Option[string],
	contentType string,
	customHeaders Headers,
	body Option[[]byte],
) ServerMessage {
	return ServerMessage{
		ArriRpcVersion: "0.0.8",
		Success:        success,
		ReqId:          reqId,
		ContentType:    contentType,
		CustomHeaders:  customHeaders,
		Body:           body,
	}
}

func (m ServerMessage) EncodeBytes() []byte {
	output := []byte("ARRIRPC/" + m.ArriRpcVersion + " ")
	if m.Success {
		output = append(output, "SUCCESS\n"...)
	} else {
		output = append(output, "FAILURE\n"...)
	}
	output = append(output, "content-type: "+m.ContentType+"\n"...)
	if m.ReqId.IsSet {
		output = append(output, "req-id: "+m.ReqId.Value+"\n"...)
	}
	for key, val := range m.CustomHeaders {
		output = append(output, strings.ToLower(key)+": "+val+"\n"...)
	}
	output = append(output, '\n')
	if m.Body.IsSet {
		output = append(output, m.Body.Value...)
	}
	return output
}

func DecodeServerMessage(input []byte) (ServerMessage, DecodeMessageError) {
	reqId := None[string]()
	contentType := None[string]()
	success := None[bool]()
	customHeaders := Headers{}
	currentLine := []byte{}
	bodyStartIndex := -1

	var processLine = func() DecodeMessageError {
		lineStr := string(currentLine)
		if !success.IsSet {
			lineParts := strings.Split(lineStr, " ")
			if len(lineParts) < 2 {
				return NewDecodeMessageError(
					DMECode_MalformedMessage,
					None[string](),
				)
			}
			_ = lineParts[0]
			successPart := lineParts[1]
			success.Set(successPart == "SUCCESS")
			currentLine = []byte{}
			return nil
		}
		key, val := ParseHeaderLine(lineStr)
		switch key {
		case "req-id":
			reqId.Set(val)
		case "content-type":
			contentType.Set(val)
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
				return ServerMessage{}, err
			}
			bodyStartIndex = i + 2
			break
		}
		if char == '\n' {
			err := processLine()
			if err != nil {
				return ServerMessage{}, err
			}
			continue
		}
		currentLine = append(currentLine, char)
	}

	if success.IsNone() {
		return ServerMessage{}, NewDecodeMessageError(DMECode_MalformedMessage, None[string]())
	}

	if bodyStartIndex < 0 {
		return NewServerMessage(
			"0.0.8",
			success.Value,
			reqId,
			contentType.UnwrapOr("application/json"),
			customHeaders,
			None[[]byte](),
		), nil
	}

	return NewServerMessage(
		"0.0.8",
		success.Value,
		reqId,
		contentType.UnwrapOr("application/json"),
		customHeaders,
		Some(input[bodyStartIndex:]),
	), nil
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
