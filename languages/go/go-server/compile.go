package arri

import (
	"fmt"
	"reflect"
	"strings"

	"github.com/modiimedia/arri/languages/go/go-server/utils"
)

type CompilerCxt struct {
	KeyCasing     KeyCasing
	InstancePath  string
	SchemaPath    string
	CompiledTypes map[reflect.Type]GoType
	MaxDepth      uint32
	Depth         uint32
	Imports       []string
	EnumValues    map[string][]string
}

type GoType struct {
	TypeName           string
	EncodeJSONTemplate func(input string, target string) string
	DecodeJSONTemplate func(input string, target string, context string, isOptional bool, isNullable bool) string
	Content            string
}

func PrecompileDecoderAndEncoderFunctions(types map[reflect.Type]bool, options EncodingOptions) error {
	ctx := CompilerCxt{
		Depth:         0,
		MaxDepth:      options.MaxDepth,
		KeyCasing:     options.KeyCasing,
		CompiledTypes: map[reflect.Type]GoType{},
		Imports:       []string{},
		EnumValues:    map[string][]string{},
	}
	for t := range types {
		fmt.Println("COMPILING", t)
		ctx.Depth = 0
		ctx.EnumValues = map[string][]string{}
		_, err := compileType(t, ctx)
		if err != nil {
			return err
		}
	}

	for k, v := range ctx.CompiledTypes {
		if len(v.Content) > 0 {
			fmt.Println("TYPE", k.Name())
			fmt.Println(v.Content)
		}
	}

	return nil

}

func compileType(t reflect.Type, ctx CompilerCxt) (GoType, error) {
	existingResult, ok := ctx.CompiledTypes[t]
	if ok {
		return existingResult, nil
	}
	switch t.Kind() {
	case reflect.String:
		return compileString(t, ctx)
	case reflect.Bool:
		return compileBool(t, ctx)
	case reflect.Float32:
	case reflect.Float64:
	case reflect.Int8:
	case reflect.Int16:
	case reflect.Int32:
	case reflect.Int64:
	case reflect.Int:
	case reflect.Uint8:
	case reflect.Uint16:
	case reflect.Uint32:
	case reflect.Uint64:
	case reflect.Uint:
	case reflect.Struct:
		if t.Name() == "Time" && t.PkgPath() == "time" {
			return compileTimestamp(t, ctx)
		}
		if utils.IsOptionalType(t) {
			return compileOption(t, ctx)
		}
		if utils.IsNullableTypeOrPointer(t) {
			return compileNullable(t, ctx)
		}
		if isDiscriminatorStruct(t) {
			// TODO
		}
		return compileStruct(t, ctx)
	case reflect.Ptr:
		return compileNullable(t, ctx)
	}

	return compileAny(t, ctx)
}

func compileString(t reflect.Type, ctx CompilerCxt) (GoType, error) {
	result := GoType{
		TypeName: "string",
		EncodeJSONTemplate: func(input string, target string) string {
			return fmt.Sprintf("%s = arri.AppendNormalizedStringV2(%s, %s)", target, target, input)
		},
		DecodeJSONTemplate: func(input string, target string, context string, isOptional, isNullable bool) string {
			if isOptional && isNullable {
				return fmt.Sprintf(`if %s.Type == gjson.String {
                    %s.Set(arri.NotNull(%s.String()))
                } else if %s.Type == gjson.Null {
                    %s.Set(arri.Null[string]()) 
                }`, input, target, input, input, target)
			}
			if isNullable {
				return fmt.Sprintf(`if %s.Type == gjson.String {
                    %s.Set(%s.String())
                } else if %s.Type == gjson.Null {
                    // do nothing 
                } else {
                    %s.Errors = append(%s.Errors, arri.NewValidationError("expected string or null", %s)) 
                }`,
					input, target, input, input, context, context, context,
				)
			}
			if isOptional {
				return fmt.Sprintf(`if %s.Type == gjson.String {
                    %s.Set(%s.String())
                }`, input, target, input)
			}
			return fmt.Sprintf(`if %s.Type == gjson.String {
                %s = %s.String()
            } else {
                %s.Errors = append(%s.Errors, arri.NewValidationError("expected string", %s)) 
            }`,
				input, target, input, context, context, context,
			)
		},
		Content: "",
	}
	ctx.CompiledTypes[t] = result
	return result, nil
}

func compileBool(t reflect.Type, ctx CompilerCxt) (GoType, error) {
	result := GoType{
		TypeName: "bool",
		EncodeJSONTemplate: func(input, target string) string {
			output := fmt.Sprintf(`%s = strconv.AppendBool(%s, %s)`, target, target, input)
			return output
		},
		DecodeJSONTemplate: func(input, target, context string, isOptional, isNullable bool) string {
			if isOptional && isNullable {
				return fmt.Sprintf(`if %s.Type == gjson.True {
                    %s.Set(arri.NotNull(true))
                } else if %s.Type == gjson.False {
                    %s.Set(arri.NotNull(false)) 
                } else if %s.Type == gjson.Null {
                    %s.Set(arri.Null[bool]()) 
                }`, input, target, input, target, input, target)
			}
			if isNullable {
				return fmt.Sprintf(`if %s.Type == gjson.True {
                    %s.Set(true)
                } else if %s.Type == gjson.False {
                    %s.Set(false) 
                } else if %s.Type == gjson.Null {
                    // do nothing 
                } else {
                    %s.Errors = append(%s.Errors, arri.NewValidationError("expected bool or null", %s))
                }`, input, target, input, target, input, context, context, context)

			}
			if isOptional {
				return fmt.Sprintf(`if %s.Type == gjson.True {
                    %s.Set(true)
                } else if %s.Type == gjson.False {
                    %s.Set(false) 
                }`, input, target, input, target)
			}
			return fmt.Sprintf(`if %s.Type == gjson.True {
                %s = true
            } else if %s.Type. == gjson.False {
                %s = false 
            } else {
                %s.Errors = append(%s.Errors, arri.NewValidationError("expected bool", %s))
            }`, input, target, input, target, context, context, context)
		},
		Content: "",
	}
	ctx.CompiledTypes[t] = result
	return result, nil
}

func compileTimestamp(t reflect.Type, ctx CompilerCxt) (GoType, error) {
	output := GoType{
		TypeName: "time.Time",
		EncodeJSONTemplate: func(input, target string) string {
			return fmt.Sprintf(`%s = append(%s, '"')
            %s = append(%s, %s.Format("2006-01-02T15:04:05.000Z")...)
            %s = append(%s, '"')`, target, target, target, target, input, target, target)
		},
		DecodeJSONTemplate: func(input, target, context string, isOptional, isNullable bool) string {
			if isOptional && isNullable {
				return fmt.Sprintf(`if %s.Type == gjson.String {
                    _value_, _err_ := time.ParseInLocation(time.RFC3339, %s.String(), time.UTC)
                    if _err_ != nil {
                        %s.Errors = append(
                            %s.Errors,
                            arri.NewValidationError(
                                _err_.Error(),
                                %s,
                            ),
                        )
                    } else {
                        %s.Set(arri.NotNull(_value_))
                    }
                } else if %s.Type == gjson.Null {
                    %s.Set(arri.Null[time.Time]()) 
                }`, input, input, context, context, context, target, input, target)
			}
			if isNullable {
				return fmt.Sprintf(`if %s.Type == gjson.String {
                    _value_, _err_ := time.ParseInLocation(time.RFC3339, %s.String(), time.UTC)
                    if _err_ != nil {
                        %s.Errors = append(
                            %s.Errors,
                            arri.NewValidationError(
                                _err_.Error(),
                                %s,
                            )
                        )
                    } else {
                        %s.Set(_value_) 
                    }
                } else if %s.Type == gjson.Null {
                    // do nothing 
                } else {
                    %s.Errors = append(
                        %s.Errors,
                        arri.NewValidationError("expected RFC3339 date-time string or null", %s)
                    )
                }`,
					input, input, context, context, context, target, input, context, context, context)
			}
			if isOptional {
				return fmt.Sprintf(`if %s.Type == gjson.String {
                    _value_, _err_ := time.ParseInLocation(time.RFC3339, %s.String(), time.UTC)
                    if _err_ != nil {
                        %s.Errors = append(
                            %s.Errors,
                            arri.NewValidationError(
                                _err_.Error(),
                                %s,
                            )
                        )
                    } else {
                        %s.Set(_value_) 
                    }
                }`, input, input, context, context, context, target)
			}
			return fmt.Sprintf(`if %s.Type == gjson.String {
                _value_, _err_ := time.ParseInLocation(time.RFC3339, %s.String(), time.UTC)
                if _err_ != nil {
                    %s.Errors = append(
                        %s.Errors,
                        arri.NewValidationError(
                            _err_.Error(),
                            %s,
                        )
                    )
                } else {
                    %s = _value_
                }
            } else {
                %s.Errors = append(
                    %s.Errors,
                    arri.NewValidationError("expected RFC3339 date time string", %s),
                ) 
            }`, input, input, context, context, context, target, context, context, context)
		},
		Content: "",
	}
	ctx.CompiledTypes[t] = output
	return output, nil
}

func compileOption(t reflect.Type, ctx CompilerCxt) (GoType, error) {
	innerType, err := compileType(t.Field(0).Type, ctx)
	if err != nil {
		return GoType{}, nil
	}
	output := GoType{
		TypeName: "arri.Option[" + innerType.TypeName + "]",
		EncodeJSONTemplate: func(input, target string) string {
			return innerType.EncodeJSONTemplate(
				fmt.Sprintf("%s.Unwrap()", input),
				target,
			)
		},
		DecodeJSONTemplate: func(input, target, context string, isOptional, isNullable bool) string {
			if isNullable {
				panic("arri.Option cannot be nested inside of arri.Nullable. The order must be reversed. Instead put arri.Nullable inside of arri.Option")
			}
			return innerType.DecodeJSONTemplate(input, target, context, true, isNullable)
		},
		Content: "",
	}
	ctx.CompiledTypes[t] = output
	return output, nil
}

func compileNullable(t reflect.Type, ctx CompilerCxt) (GoType, error) {
	innerType, err := compileType(t.Field(0).Type, ctx)
	if err != nil {
		return GoType{}, err
	}
	output := GoType{
		TypeName: "arri.Nullable[" + innerType.TypeName + "]",
		EncodeJSONTemplate: func(input, target string) string {
			return fmt.Sprintf(`if %s.IsNull() {
                %s = append(%s, "null"...)  
            } else {
                %s 
            }`,
				input,
				innerType.EncodeJSONTemplate(
					fmt.Sprintf("%s.Unwrap()", input),
					target,
				))
		},
		DecodeJSONTemplate: func(input, target, context string, isOptional, _ bool) string {
			return innerType.DecodeJSONTemplate(input, target, context, isOptional, true)
		},
		Content: "",
	}
	ctx.CompiledTypes[t] = output
	return output, nil
}

func removeChars(s string, illegalChars string) string {
	output := s
	chars := strings.Split(illegalChars, "")
	for i := 0; i < len(chars); i++ {
		char := chars[i]
		strings.ReplaceAll(output, char, "")
	}
	return output
}

func compileStruct(t reflect.Type, ctx CompilerCxt) (GoType, error) {
	decodeJSONParts := []string{}
	encodeJSONParts := []string{}
	currentDepth := ctx.Depth
	_ = ctx.EnumValues
	instancePath := ctx.InstancePath
	schemaPath := ctx.SchemaPath
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		if !field.IsExported() {
			continue
		}
		isOptionalField := utils.IsOptionalType(field.Type)
		serialKey := utils.GetSerialKey(&field, ctx.KeyCasing)
		ctx.Depth = currentDepth + 1
		ctx.InstancePath = instancePath + "/" + serialKey
		if isOptionalField {
			ctx.SchemaPath = schemaPath + "/optionalProperties/" + serialKey
		} else {
			ctx.SchemaPath = schemaPath + "/properties" + serialKey
		}
		innerType, err := compileType(field.Type, ctx)
		if err != nil {
			return GoType{}, err
		}
		decodeJSONParts = append(decodeJSONParts, field.Name+":= _data_.Get(\""+serialKey+"\")")
		decodeJSONParts = append(
			decodeJSONParts,
			innerType.DecodeJSONTemplate(
				field.Name,
				"_input_."+field.Name,
				"_dc_",
				false,
				false,
			),
		)
		if isOptionalField {
			encodeJSONParts = append(encodeJSONParts, fmt.Sprintf(`if %s.IsSome() {
                %s
            }`, "_input_."+field.Name, innerType.EncodeJSONTemplate("_input_."+field.Name, "_state_")))
		} else {
			encodeJSONParts = append(encodeJSONParts, innerType.EncodeJSONTemplate("_input_."+field.Name, "_state_"))
		}
	}

	decodeFnName := removeChars(
		"__compileDecodeJSON"+t.PkgPath()+t.Name(),
		"&!@#$%^&*()-+=[]{};:\"'<>,.?/`~",
	)

	decodeJSONFnBody := fmt.Sprintf(`func (_input_ *%s) CompiledDecodeJSON(_data_ *gjson.Result, _dc_ *arri.DecoderContext) {
    if _dc_.CurrentDepth > _dc_.MaxDepth {
        _dc_.Errors = append(_dc_.Errors, arri.NewValidationError("exceeded max depth", _dc_))
        return
    }
    currentDepth := _dc_.CurrentDepth
    instancePath := _dc_.InstancePath
    schemaPath := _dc_.SchemaPath
    %s
}`, t.Name(), strings.Join(decodeJSONParts, "\n"))

	encodeJSONFnBody := fmt.Sprintf(`func (_input_ %s) CompiledEncodeJSON(_state_ *arri.EncodeState) error {
    %s
    return nil
}`, t.Name(), strings.Join(encodeJSONParts, "\n"))

	output := GoType{
		TypeName: t.Name(),
		EncodeJSONTemplate: func(input, target string) string {
			return fmt.Sprintf("%s.EncodeJSON(_state_)", input)
		},
		DecodeJSONTemplate: func(input, target, context string, isOptional, isNullable bool) string {
			return fmt.Sprintf("%s = %s(%s, %s)", target, decodeFnName, input, context)
		},
		Content: decodeJSONFnBody + "\n\n" + encodeJSONFnBody + "\n\n",
	}
	ctx.CompiledTypes[t] = output
	ctx.Depth = currentDepth
	ctx.InstancePath = instancePath
	ctx.SchemaPath = schemaPath
	return output, nil
}

func compileAny(t reflect.Type, ctx CompilerCxt) (GoType, error) {
	return GoType{}, nil
}
