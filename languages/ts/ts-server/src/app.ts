import {
    AppDefinition,
    camelCase,
    kebabCase,
    pascalCase,
    RpcDefinition,
    Schema,
} from '@arrirpc/codegen-utils';
import { a, ASchema, CompiledValidator } from '@arrirpc/schema';

import { ServerTransportAdapter } from './adapter';
import { RpcMiddleware } from './middleware';
import { Rpc } from './rpc';
import { EventStreamRpc, isEventStreamRpc } from './rpc_event_stream';

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
    private readonly _adapters: Record<string, ServerTransportAdapter> = {};
    private _procedures: Record<string, RpcDefinition> = {};
    private _definitions: Record<string, Schema> = {};
    private readonly _heartbeatInterval: number;
    private readonly _heartbeatEnabled: boolean;

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
            transports?: ServerTransportAdapter[];
            heartbeatInterval?: number;
            heartbeatEnabled?: boolean;
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
        this._heartbeatInterval = options.heartbeatInterval ?? 20000;
        this._heartbeatEnabled = options.heartbeatEnabled ?? true;
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
    use(adapter: ServerTransportAdapter): void;
    use(middleware: RpcMiddleware): void;
    use(input: ArriService | ServerTransportAdapter | RpcMiddleware) {
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
            input.setOptions({
                heartbeatInterval: this._heartbeatInterval,
                heartbeatEnabled: this._heartbeatEnabled,
            });
            if (typeof input.registerHomeRoute === 'function') {
                input.registerHomeRoute('/', () => ({
                    name: this.name,
                    description: this.description,
                    version: this.version,
                    definitionPath: this.definitionPath,
                }));
            }
            if (typeof input.registerDefinitionRoute === 'function') {
                input.registerDefinitionRoute(this.definitionPath, () =>
                    this.getAppDefinition(),
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
        this._registerRpcType(
            procedure.name ?? name,
            'params',
            procedure.params,
        );
        this._registerRpcType(
            procedure.name ?? name,
            'response',
            procedure.response,
        );
        if (isEventStreamRpc(procedure)) {
            const def: RpcDefinition<string> = {
                transports: transports,
                path: (this.rpcRoutePrefix ?? '') + path,
                method: procedure.method,
                params: paramsId,
                response: responseId,
                isEventStream: true,
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
            params: paramsId,
            response: responseId,
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

export interface ArriServiceBase {
    rpc(
        name: string,
        procedure: Rpc<any, any> | EventStreamRpc<any, any>,
    ): void;

    registerDefinitions(definitions: Record<string, Schema>): void;
}

export class ArriService implements ArriServiceBase {
    name: string;

    procedures: Record<string, Rpc<any, any> | EventStreamRpc<any, any>> = {};
    definitions: Record<string, Schema> = {};

    private get formattedName() {
        return this.name.toLowerCase();
    }

    constructor(
        name: string,
        procedures?: Record<string, Rpc<any, any> | EventStreamRpc<any, any>>,
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
        procedure: Rpc<any, any> | EventStreamRpc<any, any>,
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
    procedures?: Record<string, Rpc<any, any> | EventStreamRpc<any, any>>,
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
