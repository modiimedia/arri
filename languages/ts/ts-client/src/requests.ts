import { serializeSmallString } from '@arrirpc/schema';

export interface RpcRequestValidator<TParams, TResponse> {
    params: ArriModelValidator<TParams>;
    response: ArriModelValidator<TResponse>;
    onError?: (err: unknown) => void | Promise<void>;
}

export interface RpcRawRequest {
    procedure: string;
    reqId?: string;
    path: string;
    method?: string;
    clientVersion?: string;
    customHeaders?: HeaderInput;
    data?: string | Uint8Array;
}

export interface RpcRawResponse {
    procedure: string;
    reqId?: string;
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

export async function encodeRequest<TParams>(
    req: RpcRequest<TParams>,
    paramEncoder: (input: TParams) => string,
) {
    if (!req.reqId) {
        throw new Error(`reqId is required for transporting over websockets`);
    }
    let result = `procedure: ${req.procedure}\npath: ${req.path}\nclient-version: ${req.clientVersion ?? ''}\nreq-id: ${req.reqId ?? ''}`;
    if (typeof req.customHeaders !== 'undefined') {
        const headers = await getHeaders(req.customHeaders);
        for (const [key, value] of Object.entries(headers)) {
            result += `\n${key}: ${value}`;
        }
    }
    result += '\n\n';
    if (req.data) {
        result += paramEncoder(req.data);
    }
    return result;
}

export function decodeRequest(input: string): RpcRawResponse {
    let reqId: string | undefined;
    let procedure: string = '';
    let path: string = '';
    let success: boolean = false;
    let method: string | undefined;

    let previousChar = '';
    let currentLine = '';
    let bodyIndex = -1;

    function handleParseLine() {
        const parseResult = parseLine(currentLine);
        switch (parseResult.type) {
            case 'invalid':
                break;
            case 'method':
                method = parseResult.value;
                break;
            case 'path':
                path = parseResult.value;
                break;
            case 'procedure':
                procedure = parseResult.value;
                break;
            case 'reqId':
                reqId = parseResult.value;
                break;
            case 'success':
                success =
                    parseResult.value === 'true' ||
                    parseResult.value === 'TRUE';
                break;
            default:
                parseResult satisfies never;
                break;
        }
    }
    for (let i = 0; i < input.length; i++) {
        const char = input[i]!;
        if (char === '\n') {
            handleParseLine();
            if (previousChar === '\n') {
                bodyIndex = i + 1;
                break;
            }
            previousChar = char;
            continue;
        }
        currentLine += char;
        previousChar = char;
    }
    const result: RpcRawResponse = {
        procedure: procedure,
        reqId: reqId,
        path: path,
        method: method,
        success: success,
    };
    if (!input[bodyIndex]) return result;
    result.data = input.substring(bodyIndex);
    return result;
}

function parseLine(input: string):
    | {
          type: 'procedure' | 'reqId' | 'path' | 'method' | 'success';
          value: string;
      }
    | { type: 'invalid' } {
    if (input.startsWith('procedure:')) {
        return {
            type: 'procedure',
            value: input.substring(10).trim(),
        };
    }
    if (input.startsWith('req-id:')) {
        return {
            type: 'reqId',
            value: input.substring(7).trim(),
        };
    }
    if (input.startsWith('path:')) {
        return {
            type: 'path',
            value: input.substring(5).trim(),
        };
    }
    if (input.startsWith('method:')) {
        return {
            type: 'method',
            value: input.substring(7).trim(),
        };
    }
    if (input.startsWith('success:')) {
        return {
            type: 'success',
            value: input.substring(8).trim(),
        };
    }
    return {
        type: 'invalid',
    };
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
