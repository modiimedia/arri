import { type TObject } from "@sinclair/typebox";
import { isHttpMethod, type HttpMethod } from "../app";

export interface ApplicationDefinition {
    schemaVersion: "0.0.1";
    description: string;
    procedures: Record<string, ProcedureDefinition>;
    models: Record<string, JsonSchemaObject>;
    errors: Omit<TObject, symbol>;
}

export function normalizeWhitespace(input: string) {
    if (input.includes("\n\n")) {
        return normalizeWhitespace(input.split("\n\n").join("\n"));
    }
    const lines: string[] = [];
    for (const line of input.split("\n")) {
        lines.push(line.trim());
    }
    const result = lines.join("\n").trim();
    if (result.includes("\n\n")) {
        return normalizeWhitespace(result.split("\n\n").join("\n"));
    }
    return result;
}

export interface ProcedureDefinition {
    path: string;
    description?: string;
    method: HttpMethod;
    params: string | undefined;
    response: string | undefined;
}

export function isProcedureDefinition(
    input: any,
): input is ProcedureDefinition {
    if (typeof input !== "object") {
        return false;
    }
    const expectedKeys = ["path", "method"];
    const existingKeys = Object.keys(input);
    for (const key of expectedKeys) {
        if (!existingKeys.includes(key)) {
            return false;
        }
    }
    return (
        isHttpMethod(input.method) &&
        typeof input.path === "string" &&
        (typeof input.params === "string" ||
            typeof input.params === "undefined") &&
        (typeof input.response === "string" ||
            typeof input.response === "undefined")
    );
}

export interface ServiceDefinition {
    [key: string]: ProcedureDefinition | ServiceDefinition;
}

export function isServiceDefinition(input: any): input is ServiceDefinition {
    if (typeof input !== "object") {
        return false;
    }
    for (const key of Object.keys(input)) {
        if (typeof input[key] !== "object") {
            return false;
        }
    }
    return true;
}

export function isApplicationDefinition(
    input: any,
): input is ApplicationDefinition {
    if (typeof input !== "object") {
        return false;
    }
    if (!("procedures" in input) || typeof input.procedures !== "object") {
        return false;
    }

    if (!("models" in input) || typeof input.models !== "object") {
        return false;
    }

    if (!("errors" in input) || typeof input.errors !== "object") {
        return false;
    }

    return true;
}

export function unflattenObject(data: Record<string, any>) {
    if (Object(data) !== data || Array.isArray(data)) return data;
    const regex = /\.?([^.[\]]+)|\[(\d+)\]/g;
    const result: Record<any, any> = {};
    for (const p in data) {
        let cur = result;
        let prop = "";
        let m: any;
        while ((m = regex.exec(p))) {
            cur = cur[prop] || (cur[prop] = m[2] ? [] : {});
            prop = m[2] || m[1];
        }
        cur[prop] = data[p];
    }
    return result[""] || result;
}

export function unflattenProcedures(
    procedures: ApplicationDefinition["procedures"],
): Record<string, ProcedureDefinition | ServiceDefinition> {
    return unflattenObject(procedures);
}

export function setNestedObjectProperty<T>(
    targetProp: string,
    value: T,
    object: Record<any, any>,
) {
    const parts = targetProp.split(".");
    let current = object;
    for (let i = 0; i < parts.length; i++) {
        const key = parts[i];
        if (i === parts.length - 1) {
            current[key] = value;
        } else {
            if (!current[key]) {
                current[key] = {};
            }
            current = current[key];
        }
    }
    return object;
}

export const removeDisallowedChars = (
    input: string,
    disallowedChars: string,
) => {
    let result = input;
    for (const char of disallowedChars) {
        if (result.includes(char)) {
            result = result.split(char).join("");
        }
    }
    return result;
};

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

export interface JsonSchemaScalarType {
    title?: string;
    description?: string;
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

export interface JsonSchemaNullType {
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

export type JsonSchemaComplexType = JsonSchemaObject | JsonSchemaArray;
export interface JsonSchemaObject {
    $id?: string;
    title?: string;
    description?: string;
    type: "object";
    properties: Record<string, JsonSchemaType>;
    required?: string[];
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
export interface JsonSchemaArray {
    $id?: string;
    title?: string;
    description?: string;
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
export interface JsonSchemaUint8Array {
    type: "Uint8Array";
}
export interface JsonSchemaEnum {
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
