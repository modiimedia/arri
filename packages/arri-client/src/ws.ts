import NodeWebsocket from "ws";
import { type ArriError, ArriErrorInstance } from "./errors";

function isBrowser() {
    return typeof window !== "undefined";
}

interface WsControllerOptions<TParams, TResponse> {
    url: string;
    serializer: (input: TParams) => string;
    parser: (input: unknown) => TResponse;
    onMessage?: WsMessageHook<TResponse>;
    onError?: WsErrorHook;
    onConnectionError?: WsErrorHook;
    onOpen?: () => any;
    onClose?: () => any;
}

export interface WsOptions<TResponse> {
    onMessage?: WsMessageHook<TResponse>;
    onError?: WsErrorHook;
    onConnectionError?: WsErrorHook;
    onOpen?: () => any;
    onClose?: () => any;
}

interface ArriWsRequestOptions<TParams = any, TResponse = any> {
    url: string;
    headers?: Record<string, string> | (() => Record<string, string>);
    params?: TParams;
    parser: (input: unknown) => TResponse;
    serializer: (input: TParams) => string;
    onMessage?: WsMessageHook<TResponse>;
    onError?: WsErrorHook;
    onConnectionError?: WsErrorHook;
    onOpen?: () => any;
    onClose?: () => any;
    clientVersion?: string;
}

function connectWebsocket(url: string, protocol?: string) {
    if (isBrowser()) {
        return new WebSocket(url, protocol);
    }
    return new NodeWebsocket(url, {
        protocol,
    });
}

export function arriWsRequest<
    TParams extends Record<any, any> | undefined = undefined,
    TResponse = any,
>(
    opts: ArriWsRequestOptions<TParams, TResponse>,
    retryCount = 0,
): WsController<TParams, TResponse> {
    let url = opts.url
        .replace("http://", "ws://")
        .replace("https://", "wss://");
    let headers: Record<string, string> | undefined;
    if (typeof opts.headers === "function") {
        headers = opts.headers();
    } else {
        headers = opts.headers;
    }
    if (headers) {
        if (opts.clientVersion) headers["client-version"] = opts.clientVersion;
        const queryParts: string[] = [];
        for (const key of Object.keys(headers)) {
            queryParts.push(`${key}=${headers[key]}`);
        }
        url += `?${queryParts.join("&")}`;
    }
    try {
        const controller = new WsController<TParams, TResponse>({
            url,
            parser: opts.parser,
            serializer: opts.serializer ?? ((_) => ""),
            onOpen: opts.onOpen,
            onClose: opts.onClose,
            onMessage: opts.onMessage,
            onError: opts.onError,
            onConnectionError: opts.onConnectionError,
        });
        return controller;
    } catch (err) {
        console.error(err);
        if (opts.onConnectionError) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            opts.onConnectionError(err as any);
        }
        return arriWsRequest(opts, retryCount + 1);
    }
}

type WsErrorHook = (err: ArriError) => void;
type WsMessageHook<TResponse> = (msg: TResponse) => any;

class WsController<TParams, TResponse> {
    url: string;
    private _ws?: NodeWebsocket | WebSocket;
    private readonly _serializer: (input: TParams) => string;
    private readonly _parser: (input: unknown) => TResponse;
    onMessage?: WsMessageHook<TResponse>;
    onError?: WsErrorHook;
    onConnectionError?: WsErrorHook;
    onOpen?: () => any;
    onClose?: () => any;
    constructor(opts: WsControllerOptions<TParams, TResponse>) {
        this.url = opts.url;
        this._serializer = opts.serializer;
        this._parser = opts.parser;
        this.onOpen = opts.onOpen;
        this.onClose = opts.onClose;
        this.onError = opts.onError;
        this.onConnectionError = opts.onConnectionError;
        this.onMessage = opts.onMessage;
    }

    connect() {
        this._ws = connectWebsocket(this.url);
        this._ws.onopen = () => {
            if (this.onOpen) {
                this.onOpen();
            }
        };
        this._ws.onclose = () => {
            if (this.onClose) {
                this.onClose();
            }
        };
        this._ws.onmessage = (event: MessageEvent) => {
            this._handleMessage(event);
        };
        this._ws.onerror = (event: any) => {
            console.error(event);
            if (this.onConnectionError) {
                this.onConnectionError({
                    code: 500,
                    message: "IDK",
                });
            }
        };
    }

    readyState() {
        return this._ws?.readyState ?? -1;
    }

    send(message: TParams) {
        const payload = this._serializer(message);
        this._ws?.send(payload);
    }

    close() {
        this._ws?.close();
    }

    private _handleMessage(msg: MessageEvent) {
        if (typeof msg.data !== "string") {
            return;
        }
        const response = parsedWsResponse(msg.data);
        switch (response.type) {
            case "error": {
                if (!this.onError) {
                    return;
                }
                const err = ArriErrorInstance.fromJson(response.data);
                this.onError(err);
                break;
            }
            case "message": {
                if (!this.onMessage) {
                    return;
                }
                const msg = this._parser(response.data);
                this.onMessage(msg);
                break;
            }
            default:
                console.warn("Invalid response from server", msg);
                break;
        }
    }
}

function parsedWsResponse(input: string): {
    type: "message" | "error" | "unknown";
    data: string;
} {
    const lines = input.split("\n");
    let type: "message" | "error" | "unknown" = "unknown";
    let data = "";
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("type: ")) {
            switch (trimmedLine.substring(5).trim()) {
                case "error":
                    type = "error";
                    break;
                case "message":
                    type = "message";
                    break;
            }
            continue;
        }
        if (trimmedLine.startsWith("data: ")) {
            data = trimmedLine.substring(5).trim();
            continue;
        }
    }
    return {
        type,
        data,
    };
}
