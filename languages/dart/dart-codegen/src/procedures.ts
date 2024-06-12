import {
    HttpRpcDefinition,
    isRpcDefinition,
    isServiceDefinition,
    RpcDefinition,
    ServiceDefinition,
    WsRpcDefinition,
} from "@arrirpc/codegen-utils";

import {
    CodegenContext,
    validDartClassName,
    validDartIdentifier,
} from "./_common";

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
    const functionName = getFunctionName(context.instancePath);
    let responseType: string | undefined;
    let paramsType: string | undefined;
    if (schema.response) {
        responseType = `${context.modelPrefix}${validDartClassName(schema.response, context.modelPrefix)}`;
    }
    if (schema.params) {
        paramsType = `${context.modelPrefix}${validDartClassName(schema.params, context.modelPrefix)}`;
    }
    return `Future<ArriWebsocketController<${paramsType ?? "void"}, ${responseType ?? "void"}>> ${functionName}() {
        return arriWebsocketRequest(
            "$_baseUrl${schema.path}",
            headers: _headers,
            clientVersion: _clientVersion,
            parser: (body) => ${responseType ? `${responseType}.fromJsonString(body)` : "{}"},
            serializer: (msg) => ${paramsType ? "msg.toJsonString()" : "{}"},
        );
    }`;
}

export function dartServiceFromSchema(
    schema: ServiceDefinition,
    context: CodegenContext,
): string {
    const rpcParts: string[] = [];
    const subServices: { key: string; name: string }[] = [];
    const subServiceParts: string[] = [];
    const serviceName = getServiceName(
        context.instancePath,
        context.clientName,
    );
    for (const key of Object.keys(schema)) {
        const subSchema = schema[key];
        if (isServiceDefinition(subSchema)) {
            const subSchemaResult = dartServiceFromSchema(subSchema, {
                clientName: context.clientName,
                modelPrefix: context.modelPrefix,
                generatedTypes: context.generatedTypes,
                instancePath: `${context.instancePath}.${key}`,
                schemaPath: `${context.schemaPath}.${key}`,
            });
            if (subSchemaResult) {
                subServiceParts.push(subSchemaResult);
                subServices.push({
                    key: validDartIdentifier(key),
                    name: getServiceName(
                        `${context.instancePath}.${key}`,
                        context.clientName,
                    ),
                });
            }
            continue;
        }
        if (isRpcDefinition(subSchema)) {
            const subSchemaResult = dartRpcFromSchema(subSchema, {
                clientName: context.clientName,
                modelPrefix: context.modelPrefix,
                generatedTypes: context.generatedTypes,
                instancePath: `${context.instancePath}.${key}`,
                schemaPath: `${context.schemaPath}.${key}`,
            });
            if (subSchemaResult) {
                rpcParts.push(subSchemaResult);
            }
            continue;
        }
        console.warn(
            `Unknown schema in procedures at "${context.instancePath}".`,
        );
    }
    return `class ${serviceName}{
  final http.Client? _httpClient;
  final String _baseUrl;
  final String _clientVersion = "${context.clientVersion ?? ""}";
  late final FutureOr<Map<String, String>> Function()? _headers;
  ${serviceName}({
    http.Client? httpClient,
    required String baseUrl,
    FutureOr<Map<String, String>> Function()? _headers,
  }) : _httpClient = httpClient,
       _baseUrl = baseUrl,
       _headers = headers;

  ${rpcParts.join("\n\n")}

  ${subServices
      .map(
          (service) => `  ${service.name} get ${service.key} => ${service.name}(
          baseUrl: _baseUrl,
          headers: _headers,
          httpClient: _httpClient,
        );`,
      )
      .join("\n\n")}
}
${subServiceParts.join("\n\n")}`;
}

export function getServiceName(instancePath: string, clientName: string) {
    return validDartClassName(
        `${clientName}_${instancePath.split(".").join("_")}_Service`,
        "",
    );
}
