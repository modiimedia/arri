import { type TObject, TypeGuard, type TSchema } from "@sinclair/typebox";
import {
    type App,
    createApp,
    type Router,
    createRouter,
    type AppOptions,
    sendError,
    eventHandler,
} from "h3";
import { type ApplicationDef, type ProcedureDef } from "./codegen/utils";
import { ErrorResponse } from "./errors";
import {
    type ArriProcedure,
    createRpcDefinition,
    getRpcParamName,
    getRpcPath,
    getRpcResponseName,
    registerRpc,
} from "./procedures";
import { type ArriRoute, registerRoute, type Middleware } from "./routes";

interface ArriOptions extends AppOptions {
    /**
     * Metadata to display in the __definition.json file
     */
    appInfo?: ApplicationDef["info"];
    rpcRoutePrefix?: string;
    /**
     * Defaults to /__definitions
     * This parameters also takes the rpcRoutePrefix option into account
     */
    rpcDefinitionPath?: string;
}
export const DEV_ENDPOINT_ROOT = `/__arri_dev__`;
export const DEV_DEFINITION_ENDPOINT = `${DEV_ENDPOINT_ROOT}/definition`;

export class Arri {
    __isArri__ = true;
    private readonly h3App: App;
    private readonly h3Router: Router = createRouter();
    private readonly rpcDefinitionPath: string;
    private readonly rpcRoutePrefix: string;
    appInfo: ApplicationDef["info"];
    private procedures: Record<string, ProcedureDef> = {};
    private models: Record<string, TObject> = {};
    private readonly middlewares: Middleware[] = [];

    constructor(opts?: ArriOptions) {
        this.appInfo = opts.appInfo;
        this.h3App = createApp({
            debug: opts?.debug,
            onAfterResponse: opts?.onAfterResponse,
            onBeforeResponse: opts?.onBeforeResponse,
            onError: async (err, event) => {
                if (opts?.onError) {
                    await opts.onError(err, event);
                }
                sendError(event, err);
            },
            onRequest: async (event) => {
                if (opts?.onRequest) {
                    await opts.onRequest(event);
                }
            },
        });
        this.rpcRoutePrefix = opts?.rpcRoutePrefix ?? "";
        this.rpcDefinitionPath = opts?.rpcDefinitionPath ?? "__definition";
        this.h3Router.get(
            this.rpcRoutePrefix
                ? `/${this.rpcRoutePrefix}/${this.rpcDefinitionPath}`
                      .split("//")
                      .join("/")
                : `/${this.rpcDefinitionPath}`,
            eventHandler((_) => this.getAppDefinition()),
        );
        this.h3App.use(this.h3Router);
        if (process.env.ARRI_DEV_MODE === "true") {
            this.h3Router.get(
                DEV_DEFINITION_ENDPOINT,
                eventHandler((_) => this.getAppDefinition()),
            );
        }
    }

    registerMiddleware(middleware: Middleware) {
        this.middlewares.push(middleware);
    }

    registerRpc<
        TParams extends TObject | undefined,
        TResponse extends TObject | undefined,
    >(name: string, procedure: ArriProcedure<TParams, TResponse>) {
        const path = getRpcPath(name, this.rpcRoutePrefix);
        this.procedures[name] = createRpcDefinition(name, path, procedure);
        if (TypeGuard.TObject(procedure.params)) {
            const paramName = getRpcParamName(name, procedure);
            if (paramName) {
                this.models[paramName] = procedure.params;
            }
        }
        if (TypeGuard.TObject(procedure.response)) {
            const responseName = getRpcResponseName(name, procedure);

            if (responseName) {
                this.models[responseName] = procedure.response;
            }
        }
        registerRpc(this.h3Router, path, procedure, this.middlewares);
    }

    registerRoute<
        TPath extends string,
        TMethod extends HttpMethod = HttpMethod,
        TQuery extends TObject | undefined = undefined,
        TBody extends TSchema | undefined = undefined,
        TResponse extends TSchema | undefined = undefined,
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

    getAppDefinition(): ApplicationDef {
        const appDef: ApplicationDef = {
            arriSchemaVersion: "0.0.1",
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

    getH3Instance() {
        return this.h3App;
    }
}

export const HttpMethodValues = [
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "head",
] as const;

export type HttpMethod = (typeof HttpMethodValues)[number];

export const isHttpMethod = (input: any): input is HttpMethod => {
    if (typeof input !== "string") {
        return false;
    }
    return HttpMethodValues.includes(input as any);
};
