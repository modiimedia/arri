import { ValueErrorType } from "@sinclair/typebox/errors";
import {
    eventHandler,
    type Router,
    getValidatedQuery,
    isPreflightRequest,
    readValidatedBody,
    send,
    setResponseHeader,
    type H3Event,
} from "h3";
import { kebabCase, pascalCase } from "scule";
import { type ProcedureDef, removeDisallowedChars } from "./codegen/utils";
import { defineError, handleH3Error } from "./errors";
import { type Middleware } from "./routes";
import { typeboxSafeValidate } from "./validation";
import { HttpMethod, isHttpMethod } from "arri-codegen-utils";
import { ArriOptions } from "./app";
import { AObjectSchema, InferType, isAObjectSchema } from "arri-shared";

export interface ArriProcedure<
    TParams extends AObjectSchema | undefined,
    TResponse extends AObjectSchema | undefined,
> {
    description?: string;
    method?: HttpMethod;
    params: TParams;
    response: TResponse;
    handler: ArriProcedureHandler<
        TParams extends AObjectSchema ? InferType<TParams> : undefined,
        // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
        TResponse extends AObjectSchema ? InferType<TResponse> : void
    >;
    postHandler?: ArriProcedurePostHandler<
        TParams extends AObjectSchema ? InferType<TParams> : undefined,
        TResponse extends AObjectSchema ? InferType<TResponse> : undefined
    >;
}

export type HandlerContext = Record<string, any>;

export interface RpcHandlerContext<TParams = undefined> extends HandlerContext {
    type: "procedure";
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
    event: H3Event,
) => TResponse | Promise<TResponse>;

export type ArriProcedurePostHandler<TParams, TResponse> = (
    context: RpcPostHandlerContext<TParams, TResponse>,
    event: H3Event,
) => any;

export function isRpc(input: any): input is ArriProcedure<any, any> {
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
    TParams extends AObjectSchema | undefined = undefined,
    TResponse extends AObjectSchema | undefined | never = undefined,
>(
    config: ArriProcedure<TParams, TResponse>,
): ArriProcedure<TParams, TResponse> {
    return config;
}

export function createRpcDefinition(
    rpcName: string,
    httpPath: string,
    procedure: ArriProcedure<any, any>,
): ProcedureDef {
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
    procedure: ArriProcedure<any, any>,
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
        (procedure.params as AObjectSchema<any, any>).metadata.id ??
        pascalCase(`${nameParts.join(`_`)}_params`);
    return paramName;
}

export function getRpcParamDefinition(
    rpcName: string,
    procedure: ArriProcedure<any, any>,
): ProcedureDef["params"] {
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
    procedure: ArriProcedure<any, any>,
): string | null {
    if (!procedure.response) {
        return null;
    }
    if (isAObjectSchema(procedure.response)) {
        const nameParts = rpcName
            .split(".")
            .map((part) =>
                removeDisallowedChars(part, "!@#$%^&*()+=[]{}|\\;:'\"<>,./?"),
            );
        const responseName =
            procedure.response.metadata.id ??
            pascalCase(`${nameParts.join("_")}_response`);
        return responseName;
    }
    return null;
}

function getRpcResponseDefinition(
    rpcName: string,
    procedure: ArriProcedure<any, any>,
): ProcedureDef["response"] {
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
    procedure: ArriProcedure<any, any>,
    middleware: Middleware[],
    opts: ArriOptions,
) {
    const httpMethod = procedure.method ?? "post";
    const handler = eventHandler(async (event: H3Event) => {
        const context: RpcHandlerContext = {
            type: "procedure",
            params: undefined,
        };
        if (isPreflightRequest(event)) {
            return "ok";
        }
        try {
            if (middleware.length) {
                await Promise.all(middleware.map((m) => m(context, event)));
            }
            if (procedure.params) {
                switch (httpMethod) {
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
                            let isObjectError = false;
                            const errorParts: string[] = [];
                            for (const err of parsedParams.errors) {
                                if (err.type === ValueErrorType.Object) {
                                    isObjectError = true;
                                }
                                const propName = err.path.split("/");
                                propName.shift();
                                if (!errorParts.includes(propName.join("."))) {
                                    errorParts.push(propName.join("."));
                                }
                            }
                            if (isObjectError) {
                                throw defineError(400, {
                                    statusMessage: `Invalid request body. Expected object.`,
                                });
                            }
                            throw defineError(400, {
                                statusMessage: `Invalid request body. Affected properties [${errorParts.join(
                                    ", ",
                                )}]`,
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
            const response = await procedure.handler(context, event);
            context.response = response;
            if (opts.onBeforeResponse) {
                await opts.onBeforeResponse(context as any, event);
            }
            if (typeof response === "object") {
                setResponseHeader(event, "Content-Type", "application/json");
                await send(event, JSON.stringify(response));
            } else {
                await send(event, response ?? "");
            }
            if (opts.onAfterResponse) {
                await opts.onAfterResponse(context as any, event);
            }
            if (procedure.postHandler) {
                await procedure.postHandler(context as any, event);
            }
        } catch (err) {
            await handleH3Error(err, context, event, opts.onError);
        }
        return "";
    });
    switch (httpMethod) {
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
        case "put":
            router.put(path, handler);
            break;
        case "post":
        default:
            router.post(path, handler);
            break;
    }
}
