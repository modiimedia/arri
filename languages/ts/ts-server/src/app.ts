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
    createHttpRpcDefinition,
    getRpcParamName,
    getRpcPath,
    getRpcResponseName,
    isRpcParamSchema,
    type NamedHttpRpc,
    registerRpc,
    Rpc,
} from './rpc';
import { ArriService } from './service';
import {
    type ArriWorker,
    defineWorker,
    type WorkerErrorHandler,
    type WorkerHandler,
} from './worker';

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
    private readonly _procedures: Record<string, RpcDefinition> = {};
    private _definitions: DefinitionMap = {};
    private readonly _middlewares: Middleware[] = [];
    private readonly _workers: ArriWorker[] = [];
    private readonly _onStartHooks: Array<() => Promise<void> | void> = [];
    private readonly _onStopHooks: Array<() => Promise<void> | void> = [];
    private readonly _workerErrorHooks: WorkerErrorHandler[] = [];
    private _abortController: AbortController | null = null;
    private _isRunning = false;
    private readonly _onRequest: ArriOptions['onRequest'];
    private readonly _onAfterResponse: ArriOptions['onAfterResponse'];
    private readonly _onBeforeResponse: ArriOptions['onBeforeResponse'];
    private readonly _onError: ArriOptions['onError'];
    private readonly _debug: boolean;
    readonly definitionPath: string;

    private readonly _heartbeatMs: number;

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
        if (opts.onStart) {
            this.onStart(opts.onStart);
        }
        if (opts.onStop) {
            this.onStop(opts.onStop);
        }
        if (opts.onWorkerError) {
            this.onWorkerError(opts.onWorkerError);
        }
        this._heartbeatMs = opts.heartbeatMs ?? 20000;
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
    use(input: Middleware): void;
    use(input: ArriRouter): void;
    use(input: ArriService): void;
    use(input: Middleware | ArriRouter | ArriService): void {
        if (typeof input === 'object' && input instanceof ArriRouter) {
            for (const route of input.getRoutes()) {
                this.route(route);
            }
            this.registerDefinitions(input.getDefinitions());
            return;
        }
        if (typeof input === 'object' && input instanceof ArriService) {
            for (const rpc of input.getProcedures()) {
                this.rpc(rpc.name, rpc);
            }
            this.registerDefinitions(input.getDefinitions());
            for (const worker of input.getWorkers()) {
                this.registerWorker(worker);
            }
            return;
        }
        this._middlewares.push(input);
    }

    rpc(name: string, procedure: Rpc<any, any, any>) {
        (procedure as any).name = name;
        const p = procedure as NamedHttpRpc;
        const path = p.path ?? getRpcPath(p.name, this._rpcRoutePrefix);
        if (p.transport === 'http') {
            this._procedures[p.name] = createHttpRpcDefinition(p.name, path, p);
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
        if (p.transport === 'http') {
            if (isEventStreamRpc(p)) {
                registerEventStreamRpc(this.h3Router, path, p, {
                    middleware: this._middlewares,
                    onRequest: this._onRequest,
                    onError: this._onError,
                    onAfterResponse: this._onAfterResponse,
                    onBeforeResponse: this._onBeforeResponse,
                    debug: this._debug,
                    heartbeatMs: this._heartbeatMs,
                });
                return;
            }
            registerRpc(this.h3Router, path, p, {
                middleware: this._middlewares,
                onRequest: this._onRequest,
                onError: this._onError,
                onAfterResponse: this._onAfterResponse,
                onBeforeResponse: this._onBeforeResponse,
                debug: this._debug,
            });
            return;
        }
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

    registerWorker(worker: ArriWorker | WorkerHandler) {
        const w = defineWorker(worker);
        this._workers.push(w);
        if (this._isRunning && this._abortController) {
            void (async () => {
                try {
                    await w.start(this._abortController!.signal);
                } catch (err) {
                    await this._handleWorkerError(w, err);
                }
            })();
        }
    }

    onStart(hook: () => Promise<void> | void) {
        this._onStartHooks.push(hook);
    }

    onStop(hook: () => Promise<void> | void) {
        this._onStopHooks.push(hook);
    }

    onWorkerError(hook: WorkerErrorHandler) {
        this._workerErrorHooks.push(hook);
    }

    private async _handleWorkerError(worker: ArriWorker, error: unknown) {
        let handled = false;
        if (worker.onError) {
            try {
                await worker.onError(error);
                handled = true;
            } catch (hookErr) {
                // eslint-disable-next-line no-console
                console.error(
                    `[Arri] Error in worker.onError hook for worker ${worker.name ?? 'unnamed'}:`,
                    hookErr,
                );
            }
        }
        for (const hook of this._workerErrorHooks) {
            try {
                await hook(error, worker);
                handled = true;
            } catch (hookErr) {
                // eslint-disable-next-line no-console
                console.error(
                    `[Arri] Error in onWorkerError hook for worker ${worker.name ?? 'unnamed'}:`,
                    hookErr,
                );
            }
        }
        if (!handled) {
            // eslint-disable-next-line no-console
            console.error(
                `[Arri] Unhandled error in worker ${worker.name ?? 'unnamed'}:`,
                error,
            );
        }
    }

    async start(): Promise<void> {
        if (this._isRunning) {
            return;
        }
        this._isRunning = true;
        const controller = new AbortController();
        this._abortController = controller;

        try {
            for (const hook of this._onStartHooks) {
                await hook();
            }
        } catch (err) {
            this._isRunning = false;
            controller.abort();
            this._abortController = null;
            throw err;
        }

        for (const worker of this._workers) {
            void (async () => {
                try {
                    await worker.start(controller.signal);
                } catch (err) {
                    await this._handleWorkerError(worker, err);
                }
            })();
        }
    }

    async stop(): Promise<void> {
        if (!this._isRunning) {
            return;
        }
        this._isRunning = false;
        this._abortController?.abort();

        const stopPromises = this._workers.map(async (worker) => {
            try {
                if (worker.stop) {
                    await worker.stop();
                }
            } catch (err) {
                await this._handleWorkerError(worker, err);
            }
        });

        const hookPromises = this._onStopHooks.map(async (hook) => {
            try {
                await hook();
            } catch (err) {
                if (this._debug) {
                    // eslint-disable-next-line no-console
                    console.error('Error in onStop hook:', err);
                }
            }
        });

        await Promise.allSettled([...stopPromises, ...hookPromises]);
    }

    get workers(): ArriWorker[] {
        return [...this._workers];
    }

    get isRunning(): boolean {
        return this._isRunning;
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
    heartbeatMs?: number;
    onRequest?: (event: MiddlewareEvent) => void | Promise<void>;
    onAfterResponse?: (event: RequestHookEvent) => void | Promise<void>;
    onBeforeResponse?: (event: RequestHookEvent) => void | Promise<void>;
    onError?: (
        error: arriError,
        event: RequestHookEvent,
    ) => void | Promise<void>;
    onStart?: () => Promise<void> | void;
    onStop?: () => Promise<void> | void;
    onWorkerError?: WorkerErrorHandler;
}

export interface RequestHookEvent extends Omit<H3Event, 'context'> {
    context: RequestHookContext;
}
