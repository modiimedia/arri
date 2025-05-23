import { type EventSourceController, EventSourcePlus } from 'event-source-plus';

import { $Fetch, EventStreamHooks, RpcDispatcherOptions } from './dispatcher';
import { ArriErrorInstance } from './errors';
import { getHeaders, RpcRequest, RpcRequestValidator } from './requests';

export interface SseEvent<TData = string> {
    id?: string;
    event?: string;
    data: TData;
}

export function arriSseRequest<TParams, TType>(
    baseUrl: string,
    req: RpcRequest<TParams>,
    validator: RpcRequestValidator<TParams, TType>,
    hooks: EventStreamHooks<TType>,
    globalOptions: RpcDispatcherOptions,
    fetch: $Fetch,
): EventSourceController {
    let url = baseUrl + req.path;
    let body: string | undefined;
    if (req.method === 'get' || req.method === 'GET') {
        const queryParts = validator.params.toUrlQueryString(req.data);
        url += `?${queryParts}`;
    } else {
        body = validator.params.toJsonString(req.data);
    }
    const eventSource = new EventSourcePlus(url, {
        method: (req.method as any) ?? 'post',
        fetch: fetch?.native,
        headers: async () => {
            const headers: Record<string, string> =
                (await getHeaders(req.customHeaders)) ?? {};
            if (req.clientVersion) {
                headers['client-version'] = req.clientVersion;
            }
            return headers;
        },
        body: body,
        maxRetryCount: hooks.maxRetryCount,
        maxRetryInterval: hooks.maxRetryInterval,
    });
    const controller = eventSource.listen({
        onMessage(message) {
            if (
                message.event === 'message' ||
                message.event === undefined ||
                message.event === ''
            ) {
                hooks.onMessage?.(
                    validator.response.fromJsonString(message.data),
                );
                return;
            }
            if (message.event === 'done') {
                controller.abort();
            }
        },
        onRequestError(context) {
            globalOptions.onError?.(req, context.error);
            hooks.onError?.(context.error);
        },
        onResponse(_) {
            hooks.onOpen?.();
        },
        async onResponseError(context) {
            if (globalOptions.onError)
                globalOptions.onError(req, context.error);
            if (!hooks.onError) return;
            try {
                const arriError = ArriErrorInstance.fromJson(
                    await context.response.json(),
                );
                hooks.onError(arriError);
            } catch (err) {
                hooks.onError(err);
            }
        },
    });
    return controller;
}
