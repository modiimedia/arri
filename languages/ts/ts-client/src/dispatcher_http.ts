import { ArriError, isArriErrorBase } from '@arrirpc/core';
import { EventSourceController, EventSourcePlus } from 'event-source-plus';
import { $Fetch, createFetch, Fetch, FetchError, ofetch } from 'ofetch';
import { randomUUID } from 'uncrypto';

import {
    EventStreamHooks,
    RpcDispatcher,
    RpcDispatcherOptions,
    waitFor,
} from './dispatcher';
import { getHeaders, RpcRequest, RpcRequestValidator } from './requests';

export interface HttpDispatcherOptions extends RpcDispatcherOptions {
    baseUrl: string;
    fetch?: Fetch;
}

export class HttpDispatcher implements RpcDispatcher<'http'> {
    transport = 'http' as const;
    ofetch: $Fetch;
    options: HttpDispatcherOptions;

    constructor(options: HttpDispatcherOptions) {
        this.options = options;
        this.ofetch = options?.fetch
            ? createFetch({ fetch: options.fetch })
            : ofetch;
    }

    async handleRpc<TParams, TResponse>(
        req: RpcRequest<TParams>,
        validator: RpcRequestValidator<TParams, TResponse>,
        options?: RpcDispatcherOptions,
        retryCount?: number,
    ): Promise<TResponse> {
        let url = this.options.baseUrl + req.path;
        let body: undefined | string;
        let contentType: undefined | string;
        switch (req.method) {
            case 'get':
            case 'GET':
            case 'head':
            case 'HEAD':
                if (req.data && typeof req.data === 'object') {
                    url = `${url}?${validator.params.toUrlQueryString(req.data)}`;
                }
                break;
            default:
                if (req.data && typeof req.data === 'object') {
                    body = validator.params.toJsonString(req.data);
                    contentType = 'application/json';
                }
                break;
        }
        try {
            const headers = await getHeaders(req.customHeaders);
            if (contentType) headers['Content-Type'] = contentType;
            if (req.clientVersion)
                headers['client-version'] = req.clientVersion;
            const errorHandler = options?.onError ?? this.options.onError;
            const response = await this.ofetch.raw(url, {
                method: req.method?.toUpperCase() ?? 'POST',
                body,
                headers,
                onRequestError: errorHandler
                    ? (context) => {
                          errorHandler(req, context.error);
                      }
                    : undefined,
                onResponseError: errorHandler
                    ? async (context) => {
                          try {
                              const err = await ArriError.fromHTTPResponse(
                                  context.response,
                              );
                              errorHandler(req, err);
                              return;
                          } catch (_) {
                              // do nothing
                          }
                          errorHandler(req, context.error);
                      }
                    : undefined,
                responseType: 'text',
                retry: false,
                ignoreResponseError: true,
                signal: options?.signal ?? this.options?.signal,
                timeout: options?.timeout ?? this.options?.timeout,
            });
            if (!response.ok) {
                throw await ArriError.fromHTTPResponse(response);
            }
            return validator.response.fromJsonString(
                response._data ?? (await response.text()),
            );
        } catch (err) {
            let arriError: ArriError;
            if (err instanceof ArriError) {
                arriError = err;
            } else if (err instanceof FetchError) {
                const code = Number.parseInt(
                    err.response?.headers.get('err-code') ?? '0',
                );
                const message =
                    err.response?.headers.get('err-msg') ?? 'Unknown error';
                arriError = new ArriError({
                    code: code,
                    message: message,
                    body:
                        err.response?._data ??
                        (await err.response?.text()) ??
                        err.data,
                });
            } else {
                arriError = new ArriError({
                    code: 0,
                    message: err instanceof Error ? err.message : `${err}`,
                });
            }
            const maxRetryCount =
                typeof options?.retry === 'number'
                    ? options.retry
                    : typeof this.options.retry === 'number'
                      ? this.options.retry
                      : 0;
            const statusCodes =
                options?.retryErrorCodes ?? this.options.retryErrorCodes ?? [];
            const shouldRetry =
                maxRetryCount !== 0 &&
                (retryCount ?? 0) < maxRetryCount &&
                (statusCodes.length === 0 ||
                    statusCodes.includes(arriError.code));
            options?.onError?.(req, arriError);
            if (shouldRetry) {
                let retryDelay =
                    options?.retryDelay ?? this.options.retryDelay ?? 0;
                if (retryDelay === 0 && (retryCount ?? 0) > 0) {
                    retryDelay = retryDelay * (retryCount ?? 1);
                }
                await waitFor(
                    options?.retryDelay ?? this.options.retryDelay ?? 0,
                );
                return this.handleRpc(
                    req,
                    validator,
                    options,
                    (retryCount ?? 0) + 1,
                );
            }
            throw arriError;
        }
    }

    handleEventStreamRpc<TParams, TResponse>(
        req: RpcRequest<TParams>,
        validator: RpcRequestValidator<TParams, TResponse>,
        hooks: EventStreamHooks<TResponse>,
    ) {
        let url = this.options.baseUrl + req.path;
        let body: string | undefined;
        if (req.method === 'get' || req.method === 'GET') {
            const queryParts = validator.params.toUrlQueryString(req.data);
            url += `?${queryParts}`;
        } else {
            body = validator.params.toJsonString(req.data);
        }
        let timeout: any | undefined;
        let timeoutDurationMs: number | undefined;
        const timeoutMultiplier = this.options.heartbeatTimeoutMultiplier ?? 2;
        if (timeoutMultiplier < 1) {
            throw new Error('heartbeatTimeoutMultiplier cannot be less than 1');
        }
        const eventSource = new EventSourcePlus(url, {
            method: (req.method as any) ?? 'post',
            fetch: this.options.fetch,
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
        function resetTimeout() {
            if (timeout) clearTimeout(timeout);
            if (!timeoutDurationMs) return;
            timeout = setTimeout(() => {
                if (controller.signal.aborted) return;
                controller.reconnect();
            }, timeoutDurationMs);
        }
        const connectionId = randomUUID();
        const controller = eventSource.listen({
            onMessage: (message) => {
                resetTimeout();
                if (
                    message.event === 'message' ||
                    message.event === undefined ||
                    message.event === '' ||
                    message.event === 'STREAM_DATA'
                ) {
                    hooks.onMessage?.(
                        validator.response.fromJsonString(message.data),
                    );
                    return;
                }
                if (
                    message.event === 'end' ||
                    message.event === 'STREAM_END' ||
                    message.event === 'STREAM_CANCEL'
                ) {
                    clearTimeout(timeout);
                    controller.abort();
                }

                if (message.event === 'error' || message.event === 'ERROR') {
                    clearTimeout(timeout);
                    console.log('UNHANDLED ERROR MESSAGE', message);
                    controller.abort();
                }
            },
            onRequestError: (context) => {
                clearTimeout(timeout);
                this.options.onError?.(req, context.error);
                hooks.onError?.(context.error);
            },
            onResponse: ({ response }) => {
                const heartbeatMsHeader = Number(
                    response.headers.get('heartbeat-interval') ?? '0',
                );
                if (
                    response.ok &&
                    !Number.isNaN(heartbeatMsHeader) &&
                    heartbeatMsHeader > 0
                ) {
                    timeoutDurationMs = heartbeatMsHeader * timeoutMultiplier;
                    resetTimeout();
                }
                hooks.onOpen?.();
            },
            onResponseError: async (context) => {
                clearTimeout(timeout);
                this.options.onError?.(req, context.error);
                if (!hooks.onError) return;
                try {
                    const arriError = await ArriError.fromHTTPResponse(
                        context.response,
                    );
                    hooks.onError(arriError);
                } catch (err) {
                    hooks.onError(err);
                }
            },
        });
        controller.onAbort(() => {
            hooks.onClose?.();
            this._eventStreamConnections.delete(connectionId);
        });
        this._eventStreamConnections.set(connectionId, controller);
        return controller;
    }

    private _eventStreamConnections = new Map<string, EventSourceController>();

    terminateConnections(): void {
        for (const [_, val] of this._eventStreamConnections.entries()) {
            val.abort();
        }
        this._eventStreamConnections.clear();
    }
}
