export { type $Fetch, createFetch, type Fetch, ofetch } from 'ofetch';

import { ArriError } from '@arrirpc/core';

import { HeaderInput, RpcRequest, RpcRequestValidator } from './requests';

export interface RpcDispatcherOptions {
    headers?: HeaderInput;
    timeout?: number;
    retry?: number | false;
    retryDelay?: number;
    retryErrorCodes?: number[];
    signal?: AbortController['signal'];
    onError?: (req: RpcRequest<any>, error: unknown) => Promise<void> | void;
    heartbeatTimeoutMultiplier?: number;
}

export function resolveDispatcherOptions(
    local: RpcDispatcherOptions | undefined,
    global: RpcDispatcherOptions | undefined,
) {
    const result: RpcDispatcherOptions = {
        headers: local?.headers ?? global?.headers,
        timeout: local?.timeout ?? global?.timeout,
        retry: local?.retry ?? global?.retry,
        retryDelay: local?.retryDelay ?? global?.retryDelay,
        retryErrorCodes: local?.retryErrorCodes ?? global?.retryErrorCodes,
        signal: local?.signal ?? global?.signal,
        onError: local?.onError ?? global?.onError,
        heartbeatTimeoutMultiplier:
            local?.heartbeatTimeoutMultiplier ??
            global?.heartbeatTimeoutMultiplier,
    };
    return result;
}

export interface EventStreamHooks<TData> {
    onMessage?: (data: TData) => any;
    onOpen?: () => any;
    onClose?: () => any;
    onError?: (error: unknown) => any;
    timeout?: number;
    retry?: number | boolean;
    retryDelay?: number;
    maxRetryCount?: number;
    maxRetryInterval?: number;
}

export interface RpcDispatcher<T extends string> {
    transport: T;
    handleRpc<TParams, TOutput>(
        req: RpcRequest<TParams>,
        validator: RpcRequestValidator<TParams, TOutput>,
        options?: RpcDispatcherOptions,
        retryCount?: number,
    ): Promise<TOutput> | TOutput;
    handleEventStreamRpc<TParams, TOutput>(
        req: RpcRequest<TParams>,
        validator: RpcRequestValidator<TParams, TOutput>,
        hooks: EventStreamHooks<TOutput>,
    ): EventStreamController;
    terminateConnections(): void;
}

export interface EventStreamController {
    abort(): void;
}

export type TransportMap = Record<string, RpcDispatcher<any>>;

export type SafeResponse<T> =
    | {
          success: true;
          value: T;
      }
    | { success: false; error: ArriError };

export function resolveTransport<T extends string>(
    availableTransports: T[],
    selectedTransport: T | undefined,
    globalDefault: T | undefined,
): T | undefined {
    if (availableTransports.length === 1) {
        return availableTransports[0]!;
    }
    if (selectedTransport && availableTransports.includes(selectedTransport)) {
        return selectedTransport;
    }
    if (globalDefault && availableTransports.includes(globalDefault)) {
        return globalDefault;
    }
    return availableTransports[0];
}

export function waitFor(ms: number): Promise<void> {
    return new Promise((res, _) => {
        setTimeout(() => {
            res();
        }, ms);
    });
}
