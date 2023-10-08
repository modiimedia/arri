import { type HttpMethod } from "arri-codegen-utils";
import {
    type Router,
    type H3Event,
    defineEventHandler,
    setHeader,
    send,
    type H3EventContext,
} from "h3";
import { type ArriOptions } from "./app";
import { handleH3Error } from "./errors";
import { type Middleware } from "./middleware";

export type ExtractParam<Path, NextPart> = Path extends `:${infer Param}`
    ? Record<Param, string> & NextPart
    : NextPart;

export type ExtractParams<Path> = Path extends `${infer Segment}/${infer Rest}`
    ? ExtractParam<Segment, ExtractParams<Rest>>
    : // eslint-disable-next-line @typescript-eslint/ban-types
      ExtractParam<Path, {}>;

export interface RouteEventContext<TPath extends string>
    extends H3EventContext {
    params: ExtractParams<TPath>;
}

export interface RouteEvent<TPath extends string> extends H3Event {
    context: RouteEventContext<TPath>;
}

export interface ArriRoute<TPath extends string> {
    path: TPath;
    method: HttpMethod | HttpMethod[];
    handler: (event: RouteEvent<TPath>) => any;
    postHandler?: (event: RouteEvent<TPath>) => any;
}

export type RouteOptions = Pick<
    ArriOptions,
    "onAfterResponse" | "onBeforeResponse" | "onError"
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
    const handler = defineEventHandler(async (event) => {
        try {
            if (opts.middleware.length) {
                for (const m of opts.middleware) {
                    await m(event);
                }
            }
            const response = await route.handler(event as any);
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
                await route.postHandler(event as any);
            }
        } catch (err) {
            await handleH3Error(err, event, opts.onError);
        }
    });

    switch (method) {
        case "get":
            router.get(route.path, handler);
            break;
        case "delete":
            router.delete(route.path, handler);
            break;
        case "head":
            router.head(route.path, handler);
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
