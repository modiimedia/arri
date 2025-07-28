import {
    AppDefinition,
    camelCase,
    kebabCase,
    pascalCase,
    RpcDefinition,
    Schema,
} from '@arrirpc/codegen-utils';
import { a, ASchema, CompiledValidator } from '@arrirpc/schema';

import { TransportAdapter, TransportAdapterOptions } from './adapter';
import { isHttpEndpointRegister } from './adapter_http';
import {
    RpcMiddleware,
    RpcMiddlewareContext,
    RpcOnErrorContext,
} from './middleware';
import { Rpc, RpcPostHandlerContext } from './rpc';
import { isEventStreamRpc, OutputStreamRpc } from './rpc_output_stream';

export class ArriApp implements ArriServiceBase {
    name?: string;
    description?: string;
    version?: string;
    externalDocs?: AppDefinition['externalDocs'];

    rpcRoutePrefix?: string;
    rpcDefinitionPath?: string;
    disableDefaultRoute: boolean;
    disableDefinitionRoute: boolean;

    private _defaultTransports: string[] = ['http'];
    private _registeredTransports: string[] = [];
    private _hasAdapter: boolean = false;
    private readonly _adapters: Record<string, TransportAdapter> = {};
    private readonly _adapterOptions: TransportAdapterOptions;
    private _procedures: Record<string, RpcDefinition> = {};
    private _definitions: Record<string, Schema> = {};

    private readonly _onRequest?: (
        context: RpcMiddlewareContext,
    ) => Promise<void> | void;
    private readonly _onBeforeResponse?: (
        context: RpcPostHandlerContext<unknown, unknown>,
    ) => Promise<void> | void;
    private readonly _onAfterResponse?: (
        context: RpcPostHandlerContext<unknown, unknown>,
    ) => Promise<void> | void;
    private readonly _onError?: (
        context: RpcOnErrorContext,
    ) => Promise<void> | void;

    constructor(
        options: {
            name?: string;
            description?: string;
            version?: string;
            externalDocs?: AppDefinition['externalDocs'];
            rpcRoutePrefix?: string;
            rpcDefinitionPath?: string;
            disableDefaultRoute?: boolean;
            disableDefinitionRoute?: boolean;
            defaultTransport?: string | string[];
            transports?: TransportAdapter[];
            heartbeatInterval?: number;
            heartbeatEnabled?: boolean;
            onRequest?: (context: RpcMiddlewareContext) => Promise<void> | void;
            onBeforeResponse?: (
                context: RpcPostHandlerContext<unknown, unknown>,
            ) => Promise<void> | void;
            onAfterResponse?: (
                context: RpcPostHandlerContext<unknown, unknown>,
            ) => Promise<void> | void;
            onError?: (context: RpcOnErrorContext) => Promise<void> | void;
        } = {},
    ) {
        this.name = options.name;
        this.description = options.description;
        this.version = options.version;
        this.externalDocs = options.externalDocs;
        this.rpcRoutePrefix = options.rpcRoutePrefix;
        this.rpcDefinitionPath = options.rpcDefinitionPath;
        this.disableDefaultRoute = options.disableDefaultRoute ?? false;
        this.disableDefinitionRoute = options.disableDefinitionRoute ?? false;
        this._adapterOptions = {
            heartbeatEnabled: options.heartbeatEnabled ?? true,
            heartbeatInterval: options.heartbeatInterval ?? 20000,
            onRequest: options.onRequest,
            onBeforeResponse: options.onBeforeResponse,
            onAfterResponse: options.onAfterResponse,
            onError: options.onError,
        };
        this._onRequest = options.onRequest;
        this._onBeforeResponse = options.onBeforeResponse;
        this._onAfterResponse = options.onAfterResponse;
        this._onError = options.onError;
        if (typeof options.defaultTransport === 'string') {
            this._defaultTransports = [options.defaultTransport];
        } else if (Array.isArray(options.defaultTransport)) {
            this._defaultTransports = options.defaultTransport;
        }
        if (typeof options.transports !== 'undefined') {
            for (const adapter of options.transports) {
                this.use(adapter);
            }
        }
    }

    get definitionPath(): string {
        return (
            this.rpcDefinitionPath ??
            `${this.rpcRoutePrefix ?? ''}/app-definition`
        );
    }

    use(service: ArriService): void;
    use(adapter: TransportAdapter): void;
    use(middleware: RpcMiddleware): void;
    use(input: ArriService | TransportAdapter | RpcMiddleware) {
        // register service
        if (input instanceof ArriService) {
            for (const [key, value] of Object.entries(input.definitions)) {
                this._definitions[key] = value;
            }
            for (const [key, value] of Object.entries(input.procedures)) {
                this.rpc(key, value);
            }
            return;
        }

        // register adapters
        if (typeof input === 'object') {
            input.setOptions(this._adapterOptions);
            if (isHttpEndpointRegister(input)) {
                input.registerEndpoint(
                    '/',
                    async (request) => {
                        const isPreflight = internalIsPreflightRequest(request);
                        if (isPreflight) {
                            return new Response('ok', { status: 200 });
                        }
                        const result = {
                            name: this.name,
                            description: this.description,
                            version: this.version,
                            definitionPath: this.definitionPath,
                        };
                        const headers = new Headers();
                        headers.set('Content-Type', 'application/json');
                        return new Response(JSON.stringify(result), {
                            status: 200,
                            headers: headers,
                        });
                    },
                    'get',
                );
                input.registerEndpoint(
                    this.definitionPath,
                    async (request) => {
                        const isPreflight = internalIsPreflightRequest(request);
                        if (isPreflight) {
                            return new Response('ok', { status: 200 });
                        }
                        const result = this.getAppDefinition();
                        const headers = new Headers();
                        headers.set('Content-Type', 'application/json');
                        return new Response(JSON.stringify(result), {
                            status: 200,
                            headers: headers,
                        });
                    },
                    'get',
                );
            }
            this._adapters[input.transportId] = input;
            if (!this._hasAdapter) this._hasAdapter = true;
            if (!this._registeredTransports.includes(input.transportId)) {
                this._registeredTransports.push(input.transportId);
            }
            return;
        }

        // register middlewares
        for (const adapter of Object.values(this._adapters)) {
            adapter.use(input);
        }
    }

    rpc(name: string, procedure: Rpc<any, any> | OutputStreamRpc<any, any>) {
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
        const inputId = procedure.input
            ? resolveTypeDefId(name, procedure.input, 'PARAMS')
            : undefined;
        const outputId = procedure.output
            ? resolveTypeDefId(name, procedure.output, 'RESPONSE')
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
            input?: CompiledValidator<any>;
            output?: CompiledValidator<any>;
        } = {
            input: this._resolveValidator(procedure.input),
            output: this._resolveValidator(procedure.output),
        };
        this._registerRpcType(
            procedure.name ?? name,
            'params',
            procedure.input,
        );
        this._registerRpcType(
            procedure.name ?? name,
            'response',
            procedure.output,
        );
        if (isEventStreamRpc(procedure)) {
            const def: RpcDefinition<string> = {
                transports: transports,
                path: (this.rpcRoutePrefix ?? '') + path,
                method: procedure.method,
                input: inputId,
                output: outputId,
                outputIsStream: true,
                description: procedure.description,
                isDeprecated: isDeprecated,
                deprecationNote: deprecatedNote,
            };
            this._procedures[procedure.name ?? name] = def;
            for (const t of transports) {
                const dispatcher = this._adapters[t];
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
            path: (this.rpcRoutePrefix ?? '') + path,
            method: procedure.method,
            input: inputId,
            output: outputId,
            description: procedure.description,
            isDeprecated: isDeprecated,
            deprecationNote: deprecatedNote,
        };
        this._procedures[procedure.name ?? name] = def;
        for (const t of transports) {
            const dispatcher = this._adapters[t];
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

    registerDefinitions(definitions: Record<string, Schema>): void {
        for (const [key, value] of Object.entries(definitions)) {
            this._definitions[key] = value;
        }
    }

    getAppDefinition(): AppDefinition {
        const result: AppDefinition = {
            schemaVersion: '0.0.8',
            info: {
                title: this.name,
                description: this.description,
                version: this.version,
            },
            transports: this._registeredTransports,
            externalDocs: this.externalDocs,
            procedures: this._procedures,
            definitions: this._definitions,
        };
        return result;
    }

    private _registerRpcType(
        rpcName: string,
        type: 'params' | 'response',
        def?: Schema,
    ) {
        if (!def) return;
        let key = def.metadata?.id ?? '';
        if (!key) {
            key = rpcName.split('.').join('_');
            switch (type) {
                case 'params':
                    key += `_params`;
                    break;
                case 'response':
                    key += '_response';
            }
            key = pascalCase(key, { normalize: true });
        }
        if (this._definitions[key]) return;
        this._definitions[key] = def;
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

    async start() {
        const tasks: Promise<unknown>[] = [];
        for (const dispatcher of Object.values(this._adapters)) {
            const p = dispatcher.start();
            if (p instanceof Promise) tasks.push(p);
        }
        const results = await Promise.allSettled(tasks);
        for (const result of results.filter(
            (item) => item.status === 'rejected',
        )) {
            // eslint-disable-next-line no-console
            console.error(result.reason);
        }
    }

    async stop() {
        const tasks: Promise<unknown>[] = [];
        for (const adapter of Object.values(this._adapters)) {
            const p = adapter.stop();
            if (p instanceof Promise) tasks.push(p);
        }
        const results = await Promise.allSettled(tasks);
        for (const result of results.filter(
            (item) => item.status === 'rejected',
        )) {
            // eslint-disable-next-line no-console
            console.error(result.reason);
        }
    }
}

function internalIsPreflightRequest(request: Request): boolean {
    const origin = request.headers.get('origin');
    const accessControlRequestMethod = request.headers.get(
        'access-control-request-method',
    );
    return (
        request.method === 'OPTIONS' && !!origin && !!accessControlRequestMethod
    );
}

export interface ArriServiceBase {
    rpc(
        name: string,
        procedure: Rpc<any, any> | OutputStreamRpc<any, any>,
    ): void;

    registerDefinitions(definitions: Record<string, Schema>): void;
}

export class ArriService implements ArriServiceBase {
    name: string;

    procedures: Record<string, Rpc<any, any> | OutputStreamRpc<any, any>> = {};
    definitions: Record<string, Schema> = {};

    private get formattedName() {
        return this.name.toLowerCase();
    }

    constructor(
        name: string,
        procedures?: Record<string, Rpc<any, any> | OutputStreamRpc<any, any>>,
    ) {
        this.name = name;

        if (!procedures) return;
        for (const [key, value] of Object.entries(procedures)) {
            const newKey = `${this.formattedName}.${key}`;
            this.procedures[newKey] = value;
        }
    }

    rpc(
        name: string,
        procedure: Rpc<any, any> | OutputStreamRpc<any, any>,
    ): void {
        const key = `${this.formattedName}.${camelCase(name, { normalize: true })}`;
        this.procedures[key] = procedure;
    }

    registerDefinitions(definitions: Record<string, Schema>): void {
        for (const [key, value] of Object.entries(definitions)) {
            this.definitions[key] = value;
        }
    }
}

export function defineService(
    name: string,
    procedures?: Record<string, Rpc<any, any> | OutputStreamRpc<any, any>>,
) {
    return new ArriService(name, procedures);
}

export function resolveTypeDefId(
    rpcName: string,
    schema: ASchema,
    schemaType: 'PARAMS' | 'RESPONSE',
) {
    if (schema.metadata?.id) return schema.metadata.id;

    let id = pascalCase(rpcName.split('.').join('_'), { normalize: true });
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
