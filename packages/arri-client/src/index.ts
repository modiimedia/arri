import { fetchEventSource } from "@fortaine/fetch-event-source";
import { ofetch, FetchError } from "ofetch";

export interface ArriRequestOpts<
    TType,
    TParams extends Record<any, any> | undefined = undefined,
> {
    url: string;
    method: string;
    headers?: any;
    params?: TParams;
    parser: (input: unknown) => TType;
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

export interface SseHooks<TType = any> {
    onData?: (data: TType) => any;
    onEvent?: (event: { id?: string; event?: string; data: string }) => any;
    onError?: (error: ArriRequestError) => any;
    onClose?: () => any;
    onOpen?: (response: Response) => any;
}

class NonFatalError extends Error {}

export function arriSseRequest<
    TType,
    TParams extends Record<any, any> | undefined = undefined,
>(opts: ArriRequestOpts<TType, TParams>, hooks: SseHooks<TType>) {
    let url = opts.url;
    let body: undefined | string;
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
    const controller = new AbortController();
    let shouldAbort = false;
    void fetchEventSource(url, {
        method: opts.method.toUpperCase(),
        headers,
        body,
        signal: controller.signal,
        onmessage(event) {
            hooks.onEvent?.(event);
            if (event.event === "message") {
                hooks.onData?.(opts.parser(event.data));
                return;
            }
            if (event.event === "error") {
                hooks.onError?.(ArriRequestErrorInstance.fromJson(event.data));
            }
        },
        onerror(error) {
            if (error instanceof NonFatalError) {
                // do nothing to automatically retry
                return;
            }
            if (shouldAbort) {
                throw error;
            }
            if (isArriRequestError(error)) {
                hooks.onError?.(error);
                return;
            }
            const err = new ArriRequestErrorInstance({
                statusCode: 500,
                statusMessage: `Error connecting to ${opts.url}`,
                data: error,
            });
            hooks.onError?.(err);
        },
        onclose() {
            throw new NonFatalError();
        },
        async onopen(response) {
            if (response.status >= 200 && response.status <= 299) {
                hooks.onOpen?.(response);
                return;
            }
            shouldAbort = true;
            const json = await response.text();
            if (json.includes("{") && json.includes("}")) {
                throw ArriRequestErrorInstance.fromJson(json);
            }
            throw new ArriRequestErrorInstance({
                statusCode: 500,
                statusMessage: response.statusText,
                data: json,
            });
        },
        openWhenHidden: true,
    });
    return controller;
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
        let parsedJson = json;
        if (typeof parsedJson === "string") {
            try {
                parsedJson = JSON.parse(parsedJson);
            } catch (_) {}
        }
        if (typeof parsedJson !== "object" || parsedJson === null) {
            return new ArriRequestErrorInstance({
                statusCode: 500,
                statusMessage: "Unknown error",
                data: parsedJson,
            });
        }
        return new ArriRequestErrorInstance({
            statusCode:
                "statusCode" in parsedJson &&
                typeof parsedJson.statusCode === "number"
                    ? parsedJson.statusCode
                    : 500,
            statusMessage:
                "statusMessage" in parsedJson &&
                typeof parsedJson.statusMessage === "string"
                    ? parsedJson.statusMessage
                    : "",
            stack:
                "stack" in parsedJson && typeof parsedJson.stack === "string"
                    ? parsedJson.stack
                    : undefined,
            data: "data" in parsedJson ? parsedJson.data : undefined,
        });
    }
}
