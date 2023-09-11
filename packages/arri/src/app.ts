import {
    type AppDefinition,
    type HttpMethod,
    type RpcDefinition,
} from "arri-codegen-utils";
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
    getQuery,
    readBody,
    setResponseStatus,
} from "h3";
import { ErrorResponse, defineError, handleH3Error } from "./errors";
import {
    type ArriProcedure,
    createRpcDefinition,
    getRpcParamName,
    getRpcPath,
    getRpcResponseName,
    registerRpc,
    type RpcHandlerContext,
    type RpcPostHandlerContext,
} from "./procedures";
import {
    type ArriRoute,
    registerRoute,
    type Middleware,
    type RouteHandlerContext,
    type RoutePostHandlerContext,
} from "./routes";

export const DEV_ENDPOINT_ROOT = `/__arri_dev__`;
export const DEV_DEFINITION_ENDPOINT = `${DEV_ENDPOINT_ROOT}/definition`;

export class Arri {
    __isArri__ = true;
    private readonly h3App: App;
    private readonly h3Router: Router = createRouter();
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
            onRequest: opts?.onRequest,
        });
        this.onError = opts.onError;
        this.onAfterResponse = opts.onAfterResponse;
        this.onBeforeResponse = opts.onBeforeResponse;
        this.rpcRoutePrefix = opts?.rpcRoutePrefix ?? "";
        this.rpcDefinitionPath = opts?.rpcDefinitionPath ?? "__definition";
        this.h3App.use(this.h3Router);
        this.registerRoute({
            path: this.rpcRoutePrefix
                ? `/${this.rpcRoutePrefix}/${this.rpcDefinitionPath}`
                      .split("//")
                      .join("/")
                : `/${this.rpcDefinitionPath}`,
            method: "get",
            handler: () => this.getAppDefinition(),
        });
        // this route is used by the dev server when auto-generating client code
        if (process.env.ARRI_DEV_MODE === "true") {
            this.registerRoute({
                path: DEV_DEFINITION_ENDPOINT,
                method: "get",
                handler: () => this.getAppDefinition(),
            });
        }
        // default fallback route
        this.h3Router.use(
            "/**",
            eventHandler(async (event) => {
                setResponseStatus(event, 404);
                const error = defineError(404);
                const query = getQuery(event);
                const disallowedBodyMethods = ["GET", "HEAD", "OPTION"];
                const canBody = !disallowedBodyMethods.includes(event.method);
                const context: RouteHandlerContext<any> = {
                    type: "route",
                    params: event.context.params,
                    query: query as any,
                    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
                    body: canBody
                        ? await readBody(event).catch((_) => undefined)
                        : undefined,
                };
                try {
                    if (this.middlewares.length) {
                        for (const m of this.middlewares) {
                            await m(context, event);
                        }
                    }
                } catch (err) {
                    await handleH3Error(err, context, event, this.onError);
                }
                if (event.handled) {
                    return;
                }
                if (this.onError) {
                    await this.onError(error, context, event);
                }
                if (event.handled) {
                    return;
                }
                sendError(event, error);
            }),
        );
    }

    registerMiddleware(middleware: Middleware) {
        this.middlewares.push(middleware);
    }

    registerRpc<
        TParams extends AObjectSchema<any, any> | undefined,
        TResponse extends AObjectSchema<any, any> | undefined,
    >(name: string, procedure: ArriProcedure<TParams, TResponse>) {
        const path = getRpcPath(name, this.rpcRoutePrefix);
        this.procedures[name] = createRpcDefinition(name, path, procedure);
        if (isAObjectSchema(procedure.params)) {
            const paramName = getRpcParamName(name, procedure);
            if (paramName) {
                this.models[paramName] = procedure.params;
            }
        }
        if (isAObjectSchema(procedure.response)) {
            const responseName = getRpcResponseName(name, procedure);

            if (responseName) {
                this.models[responseName] = procedure.response;
            }
        }
        registerRpc(this.h3Router, path, procedure, this.middlewares, {
            onError: this.onError,
            onAfterResponse: this.onAfterResponse,
            onBeforeResponse: this.onBeforeResponse,
        });
    }

    registerRoute<
        TPath extends string,
        TMethod extends HttpMethod = HttpMethod,
        TQuery extends AObjectSchema | undefined = undefined,
        TBody extends ASchema | undefined = undefined,
        TResponse extends ASchema | undefined = undefined,
        TFallbackResponse = any,
    >(
        route: ArriRoute<
            TPath,
            TMethod,
            TQuery,
            TBody,
            TResponse,
            TFallbackResponse
        >,
    ) {
        registerRoute(this.h3Router, route, this.middlewares);
    }

    getAppDefinition(): AppDefinition {
        const appDef: AppDefinition = {
            arriSchemaVersion: "0.0.2",
            info: this.appInfo,
            procedures: {},
            models: this.models as any,
            errors: ErrorResponse,
        };
        Object.keys(this.procedures).forEach((key) => {
            const rpc = this.procedures[key];
            appDef.procedures[key] = rpc;
        });
        return appDef;
    }

    getH3Instance(): App {
        return this.h3App;
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
    onAfterResponse?: (
        context: RpcPostHandlerContext | RoutePostHandlerContext<any>,
        event: H3Event,
    ) => void | Promise<void>;
    onBeforeResponse?: (
        context: RpcPostHandlerContext | RoutePostHandlerContext<any>,
        event: H3Event,
    ) => void | Promise<void>;
    onError?: (
        error: H3Error,
        context: RpcHandlerContext | RouteHandlerContext<any>,
        event: H3Event,
    ) => void | Promise<void>;
}
