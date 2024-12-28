import { EventSourcePlusOptions } from 'event-source-plus';
import NodeWebsocket from 'ws';

import { ArriErrorInstance } from './errors';
import { getHeaders } from './utils';

function isBrowser() {
    return typeof window !== 'undefined';
}

interface WsControllerOptions<TParams, TResponse> {
    url: string;
    serializer: (input: TParams) => string;
    responseFromJson: (input: Record<string, unknown>) => TResponse;
    responseFromString: (input: string) => TResponse;
    onMessage?: WsMessageHook<TResponse>;
    onErrorMessage?: WsErrorHook;
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
    headers?: EventSourcePlusOptions['headers'];
    params?: TParams;
    responseFromJson: (input: Record<string, unknown>) => TResponse;
    responseFromString: (input: string) => TResponse;
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

export async function arriWsRequest<
    TParams extends Record<any, any> | undefined = undefined,
    TResponse = any,
>(
    opts: ArriWsRequestOptions<TParams, TResponse>,
    retryCount = 0,
): Promise<WsController<TParams, TResponse>> {
    let url = opts.url
        .replace('http://', 'ws://')
        .replace('https://', 'wss://');
    const headers = await getHeaders(opts.headers);
    if (headers) {
        if (opts.clientVersion) headers['client-version'] = opts.clientVersion;
        const queryParts: string[] = [];
        for (const key of Object.keys(headers)) {
            queryParts.push(`${key}=${headers[key]}`);
        }
        url += `?${queryParts.join('&')}`;
    }
    try {
        const controller = new WsController<TParams, TResponse>({
            url,
            responseFromJson: opts.responseFromJson,
            responseFromString: opts.responseFromString,
            serializer: opts.serializer ?? ((_) => ''),
            onOpen: opts.onOpen,
            onClose: opts.onClose,
            onMessage: opts.onMessage,
            onErrorMessage: opts.onError,
            onConnectionError: opts.onConnectionError,
        });
        return controller;
    } catch (err) {
        console.error(err);
        if (opts.onConnectionError) {
            opts.onConnectionError(err as any);
        }
        return arriWsRequest(opts, retryCount + 1);
    }
}

type WsErrorHook = (err: ArriErrorInstance) => void;
type WsMessageHook<TResponse> = (msg: TResponse) => any;

export class WsController<TParams, TResponse> {
    url: string;
    private _ws?: NodeWebsocket | WebSocket;
    private readonly _serializer: (input: TParams) => string;
    private readonly _parser: (input: string) => TResponse;
    onMessage?: WsMessageHook<TResponse>;
    onErrorMessage?: WsErrorHook;
    onConnectionError?: WsErrorHook;
    onOpen?: () => any;
    onClose?: () => any;
    constructor(opts: WsControllerOptions<TParams, TResponse>) {
        this.url = opts.url;
        this._serializer = opts.serializer;
        this._parser = opts.responseFromString;
        this.onOpen = opts.onOpen;
        this.onClose = opts.onClose;
        this.onErrorMessage = opts.onErrorMessage;
        this.onConnectionError = opts.onConnectionError;
        this.onMessage = opts.onMessage;
    }

    connect() {
        this._ws = connectWebsocket(this.url);
        this._ws.onopen = () => {
            this.onOpen?.();
        };
        this._ws.onclose = () => {
            this.onClose?.();
        };
        this._ws.onmessage = (event: MessageEvent) => {
            this._handleMessage(event);
        };
        this._ws.onerror = (event: NodeWebsocket.ErrorEvent) => {
            this.onConnectionError?.(
                new ArriErrorInstance({
                    code:
                        'errno' in event.error &&
                        typeof event.error.errno === 'number'
                            ? event.error.errno
                            : 0,
                    message:
                        event.error instanceof Error
                            ? event.error.message
                            : `Error connecting to ${this.url}`,
                    data: event.error,
                    stack:
                        event.error instanceof Error
                            ? event.error.stack
                            : undefined,
                }),
            );
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
        if (typeof msg.data !== 'string') {
            return;
        }
        const response = parsedWsResponse(msg.data);
        switch (response.event) {
            case 'error': {
                if (!this.onErrorMessage) {
                    return;
                }
                const err = ArriErrorInstance.fromJson(response.data);
                this.onErrorMessage(err);
                break;
            }
            case 'message': {
                if (!this.onMessage) {
                    return;
                }
                const msg = this._parser(response.data);
                this.onMessage(msg);
                break;
            }
            default:
                console.warn('Invalid response from server', msg);
                break;
        }
    }
}

export function parsedWsResponse(input: string): {
    event: 'message' | 'error' | 'unknown';
    data: string;
} {
    const lines = input.split('\n');
    let event: 'message' | 'error' | 'unknown' = 'unknown';
    let data = '';
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('event: ')) {
            switch (trimmedLine.substring(6).trim()) {
                case 'error':
                    event = 'error';
                    break;
                case 'message':
                    event = 'message';
                    break;
            }
            continue;
        }
        if (trimmedLine.startsWith('data: ')) {
            data = trimmedLine.substring(5).trim();
            continue;
        }
    }
    return {
        event,
        data,
    };
}
