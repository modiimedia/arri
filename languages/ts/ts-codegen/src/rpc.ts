import {
    HttpRpcDefinition,
    pascalCase,
    RpcDefinition,
    WsRpcDefinition,
} from "@arrirpc/codegen-utils";

import { CodegenContext, getJsDocComment, validVarName } from "./common";

export function tsRpcFromDefinition(
    def: RpcDefinition,
    context: CodegenContext,
): string {
    switch (def.transport) {
        case "http":
            return httpRpcFromDefinition(def, context);
        case "ws":
            return wsRpcFromDefinition(def, context);
        default:
            console.warn(
                `[ts-codegen] Warning: unsupported transport "${def.transport}". Ignoring ${context.instancePath}.`,
            );
            return "";
    }
}

export function httpRpcFromDefinition(
    def: HttpRpcDefinition,
    context: CodegenContext,
): string {
    const key = getRpcKey(context);
    const params = def.params
        ? `${context.typePrefix}${pascalCase(validVarName(def.params))}`
        : undefined;
    const response = def.response
        ? `${context.typePrefix}${pascalCase(validVarName(def.response), { normalize: true })}`
        : undefined;
    const serializerMethod =
        def.method === "get" ? "toUrlQueryString" : "toJsonString";
    if (def.isEventStream) {
        context.usedFeatures.sse = true;
        return `${getJsDocComment({
            description: def.description,
            isDeprecated: def.isDeprecated,
        })}    ${key}(${params ? `params: ${params},` : ""} options: SseOptions<${response ?? "undefined"}> = {}): EventSourceController {
        return arriSseRequest<${response ?? "undefined"}, ${params ?? "undefined"}>(
            {
                url: \`\${this._baseUrl}${def.path}\`,
                method: "${def.method.toLowerCase()}",
                headers: this._headers,
                onError: this._onError,
                ${params ? "params: params," : ""}
                responseFromJson: ${response ? `$$${response}.fromJson` : "() => {}"},
                responseFromString: ${response ? `$$${response}.fromJsonString` : "() => {}"},
                serializer: ${params ? `$$${params}.${serializerMethod}` : "() => {}"},
                clientVersion: "${context.versionNumber}",
            },
            options,
        );
    }`;
    }
    return `${getJsDocComment({
        description: def.description,
        isDeprecated: def.isDeprecated,
    })}    async ${key}(${params ? `params: ${params}` : ""}): Promise<${response ?? "undefined"}> {
        return arriRequest<${response ?? "undefined"}, ${params ?? "undefined"}>({
            url: \`\${this._baseUrl}${def.path}\`,
            method: "${def.method.toLowerCase()}",
            headers: this._headers,
            onError: this._onError,
            ${params ? "params: params," : ""}
            responseFromJson: ${response ? `$$${response}.fromJson` : "() => {}"},
            responseFromString: ${response ? `$$${response}.fromJsonString` : "() => {}"},
            serializer: ${params ? `$$${params}.${serializerMethod}` : "() => {}"},
            clientVersion: "${context.versionNumber}",
        });
    }`;
}

export function wsRpcFromDefinition(
    def: WsRpcDefinition,
    context: CodegenContext,
): string {
    context.usedFeatures.ws = true;
    const key = getRpcKey(context);
    const params = def.params
        ? `${context.typePrefix}${pascalCase(validVarName(def.params))}`
        : undefined;
    const response = def.response
        ? `${context.typePrefix}${pascalCase(validVarName(def.response), { normalize: true })}`
        : undefined;
    return `${getJsDocComment({
        description: def.description,
        isDeprecated: def.isDeprecated,
    })}    async ${key}(options: WsOptions<${response ?? "undefined"}> = {}): Promise<WsController<${params ?? "undefined"},${response ?? "undefined"}>> {
        return arriWsRequest<${params ?? "undefined"}, ${response ?? "undefined"}>({
            url: \`\${this._baseUrl}${def.path}\`,
            headers: this._headers,
            responseFromJson: ${response ? `$$${response}.fromJson` : "() => {}"},
            responseFromString: ${response ? `$$${response}.fromJsonString` : "() => {}"},
            serializer: ${params ? `$$${params}.toJsonString` : "() => {}"},
            onOpen: options.onOpen,
            onClose: options.onClose,
            onError: options.onError,
            onConnectionError: options.onConnectionError,
            onMessage: options.onMessage,
            clientVersion: "${context.versionNumber}",
        });
    }`;
}

export function getRpcKey(context: CodegenContext): string {
    const name = context.instancePath.split(".").pop() ?? "";
    return validVarName(name);
}
