import { pascalCase, RpcDefinition } from '@arrirpc/codegen-utils';

import { CodegenContext, getJsDocComment, validVarName } from './common';

export type RpcGenerator = (
    def: RpcDefinition,
    context: CodegenContext,
) => string;

export function defineRpcGenerator(fn: RpcGenerator): RpcGenerator {
    return fn;
}

export function tsRpcFromDefinition(
    def: RpcDefinition,
    context: CodegenContext,
): string {
    const customFn = context.rpcGenerators[def.transport];
    if (customFn) return customFn(def, context);
    switch (def.transport) {
        case 'http':
            return httpRpcFromDefinition(def, context);
        case 'ws':
            return wsRpcFromDefinition(def, context);
        default:
            console.warn(
                `[ts-codegen] Warning: unsupported transport "${def.transport}". Ignoring ${context.instancePath}.`,
            );
            return '';
    }
}

export function httpRpcFromDefinition(
    def: RpcDefinition,
    context: CodegenContext,
): string {
    const key = getRpcKey(context);
    const params = def.params
        ? `${context.typePrefix}${pascalCase(validVarName(def.params))}`
        : undefined;
    const response = def.response
        ? `${context.typePrefix}${pascalCase(validVarName(def.response), { normalize: true })}`
        : undefined;
    if (def.isEventStream) {
        context.usedFeatures.sse = true;
        return `${getJsDocComment({
            description: def.description,
            isDeprecated: def.isDeprecated,
        })}    ${key}(${params ? `params: ${params},` : ''} options: InferRpcDispatcherEventStreamOptions<THttp> = {}): EventSourceController {
        return this._http.handleEventStreamRpc<${params}, ${response}>(
            {
                procedure: '${context.instancePath}',
                path: '${def.path}',
                method: ${def.method ? `'${def.method.toLowerCase()}'` : 'undefined'},
                clientVersion: '${context.versionNumber}',
                data: ${def.params ? 'params' : 'undefined'},
                customHeaders: this._headers,
            },
            {
                params: ${def.params ? `$$${def.params}` : 'UndefinedModelValidator'},
                response: ${def.response ? `$$${def.response}` : 'UndefinedModelValidator'},
                onError: this._onError,
            },
            options,
        );
    }`;
    }
    return `${getJsDocComment({
        description: def.description,
        isDeprecated: def.isDeprecated,
    })}    async ${key}(${params ? `params: ${params}, ` : ''}options?: InferRpcDispatcherOptions<THttp>): Promise<${response ?? 'undefined'}> {
        return this._http.handleRpc<${params}, ${response}>(
            {
                procedure: '${context.instancePath}',
                path: '${def.path}',
                method: ${def.method ? `'${def.method.toLowerCase()}'` : 'undefined'},
                clientVersion: '${context.versionNumber}',
                data: ${params ? 'params' : 'undefined'},
                customHeaders: this._headers,
            },
            {
                params: ${def.params ? `$$${def.params}` : 'UndefinedModelValidator'},
                response: ${def.response ? `$$${def.response}` : 'UndefinedModelValidator'},
                onError: this._onError,
            },
            options,
        );
    }`;
}

export function wsRpcFromDefinition(
    def: RpcDefinition,
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
    })}    async ${key}(options: WsOptions<${response ?? 'undefined'}> = {}): Promise<WsController<${params ?? 'undefined'},${response ?? 'undefined'}>> {
        return arriWsRequest<${params ?? 'undefined'}, ${response ?? 'undefined'}>({
            url: \`\${this._baseUrl}${def.path}\`,
            headers: this._headers,
            responseFromJson: ${response ? `$$${response}.fromJson` : '() => {}'},
            responseFromString: ${response ? `$$${response}.fromJsonString` : '() => {}'},
            serializer: ${params ? `$$${params}.toJsonString` : '() => {}'},
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
    const name = context.instancePath.split('.').pop() ?? '';
    return validVarName(name);
}
