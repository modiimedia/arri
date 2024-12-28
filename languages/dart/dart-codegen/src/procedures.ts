import {
    HttpRpcDefinition,
    isRpcDefinition,
    isServiceDefinition,
    RpcDefinition,
    Schema,
    ServiceDefinition,
    WsRpcDefinition,
} from '@arrirpc/codegen-utils';

import {
    CodegenContext,
    getCodeComments,
    validDartClassName,
    validDartIdentifier,
} from './_common';

export function dartRpcFromSchema(
    schema: RpcDefinition,
    context: CodegenContext,
): string {
    switch (schema.transport) {
        case 'http':
            return dartHttpRpcFromSchema(schema, context);
        case 'ws':
            return dartWsRpcFromSchema(schema, context);
        default:
            console.warn(
                `[WARNING] unsupported transport "${schema.transport}". Skipping ${context.instancePath}.`,
            );
            return '';
    }
}

export function dartHttpRpcFromSchema(
    schema: HttpRpcDefinition,
    context: CodegenContext,
): string {
    const functionName = getFunctionName(context.instancePath);
    const metadata: Schema['metadata'] = {
        description: schema.description,
        isDeprecated: schema.isDeprecated,
    };
    let responseType = 'void';
    let paramsType = '';
    if (schema.response) {
        responseType = `${context.modelPrefix}${validDartClassName(schema.response, context.modelPrefix)}`;
    }
    if (schema.params) {
        paramsType = `${context.modelPrefix}${validDartClassName(schema.params, context.modelPrefix)}`;
    }
    if (schema.isEventStream) {
        return `${getCodeComments(metadata)}EventSource<${responseType}> ${functionName}(
            ${paramsType ? `${paramsType} params, ` : ''} {
            void Function(${responseType} data, EventSource<${responseType}> connection)? onMessage,
            void Function(http.StreamedResponse response, EventSource<${responseType}> connection)? onOpen,
            void Function(EventSource<${responseType}> connection)? onClose,
            void Function(ArriError error, EventSource<${responseType}> connection)? onError,
            Duration? retryDelay,
            int? maxRetryCount,
            String? lastEventId,
        }) {
            return parsedArriSseRequest(
                "$_baseUrl${schema.path}",
                method: HttpMethod.${schema.method.toLowerCase()},
                httpClient: _httpClient,
                headers: _headers,
                clientVersion: _clientVersion,
                retryDelay: retryDelay,
                maxRetryCount: maxRetryCount,
                lastEventId: lastEventId,
                ${paramsType ? 'params: params.toJson(),' : ''}
                parser: (body) ${schema.response ? `=> ${responseType}.fromJsonString(body)` : `{}`},
                onMessage: onMessage,
                onOpen: onOpen,
                onClose: onClose,
                onError: onError != null && _onError != null
                    ? (err, es) {
                        _onError.call(onError);
                        return onError(err, es);
                    }
                    : onError != null
                        ? onError
                        : _onError != null
                            ? (err, _) => _onError.call(err)
                            : null,
            );
        }`;
    }
    return `${getCodeComments(metadata)}Future<${responseType}> ${functionName}(${paramsType ? `${paramsType} params` : ''}) async {
        return parsedArriRequest(
            "$_baseUrl${schema.path}",
            method: HttpMethod.${schema.method.toLowerCase()},
            httpClient: _httpClient,
            headers: _headers,
            clientVersion: _clientVersion,
            ${paramsType ? 'params: params.toJson(),' : ''}
            parser: (body) ${schema.response ? `=> ${responseType}.fromJsonString(body)` : '{}'},
            onError: _onError,
        );
    }`;
}

function getFunctionName(instancePath: string) {
    const parts = instancePath.split('.');
    return parts.pop() ?? '';
}

export function dartWsRpcFromSchema(
    schema: WsRpcDefinition,
    context: CodegenContext,
): string {
    const metadata: Schema['metadata'] = {
        description: schema.description,
        isDeprecated: schema.isDeprecated,
    };
    const functionName = getFunctionName(context.instancePath);
    let responseType: string | undefined;
    let paramsType: string | undefined;
    if (schema.response) {
        responseType = `${context.modelPrefix}${validDartClassName(schema.response, context.modelPrefix)}`;
    }
    if (schema.params) {
        paramsType = `${context.modelPrefix}${validDartClassName(schema.params, context.modelPrefix)}`;
    }
    return `${getCodeComments(metadata)}Future<ArriWebsocketController<${responseType ?? 'void'}, ${paramsType ?? 'void'}>> ${functionName}() {
        return arriWebsocketRequest(
            "$_baseUrl${schema.path}",
            headers: _headers,
            clientVersion: _clientVersion,
            parser: (msg) ${responseType ? `=> ${responseType}.fromJsonString(msg)` : '{}'},
            serializer: (msg) ${paramsType ? '=> msg.toJsonString()' : '=> ""'},
            onError: _onError,
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
                clientVersion: context.clientVersion,
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
                clientVersion: context.clientVersion,
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
  final String _clientVersion = "${context.clientVersion}";
  final FutureOr<Map<String, String>> Function()? _headers;
  final Function(Object)? _onError;
  ${serviceName}({
    http.Client? httpClient,
    required String baseUrl,
    FutureOr<Map<String, String>> Function()? headers,
    Function(Object)? onError,
  }) : _httpClient = httpClient,
       _baseUrl = baseUrl,
       _headers = headers,
       _onError = onError;

  ${rpcParts.join('\n\n')}

  ${subServices
      .map(
          (service) => `  ${service.name} get ${service.key} => ${service.name}(
          baseUrl: _baseUrl,
          headers: _headers,
          httpClient: _httpClient,
          onError: _onError,
        );`,
      )
      .join('\n\n')}
}
${subServiceParts.join('\n\n')}`;
}

export function getServiceName(instancePath: string, clientName: string) {
    return validDartClassName(
        `${clientName}_${instancePath.split('.').join('_')}_Service`,
        '',
    );
}
