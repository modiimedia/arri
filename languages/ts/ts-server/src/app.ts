import {
    type AppDefinition,
    type RpcDefinition,
    SCHEMA_VERSION,
    type SchemaFormDiscriminator,
    type SchemaFormProperties,
    type SchemaFormValues,
} from "@arrirpc/codegen-utils";
import { type AObjectSchema, type ASchema } from "@arrirpc/schema";
import { DEV_DEFINITION_ENDPOINT } from "arri";
import {
    type App,
    createApp,
    createRouter,
    eventHandler,
    type Router,
    setResponseStatus,
} from "h3";

import { type ArriServerError, defineError, handleH3Error } from "./errors";
import { isEventStreamRpc, registerEventStreamRpc } from "./eventStreamRpc";
import { type Middleware, type MiddlewareEvent } from "./middleware";
import { type ArriRoute, registerRoute } from "./route";
import { ArriRouter, ArriService } from "./router";
import {
    createHttpRpcDefinition,
    getRpcParamName,
    getRpcPath,
    getRpcResponseName,
    isRpcParamSchema,
    type NamedRpc,
    registerRpc,
    Rpc,
} from "./rpc";
import {
    createWsRpcDefinition,
    type NamedWebsocketRpc,
    registerWebsocketRpc,
    WebsocketRpc,
} from "./websocketRpc";

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
    appInfo: AppDefinition["info"];
    private _procedures: Record<string, RpcDefinition> = {};
    private _definitions: DefinitionMap = {};
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
        if (!opts.disableDefinitionRoute) {
            this.h3Router.get(
                this.definitionPath,
                eventHandler(() => this.getAppDefinition()),
            );
        }
        if (!opts.disableDefaultRoute) {
            this.route({
                method: ["get", "head"],
                path: "/",
                handler: (_) => {
                    const response: Record<string, string> = {
                        title: this.appInfo?.title ?? "Arri-RPC Server",
                        description:
                            this.appInfo?.description ??
                            "This server utilizes Arri-RPC. Visit the schema path to see all of the available procedures.",
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

    use(input: Middleware | ArriRouter | ArriService): void {
        if (typeof input === "object" && input instanceof ArriRouter) {
            for (const route of input.getRoutes()) {
                this.route(route);
            }
            this.registerDefinitions(input.getDefinitions());
            return;
        }
        if (typeof input === "object" && input instanceof ArriService) {
            for (const rpc of input.getProcedures()) {
                this.rpc(rpc.name, rpc);
            }
            this.registerDefinitions(input.getDefinitions());
            return;
        }
        this._middlewares.push(input);
    }

    rpc(name: string, procedure: Rpc<any, any, any> | WebsocketRpc<any, any>) {
        (procedure as any).name = name;
        const p = procedure as NamedRpc | NamedWebsocketRpc;
        const path = p.path ?? getRpcPath(p.name, this._rpcRoutePrefix);
        if (p.transport === "http") {
            this._procedures[p.name] = createHttpRpcDefinition(p.name, path, p);
        } else if (p.transport === "ws") {
            this._procedures[p.name] = createWsRpcDefinition(p.name, path, p);
        }

        if (isRpcParamSchema(p.params)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const paramName = getRpcParamName(p.name, p);
            if (paramName) {
                this._definitions[paramName] = p.params;
            }
        }
        if (isRpcParamSchema(p.response)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const responseName = getRpcResponseName(p.name, p as any);
            if (responseName) {
                this._definitions[responseName] = p.response;
            }
        }
        if (p.transport === "http") {
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
            return;
        }
        if (p.transport === "ws") {
            registerWebsocketRpc(this.h3Router, path, p);
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
    disableDefinitionRoute?: boolean;
    onRequest?: (event: MiddlewareEvent) => void | Promise<void>;
    onAfterResponse?: (event: MiddlewareEvent) => void | Promise<void>;
    onBeforeResponse?: (event: MiddlewareEvent) => void | Promise<void>;
    onError?: (
        error: ArriServerError,
        event: MiddlewareEvent,
    ) => void | Promise<void>;
}
