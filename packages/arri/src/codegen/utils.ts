import {
    HttpMethod,
    SchemaFormProperties,
    isHttpMethod,
} from "arri-codegen-utils";
import { AObjectSchema } from "packages/arri-shared/dist";

export interface ApplicationDef {
    arriSchemaVersion: "0.0.1";
    info?: {
        title?: string;
        description?: string;
        version?: string;
    };
    externalDocs?: {
        description?: string;
        url: string;
    };
    procedures: Record<string, ProcedureDef>;
    models: Record<string, SchemaFormProperties>;
    errors: SchemaFormProperties;
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

export interface ProcedureDef {
    path: string;
    description?: string;
    method: HttpMethod;
    params: string | undefined;
    response: string | undefined;
}

export function isProcedureDef(input: any): input is ProcedureDef {
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

export interface ServiceDef {
    [key: string]: ProcedureDef | ServiceDef;
}

export function isServiceDef(input: any): input is ServiceDef {
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

export function isApplicationDef(input: any): input is ApplicationDef {
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
    procedures: ApplicationDef["procedures"],
): Record<string, ProcedureDef | ServiceDef> {
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
