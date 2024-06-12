import {
    HttpRpcDefinition,
    RpcDefinition,
    ServiceDefinition,
    WsRpcDefinition,
} from "@arrirpc/codegen-utils";

import { CodegenContext, validDartClassName } from "./_common";

export function dartRpcFromSchema(
    schema: RpcDefinition,
    context: CodegenContext,
): string {
    switch (schema.transport) {
        case "http":
            return dartHttpRpcFromSchema(schema, context);
        case "ws":
            return dartWsRpcFromSchema(schema, context);
        default:
            console.warn(
                `[WARNING] unsupported transport "${schema.transport}". Skipping ${context.instancePath}.`,
            );
            return "";
    }
}

export function dartHttpRpcFromSchema(
    schema: HttpRpcDefinition,
    context: CodegenContext,
): string {
    const functionName = getFunctionName(context.instancePath);
    let responseType = "void";
    let paramsType = "";
    if (schema.response) {
        responseType = `${context.modelPrefix}${validDartClassName(schema.response, context.modelPrefix)}`;
    }
    if (schema.params) {
        paramsType = `${context.modelPrefix}${validDartClassName(schema.params, context.modelPrefix)}`;
    }
    if (schema.isEventStream) {
        return `EventSource<${responseType}> ${functionName}(
            ${paramsType ? `${paramsType} params, ` : ""} {
            void Function(${responseType} data, EventSource<${responseType}> connection)? onData,
            void Function(http.StreamedResponse response, EventSource<${responseType}> connection)? onOpen,
            void Function(EventSource<${responseType}> connection)? onClose,
            void Function(ArriError error, EventSource<${responseType}> connection)? onError,
            void Function(ArriError error, EventSource<${responseType}> connection)? onConnectionError,
            Duration? retryDelay,
            int? maxRetryCount,
        }) {
            return parsedArriSseRequest(
                "$_baseUrl${schema.path}",
                method: HttpMethod.${schema.method.toLowerCase()},
                httpClient: _httpClient,
                headers: _headers,
                clientVersion: _clientVersion,
                retryDelay: retryDelay,
                maxRetryCount: maxRetryCount,
                ${paramsType ? "params: params.toJson()," : ""}
                parser: (body) => ${schema.response ? `${responseType}.fromJsonString(body)` : `{}`},
                onData: onData,
                onOpen: onOpen,
                onClose: onClose,
                onError: onError,
                onConnectionError: onConnectionError,
            );
        }`;
    }
    return `Future<${responseType}> ${functionName}(${paramsType ? `${paramsType} params` : ""}) async {
        return parsedArriRequest(
            "$_baseUrl${schema.path}",
            method: HttpMethod.${schema.method.toLowerCase()},
            httpClient: _httpClient,
            headers: _headers,
            clientVersion: _clientVersion,
            ${paramsType ? "params: params.toJson()," : ""}
            parser: (body) => ${schema.response ? `${responseType}.fromJsonString(body)` : "{}"},
        );
    }`;
}

function getFunctionName(instancePath: string) {
    const parts = instancePath.split(".");
    return parts.pop() ?? "";
}

export function dartWsRpcFromSchema(
    schema: WsRpcDefinition,
    context: CodegenContext,
): string {
    return "";
}

export function dartServiceFromSchema(
    schema: ServiceDefinition,
    context: CodegenContext,
): string {
    return "";
}
