package main

import (
	"errors"
	"reflect"
	"runtime"
	"strings"

	"github.com/iancoleman/strcase"
)

type AAppDef struct {
	SchemaVersion string                           `key:"schemaVersion" json:"schemaVersion" `
	Info          *AAppDefInfo                     `key:"info" json:"info,omitempty" `
	Procedures    []__aOrderedMapEntry__[ARpcDef]  `key:"procedures" json:"procedures" `
	Definitions   []__aOrderedMapEntry__[ATypeDef] `key:"definitions" json:"definitions"`
}

type AAppDefInfo struct {
	Name        string `key:"name" json:"name,omitempty"`
	Description string `key:"description" json:"description,omitempty"`
	Version     string `key:"version" json:"version,omitempty"`
}

type ARpcDef struct {
	DiscriminatorKey `discriminatorKey:"transport"`
	Http             *ArriHttpRpcDef `discriminator:"http"`
}

const (
	HttpMethodGet    = "get"
	HttpMethodPost   = "post"
	HttpMethodPut    = "put"
	HttpMethodPatch  = "patch"
	HttpMethodDelete = "delete"
)

type HttpMethod = string

type ArriHttpRpcDef struct {
	Path          string     `key:"path"`
	Method        HttpMethod `key:"method"`
	IsEventStream *bool      `key:"isEventStream"`
	Params        *string    `key:"params"`
	Response      *string    `key:"response"`
	Description   *string    `key:"description"`
	IsDeprecated  *bool      `key:"isDeprecated"`
}

type ArriHttpRpcOptions struct {
	Path         string
	Method       HttpMethod
	Description  string
	IsDeprecated bool
}

func ToRpcDef(value interface{}, options ArriHttpRpcOptions) (*ARpcDef, error) {
	fnName := rpcNameFromFunctionName(GetFunctionName(value))
	valueType := reflect.TypeOf(value)
	valueKind := valueType.Kind()
	if valueKind != reflect.Func {
		return nil, errors.ErrUnsupported
	}
	params := valueType.In(0).Name()
	response := valueType.Out(0).Elem().Name()
	path := "/" + strcase.ToKebab(fnName)
	if len(options.Path) > 0 {
		path = options.Path
	}
	method := HttpMethodPost
	if len(options.Method) > 0 {
		method = options.Method
	}
	var description *string = nil
	if len(options.Description) > 0 {
		description = &options.Description
	}
	var isDeprecated *bool = nil
	if options.IsDeprecated {
		isDeprecated = &options.IsDeprecated
	}
	return &ARpcDef{
			Http: &ArriHttpRpcDef{
				Path:         path,
				Method:       method,
				Params:       &params,
				Response:     &response,
				Description:  description,
				IsDeprecated: isDeprecated,
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
	return fnName
}
