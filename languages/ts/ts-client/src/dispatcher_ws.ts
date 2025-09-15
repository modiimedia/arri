import {
    ArriError,
    encodeMessage,
    InvocationMessage,
    Message,
    parseMessage,
    StreamCancelMessage,
} from '@arrirpc/core';
import { HttpMethod } from 'event-source-plus';
import { IncomingMessage } from 'http';
import { randomUUID } from 'uncrypto';
import ws from 'websocket';

import {
    StreamController,
    StreamHooks,
    RpcDispatcher,
    RpcDispatcherOptions,
    waitFor,
} from './dispatcher';
import { getHeaders, RpcRequest, RpcRequestValidator } from './requests';

export interface WsDispatcherOptions extends RpcDispatcherOptions {
    wsConnectionUrl: string;
    wsConnectionMethod?: HttpMethod;
    /**
     * Max frame size in bytes.
     *
     * @default
     * 1096478 bytes (~1 mb)
     */
    maxReceivedFrameSize?: number;
    /**
     * The maximum size of a frame in bytes before it is automatically fragmented.
     *
     * @default
     * 16384 bytes (16 KiB)
     */
    fragmentationThreshold?: number;
}

export class WsDispatcher implements RpcDispatcher<'ws'> {
    transport = 'ws' as const;
    private readonly client: ws.client;
    private connection: ws.connection | undefined;
    private reqCount = 0;
    private options: WsDispatcherOptions;
    private responseHandlers: Map<string, (msg: Message) => any> = new Map();
    private eventSources: Map<string, WsEventSource<any, any>> = new Map();

    private heartbeatTimeout: any | undefined;
    private serverHeartbeatInterval: number | undefined;
    private heartbeatTimeoutMultiplier = 2;
    private connectionMaxRetryCount = 10;
    private connectionRetryInterval = 0;
    private connectionMaxRetryInterval = 30000;
    private closedByClient = false;

    constructor(options: WsDispatcherOptions) {
        this.client = new ws.client({
            assembleFragments: true,
            maxReceivedFrameSize: options.maxReceivedFrameSize ?? 1096478,
            fragmentationThreshold: options.fragmentationThreshold ?? 16384,
        });
        this.options = options;
    }

    terminateConnections(): void {
        if (!this.connection?.connected) return;
        this.cleanupTimeout();
        this.closedByClient = true;
        this.connection?.close();
    }

    private cleanupTimeout() {
        clearTimeout(this.heartbeatTimeout);
    }

    private resetHeartbeatTimeout() {
        this.cleanupTimeout();
        if (!this.serverHeartbeatInterval) return;
        this.heartbeatTimeout = setTimeout(() => {
            this.setupConnection({ forceReconnection: true });
        }, this.serverHeartbeatInterval * this.heartbeatTimeoutMultiplier);
    }

    async setupConnection(options: {
        forceReconnection?: boolean;
        prefetchedHeaders?: Record<string, string> | undefined;
        retryCount?: number;
        initiatingReqId?: string;
    }): Promise<void> {
        const retryCount = options.retryCount ?? 0;
        if (this.connection?.connected) {
            if (!options?.forceReconnection) return;
            this.connection.close();
        }
        const headers =
            options?.prefetchedHeaders ??
            (await getHeaders(this.options.headers));
        this.client.connect(
            this.options.wsConnectionUrl,
            undefined,
            undefined,
            headers,
            {
                method: this.options.wsConnectionMethod?.toUpperCase(),
            },
        );
        const promise = new Promise<void>((res, rej) => {
            const onConnection = (connection: ws.connection) => {
                this.connection = connection;
                this.resetHeartbeatTimeout();
                connection.on('error', (err) => {
                    const openStreams = this.eventSources.values();
                    for (const stream of openStreams) {
                        stream.hooks.onError?.(err);
                    }
                });
                connection.on('close', (code, desc) => {
                    if (this.closedByClient) {
                        this.cleanupTimeout();
                        return;
                    }
                    if (![1000, 1001].includes(code)) {
                        const openStreams = this.eventSources.values();
                        for (const stream of openStreams) {
                            stream.hooks.onError?.(
                                new ArriError({ code: code, message: desc }),
                            );
                        }
                    }
                    this.setupConnection({});
                });
                connection.on('message', (msg) => {
                    let parsedMsg: Message | undefined;
                    switch (msg.type) {
                        case 'utf8': {
                            const result = parseMessage(msg.utf8Data);
                            if (!result.ok) {
                                // eslint-disable-next-line no-console
                                console.warn(
                                    `Error parsing response from server: ${result.error}`,
                                );
                                return;
                            }
                            parsedMsg = result.value;
                            break;
                        }
                        case 'binary':
                            // eslint-disable-next-line no-console
                            console.warn(
                                'Error parsing response from server: Expected string got binary.',
                            );
                            break;
                    }
                    if (!parsedMsg) {
                        this.resetHeartbeatTimeout();
                        return;
                    }
                    switch (parsedMsg.type) {
                        case 'OK':
                        case 'ERROR':
                        case 'STREAM_CANCEL':
                        case 'STREAM_END':
                        case 'STREAM_DATA': {
                            this.resetHeartbeatTimeout();
                            if (!parsedMsg.reqId) return;
                            const handler = this.responseHandlers.get(
                                parsedMsg.reqId,
                            );
                            if (!handler) return;
                            return handler(parsedMsg);
                        }
                        case 'CONNECTION_START':
                        case 'HEARTBEAT':
                            if (
                                parsedMsg.heartbeatInterval &&
                                this.serverHeartbeatInterval !==
                                    parsedMsg.heartbeatInterval
                            ) {
                                this.serverHeartbeatInterval =
                                    parsedMsg.heartbeatInterval;
                            }
                            this.resetHeartbeatTimeout();
                            return;
                    }
                });
                for (const [_, es] of this.eventSources.entries()) {
                    if (es.req.reqId === options.initiatingReqId) {
                        continue;
                    }
                    es.init();
                }
                this.client.removeListener('connect', onConnection);
                this.client.removeListener('connectFailed', onConnectionFailed);
                this.client.removeListener('httpResponse', onHttpResponse);
                res();
            };

            const onConnectionFailed = (err: Error) => {
                this.client.removeListener('connect', onConnection);
                this.client.removeListener('connectFailed', onConnectionFailed);
                this.client.removeListener('httpResponse', onHttpResponse);
                rej(err);
            };
            const onHttpResponse = (
                _res: IncomingMessage,
                _client: ws.client,
            ) => {};
            this.client
                .on('connect', onConnection)
                .on('connectFailed', onConnectionFailed)
                .on('httpResponse', onHttpResponse);
        });
        try {
            await promise;
            this.connectionRetryInterval = 0;
        } catch (err) {
            if (retryCount > this.connectionMaxRetryCount) throw err;
            if (retryCount > 3 && this.connectionRetryInterval === 0) {
                this.connectionRetryInterval = 10;
            } else if (this.connectionRetryInterval > 0) {
                this.connectionRetryInterval = this.connectionRetryInterval * 2;
            }
            if (
                this.connectionRetryInterval > this.connectionMaxRetryInterval
            ) {
                this.connectionRetryInterval = this.connectionMaxRetryInterval;
            }
            await waitFor(this.connectionMaxRetryInterval);
            return this.setupConnection({
                ...options,
                retryCount: retryCount + 1,
            });
        }
    }

    async handleRpc<TParams, TResponse>(
        req: RpcRequest<TParams>,
        validator: RpcRequestValidator<TParams, TResponse>,
        options?: RpcDispatcherOptions,
        numRetries?: number,
    ): Promise<TResponse> {
        const retryCount = numRetries ?? 0;
        if (
            options?.heartbeatTimeoutMultiplier &&
            options?.heartbeatTimeoutMultiplier !=
                this.heartbeatTimeoutMultiplier
        ) {
            this.heartbeatTimeoutMultiplier =
                options.heartbeatTimeoutMultiplier;
        }
        // default timeout of 60sec
        const timeout = options?.timeout ?? this.options.timeout ?? 60000;
        const onErr = options?.onError ?? this.options.onError;
        this.reqCount++;
        const reqId = req.reqId ?? randomUUID();
        if (!req.reqId) req.reqId = reqId;
        const headers = await getHeaders(req.customHeaders);
        await this.setupConnection({
            prefetchedHeaders: headers,
        });
        const msgPayload = encodeMessage({
            type: 'INVOCATION',
            rpcName: req.procedure,
            reqId: reqId,
            contentType: 'application/json',
            customHeaders: headers,
            body: validator.params.toJsonString(req.data),
            clientVersion: req.clientVersion,
            lastMsgId: undefined,
        });

        const promiseHandler = (
            res: (val: TResponse) => void,
            rej: (val: unknown) => void,
        ) => {
            if (!this.connection) {
                const err = new Error("Connection hasn't been established");
                onErr?.(req, err);
                rej(err);
                return;
            }
            let responseReceived = false;
            if (options?.signal) {
                options.signal.onabort = (_) => {
                    if (responseReceived) return;
                    const err = new Error('Request was aborted');
                    onErr?.(req, err);
                    rej(err);
                };
            }
            if (timeout) {
                setTimeout(() => {
                    if (responseReceived) return;
                    const err = new Error('Request timeout reached');
                    onErr?.(req, err);
                    rej(err);
                }, timeout);
            }
            this.responseHandlers.set(reqId, (msg) => {
                responseReceived = true;
                this.responseHandlers.delete(reqId);
                if (msg.type !== 'OK') {
                    if (msg.type !== 'ERROR') {
                        const err = new ArriError({
                            code: 0,
                            message: `Unexpected message type received from server. Expected either "OK" or "ERROR". Got "${msg.type}".`,
                        });
                        onErr?.(req, err);
                        rej(err);
                        return;
                    }
                    const err = ArriError.fromMessage(msg);
                    onErr?.(req, err);
                    rej(err);
                    return;
                }
                if (!msg.body) {
                    res(undefined as any);
                    return;
                }
                if (typeof msg.body === 'string') {
                    res(validator.response.fromJsonString(msg.body));
                    return;
                }
                const parsedData = validator.response.fromJsonString(
                    new TextDecoder().decode(msg.body),
                );
                res(parsedData);
            });
            this.connection!.send(msgPayload);
        };
        const retry = options?.retry ?? this.options.retry;
        const retryDelay = options?.retryDelay ?? this.options.retryDelay;
        const retryErrorCodes =
            options?.retryErrorCodes ?? this.options.retryErrorCodes;

        if (!retry) return new Promise(promiseHandler);
        try {
            return await new Promise(promiseHandler);
        } catch (err) {
            if (options?.signal && options.signal.aborted) throw err;
            if (retryCount === retry) throw err;
            if (retryErrorCodes) {
                if (err instanceof ArriError) {
                    if (retryErrorCodes.includes(err.code)) {
                        if (retryDelay) await waitFor(retryDelay);
                        return this.handleRpc(
                            req,
                            validator,
                            options,
                            retryCount + 1,
                        );
                    }
                }
                throw err;
            }
            if (retryDelay) await waitFor(retryDelay);
            return this.handleRpc(req, validator, options, retryCount + 1);
        }
    }

    handleOutputStreamRpc<TParams, TOutput>(
        req: RpcRequest<TParams>,
        validator: RpcRequestValidator<TParams, TOutput>,
        hooks?: StreamHooks<TOutput> | undefined,
    ): StreamController {
        if (!req.reqId) req.reqId = randomUUID();
        const controller = new WsEventSource(
            req,
            validator,
            hooks ?? {},
            async () => {
                await this.setupConnection({
                    forceReconnection: false,
                    prefetchedHeaders: undefined,
                    initiatingReqId: req.reqId,
                });
                if (!this.connection) {
                    throw new Error(`Error establishing connection`);
                }
                return this.connection;
            },
            this.options.onError,
        );
        this.eventSources.set(req.reqId!, controller);
        this.responseHandlers.set(req.reqId!, (msg) =>
            controller.handleMessage(msg),
        );
        controller.onClosed(() => {
            this.eventSources.delete(req.reqId!);
            this.responseHandlers.delete(req.reqId!);
        });
        void controller.init();
        return controller;
    }
}

class WsEventSource<TParams, TOutput> implements StreamController {
    lastMsgId: string | undefined;

    req: RpcRequest<TParams>;
    validator: RpcRequestValidator<TParams, TOutput>;
    hooks: StreamHooks<TOutput>;
    getConnection: () => ws.connection | Promise<ws.connection>;
    globalOnError: RpcDispatcherOptions['onError'];

    constructor(
        req: RpcRequest<TParams>,
        validator: RpcRequestValidator<TParams, TOutput>,
        hooks: StreamHooks<TOutput>,
        getConnection: () => ws.connection | Promise<ws.connection>,
        onError: RpcDispatcherOptions['onError'],
    ) {
        this.req = req;
        this.validator = validator;
        this.hooks = hooks;
        this.getConnection = getConnection;
        this.globalOnError = onError;
    }

    async init() {
        try {
            const connection = await this.getConnection();
            const serialValue = this.validator.params.toJsonString(
                this.req.data,
            );
            const msg: InvocationMessage = {
                type: 'INVOCATION',
                rpcName: this.req.procedure,
                reqId: this.req.reqId,
                contentType: 'application/json',
                clientVersion: this.req.clientVersion,
                lastMsgId: this.lastMsgId,
                customHeaders: await getHeaders(this.req.customHeaders),
                body: serialValue,
            };
            connection.send(encodeMessage(msg));
        } catch (err) {
            this.hooks.onError?.(err);
            this.globalOnError?.(this.req, err);
        }
    }

    async handleMessage(msg: Message) {
        switch (msg.type) {
            case 'OK':
                this.hooks.onOpen?.();
                return;
            case 'STREAM_DATA': {
                if (msg.msgId) this.lastMsgId = msg.msgId;
                const parsedMsg = this.validator.response.fromJsonString(
                    msg.body ?? '',
                );
                this.hooks.onData?.(parsedMsg);
                return;
            }
            case 'STREAM_END':
                this.handleClose(false);
                return;
            case 'ERROR':
                const error = ArriError.fromMessage(msg);
                this.hooks.onError?.(error);
                this.globalOnError?.(this.req, error);
                this.init();
                return;
            case 'CONNECTION_START':
            case 'HEARTBEAT':
            case 'INVOCATION':
            case 'STREAM_CANCEL':
                return;
            default:
                msg satisfies never;
                return;
        }
    }

    private async handleClose(clientInitiated: boolean) {
        if (clientInitiated) return this.abort();
        this.hooks.onClose?.();
        this.cb?.();
    }

    async abort(reason?: string): Promise<void> {
        const connection = await this.getConnection();
        const msg: StreamCancelMessage = {
            type: 'STREAM_CANCEL',
            reqId: this.req.reqId,
            reason: reason,
        };
        const encodedMsg = encodeMessage(msg);
        connection.send(encodedMsg);
        this.hooks.onClose?.();
        this.cb?.();
    }

    private cb: (() => void) | undefined;

    onClosed(cb: () => void) {
        this.cb = cb;
    }
}
