import {
    isRpcDefinition,
    isServiceDefinition,
    RpcDefinition,
    Schema,
    ServiceDefinition,
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
    const functionName = getFunctionName(context.instancePath);
    const metadata: Schema['metadata'] = {
        description: schema.description,
        isDeprecated: schema.isDeprecated,
    };
    let outputType = 'void';
    let inputType = '';
    if (schema.output) {
        outputType = `${context.modelPrefix}${validDartClassName(schema.output, context.modelPrefix)}`;
    }
    if (schema.input) {
        inputType = `${context.modelPrefix}${validDartClassName(schema.input, context.modelPrefix)}`;
    }
    if (schema.outputIsStream) {
        return `${getCodeComments(metadata)}ArriEventSource<${outputType}> ${functionName}(
            ${inputType ? `${inputType} input, ` : ''} {
            ArriEventSourceHookOnData<${outputType}>? onData,
            ArriEventSourceHookOnRawData<${outputType}>? onRawData,
            ArriEventSourceHookOnOpen<${outputType}>? onOpen,
            ArriEventSourceHookOnClose<${outputType}>? onClose,
            ArriEventSourceHookOnError<${outputType}>? onError,
            Duration? timeout,
            String? transport,
            int? maxRetryCount,
            Duration? maxRetryInterval,
            String? lastMsgId,
        }) {
            final selectedTransport = resolveTransport([${schema.transports.map((transport) => `"${transport}"`).join(', ')}], transport ?? _defaultTransport);
            final dispatcher = _dispatchers[selectedTransport];
            if (dispatcher == null) throw MissingDispatcherError(selectedTransport);
            return dispatcher.handleOutputStreamRpc<${schema.input ? inputType : `Null`}, ${outputType}>(
                req: RpcRequest(
                    procedure: "${context.instancePath}",
                    path: "${schema.path}",
                    reqId: getRequestId(),
                    method: ${schema.method ? `HttpMethod.${schema.method.toLowerCase()}` : 'null'},
                    clientVersion: _clientVersion,
                    customHeaders: _headers,
                    data: ${schema.input ? `input` : 'null'},
                ),
                jsonDecoder: ${schema.output ? `(data) => ${outputType}.fromJsonString(data)` : `(_) => {}`},
                lastMsgId: lastMsgId,
                onData: onData,
                onRawData: onRawData,
                onOpen: onOpen,
                onClose: onClose,
                onError: onError,
                timeout: timeout ?? _timeout,
                maxRetryCount: maxRetryCount,
                maxRetryInterval: maxRetryInterval,
                heartbeatTimeoutMultiplier: _heartbeatTimeoutMultiplier,
            );
        }`;
    }
    return `${getCodeComments(metadata)}Future<${outputType}> ${functionName}(${inputType ? `${inputType} input, ` : ''}{
        String? transport,
        Duration? timeout,
        int? retry,
        Duration? retryDelay,
        OnErrorHook? onError,    
    }) async {
        final selectedTransport = resolveTransport([${schema.transports.map((transport) => `"${transport}"`).join(', ')}], transport ?? _defaultTransport);
        final dispatcher = _dispatchers[selectedTransport];
        if (dispatcher == null) throw MissingDispatcherError(selectedTransport);
        return dispatcher.handleRpc(
            req: RpcRequest(
                procedure: "${context.instancePath}",
                path: "${schema.path}",
                reqId: getRequestId(),
                method: ${schema.method ? `HttpMethod.${schema.method.toLowerCase()}` : 'null'},
                clientVersion: _clientVersion,
                customHeaders: _headers,
                data: ${schema.input ? 'input' : 'null'},
            ),
            jsonDecoder: ${schema.output ? `(data) => ${outputType}.fromJsonString(data)` : '(_) => {}'},
            timeout: timeout ?? _timeout,
            retry: retry ?? _retry,
            retryDelay: retryDelay ?? _retryDelay,
            onError: onError ?? _onError,
        );
    }`;
}

function getFunctionName(instancePath: string) {
    const parts = instancePath.split('.');
    return parts.pop() ?? '';
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
                transports: context.transports,
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
                transports: context.transports,
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
  final String _baseUrl;
  final String _wsConnectionUrl;

  final http.Client Function()? _createHttpClient;
  final String? _clientVersion = ${context.clientVersion ? `"${context.clientVersion}"` : 'null'};
  final FutureOr<Map<String, String>> Function()? _headers;
  final OnErrorHook? _onError;
  final int? _retry;
  final Duration? _retryDelay;
  final double? _heartbeatTimeoutMultiplier;
  final Duration? _timeout;
  final String _defaultTransport;
  late final Map<String, Dispatcher> _dispatchers;

  ${serviceName}({
    required String baseUrl,
    required String wsConnectionUrl,

    http.Client Function()? createHttpClient,
    FutureOr<Map<String, String>> Function()? headers,
    OnErrorHook? onError,
    int? retry,
    Duration? retryDelay,
    double? heartbeatTimeoutMultiplier,
    Duration? timeout,
    String? defaultTransport,
    Map<String, Dispatcher>? dispatchers,
  }) : 
       _baseUrl = baseUrl,
       _wsConnectionUrl = wsConnectionUrl,
       _createHttpClient = createHttpClient,
       _headers = headers,
       _onError = onError,
       _retry = retry,
       _retryDelay = retryDelay,
       _heartbeatTimeoutMultiplier = heartbeatTimeoutMultiplier,
       _timeout = timeout,
       _defaultTransport = defaultTransport ?? "${context.transports[0]}" {
        _dispatchers = dispatchers ?? {};
        ${
            context.transports.includes('http')
                ? `if (_dispatchers["http"] == null) {
            _dispatchers["http"] = HttpDispatcher(
                baseUrl: baseUrl,
                createHttpClient: _createHttpClient,
            );
        }`
                : ''
        }
        ${
            context.transports.includes('ws')
                ? `if (_dispatchers["ws"] == null) {
            _dispatchers["ws"] = WsDispatcher(
                connectionUrl: _wsConnectionUrl,
                heartbeatTimeoutMultiplier: _heartbeatTimeoutMultiplier,
            );
        }`
                : ''
        }
    }

  ${rpcParts.join('\n\n')}

  ${subServices
      .map(
          (service) => `  ${service.name} get ${service.key} => ${service.name}(
          baseUrl: _baseUrl,
          wsConnectionUrl: _wsConnectionUrl,
          headers: _headers,
          createHttpClient: _createHttpClient,
          onError: _onError,
          heartbeatTimeoutMultiplier: _heartbeatTimeoutMultiplier,
          timeout: _timeout,
          dispatchers: _dispatchers,
          defaultTransport: _defaultTransport,
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
