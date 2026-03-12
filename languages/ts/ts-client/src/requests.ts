import { serializeSmallString } from '@arrirpc/schema';
import { ulid } from 'ulidx';

export interface RpcRequestValidator<TParams, TResponse> {
    params: ArriModelValidator<TParams>;
    response: ArriModelValidator<TResponse>;
}

export interface RpcRawRequest {
    procedure: string;
    reqId: string;
    path: string;
    method?: string;
    clientVersion?: string;
    customHeaders?: HeaderInput;
    data?: string | Uint8Array;
}

export interface RpcRawResponse {
    procedure: string;
    reqId: string;
    path: string;
    method?: string;
    success: boolean;
    data?: string | Uint8Array;
}

export interface RpcRequest<TParams> extends Omit<RpcRawRequest, 'data'> {
    data: TParams;
}

export interface RpcResponse<TResponse> extends Omit<RpcRawResponse, 'data'> {
    data: TResponse;
}

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

export async function getHeaders(
    input?: HeaderInput,
): Promise<Record<string, string>> {
    if (typeof input === 'function') {
        const result = input();
        if ('then' in result && typeof result.then === 'function') {
            return result.then((data) => data as Record<string, string>);
        }
        return result as Record<string, string>;
    }
    return (input ?? {}) as Record<string, string>;
}

export type HeaderInput =
    | Record<string, string | undefined>
    | (() =>
          | Promise<Record<string, string | undefined>>
          | Record<string, string | undefined>);

/**
 * Default implementation for generating unique request IDs for client requests. (Uses ULID)
 */
export function generateRequestId() {
    return ulid();
}
