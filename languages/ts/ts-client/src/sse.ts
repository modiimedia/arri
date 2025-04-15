import {
    type EventSourceController,
    EventSourcePlus,
    type OnRequestContext,
    type OnRequestErrorContext,
    type OnResponseContext,
    type OnResponseErrorContext,
} from 'event-source-plus';

import { ArriErrorInstance } from './errors';
import { $Fetch, HeaderInput } from './requests';
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
    onClose?: () => any;
    maxRetryCount?: number;
    maxRetryInterval?: number;
}

export function arriSseRequest<TType>(
    opts: {
        url: string;
        method?: string;
        ofetch?: $Fetch;
        body?: string;
        headers?: HeaderInput;
        responseDecoder: (input: string) => TType;
        clientVersion?: string;
        onError?: (err: unknown) => void | Promise<void>;
    },
    options: SseOptions<TType>,
): EventSourceController {
    const eventSource = new EventSourcePlus(opts.url, {
        method: (opts.method as any) ?? 'post',
        fetch: opts.ofetch?.native,
        headers: async () => {
            const headers: Record<string, string> =
                (await getHeaders(opts.headers)) ?? {};
            if (opts.clientVersion) {
                headers['client-version'] = opts.clientVersion;
            }
            return headers;
        },
        body: opts.body,
        maxRetryCount: options.maxRetryCount,
        maxRetryInterval: options.maxRetryInterval,
    });
    const controller = eventSource.listen({
        onMessage(message) {
            if (
                message.event === 'message' ||
                message.event === undefined ||
                message.event === ''
            ) {
                options.onMessage?.(opts.responseDecoder(message.data));
                return;
            }
            if (message.event === 'done') {
                controller.abort();
            }
        },
        onRequest(context) {
            options.onRequest?.(context);
        },
        onRequestError(context) {
            if (opts.onError) {
                opts.onError(context.error);
            }
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
            if (opts.onError) {
                opts.onError(context.error);
            }
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
