package arri

import (
	"fmt"
	"go/format"
	"os"
	"reflect"
	"strings"

	"github.com/modiimedia/arri/languages/go/go-server/utils"
)

type CompilerCxt struct {
	KeyCasing      KeyCasing
	InstancePath   string
	SchemaPath     string
	PackageImports map[string][]string
	CompiledTypes  map[reflect.Type]GoType
	MaxDepth       uint32
	Depth          uint32
	EnumValues     map[string][]string
	PackageName    string
}

func appendPackageImport(imports map[string][]string, packageName string, importStr string) map[string][]string {
	_, ok := imports[packageName]
	if !ok {
		imports[packageName] = []string{}
	}
	if contains(imports[packageName], importStr) {
		return imports
	}
	imports[packageName] = append(imports[packageName], importStr)
	return imports
}

func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

type GoType struct {
	TypeName           string
	PackagePath        string
	EncodeJSONTemplate func(input string, target string) string
	DecodeJSONTemplate func(input string, target string, context string, isOptional bool, isNullable bool) string
	Content            string
}

func CleanedPackageName(pkgPath string) string {
	if strings.Contains(pkgPath, ".") {
		return ""
	}
	if strings.Contains(pkgPath, "/") {
		parts := strings.Split(pkgPath, "/")
		parts = parts[1:]
		return strings.Join(parts, "/")
	}
	return pkgPath
}

func PrecompileDecoderAndEncoderFunctions(
	dir string,
	types map[reflect.Type]bool,
	options EncodingOptions,
) error {
	pkgs, err := GetPackages(dir)
	if err != nil {
		return err
	}
	ctx := CompilerCxt{
		Depth:          0,
		MaxDepth:       options.MaxDepth,
		KeyCasing:      options.KeyCasing,
		CompiledTypes:  map[reflect.Type]GoType{},
		PackageImports: map[string][]string{},
		EnumValues:     map[string][]string{},
	}
	for t := range types {
		ctx.Depth = 0
		ctx.EnumValues = map[string][]string{}
		_, err := compileType(t, ctx)
		if err != nil {
			return err
		}
	}
	fileContents := map[string]string{}
	fileContentTests := map[string][]string{}
	for t, v := range ctx.CompiledTypes {
		if len(v.Content) == 0 {
			continue
		}
		cleanedName := CleanedPackageName(v.PackagePath)
		dirName, ok := pkgs[cleanedName]
		if !ok {
			continue
		}
		fileName := dirName + "/arri_validators.g.go"
		_, ok = fileContents[fileName]
		if !ok {
			content := "// cspell:disable\npackage " + cleanedName + "\n\n"
			content += "import (\n"
			for _, v := range ctx.PackageImports[v.PackagePath] {
				content += "    " + v + "\n"
			}
			content += "\n"
			content += "	arri \"github.com/modiimedia/arri/languages/go/go-server\"\n"
			content += "    \"github.com/tidwall/gjson\"\n"
			content += ")\n\n"
			fileContents[fileName] = content
			fileContentTests[fileName] = []string{}
		}
		fileContents[fileName] += v.Content
		if t.Kind() == reflect.Struct {
			fileContentTests[fileName] = append(fileContentTests[fileName], "arri.IsCompiledArriModel(&"+v.TypeName+"{})")
		}
	}

	for k, v := range fileContents {
		file, err := os.Create(k)
		if err != nil {
			return err
		}
		content := v
		content += "func TestIsCompiledArriModel() {\n"
		for _, testContent := range fileContentTests[k] {
			content += "    " + testContent + "\n"
		}
		content += "}"
		formattedContent, err := format.Source([]byte(content))
		if err != nil {
			os.Remove(file.Name())
			return err
		}
		if len(formattedContent) == 0 {
			continue
		}
		_, err = file.Write(formattedContent)
		if err != nil {
			return err
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

func compileString(t reflect.Type, _ CompilerCxt) (GoType, error) {
	result := GoType{
		TypeName:    "string",
		PackagePath: t.PkgPath(),
		EncodeJSONTemplate: func(input string, target string) string {
			return fmt.Sprintf("%s.Bytes = arri.AppendNormalizedStringV2(%s.Bytes, %s)", target, target, input)
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
                    %s.Errors = append(%s.Errors, arri.NewValidationError("expected string or null", %s.InstancePath, %s.SchemaPath)) 
                }`,
					input, target, input, input, context, context, context, context,
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
                %s.Errors = append(%s.Errors, arri.NewValidationError("expected string", %s.InstancePath, %s.SchemaPath)) 
            }`,
				input, target, input, context, context, context, context,
			)
		},
		Content: "",
	}
	return result, nil
}

func compileBool(t reflect.Type, ctx CompilerCxt) (GoType, error) {
	result := GoType{
		TypeName:    "bool",
		PackagePath: t.PkgPath(),
		EncodeJSONTemplate: func(input, target string) string {
			output := fmt.Sprintf(`%s.Bytes = strconv.AppendBool(%s.Bytes, %s)`, target, target, input)
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
                    %s.Errors = append(%s.Errors, arri.NewValidationError("expected bool or null", %s.InstancePath, %s.SchemaPath))
                }`, input, target, input, target, input, context, context, context, context)

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
            } else if %s.Type == gjson.False {
                %s = false 
            } else {
                %s.Errors = append(%s.Errors, arri.NewValidationError("expected bool", %s.InstancePath, %s.SchemaPath))
            }`, input, target, input, target, context, context, context, context)
		},
		Content: "",
	}
	ctx.PackageImports = appendPackageImport(ctx.PackageImports, ctx.PackageName, "\"strconv\"")
	return result, nil
}

func compileTimestamp(t reflect.Type, ctx CompilerCxt) (GoType, error) {
	output := GoType{
		TypeName:    "time.Time",
		PackagePath: t.PkgPath(),
		EncodeJSONTemplate: func(input, target string) string {
			return fmt.Sprintf(`%s.Bytes = append(%s.Bytes, '"')
            %s.Bytes = append(%s.Bytes, %s.Format("2006-01-02T15:04:05.000Z")...)
            %s.Bytes = append(%s.Bytes, '"')`, target, target, target, target, input, target, target)
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
                                %s.InstancePath,
								%s.SchemaPath,
                            ),
                        )
                    } else {
                        %s.Set(arri.NotNull(_value_))
                    }
                } else if %s.Type == gjson.Null {
                    %s.Set(arri.Null[time.Time]()) 
                }`, input, input, context, context, context, context, target, input, target)
			}
			if isNullable {
				return fmt.Sprintf(`if %s.Type == gjson.String {
                    _value_, _err_ := time.ParseInLocation(time.RFC3339, %s.String(), time.UTC)
                    if _err_ != nil {
                        %s.Errors = append(
                            %s.Errors,
                            arri.NewValidationError(
                                _err_.Error(),
                                %s.InstancePath,
								%s.SchemaPath,
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
                        arri.NewValidationError("expected RFC3339 date-time string or null", %s.InstancePath, %s.SchemaPath)
                    )
                }`,
					input, input, context, context, context, context, target, input, context, context, context, context)
			}
			if isOptional {
				return fmt.Sprintf(`if %s.Type == gjson.String {
                    _value_, _err_ := time.ParseInLocation(time.RFC3339, %s.String(), time.UTC)
                    if _err_ != nil {
                        %s.Errors = append(
                            %s.Errors,
                            arri.NewValidationError(
                                _err_.Error(),
                                %s.InstancePath,
								%s.SchemaPath,
                            )
                        )
                    } else {
                        %s.Set(_value_) 
                    }
                }`, input, input, context, context, context, context, target)
			}
			return fmt.Sprintf(`if %s.Type == gjson.String {
                _value_, _err_ := time.ParseInLocation(time.RFC3339, %s.String(), time.UTC)
                if _err_ != nil {
                    %s.Errors = append(
                        %s.Errors,
                        arri.NewValidationError(
                            _err_.Error(),
                            %s.InstancePath,
							%s.SchemaPath,
                        )
                    )
                } else {
                    %s = _value_
                }
            } else {
                %s.Errors = append(
                    %s.Errors,
                    arri.NewValidationError("expected RFC3339 date time string", %s.InstancePath, %s.SchemaPath),
                ) 
            }`, input, input, context, context, context, context, target, context, context, context, context)
		},
		Content: "",
	}
	ctx.PackageImports = appendPackageImport(ctx.PackageImports, ctx.PackageName, "\"time\"")
	return output, nil
}

func compileOption(t reflect.Type, ctx CompilerCxt) (GoType, error) {
	innerType, err := compileType(t.Field(0).Type, ctx)
	if err != nil {
		return GoType{}, nil
	}
	output := GoType{
		TypeName:    "arri.Option[" + innerType.TypeName + "]",
		PackagePath: t.PkgPath(),
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
	return output, nil
}

func compileNullable(t reflect.Type, ctx CompilerCxt) (GoType, error) {
	innerType, err := compileType(t.Field(0).Type, ctx)
	if err != nil {
		return GoType{}, err
	}
	output := GoType{
		TypeName:    "arri.Nullable[" + innerType.TypeName + "]",
		PackagePath: t.PkgPath(),
		EncodeJSONTemplate: func(input, target string) string {
			return fmt.Sprintf(`if %s.IsNull() {
                %s.Bytes = append(%s.Bytes, "null"...)  
            } else {
                %s 
            }`,
				input,
				target,
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
	return output, nil
}

func removeChars(s string, illegalChars string) string {
	output := s
	chars := strings.Split(illegalChars, "")
	for i := 0; i < len(chars); i++ {
		char := chars[i]
		output = strings.ReplaceAll(output, char, "")
	}
	return output
}

var illegalChars = "!@#$%^&*()-+=`~;:'\\\",.<>/?"

func compileStruct(t reflect.Type, ctx CompilerCxt) (GoType, error) {
	decodeJSONParts := []string{}
	encodeJSONParts := []string{}
	pckName := ctx.PackageName
	depth := ctx.Depth
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
		ctx.Depth = depth + 1
		ctx.InstancePath = instancePath + "/" + serialKey
		ctx.PackageName = t.PkgPath()
		if isOptionalField {
			ctx.SchemaPath = schemaPath + "/optionalProperties/" + serialKey
		} else {
			ctx.SchemaPath = schemaPath + "/properties" + serialKey
		}
		innerType, err := compileType(field.Type, ctx)
		if err != nil {
			return GoType{}, err
		}
		tempDataVar := "_" + field.Name + "_"
		decodeJSONParts = append(decodeJSONParts, tempDataVar+":= _data_.Get(\""+serialKey+"\")")
		decodeJSONParts = append(
			decodeJSONParts,
			innerType.DecodeJSONTemplate(
				tempDataVar,
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

	decodeJSONFnBody := fmt.Sprintf(`func (_input_ *%s) CompiledDecodeJSON(_data_ *gjson.Result, _dc_ *arri.DecoderContext) {
    if _dc_.Depth > _dc_.MaxDepth {
        _dc_.Errors = append(_dc_.Errors, arri.NewValidationError("exceeded max depth", _dc_.InstancePath, _dc_.SchemaPath))
        return
    }
    _depth_ := _dc_.Depth
    _instancePath_ := _dc_.InstancePath
    _schemaPath_ := _dc_.SchemaPath
    %s

	_dc_.Depth = _depth_
	_dc_.InstancePath = _instancePath_
	_dc_.SchemaPath = _schemaPath_
}`, t.Name(), strings.Join(decodeJSONParts, "\n"))

	encodeJSONFnBody := fmt.Sprintf(`func (_input_ %s) CompiledEncodeJSON(_state_ *arri.EncodeState) error {
    %s
    return nil
}`, t.Name(), strings.Join(encodeJSONParts, "\n"))
	tempDataName := "_" + removeChars(ctx.InstancePath, illegalChars) + "Data_"
	output := GoType{
		TypeName:    t.Name(),
		PackagePath: t.PkgPath(),
		EncodeJSONTemplate: func(input, target string) string {
			return fmt.Sprintf("%s.CompiledEncodeJSON(_state_)", input)
		},
		DecodeJSONTemplate: func(input, target, context string, isOptional, isNullable bool) string {
			if isOptional && isNullable {
				return fmt.Sprintf(`if %s.Type == gjson.JSON {
					%s := %s{}
					%s.CompiledDecodeJSON(&%s, %s),
					%s.Set(arri.NotNull(%s))
				} else if %s.Type == gjson.Null {
					%s.Set(arri.Null[%s]()) 
				}`, input, tempDataName, t.Name(), tempDataName, input, context, target, tempDataName, input, target, t.Name())
			}
			if isNullable {
				return fmt.Sprintf(`if %s.Type == gjson.JSON {
					%s := %s{}
					%s.CompiledDecodeJSON(&%s, %s)
					%s.Set(%s)
				} else if %s.Type == gjson.Null {
					// do nothing 
				} else {
					%s.Errors = append(%s.Errors, arri.NewValidationError("expected object or null", %s.InstancePath, %s.SchemaPath)) 
				}`,
					input, tempDataName, t.Name(), tempDataName, input, context, target, tempDataName, input, context, context, context, context)
			}
			if isOptional {
				return fmt.Sprintf(`if %s.Type == gjson.JSON {
					%s := %s{}
					%s.CompiledDecodeJSON(&%s, %s)
					%s.Set(%s)
				}`, input, tempDataName, t.Name(), tempDataName, t.Name(), context, input, tempDataName)
			}
			return fmt.Sprintf(`if %s.Type == gjson.JSON {
				%s.CompiledDecodeJSON(&%s, %s)
			} else {
				%s.Errors = append(%s.Errors, arri.NewValidationError("expect object", %s.InstancePath, %s.SchemaPath)) 
			}`, input, target, input, context, context, context, context, context)
		},
		Content: decodeJSONFnBody + "\n\n" + encodeJSONFnBody + "\n\n",
	}
	ctx.CompiledTypes[t] = output
	ctx.Depth = depth
	ctx.InstancePath = instancePath
	ctx.SchemaPath = schemaPath
	ctx.PackageName = pckName
	return output, nil
}

func compileAny(t reflect.Type, ctx CompilerCxt) (GoType, error) {
	return GoType{}, nil
}
