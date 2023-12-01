import { execSync } from "child_process";
import { writeFileSync } from "fs";
import {
    type ServiceDefinition,
    isRpcDefinition,
    type RpcDefinition,
    type SchemaFormProperties,
    type SchemaFormType,
    isSchemaFormType,
    type Schema,
    isSchemaFormProperties,
    isSchemaFormElements,
    isSchemaFormEnum,
    isSchemaFormValues,
    isSchemaFormDiscriminator,
    type AppDefinition,
    unflattenProcedures,
    isServiceDefinition,
    type SchemaFormElements,
    type SchemaFormEnum,
    type SchemaFormValues,
    type SchemaFormDiscriminator,
    defineClientGeneratorPlugin,
    pascalCase,
    camelCase,
} from "arri-codegen-utils";
import { a } from "arri-validate";

export interface DartClientGeneratorOptions {
    clientName: string;
    outputFile: string;
}

export const dartClientGenerator = defineClientGeneratorPlugin(
    (options: DartClientGeneratorOptions) => {
        return {
            generator: async (def) => {
                if (!options.clientName) {
                    throw new Error(
                        'Missing "clientName" cannot generate dart client',
                    );
                }
                if (!options.outputFile) {
                    throw new Error(
                        'Missing "outputFile" cannot generate dart client',
                    );
                }
                const numProcedures = Object.keys(def.procedures).length;
                if (numProcedures <= 0) {
                    console.warn(
                        "No procedures found in definition file. Dart client will not be generated",
                    );
                }
                const result = createDartClient(def, options);
                writeFileSync(options.outputFile, result);
                try {
                    execSync(`dart format ${options.outputFile}`);
                } catch (err) {
                    console.error("Error formatting dart client", err);
                }
            },
            options,
        };
    },
);

export class DartClientGenerator {
    generatedModels: string[] = [];
}

export function createDartClient(
    def: AppDefinition,
    opts: DartClientGeneratorOptions,
): string {
    const existingClassNames: string[] = [];
    const clientVersion = def.info?.version ?? "";
    const services = unflattenProcedures(def.procedures);
    const rpcParts: string[] = [];
    const serviceGetterParts: string[] = [];
    const serviceParts: string[] = [];
    const modelParts: string[] = [];

    Object.keys(services).forEach((key) => {
        const item = services[key];
        if (isRpcDefinition(item)) {
            const rpc = dartRpcFromDefinition(key, item, opts);
            rpcParts.push(rpc);
            return;
        }
        if (isServiceDefinition(item)) {
            const serviceName: string = pascalCase(`${opts.clientName}_${key}`);
            const service = dartServiceFromDefinition(serviceName, item, {
                versionNumber: clientVersion,
                ...opts,
            });
            serviceParts.push(service);
            serviceGetterParts.push(`${serviceName}Service get ${key} {
  return ${serviceName}Service(
    baseUrl: _baseUrl, 
    headers: _headers,
  );
}`);
        }
    });
    for (const key of Object.keys(def.models)) {
        const item = def.models[key];
        if (
            isSchemaFormProperties(item) ||
            isSchemaFormDiscriminator(item) ||
            isSchemaFormValues(item)
        ) {
            const result = dartTypeFromJtdSchema(key, item, {
                isOptional: false,
                existingClassNames,
            });
            modelParts.push(result.content);
        }
    }
    return `// this file was autogenerated by arri
import "dart:convert";
import "package:arri_client/arri_client.dart";

class ${opts.clientName} {
  final String _baseUrl;
  late final Map<String, String> _headers;
  ${opts.clientName}({
    String baseUrl = "",
    Map<String, String> headers = const {},
  })  : _baseUrl = baseUrl
  { _headers = { "client-version": "${clientVersion}", ...headers }; }
  ${rpcParts.join("\n  ")}
  ${serviceGetterParts.join("\n  ")}
}

${serviceParts.join("\n")}

${modelParts.join("\n")}
`;
}

interface ServiceOptions extends DartClientGeneratorOptions {
    versionNumber: string;
}

export function dartServiceFromDefinition(
    name: string,
    def: ServiceDefinition,
    opts: ServiceOptions,
) {
    const rpcParts: string[] = [];
    const subServiceParts: Array<{
        name: string;
        key: string;
        content: string;
    }> = [];
    const serviceName = `${name}`;
    Object.keys(def).forEach((key) => {
        const item = def[key];
        if (isRpcDefinition(item)) {
            rpcParts.push(dartRpcFromDefinition(key, item, opts));
            return;
        }
        const subServiceName = pascalCase(`${serviceName}_${key}`);
        const subService = dartServiceFromDefinition(
            subServiceName,
            item,
            opts,
        );
        subServiceParts.push({
            name: subServiceName,
            key,
            content: subService,
        });
    });
    return `class ${serviceName}Service {
  final String _baseUrl;
  late final Map<String, String> _headers;
  ${serviceName}Service({
    String baseUrl = "",
    Map<String, String> headers = const {},
  })  : _baseUrl = baseUrl
 { _headers = { "client-version": "${opts.versionNumber}", ...headers }; }
  ${subServiceParts
      .map(
          (sub) => `${sub.name}Service get ${sub.key} {
    return ${sub.name}Service(
        baseUrl: _baseUrl,
        headers: _headers,
    );
  }`,
      )
      .join("\n")}
  ${rpcParts.join("\n  ")}
}
${subServiceParts.map((sub) => sub.content).join("\n")}
`;
}

export function dartRpcFromDefinition(
    key: string,
    def: RpcDefinition,
    opts: DartClientGeneratorOptions,
): string {
    let returnType:
        | `Future<String>`
        | "Future<int>"
        | "Future<number>"
        | "Future<void>"
        | `Future<${string}>`
        | `EventSource<${string}>` = `Future<String>`;
    let returnTypeName = "String";
    if (def.response) {
        returnTypeName = pascalCase(def.response);

        if (def.isEventStream) {
            returnType = `EventSource<${returnTypeName}>`;
        } else {
            returnType = `Future<${returnTypeName}>`;
        }
    } else {
        returnType = "Future<void>";
    }
    let paramsInput = "";
    if (def.params) {
        paramsInput = `${pascalCase(def.params)} params`;
    }
    let responseParser: string = "(body) => body;";
    switch (returnType) {
        case "Future<String>":
            break;
        case "Future<int>":
            responseParser = `(body) => Int.parse(body)`;
            break;
        case "Future<double>":
            responseParser = `(body) => Double.parse(body)`;
            break;
        case "Future<void>":
            responseParser = `(body) {}`;
            break;
        case "Future<bool>":
            responseParser = `(body) {
                        switch(body) {
                            case "true":
                            case "1":
                                return true;
                            case "false":
                            case "0":
                            default:
                                return false;
                        }
                    }`;
            break;
        default:
            responseParser = `(body) => ${returnTypeName}.fromJson(
                json.decode(body),
            )`;
            break;
    }
    const descriptionParts = [];
    if (def.description) {
        const parts = def.description.split("\n");
        for (const part of parts) {
            descriptionParts.push(`/// ${part}`);
        }
    }
    if (def.isEventStream) {
        const hookParts: string[] = [
            `SseHookOnData<${returnTypeName}>? onData`,
            `SseHookOnError<${returnTypeName}>? onError`,
            `SseHookOnConnectionError<${returnTypeName}>? onConnectionError`,
            `SseHookOnOpen<${returnTypeName}>? onOpen`,
            `SseHookOnClose<${returnTypeName}>? onClose`,
            `String? lastEventId`,
        ];
        return `${descriptionParts.join("\n")}
        ${returnType} ${key}(${
            paramsInput.length ? `${paramsInput}, ` : ""
        }{${hookParts.join(", ")},}) {
            return parsedArriSseRequest<${returnTypeName}>(
                "$_baseUrl${def.path}",
                method: HttpMethod.${def.method},
                headers: _headers,
                params: ${paramsInput.length ? `params.toJson()` : "null"},
                parser: ${responseParser},
                onData: onData,
                onError: onError,
                onConnectionError: onConnectionError,
                onOpen: onOpen,
                onClose: onClose,
                lastEventId: lastEventId,
            );
        }`;
    }
    return `${descriptionParts.join("\n")}
${returnType} ${key}(${paramsInput}) {
    return parsedArriRequest(
      "$_baseUrl${def.path}",
      method: HttpMethod.${def.method},
      headers: _headers,
      params: ${paramsInput.length ? `params.toJson()` : "null"},
      parser: ${responseParser},
    );
  }`;
}

export function dartTypeFromJtdSchema(
    /**
     * location in the tree i.e User.reviews.id
     */
    nodePath: string,
    def: Schema,
    additionalOptions: {
        isOptional: boolean;
        existingClassNames: string[];
    },
): DartProperty {
    if (isSchemaFormType(def)) {
        return dartScalarFromJtdScalar(nodePath, def, additionalOptions);
    }
    if (isSchemaFormProperties(def)) {
        return dartClassFromJtdSchema(nodePath, def, additionalOptions);
    }
    if (isSchemaFormElements(def)) {
        return dartArrayFromJtdSchema(nodePath, def, additionalOptions);
    }
    if (isSchemaFormEnum(def)) {
        return dartEnumFromJtdSchema(nodePath, def, additionalOptions);
    }
    if (isSchemaFormValues(def)) {
        return dartMapFromJtdSchema(nodePath, def, additionalOptions);
    }
    if (isSchemaFormDiscriminator(def)) {
        return dartSealedClassFromJtdSchema(nodePath, def, additionalOptions);
    }
    return dartDynamicFromAny(nodePath, a.any(), additionalOptions);
}

export function dartClassFromJtdSchema(
    nodePath: string,
    def: SchemaFormProperties,
    additionalOptions: ConversionAdditionalOptions & {
        isException?: boolean;
        discriminatorOptions?: {
            discriminatorKey: string;
            discriminatorValue: string;
            discriminatorParentClassName: string;
        };
    },
): DartProperty {
    const isException = additionalOptions?.isException ?? false;
    const discOptions = additionalOptions?.discriminatorOptions;
    const isDiscriminatorChild =
        (discOptions?.discriminatorKey.length ?? 0) > 0;
    const jsonKey = nodePath.split(".").pop() ?? "";
    const key = camelCase(jsonKey);
    let className = def.metadata?.id ? pascalCase(def.metadata.id) : undefined;
    if (!className) {
        className = pascalCase(nodePath.split(".").join("_"));
    }
    const properties: { key: string; templates: DartProperty }[] = [];
    const optionalProperties: { key: string; templates: DartProperty }[] = [];
    const subContentParts: string[] = [];
    if (!def.properties) {
        return {
            typeName: "",
            fieldTemplate: "",
            constructorTemplate: "",
            fromJsonTemplate: () => "",
            toJsonTemplate: () => "",
            content: "",
        };
    }

    for (const key of Object.keys(def.properties ?? {})) {
        const keyPath = `${nodePath}.${key}`;
        const prop = def.properties[key];
        const mappedProp = dartTypeFromJtdSchema(keyPath, prop, {
            isOptional: false,
            existingClassNames: additionalOptions.existingClassNames,
        });
        properties.push({
            key,
            templates: mappedProp,
        });
        if (mappedProp?.content) {
            subContentParts.push(mappedProp.content);
        }
    }
    if (def.optionalProperties) {
        for (const key of Object.keys(def.optionalProperties ?? {})) {
            const keyPath = `${nodePath}.${key}`;
            const prop = def.optionalProperties[key];
            const mappedProp = dartTypeFromJtdSchema(keyPath, prop, {
                isOptional: true,
                existingClassNames: additionalOptions.existingClassNames,
            });
            optionalProperties.push({ key, templates: mappedProp });
            if (mappedProp?.content) {
                subContentParts.push(mappedProp.content);
            }
        }
    }
    const fieldParts: string[] = [];
    const constructorParts: string[] = [];
    const fromJsonParts: string[] = [];
    const copyWithParamParts: string[] = [];
    const copyWithInitParts: string[] = [];
    if (discOptions) {
        fieldParts.push(`@override
final String ${camelCase(discOptions.discriminatorKey)} = "${
            discOptions.discriminatorValue
        }"`);
    }
    for (const prop of properties) {
        fieldParts.push(prop.templates.fieldTemplate);
        constructorParts.push(prop.templates.constructorTemplate);
        const subJsonKey = prop.key;
        const subKey = camelCase(prop.key);
        fromJsonParts.push(
            `${subKey}: ${prop.templates.fromJsonTemplate(
                `json["${subJsonKey}"]`,
            )}`,
        );
        if (prop.templates.typeName === "dynamic") {
            copyWithParamParts.push(`dynamic ${subKey}`);
        } else {
            if (prop.templates.typeName.endsWith("?")) {
                copyWithParamParts.push(`${prop.templates.typeName} ${subKey}`);
            } else {
                copyWithParamParts.push(
                    `${prop.templates.typeName}? ${subKey}`,
                );
            }
        }
        copyWithInitParts.push(`${subKey}: ${subKey} ?? this.${subKey}`);
    }
    for (const prop of optionalProperties) {
        fieldParts.push(prop.templates.fieldTemplate);
        constructorParts.push(prop.templates.constructorTemplate);
        const subKey = camelCase(prop.key);
        const subJsonKey = prop.key;
        fromJsonParts.push(
            `${subKey}: ${prop.templates.fromJsonTemplate(
                `json["${subJsonKey}"]`,
            )}`,
        );
        if (prop.templates.typeName === "dynamic") {
            copyWithParamParts.push(`dynamic ${subKey}`);
        } else {
            if (prop.templates.typeName.endsWith("?")) {
                copyWithParamParts.push(`${prop.templates.typeName} ${subKey}`);
            } else {
                copyWithParamParts.push(
                    `${prop.templates.typeName}? ${subKey}`,
                );
            }
        }
        copyWithInitParts.push(`${subKey}: ${subKey} ?? this.${subKey}`);
    }
    let classNamePart = `class ${className}`;
    if (isDiscriminatorChild) {
        classNamePart += ` implements ${discOptions?.discriminatorParentClassName}`;
    } else if (isException) {
        classNamePart += ` implements Exception`;
    }
    const descriptionParts: string[] = [];
    if (def.metadata?.description) {
        const parts = def.metadata.description.split("\n");
        for (const part of parts) {
            descriptionParts.push(`/// ${part}`);
        }
    }
    const description = descriptionParts.join("\n");
    let content = `${description}
${classNamePart} {
    ${fieldParts.join(";\n  ")};
  const ${className}({
    ${constructorParts.join(",\n    ")},
  });
  factory ${className}.fromJson(Map<String, dynamic> json) {
    return ${className}(
      ${fromJsonParts.join(",\n      ")},
    );
  }
  ${isDiscriminatorChild ? `@override` : ""}
  Map<String, dynamic> toJson() {
    final result = <String, dynamic>{${
        isDiscriminatorChild
            ? `\n      "${discOptions?.discriminatorKey}": ${camelCase(
                  discOptions?.discriminatorKey ?? "",
              )},`
            : ""
    }
      ${properties
          .map(
              (prop) =>
                  `"${prop.key}": ${prop.templates.toJsonTemplate(
                      camelCase(prop.key),
                  )}`,
          )
          .join(",\n      ")}${properties.length ? "," : ""}
    };
    ${optionalProperties
        .map(
            (prop) => `if (${camelCase(prop.key)} != null) {
      result["${prop.key}"] = ${prop.templates.toJsonTemplate(
          camelCase(prop.key),
      )};
    }`,
        )
        .join("\n")}
    return result;
  }
  ${className} copyWith({
    ${copyWithParamParts.join(",\n    ")},
  }) {
    return ${className}(
      ${copyWithInitParts.join(",\n      ")},
    );
  }
}
${subContentParts.join("\n")}

`;
    if (additionalOptions.existingClassNames.includes(className)) {
        content = "";
    } else {
        additionalOptions.existingClassNames.push(className);
    }
    const isNullable = def.nullable ?? additionalOptions?.isOptional;
    const typeName = isNullable ? `${className}?` : className;
    return {
        typeName,
        fieldTemplate: fieldTemplateString(
            typeName,
            key,
            def.metadata?.description,
        ),
        constructorTemplate: additionalOptions.isOptional
            ? `this.${key}`
            : `required this.${key}`,
        fromJsonTemplate: (input) =>
            isNullable
                ? `${input} is Map<String, dynamic> ? ${className}.fromJson(${input}) : null`
                : `${className}.fromJson(${input})`,
        toJsonTemplate: (input) => `${input}${isNullable ? "?" : ""}.toJson()`,
        content,
    };
}

interface DartProperty {
    typeName: string;
    fieldTemplate: string;
    constructorTemplate: string;
    fromJsonTemplate: (input: string) => string;
    toJsonTemplate: (input: string) => string;
    content: string;
}

function dartDynamicFromAny(
    nodePath: string,
    def: Schema,
    additionalOptions: ConversionAdditionalOptions,
): DartProperty {
    const jsonKey = nodePath.split(".").pop() ?? "";
    const key = camelCase(jsonKey);
    return {
        typeName: "dynamic",
        fieldTemplate: fieldTemplateString(
            "dynamic",
            key,
            def.metadata?.description,
        ),
        constructorTemplate: additionalOptions.isOptional
            ? `this.${key}`
            : `required this.${key}`,
        fromJsonTemplate: (input) => `${input}`,
        toJsonTemplate: (input) => input,
        content: "",
    };
}

function fieldTemplateString(
    typeName: string,
    key: string,
    description?: string,
): string {
    let result = "";
    if (description) {
        const parts = description.split("\n");
        for (const part of parts) {
            result += `/// ${part}\n`;
        }
    }
    result += `final ${typeName} ${key}`;
    return result;
}

function dartArrayFromJtdSchema(
    nodePath: string,
    def: SchemaFormElements,
    additionalOptions: ConversionAdditionalOptions,
): DartProperty {
    const isNullable = additionalOptions.isOptional || (def.nullable ?? false);
    const jsonKey = nodePath.split(".").pop() ?? "";
    const key = camelCase(jsonKey);
    const subtype = dartTypeFromJtdSchema(`${nodePath}.Item`, def.elements, {
        existingClassNames: additionalOptions.existingClassNames,
        isOptional: false,
    });
    const typeName = isNullable
        ? `List<${subtype.typeName}>?`
        : `List<${subtype.typeName}>`;
    return {
        typeName,
        fieldTemplate: fieldTemplateString(
            typeName,
            key,
            def.metadata?.description,
        ),
        constructorTemplate: additionalOptions.isOptional
            ? `this.${key}`
            : `required this.${key}`,
        fromJsonTemplate: (input) => {
            if (isNullable) {
                return `${input} is List ? 
                    // ignore: unnecessary_cast
                    (${input} as List).map((item) => ${subtype.fromJsonTemplate(
                        "item",
                    )}).toList() as ${typeName} : null`;
            }
            return `${input} is List ? 
                // ignore: unnecessary_cast
                (${input} as List).map((item) => ${subtype.fromJsonTemplate(
                    "item",
                )}).toList() as ${typeName} : <${subtype.typeName}>[]`;
        },
        toJsonTemplate: (input) => {
            return `${input}${
                isNullable ? "?" : ""
            }.map((item) => ${subtype.toJsonTemplate("item")}).toList()`;
        },
        content: subtype.content,
    };
}

interface ConversionAdditionalOptions {
    isOptional: boolean;
    existingClassNames: string[];
}

function dartScalarFromJtdScalar(
    nodePath: string,
    def: SchemaFormType,
    additionalOptions: ConversionAdditionalOptions,
): DartProperty {
    const isNullable = additionalOptions.isOptional || (def.nullable ?? false);
    const jsonKey = nodePath.split(".").pop() ?? "";
    const key = camelCase(jsonKey);
    const defaultInitializationTemplate = additionalOptions.isOptional
        ? `this.${key}`
        : `required this.${key}`;
    const { description } = def.metadata ?? {};
    const defaultToJsonTemplate = (input: string) => input;
    switch (def.type) {
        case "boolean":
            if (isNullable) {
                return {
                    typeName: "bool?",
                    fieldTemplate: fieldTemplateString(
                        "bool?",
                        key,
                        description,
                    ),
                    constructorTemplate: defaultInitializationTemplate,
                    fromJsonTemplate: (input) =>
                        `nullableTypeFromDynamic<bool>(${input})`,
                    toJsonTemplate: defaultToJsonTemplate,
                    content: "",
                };
            }
            return {
                typeName: "bool",
                fieldTemplate: fieldTemplateString("bool", key, description),
                constructorTemplate: defaultInitializationTemplate,
                fromJsonTemplate: (input) =>
                    `typeFromDynamic<bool>(${input}, false)`,
                toJsonTemplate: defaultToJsonTemplate,
                content: "",
            };
        case "float32":
        case "float64":
            if (isNullable) {
                return {
                    typeName: "double?",
                    fieldTemplate: fieldTemplateString(
                        "double?",
                        key,
                        description,
                    ),
                    constructorTemplate: defaultInitializationTemplate,
                    fromJsonTemplate: (input) =>
                        `nullableDoubleFromDynamic(${input})`,
                    toJsonTemplate: defaultToJsonTemplate,
                    content: "",
                };
            }
            return {
                typeName: "double",
                fieldTemplate: fieldTemplateString("double", key, description),
                constructorTemplate: defaultInitializationTemplate,
                fromJsonTemplate: (input) => `doubleFromDynamic(${input}, 0)`,
                toJsonTemplate: defaultToJsonTemplate,
                content: "",
            };
        case "int16":
        case "int32":
        case "int8":
        case "uint16":
        case "uint32":
        case "uint8":
            if (isNullable) {
                return {
                    typeName: "int?",
                    fieldTemplate: fieldTemplateString(
                        "int?",
                        key,
                        description,
                    ),
                    constructorTemplate: defaultInitializationTemplate,
                    fromJsonTemplate: (input) =>
                        `nullableIntFromDynamic(${input})`,
                    toJsonTemplate: defaultToJsonTemplate,
                    content: "",
                };
            }
            return {
                typeName: "int",
                fieldTemplate: fieldTemplateString(`int`, key, description),
                constructorTemplate: defaultInitializationTemplate,
                fromJsonTemplate: (input) => `intFromDynamic(${input}, 0)`,
                toJsonTemplate: defaultToJsonTemplate,
                content: "",
            };
        case "int64":
        case "uint64":
            if (isNullable) {
                return {
                    typeName: "BigInt?",
                    fieldTemplate: fieldTemplateString(
                        `BigInt?`,
                        key,
                        description,
                    ),
                    constructorTemplate: defaultInitializationTemplate,
                    fromJsonTemplate: (input) =>
                        `nullableBigIntFromDynamic(${input})`,
                    toJsonTemplate: (input) => `${input}?.toString()`,
                    content: "",
                };
            }
            return {
                typeName: "BigInt",
                fieldTemplate: fieldTemplateString(`BigInt`, key, description),
                constructorTemplate: defaultInitializationTemplate,
                fromJsonTemplate: (input) =>
                    `bigIntFromDynamic(${input}, BigInt.zero)`,
                toJsonTemplate: (input) => `${input}.toString()`,
                content: "",
            };
        case "timestamp":
            if (isNullable) {
                return {
                    typeName: "DateTime?",
                    fieldTemplate: fieldTemplateString(
                        "DateTime?",
                        key,
                        description,
                    ),
                    constructorTemplate: defaultInitializationTemplate,
                    fromJsonTemplate: (input) =>
                        `nullableDateTimeFromDynamic(${input})`,
                    toJsonTemplate: (input) =>
                        `${input}?.toUtc().toIso8601String()`,
                    content: "",
                };
            }
            return {
                typeName: "DateTime",
                fieldTemplate: fieldTemplateString(
                    "DateTime",
                    key,
                    description,
                ),
                constructorTemplate: defaultInitializationTemplate,
                fromJsonTemplate: (input) =>
                    `dateTimeFromDynamic(
      ${input},
      DateTime.fromMillisecondsSinceEpoch(0),
    )`,
                toJsonTemplate: (input) => `${input}.toUtc().toIso8601String()`,
                content: "",
            };
        case "string":
            if (isNullable) {
                return {
                    typeName: "String?",
                    fieldTemplate: fieldTemplateString(
                        "String?",
                        key,
                        description,
                    ),
                    constructorTemplate: defaultInitializationTemplate,
                    fromJsonTemplate: (input) =>
                        `nullableTypeFromDynamic<String>(${input})`,
                    toJsonTemplate: defaultToJsonTemplate,
                    content: "",
                };
            }
            return {
                typeName: "String",
                fieldTemplate: fieldTemplateString("String", key, description),
                constructorTemplate: defaultInitializationTemplate,
                fromJsonTemplate: (input) =>
                    `typeFromDynamic<String>(${input}, "")`,
                toJsonTemplate: defaultToJsonTemplate,
                content: "",
            };
        default:
            return {
                typeName: "dynamic",
                fieldTemplate: fieldTemplateString("dynamic", key, description),
                constructorTemplate: defaultInitializationTemplate,
                fromJsonTemplate: (input) => input,
                toJsonTemplate: defaultToJsonTemplate,
                content: "",
            };
    }
}

function dartEnumFromJtdSchema(
    nodePath: string,
    def: SchemaFormEnum,
    additionalOptions: ConversionAdditionalOptions,
): DartProperty {
    const isNullable = additionalOptions.isOptional || (def.nullable ?? false);
    const jsonKey = nodePath.split(".").pop() ?? "";
    const key = camelCase(jsonKey);
    let className = def.metadata?.id ? pascalCase(def.metadata.id) : undefined;
    if (!className) {
        className = pascalCase(nodePath.split(".").join("_"));
    }
    const valNames: string[] = [];
    const fieldParts: string[] = [];
    for (const val of def.enum) {
        valNames.push(`${camelCase(val)}`);
        fieldParts.push(`${camelCase(val)}("${val}")`);
    }
    let content = `enum ${className} implements Comparable<${className}> {
  ${fieldParts.join(",\n  ")};
  const ${className}(this.value);
  final String value;

  factory ${className}.fromJson(dynamic json) {
    for(final v in values) {
      if(v.value == json) {
        return v;
      }
    }
    return ${valNames[0]};
  }

  @override
  compareTo(${className} other) => name.compareTo(other.name);
}`;
    if (additionalOptions.existingClassNames.includes(className)) {
        content = "";
    } else {
        additionalOptions.existingClassNames.push(className);
    }
    return {
        typeName: className,
        fieldTemplate: fieldTemplateString(
            isNullable ? `${className}?` : className,
            key,
            def.metadata?.description,
        ),
        constructorTemplate: additionalOptions.isOptional
            ? `this.${key}`
            : `required this.${key}`,
        fromJsonTemplate: (input) => {
            if (isNullable) {
                return `${input} is Map<String, dynamic> ? ${className}.fromJson(${input}) : null`;
            }
            return `${className}.fromJson(${input})`;
        },
        toJsonTemplate: (input) => `${input}${isNullable ? "?" : ""}.value`,
        content,
    };
}

function dartMapFromJtdSchema(
    nodePath: string,
    def: SchemaFormValues,
    additionalOptions: ConversionAdditionalOptions,
): DartProperty {
    const isNullable = additionalOptions.isOptional || (def.nullable ?? false);
    const jsonKey = nodePath.split(".").pop() ?? "";
    const key = camelCase(jsonKey);
    const innerType = dartTypeFromJtdSchema(`${nodePath}.Value`, def.values, {
        existingClassNames: additionalOptions.existingClassNames,
        isOptional: false,
    });
    const typeName = `Map<String, ${innerType.typeName}>${
        isNullable ? "?" : ""
    }`;
    return {
        typeName: isNullable
            ? `Map<String, ${innerType.typeName}>?`
            : `Map<String, ${innerType.typeName}>`,
        fieldTemplate: fieldTemplateString(
            typeName,
            key,
            def.metadata?.description,
        ),
        constructorTemplate: additionalOptions.isOptional
            ? `this.${key}`
            : `required this.${key}`,
        fromJsonTemplate: (input) => `${input} is Map<String, dynamic>
          ? (${input} as Map<String, dynamic>).map(
              (key, value) => MapEntry(key, ${innerType.fromJsonTemplate(
                  "value",
              )}))
          : <String, ${innerType.typeName}>{}`,
        toJsonTemplate: (input) =>
            `${input}${
                isNullable ? "?" : ""
            }.map((key, value) => MapEntry(key, ${innerType.toJsonTemplate(
                "value",
            )}))`,
        content: innerType.content,
    };
}

function dartSealedClassFromJtdSchema(
    nodePath: string,
    def: SchemaFormDiscriminator,
    additionalOptions: ConversionAdditionalOptions,
): DartProperty {
    const className = def.metadata?.id
        ? pascalCase(def.metadata?.id)
        : pascalCase(nodePath.split(".").join("_"));
    const isNullable = additionalOptions.isOptional || (def.nullable ?? false);
    const jsonKey = nodePath.split(".").pop() ?? "";
    const key = camelCase(jsonKey);
    const discriminatorJsonKey = def.discriminator;
    const discriminatorKey = camelCase(def.discriminator);
    const fromJsonCaseParts: string[] = [];
    const childContentParts: string[] = [];
    Object.keys(def.mapping).forEach((discKeyValue) => {
        const childDef = def.mapping[discKeyValue];
        if (!isSchemaFormProperties(childDef)) {
            return;
        }
        const child = dartClassFromJtdSchema(
            `${nodePath}.${camelCase(discKeyValue.toLowerCase())}`,
            childDef,
            {
                isOptional: false,
                existingClassNames: additionalOptions.existingClassNames,
                discriminatorOptions: {
                    discriminatorKey,
                    discriminatorValue: discKeyValue,
                    discriminatorParentClassName: className,
                },
            },
        );
        fromJsonCaseParts.push(`case "${discKeyValue}":
        return ${child.typeName}.fromJson(json);`);
        childContentParts.push(child.content);
    });
    const description = def.metadata?.description
        ? `/// ${def.metadata.description}`
        : "";
    const content = `${description}
sealed class ${className} {
  final String ${discriminatorKey};
  const ${className}({
    required this.${discriminatorKey},
  });
  factory ${className}.fromJson(Map<String, dynamic> json) {
    if(json["${discriminatorJsonKey}"] is! String) {
      throw Exception(
        "Unable to decode ${className}. Expected String from \\"${discriminatorJsonKey}\\". Received \${json["${discriminatorJsonKey}"]}}",
      );
    }
    switch (json["${discriminatorJsonKey}"]) {
      ${fromJsonCaseParts.join("\n      ")}
    }
    throw Exception(
        "Unable to decode ${className}. \\"\${json["${discriminatorJsonKey}"]}\\" doesn't match any of the accepted discriminator values.",
    );
  }
  Map<String, dynamic> toJson();
}
${childContentParts.join("\n")}`;
    const typeName = `${className}${isNullable ? "?" : ""}`;
    return {
        typeName,
        fieldTemplate: fieldTemplateString(
            typeName,
            key,
            def.metadata?.description,
        ),
        constructorTemplate: additionalOptions.isOptional
            ? `this.${key}`
            : `required this.${key}`,
        fromJsonTemplate: (input) => {
            if (isNullable) {
                return `${input} is Map<String, dynamic> ? ${className}.fromJson(${input}) : null`;
            }
            return `${className}.fromJson(${input})`;
        },
        toJsonTemplate: (input) => {
            if (isNullable) {
                return `${input}?.toJson()`;
            }
            return `${input}.toJson()`;
        },
        content,
    };
}
