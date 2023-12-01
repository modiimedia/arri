import {
    type SchemaFormDiscriminator,
    type SchemaFormProperties,
    type SchemaFormValues,
    type AppDefinition,
    type RpcDefinition,
} from "arri-codegen-utils";
import { type AObjectSchema, type ASchema } from "arri-validate";
import {
    type App,
    createApp,
    type Router,
    createRouter,
    eventHandler,
    type H3Error,
    sendError,
    setResponseStatus,
} from "h3";
import { defineError, handleH3Error } from "./errors";
import { isEventStreamRpc, registerEventStreamRpc } from "./eventStreamRpc";
import { type MiddlewareEvent, type Middleware } from "./middleware";
import { type ArriRoute, registerRoute } from "./route";
import { ArriRouter, type ArriRouterBase } from "./router";
import {
    createRpcDefinition,
    getRpcParamName,
    getRpcPath,
    getRpcResponseName,
    registerRpc,
    isRpcParamSchema,
    type NamedRpc,
} from "./rpc";

export const DEV_ENDPOINT_ROOT = `/__arri_dev__`;
export const DEV_DEFINITION_ENDPOINT = `${DEV_ENDPOINT_ROOT}/__definition`;

export type ModelMap = Record<
    string,
    SchemaFormProperties | SchemaFormDiscriminator | SchemaFormValues
>;

export class ArriApp implements ArriRouterBase {
    __isArri__ = true;
    readonly h3App: App;
    readonly h3Router: Router = createRouter();
    private readonly rpcDefinitionPath: string;
    private readonly rpcRoutePrefix: string;
    appInfo: AppDefinition["info"];
    private procedures: Record<string, RpcDefinition> = {};
    private models: ModelMap = {};
    private readonly middlewares: Middleware[] = [];
    private readonly onRequest: ArriOptions["onRequest"];
    private readonly onAfterResponse: ArriOptions["onAfterResponse"];
    private readonly onBeforeResponse: ArriOptions["onBeforeResponse"];
    private readonly onError: ArriOptions["onError"];

    constructor(opts: ArriOptions = {}) {
        this.appInfo = opts?.appInfo;
        this.h3App = createApp({
            debug: opts?.debug,
        });
        this.onRequest = opts.onRequest;
        this.onError = opts.onError;
        this.onAfterResponse = opts.onAfterResponse;
        this.onBeforeResponse = opts.onBeforeResponse;
        this.rpcRoutePrefix = opts?.rpcRoutePrefix ?? "";
        this.rpcDefinitionPath = opts?.rpcDefinitionPath ?? "__definition";
        this.h3App.use(this.h3Router);
        this.h3Router.get(
            this.rpcRoutePrefix
                ? `/${this.rpcRoutePrefix}/${this.rpcDefinitionPath}`
                      .split("//")
                      .join("/")
                : `/${this.rpcDefinitionPath}`,
            eventHandler(() => this.getAppDefinition()),
        );
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
                    if (this.onRequest) {
                        await this.onRequest(event);
                    }
                } catch (err) {
                    await handleH3Error(err, event, this.onError);
                }
                if (event.handled) {
                    return;
                }
                if (this.onError) {
                    await this.onError(error, event);
                }
                if (event.handled) {
                    return;
                }
                sendError(event, error);
            }),
        );
    }

    use(input: Middleware | ArriRouter): void {
        if (typeof input === "object" && input instanceof ArriRouter) {
            for (const route of input.getRoutes()) {
                this.route(route);
            }
            for (const rpc of input.getProcedures()) {
                this.rpc(rpc);
            }
            this.registerModels(input.getModels());
            return;
        }
        this.middlewares.push(input);
    }

    rpc<
        TIsEventStream extends boolean = false,
        TParams extends AObjectSchema<any, any> | undefined = undefined,
        TResponse extends AObjectSchema<any, any> | undefined = undefined,
    >(procedure: NamedRpc<TIsEventStream, TParams, TResponse>) {
        const path =
            procedure.path ?? getRpcPath(procedure.name, this.rpcRoutePrefix);
        this.procedures[procedure.name] = createRpcDefinition(
            procedure.name,
            path,
            procedure,
        );
        if (isRpcParamSchema(procedure.params)) {
            const paramName = getRpcParamName(procedure.name, procedure);
            if (paramName) {
                this.models[paramName] = procedure.params;
            }
        }
        if (isRpcParamSchema(procedure.response)) {
            const responseName = getRpcResponseName(procedure.name, procedure);
            if (responseName) {
                this.models[responseName] = procedure.response;
            }
        }
        if (isEventStreamRpc(procedure)) {
            registerEventStreamRpc(this.h3Router, path, procedure, {
                middleware: this.middlewares,
                onRequest: this.onRequest,
                onError: this.onError,
                onAfterResponse: this.onAfterResponse,
                onBeforeResponse: this.onBeforeResponse,
            });
            return;
        }
        registerRpc(this.h3Router, path, procedure, {
            middleware: this.middlewares,
            onRequest: this.onRequest,
            onError: this.onError,
            onAfterResponse: this.onAfterResponse,
            onBeforeResponse: this.onBeforeResponse,
        });
    }

    route<
        TPath extends string,
        TQuery extends AObjectSchema<any, any>,
        TBody extends ASchema<any>,
        TResponse = any,
    >(route: ArriRoute<TPath, TQuery, TBody, TResponse>) {
        registerRoute(this.h3Router, route, {
            middleware: this.middlewares,
            onRequest: this.onRequest,
            onError: this.onError,
            onAfterResponse: this.onAfterResponse,
            onBeforeResponse: this.onBeforeResponse,
        });
    }

    registerModels(models: ModelMap) {
        for (const key of Object.keys(models)) {
            this.models[key] = models[key];
        }
    }

    getAppDefinition(): AppDefinition {
        const appDef: AppDefinition = {
            arriSchemaVersion: "0.0.2",
            info: this.appInfo,
            procedures: {},
            models: this.models as any,
        };
        for (const key of Object.keys(this.procedures)) {
            const rpc = this.procedures[key];
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
    onRequest?: (event: MiddlewareEvent) => void | Promise<void>;
    onAfterResponse?: (event: MiddlewareEvent) => void | Promise<void>;
    onBeforeResponse?: (event: MiddlewareEvent) => void | Promise<void>;
    onError?: (error: H3Error, event: MiddlewareEvent) => void | Promise<void>;
}
