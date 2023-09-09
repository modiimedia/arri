import { SchemaFormProperties, isPropertiesForm } from "@modii/jtd";
export * from "@modii/jtd";

export const HttpMethodValues = [
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "head",
] as const;

export type HttpMethod = (typeof HttpMethodValues)[number];

export const isHttpMethod = (input: any): input is HttpMethod => {
    if (typeof input !== "string") {
        return false;
    }
    return HttpMethodValues.includes(input as any);
};

const SCHEMA_VERSION = "0.0.2" as const;

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
    models: Record<string, SchemaFormProperties>;
    errors: SchemaFormProperties;
}

export function isAppDefinition(input: unknown): input is AppDefinition {
    if (typeof input !== "object") {
        return false;
    }
    const inputObj = input as Record<any, any>;
    if (inputObj.arriSchemaVersion !== SCHEMA_VERSION) {
        return false;
    }
    if (typeof inputObj.procedures !== "object") {
        return false;
    }
    if (typeof inputObj.modules !== "object") {
        return false;
    }
    if (!isPropertiesForm(inputObj.errors)) {
        return false;
    }
    return true;
}

export interface RpcDefinition {
    path: string;
    description?: string;
    method: HttpMethod;
    params: string | undefined;
    response: string | undefined;
}
export function isRpcDefinition(input: unknown): input is RpcDefinition {
    if (typeof input !== "object") {
        return false;
    }
    const inputObj = input as Record<any, any>;
    return (
        typeof inputObj.path === "string" &&
        isHttpMethod(inputObj.method) &&
        (typeof inputObj.params === "string" ||
            typeof inputObj.params === "undefined") &&
        (typeof inputObj.response === "string" ||
            typeof inputObj.response === "undefined")
    );
}
