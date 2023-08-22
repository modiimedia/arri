import { type TObject, type TSchema } from "@sinclair/typebox";
import type { RpcMethod } from "../arri-rpc";
import { pascalCase } from "scule";

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
} as const;

export type DartBaseType = (typeof dartTypeMap)[keyof typeof dartTypeMap];
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
    def: ServiceDefinition
) {
    const rpcParts: string[] = [];
    const serviceName = `${name}`;
    Object.keys(def).forEach((key) => {
        const rpc = def[key];
        rpcParts.push(`Future<${rpc.response}> ${key}(${rpc.params} params) {
    return parsedRequest(
      "$baseUrl${rpc.path}",
      method: HttpMethod.${rpc.method},
      headers: headers,
      params: params.toJson(),
      parser: (body) => ${rpc.response}.fromJson(json.decode(body)),
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
    return `${fieldName}: ${dartType}.fromJson(json["${fieldName}"])`;
}

export function dartPropertyType(
    objectName: string,
    propertyName: string,
    schema: TObject
): DartType | string {
    const prop = schema.properties[propertyName];
    const isOptional = !schema.required?.includes(propertyName);
    if (typeof prop.type === "string") {
        switch (prop.type) {
            case "string":
                return isOptional ? "String?" : "String";
            case "integer":
                return isOptional ? "int?" : "int";
            case "number":
                return isOptional ? "double?" : "double";
            case "null":
                return "null";
            case "object": {
                const joinedPropName = pascalCase(
                    `${objectName}_${propertyName}`
                ) as string;
                return isOptional ? `${joinedPropName}?` : joinedPropName;
            }
            case "boolean":
                return isOptional ? "bool?" : "bool";
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
                        return isOptional ? "List<String>?" : "List<String>";
                    case "integer":
                        return isOptional ? "List<int>?" : "List<int>";
                    case "number":
                        return isOptional ? "List<double>?" : "List<double>";
                    case "null":
                        return isOptional ? "List<null>?" : "List<null>";
                    case "boolean":
                        return isOptional ? "List<bool>?" : "List<bool>";
                    case "object":
                        return isOptional ? "List<Object>?" : "List<Object>";
                }
                break;
            }
            default:
                break;
        }
    }
    return "null";
}

export function dartModelFromJsonSchema(name: string, schema: TObject): string {
    const fields: Array<{ type: string; name: string }> = [];
    const subModelParts: string[] = [];
    Object.entries(schema.properties).forEach(([key, val]) => {
        // console.log(val.type);
        const dartType = dartPropertyType(name, key, schema);
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
              return `"${field.name}": ${
                  isDartType(field.type) ? field.name : `${field.name}.toJson()`
              },`;
          })
          .join("\n      ")}
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

export function createDartClient(appDef: ApplicationDefinition) {
    const { models, services } = appDef;
    const serviceParts: string[] = [];
    Object.keys(services).forEach((k) => {
        const service = services[k];
        serviceParts.push(
            dartServiceFromServiceDefinition(`${pascalCase(k)}Service`, service)
        );
    });

    const modelParts: string[] = [];
    Object.keys(models).forEach((key) => {
        const model = models[key];
        if (model.type === "object") {
            const objModel = model as TObject;
            modelParts.push(dartModelFromJsonSchema(key, objModel));
        }
    });
    console.log(serviceParts);
    console.log(modelParts);
    return `// This code was autogenerated by arri. Do not modify directly.
import 'dart:convert';
import "package:http/http.dart as http;

${serviceParts.join("\n")}
${modelParts.join("\n")}`;
}
