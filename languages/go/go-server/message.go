package arri

import (
	"fmt"
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

func (cm ClientMessage) EncodeString() []byte {
	output := []byte("ARRIRPC/")
	output = append(output, cm.ArriRpcVersion+" "+cm.RpcName+"\n"...)
	output = append(output, "content-type: "+cm.ContentType+"\n"...)
	if cm.ReqId.IsSet {
		output = append(output, "req-id: "+cm.ReqId.Value+"\n"...)
	}
	for key, val := range cm.CustomHeaders {
		output = append(output, strings.ToLower(key)+": "+val+"\n"...)
	}
	output = append(output, "\n\n"...)
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

func DecodeClientMessage(input string) (ClientMessage, error) {
	procedure := None[string]()
	reqId := None[string]()
	clientVersion := None[string]()
	contentType := None[string]()
	customHeaders := Headers{}
	bodyStartIndex := -1
	currentLine := []rune{}

	var processLine = func() error {
		lineStr := string(currentLine)
		if !procedure.IsSet {
			lineParts := strings.Split(lineStr, " ")
			if len(lineParts) < 2 {
				return fmt.Errorf("Invalid client message. Must start with ARRIRPC/{version} {procedureName}")
			}
			_ = lineParts[0]
			rpcName := lineParts[1]
			procedure.Set(strings.TrimSpace(rpcName))
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
		currentLine = []rune{}
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

	// TODO: actually parse msg
	return ClientMessage{}, nil
}

type ServerMessage struct {
	ArriRpcVersion string
	Success        bool
	RpcName        string
	ReqId          Option[string]
	ContentType    string
	Body           string
}
