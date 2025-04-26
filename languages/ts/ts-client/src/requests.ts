import { serializeSmallString } from '@arrirpc/schema';
import { EventSourceController } from 'event-source-plus';

import { ArriErrorInstance } from './errors';
import { SseOptions } from './sse';

export { type $Fetch, createFetch, type Fetch, ofetch } from 'ofetch';

export interface RpcRequest<TParams, TOutput, TOptions> {
    path: string;
    clientVersion: string;
    method?: string;
    params?: TParams;
    paramValidator: ArriModelValidator<TParams>;
    responseValidator: ArriModelValidator<TOutput>;
    onError?: (err: unknown) => void | Promise<void>;
    options?: TOptions;
}

export interface RpcDispatcher<TOptions = unknown> {
    transport: string;
    handleRpc<TParams, TOutput>(
        req: RpcRequest<TParams, TOutput, TOptions>,
    ): Promise<TOutput> | TOutput;
    handleEventStreamRpc<TParams, TOutput>(
        req: RpcRequest<TParams, TOutput, TOptions>,
        hooks?: SseOptions<TOutput>,
    ): EventSourceController;
    readonly options?: TOptions;
}

export type InferRequestHandlerOptions<T extends RpcDispatcher> = NonNullable<
    T['options']
>;

export type TransportMap = Record<string, RpcDispatcher>;

export type HeaderInput =
    | Record<string, string | undefined>
    | (() =>
          | Promise<Record<string, string | undefined>>
          | Record<string, string | undefined>);

export type SafeResponse<T> =
    | {
          success: true;
          value: T;
      }
    | { success: false; error: ArriErrorInstance };

export interface ArriModelValidator<T> {
    new: () => T;
    validate: (input: unknown) => input is T;
    fromJson: (input: Record<string, unknown>) => T;
    fromJsonString: (input: string) => T;
    toJsonString: (input: T) => string;
    toUrlQueryString: (input: T) => string;
}

export const UndefinedModelValidator: ArriModelValidator<undefined> = {
    new: () => undefined,
    validate: (input: unknown): input is undefined => true,
    fromJson: (_: Record<string, unknown>) => undefined,
    fromJsonString: (_: string) => undefined,
    toJsonString: (_: undefined) => '',
    toUrlQueryString: (_: undefined) => '',
};

export interface ArriEnumValidator<T> {
    new: () => T;
    values: readonly T[];
    validate: (input: unknown) => input is T;
    fromSerialValue: (input: string) => T;
}
const STR_ESCAPE =
    // eslint-disable-next-line no-control-regex
    /[\u0000-\u001f\u0022\u005c\ud800-\udfff]|[\ud800-\udbff](?![\udc00-\udfff])|(?:[^\ud800-\udbff]|^)[\udc00-\udfff]/;

export function serializeString(input: string): string {
    if (input.length < 42) {
        return serializeSmallString(input);
    }
    if (input.length < 5000 && !STR_ESCAPE.test(input)) {
        return `"${input}"`;
    }
    return JSON.stringify(input);
}

export const INT8_MIN = -128;
export const INT8_MAX = 127;
export const UINT8_MAX = 255;
export const INT16_MIN = -32768;
export const INT16_MAX = 32767;
export const UINT16_MAX = 65535;
export const INT32_MIN = -2147483648;
export const INT32_MAX = 2147483647;
export const UINT32_MAX = 4294967295;
export const INT64_MIN = BigInt('9223372036854775808');
export const INT64_MAX = BigInt('9223372036854775807');
export const UINT64_MAX = BigInt('18446744073709551615');

export function isObject(input: unknown): input is Record<string, unknown> {
    return typeof input === 'object' && input !== null;
}
