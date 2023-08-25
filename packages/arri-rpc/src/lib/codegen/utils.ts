import { type TObject } from "@sinclair/typebox";
import { type RpcMethod, isRpcMethod } from "../arri-rpc";

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
    method: RpcMethod;
    params: { $ref: string } | { type: "undefined" };
    response:
        | {
              $ref: string;
          }
        | { type: "number" | "integer" | "string" | "boolean" | "undefined" };
}

export function isProcedureDefinition(
    input: any
): input is ProcedureDefinition {
    if (typeof input !== "object") {
        return false;
    }
    const expectedKeys = ["path", "method", "params", "response"];
    const existingKeys = Object.keys(input);
    for (const key of expectedKeys) {
        if (!existingKeys.includes(key)) {
            return false;
        }
    }
    return (
        isRpcMethod(input.method) &&
        typeof input.path === "string" &&
        typeof input.params === "object" &&
        typeof input.response === "object"
    );
}

export interface ServiceDefinition {
    [key: string]: ProcedureDefinition | ServiceDefinition;
}

export interface ApplicationDefinition {
    endpoints: Record<string, RpcMethod>;
    services: Record<string, ServiceDefinition>;
    models: Record<string, TObject>;
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

export function setNestedObjectProperty<T>(
    targetProp: string,
    value: T,
    object: Record<any, any>
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
    disallowedChars: string
) => {
    let result = input;
    for (const char of disallowedChars) {
        if (result.includes(char)) {
            result = result.split(char).join("");
        }
    }
    return result;
};
