package main

import (
	"errors"
	"reflect"
	"runtime"
	"strings"

	"github.com/iancoleman/strcase"
)

type ArriAppDef struct {
	SchemaVersion string
	Info          *ArriAppDefInfo
	Procedures    map[string]ArriRpcDef
	Definitions   map[string]ArriTypeDef
}

type ArriAppDefInfo struct{}

type ArriRpcDef struct {
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
	Path          string
	Method        HttpMethod
	IsEventStream *bool
	Params        *string
	Response      *string
	Description   *string
	IsDeprecated  *bool
}

type ArriHttpRpcOptions struct {
	Path         string
	Method       HttpMethod
	Description  string
	IsDeprecated bool
}

type UserParams struct {
	UserId string
}
type User struct {
	Id    string
	Name  string
	Email string
}

func GetUser(params UserParams, context MyCustomContext) (*User, *ErrorResponse) {
	return &User{Id: params.UserId}, nil
}

func UpdateUser(params User, context MyCustomContext) (*User, *ErrorResponse) {
	return &params, nil
}

func ToRpcDef(value interface{}, options ArriHttpRpcOptions) (*ArriRpcDef, error) {
	fnName := rpcNameFromFunctionName(GetFunctionName(value))
	valueType := reflect.TypeOf(value)
	valueKind := valueType.Kind()
	if valueKind != reflect.Func {
		return nil, errors.ErrUnsupported
	}
	params := valueType.In(0).Name()
	response := valueType.Out(0).Name()
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
	return &ArriRpcDef{
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
