import {
    type InputLayer,
    type EventHandler,
    type App,
    setHeader,
    send,
    type Router as H3Router,
    type RouterMethod,
    isPreflightRequest,
    defineEventHandler,
    createRouter,
} from "h3";
import { type AObjectSchema } from "packages/arri-validate/dist";
import { type ArriOptions } from "./app";
import { handleH3Error } from "./errors";
import { type Middleware } from "./middleware";
import { type ArriProcedure } from "./procedures";

interface RouteOptions {
    middleware: Middleware[];
    onBeforeResponse?: ArriOptions["onBeforeResponse"];
    onAfterResponse?: ArriOptions["onAfterResponse"];
    onError?: ArriOptions["onError"];
}

export function handleUse(
    app: App,
    path: string,
    handler: EventHandler,
    options: RouteOptions,
    h3Options?: Partial<InputLayer>,
) {
    app.use(
        path,
        defineEventHandler(async (event) => {
            try {
                if (isPreflightRequest(event)) {
                    return "ok";
                }
                for (const m of options.middleware) {
                    await m(event);
                }
                const response = await handler(event);
                event.context.response = response;
                if (event.handled) {
                    return "";
                }
                if (options.onBeforeResponse) {
                    await options.onBeforeResponse(event as any);
                }
                if (typeof response === "object") {
                    setHeader(event, "Content-Type", "application/json");
                    await send(event, JSON.stringify(response));
                } else {
                    await send(event, response);
                }
                if (options.onAfterResponse) {
                    await options.onAfterResponse(event);
                }
            } catch (err) {
                await handleH3Error(err, event, options.onError);
            }
            return "";
        }),
        h3Options,
    );
}

export function handleRoute(
    router: H3Router,
    path: string,
    method: RouterMethod,
    handler: EventHandler,
    options: RouteOptions,
) {
    switch (method) {
        case "connect":
            router.connect(path, handleRouteHandler(handler, options));
            break;
        case "delete":
            router.delete(path, handleRouteHandler(handler, options));
            break;
        case "get":
            router.get(path, handleRouteHandler(handler, options));
            break;
        case "head":
            router.head(path, handleRouteHandler(handler, options));
            break;
        case "options":
            router.options(path, handleRouteHandler(handler, options));
            break;
        case "patch":
            router.patch(path, handleRouteHandler(handler, options));
            break;
        case "post":
            router.post(path, handleRouteHandler(handler, options));
            break;
        case "put":
            router.put(path, handleRouteHandler(handler, options));
            break;
        case "trace":
            router.trace(path, handleRouteHandler(handler, options));
            break;
    }
}

export function handleRouteHandler(
    handler: EventHandler,
    options: RouteOptions,
) {
    return defineEventHandler(async (event) => {
        try {
            if (isPreflightRequest(event)) {
                return "ok";
            }
            for (const m of options.middleware) {
                await m(event);
            }
            const result = await handler(event);
            if (event.handled) {
                return "";
            }
            event.context.response = result;
            if (options.onBeforeResponse) {
                await options.onBeforeResponse(event);
            }
            if (typeof result === "object") {
                setHeader(event, "Content-Type", "application/json");
                await send(event, JSON.stringify(result));
            } else {
                await send(event, result);
            }
            if (options.onAfterResponse) {
                await options.onAfterResponse(event);
            }
        } catch (err) {
            await handleH3Error(err, event, options.onError);
        }
        return "";
    });
}

export class Router {
    private readonly procedures: Array<{
        name: string;
        procedure: ArriProcedure<any, any>;
    }> = [];

    private readonly router = createRouter();

    rpc = this.procedure;
    procedure<
        TParams extends AObjectSchema<any, any> | undefined,
        TResponse extends AObjectSchema<any, any> | undefined,
    >(name: string, procedure: ArriProcedure<TParams, TResponse>) {
        this.procedures.push({ name, procedure });
    }

    use(path: string, handler: EventHandler) {}
}
