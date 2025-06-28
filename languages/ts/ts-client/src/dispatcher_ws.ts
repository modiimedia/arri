import {
    encodeClientMessage,
    parseServerMessage,
    ServerFailureMessage,
    ServerMessage,
    ServerSuccessMessage,
} from '@arrirpc/core';
import { EventSourceController, HttpMethod } from 'event-source-plus';
import { IncomingMessage } from 'http';
import { randomUUID } from 'uncrypto';
import ws from 'websocket';

import {
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
        (msg: ServerSuccessMessage | ServerFailureMessage) => any
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
                        case 'FAILURE': {
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
        const errHandler =
            options?.onError ?? this.options.onError ?? ((_, __) => {});
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
        });
        if (!this.connection) {
            const err = new Error("Connection hasn't been established");
            errHandler(req, err);
            throw new Error("Connection hasn't been established");
        }
        return new Promise((res, rej) => {
            let responseReceived = false;
            if (options?.signal) {
                options.signal.onabort = (_) => {
                    if (responseReceived) return;
                    const err = new Error('Request was aborted');
                    errHandler(req, err);
                    rej(err);
                };
            }
            if (timeout) {
                setTimeout(() => {
                    if (responseReceived) return;
                    const err = new Error('Request timeout reached');
                    errHandler(req, err);
                    rej(err);
                }, timeout);
            }
            this.responseHandlers.set(reqId, (msg) => {
                responseReceived = true;
                this.responseHandlers.delete(reqId);
                if (msg.type !== 'SUCCESS') {
                    const err = msg.error;
                    errHandler(req, err);
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
        _req: RpcRequest<TParams>,
        _validator: RpcRequestValidator<TParams, TOutput>,
        _hooks?: EventStreamHooks<TOutput> | undefined,
    ): EventSourceController {
        throw new Error('Method not implemented.');
    }
}
