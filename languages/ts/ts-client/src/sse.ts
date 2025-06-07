import {
    type EventSourceController,
    EventSourcePlus,
    type OnRequestContext,
    type OnRequestErrorContext,
    type OnResponseContext,
    type OnResponseErrorContext,
} from 'event-source-plus';

import { ArriErrorInstance } from './errors';
import { type ArriRequestConfig } from './request';
import { getHeaders } from './utils';

export interface SseEvent<TData = string> {
    id?: string;
    event?: string;
    data: TData;
}

export interface SseOptions<TData> {
    onMessage?: (data: TData) => any;
    onRequest?: (context: OnRequestContext) => any;
    onRequestError?: (
        context: Omit<OnRequestErrorContext, 'error'> & {
            error: ArriErrorInstance;
        },
    ) => any;
    onResponse?: (context: OnResponseContext) => any;
    onResponseError?: (
        context: Omit<OnResponseErrorContext, 'error'> & {
            error: ArriErrorInstance;
        },
    ) => any;
    maxRetryCount?: number;
    maxRetryInterval?: number;
}

export function arriSseRequest<
    TType,
    TParams extends Record<any, any> | undefined = undefined,
>(
    opts: ArriRequestConfig<TType, TParams>,
    options: SseOptions<TType>,
): EventSourceController {
    let url = opts.url;
    let body: undefined | string;
    switch (opts.method) {
        case 'get':
        case 'head':
            if (
                opts.params &&
                typeof opts.params === 'object' &&
                opts.params !== null
            ) {
                url = `${opts.url}?${opts.serializer(opts.params)}`;
            }
            break;
        default:
            if (opts.params && typeof opts.params === 'object') {
                body = opts.serializer(opts.params);
            }
            break;
    }

    const eventSource = new EventSourcePlus(url, {
        method: opts.method ?? 'get',
        fetch: opts.ofetch?.native,
        headers: async () => {
            const headers: Record<string, string> =
                (await getHeaders(opts.headers)) ?? {};
            if (opts.clientVersion) {
                headers['client-version'] = opts.clientVersion;
            }
            return headers;
        },
        body,
        maxRetryCount: options.maxRetryCount,
        maxRetryInterval: options.maxRetryInterval,
    });
    let interval: number | undefined;
    let intervalDurationMs: number | undefined;
    function resetInterval() {
        if (interval) clearInterval(interval);
        if (!intervalDurationMs) return;
        interval = setInterval(() => {
            if (controller.signal.aborted) return;
            controller.reconnect();
        }, intervalDurationMs * 2) as any;
    }
    const controller = eventSource.listen({
        onMessage(message) {
            resetInterval();
            if (
                message.event === 'message' ||
                message.event === undefined ||
                message.event === ''
            ) {
                options.onMessage?.(opts.responseFromString(message.data));
                return;
            }
            if (message.event === 'done') {
                if (interval) clearInterval(interval);
                controller.abort();
            }
        },
        onRequest: options.onRequest,
        onRequestError(context) {
            clearInterval(interval);
            if (opts.onError) opts.onError(context.error);
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
            const heartbeatIntervalHeader = Number(
                context.response?.headers.get('heartbeat-interval') ?? 0,
            );
            if (
                context.response.ok &&
                !Number.isNaN(heartbeatIntervalHeader) &&
                heartbeatIntervalHeader > 0
            ) {
                intervalDurationMs = heartbeatIntervalHeader;
                resetInterval();
            }
            options.onResponse?.(context);
        },
        async onResponseError(context) {
            clearInterval(interval);
            if (opts.onError) opts.onError(context.error);
            if (!options.onResponseError) return;
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
