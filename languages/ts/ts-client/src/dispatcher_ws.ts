import {
    ArriError,
    ClientMessage,
    encodeClientMessage,
    parseServerMessage,
    ServerEventStreamMessage,
    ServerFailureMessage,
    ServerMessage,
    ServerSuccessMessage,
} from '@arrirpc/core';
import { HttpMethod } from 'event-source-plus';
import { IncomingMessage } from 'http';
import { randomUUID } from 'uncrypto';
import ws from 'websocket';

import {
    EventStreamController,
    EventStreamHooks,
    RpcDispatcher,
    RpcDispatcherOptions,
} from './dispatcher';
import { getHeaders, RpcRequest, RpcRequestValidator } from './requests';

export interface WsDispatcherOptions extends RpcDispatcherOptions {
    wsConnectionUrl: string;
    wsConnectionMethod?: HttpMethod;
}

export class WsDispatcher implements RpcDispatcher {
    private readonly client: ws.client;
    private connection: ws.connection | undefined;
    private reqCount = 0;
    private options: WsDispatcherOptions;
    private responseHandlers: Map<
        string,
        (
            msg:
                | ServerSuccessMessage
                | ServerFailureMessage
                | ServerEventStreamMessage,
        ) => any
    > = new Map();

    private heartbeatTimeout: any | undefined;
    private serverHeartbeatInterval: number | undefined;
    private heartbeatTimeoutMultiplier = 2;

    constructor(options: WsDispatcherOptions) {
        this.client = new ws.client();
        this.options = options;
    }

    terminateConnections(): void {
        if (!this.connection?.connected) return;
        this.connection?.close();
    }

    private cleanupTimeout() {
        clearTimeout(this.heartbeatTimeout);
    }

    private resetHeartbeatTimeout() {
        this.cleanupTimeout();
        if (!this.serverHeartbeatInterval) return;
        this.heartbeatTimeout = setTimeout(() => {
            this.setupConnection(true);
        }, this.serverHeartbeatInterval * this.heartbeatTimeoutMultiplier);
    }

    async setupConnection(forceReconnection = false) {
        if (this.connection?.connected) {
            if (!forceReconnection) return;
            this.connection.close();
        }
        const headers = await getHeaders(this.options.headers);
        this.client.connect(
            this.options.wsConnectionUrl,
            undefined,
            undefined,
            headers,
            {
                method: this.options.wsConnectionMethod?.toUpperCase(),
            },
        );
        return new Promise((res, rej) => {
            const onConnection = (connection: ws.connection) => {
                this.connection = connection;
                this.resetHeartbeatTimeout();
                connection.on('error', (_err) => {});
                connection.on('close', (_code, _desc) => {});
                connection.on('message', (msg) => {
                    let parsedMsg: ServerMessage | undefined;
                    switch (msg.type) {
                        case 'utf8': {
                            const result = parseServerMessage(msg.utf8Data);
                            if (!result.success) {
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
                        case 'SUCCESS':
                        case 'FAILURE':
                        case 'ES_START':
                        case 'ES_END':
                        case 'ES_EVENT': {
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
                this.client.removeListener('connect', onConnection);
                this.client.removeListener('connectFailed', onConnectionFailed);
                this.client.removeListener('httpResponse', onHttpResponse);
                res(undefined);
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
    }

    transport: string = 'ws';

    async handleRpc<TParams, TResponse>(
        req: RpcRequest<TParams>,
        validator: RpcRequestValidator<TParams, TResponse>,
        options?: RpcDispatcherOptions,
    ): Promise<TResponse> {
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
        this.reqCount++;
        const reqId = req.reqId ?? randomUUID();
        if (!req.reqId) req.reqId = reqId;
        await this.setupConnection();
        const msgPayload = encodeClientMessage({
            rpcName: req.procedure,
            reqId: reqId,
            contentType: 'application/json',
            customHeaders: await getHeaders(req.customHeaders),
            body: validator.params.toJsonString(req.data),
            action: undefined,
            clientVersion: req.clientVersion,
            lastEventId: undefined,
        });
        if (!this.connection) {
            const err = new Error("Connection hasn't been established");
            options?.onError?.(req, err);
            this.options.onError?.(req, err);
            throw new Error("Connection hasn't been established");
        }
        return new Promise((res, rej) => {
            let responseReceived = false;
            if (options?.signal) {
                options.signal.onabort = (_) => {
                    if (responseReceived) return;
                    const err = new Error('Request was aborted');
                    options.onError?.(req, err);
                    this.options.onError?.(req, err);
                    rej(err);
                };
            }
            if (timeout) {
                setTimeout(() => {
                    if (responseReceived) return;
                    const err = new Error('Request timeout reached');
                    options?.onError?.(req, err);
                    this.options?.onError?.(req, err);
                    rej(err);
                }, timeout);
            }
            this.responseHandlers.set(reqId, (msg) => {
                responseReceived = true;
                this.responseHandlers.delete(reqId);
                if (msg.type !== 'SUCCESS') {
                    if (msg.type !== 'FAILURE') {
                        const err = new ArriError({
                            code: 0,
                            message: `Unexpected message type received from server. Expected either "SUCCESS" or "FAILURE". Got "${msg.type}".`,
                        });
                        options?.onError?.(req, err);
                        this.options.onError?.(req, err);
                        rej(err);
                        return;
                    }
                    const err = msg.error;
                    options?.onError?.(req, err);
                    this.options.onError?.(req, err);
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
        });
    }

    handleEventStreamRpc<TParams, TOutput>(
        req: RpcRequest<TParams>,
        validator: RpcRequestValidator<TParams, TOutput>,
        hooks?: EventStreamHooks<TOutput> | undefined,
    ): EventStreamController {
        if (!req.reqId) req.reqId = randomUUID();
        const controller = new WsEventSource(
            req,
            validator,
            hooks ?? {},
            async () => {
                await this.setupConnection();
                if (!this.connection) {
                    throw new Error(`Error establishing connection`);
                }
                return this.connection;
            },
            this.options.onError,
        );
        this.responseHandlers.set(req.reqId!, (msg) =>
            controller.handleMessage(msg),
        );
        controller.onClosed(() => {
            this.responseHandlers.delete(req.reqId!);
        });
        void controller.init();
        return controller;
    }
}

class WsEventSource<TParams, TOutput> implements EventStreamController {
    lastEventId: string | undefined;

    req: RpcRequest<TParams>;
    validator: RpcRequestValidator<TParams, TOutput>;
    hooks: EventStreamHooks<TOutput>;
    getConnection: () => ws.connection | Promise<ws.connection>;
    globalOnError: RpcDispatcherOptions['onError'];

    constructor(
        req: RpcRequest<TParams>,
        validator: RpcRequestValidator<TParams, TOutput>,
        hooks: EventStreamHooks<TOutput>,
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
            const msg: ClientMessage = {
                rpcName: this.req.procedure,
                reqId: this.req.reqId,
                action: undefined,
                contentType: 'application/json',
                clientVersion: this.req.clientVersion,
                lastEventId: this.lastEventId,
                customHeaders: await getHeaders(this.req.customHeaders),
                body: serialValue,
            };
            connection.send(encodeClientMessage(msg));
        } catch (err) {
            this.hooks.onError?.(err);
            this.globalOnError?.(this.req, err);
        }
    }

    async handleMessage(msg: ServerMessage) {
        switch (msg.type) {
            case 'ES_START':
                this.hooks.onOpen?.();
                return;
            case 'ES_EVENT': {
                if (msg.eventId) this.lastEventId = msg.eventId;
                const parsedMsg = this.validator.response.fromJsonString(
                    msg.body ?? '',
                );
                this.hooks.onMessage?.(parsedMsg);
                return;
            }

            case 'ES_END':
                this.handleClose(false);
                return;
            case 'FAILURE':
                this.hooks.onError?.(msg.error);
                this.globalOnError?.(this.req, msg.error);
                return;
            case 'CONNECTION_START':
            case 'HEARTBEAT':
            case 'SUCCESS':
                return;
        }
    }

    private async handleClose(clientInitiated: boolean) {
        if (clientInitiated) return this.abort();
        this.hooks.onClose?.();
        this.cb?.();
    }

    async abort(): Promise<void> {
        const connection = await this.getConnection();
        const msg: ClientMessage = {
            rpcName: this.req.procedure,
            reqId: this.req.reqId,
            action: 'CLOSE',
            contentType: 'application/json',
            clientVersion: this.req.clientVersion,
            lastEventId: undefined,
            customHeaders: {},
            body: undefined,
        };
        const encodedMsg = encodeClientMessage(msg);
        connection.send(encodedMsg);
        this.hooks.onClose?.();
        this.cb?.();
    }

    private cb: (() => void) | undefined;

    onClosed(cb: () => void) {
        this.cb = cb;
    }
}
