import { fetchEventSource } from "@fortaine/fetch-event-source";
import { type ArriError, ArriErrorInstance, isArriError } from "./errors";
import { type ArriRequestOpts } from "./request";

export interface SseEvent<TData = string> {
    id?: string;
    event?: string;
    data: TData;
}

class NonFatalError extends ArriErrorInstance {}

export interface SseOptions<TData> {
    onOpen?: (response: Response) => any;
    onData?: (data: TData) => any;
    onError?: (error: ArriError) => any;
    onClose?: () => any;
    maxRetryCount?: number;
    retryTimeout?: number;
    retryCount?: number;
}

export function arriSseRequest<
    TType,
    TParams extends Record<any, any> | undefined = undefined,
>(opts: ArriRequestOpts<TType, TParams>, options: SseOptions<TType>) {
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
    const headers = {
        ...opts.headers,
    };
    const controller = new AbortController();
    let shouldAbort = false;
    void fetchEventSource(url, {
        method: opts.method.toUpperCase(),
        headers,
        body,
        signal: controller.signal,
        onmessage(event) {
            if (
                event.event === "message" ||
                event.event === undefined ||
                event.event === ""
            ) {
                options.onData?.(opts.parser(event.data));
                return;
            }
            if (event.event === "error") {
                options.onError?.(ArriErrorInstance.fromJson(event.data));
                return;
            }
            if (event.event === "done") {
                controller.abort();
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
            if (isArriError(error)) {
                options.onError?.(error);
                return;
            }
            const err = new ArriErrorInstance({
                code: 500,
                message: `Error connecting to ${opts.url}`,
                data: error,
            });
            options.onError?.(err);
        },
        onclose() {
            throw new NonFatalError({
                code: 500,
                message: "Connection closed. Reopening.",
            });
        },
        async onopen(response) {
            if (response.status >= 200 && response.status <= 299) {
                options.onOpen?.(response);
                return;
            }
            shouldAbort = true;
            const json = await response.text();
            if (json.includes("{") && json.includes("}")) {
                throw ArriErrorInstance.fromJson(json);
            }
            throw new ArriErrorInstance({
                code: 500,
                message: response.statusText,
                data: json,
            });
        },
        openWhenHidden: true,
    });
    return controller;
}
export function parseSseEvent<TData = string>(
    input: string,
    dataParser: (input: string) => TData,
): SseEvent<TData> | undefined {
    let id: string | undefined;
    let event: string | undefined;
    let data: TData | undefined;
    const lines = input.split("\n");
    for (const line of lines) {
        if (line.startsWith("id:")) {
            id = line.substring(3).trim();
            continue;
        }
        if (line.startsWith("event:")) {
            event = line.substring(6).trim();
            continue;
        }
        if (line.startsWith("data:")) {
            data = dataParser(line.substring(5).trim());
        }
    }
    if (!data) {
        return undefined;
    }
    return {
        id,
        event,
        data,
    };
}

export function parseSseEvents<TData = string>(
    input: string,
    dataParser: (input: string) => TData,
): SseEvent<TData>[] {
    const eventStrings = input.split("\n\n");
    const events: Array<SseEvent<TData>> = [];
    for (const str of eventStrings) {
        const event = parseSseEvent(str, dataParser);
        if (event) {
            events.push(event);
        }
    }
    return events;
}
