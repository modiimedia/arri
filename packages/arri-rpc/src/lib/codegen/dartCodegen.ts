import { type TEnum, type TObject, type TSchema } from "@sinclair/typebox";
import type { RpcMethod } from "../arri-rpc";
import { camelCase, pascalCase } from "scule";

export interface ProcedureDefinition {
    path: string;
    method: RpcMethod;
    params: string;
    response: string;
}

export type ServiceDefinition = Record<string, ProcedureDefinition>;

export interface ApplicationDefinition {
    services: Record<string, ServiceDefinition>;
    models: Record<string, TSchema>;
}

export function createTypescriptClient(appDef: ApplicationDefinition) {}

const dartTypeMap = {
    integer: "int",
    number: "double",
    string: "String",
    boolean: "bool",
    null: "null",
    Date: "DateTime",
    object: undefined,
    list: undefined,
} as const;

export type DartBaseType = Exclude<
    (typeof dartTypeMap)[keyof typeof dartTypeMap],
    undefined
>;
export type DartType =
    | DartBaseType
    | `${DartBaseType}?`
    | `List<${DartBaseType}>`
    | `List<${DartBaseType}>?`;
export function isDartType(input: any): input is DartType {
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
export function dartServiceFromServiceDefinition(
    name: string,
    def: ServiceDefinition,
    prefix = ""
) {
    const rpcParts: string[] = [];
    const serviceName = `${name}`;
    Object.keys(def).forEach((key) => {
        const rpc = def[key];
        const returnType = rpc.response.length
            ? `Future<${prefix}${rpc.response}>`
            : "Future<String>";
        const paramsInput = rpc.params.length
            ? `${prefix}${rpc.params} params`
            : "";
        const responseParser = rpc.response.length
            ? `${prefix}${rpc.response}.fromJson(json.decode(body))`
            : null;
        rpcParts.push(`${returnType} ${key}(${paramsInput}) {
    return parsedRequest(
      "$baseUrl${rpc.path}",
      method: HttpMethod.${rpc.method},
      headers: headers,
      params: ${rpc.params.length ? `params.toJson()` : "null"},
      parser: (body) => ${responseParser ?? "body"},
    );
  }`);
    });
    return `class ${serviceName} {
  final String baseUrl;
  final Map<String, String> headers;
  const ${serviceName}({
    this.baseUrl = "",
    this.headers = const {},
  });
  ${rpcParts.join("\n  ")}
}`;
}

export function dartParsedJsonField(fieldName: string, dartType: string) {
    if (isDartType(dartType)) {
        switch (dartType) {
            case "String":
                return `${fieldName}: json["${fieldName}"] is String ? json["${fieldName}"] : ""`;
            case "bool":
                return `${fieldName}: json["${fieldName}"] is bool ? json["${fieldName}"] : false`;
            case "double":
                return `${fieldName}: json["${fieldName}"] is double ? json["${fieldName}"] : 0.0`;
            case "int":
                return `${fieldName}: json["${fieldName}"] is int ? json["${fieldName}"] : 0`;
            case "null":
                return `${fieldName}: null`;
            case "DateTime":
            case "DateTime?": {
                const fallback = dartType.endsWith("?")
                    ? "null"
                    : "DateTime(0)";
                return `${fieldName}: json["${fieldName}"] is String ? DateTime.parse(json["${fieldName}"]) : ${fallback}`;
            }
            case "List<String>":
            case "List<bool>":
            case "List<double>":
            case "List<int>":
            case "List<null>":
                return `${fieldName}: json["${fieldName}"] is ${dartType} ? json["${fieldName}"] : []`;
            default:
                return `${fieldName}: json["${fieldName}"] is ${dartType.replace(
                    "?",
                    ""
                )} ? json["${fieldName}"] : null`;
        }
    }
    if (dartType.includes("List<")) {
        const fallback = dartType.endsWith("?") ? "null" : "[]";
        const innerType = dartType
            .replace("List<", "")
            .replace(">", "")
            .replace("?", "");
        return `${fieldName}: json["${fieldName}"] is List<Map<String, dynamic>> ? 
          (json["${fieldName}"] as List<Map<String, dynamic>>)
            .map((val) => ${innerType}.fromJson(val)).toList() : ${fallback}`;
    }
    if (dartType.endsWith("?")) {
        return `${fieldName}: json["${fieldName}"] == null ? null : ${dartType.replace(
            "?",
            ""
        )}.fromJson(json["${fieldName}"])`;
    }
    return `${fieldName}: ${dartType}.fromJson(json["${fieldName}"])`;
}

const generatedModels: string[] = [];

export function dartPropertyType(
    objectName: string,
    propertyName: string,
    schema: TObject
): [DartType | string, string[] | undefined] {
    const prop = schema.properties[propertyName];
    const isOptional = !schema.required?.includes(propertyName);
    let finalType = "";
    const subTypes: string[] = [];
    if ((prop as TEnum).anyOf) {
        const enumName: string = pascalCase(`${objectName}_${propertyName}`);
        finalType = isOptional ? `${enumName}?` : enumName;
        const options: Array<{
            name: string;
            type: DartType;
            value: string | number;
        }> = [];
        for (const opt of (prop as TEnum).anyOf) {
            if (opt.type === "string") {
                options.push({
                    name: opt.const.toString(),
                    type: "String",
                    value: opt.const,
                });
            }
            if (opt.type === "number") {
                options.push({
                    name: camelCase(
                        `num_${opt.const}`.split(".").join("Point")
                    ),
                    type: "double",
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
              })`
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
    if (typeof prop.type === "string") {
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
            case "null":
                finalType = "null";
                break;
            case "Date":
                finalType = isOptional ? "DateTime?" : "DateTime";
                break;
            case "object": {
                const joinedPropName = pascalCase(
                    `${objectName}_${propertyName}`
                ) as string;
                finalType = isOptional ? `${joinedPropName}?` : joinedPropName;
                break;
            }
            case "boolean":
                finalType = isOptional ? "bool?" : "bool";
                break;
            case "array": {
                const item = prop.items;
                const type = item.type;
                if (typeof type !== "string") {
                    throw new Error(
                        "Union types are not supported in arrays at this time"
                    );
                }
                switch (type) {
                    case "string":
                        finalType = isOptional
                            ? "List<String>?"
                            : "List<String>";
                        break;
                    case "integer":
                        finalType = isOptional ? "List<int>?" : "List<int>";
                        break;
                    case "number":
                        finalType = isOptional
                            ? "List<double>?"
                            : "List<double>";
                        break;
                    case "null":
                        finalType = isOptional ? "List<null>?" : "List<null>";
                        break;
                    case "boolean":
                        finalType = isOptional ? "List<bool>?" : "List<bool>";
                        break;
                    case "Date":
                        finalType = isOptional
                            ? "List<DateTime>?"
                            : "List<DateTime>";
                        break;
                    case "object": {
                        const subTypeName =
                            (item as TObject).$id ??
                            pascalCase(`${objectName}_${propertyName}_item`);

                        const model = dartModelFromJsonSchema(
                            subTypeName,
                            item
                        );
                        if (!generatedModels.includes(subTypeName)) {
                            subTypes.push(model);
                            generatedModels.push(subTypeName);
                        }
                        finalType = isOptional
                            ? `List<${subTypeName}>?`
                            : `List<${subTypeName}>`;
                        break;
                    }
                }
                break;
            }
            default:
                break;
        }
    }
    return [finalType, subTypes.length ? subTypes : undefined];
}

export function dartModelFromJsonSchema(name: string, schema: TObject): string {
    const fields: Array<{ type: string; name: string }> = [];
    const subModelParts: string[] = [];
    Object.entries(schema.properties).forEach(([key, val]) => {
        const [dartType, subTypes] = dartPropertyType(name, key, schema);

        if (subTypes?.length) {
            for (const sub of subTypes) {
                subModelParts.push(sub);
            }
        }
        fields.push({ type: dartType, name: key });
        if (!isDartType(dartType) && val.type === "object") {
            subModelParts.push(
                dartModelFromJsonSchema(
                    dartType.replace("?", ""),
                    val as TObject
                )
            );
        }
    });
    return `class ${name} {
  ${fields.map((field) => `final ${field.type} ${field.name};`).join("\n  ")}
  const ${name}({
    ${fields
        .map((field) =>
            field.type.includes("?")
                ? `this.${field.name},`
                : `required this.${field.name},`
        )
        .join("\n    ")}
  });
  factory ${name}.fromJson(Map<String, dynamic> json) {
    return ${name}(
      ${fields
          .map((field) => `${dartParsedJsonField(field.name, field.type)},`)
          .join("\n      ")}
    );
  }
  Map<String, dynamic> toJson() {
    return {
      ${fields
          .map((field) => {
              if (isDartType(field.type)) {
                  if (field.type.includes("DateTime")) {
                      const isNullable = field.type.endsWith("?");
                      return `"${field.name}": ${field.name}${
                          isNullable ? "?" : ""
                      }.toIso8601String()`;
                  }
                  return `"${field.name}": ${field.name}`;
              }
              if (field.type.includes("List<")) {
                  const isNullable = field.type.endsWith("?");
                  return `"${field.name}": ${field.name}${
                      isNullable ? "?" : ""
                  }.map((val) => val.toJson()).toList()`;
              }
              if (field.type.endsWith("?")) {
                  return `"${field.name}": ${field.name}?.toJson()`;
              }
              return `"${field.name}": ${field.name}.toJson()`;
          })
          .join(",\n      ")},
    };
  }
  ${name} copyWith({
    ${fields
        .map((field) => `${field.type.replace("?", "")}? ${field.name},`)
        .join("\n    ")}
  }) {
    return ${name}(
      ${fields
          .map((field) => `${field.name}: ${field.name} ?? this.${field.name},`)
          .join("\n      ")}
    );
  }
}

${subModelParts.join("\n")}`;
}

export function createDartClient(
    appDef: ApplicationDefinition,
    prefix = "Client"
) {
    const { models, services } = appDef;
    const serviceParts: Array<{ name: string; key: string; content: string }> =
        [];
    Object.keys(services).forEach((k) => {
        const service = services[k];
        const serviceName = `${prefix}${pascalCase(k)}Service`;
        serviceParts.push({
            name: serviceName,
            key: k,
            content: dartServiceFromServiceDefinition(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `${prefix}${pascalCase(k)}Service`,
                service,
                prefix
            ),
        });
    });

    const modelParts: string[] = [];
    Object.keys(models).forEach((key) => {
        const model = models[key];
        if (model.type === "object") {
            const typeName = `${prefix}${pascalCase(key)}`;
            const objModel = model as TObject;
            if (!generatedModels.includes(typeName)) {
                modelParts.push(
                    dartModelFromJsonSchema(
                        `${prefix}${pascalCase(key)}`,
                        objModel
                    )
                );
                generatedModels.push(typeName);
            }
        }
    });
    return `// This code was autogenerated by arri. Do not modify directly.
import "dart:convert";
import "package:arri_client/arri_client.dart";

class ${prefix} {
  final String baseUrl;
  final Map<String, String> headers;
  const ${prefix}({
    this.baseUrl = "",
    this.headers = const {},
  });
  ${prefix} withHeaders(Map<String, String> headers) {
    return ${prefix}(
      baseUrl: baseUrl,
      headers: headers,
    );
  }
  ${serviceParts
      .map(
          (service) => `${service.name} get ${service.key} {
    return ${service.name}(
      baseUrl: baseUrl, headers: headers,
    );
  }`
      )
      .join("\n  ")}
}

${serviceParts.map((item) => item.content).join("\n")}
${modelParts.join("\n")}`;
}
