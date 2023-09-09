export const JsonSchemaScalarTypeValues = [
    "integer",
    "number",
    "bigint",
    "string",
    "boolean",
    "Date",
] as const;
export const JsonSchemaNullTypeValues = ["null", "undefined"] as const;
export const JsonSchemaComplexTypeValues = [
    "object",
    "list",
    "array",
    "Uint8Array",
] as const;

export type JsonSchemaType =
    | JsonSchemaScalarType
    | JsonSchemaNullType
    | JsonSchemaComplexType;

export type JsonSchemaTypeValue =
    | (typeof JsonSchemaScalarTypeValues)[number]
    | (typeof JsonSchemaNullTypeValues)[number]
    | (typeof JsonSchemaComplexTypeValues)[number];

export interface JsonSchemaTypeBase {
    $id?: string;
    title?: string;
    description?: string;
}

export interface JsonSchemaScalarType extends JsonSchemaTypeBase {
    type: (typeof JsonSchemaScalarTypeValues)[number];
}
export function isJsonSchemaScalarType(
    input: any,
): input is JsonSchemaScalarType {
    if (typeof input !== "object") {
        return false;
    }
    if (!("type" in input)) {
        return false;
    }
    return JsonSchemaScalarTypeValues.includes(input.type);
}

export interface JsonSchemaNullType extends JsonSchemaTypeBase {
    type: (typeof JsonSchemaNullTypeValues)[number];
}
export function isJsonSchemaNullType(input: any): input is JsonSchemaNullType {
    if (typeof input !== "object") {
        return false;
    }
    if (!("type" in input)) {
        return false;
    }
    return JsonSchemaNullTypeValues.includes(input.type);
}

export type JsonSchemaComplexType =
    | JsonSchemaObject
    | JsonSchemaArray
    | JsonSchemaRecord;
export interface JsonSchemaObject extends JsonSchemaTypeBase {
    type: "object";
    properties: Record<string, JsonSchemaType>;
    required?: string[];
    additionalProperties?: boolean;
}
export const isJsonSchemaObject = (input: any): input is JsonSchemaObject => {
    if (typeof input !== "object") {
        return false;
    }
    return (
        "type" in input &&
        input.type === "object" &&
        "properties" in input &&
        typeof input.properties === "object"
    );
};
export interface JsonSchemaRecord extends JsonSchemaTypeBase {
    type: "object";
    patternProperties: Record<string, JsonSchemaType>;
}
export const isJsonSchemaRecord = (input: any): input is JsonSchemaRecord => {
    if (typeof input !== "object") {
        return false;
    }
    return (
        "type" in input &&
        input.type === "object" &&
        "patternProperties" in input &&
        typeof input.patternProperties === "object"
    );
};
export interface JsonSchemaArray extends JsonSchemaTypeBase {
    type: "array";
    items: JsonSchemaType;
}
export function isJsonSchemaArray(input: any): input is JsonSchemaArray {
    if (typeof input !== "object") {
        return false;
    }
    if ("type" in input && input.type === "array") {
        return true;
    }
    return false;
}
export interface JsonSchemaUint8Array extends JsonSchemaTypeBase {
    type: "Uint8Array";
}
export interface JsonSchemaEnum extends JsonSchemaTypeBase {
    anyOf:
        | Array<{ type: "string"; const: string }>
        | Array<{ type: "number"; const: number }>
        | Array<{ type: "integer"; const: number }>;
}
export function isJsonSchemaEnum(input: any): input is JsonSchemaEnum {
    if (typeof input !== "object") {
        return false;
    }
    if (!("anyOf" in input) || !Array.isArray(input.anyOf)) {
        return false;
    }
    let prevType: "string" | "integer" | "number" | undefined;
    for (const item of input.anyOf) {
        if (!isJsonSchemaScalarType(item)) {
            return false;
        }
        if (
            item.type !== "string" &&
            item.type !== "integer" &&
            item.type !== "number"
        ) {
            return false;
        }
        if (!prevType) {
            prevType = item.type;
        } else if (prevType !== item.type) {
            return false;
        }
    }
    return true;
}
