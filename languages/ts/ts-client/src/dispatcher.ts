export { type $Fetch, createFetch, type Fetch, ofetch } from 'ofetch';

import { ArriErrorInstance } from './errors';
import { HeaderInput, RpcRequest, RpcRequestValidator } from './requests';

export interface RpcDispatcherOptions {
    headers?: HeaderInput;
    timeout?: number;
    retry?: number | false;
    retryDelay?: number;
    retryErrorCodes?: number[];
    signal?: AbortController['signal'];
    onError?: (req: RpcRequest<any>, error: unknown) => Promise<void> | void;
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
    };
    return result;
}

export interface EventStreamHooks<TData> {
    onMessage?: (data: TData) => any;
    onOpen?: () => any;
    onClose?: (reason: string) => any;
    onError?: (error: unknown) => any;
    timeout?: number;
    retryDelay?: number;
    maxRetryCount?: number;
    maxRetryInterval?: number;
}

export interface RpcDispatcher {
    transport: string;
    handleRpc<TParams, TOutput>(
        req: RpcRequest<TParams>,
        validator: RpcRequestValidator<TParams, TOutput>,
        options?: RpcDispatcherOptions,
    ): Promise<TOutput> | TOutput;
    handleEventStreamRpc<TParams, TOutput>(
        req: RpcRequest<TParams>,
        validator: RpcRequestValidator<TParams, TOutput>,
        hooks: EventStreamHooks<TOutput>,
    ): EventStreamController;
}

export interface EventStreamController {
    abort(): void;
}

export type TransportMap = Record<string, RpcDispatcher>;

export type SafeResponse<T> =
    | {
          success: true;
          value: T;
      }
    | { success: false; error: ArriErrorInstance };

export function resolveTransport(
    availableTransports: string[],
    selectedTransport: string | undefined,
    globalDefault: string | undefined,
): string {
    if (availableTransports.length === 1) {
        return availableTransports[0]!;
    }
    if (selectedTransport && availableTransports.includes(selectedTransport)) {
        return selectedTransport;
    }
    if (globalDefault && availableTransports.includes(globalDefault)) {
        return globalDefault;
    }
    return availableTransports[0] ?? '';
}
