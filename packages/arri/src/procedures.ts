import {
    type HttpMethod,
    isHttpMethod,
    type RpcDefinition,
    removeDisallowedChars,
} from "arri-codegen-utils";
import {
    type AObjectSchema,
    type InferType,
    isAObjectSchema,
    a,
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
import { type RouteOptions } from "./routes";

export interface ArriProcedure<
    TParams extends AObjectSchema | undefined,
    TResponse extends AObjectSchema | undefined,
> {
    description?: string;
    method?: HttpMethod;
    path?: string;
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

export interface ArriNamedProcedure<
    TParams extends AObjectSchema | undefined,
    TResponse extends AObjectSchema | undefined,
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
    if (!isAObjectSchema(procedure.params)) {
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
    if (!isAObjectSchema(procedure.response)) {
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
    if (!isAObjectSchema(procedure.response)) {
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
    const paramValidator = procedure.params
        ? a.compile(procedure.params)
        : undefined;
    const responseValidator = procedure.response
        ? a.compile(procedure.response)
        : undefined;
    const httpMethod = procedure.method ?? "post";
    const handler = eventHandler(async (event: H3Event) => {
        event.context.rpcName = procedure.name;
        if (isPreflightRequest(event)) {
            return "ok";
        }
        try {
            if (opts.middleware.length) {
                for (const m of opts.middleware) {
                    await m(event);
                }
            }
            if (isAObjectSchema(procedure.params) && paramValidator) {
                switch (httpMethod) {
                    case "get":
                    case "head": {
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
                        const parsedParams = paramValidator.safeParse(body);
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
                event,
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
                await send(
                    event,
                    response ??
                        `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Empty Response</title>
    </head>
    <body>
        nothing to see here
    </body>
</html>
`,
                );
            }
            if (opts.onAfterResponse) {
                await opts.onAfterResponse(event);
            }
            if (procedure.postHandler) {
                await procedure.postHandler(event.context as any, event);
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
