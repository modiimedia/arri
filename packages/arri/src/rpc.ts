import {
    type RpcDefinition,
    removeDisallowedChars,
    isRpcHttpMethod,
    type RpcHttpMethod,
    type HttpRpcDefinition,
} from "arri-codegen-utils";
import {
    type AObjectSchema,
    type InferType,
    isAObjectSchema,
    a,
    type ADiscriminatorSchema,
    type ASchema,
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
import {
    type EventStreamRpc,
    type EventStreamRpcHandler,
} from "./eventStreamRpc";
import { type MiddlewareEvent } from "./middleware";
import { type RouteOptions } from "./route";

export type RpcParamSchema<TObjectInner = any, TDiscriminatorInner = any> =
    | AObjectSchema<TObjectInner>
    | ADiscriminatorSchema<TDiscriminatorInner>;

export function isRpcParamSchema(input: unknown): input is RpcParamSchema {
    return isAObjectSchema(input) || isADiscriminatorSchema(input);
}

export interface NamedRpc<
    TIsEventStream extends boolean = false,
    TParams extends RpcParamSchema | undefined = undefined,
    TResponse extends RpcParamSchema | undefined = undefined,
> extends Rpc<TIsEventStream, TParams, TResponse> {
    name: string;
}

export interface Rpc<
    TIsEventStream extends boolean = false,
    TParams extends RpcParamSchema | undefined = undefined,
    TResponse extends RpcParamSchema | undefined = undefined,
> {
    method?: RpcHttpMethod;
    path?: string;
    description?: string;
    params: TParams;
    response: TResponse;
    isDeprecated?: boolean;
    isEventStream?: TIsEventStream;
    pingInterval?: TIsEventStream extends true ? number : undefined;
    handler: TIsEventStream extends true
        ? EventStreamRpcHandler<
              TParams extends RpcParamSchema ? InferType<TParams> : undefined,
              TResponse extends RpcParamSchema
                  ? InferType<TResponse>
                  : undefined
          >
        : RpcHandler<
              TParams extends RpcParamSchema ? InferType<TParams> : undefined,
              // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
              TResponse extends RpcParamSchema ? InferType<TResponse> : void
          >;
    postHandler?: TIsEventStream extends true
        ? undefined
        : RpcPostHandler<
              TParams extends RpcParamSchema ? InferType<TParams> : undefined,
              TResponse extends RpcParamSchema
                  ? InferType<TResponse>
                  : undefined
          >;
}
export type HttpRpc<
    TParams extends RpcParamSchema | undefined,
    TResponse extends RpcParamSchema | undefined,
> = Omit<Rpc<false, TParams, TResponse>, "isEventStream">;

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

export type RpcHandler<TParams, TResponse> = (
    context: RpcHandlerContext<TParams>,
    event: RpcEvent<TParams>,
) => TResponse | Promise<TResponse>;

export type RpcPostHandler<TParams, TResponse> = (
    context: RpcPostHandlerContext<TParams, TResponse>,
    event: RpcPostEvent<TParams, TResponse>,
) => any;

export function isRpc(input: unknown): input is Rpc<any, any> {
    return (
        typeof input === "object" &&
        input !== null &&
        "method" in input &&
        isRpcHttpMethod(input.method) &&
        "handler" in input &&
        typeof input.handler === "function"
    );
}

export function defineRpc<
    TParams extends RpcParamSchema | undefined = undefined,
    TResponse extends RpcParamSchema | undefined | never = undefined,
>(config: HttpRpc<TParams, TResponse>): Rpc<false, TParams, TResponse> {
    return config;
}

export function createHttpRpcDefinition(
    rpcName: string,
    httpPath: string,
    procedure: Rpc<any, any, any>,
): HttpRpcDefinition {
    let method: RpcHttpMethod;
    if (procedure.isEventStream === true) {
        method = procedure.method ?? "get";
    } else {
        method = procedure.method ?? "post";
    }
    return {
        transport: "http",
        description: procedure.description,
        path: httpPath,
        method,
        params: getRpcParamName(rpcName, procedure),
        response: getRpcResponseDefinition(rpcName, procedure),
        isDeprecated: procedure.isDeprecated,
        isEventStream: procedure.isEventStream === true ? true : undefined,
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
    procedure: Rpc<any, any, any>,
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
    procedure: Rpc<any, any, any>,
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
    procedure: Rpc<any, any> | EventStreamRpc<any, any>,
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
    procedure: NamedRpc<any, any, any>,
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
                await validateRpcRequestInput(
                    event,
                    httpMethod,
                    procedure.params,
                );
            }

            const response = await procedure.handler(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                event.context as any,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                event as any,
            );
            event.context.response = response;
            if (opts.onBeforeResponse) {
                await opts.onBeforeResponse(event);
            }
            if (typeof response === "object") {
                if (!responseValidator?.validate(response)) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    const errors = a.errors(procedure.response, response);
                    throw defineError(500, {
                        statusMessage:
                            "Failed to serialize response. Response does not match specified schema",
                        data: errors,
                    });
                }
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
                await procedure.postHandler(
                    event.context as RpcPostHandlerContext,
                    event as RpcPostEvent,
                );
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

export async function validateRpcRequestInput(
    event: H3Event,
    httpMethod: RpcHttpMethod,
    schema: ASchema,
) {
    switch (httpMethod) {
        case "get": {
            const parsedParams = await getValidatedQuery(event, (input) =>
                a.safeCoerce(schema, input),
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
            const parsedParams = a.safeParse(schema, body);
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
