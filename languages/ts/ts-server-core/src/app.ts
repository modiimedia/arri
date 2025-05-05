import { kebabCase, pascalCase, RpcDefinition } from '@arrirpc/codegen-utils';
import { a, ASchema, CompiledValidator } from '@arrirpc/schema';

import { Rpc } from './rpc';
import { EventStreamRpc, isEventStreamRpc } from './rpc_event_stream';
import { Dispatcher } from './transport';

export class ArriApp implements ArriServiceBase {
    name?: string;
    description?: string;
    version?: string;

    rpcRoutePrefix?: string;
    rpcDefinitionPath?: string;
    disableDefaultRoute: boolean;
    disableDefinitionRoute: boolean;

    private _defaultTransports: string[] = ['http'];
    private _hasDispatcher: boolean = false;
    private readonly _dispatchers: Record<string, Dispatcher> = {};

    constructor(options: {
        name?: string;
        description?: string;
        version?: string;
        rpcRoutePrefix?: string;
        rpcDefinitionPath?: string;
        disableDefaultRoute?: boolean;
        disableDefinitionRoute?: boolean;
        defaultTransport?: string | string[];
    }) {
        this.name = options.name;
        this.description = options.description;
        this.version = options.version;
        this.rpcRoutePrefix = options.rpcRoutePrefix;
        this.rpcDefinitionPath = options.rpcDefinitionPath;
        this.disableDefaultRoute = options.disableDefaultRoute ?? false;
        this.disableDefinitionRoute = options.disableDefinitionRoute ?? false;
        if (typeof options.defaultTransport === 'string') {
            this._defaultTransports = [options.defaultTransport];
        } else if (Array.isArray(options.defaultTransport)) {
            this._defaultTransports = options.defaultTransport;
        }
    }

    use(dispatcher: Dispatcher) {
        this._dispatchers[dispatcher.transportId] = dispatcher;
        if (!this._hasDispatcher) this._hasDispatcher = true;
    }

    rpc(name: string, procedure: Rpc<any, any> | EventStreamRpc<any, any>) {
        const transports = this._resolveTransports(procedure.transport);
        let path =
            procedure.path ??
            (procedure.name ?? name)
                ?.split('.')
                .map((part) => kebabCase(part).toLowerCase())
                .join('/');
        if (!path.startsWith('/')) {
            path = `/${path}`;
        }
        const paramsId = procedure.params
            ? resolveTypeDefId(name, procedure.params, 'PARAMS')
            : undefined;
        const responseId = procedure.response
            ? resolveTypeDefId(name, procedure.response, 'RESPONSE')
            : undefined;
        const isDeprecated =
            typeof procedure.isDeprecated === 'boolean'
                ? procedure.isDeprecated
                : typeof procedure.isDeprecated === 'string' &&
                    procedure.isDeprecated.length
                  ? true
                  : undefined;
        const deprecatedNote =
            typeof procedure.isDeprecated === 'string'
                ? procedure.isDeprecated
                : undefined;
        const validators: {
            params?: CompiledValidator<any>;
            response?: CompiledValidator<any>;
        } = {
            params: this._resolveValidator(procedure.params),
            response: this._resolveValidator(procedure.response),
        };
        if (isEventStreamRpc(procedure)) {
            const def: RpcDefinition<string> = {
                transports: transports,
                path: path,
                method: procedure.method,
                params: paramsId,
                response: responseId,
                isEventStream: true,
                description: procedure.description,
                isDeprecated: isDeprecated,
                deprecationNote: deprecatedNote,
            };
            for (const t of transports) {
                const dispatcher = this._dispatchers[t];
                if (!dispatcher) {
                    throw new Error(
                        `Missing dispatcher for the following transport: "${t}"`,
                    );
                }
                dispatcher.registerEventStreamRpc(
                    procedure.name ?? name,
                    def,
                    validators,
                    procedure.handler,
                );
            }
            return;
        }
        const def: RpcDefinition<string> = {
            transports: transports,
            path: path,
            method: procedure.method,
            params: paramsId,
            response: responseId,
            description: procedure.description,
            isDeprecated: isDeprecated,
            deprecationNote: deprecatedNote,
        };
        for (const t of transports) {
            const dispatcher = this._dispatchers[t];
            if (!dispatcher) {
                throw new Error(
                    `Missing dispatcher for the following transport: "${t}"`,
                );
            }
            dispatcher.registerRpc(
                procedure.name ?? name,
                def,
                validators,
                procedure.handler,
                procedure.postHandler,
            );
        }
    }

    private _resolveValidator(
        schema: ASchema | undefined,
    ): CompiledValidator<any> | undefined {
        if (!schema) return undefined;
        try {
            return a.compile(schema);
        } catch (_) {
            return {
                schema: schema,
                validate: (input: unknown) => a.validate(schema, input),
                parse: (input: unknown) => a.parse(schema, input),
                parseUnsafe: (input: unknown) => a.parseUnsafe(schema, input),
                coerce: (input: unknown) => a.coerce(schema, input),
                coerceUnsafe: (input: unknown) => a.coerceUnsafe(schema, input),
                serialize: (input: any) => a.serialize(schema, input),
                serializeUnsafe: (input: any) =>
                    a.serializeUnsafe(schema, input),
                errors: (input: unknown) => a.errors(schema, input),
                compiledCode: undefined,
            };
        }
    }

    private _resolveTransports(
        rpcTransport: string | string[] | undefined,
    ): string[] {
        if (typeof rpcTransport === 'string') return [rpcTransport];
        if (typeof rpcTransport === 'undefined') return this._defaultTransports;
        return rpcTransport;
    }
}

export interface ArriServiceBase {
    rpc(
        name: string,
        procedure: Rpc<any, any> | EventStreamRpc<any, any>,
    ): void;
}

export function resolveTypeDefId(
    rpcName: string,
    schema: ASchema,
    schemaType: 'PARAMS' | 'RESPONSE',
) {
    if (schema.metadata?.id) return schema.metadata.id;

    let id = pascalCase(rpcName.split('.'), { normalize: true });
    switch (schemaType) {
        case 'PARAMS':
            id += `Params`;
            break;
        case 'RESPONSE':
            id += 'Response';
            break;
        default:
            schemaType satisfies never;
            break;
    }
    return id;
}
