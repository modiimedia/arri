import { EventSourceController } from 'event-source-plus';
import { IncomingMessage } from 'http';
import ws from 'websocket';

import {
    EventStreamHooks,
    RpcDispatcher,
    RpcDispatcherOptions,
} from './dispatcher';
import { ArriErrorInstance } from './errors';
import {
    decodeRequest,
    encodeRequest,
    getHeaders,
    RpcRawResponse,
    RpcRequest,
    RpcRequestValidator,
} from './requests';

export interface WsDispatcherOptions extends RpcDispatcherOptions {
    wsConnectionUrl: string;
}

export class WsDispatcher implements RpcDispatcher {
    private readonly client: ws.client;
    private connection: ws.connection | undefined;
    private reqCount = 0;

    private options: WsDispatcherOptions;

    private responseHandlers: Map<string, (msg: RpcRawResponse) => any> =
        new Map();

    constructor(options: WsDispatcherOptions) {
        this.client = new ws.client();
        this.options = options;
    }

    async setupConnection() {
        if (this.connection?.connected) return;
        const headers = await getHeaders(this.options.headers);
        this.client.connect(
            this.options.wsConnectionUrl,
            undefined,
            undefined,
            headers,
        );
        return new Promise((res, rej) => {
            const onConnection = (connection: ws.connection) => {
                this.connection = connection;
                connection.on('error', (_err) => {});
                connection.on('close', (_code, _desc) => {});
                connection.on('message', (msg) => {
                    let parsedMsg: RpcRawResponse | undefined;
                    switch (msg.type) {
                        case 'utf8':
                            parsedMsg = decodeRequest(msg.utf8Data);
                            break;
                        case 'binary':
                            throw new Error(
                                "unsupported encoding format 'binary'",
                            );
                    }
                    if (!parsedMsg) return;
                    if (!parsedMsg.reqId) return;
                    const handler = this.responseHandlers.get(parsedMsg.reqId);
                    if (!handler) return;
                    return handler(parsedMsg);
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
                res: IncomingMessage,
                client: ws.client,
            ) => {
                console.log(res, client);
            };
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
        const errHandler =
            options?.onError ?? this.options.onError ?? ((_, __) => {});
        const timeout = options?.timeout ?? this.options.timeout;
        this.reqCount++;
        const reqId = `${this.reqCount}`;
        await this.setupConnection();
        const msgPayload = encodeRequest(req, validator.params.toJsonString);
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
                if (!msg.success) {
                    const err = ArriErrorInstance.fromJson(msg.data);
                    errHandler(req, err);
                    rej(err);
                    return;
                }
                if (!msg.data) {
                    res(undefined as any);
                    return;
                }
                if (typeof msg.data === 'string') {
                    res(validator.response.fromJsonString(msg.data));
                    return;
                }
                const parsedData = validator.response.fromJsonString(
                    new TextDecoder().decode(msg.data),
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
