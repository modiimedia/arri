import {
    type SchemaFormDiscriminator,
    type SchemaFormProperties,
    type SchemaFormValues,
    type AppDefinition,
    type RpcDefinition,
    SCHEMA_VERSION,
} from "arri-codegen-utils";
import { type AObjectSchema, type ASchema } from "arri-validate";
import {
    type App,
    createApp,
    type Router,
    createRouter,
    eventHandler,
    setResponseStatus,
} from "h3";
import { type ArriServerError, defineError, handleH3Error } from "./errors";
import { isEventStreamRpc, registerEventStreamRpc } from "./eventStreamRpc";
import { type MiddlewareEvent, type Middleware } from "./middleware";
import { type ArriRoute, registerRoute } from "./route";
import { ArriRouter, type ArriRouterBase } from "./router";
import {
    createHttpRpcDefinition,
    getRpcParamName,
    getRpcPath,
    getRpcResponseName,
    registerRpc,
    isRpcParamSchema,
    type NamedRpc,
    type RpcParamSchema,
} from "./rpc";
import {
    createWsRpcDefinition,
    registerWebsocketRpc,
    type NamedWebsocketRpc,
} from "./websocketRpc";

export const DEV_ENDPOINT_ROOT = `/__arri_dev__`;
export const DEV_DEFINITION_ENDPOINT = `${DEV_ENDPOINT_ROOT}/__definition`;

export type ModelMap = Record<
    string,
    SchemaFormProperties | SchemaFormDiscriminator | SchemaFormValues
>;

export const createAppDefinition = (def: AppDefinition) => def;

export class ArriApp implements ArriRouterBase {
    __isArri__ = true;
    readonly h3App: App;
    readonly h3Router: Router = createRouter();
    private readonly _rpcDefinitionPath: string;
    private readonly _rpcRoutePrefix: string;
    appInfo: AppDefinition["info"];
    private _procedures: Record<string, RpcDefinition> = {};
    private _models: ModelMap = {};
    private readonly _middlewares: Middleware[] = [];
    private readonly _onRequest: ArriOptions["onRequest"];
    private readonly _onAfterResponse: ArriOptions["onAfterResponse"];
    private readonly _onBeforeResponse: ArriOptions["onBeforeResponse"];
    private readonly _onError: ArriOptions["onError"];
    private readonly _debug: boolean;
    readonly definitionPath: string;

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
        this._rpcRoutePrefix = opts?.rpcRoutePrefix ?? "";
        this._rpcDefinitionPath = opts?.rpcDefinitionPath ?? "__definition";
        this.h3App.use(this.h3Router);
        this.definitionPath = this._rpcRoutePrefix
            ? `/${this._rpcRoutePrefix}/${this._rpcDefinitionPath}`
                  .split("//")
                  .join("/")
            : `/${this._rpcDefinitionPath}`;
        this.h3Router.get(
            this.definitionPath,
            eventHandler(() => this.getAppDefinition()),
        );
        if (!opts.disableDefaultRoute) {
            this.route({
                method: ["get", "head"],
                path: "/",
                handler: (_) => {
                    let schemaPath: string;
                    if (this._rpcRoutePrefix) {
                        schemaPath = `/${this._rpcRoutePrefix}/${this._rpcDefinitionPath}`;
                    } else {
                        schemaPath = `/${this._rpcDefinitionPath}`;
                    }
                    return {
                        title: this.appInfo?.title ?? "Arri Server",
                        description: this.appInfo?.description ?? null,
                        version: this.appInfo?.version ?? null,
                        schemaPath,
                        ...this.appInfo,
                    };
                },
            });
        }
        // this route is used by the dev server when auto-generating client code
        if (process.env.ARRI_DEV_MODE === "true") {
            this.h3Router.get(
                DEV_DEFINITION_ENDPOINT,
                eventHandler(() => this.getAppDefinition()),
            );
        }
        // default fallback route
        this.h3Router.use(
            "/**",
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

    use(input: Middleware | ArriRouter): void {
        if (typeof input === "object" && input instanceof ArriRouter) {
            for (const route of input.getRoutes()) {
                this.route(route);
            }
            for (const rpc of input.getProcedures()) {
                if (rpc.transport === "http") {
                    this.rpc(rpc);
                } else {
                    this.wsRpc(rpc);
                }
            }
            this.registerModels(input.getModels());
            return;
        }
        this._middlewares.push(input);
    }

    rpc<
        TIsEventStream extends boolean = false,
        TParams extends AObjectSchema<any, any> | undefined = undefined,
        TResponse extends AObjectSchema<any, any> | undefined = undefined,
    >(
        procedure: Omit<
            NamedRpc<TIsEventStream, TParams, TResponse>,
            "transport"
        >,
    ) {
        (procedure as any).transport = "http";
        const p = procedure as NamedRpc<TIsEventStream, TParams, TResponse>;
        const path = p.path ?? getRpcPath(p.name, this._rpcRoutePrefix);
        this._procedures[p.name] = createHttpRpcDefinition(p.name, path, p);

        if (isRpcParamSchema(p.params)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const paramName = getRpcParamName(p.name, p);
            if (paramName) {
                this._models[paramName] = p.params;
            }
        }
        if (isRpcParamSchema(p.response)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const responseName = getRpcResponseName(p.name, p as any);
            if (responseName) {
                this._models[responseName] = p.response;
            }
        }
        if (isEventStreamRpc(p)) {
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
        registerRpc(this.h3Router, path, p, {
            middleware: this._middlewares,
            onRequest: this._onRequest,
            onError: this._onError,
            onAfterResponse: this._onAfterResponse,
            onBeforeResponse: this._onBeforeResponse,
            debug: this._debug,
        });
    }

    wsRpc<
        TParams extends RpcParamSchema | undefined,
        TResponse extends RpcParamSchema | undefined,
    >(procedure: Omit<NamedWebsocketRpc<TParams, TResponse>, "transport">) {
        (procedure as any).transport = "ws";
        const p = procedure as NamedWebsocketRpc<TParams, TResponse>;
        const path =
            procedure.path ?? getRpcPath(procedure.name, this._rpcRoutePrefix);
        this._procedures[procedure.name] = createWsRpcDefinition(
            procedure.name,
            path,
            p,
        );
        if (isRpcParamSchema(procedure.params)) {
            const paramName = getRpcParamName(procedure.name, p);
            if (paramName) {
                this._models[paramName] = procedure.params;
            }
        }
        if (isRpcParamSchema(procedure.response)) {
            const responseName = getRpcResponseName(procedure.name, p);
            if (responseName) {
                this._models[responseName] = procedure.response;
            }
        }
        registerWebsocketRpc(this.h3Router, path, p);
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

    registerModels(models: ModelMap) {
        for (const key of Object.keys(models)) {
            this._models[key] = models[key]!;
        }
    }

    getAppDefinition(): AppDefinition {
        const appDef: AppDefinition = {
            arriSchemaVersion: SCHEMA_VERSION,
            info: this.appInfo,
            procedures: {},
            models: this._models as any,
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
    appInfo?: AppDefinition["info"];
    rpcRoutePrefix?: string;
    /**
     * Defaults to /__definitions
     * This parameters also takes the rpcRoutePrefix option into account
     */
    rpcDefinitionPath?: string;
    disableDefaultRoute?: boolean;
    onRequest?: (event: MiddlewareEvent) => void | Promise<void>;
    onAfterResponse?: (event: MiddlewareEvent) => void | Promise<void>;
    onBeforeResponse?: (event: MiddlewareEvent) => void | Promise<void>;
    onError?: (
        error: ArriServerError,
        event: MiddlewareEvent,
    ) => void | Promise<void>;
}
