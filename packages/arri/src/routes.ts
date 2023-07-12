import {
    type App,
    type H3Event,
    type RouterMethod,
    defineEventHandler,
    send,
    sendError,
    setResponseStatus,
} from "h3";
import { type AnyZodObject, type ZodTypeAny } from "zod";
import { type ExtractParams } from "./utils";
import { zh } from "h3-zod";
import { defineError, isH3Error } from "./errors";

export interface HandlerEventContext<
    Params extends Record<string, string> = any,
    Body = any,
    Query = any
> {
    params: Params;
    body: Body;
    query: Query;
}

export interface PostHandlerEventContext<
    Params extends Record<string, string> = any,
    Body = any,
    Query = any,
    Response = any
> extends HandlerEventContext<Params, Body, Query> {
    response: Response;
}

export interface RouteEvent<Context extends HandlerEventContext>
    extends H3Event {
    context: Context;
}

export type ArriRouteHandler<
    Params extends Record<string, string>,
    Body,
    Query,
    Response
> = (
    event: RouteEvent<HandlerEventContext<Params, Body, Query>>
) => Response | Promise<Response>;

export interface ArriRoute<
    Path extends string = "",
    Method extends RouterMethod = "get",
    Body extends undefined | ZodTypeAny = undefined,
    Query extends undefined | AnyZodObject = undefined,
    Response = any
> {
    id?: undefined | string;
    path: Path;
    method: Method;
    schema?:
        | undefined
        | {
              body?: Body;
              query?: Query;
          };
    handler: ArriRouteHandler<
        ExtractParams<Path>,
        Body extends ZodTypeAny ? Body["_type"] : undefined,
        Query extends AnyZodObject ? Query["_type"] : undefined,
        Response
    >;
    postHandler?: (
        event: RouteEvent<
            PostHandlerEventContext<
                ExtractParams<Path>,
                Body extends ZodTypeAny ? Body["_type"] : undefined,
                Query extends AnyZodObject ? Query["_type"] : undefined,
                Response
            >
        >
    ) => any;
}

export const defineRoute = <
    Path extends string,
    Method extends RouterMethod,
    Body extends undefined | ZodTypeAny = any,
    Query extends undefined | AnyZodObject = any,
    Response = any
>(
    route: ArriRoute<Path, Method, Body, Query, Response>
): ArriRoute<Path, Method, Body, Query, Response> => route;

export type ApiRouteMiddleware = (
    event: RouteEvent<HandlerEventContext<Record<string, string>, any, any>>
) => void | Promise<void>;

export const defineMiddleware = (
    middleware: ApiRouteMiddleware
): ApiRouteMiddleware => middleware;

export async function handleRoute(
    event: H3Event,
    route: ArriRoute,
    middlewares: ApiRouteMiddleware[]
): Promise<void> {
    const processedEvent = event as RouteEvent<
        HandlerEventContext<any, unknown, unknown>
    >;
    try {
        if (route.schema?.body) {
            const body = await zh.useValidatedBody(event, route.schema.body);
            processedEvent.context.body = body;
        }
        if (route.schema?.query) {
            const query = await zh.useValidatedQuery(event, route.schema.query);
            processedEvent.context.query = query;
        }
        for (const item of middlewares) {
            await item(processedEvent);
        }
        if (processedEvent._handled) {
            return;
        }
        const result = await route.handler(processedEvent as any);
        await send(processedEvent, result);

        if (route.postHandler) {
            (processedEvent.context as any).response = result;
            await route.postHandler(processedEvent as any);
        }
    } catch (err) {
        if (isH3Error(err)) {
            setResponseStatus(processedEvent, err.statusCode);
            sendError(processedEvent, err);
        }
        setResponseStatus(processedEvent, 500);
        sendError(
            processedEvent,
            defineError(500, {
                statusMessage: "an unknown error occurred",
                message: "an unknown error occurred",
                data: err,
            })
        );
    }
}

export function registerArriRoutes(app: App, routeMap: any): void {
    const routes: ArriRoute[] = [];
    Object.keys(routeMap).forEach((key) => {
        const routeGetMap = routeMap[key as RouterMethod];
        Object.keys(routeGetMap).forEach((path) => {
            routes.push(routeGetMap[path]);
        });
    });

    for (const route of routes) {
        registerArriRoute(app, route);
    }
}

export function registerArriRoute(app: App, route: ArriRoute): void {
    app.use(
        route.path,
        defineEventHandler(async (event) => {
            const parsedContext = event.context as HandlerEventContext<
                any,
                any,
                any
            >;
            parsedContext.params = event.context.params ?? {};
            if (route.schema?.body && methodAllowsBody(route.method)) {
                const body = await zh.useSafeValidatedBody(
                    event,
                    route.schema.body as ZodTypeAny
                );

                if (!body?.success) {
                    throw defineError(400, {
                        statusMessage: "Invalid request body",
                        data: body.error.errors,
                    });
                }
                parsedContext.body = body.data;
            }
            if (route.schema?.query) {
                const query = await zh.useSafeValidatedQuery(
                    event,
                    route.schema.query as AnyZodObject
                );
                if (!query?.success) {
                    const params: Array<string | number> = [];
                    for (const err of query.error.errors) {
                        if (err.path.length) {
                            params.push(err.path[0]);
                        }
                    }
                    throw defineError(400, {
                        statusMessage: `Missing/invalid required url query parameters: [${params.join(
                            ", "
                        )}]`,
                        data: query.error.errors,
                    });
                }
                parsedContext.query = query.data;
            }
            event.context = parsedContext;
            const response = await route.handler(event as any);
            (event.context as any).response = response;
            if (route.postHandler) {
                await route.postHandler(event as any);
            }
        }),
        { lazy: true }
    );
}

export const methodAllowsBody = (method: RouterMethod): boolean => {
    switch (method) {
        case "patch":
        case "post":
        case "put":
        case "delete":
            return true;
        default:
            return false;
    }
};
