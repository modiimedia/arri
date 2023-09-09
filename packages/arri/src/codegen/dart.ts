import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { camelCase, pascalCase } from "scule";
import { defineClientGeneratorPlugin } from "./plugin";
import {
    type ApplicationDef,
    type ServiceDef,
    isProcedureDef,
    type ProcedureDef,
    unflattenProcedures,
    isServiceDef,
} from "./utils";
import {
    JsonSchemaObject,
    JsonSchemaTypeValue,
    isJsonSchemaArray,
    isJsonSchemaEnum,
    isJsonSchemaNullType,
    isJsonSchemaObject,
    isJsonSchemaRecord,
    isJsonSchemaScalarType,
} from "json-schema-to-jtd";

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
                    return;
                }
                const result = createDartClient(def, {
                    clientName: options.clientName,
                });
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

/**
 * Tracking which model names we've already created classes for
 * to prevent duplication
 */
let generatedModels: string[] = [];

interface CreateClientOptions {
    clientName: string;
}

export function createDartClient(
    appDef: ApplicationDef,
    opts: CreateClientOptions = { clientName: "Client" },
) {
    generatedModels = [];
    const { models, procedures } = appDef;
    const serviceParts: {
        name: string;
        key: string;
        content: string;
    }[] = [];
    const procedureParts: string[] = [];
    const services = unflattenProcedures(procedures);
    Object.keys(services).forEach((k) => {
        const item = services[k];
        if (isServiceDef(item)) {
            const serviceName = pascalCase(`${opts.clientName}_${k}_service`);
            serviceParts.push({
                name: serviceName,
                key: k,
                content: dartServiceFromServiceDefinition(
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    serviceName,
                    item,
                    opts,
                ),
            });
            return;
        }
        procedureParts.push(dartProcedureFromServiceDefinition(k, item, opts));
    });
    const endpoints: Record<string, string> = {};
    Object.keys(procedures).forEach((key) => {
        const rpc = procedures[key];
        endpoints[rpc.path] = rpc.method;
    });
    const modelParts: string[] = [];
    Object.keys(models).forEach((key) => {
        const model = models[key];

        const typeName = pascalCase(key);
        const objModel = model;
        if (!generatedModels.includes(typeName)) {
            modelParts.push(
                dartModelFromJsonSchema(`${pascalCase(key)}`, objModel, opts),
            );
            generatedModels.push(typeName);
        }
    });

    return `// This code was autogenerated by Arri. Do not modify directly.
// For additional documentation visit http://github.com/modiimedia/arri
import "dart:convert";
import "package:arri_client/arri_client.dart";

class ${opts.clientName} {
  final String _baseUrl;
  final Map<String, String> _headers;
  const ${opts.clientName}({
    String baseUrl = "",
    Map<String, String> headers = const {},
  }): _headers = headers,
    _baseUrl = baseUrl;
  ${procedureParts.join("\n")}
  ${serviceParts
      .map(
          (service) => `${service.name} get ${service.key} {
    return ${service.name}(
      baseUrl: _baseUrl, headers: _headers,
    );
  }`,
      )
      .join("\n  ")}
}
${serviceParts.map((item) => item.content).join("\n")}
${modelParts.join("\n")}

enum ${opts.clientName}Endpoints implements Comparable<${
        opts.clientName
    }Endpoints>, ArriEndpoint {
  ${Object.keys(endpoints)
      .map(
          (key) => `${camelCase(key.split("/").join("_"))}(
        path: "${key}",
        method: HttpMethod.${endpoints[key]},
      )`,
      )
      .join(",\n  ")};

  const ${opts.clientName}Endpoints({
    required this.path, required this.method,
  });
  @override
  final String path;
  @override
  final HttpMethod method;

  @override
  compareTo(${opts.clientName}Endpoints other) => name.compareTo(other.name);
}`;
}

export function dartServiceFromServiceDefinition(
    name: string,
    def: ServiceDef,
    opts: CreateClientOptions,
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
        if (isProcedureDef(item)) {
            rpcParts.push(dartProcedureFromServiceDefinition(key, item, opts));
            return;
        }
        const nameParts = name.split("Service");
        nameParts.pop();
        const subServiceName = pascalCase(
            `${nameParts.join("")}_${key}_Service`,
        );
        const subService = dartServiceFromServiceDefinition(
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
    return `class ${serviceName} {
  final String _baseUrl;
  final Map<String, String> _headers;
  const ${serviceName}({
    String baseUrl = "",
    Map<String, String> headers = const {},
  }): _baseUrl = baseUrl,
  _headers = headers;
  ${subServiceParts
      .map(
          (sub) => `${sub.name} get ${sub.key} {
    return ${sub.name}(
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

export function dartProcedureFromServiceDefinition(
    key: string,
    def: ProcedureDef,
    opts: CreateClientOptions,
): string {
    let returnType:
        | `Future<String>`
        | "Future<int>"
        | "Future<number>"
        | "Future<void>"
        | `Future<${string}>` = `Future<String>`;
    let returnTypeName = "String";
    if (def.response) {
        returnType = `Future<${def.response}>`;
        returnTypeName = `${def.response}`;
    } else {
        returnType = "Future<void>";
    }
    let paramsInput = "";
    if (def.params) {
        paramsInput = `${def.params} params`;
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
            responseParser = `(body) => ${returnTypeName}.fromJson(json.decode(body))`;
            break;
    }
    return `${returnType} ${key}(${paramsInput}) {
    return parsedArriRequest(
      "$_baseUrl${def.path}",
      method: HttpMethod.${def.method},
      headers: _headers,
      params: ${paramsInput.length ? `params.toJson()` : "null"},
      parser: ${responseParser},
    );
  }`;
}

export function dartModelFromJsonSchema(
    modelName: string,
    schema: JsonSchemaObject,
    opts: CreateClientOptions,
): string {
    const modelDisplayName: string = pascalCase(`${modelName}`);
    const fields: Array<{ type: string; name: string; jsonKey: string }> = [];
    const subModelParts: string[] = [];
    Object.entries(schema.properties ?? {}).forEach(([key, val]) => {
        if (typeof val !== "object") {
            return;
        }
        const [dartType, subTypes] = dartPropertyTypeFromSchema(
            modelName,
            key,
            schema,
            opts,
        );
        if (subTypes?.length) {
            for (const sub of subTypes) {
                subModelParts.push(sub);
            }
        }
        fields.push({ type: dartType, name: camelCase(key), jsonKey: key });
        if (!isDartType(dartType) && isJsonSchemaObject(val)) {
            if (val.$id && generatedModels.includes(val.$id)) {
                return;
            }
            const subModelName = val.$id
                ? pascalCase(val.$id)
                : pascalCase(dartType.replace("?", ""));
            subModelParts.push(
                dartModelFromJsonSchema(subModelName, val, opts),
            );
            generatedModels.push(subModelName);
        }
    });
    return `class ${modelDisplayName} {
  ${fields.map((field) => `final ${field.type} ${field.name};`).join("\n  ")}
  const ${modelDisplayName}({
    ${fields
        .map((field) =>
            field.type.includes("?")
                ? `this.${field.name},`
                : `required this.${field.name},`,
        )
        .join("\n    ")}
  });
  factory ${modelDisplayName}.fromJson(Map<String, dynamic> json) {
    return ${modelDisplayName}(
      ${fields
          .map(
              (field) =>
                  `${dartParsedJsonField(
                      field.name,
                      field.jsonKey,
                      field.type,
                  )},`,
          )
          .join("\n      ")}
    );
  }
  Map<String, dynamic> toJson() {
    return {
      ${fields
          .map((field) => {
              const isNullable = field.type.endsWith("?");
              const typeName = field.type.replace("?", "");
              if (isDartTypeWithNullables(field.type)) {
                  const transformer = transformers[typeName as DartType];
                  return transformer.toJsonBody(
                      field.name,
                      field.jsonKey,
                      isNullable,
                  );
              }
              if (field.type.includes("List<")) {
                  return classListTransformer(typeName).toJsonBody(
                      field.name,
                      field.jsonKey,
                      isNullable,
                  );
              }
              if (field.type.includes("Map<")) {
                  return `"${field.jsonKey}": ${field.name}`;
              }
              return classTransformer(typeName, isNullable).toJsonBody(
                  field.name,
                  field.jsonKey,
                  isNullable,
              );
          })
          .join(",\n      ")},
    };
  }
  ${modelDisplayName} copyWith({
    ${fields
        .map((field) => `${field.type.replace("?", "")}? ${field.name},`)
        .join("\n    ")}
  }) {
    return ${modelDisplayName}(
      ${fields
          .map((field) => `${field.name}: ${field.name} ?? this.${field.name},`)
          .join("\n      ")}
    );
  }
}

${subModelParts.join("\n")}`;
}

export function dartPropertyTypeFromSchema(
    objectName: string,
    propertyName: string,
    schema: JsonSchemaObject,
    opts: CreateClientOptions,
): [DartType | string, string[] | undefined] {
    const prop = schema.properties?.[propertyName];
    const isOptional = !schema.required?.includes(propertyName);
    let finalType = "";
    const subTypes: string[] = [];
    if (isJsonSchemaEnum(prop)) {
        const enumName: string = pascalCase(`${objectName}_${propertyName}`);
        finalType = isOptional ? `${enumName}?` : enumName;
        const options: Array<{
            name: string;
            type: DartType;
            value: string | number;
        }> = [];
        for (const opt of prop.anyOf) {
            if (opt.type === "string") {
                options.push({
                    name: camelCase(opt.const.toString()),
                    type: "String",
                    value: opt.const,
                });
            }
            if (opt.type === "number" || opt.type === "integer") {
                options.push({
                    name: camelCase(
                        `num_${opt.const}`.split(".").join("Point"),
                    ),
                    type: opt.type === "number" ? "double" : "int",
                    value: opt.const,
                });
            }
        }
        subTypes.push(`enum ${enumName} implements Comparable<${enumName}> {
  ${options
      .map(
          (opt) =>
              `${opt.name}(${
                  opt.type === "String" ? `"${opt.value}"` : opt.value
              })`,
      )
      .join(",\n  ")};
  const ${enumName}(this.value);
  final dynamic value;

  @override
  compareTo(${enumName} other) => name.compareTo(other.name);

  factory ${enumName}.fromJson(dynamic input) {
    for(final val in values) {
      if(val.value == input) {
        return val;
      }
    }
    return ${options[0].name};
  }

  dynamic toJson() {
    return value;
  }
}`);
        return [finalType, subTypes];
    }
    if (isJsonSchemaNullType(prop)) {
        finalType = "null";
        return [finalType, subTypes];
    }
    if (isJsonSchemaScalarType(prop)) {
        switch (prop.type) {
            case "string":
                finalType = isOptional ? "String?" : "String";
                break;
            case "integer":
                finalType = isOptional ? "int?" : "int";
                break;
            case "number":
                finalType = isOptional ? "double?" : "double";
                break;
            case "Date":
                finalType = isOptional ? "DateTime?" : "DateTime";
                break;
            case "boolean":
                finalType = isOptional ? "bool?" : "bool";
                break;
            default:
                break;
        }
    }

    if (isJsonSchemaObject(prop)) {
        const joinedPropName = prop.$id
            ? pascalCase(prop.$id)
            : (pascalCase(`${objectName}_${propertyName}`) as string);
        finalType = isOptional ? `${joinedPropName}?` : joinedPropName;
    }
    if (isJsonSchemaRecord(prop)) {
        finalType = isOptional
            ? `Map<dynamic, dynamic>?`
            : "Map<dynamic, dynamic>";
    }
    if (isJsonSchemaArray(prop)) {
        const item = prop.items;

        const type = item.type;
        if (typeof type !== "string") {
            throw new Error(
                "Union types are not supported in arrays at this time",
            );
        }
        switch (type) {
            case "string":
                finalType = isOptional ? "List<String>?" : "List<String>";
                break;
            case "integer":
                finalType = isOptional ? "List<int>?" : "List<int>";
                break;
            case "number":
                finalType = isOptional ? "List<double>?" : "List<double>";
                break;
            case "null":
                finalType = isOptional ? "List<null>?" : "List<null>";
                break;
            case "boolean":
                finalType = isOptional ? "List<bool>?" : "List<bool>";
                break;
            case "Date":
                finalType = isOptional ? "List<DateTime>?" : "List<DateTime>";
                break;
            case "object": {
                if (isJsonSchemaObject(item)) {
                    const subTypeName =
                        item.$id ??
                        pascalCase(`${objectName}_${propertyName}_item`);
                    if (!generatedModels.includes(subTypeName)) {
                        const model = dartModelFromJsonSchema(
                            subTypeName,
                            item,
                            opts,
                        );
                        subTypes.push(model);
                        generatedModels.push(subTypeName);
                    }
                    finalType = isOptional
                        ? `List<${subTypeName}>?`
                        : `List<${subTypeName}>`;
                } else {
                    finalType = isOptional
                        ? `Map<dynamic, dynamic>?`
                        : `Map<dynamic, dynamic>`;
                }
                break;
            }
        }
    }
    return [finalType, subTypes.length ? subTypes : undefined];
}

export function dartParsedJsonField(
    fieldName: string,
    jsonKey: string,
    dartType: string,
) {
    if (isDartTypeWithNullables(dartType)) {
        switch (dartType) {
            case "String":
                return transformers.String.fromJsonBody(
                    fieldName,
                    jsonKey,
                    '""',
                );
            case "String?":
                return transformers.String.fromJsonBody(
                    fieldName,
                    jsonKey,
                    "null",
                );
            case "bool":
                return transformers.bool.fromJsonBody(
                    fieldName,
                    jsonKey,
                    "false",
                );
            case "bool?":
                return transformers.bool.fromJsonBody(
                    fieldName,
                    jsonKey,
                    "null",
                );
            case "double":
                return transformers.double.fromJsonBody(
                    fieldName,
                    jsonKey,
                    "0.0",
                );
            case "double?":
                return transformers.double.fromJsonBody(
                    fieldName,
                    jsonKey,
                    "null",
                );
            case "int":
                return transformers.int.fromJsonBody(fieldName, jsonKey, "0");
            case "int?":
                return transformers.int.fromJsonBody(
                    fieldName,
                    jsonKey,
                    "null",
                );
            case "null":
                return transformers.null.fromJsonBody(fieldName, jsonKey, "");
            case "DateTime":
                return transformers.DateTime.fromJsonBody(
                    fieldName,
                    jsonKey,
                    "DateTime(0)",
                );
            case "DateTime?":
                return transformers.DateTime.fromJsonBody(
                    fieldName,
                    jsonKey,
                    "null",
                );
            case "List<String>":
            case "List<bool>":
            case "List<double>":
            case "List<int>":
            case "List<null>":
                return defaultListFromJsonBody(
                    fieldName,
                    jsonKey,
                    dartType
                        .replace("List<", "")
                        .replace(">", "") as DartBaseType,
                    "[]",
                );
            default:
                return `${fieldName}: json["${jsonKey}"] is ${dartType.replace(
                    "?",
                    "",
                )} ? json["${jsonKey}"] : null`;
        }
    }
    if (dartType.includes("List<")) {
        const innerType = dartType
            .replace("List<", "")
            .replace(">", "")
            .replace("?", "");

        return classListTransformer(innerType).fromJsonBody(
            fieldName,
            jsonKey,
            dartType.endsWith("?") ? "null" : "[]",
        );
    }
    if (dartType.includes("Map<")) {
        return `${fieldName}: json["${jsonKey}"] is Map ? json["${jsonKey}"] : {}`;
    }
    const classType = dartType.split("?").join("").trim();
    return classTransformer(classType, dartType.endsWith("?")).fromJsonBody(
        fieldName,
        jsonKey,
        classType,
    );
}

type TypeMap = Record<JsonSchemaTypeValue, string | undefined>;

const dartTypeMap = {
    integer: "int",
    bigint: "int",
    number: "double",
    string: "String",
    boolean: "bool",
    null: "null",
    Date: "DateTime",
    object: undefined,
    list: undefined,
    // eslint-disable-next-line object-shorthand
    undefined: undefined,
    array: undefined,
    Uint8Array: "Uint8List",
} as const satisfies TypeMap;

interface DartMappedType {
    classBody?: string;
    fromJsonBody: (key: string, jsonKey: string, fallback: string) => string;
    toJsonBody: (key: string, jsonKey: string, isNullable?: boolean) => string;
}

export const transformers: Record<DartType, DartMappedType> = {
    null: {
        fromJsonBody: (_) => `null`,
        toJsonBody: defaultToJsonBody,
    },
    int: {
        fromJsonBody: (key, jsonKey, fallback) =>
            fallback === "null"
                ? `${key}: nullableIntFromDynamic(json["${jsonKey}"])`
                : `${key}: intFromDynamic(json["${jsonKey}"], ${fallback})`,
        toJsonBody: defaultToJsonBody,
    },
    double: {
        fromJsonBody: (key, jsonKey, fallback) =>
            fallback === "null"
                ? `${key}: nullableDoubleFromDynamic(json["${jsonKey}"])`
                : `${key}: doubleFromDynamic(json["${jsonKey}"], ${fallback})`,
        toJsonBody: defaultToJsonBody,
    },
    String: {
        fromJsonBody: (key, jsonKey, fallback) =>
            defaultFromJsonBody(key, jsonKey, "String", fallback),
        toJsonBody: defaultToJsonBody,
    },
    bool: {
        fromJsonBody: (key, jsonKey, fallback) =>
            defaultFromJsonBody(key, jsonKey, "bool", fallback),
        toJsonBody: defaultToJsonBody,
    },
    DateTime: {
        fromJsonBody: (key, jsonKey, fallback) =>
            fallback === "null"
                ? `${key}: nullableDateTimeFromDynamic(json["${jsonKey}"])`
                : `${key}: dateTimeFromDynamic(json["${jsonKey}"], ${fallback})`,
        toJsonBody: (key, jsonKey, isNullable) =>
            `"${jsonKey}": ${key}${isNullable ? "?" : ""}.toIso8601String()`,
    },
    "List<null>": {
        fromJsonBody: (key, jsonKey, fallback) =>
            defaultListFromJsonBody(key, jsonKey, "null", fallback),
        toJsonBody: defaultToJsonBody,
    },
    "List<int>": {
        fromJsonBody: (key, jsonKey, fallback) =>
            defaultListFromJsonBody(key, jsonKey, "int", fallback),
        toJsonBody: defaultToJsonBody,
    },
    "List<double>": {
        fromJsonBody: (key, jsonKey, fallback) =>
            defaultListFromJsonBody(key, jsonKey, "double", fallback),
        toJsonBody: defaultToJsonBody,
    },
    "List<String>": {
        fromJsonBody: (key, jsonKey, fallback) =>
            defaultListFromJsonBody(key, jsonKey, "String", fallback),
        toJsonBody: defaultToJsonBody,
    },
    "List<bool>": {
        fromJsonBody: (key, jsonKey, fallback) =>
            defaultListFromJsonBody(key, jsonKey, "bool", fallback),
        toJsonBody: defaultToJsonBody,
    },
    "List<DateTime>": {
        fromJsonBody: (
            key,
            jsonKey,
            fallback,
        ) => `${key}: json["${jsonKey}"] is List<String> ?
            (json["${jsonKey}"] as List<String>)
                .map((item) => DateTime.parse(item)).toList() : ${fallback}`,
        toJsonBody: (key, jsonKey, isNullable) =>
            `"${jsonKey}": ${key}${
                isNullable ? "?" : ""
            }.map((val) => val.toIso8601String()).toList()`,
    },
    Uint8List: {
        fromJsonBody: (key, jsonKey, fallback) =>
            `${key}: json["${jsonKey}"] is List ? Uint8List.fromList(json["${jsonKey}"]) : ${fallback}`,
        toJsonBody: (key, jsonKey, isNullable) =>
            `"${jsonKey}": ${key}${isNullable ? "?" : ""}.toList()`,
    },
    "List<Uint8List>": {
        fromJsonBody: (key, jsonKey, fallback) =>
            `${key}: json["${jsonKey}"] is List && (json["${jsonKey}"] as List).isNotEmpty && (json["${jsonKey}"] as List).first is List ? json["${jsonKey}"] : ${fallback}`,
        toJsonBody: (key, jsonKey, isNullable) =>
            `"${jsonKey}": ${key}${
                isNullable ? "?" : ""
            }.map((val) => val.toList()).toList()`,
    },
};

function defaultFromJsonBody(
    key: string,
    jsonKey: string,
    typename: DartType,
    fallback: string,
) {
    if (fallback === "null") {
        return `${key}: nullableTypeFromDynamic<${typename}>(json["${jsonKey}"])`;
    }
    return `${key}: typeFromDynamic<${typename}>(json["${jsonKey}"], ${fallback})`;
}
function defaultListFromJsonBody(
    key: string,
    jsonKey: string,
    typename: DartBaseType,
    fallback: string,
) {
    return `${key}: json["${jsonKey}"] is List<${typename}> ? json["${jsonKey}"] : ${fallback}`;
}
function defaultToJsonBody(key: string, jsonKey: string) {
    return `"${jsonKey}": ${key}`;
}

export const classTransformer = (
    typename: string,
    nullable: boolean,
): DartMappedType => {
    return {
        fromJsonBody: (key, jsonKey, fallback) => {
            if (nullable) {
                return `${key}: json["${jsonKey}"] is Map<String, dynamic> ? 
                ${typename}.fromJson(json["${jsonKey}"]) : null`;
            }
            return `${key}: ${typename}.fromJson(json["${jsonKey}"])`;
        },
        toJsonBody: (key, jsonKey, isNullable) => {
            return `"${jsonKey}": ${key}${isNullable ? "?" : ""}.toJson()`;
        },
    };
};
export const classListTransformer = (typename: string): DartMappedType => {
    return {
        fromJsonBody: (key, jsonKey, fallback) => {
            return `${key}: json["${jsonKey}"] is List ? 
                (json["${jsonKey}"] as List<Map<String, dynamic>>)
                    .map((val) => ${typename}.fromJson(val)).toList() : ${fallback}`;
        },
        toJsonBody: (key, jsonKey, isNullable) =>
            `"${jsonKey}": ${key}${
                isNullable ? "?" : ""
            }.map((val) => val.toJson()).toList()`,
    };
};

export type DartBaseType = Exclude<
    (typeof dartTypeMap)[keyof typeof dartTypeMap],
    undefined
>;
export type DartType = DartBaseType | `List<${DartBaseType}>`;
export type DartTypeWithNullables = DartType | Exclude<`${DartType}?`, "null?">;
export function isDartType(input: any): input is DartType {
    if (typeof input !== "string") {
        return false;
    }
    for (const val of Object.values(dartTypeMap)) {
        if (input === val) {
            return true;
        }
        if (input.replace("List<", "").replace(">", "") === val) {
            return true;
        }
    }
    return false;
}
export function isDartTypeWithNullables(
    input: any,
): input is DartTypeWithNullables {
    if (typeof input !== "string") {
        return false;
    }
    for (const val of Object.values(dartTypeMap)) {
        if (input.replace("?", "") === val) {
            return true;
        }
        if (
            input.replace("?", "").replace("List<", "").replace(">", "") === val
        ) {
            return true;
        }
    }
    return false;
}
