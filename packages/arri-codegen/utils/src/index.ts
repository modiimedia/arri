import {
    type SchemaFormDiscriminator,
    type SchemaFormValues,
    type SchemaFormProperties,
} from "jtd-utils";
export * from "jtd-utils";
export * from "scule";

export const HttpMethodValues = [
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "head",
] as const;

export type HttpMethod = (typeof HttpMethodValues)[number];
export type RpcHttpMethod = Exclude<HttpMethod, "head">;
export const isHttpMethod = (input: any): input is HttpMethod => {
    if (typeof input !== "string") {
        return false;
    }
    return HttpMethodValues.includes(input as any);
};
export const isRpcHttpMethod = (input: any): input is RpcHttpMethod => {
    return isHttpMethod(input) && input !== "head";
};

export const SCHEMA_VERSION = "0.0.2" as const;

export interface AppDefinition {
    arriSchemaVersion: typeof SCHEMA_VERSION;
    info?: {
        title?: string;
        description?: string;
        version?: string;
    };
    externalDocs?: {
        description?: string;
        url: string;
    };
    procedures: Record<string, RpcDefinition>;
    models: Record<
        string,
        SchemaFormProperties | SchemaFormDiscriminator | SchemaFormValues
    >;
}

export function isAppDefinition(input: unknown): input is AppDefinition {
    if (typeof input !== "object") {
        return false;
    }
    const inputObj = input as Record<any, any>;
    if (typeof inputObj.arriSchemaVersion !== "string") {
        return false;
    }
    if (typeof inputObj.procedures !== "object") {
        return false;
    }
    if (typeof inputObj.models !== "object") {
        return false;
    }
    return true;
}

export interface RpcDefinition {
    path: string;
    method: RpcHttpMethod;
    params?: string;
    response?: string;
    description?: string;
    isEventStream?: boolean;
}
export function isRpcDefinition(input: unknown): input is RpcDefinition {
    if (typeof input !== "object") {
        return false;
    }
    const inputObj = input as Record<any, any>;
    return (
        typeof inputObj.path === "string" &&
        isRpcHttpMethod(inputObj.method) &&
        (typeof inputObj.params === "string" ||
            typeof inputObj.params === "undefined") &&
        (typeof inputObj.response === "string" ||
            typeof inputObj.response === "undefined")
    );
}

export interface ServiceDefinition {
    [key: string]: RpcDefinition | ServiceDefinition;
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

export function unflattenProcedures(
    procedures: AppDefinition["procedures"],
): Record<string, RpcDefinition | ServiceDefinition> {
    return unflattenObject(procedures);
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

export interface ClientGenerator<
    TOptions extends Record<string, any> | undefined,
> {
    generator: (def: AppDefinition) => any;
    options: TOptions;
}

export type ClientGeneratorPlugin<
    TOptions extends Record<string, any> | undefined,
> = (options: TOptions) => ClientGenerator<TOptions>;

export function defineClientGeneratorPlugin<
    TOptions extends Record<string, any> | undefined,
>(plugin: ClientGeneratorPlugin<TOptions>) {
    return plugin;
}
