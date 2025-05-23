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

export function getRpcKey(context: CodegenContext): string {
    const name = context.instancePath.split('.').pop() ?? '';
    return validVarName(name);
}
