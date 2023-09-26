import { type HttpMethod } from "arri-codegen-utils";
import {
    type Router,
    type H3Event,
    defineEventHandler,
    setHeader,
    send,
} from "h3";
import { type ArriOptions } from "./app";
import { handleH3Error } from "./errors";
import { type Middleware } from "./middleware";

export interface ArriRoute<TPath extends string> {
    path: TPath;
    method: HttpMethod | HttpMethod[];
    handler: (event: H3Event) => any;
    postHandler?: (event: H3Event) => any;
}

export type RouteOptions = Pick<
    ArriOptions,
    "onAfterResponse" | "onBeforeResponse" | "onError" | "onRequest"
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
            if (opts.onRequest) {
                await opts.onRequest(event);
            }
            if (opts.middleware.length) {
                for (const m of opts.middleware) {
                    await m(event);
                }
            }
            const response = await route.handler(event);
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
                await route.postHandler(event);
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
