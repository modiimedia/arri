import { H3Event, RouterMethod, send, setResponseStatus } from "h3";
import { AnyZodObject, ZodTypeAny } from "zod";
import { ExtractParams } from "./utils";
import { zh } from "h3-zod";
import { defineError, isH3Error } from "./errors";

export interface RouteEventContext<
    Params extends Record<string, string> = any,
    Body = any,
    Query = any,
    Response = any
> {
    params?: Params;
    body?: Body;
    query?: Query;
    response?: Response;
}

export interface RouteEvent<Context extends RouteEventContext> extends H3Event {
    context: Context;
}

export interface ApiRoute<
    Path extends String = "",
    Method extends RouterMethod = "get",
    Body extends undefined | ZodTypeAny = undefined,
    Query extends undefined | AnyZodObject = undefined,
    Response = any
> {
    path: Path;
    method: Method;
    schema?: {
        body?: Body;
        query?: Query;
    };
    handler: (
        event: RouteEvent<
            RouteEventContext<
                ExtractParams<Path>,
                Body extends ZodTypeAny ? Body["_type"] : undefined,
                Query extends AnyZodObject ? Query["_type"] : undefined,
                undefined
            >
        >
    ) => Response | Promise<Response>;
    postHandler?: (
        event: RouteEvent<
            RouteEventContext<
                ExtractParams<Path>,
                Body extends ZodTypeAny ? Body["_type"] : undefined,
                Query extends AnyZodObject ? Query["_type"] : undefined,
                Response
            >
        >
    ) => any;
}

export const defineApiRoute = <
    Path extends String,
    Method extends RouterMethod,
    Body extends undefined | ZodTypeAny,
    Query extends undefined | AnyZodObject,
    Response = any
>(
    route: ApiRoute<Path, Method, Body, Query, Response>
) => route;

export type ApiRouteMiddleware = (
    event: RouteEvent<
        RouteEventContext<Record<string, string>, any, any, undefined>
    >
) => void | Promise<void>;

export const defineRouteMiddleware = (middleware: ApiRouteMiddleware) =>
    middleware;

export async function handleApiRoute(
    event: H3Event,
    route: ApiRoute,
    middlewares: ApiRouteMiddleware[]
) {
    const processedEvent = event as RouteEvent<RouteEventContext>;
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
        const result = await route.handler(processedEvent);
        await send(processedEvent, result);

        if (route.postHandler) {
            processedEvent.context.response = result;
            await route.postHandler(processedEvent);
        }
    } catch (err) {
        if (isH3Error(err)) {
            setResponseStatus(processedEvent, err.statusCode);
            await send(processedEvent, err, "application/json");
            return;
        }
        setResponseStatus(processedEvent, 500);
        await send(
            processedEvent,
            defineError(500, {
                statusMessage: "an unknown error occurred",
                message: "an unknown error occurred",
                data: err,
            })
        );
    }
}
