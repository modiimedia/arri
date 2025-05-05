import {
    type AppDefinition,
    type RpcDefinition,
    SCHEMA_VERSION,
    type SchemaFormDiscriminator,
    type SchemaFormProperties,
    type SchemaFormValues,
} from '@arrirpc/codegen-utils';
import { type AObjectSchema, type ASchema } from '@arrirpc/schema';
import {
    type App,
    createApp,
    createRouter,
    defineEventHandler,
    eventHandler,
    H3Event,
    type Router,
    setResponseHeader,
    setResponseStatus,
} from 'h3';

import { RequestHookContext } from './context';
import { type arriError, defineError, handleH3Error } from './errors';
import { isEventStreamRpc, registerEventStreamRpc } from './eventStreamRpc';
import { type Middleware, MiddlewareEvent } from './middleware';
import { type ArriRoute, registerRoute } from './route';
import { ArriRouter } from './router';
import {
    createRpcDefinition,
    getRpcParamName,
    getRpcPath,
    getRpcResponseName,
    isRpcParamSchema,
    type NamedHttpRpc,
    registerRpc,
    Rpc,
} from './rpc';
import { ArriService } from './service';
import { TransportDispatcher } from './transport';

export type DefinitionMap = Record<
    string,
    SchemaFormProperties | SchemaFormDiscriminator | SchemaFormValues
>;

export const createAppDefinition = (def: AppDefinition) => def;

export class ArriApp {
    __isArri__ = true;
    readonly h3App: App;
    readonly h3Router: Router = createRouter();
    private readonly _rpcDefinitionPath: string;
    private readonly _rpcRoutePrefix: string;
    appInfo: AppDefinition['info'];
    private _procedures: Record<string, RpcDefinition> = {};
    private _definitions: DefinitionMap = {};
    private readonly _middlewares: Middleware[] = [];
    private readonly _onRequest: ArriOptions['onRequest'];
    private readonly _onAfterResponse: ArriOptions['onAfterResponse'];
    private readonly _onBeforeResponse: ArriOptions['onBeforeResponse'];
    private readonly _onError: ArriOptions['onError'];
    private readonly _debug: boolean;
    readonly definitionPath: string;

    private _transports: Record<string, TransportDispatcher> = {};

    constructor(opts: ArriOptions = {}) {
        this.appInfo = opts?.appInfo;
        this.h3App = createApp({
            debug: opts?.debug,
        });
        this._debug = opts.debug ?? false;
        this._onRequest = opts.onRequest;
        this._onError = opts.onError;
        this._onAfterResponse = opts.onAfterResponse;
        this._onBeforeResponse = opts.onBeforeResponse;
        this._rpcRoutePrefix = opts?.rpcRoutePrefix ?? '';
        this._rpcDefinitionPath = opts?.rpcDefinitionPath ?? '__definition';
        this.h3App.use(this.h3Router);
        this.definitionPath = this._rpcRoutePrefix
            ? `/${this._rpcRoutePrefix}/${this._rpcDefinitionPath}`
                  .split('//')
                  .join('/')
            : `/${this._rpcDefinitionPath}`;
        if (!opts.disableDefinitionRoute) {
            this.h3Router.get(
                this.definitionPath,
                defineEventHandler((event) => {
                    setResponseHeader(
                        event,
                        'Content-Type',
                        'application/json',
                    );
                    return this.getAppDefinition();
                }),
            );
        }
        if (!opts.disableDefaultRoute) {
            this.route({
                method: ['get', 'head'],
                path: '/',
                handler: async (_) => {
                    const response: Record<string, string> = {
                        title: this.appInfo?.title ?? 'Arri-RPC Server',
                        description:
                            this.appInfo?.description ??
                            'This server utilizes Arri-RPC. Visit the schema path to see all of the available procedures.',
                        ...this.appInfo,
                    };
                    if (opts.disableDefinitionRoute) {
                        return response;
                    }
                    let schemaPath: string;
                    if (this._rpcRoutePrefix) {
                        schemaPath = `/${this._rpcRoutePrefix}/${this._rpcDefinitionPath}`;
                    } else {
                        schemaPath = `/${this._rpcDefinitionPath}`;
                    }
                    response.schemaPath = schemaPath;
                    return response;
                },
            });
        }
        // // this route is used by the dev server when auto-generating client code
        // if (process.env.ARRI_DEV_MODE === "true") {
        //     this.h3Router.get(
        //         DEV_DEFINITION_ENDPOINT,
        //         eventHandler((event) => {
        //             setResponseHeader(
        //                 event,
        //                 "Content-Type",
        //                 "application/json",
        //             );
        //             return this.getAppDefinition();
        //         }),
        //     );
        // }
        // default fallback route
        this.h3Router.use(
            '/**',
            eventHandler(async (event) => {
                setResponseStatus(event, 404);
                const error = defineError(404);
                try {
                    if (this._onRequest) {
                        await this._onRequest(event);
                    }
                } catch (err) {
                    await handleH3Error(err, event, this._onError, this._debug);
                }
                if (event.handled) {
                    return;
                }
                return handleH3Error(error, event, this._onError, this._debug);
            }),
        );
    }
    use(input: TransportDispatcher): void;
    use(input: ArriRouter): void;
    use(input: ArriService): void;
    use(input: TransportDispatcher | ArriRouter | ArriService): void {
        if (typeof input !== 'object' || input === null) return;
        if ('transportId' in input) {
            if (this._transports[input.transportId]) {
                console.warn(
                    `[WARNING] Overriding transport already registered for ${input.transportId}`,
                );
            }
            this._transports[input.transportId] = input;
            return;
        }
        if (input instanceof ArriRouter) {
            for (const route of input.getRoutes()) {
                this.route(route);
            }
            this.registerDefinitions(input.getDefinitions());
            return;
        }
        if (input instanceof ArriService) {
            for (const rpc of input.getProcedures()) {
                this.rpc(rpc.name, rpc);
            }
            this.registerDefinitions(input.getDefinitions());
            return;
        }
    }

    rpc(name: string, procedure: Rpc<any, any, any>) {
        (procedure as any).name = name;
        const p = procedure as NamedHttpRpc;
        const transport = this._transports[p.transport];
        if (!transport) {
            throw new Error(`Missing transport ${p.transport}`);
        }
        const path = p.path ?? getRpcPath(p.name, this._rpcRoutePrefix);
        if (p.transport === 'http') {
            this._procedures[p.name] = createRpcDefinition(p.name, path, p);
        }

        if (isRpcParamSchema(p.params)) {
            const paramName = getRpcParamName(p.name, p);
            if (paramName) {
                this._definitions[paramName] = p.params;
            }
        }
        if (isRpcParamSchema(p.response)) {
            const responseName = getRpcResponseName(p.name, p as any);
            if (responseName) {
                this._definitions[responseName] = p.response;
            }
        }

        if (isEventStreamRpc(p)) {
            transport.RegisterEventStreamRpc(name, p, procedure.handler);
            registerEventStreamRpc(this.h3Router, path, p, {
                middleware: this._middlewares,
                onRequest: this._onRequest,
                onError: this._onError,
                onAfterResponse: this._onAfterResponse,
                onBeforeResponse: this._onBeforeResponse,
                debug: this._debug,
            });
            return;
        }
        transport.RegisterRpc(name, procedure, procedure.handler);
        return;
    }

    route<
        TPath extends string,
        TQuery extends AObjectSchema<any, any>,
        TBody extends ASchema<any>,
        TResponse = any,
    >(route: ArriRoute<TPath, TQuery, TBody, TResponse>) {
        registerRoute(this.h3Router, route, {
            middleware: this._middlewares,
            onRequest: this._onRequest,
            onError: this._onError,
            onAfterResponse: this._onAfterResponse,
            onBeforeResponse: this._onBeforeResponse,
            debug: this._debug,
        });
    }

    registerDefinitions(definitions: DefinitionMap) {
        for (const key of Object.keys(definitions)) {
            this._definitions[key] = definitions[key]!;
        }
    }

    getAppDefinition(): AppDefinition {
        const appDef: AppDefinition = {
            schemaVersion: SCHEMA_VERSION,
            info: this.appInfo,
            procedures: {},
            definitions: this._definitions as any,
        };
        for (const key of Object.keys(this._procedures)) {
            const rpc = this._procedures[key]!;
            appDef.procedures[key] = rpc;
        }
        return appDef;
    }
}

export interface ArriOptions {
    debug?: boolean;
    /**
     * Metadata to display in the __definition.json file
     */
    appInfo?: AppDefinition['info'];
    rpcRoutePrefix?: string;
    /**
     * Defaults to /__definitions
     * This parameters also takes the rpcRoutePrefix option into account
     */
    rpcDefinitionPath?: string;
    disableDefaultRoute?: boolean;
    disableDefinitionRoute?: boolean;
    onRequest?: (event: MiddlewareEvent) => void | Promise<void>;
    onAfterResponse?: (event: RequestHookEvent) => void | Promise<void>;
    onBeforeResponse?: (event: RequestHookEvent) => void | Promise<void>;
    onError?: (
        error: arriError,
        event: RequestHookEvent,
    ) => void | Promise<void>;
}

export interface RequestHookEvent extends Omit<H3Event, 'context'> {
    context: RequestHookContext;
}
