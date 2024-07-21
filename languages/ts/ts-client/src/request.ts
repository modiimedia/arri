import { serializeSmallString } from "@arrirpc/schema";
import { EventSourcePlusOptions, type HttpMethod } from "event-source-plus";
import { FetchError, ofetch } from "ofetch";

import { ArriErrorInstance, isArriError } from "./errors";
import { getHeaders } from "./utils";

export interface ArriRequestOpts<
    TType,
    TParams extends Record<any, any> | undefined = undefined,
> {
    url: string;
    method: HttpMethod;
    headers: EventSourcePlusOptions["headers"];
    params?: TParams;
    parser: (input: string) => TType;
    serializer: (
        input: TParams,
    ) => TParams extends undefined ? undefined : string;
    clientVersion: string;
}

export async function arriRequest<
    TType,
    TParams extends Record<any, any> | undefined = undefined,
>(opts: ArriRequestOpts<TType, TParams>): Promise<TType> {
    let url = opts.url;
    let body: undefined | string;
    let contentType: undefined | string;
    switch (opts.method) {
        case "get":
        case "head":
            if (opts.params && typeof opts.params === "object") {
                url = `${opts.url}?${opts.serializer(opts.params)}`;
            }
            break;
        default:
            if (opts.params && typeof opts.params === "object") {
                body = opts.serializer(opts.params);
                contentType = "application/json";
            }
            break;
    }
    try {
        const headers = (await getHeaders(opts.headers)) ?? {};
        if (contentType) headers["Content-Type"] = contentType;
        if (opts.clientVersion) headers["client-version"] = opts.clientVersion;
        const result = await ofetch(url, {
            method: opts.method,
            body,
            headers,
        });
        return opts.parser(result);
    } catch (err) {
        const error = err as any as FetchError;
        if (isArriError(error.data)) {
            throw new ArriErrorInstance(error.data);
        } else {
            throw new ArriErrorInstance({
                code: error.statusCode ?? 500,
                message:
                    error.statusMessage ??
                    error.message ??
                    `Error connecting to ${url}`,
                data: error.data,
                stack: error.stack,
            });
        }
    }
}

export async function arriSafeRequest<
    TType,
    TParams extends Record<any, any> | undefined = undefined,
>(opts: ArriRequestOpts<TType, TParams>): Promise<SafeResponse<TType>> {
    try {
        const result = await arriRequest<TType, TParams>(opts);
        return {
            success: true,
            value: result,
        };
    } catch (err) {
        if (err instanceof ArriErrorInstance) {
            return {
                success: false,
                error: err,
            };
        }
        if (err instanceof FetchError) {
            return {
                success: false,
                error: new ArriErrorInstance({
                    code: err.statusCode ?? 0,
                    message: err.statusMessage ?? "",
                    stack: err.stack,
                    data: err.data,
                }),
            };
        }
        return {
            success: false,
            error: new ArriErrorInstance({
                code: 500,
                message: `Unknown error connecting to ${opts.url}`,
                data: err,
            }),
        };
    }
}

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

export function isObject(input: unknown): input is Record<string, unknown> {
    return typeof input === "object" && input !== null;
}
