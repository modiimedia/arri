import {
    type RpcDefinition,
    removeDisallowedChars,
    isRpcHttpMethod,
    type RpcHttpMethod,
} from "arri-codegen-utils";
import {
    type AObjectSchema,
    type InferType,
    isAObjectSchema,
    a,
    type ARecordSchema,
    type ADiscriminatorSchema,
    type ASchema,
    isARecordSchema,
    isADiscriminatorSchema,
} from "arri-validate";
import {
    eventHandler,
    type Router,
    isPreflightRequest,
    send,
    setResponseHeader,
    type H3Event,
    getValidatedQuery,
    readRawBody,
    type H3EventContext,
} from "h3";
import { kebabCase, pascalCase } from "scule";
import { defineError, handleH3Error } from "./errors";
import { type MiddlewareEvent } from "./middleware";
import { type RouteOptions } from "./routes";

export type RpcParamSchema<
    TObjectInner = any,
    TRecordInner extends ASchema = any,
    TDiscriminatorInner = any,
> =
    | AObjectSchema<TObjectInner>
    | ARecordSchema<TRecordInner>
    | ADiscriminatorSchema<TDiscriminatorInner>;

export function isRpcParamSchema(input: unknown): input is RpcParamSchema {
    return (
        isAObjectSchema(input) ||
        isARecordSchema(input) ||
        isADiscriminatorSchema(input)
    );
}

export interface ArriProcedure<
    TParams extends RpcParamSchema | undefined,
    TResponse extends RpcParamSchema | undefined,
> {
    description?: string;
    method?: RpcHttpMethod;
    path?: string;
    params: TParams;
    response: TResponse;
    handler: ArriProcedureHandler<
        TParams extends RpcParamSchema ? InferType<TParams> : undefined,
        // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
        TResponse extends RpcParamSchema ? InferType<TResponse> : void
    >;
    postHandler?: ArriProcedurePostHandler<
        TParams extends RpcParamSchema ? InferType<TParams> : undefined,
        TResponse extends RpcParamSchema ? InferType<TResponse> : undefined
    >;
}

export interface ArriNamedProcedure<
    TParams extends RpcParamSchema | undefined,
    TResponse extends RpcParamSchema | undefined,
> extends ArriProcedure<TParams, TResponse> {
    name: string;
}

export type HandlerContext = Record<string, any>;

export interface RpcHandlerContext<TParams = undefined>
    extends HandlerContext,
        Omit<H3EventContext, "params"> {
    rpcName: string;
    params: TParams;
}

export interface RpcPostHandlerContext<
    TParams = undefined,
    TResponse = undefined,
> extends RpcHandlerContext<TParams> {
    response: TResponse;
}

export interface RpcEvent<TParams = undefined>
    extends Omit<H3Event, "context"> {
    context: RpcHandlerContext<TParams>;
}

export interface RpcPostEvent<TParams = undefined, TResponse = undefined>
    extends Omit<H3Event, "context"> {
    context: RpcPostHandlerContext<TParams, TResponse>;
}

export type ArriProcedureHandler<TParams, TResponse> = (
    context: RpcHandlerContext<TParams>,
    event: RpcEvent<TParams>,
) => TResponse | Promise<TResponse>;

export type ArriProcedurePostHandler<TParams, TResponse> = (
    context: RpcPostHandlerContext<TParams, TResponse>,
    event: RpcPostEvent<TParams, TResponse>,
) => any;

export function isRpc(input: any): input is ArriProcedure<any, any> {
    if (typeof input !== "object" || input === null) {
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
    TParams extends RpcParamSchema | undefined = undefined,
    TResponse extends RpcParamSchema | undefined | never = undefined,
>(
    config: ArriProcedure<TParams, TResponse>,
): ArriProcedure<TParams, TResponse> {
    return config;
}

export function createRpcDefinition(
    rpcName: string,
    httpPath: string,
    procedure: ArriProcedure<any, any>,
): RpcDefinition {
    return {
        description: procedure.description,
        path: httpPath,
        method: procedure.method ?? "post",
        params: getRpcParamName(rpcName, procedure),
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
): string | undefined {
    if (!isRpcParamSchema(procedure.params)) {
        return undefined;
    }
    const nameParts = rpcName
        .split(".")
        .map((part) =>
            removeDisallowedChars(part, "!@#$%^&*()+=[]{}|\\;:'\"<>,./?"),
        );
    const paramName =
        procedure.params.metadata.id ??
        pascalCase(`${nameParts.join(`_`)}_params`);
    return paramName;
}

export function getRpcResponseName(
    rpcName: string,
    procedure: ArriProcedure<any, any>,
): string | undefined {
    if (!isRpcParamSchema(procedure.response)) {
        return undefined;
    }
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

function getRpcResponseDefinition(
    rpcName: string,
    procedure: ArriProcedure<any, any>,
): RpcDefinition["response"] {
    if (!isRpcParamSchema(procedure.response)) {
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
    procedure: ArriNamedProcedure<any, any>,
    opts: RouteOptions,
) {
    let responseValidator: undefined | ReturnType<typeof a.compile>;
    try {
        responseValidator = procedure.response
            ? a.compile(procedure.response)
            : undefined;
    } catch (err) {
        console.error("ERROR COMPILING VALIDATOR", err);
    }
    const httpMethod = procedure.method ?? "post";
    const handler = eventHandler(async (event: MiddlewareEvent) => {
        event.context.rpcName = procedure.name;
        if (isPreflightRequest(event)) {
            return "ok";
        }
        try {
            if (opts.onRequest) {
                await opts.onRequest(event);
            }
            if (opts.middleware.length) {
                for (const m of opts.middleware) {
                    await m(event);
                }
            }
            if (isRpcParamSchema(procedure.params)) {
                switch (httpMethod) {
                    case "get": {
                        const parsedParams = await getValidatedQuery(
                            event,
                            (input) => a.safeCoerce(procedure.params, input),
                        );
                        if (parsedParams.success) {
                            event.context.params = parsedParams.value;
                        } else {
                            const errParts: string[] = [];
                            for (const err of parsedParams.error.errors) {
                                const errPath = err.instancePath.split("/");
                                errPath.shift();
                                const propName = errPath.join(".");
                                if (!errParts.includes(propName)) {
                                    errParts.push(propName);
                                }
                            }
                            const message = `Missing or invalid url query parameters: [${errParts.join(
                                ", ",
                            )}]`;
                            throw defineError(400, {
                                statusMessage: message,
                                data: parsedParams.error,
                            });
                        }
                        break;
                    }
                    case "delete":
                    case "patch":
                    case "post":
                    case "put": {
                        const body = await readRawBody(event);
                        if (!body) {
                            throw defineError(400, {
                                statusMessage: `Invalid request body. Expected object. Got undefined.`,
                            });
                        }
                        const parsedParams = a.safeParse(
                            procedure.params,
                            body,
                        );
                        if (!parsedParams.success) {
                            const errorParts: string[] = [];
                            for (const err of parsedParams.error.errors) {
                                const errPath = err.instancePath.split("/");
                                errPath.shift();
                                if (!errorParts.includes(errPath.join("."))) {
                                    errorParts.push(errPath.join("."));
                                }
                            }
                            throw defineError(400, {
                                statusMessage: `Invalid request body. Affected properties [${errorParts.join(
                                    ", ",
                                )}]`,
                                data: parsedParams.error,
                            });
                        }
                        event.context.params = parsedParams.value;
                        break;
                    }
                    default:
                        break;
                }
            }

            const response = await procedure.handler(
                event.context as any,
                event as any,
            );
            event.context.response = response;
            if (opts.onBeforeResponse) {
                await opts.onBeforeResponse(event);
            }
            if (typeof response === "object") {
                setResponseHeader(event, "Content-Type", "application/json");
                await send(
                    event,
                    responseValidator?.serialize(response) ??
                        JSON.stringify(response),
                );
            } else {
                setResponseHeader(event, "Content-Type", "application/json");
                await send(event, `{}`);
            }
            if (opts.onAfterResponse) {
                await opts.onAfterResponse(event);
            }
            if (procedure.postHandler) {
                await procedure.postHandler(event.context as any, event as any);
            }
        } catch (err) {
            await handleH3Error(err, event, opts.onError);
        }
        return "";
    });
    switch (httpMethod) {
        case "get":
            router.get(path, handler);
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
