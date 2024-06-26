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
    headers?: EventSourcePlusOptions["headers"];
    params?: TParams;
    parser: (input: unknown) => TType;
    serializer: (
        input: TParams,
    ) => TParams extends undefined ? undefined : string;
    clientVersion?: string;
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
                const urlParts: string[] = [];
                Object.keys(opts.params).forEach((key) => {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    urlParts.push(`${key}=${(opts.params as any)[key]}`);
                });
                url = `${opts.url}?${urlParts.join("&")}`;
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
