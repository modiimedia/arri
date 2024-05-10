import {
    type SchemaFormDiscriminator,
    type SchemaFormProperties,
} from "jtd-utils";
import { pascalCase } from "scule";
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return HttpMethodValues.includes(input as any);
};

export const isRpcHttpMethod = (input: any): input is RpcHttpMethod => {
    return isHttpMethod(input) && input !== "head";
};

export const SCHEMA_VERSION = "0.0.4";

export interface AppDefinition {
    arriSchemaVersion: typeof SCHEMA_VERSION;
    info?: {
        title?: string;
        description?: string;
        version?: string;
        [key: string]: string | undefined;
    };
    externalDocs?: {
        description?: string;
        url: string;
    };
    procedures: Record<string, RpcDefinition<string>>;
    models: Record<string, SchemaFormProperties | SchemaFormDiscriminator>;
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

export interface RpcDefinitionBase<T = string> {
    path: string;
    params?: T;
    response?: T;
    description?: string;
    isDeprecated?: boolean;
}

export interface HttpRpcDefinition<T = string> extends RpcDefinitionBase<T> {
    transport: "http";
    method: RpcHttpMethod;
    isEventStream?: boolean;
}
export interface WsRpcDefinition<T = string> extends RpcDefinitionBase<T> {
    transport: "ws";
}
export interface CustomRpcDefinition<T = string> extends RpcDefinitionBase<T> {
    transport: `custom:${string}`;
    [key: string]: unknown;
}
export type RpcDefinition<T = string> =
    | HttpRpcDefinition<T>
    | WsRpcDefinition<T>
    | CustomRpcDefinition<T>;

export function isRpcDefinitionBase(
    input: unknown,
): input is RpcDefinitionBase {
    if (typeof input !== "object" || input === null) {
        return false;
    }
    if (
        "params" in input &&
        typeof input.params !== "undefined" &&
        typeof input.params !== "string"
    ) {
        return false;
    }
    if (
        "response" in input &&
        typeof input.response !== "undefined" &&
        typeof input.response !== "string"
    ) {
        return false;
    }

    return (
        "transport" in input &&
        typeof input.transport === "string" &&
        input.transport.length > 0 &&
        "path" in input &&
        typeof input.path === "string" &&
        input.path.length > 0
    );
}

export function isRpcDefinition(input: unknown): input is RpcDefinition {
    if (!isRpcDefinitionBase(input)) {
        return false;
    }
    if (!("transport" in input) || typeof input.transport !== "string") {
        return false;
    }
    if (input.transport === "http") {
        return "method" in input && isRpcHttpMethod(input.method);
    }
    if (input.transport === "ws") {
        return true;
    }
    if (input.transport.startsWith("custom:")) {
        return true;
    }
    return false;
}

export interface ServiceDefinition {
    [key: string]: RpcDefinition | ServiceDefinition;
}

export function isServiceDefinition(input: any): input is ServiceDefinition {
    if (typeof input !== "object") {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
        const key = parts[i]!;
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
    generator: (def: AppDefinition, isDevServer?: boolean) => any;
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

type RpcDefinitionHelper = RpcDefinition<
    SchemaFormProperties | SchemaFormDiscriminator
>;

type AppDefinitionHelper = Omit<
    AppDefinition,
    "procedures" | "models" | "arriSchemaVersion"
> & {
    procedures: Record<string, RpcDefinitionHelper>;
    models?: AppDefinition["models"];
};

export function createAppDefinition(input: AppDefinitionHelper): AppDefinition {
    const models = { ...input.models };
    const procedures: AppDefinition["procedures"] = {};
    for (const key of Object.keys(input.procedures)) {
        const def = input.procedures[key]!;
        let paramName: string | undefined;
        if (def.params) {
            paramName =
                def.params.metadata?.id ??
                pascalCase(`${key.split(".").join("_")}Params`);
            models[paramName] = def.params;
        }
        let responseName: string | undefined;
        if (def.response) {
            responseName =
                def.response.metadata?.id ??
                pascalCase(`${key.split(".").join("_")}Response`);
            models[responseName] = def.response;
        }
        delete def.params;
        delete def.response;
        procedures[key] = {
            ...def,
            params: paramName,
            response: responseName,
        };
    }
    const result: AppDefinition = {
        arriSchemaVersion: "0.0.4",
        ...input,
        procedures,
        models,
    };
    return result;
}
