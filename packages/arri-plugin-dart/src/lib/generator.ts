import type { JSONSchema7, JSONSchema7Definition } from "json-schema";

export function jsonSchemaToDart(symbolName: string, schema: JSONSchema7) {
    if (!schema.definitions) {
        return;
    }
    Object.keys(schema.definitions).forEach((defName) => {
        const definition = schema.definitions?.[
            defName
        ] as JSONSchema7Definition;
        if (typeof definition !== "object") {
            return;
        }
        if (definition.type === "object") {
            return jsonSchemaObjectToDart(
                defName,
                definition as JsonSchemaObjectDefinition
            );
        }
    });
}

export const DartBasicTypeVals = [
    "String",
    "List",
    "DateTime",
    "int",
    "double",
    "bool",
    "dynamic",
    "Null",
] as const;

export type DartBasicType = (typeof DartBasicTypeVals)[number];

export function isDartBasicType(input: unknown): input is DartBasicType {
    if (typeof input !== "string") {
        return false;
    }
    return DartBasicTypeVals.includes(input as any);
}

type JsonSchemaType =
    | "array"
    | "boolean"
    | "integer"
    | "null"
    | "number"
    | "object"
    | "string";

export interface ClassField {
    name: string;
    typeName: DartBasicType;
    subTypeName?: DartBasicType;
    isNullable: boolean;
    defaultVal?: string;
}

export interface JsonSchemaObjectDefinition {
    type: "object";
    description?: string;
    required?: string[];
    properties: Record<string, JsonSchemaObjectPropertyDefinition>;
}

export interface JsonSchemaObjectPropertyDefinition {
    type: JsonSchemaType;
    description?: string;
    minimum?: number;
    maximum?: number;
}

export function jsonSchemaTypeToDartType(
    schemaType: JsonSchemaType
): DartBasicType {
    switch (schemaType) {
        case "array":
            return "List";
        case "boolean":
            return "bool";
        case "integer":
            return "int";
        case "number":
            return "double";
        case "object":
            return "dynamic";
        case "string":
            return "String";
    }
    return "dynamic";
}

export function jsonSchemaObjectToDart(
    symbolName: string,
    schema: JsonSchemaObjectDefinition
) {
    if (typeof schema !== "object") {
        return "";
    }
    const fields: ClassField[] = [];
    const requiredProps = schema.required ?? [];
    Object.keys(schema.properties).forEach((prop) => {
        const propVal = schema.properties[prop];
        const isNullable = !requiredProps.includes(prop);
        switch (propVal.type) {
            case "string":
                fields.push({
                    name: prop,
                    typeName: "String",
                    isNullable,
                });
                break;
            case "integer":
                fields.push({
                    name: prop,
                    typeName: "int",
                    isNullable,
                });
                break;
            case "number":
                fields.push({
                    name: prop,
                    typeName: "double",
                    isNullable,
                });
                break;
            default:
                fields.push({
                    name: prop,
                    typeName: "dynamic",
                    isNullable,
                });
        }
    });
    const classTemplate = `class ${symbolName} {
${fields
    .map(
        (field) =>
            `  final ${field.typeName}${field.isNullable ? "?" : ""} ${
                field.name
            };`
    )
    .join("\n")}
  const ${symbolName}({
${fields
    .map((field) => {
        return `    required this.${field.name}`;
    })
    .join(",\n")},
  });

  factory ${symbolName}.fromJson(Map<String, dynamic> json) {
    return ${symbolName}(
${fields
    .map(
        (field) =>
            `      ${field.name}: ${dartJsonParser(
                field.name,
                field.typeName,
                field.isNullable,
                field.defaultVal
            )}`
    )
    .join(",\n")},
    );
  }

  Map<String, dynamic> toJson() {
    return {
${fields
    .map(
        (field) =>
            `      "${field.name}": ${dartJsonSerializer(
                field.name,
                field.typeName
            )}`
    )
    .join(",\n")},
    };
  }
}`;
    return classTemplate;
}

export function dartJsonSerializer(
    fieldName: string,
    dartType: DartBasicType | string
) {
    if (isDartBasicType(dartType)) {
        switch (dartType) {
            case "String":
            case "int":
            case "Null":
            case "bool":
            case "double":
            case "dynamic":
                return fieldName;
        }
    }
    return "";
}

export function dartJsonParser(
    fieldName: string,
    dartType: DartBasicType,
    isNullable: boolean,
    defaultVal?: string
) {
    switch (dartType) {
        case "String":
            if (isNullable) {
                return `json["${fieldName}"] is String ? json["${fieldName}"] : null`;
            }
            return `json["${fieldName}"] is String ? json["${fieldName}"] : "${
                defaultVal ?? ""
            }"`;
        case "Null":
            return "null";
        case "bool":
            if (isNullable) {
                return `json["${fieldName}"] is bool ? json["${fieldName}"] : null`;
            }
            return `json["${fieldName}"] is bool ? json["${fieldName}"] : ${
                defaultVal ?? "false"
            }`;
        case "int":
            if (isNullable) {
                return `json["${fieldName}"] is int ? json["${fieldName}"] : null`;
            }
            return `json["${fieldName}"] is int ? json["${fieldName}"] : ${
                defaultVal ?? 0
            }`;
        case "double":
            if (isNullable) {
                return `json["${fieldName}"] is double ? json["${fieldName}"] : null`;
            }
            return `json["${fieldName}"] is double ? json["${fieldName}"] : ${
                defaultVal ?? 0
            }`;
        case "dynamic":
        default:
            return `json["${fieldName}"]`;
    }
}
