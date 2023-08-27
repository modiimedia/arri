import {
    type TObject,
    type Static,
    type TVoid,
    TypeGuard,
} from "@sinclair/typebox";
import {
    eventHandler,
    type Router,
    type H3Event,
    getValidatedQuery,
    isPreflightRequest,
    readValidatedBody,
    send,
    setResponseHeader,
} from "h3";
import { type HttpMethod, isHttpMethod } from "./app";
import {
    type ProcedureDefinition,
    removeDisallowedChars,
} from "./codegen/utils";
import { kebabCase, pascalCase } from "scule";
import { type Middleware } from "./routes";
import { defineError } from "./errors";
import { typeboxSafeValidate } from "./validation";

export interface ArriProcedureBase {
    method: HttpMethod;
    params?: any;
    response?: any;
    handler: (context: any) => any;
    postHandler?: (context: any) => any;
}

export interface ArriProcedure<
    TParams extends TObject | undefined,
    TResponse extends TObject | undefined,
    TFinalResponse extends TResponse extends TObject
        ? Static<TResponse>
        : Static<TVoid>,
> {
    description?: string;
    method?: HttpMethod;
    params: TParams;
    response: TResponse;
    handler: ArriProcedureHandler<
        TParams extends TObject ? Static<TParams> : undefined,
        TFinalResponse
    >;
    postHandler?: ArriProcedurePostHandler<
        TParams extends TObject ? Static<TParams> : undefined,
        TFinalResponse
    >;
}

export interface HandlerContext {
    [key: string]: any;
    event: H3Event;
}

export interface RpcHandlerContext<TParams = undefined> extends HandlerContext {
    params: TParams;
}

export interface RpcPostHandlerContext<
    TParams = undefined,
    TResponse = undefined,
> extends RpcHandlerContext<TParams> {
    response: TResponse;
}

export type ArriProcedureHandler<TParams, TResponse> = (
    context: RpcHandlerContext<TParams>,
) => TResponse | Promise<TResponse>;

export type ArriProcedurePostHandler<TParams, TResponse> = (
    event: RpcPostHandlerContext<TParams, TResponse>,
) => any;

export function isRpc(input: any): input is ArriProcedure<any, any, any> {
    if (typeof input !== "object") {
        return false;
    }
    const anyInput = input as Record<string, any>;
    if (!isHttpMethod(anyInput.method)) {
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

export function createRpcDefinition(
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

export function getRpcPath(rpcName: string, prefix = ""): string {
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

export function getRpcParamName(
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

export function getRpcParamDefinition(
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

export function getRpcResponseName(
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

export function registerRpc(
    router: Router,
    path: string,
    procedure: ArriProcedure<any, any, any>,
    middleware: Middleware[],
) {
    const handler = eventHandler(async (event) => {
        const context: HandlerContext = {
            event,
        };
        if (isPreflightRequest(event)) {
            return "ok";
        }
        if (middleware.length) {
            await Promise.all(middleware.map((m) => m(context)));
        }
        if (procedure.params) {
            switch (procedure.method) {
                case "get":
                case "head": {
                    const parsedParams = await getValidatedQuery(
                        event,
                        typeboxSafeValidate(procedure.params, true),
                    );
                    if (!parsedParams.success) {
                        const errorParts: string[] = [];
                        for (const err of parsedParams.errors) {
                            const propName = err.path.split("/");
                            propName.shift();
                            if (!errorParts.includes(propName.join("."))) {
                                errorParts.push(propName.join("."));
                            }
                        }
                        throw defineError(400, {
                            statusMessage: `Missing or invalid url query parameters: [${errorParts.join(
                                ",",
                            )}]`,
                            data: parsedParams.errors,
                        });
                    }
                    context.params = parsedParams.value;
                    break;
                }

                case "delete":
                case "patch":
                case "post":
                case "put": {
                    const parsedParams = await readValidatedBody(
                        event,
                        typeboxSafeValidate(procedure.params),
                    );
                    if (!parsedParams.success) {
                        throw defineError(400, {
                            statusMessage: "Invalid request body",
                            data: parsedParams.errors,
                        });
                    }
                    context.params = parsedParams.value;
                    break;
                }
                default:
                    break;
            }
        }
        const response = await procedure.handler(context as any);
        if (typeof response === "object") {
            setResponseHeader(event, "Content-Type", "application/json");
            await send(event, JSON.stringify(response));
        } else {
            await send(event, response);
        }
        if (procedure.postHandler) {
            context.response = response;
            await procedure.postHandler(context as any);
        }
        return null;
    });
    switch (procedure.method) {
        case "get":
            router.get(path, handler);
            break;
        case "head":
            router.head(path, handler);
            break;
        case "delete":
            router.delete(path, handler);
            break;
        case "patch":
            router.patch(path, handler);
            break;
        case "post":
            router.post(path, handler);
            break;
        case "put":
            router.put(path, handler);
            break;
    }
}