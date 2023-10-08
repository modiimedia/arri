import { type AppDefinition, type RpcDefinition } from "arri-codegen-utils";
import {
    type AObjectSchema,
    type ASchema,
    isAObjectSchema,
} from "arri-validate";
import {
    type App,
    createApp,
    type Router,
    createRouter,
    eventHandler,
    type H3Error,
    type H3Event,
    sendError,
    setResponseStatus,
} from "h3";
import { ErrorResponse, defineError, handleH3Error } from "./errors";
import { type Middleware } from "./middleware";
import {
    createRpcDefinition,
    getRpcParamName,
    getRpcPath,
    getRpcResponseName,
    registerRpc,
    type ArriNamedProcedure,
} from "./procedures";
import { ArriRouter, type ArriRouterBase } from "./router";
import { type ArriRoute, registerRoute } from "./routes";

export const DEV_ENDPOINT_ROOT = `/__arri_dev__`;
export const DEV_DEFINITION_ENDPOINT = `${DEV_ENDPOINT_ROOT}/__definition`;

export class ArriApp implements ArriRouterBase {
    __isArri__ = true;
    readonly h3App: App;
    readonly h3Router: Router = createRouter();
    private readonly rpcDefinitionPath: string;
    private readonly rpcRoutePrefix: string;
    appInfo: AppDefinition["info"];
    private procedures: Record<string, RpcDefinition> = {};
    private models: Record<string, ASchema> = {};
    private readonly middlewares: Middleware[] = [];
    private readonly onAfterResponse: ArriOptions["onAfterResponse"];
    private readonly onBeforeResponse: ArriOptions["onBeforeResponse"];
    private readonly onError: ArriOptions["onError"];

    constructor(opts: ArriOptions = {}) {
        this.appInfo = opts?.appInfo;
        this.h3App = createApp({
            debug: opts?.debug,
            onRequest: opts.onRequest
                ? async (event) => {
                      if (event.path.startsWith(DEV_ENDPOINT_ROOT)) {
                          return;
                      }
                      if (opts.onRequest) {
                          await opts.onRequest(event);
                      }
                  }
                : undefined,
        });
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
                    if (this.middlewares.length) {
                        for (const m of this.middlewares) {
                            await m(event);
                        }
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
            return;
        }
        this.middlewares.push(input);
    }

    rpc<
        TParams extends AObjectSchema<any, any> | undefined,
        TResponse extends AObjectSchema<any, any> | undefined,
    >(procedure: ArriNamedProcedure<TParams, TResponse>) {
        const path =
            procedure.path ?? getRpcPath(procedure.name, this.rpcRoutePrefix);
        this.procedures[procedure.name] = createRpcDefinition(
            procedure.name,
            path,
            procedure,
        );
        if (isAObjectSchema(procedure.params)) {
            const paramName = getRpcParamName(procedure.name, procedure);
            if (paramName) {
                this.models[paramName] = procedure.params;
            }
        }
        if (isAObjectSchema(procedure.response)) {
            const responseName = getRpcResponseName(procedure.name, procedure);
            if (responseName) {
                this.models[responseName] = procedure.response;
            }
        }
        registerRpc(this.h3Router, path, procedure, {
            middleware: this.middlewares,
            onError: this.onError,
            onAfterResponse: this.onAfterResponse,
            onBeforeResponse: this.onBeforeResponse,
        });
    }

    route<TPath extends string>(route: ArriRoute<TPath>) {
        registerRoute(this.h3Router, route, {
            middleware: this.middlewares,
            onError: this.onError,
            onAfterResponse: this.onAfterResponse,
            onBeforeResponse: this.onBeforeResponse,
        });
    }

    getAppDefinition(): AppDefinition {
        const appDef: AppDefinition = {
            arriSchemaVersion: "0.0.2",
            info: this.appInfo,
            procedures: {},
            models: this.models as any,
            errors: ErrorResponse,
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
    onRequest?: (event: H3Event) => void | Promise<void>;
    onAfterResponse?: (event: H3Event) => void | Promise<void>;
    onBeforeResponse?: (event: H3Event) => void | Promise<void>;
    onError?: (error: H3Error, event: H3Event) => void | Promise<void>;
}
