import {
    type TObject,
    type Static,
    TypeGuard,
    type TVoid,
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
import { type Middleware } from "./routes";
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

interface ArriApplicationOptions extends AppOptions {
    rpcRoutePrefix?: string;
    appDescription?: string;
}

export class ArriApplication {
    h3App: App;
    h3Router: Router = createRouter();
    rpcRoutePrefix: string;
    procedures: Record<string, ProcedureDefinition> = {};
    models: Record<string, TObject> = {};
    middlewares: Middleware[] = [];
    appDescription: string;

    constructor(opts?: ArriApplicationOptions) {
        this.appDescription = opts?.appDescription ?? "";
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
        this.h3Router.get(
            "/__definition",
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
    registerRoutes() {
        this.h3App.use(this.h3Router);
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
        registerRpc(this.h3Router, path, procedure, this.middlewares);
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
