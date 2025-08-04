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
    const params = def.input
        ? `${context.typePrefix}${pascalCase(validVarName(def.input))}`
        : undefined;
    const response = def.output
        ? `${context.typePrefix}${pascalCase(validVarName(def.output), { normalize: true })}`
        : undefined;
    const transportType = def.transports.map((val) => `'${val}'`).join(' | ');

    if (def.outputIsStream) {
        context.usedFeatures.sse = true;
        return `${getJsDocComment({
            description: def.description,
            isDeprecated: def.isDeprecated,
        })}    ${key}(
        ${params ? `params: ${params},` : ''}
        options?: EventStreamHooks<${response ?? 'undefined'}>
    ): EventStreamController {
        const req: RpcRequest<${params ?? 'undefined'}> = {
            procedure: '${context.instancePath}',
            path: '${def.path}',
            method: ${def.method ? `'${def.method}'` : 'undefined'},
            clientVersion: ${context.versionNumber ? `'${context.versionNumber}'` : 'undefined'},
            data: ${params ? 'params' : 'undefined'},
            customHeaders: this._options.headers,
        };
        const validator: RpcRequestValidator<${params ?? 'undefined'}, ${response ?? 'undefined'}> = {
            params: ${params ? `$$${params}` : 'UndefinedModelValidator'},
            response: ${response ? `$$${response}` : 'UndefinedModelValidator'},
        };
        const transport = ${
            def.transports.length === 1
                ? `'${def.transports[0]!}'`
                : `resolveTransport(
            [${def.transports.map((val) => `'${val}'`).join(', ')}],
            options?.transport,
            this._defaultTransport,
        )`
        };
        const dispatcher = this._dispatchers[transport];
        if(!dispatcher) {
            const err = new Error(
                \`Missing dispatcher for transport "\${transport}"\`,
            );
            this._options.onError?.(req, err);
            throw err;
        }
        return dispatcher.handleEventStreamRpc<${params ?? 'undefined'}, ${response ?? 'undefined'}>(
            req,
            validator,
            options ?? {},
        );
    }`;
    }

    return `${getJsDocComment({
        description: def.description,
        isDeprecated: def.isDeprecated,
    })}    async ${key}(${params ? `params: ${params}, ` : ''}options?: RpcOptions<${transportType}>): Promise<${response ?? 'undefined'}> {
        const finalOptions = resolveDispatcherOptions(options, this._options);
        const req: RpcRequest<${params ?? 'undefined'}> = {
            procedure: '${context.instancePath}',
            path: '${def.path}',
            method: ${def.method ? `'${def.method}'` : 'undefined'},
            clientVersion: ${context.versionNumber ? `'${context.versionNumber}'` : 'undefined'},
            data: ${params ? 'params' : 'undefined'},
            customHeaders: finalOptions.headers,
        };
        const validator: RpcRequestValidator<${params ?? 'undefined'}, ${response ?? 'undefined'}> = {
            params: ${params ? `$$${params}` : 'UndefinedModelValidator'},
            response: ${response ? `$$${response}` : 'UndefinedModelValidator'},
        };
        const transport = ${
            def.transports.length === 1
                ? `'${def.transports[0]!}'`
                : `resolveTransport(
            [${def.transports.map((val) => `'${val}'`).join(', ')}],
            options?.transport,
            this._defaultTransport,
        )`
        };
        const dispatcher = this._dispatchers[transport];
        if(!dispatcher) {
            const err = new Error(
                \`Missing dispatcher for transport "\${transport}"\`,
            );
            finalOptions.onError?.(req, err);
            throw err;
        }
        return dispatcher.handleRpc<${params ?? 'undefined'}, ${response ?? 'undefined'}>(
            req,
            validator,
            finalOptions,
        );
    }`;
}

export function getRpcKey(context: CodegenContext): string {
    const name = context.instancePath.split('.').pop() ?? '';
    return validVarName(name);
}
