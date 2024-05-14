/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { type HttpMethod } from "@arrirpc/codegen-utils";
import {
    type InferType,
    type AObjectSchema,
    a,
    type ASchema,
} from "@arrirpc/schema";
import {
    type Router,
    defineEventHandler,
    setHeader,
    send,
    isPreflightRequest,
    getQuery,
    type HTTPMethod,
    readRawBody,
    type H3Event,
} from "h3";
import { type ArriOptions } from "./app";
import { type RoutePostEventContext, type RouteEventContext } from "./context";
import { defineError, handleH3Error } from "./errors";
import { type MiddlewareEvent, type Middleware } from "./middleware";

export interface RouteEvent<
    TPath extends string,
    TQuery extends Record<any, any> = any,
    TBody = any,
> extends H3Event {
    context: RouteEventContext<TPath, TQuery, TBody>;
}

export interface PostRouteEvent<
    TPath extends string,
    TQuery extends Record<any, any> = any,
    TBody = any,
    TResponse = any,
> extends H3Event {
    context: RoutePostEventContext<TPath, TQuery, TBody, TResponse>;
}

export interface ArriRoute<
    TPath extends string,
    TQuery extends AObjectSchema<any, any> = any,
    TBody extends ASchema<any> = any,
    TResponse = any,
> {
    path: TPath;
    method: HttpMethod | HttpMethod[];
    query?: TQuery;
    body?: TBody;
    handler: (
        event: RouteEvent<TPath, InferType<TQuery>, InferType<TBody>>,
    ) => TResponse;
    postHandler?: (
        event: PostRouteEvent<
            TPath,
            InferType<TQuery>,
            InferType<TBody>,
            Awaited<TResponse>
        >,
    ) => any;
}

export function defineRoute<
    TPath extends string,
    TQuery extends AObjectSchema<any, any> = any,
    TBody extends AObjectSchema<any, any> = any,
    TResponse = any,
>(route: ArriRoute<TPath, TQuery, TBody, TResponse>) {
    return route;
}

export type RouteOptions = Pick<
    ArriOptions,
    "onAfterResponse" | "onBeforeResponse" | "onError" | "onRequest" | "debug"
> & { middleware: Middleware[] };

export function registerRoute(
    router: Router,
    route: ArriRoute<any>,
    opts: RouteOptions,
) {
    if (typeof route.method === "string") {
        handleRoute(router, route.method, route, opts);
        return;
    }
    for (const method of route.method) {
        handleRoute(router, method, route, opts);
    }
}

export function handleRoute(
    router: Router,
    method: HttpMethod,
    route: ArriRoute<any>,
    opts: RouteOptions,
) {
    const handler = defineEventHandler(async (event: MiddlewareEvent) => {
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
            if (route.query) {
                const query = getQuery(event);
                const parsedQuery = a.safeCoerce(route.query as ASchema, query);
                if (!parsedQuery.success) {
                    const errParts: string[] = [];
                    for (const err of parsedQuery.error.errors) {
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
                        message,
                    });
                }
                event.context.query = parsedQuery.value;
            }
            const notAllowedBodyMethods: HTTPMethod[] = [
                "GET",
                "HEAD",
                "CONNECT",
                "OPTIONS",
            ];
            if (route.body && !notAllowedBodyMethods.includes(event.method)) {
                const body = await readRawBody(event);
                const parsedBody = a.safeParse(route.body as ASchema, body);
                if (!parsedBody.success) {
                    const errorParts: string[] = [];
                    for (const err of parsedBody.error.errors) {
                        const errPath = err.instancePath.split("/");
                        errPath.shift();
                        if (!errorParts.includes(errPath.join("."))) {
                            errorParts.push(errPath.join("."));
                        }
                    }
                    throw defineError(400, {
                        message: `Invalid request body. Affected properties [${errorParts.join(
                            ", ",
                        )}]`,
                        data: parsedBody.error,
                    });
                }
                event.context.body = parsedBody.value;
            }
            const response = await route.handler(event as RouteEvent<string>);
            event.context.response = response;
            if (!event.handled) {
                if (opts.onBeforeResponse) {
                    await opts.onBeforeResponse(event);
                }
                if (typeof response === "object" && response) {
                    setHeader(event, "Content-Type", "application/json");
                    await send(event, JSON.stringify(response));
                } else {
                    await send(event, response);
                }
            }
            if (opts.onAfterResponse) {
                await opts.onAfterResponse(event);
            }
            if (route.postHandler) {
                await route.postHandler(event as PostRouteEvent<string>);
            }
        } catch (err) {
            await handleH3Error(err, event, opts.onError, opts.debug ?? false);
        }
        return "";
    });

    switch (method) {
        case "head":
            router.head(route.path, handler);
            break;
        case "get":
            router.get(route.path, handler);
            break;
        case "delete":
            router.delete(route.path, handler);
            break;
        case "patch":
            router.patch(route.path, handler);
            break;
        case "post":
            router.post(route.path, handler);
            break;
        case "put":
            router.put(route.path, handler);
            break;
    }
}
