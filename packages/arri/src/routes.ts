import {
    type H3Event,
    type Router,
    send,
    setResponseHeader,
    eventHandler,
} from "h3";
import { type ArriOptions } from "./app";
import { handleH3Error } from "./errors";
import type { HandlerContext } from "./procedures";
import { HttpMethod } from "arri-codegen-utils";
import { AObjectSchema, ASchema, InferType } from "arri-validate";

export interface ArriRoute<
    TPath extends string,
    TMethod extends HttpMethod,
    TQuery extends AObjectSchema | undefined = undefined,
    TBody extends ASchema | undefined = undefined,
    TResponse extends ASchema | undefined = undefined,
    TFallbackResponse = any,
> {
    path: TPath;
    method: TMethod;
    query?: TQuery;
    body?: TBody;
    response?: TResponse;
    handler: ArriRouteHandler<
        TPath,
        TQuery extends AObjectSchema ? InferType<TQuery> : undefined,
        TBody extends ASchema ? InferType<TBody> : undefined,
        TResponse extends ASchema ? InferType<TResponse> : TFallbackResponse
    >;
    postHandler?: ArriRoutePostHandler<
        TPath,
        TQuery extends AObjectSchema ? InferType<TQuery> : undefined,
        TBody extends ASchema ? InferType<TBody> : undefined,
        TResponse extends ASchema ? InferType<TResponse> : TFallbackResponse
    >;
}

export function defineRoute<
    TPath extends string,
    TMethod extends HttpMethod,
    TQuery extends AObjectSchema | undefined = any,
    TBody extends ASchema | undefined = any,
    TResponse extends ASchema | undefined = undefined,
    TFallbackResponse = any,
>(
    config: ArriRoute<
        TPath,
        TMethod,
        TQuery,
        TBody,
        TResponse,
        TFallbackResponse
    >,
) {
    return config;
}

export type Middleware = (
    context: HandlerContext,
    event: H3Event,
) => void | Promise<void>;
export const defineMiddleware = (middleware: Middleware) => middleware;

export type ExtractParam<Path, NextPart> = Path extends `:${infer Param}`
    ? Record<Param, string> & NextPart
    : NextPart;

export type ExtractParams<Path> = Path extends `${infer Segment}/${infer Rest}`
    ? ExtractParam<Segment, ExtractParams<Rest>>
    : // eslint-disable-next-line @typescript-eslint/ban-types
      ExtractParam<Path, {}>;

export type ArriRouteHandler<
    TPath extends string,
    TQuery = undefined,
    TBody = undefined,
    TResponse = any,
> = (
    context: RouteHandlerContext<ExtractParams<TPath>, TQuery, TBody>,
    event: H3Event,
) => TResponse extends undefined
    ? void | Promise<void>
    : TResponse | Promise<TResponse>;

export interface RouteHandlerContext<
    TParams extends Record<string, string>,
    TQuery = undefined,
    TBody = undefined,
> extends HandlerContext {
    type: "route";
    params: TParams;
    query: TQuery;
    body: TBody;
}

export interface RoutePostHandlerContext<
    TParams extends Record<string, string>,
    TQuery = undefined,
    TBody = undefined,
    TResponse = undefined,
> extends RouteHandlerContext<TParams, TQuery, TBody> {
    response: TResponse;
}

export type ArriRoutePostHandler<
    TPath extends string,
    TQuery = undefined,
    TBody = undefined,
    TResponse = undefined,
> = (
    context: RoutePostHandlerContext<
        ExtractParams<TPath>,
        TQuery,
        TBody,
        TResponse
    >,
    event: H3Event,
) => any;

export function registerRoute<TPath extends string>(
    router: Router,
    route: ArriRoute<TPath, HttpMethod, any, any, any>,
    middleware: Middleware[],
    prefix?: string,
    opts?: ArriOptions,
) {
    const handler = eventHandler(async (event: H3Event) => {
        const context: RouteHandlerContext<any> = {
            type: "route",
            params: event.context.params,
            query: undefined,
            body: undefined,
        };
        try {
            if (middleware.length) {
                for (const m of middleware) {
                    await m(context, event);
                }
            }
            if (route.query) {
                // const result = await getValidatedQuery(
                //     event,
                //     typeboxSafeValidate(route.query, true),
                // );
                // if (!result.success) {
                //     throw errorResponseFromValidationErrors(
                //         result.errors,
                //         "Missing or invalid query parameters",
                //     );
                // }
                // context.query = result.value;
            }
            if (
                route.body &&
                route.method !== "get" &&
                route.method !== "head"
            ) {
                // const result = await readValidatedBody(
                //     event,
                //     typeboxSafeValidate(route.body),
                // );
                // if (!result.success) {
                //     throw errorResponseFromValidationErrors(
                //         result.errors,
                //         "Missing or invalid body parameters",
                //     );
                // }
                // context.body = result.value;
            }
            const response = await route.handler(context, event);
            context.response = response;
            if (opts?.onBeforeResponse) {
                await opts.onBeforeResponse(context as any, event);
            }
            if (typeof response === "object") {
                setResponseHeader(event, "Content-Type", "application/json");
                await send(event, JSON.stringify(response));
            } else {
                await send(event, response ?? "");
            }
            if (opts?.onAfterResponse) {
                await opts.onAfterResponse(context as any, event);
            }
            if (route.postHandler) {
                await route.postHandler(context as any, event);
            }
        } catch (err) {
            await handleH3Error(err, context, event, opts?.onError);
        }
        if (!event.handled) {
            await send(event, "");
        }
        return "";
    });
    const finalPath = (prefix ? `/${prefix}${route.path}` : route.path)
        .split("//")
        .join("/");
    switch (route.method) {
        case "get":
            router.get(finalPath, handler);
            break;
        case "head":
            router.head(finalPath, handler);
            break;
        case "delete":
            router.delete(finalPath, handler);
            break;
        case "patch":
            router.patch(finalPath, handler);
            break;
        case "post":
            router.post(finalPath, handler);
            break;
        case "put":
            router.put(finalPath, handler);
            break;
    }
}
