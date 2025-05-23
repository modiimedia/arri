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
