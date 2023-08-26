import {
    type TObject,
    type Static,
    TypeGuard,
    type TVoid,
    type TSchema,
} from "@sinclair/typebox";
import {
    type App,
    createApp,
    type Router,
    createRouter,
    type AppOptions,
    sendError,
    eventHandler,
} from "h3";
import { type ArriRoute, registerRoute, type Middleware } from "./routes";
import {
    type ApplicationDefinition,
    type ProcedureDefinition,
} from "./codegen/utils";
import { ErrorResponse } from "./errors";
import {
    type ArriProcedure,
    createRpcDefinition,
    getRpcParamName,
    getRpcPath,
    getRpcResponseName,
    registerRpc,
} from "./procedures";

interface ArriServerOptions extends AppOptions {
    rpcRoutePrefix?: string;
    /**
     * Defaults to /__definitions
     * This parameters also takes the rpcRoutePrefix option into account
     */
    rpcDefinitionPath?: string;
    appDescription?: string;
}

export class ArriServer {
    app: App;
    router: Router = createRouter();
    rpcRoutePrefix: string;
    rpcDefinitionPath: string;
    procedures: Record<string, ProcedureDefinition> = {};
    models: Record<string, TObject> = {};
    middlewares: Middleware[] = [];
    appDescription: string;

    constructor(opts?: ArriServerOptions) {
        this.appDescription = opts?.appDescription ?? "";
        this.app = createApp({
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
        this.rpcDefinitionPath = opts?.rpcDefinitionPath ?? "__definitions";
        this.router.get(
            this.rpcRoutePrefix
                ? `/${this.rpcRoutePrefix}/__definitions`.split("//").join("/")
                : "/__definitions",
            eventHandler((_) => this.getAppDefinition()),
        );
    }

    registerMiddleware(middleware: Middleware) {
        this.middlewares.push(middleware);
    }

    /**
     * Statically register routes to the server router
     * Routes will not be served until this is done
     */
    initializeRoutes() {
        this.app.use(this.router);
    }

    registerRpc<
        TParams extends TObject | undefined,
        TResponse extends TObject | undefined,
        TFinalResponse extends TResponse extends TObject
            ? Static<TResponse>
            : Static<TVoid>,
    >(
        name: string,
        procedure: ArriProcedure<TParams, TResponse, TFinalResponse>,
    ) {
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
        registerRpc(this.router, path, procedure, this.middlewares);
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
        registerRoute(this.router, route, this.middlewares);
    }

    getAppDefinition(): ApplicationDefinition {
        const appDef: ApplicationDefinition = {
            schemaVersion: "0.0.1",
            description: this.appDescription,
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
}

export interface ArriService {
    id: string;
    procedures: Record<string, any>;
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
