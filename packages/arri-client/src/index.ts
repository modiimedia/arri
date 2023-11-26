import { ofetch, FetchError, fetch } from "ofetch";

export interface ArriRequestOpts<
    TType,
    TParams extends Record<any, any> | undefined = undefined,
> {
    url: string;
    method: string;
    headers?: any;
    params?: TParams;
    parser: (input: Record<any, any>) => TType;
    serializer: (
        input: TParams,
    ) => TParams extends undefined ? undefined : string;
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
        const result = await ofetch(url, {
            method: opts.method,
            body,
            headers: { ...opts.headers, "Content-Type": contentType },
        });
        return opts.parser(result);
    } catch (err) {
        const error = err as any as FetchError;
        if (isArriRequestError(error.data)) {
            throw new ArriRequestErrorInstance(error.data);
        } else {
            throw new ArriRequestErrorInstance({
                statusCode: error.statusCode ?? 500,
                statusMessage:
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
        if (err instanceof ArriRequestErrorInstance) {
            return {
                success: false,
                error: err,
            };
        }
        if (err instanceof FetchError) {
            return {
                success: false,
                error: new ArriRequestErrorInstance({
                    statusCode: err.statusCode ?? 0,
                    statusMessage: err.statusMessage ?? "",
                    stack: err.stack,
                    data: err.data,
                }),
            };
        }
        return {
            success: false,
            error: new ArriRequestErrorInstance({
                statusCode: 500,
                statusMessage: `Unknown error connecting to ${opts.url}`,
                data: err,
            }),
        };
    }
}

export async function arriSseRequest<
    TType,
    TParams extends Record<any, any> | undefined = undefined,
>(opts: ArriRequestOpts<TType, TParams>): Promise<TType> {
    let url = opts.url;
    let body: undefined | string;
    const contentType = "text";
    switch (opts.method) {
        case "get":
        case "head":
            if (
                opts.params &&
                typeof opts.params === "object" &&
                opts.params !== null
            ) {
                const urlParts: string[] = [];
                Object.keys(opts.params).forEach((key) => {
                    urlParts.push(`${key}=${(opts.params as any)[key]}`);
                });
                url = `${opts.url}?${urlParts.join("&")}`;
            }
            break;
        default:
            if (opts.params && typeof opts.params === "object") {
                body = opts.serializer(opts.params);
            }
            break;
    }
    const headers = { ...opts.headers, "Content-Type": "text/event-stream" };
    try {
        const result = await ofetch(url, {
            method: opts.method,
            body,
            headers,
            keepalive: true,
            responseType: "stream",
        });
    } catch (err) {}
}

export type SafeResponse<T> =
    | {
          success: true;
          value: T;
      }
    | { success: false; error: ArriRequestErrorInstance };

export interface ArriRequestError {
    statusCode: number;
    statusMessage: string;
    data?: any;
    stack?: string;
}

export function isArriRequestError(input: unknown): input is ArriRequestError {
    if (typeof input !== "object" || input === null) {
        return false;
    }
    return (
        "statusCode" in input &&
        typeof input.statusCode === "number" &&
        "statusMessage" in input &&
        typeof input.statusMessage === "string"
    );
}

export class ArriRequestErrorInstance
    extends Error
    implements ArriRequestError
{
    statusCode: number;
    statusMessage: string;
    data?: any;

    constructor(input: {
        statusCode: number;
        statusMessage: string;
        stack?: string;
        data?: any;
    }) {
        super(`ERROR ${input.statusCode}: ${input.statusMessage}`);
        this.statusCode = input.statusCode;
        this.statusMessage = input.statusMessage;
        this.data = input.data;
    }

    static fromJson(json: unknown) {
        if (typeof json !== "object" || json === null) {
            return new ArriRequestErrorInstance({
                statusCode: 500,
                statusMessage: "Unknown error",
            });
        }
        return new ArriRequestErrorInstance({
            statusCode:
                "statusCode" in json && typeof json.statusCode === "number"
                    ? json.statusCode
                    : 500,
            statusMessage:
                "statusMessage" in json &&
                typeof json.statusMessage === "string"
                    ? json.statusMessage
                    : "",
            stack:
                "stack" in json && typeof json.stack === "string"
                    ? json.stack
                    : undefined,
            data: "data" in json ? json.data : undefined,
        });
    }
}
