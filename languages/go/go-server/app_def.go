package arri

import (
	"errors"
	"reflect"
	"runtime"
	"strings"

	"github.com/iancoleman/strcase"
	"github.com/modiimedia/arri/languages/go/go-server/utils"
)

type AppDef struct {
	SchemaVersion string              `key:"schemaVersion" json:"schemaVersion" `
	Info          Option[AppDefInfo]  `key:"info" json:"info,omitempty" `
	Transports    []string            `key:"transports" json:"transports"`
	Procedures    OrderedMap[RpcDef]  `key:"procedures" json:"procedures" `
	Definitions   OrderedMap[TypeDef] `key:"definitions" json:"definitions"`
}

type AppDefInfo struct {
	Name        Option[string] `key:"name" json:"name,omitempty"`
	Description Option[string] `key:"description" json:"description,omitempty"`
	Version     Option[string] `key:"version" json:"version,omitempty"`
}

const (
	HttpMethodGet    = "get"
	HttpMethodPost   = "post"
	HttpMethodPut    = "put"
	HttpMethodPatch  = "patch"
	HttpMethodDelete = "delete"
)

type HttpMethod = string

type RpcDef struct {
	Transports     []string           `key:"transports"`
	Path           string             `key:"path"`
	Method         Option[HttpMethod] `key:"method"`
	Input          Option[string]     `key:"input"`
	InputIsStream  Option[bool]       `key:"inputIsStream"`
	Output         Option[string]     `key:"output"`
	OutputIsStream Option[bool]       `key:"outputIsStream"`
	Description    Option[string]     `key:"description"`
	IsDeprecated   Option[bool]       `key:"isDeprecated"`
}

type RpcDefOptions struct {
	Path           string
	Method         HttpMethod
	Description    string
	IsDeprecated   bool
	InputIsStream  bool
	OutputIsStream bool
	Transports     []string
}

func ToRpcDef(value interface{}, options RpcDefOptions, defaultTransports []string) (*RpcDef, error) {
	fnName := rpcNameFromFunctionName(GetFunctionName(value))
	valueType := reflect.TypeOf(value)
	valueKind := valueType.Kind()
	if valueKind != reflect.Func {
		return nil, errors.ErrUnsupported
	}
	rawInput := valueType.In(0)
	input := Some(rawInput.Name())
	hasInput := !utils.IsEmptyMessage(rawInput)
	if !hasInput {
		input = None[string]()
	}
	rawOutput := valueType.Out(0)
	if rawOutput.Kind() == reflect.Pointer {
		rawOutput = rawOutput.Elem()
	}
	output := Some(rawOutput.Name())
	hasOutput := !utils.IsEmptyMessage(rawOutput)
	if !hasOutput {
		output = None[string]()
	}
	path := "/" + strcase.ToKebab(fnName)
	if len(options.Path) > 0 {
		path = options.Path
	}
	method := None[HttpMethod]()
	if len(options.Method) > 0 {
		method = Some(strings.ToLower(options.Method))
	}
	var description = None[string]()
	if len(options.Description) > 0 {
		description = Some(options.Description)
	}
	var isDeprecated = None[bool]()
	if options.IsDeprecated {
		isDeprecated = Some(options.IsDeprecated)
	}
	var inputIsStream = None[bool]()
	if options.InputIsStream {
		inputIsStream = Some(options.InputIsStream)
	}
	var outputIsStream = None[bool]()
	if options.OutputIsStream {
		outputIsStream = Some(options.OutputIsStream)
	}

	var transports []string
	if options.Transports != nil {
		transports = options.Transports
	} else if defaultTransports != nil {
		transports = defaultTransports
	} else {
		transports = []string{"http"}
	}
	return &RpcDef{
			Path:           path,
			Method:         method,
			Input:          input,
			InputIsStream:  inputIsStream,
			Output:         output,
			OutputIsStream: outputIsStream,
			Description:    description,
			IsDeprecated:   isDeprecated,
			Transports:     transports,
		},
		nil
}

func GetFunctionName(i interface{}) string {
	return runtime.FuncForPC(reflect.ValueOf(i).Pointer()).Name()
}

func rpcNameFromFunctionName(name string) string {
	fnNameParts := strings.Split(name, ".")
	fnName := ""
	if len(fnNameParts) == 1 {
		fnName = fnNameParts[0]
	} else {
		for i := 0; i < len(fnNameParts); i++ {
			if i == 0 {
				continue
			}
			if len(fnName) == 0 {
				fnName += fnNameParts[i]
			} else {
				fnName += "." + fnNameParts[i]
			}
		}
	}
	return strcase.ToLowerCamel(fnName)
}
