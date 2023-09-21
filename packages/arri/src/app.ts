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
import { ArriCompat } from "./compat";
import { ErrorResponse, defineError, handleH3Error } from "./errors";
import { type Middleware } from "./middleware";
import {
    type ArriProcedure,
    createRpcDefinition,
    getRpcParamName,
    getRpcPath,
    getRpcResponseName,
    registerRpc,
} from "./procedures";

export const DEV_ENDPOINT_ROOT = `/__arri_dev__`;
export const DEV_DEFINITION_ENDPOINT = `${DEV_ENDPOINT_ROOT}/__definition`;

export class ArriApp {
    __isArri__ = true;
    readonly h3App: App;
    readonly h3Router: Router = createRouter();
    readonly compat: ArriCompat;
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
        this.compat = new ArriCompat({
            h3App: this.h3App,
            h3Router: this.h3Router,
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

    registerMiddleware(middleware: Middleware) {
        this.h3App.use(middleware);
    }

    rpc<
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

    procedure = this.rpc;

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
