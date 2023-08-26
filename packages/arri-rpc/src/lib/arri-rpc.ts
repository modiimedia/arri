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
    type H3Event,
    type RouterMethod,
    createRouter,
    type AppOptions,
    sendError,
    eventHandler,
} from "h3";
import { type RpcMiddleware, registerRpc } from "./router";
import { kebabCase, pascalCase } from "scule";
import {
    type ApplicationDefinition,
    removeDisallowedChars,
    type ProcedureDefinition,
} from "./codegen/utils";
import { RpcError, defineRpcError, isRpcError } from "./errors";
const RpcHttpMethods = [
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "head",
] as const;

export type RpcMethod = (typeof RpcHttpMethods)[number];

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
    middlewares: RpcMiddleware[] = [];
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
                if (isRpcError(err)) {
                    sendError(event, err);
                    return;
                }
                sendError(
                    event,
                    defineRpcError(err.statusCode, {
                        name: err.name,
                        message: err.message,
                        statusMessage: err.statusMessage,
                        data: err.data,
                    }),
                );
            },
            onRequest: async (event) => {
                if (this.middlewares.length) {
                    for (const middleware of this.middlewares) {
                        await middleware(event);
                    }
                }
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

    registerMiddleware(middleware: RpcMiddleware) {
        this.middlewares.push(middleware);
    }

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
            errors: RpcError,
        };
        Object.keys(this.procedures).forEach((key) => {
            const rpc = this.procedures[key];
            appDef.procedures[key] = rpc;
        });
        return appDef;
    }
}

// function getFlattenedModelDefinition(schema: TObject): {
//     def: Omit<TObject, symbol>;
//     referencedDefs: Record<string, TObject>;
// } {
//     const result = { ...schema }
//     const referenced: Record<string, TObject> = {};
//     Object.keys(result).forEach((key) => {})
//     return { def: {}, referencedDefs: {} };
// }

function createRpcDefinition(
    rpcName: string,
    httpPath: string,
    procedure: ArriProcedure<any, any, any>,
): ProcedureDefinition {
    return {
        description: procedure.description,
        path: httpPath,
        method: procedure.method ?? "post",
        params: getRpcParamDefinition(rpcName, procedure),
        response: getRpcResponseDefinition(rpcName, procedure),
    };
}

function getRpcPath(rpcName: string, prefix = ""): string {
    const path = rpcName
        .split(".")
        .map((part) =>
            removeDisallowedChars(
                kebabCase(part),
                "!@#$%^&*()+=[]{}|\\;:'\"<>,./?",
            ),
        )
        .join("/");
    const finalPath = prefix ? `/${prefix}/${path}` : `/${path}`;
    return finalPath;
}

function getRpcParamName(
    rpcName: string,
    procedure: ArriProcedure<any, any, any>,
): string | null {
    if (!procedure.params) {
        return null;
    }
    const nameParts = rpcName
        .split(".")
        .map((part) =>
            removeDisallowedChars(part, "!@#$%^&*()+=[]{}|\\;:'\"<>,./?"),
        );
    const paramName =
        (procedure.params as TObject).$id ??
        pascalCase(`${nameParts.join(`_`)}_params`);
    return paramName;
}

function getRpcParamDefinition(
    rpcName: string,
    procedure: ArriProcedure<any, any, any>,
): ProcedureDefinition["params"] {
    if (!procedure.params) {
        return undefined;
    }
    const name = getRpcParamName(rpcName, procedure);
    if (!name) {
        return undefined;
    }
    return name;
}

function getRpcResponseName(
    rpcName: string,
    procedure: ArriProcedure<any, any, any>,
): string | null {
    if (!procedure.response) {
        return null;
    }
    if (TypeGuard.TObject(procedure.response)) {
        const nameParts = rpcName
            .split(".")
            .map((part) =>
                removeDisallowedChars(part, "!@#$%^&*()+=[]{}|\\;:'\"<>,./?"),
            );
        const responseName =
            procedure.response.$id ??
            pascalCase(`${nameParts.join("_")}_response`);
        return responseName;
    }
    return null;
}

function getRpcResponseDefinition(
    rpcName: string,
    procedure: ArriProcedure<any, any, any>,
): ProcedureDefinition["response"] {
    if (!procedure.response) {
        return undefined;
    }
    const name = getRpcResponseName(rpcName, procedure);
    if (!name) {
        return undefined;
    }
    return name;
}

export const isRpcHttpMethod = (input: any): input is RpcMethod => {
    if (typeof input !== "string") {
        return false;
    }
    return RpcHttpMethods.includes(input as any);
};

export interface ArriService {
    id: string;
    procedures: Record<string, any>;
}

export interface RpcHandlerContext<TParams = any> {
    event: H3Event;
    params: TParams;
}

export interface RpcPostHandlerContext<TParams = any, TResponse = any>
    extends RpcHandlerContext<TParams> {
    response: TResponse;
}

export interface ArriProcedureBase {
    method: RpcMethod;
    params?: any;
    response?: any;
    handler: (context: any) => any;
    postHandler?: (context: any) => any;
}

export type ArriProcedureHandler<TParams, TResponse> = (
    context: RpcHandlerContext<TParams>,
) => TResponse | Promise<TResponse>;

export interface ArriProcedure<
    TParams extends TObject | undefined,
    TResponse extends TObject | undefined,
    TFinalResponse extends TResponse extends TObject
        ? Static<TResponse>
        : Static<TVoid>,
> {
    description?: string;
    method?: RpcMethod;
    params: TParams;
    response: TResponse;
    handler: ArriProcedureHandler<
        TParams extends TObject ? Static<TParams> : undefined,
        TFinalResponse
    >;
    postHandler?: (
        context: RpcPostHandlerContext<
            TParams extends TObject ? Static<TParams> : undefined,
            TResponse extends TObject ? Static<TResponse> : undefined
        >,
    ) => any;
}

export function isRpc(input: any): input is ArriProcedure<any, any, any> {
    if (typeof input !== "object") {
        return false;
    }
    const anyInput = input as Record<string, any>;
    if (!isRpcHttpMethod(anyInput.method)) {
        return false;
    }
    if (typeof anyInput.handler !== "function") {
        return false;
    }
    return true;
}

export function defineRpc<
    TParams extends TObject | undefined = undefined,
    TResponse extends TObject | undefined | never = undefined,
    TFinalResponse extends TResponse extends TObject
        ? Static<TObject>
        : Static<TVoid> = any,
>(
    config: ArriProcedure<TParams, TResponse, TFinalResponse>,
): ArriProcedure<TParams, TResponse, TFinalResponse> {
    return config;
}

export function defineService<TRpcMap extends Record<string, any>>(
    id: string,
    procedures: TRpcMap,
) {
    return {
        id,
        procedures,
    };
}

export interface ProcessedArriProcedure<TParams = any, TResponse = any> {
    id: string;
    method: RouterMethod;
    path: string;
    params: TParams;
    response: TResponse;
}
