import {
    type EventSourceController,
    EventSourcePlus,
    type OnRequestContext,
    type OnRequestErrorContext,
    type OnResponseContext,
    type OnResponseErrorContext,
} from "event-source-plus";

import { ArriErrorInstance } from "./errors";
import { type ArriRequestOpts } from "./request";
import { getHeaders } from "./utils";

export interface SseEvent<TData = string> {
    id?: string;
    event?: string;
    data: TData;
}

export interface SseOptions<TData> {
    onMessage?: (data: TData) => any;
    onErrorMessage?: (error: ArriErrorInstance) => any;
    onRequest?: (context: OnRequestContext) => any;
    onRequestError?: (
        context: Omit<OnRequestErrorContext, "error"> & {
            error: ArriErrorInstance;
        },
    ) => any;
    onResponse?: (context: OnResponseContext) => any;
    onResponseError?: (
        context: Omit<OnResponseErrorContext, "error"> & {
            error: ArriErrorInstance;
        },
    ) => any;
    onClose?: () => any;
    maxRetryCount?: number;
    maxRetryInterval?: number;
}

export function arriSseRequest<
    TType,
    TParams extends Record<any, any> | undefined = undefined,
>(
    opts: ArriRequestOpts<TType, TParams>,
    options: SseOptions<TType>,
): EventSourceController {
    let url = opts.url;
    let body: undefined | string;
    switch (opts.method) {
        case "get":
        case "head":
            if (
                opts.params &&
                typeof opts.params === "object" &&
                opts.params !== null
            ) {
                const urlParts: string[] = [];
                Object.keys(opts.params).forEach((key) => {
                    urlParts.push(`${key}=${(opts.params as any)[key]}`);
                });
                url = `${opts.url}?${urlParts.join("&")}`;
            }
            break;
        default:
            if (opts.params && typeof opts.params === "object") {
                body = opts.serializer(opts.params);
            }
            break;
    }

    const eventSource = new EventSourcePlus(url, {
        method: opts.method ?? "get",
        headers: async () => {
            const headers: Record<string, string> =
                (await getHeaders(opts.headers)) ?? {};
            if (opts.clientVersion) {
                headers["client-version"] = opts.clientVersion;
            }
            return headers;
        },
        body,
        maxRetryCount: options.maxRetryCount,
        maxRetryInterval: options.maxRetryInterval,
    });
    const controller = eventSource.listen({
        onMessage(message) {
            if (
                message.event === "message" ||
                message.event === undefined ||
                message.event === ""
            ) {
                options.onMessage?.(opts.parser(message.data));
                return;
            }
            if (message.event === "error") {
                options.onErrorMessage?.(
                    ArriErrorInstance.fromJson(message.data),
                );
                return;
            }
            if (message.event === "done") {
                controller.abort();
            }
        },
        onRequest(context) {
            options.onRequest?.(context);
        },
        onRequestError(context) {
            options.onRequestError?.({
                ...context,
                error: new ArriErrorInstance({
                    code: 0,
                    message: context.error.message,
                    data: context.error,
                }),
            });
        },
        onResponse(context) {
            options.onResponse?.(context);
        },
        async onResponseError(context) {
            if (!options.onResponseError) {
                return;
            }
            try {
                const arriError = ArriErrorInstance.fromJson(
                    await context.response.json(),
                );
                options.onResponseError({
                    ...context,
                    error: arriError,
                });
            } catch (_) {
                const arriError = new ArriErrorInstance({
                    code: context.response.status ?? 0,
                    message: context.response.statusText,
                });
                options.onResponseError({ ...context, error: arriError });
            }
        },
    });
    return controller;
}
export function parseSseEvent<TData = string>(
    input: string,
    dataParser: (input: string) => TData,
): SseEvent<TData> | undefined {
    let id: string | undefined;
    let event: string | undefined;
    let data: TData | undefined;
    const lines = input.split("\n");
    for (const line of lines) {
        if (line.startsWith("id:")) {
            id = line.substring(3).trim();
            continue;
        }
        if (line.startsWith("event:")) {
            event = line.substring(6).trim();
            continue;
        }
        if (line.startsWith("data:")) {
            data = dataParser(line.substring(5).trim());
        }
    }
    if (!data) {
        return undefined;
    }
    return {
        id,
        event,
        data,
    };
}

export function parseSseEvents<TData = string>(
    input: string,
    dataParser: (input: string) => TData,
): SseEvent<TData>[] {
    const eventStrings = input.split("\n\n");
    const events: Array<SseEvent<TData>> = [];
    for (const str of eventStrings) {
        const event = parseSseEvent(str, dataParser);
        if (event) {
            events.push(event);
        }
    }
    return events;
}
