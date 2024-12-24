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
	Procedures    OrderedMap[RpcDef]  `key:"procedures" json:"procedures" `
	Definitions   OrderedMap[TypeDef] `key:"definitions" json:"definitions"`
}

type AppDefInfo struct {
	Name        Option[string] `key:"name" json:"name,omitempty"`
	Description Option[string] `key:"description" json:"description,omitempty"`
	Version     Option[string] `key:"version" json:"version,omitempty"`
}

type RpcDef struct {
	DiscriminatorKey `discriminatorKey:"transport"`
	Http             *HttpRpcDef `discriminator:"http"`
}

const (
	HttpMethodGet    = "get"
	HttpMethodPost   = "post"
	HttpMethodPut    = "put"
	HttpMethodPatch  = "patch"
	HttpMethodDelete = "delete"
)

type HttpMethod = string

type HttpRpcDef struct {
	Path          string         `key:"path"`
	Method        HttpMethod     `key:"method"`
	IsEventStream Option[bool]   `key:"isEventStream"`
	Params        Option[string] `key:"params"`
	Response      Option[string] `key:"response"`
	Description   Option[string] `key:"description"`
	IsDeprecated  Option[bool]   `key:"isDeprecated"`
}

type ArriHttpRpcOptions struct {
	Path          string
	Method        HttpMethod
	Description   string
	IsDeprecated  bool
	IsEventStream bool
}

func ToRpcDef(value interface{}, options ArriHttpRpcOptions) (*RpcDef, error) {
	fnName := rpcNameFromFunctionName(GetFunctionName(value))
	valueType := reflect.TypeOf(value)
	valueKind := valueType.Kind()
	if valueKind != reflect.Func {
		return nil, errors.ErrUnsupported
	}
	rawParams := valueType.In(0)
	params := Some(rawParams.Name())
	hasParam := !utils.IsEmptyMessage(rawParams)
	if !hasParam {
		params = None[string]()
	}
	rawResponse := valueType.Out(0)
	if rawResponse.Kind() == reflect.Pointer {
		rawResponse = rawResponse.Elem()
	}
	response := Some(rawResponse.Name())
	hasResponse := !utils.IsEmptyMessage(rawResponse)
	if !hasResponse {
		response = None[string]()
	}
	path := "/" + strcase.ToKebab(fnName)
	if len(options.Path) > 0 {
		path = options.Path
	}
	method := HttpMethodPost
	if len(options.Method) > 0 {
		method = strings.ToLower(options.Method)
	}
	var description = None[string]()
	if len(options.Description) > 0 {
		description = Some(options.Description)
	}
	var isDeprecated = None[bool]()
	if options.IsDeprecated {
		isDeprecated = Some(options.IsDeprecated)
	}
	var isEventStream = None[bool]()
	if options.IsEventStream {
		isEventStream = Some(options.IsEventStream)
	}
	return &RpcDef{
			Http: &HttpRpcDef{
				Path:          path,
				Method:        method,
				Params:        params,
				Response:      response,
				Description:   description,
				IsEventStream: isEventStream,
				IsDeprecated:  isDeprecated,
			},
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
