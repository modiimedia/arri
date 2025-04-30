import { EventSourceController } from 'event-source-plus';
import { IncomingMessage } from 'http';
import ws from 'websocket';

import { ArriErrorInstance } from './errors';
import {
    decodeRequest,
    encodeRequest,
    RpcDispatcher,
    RpcRawResponse,
    RpcRequest,
    RpcRequestValidator,
} from './requests';
import { SseOptions } from './requests_http_sse';

export class WsRpcDispatcher implements RpcDispatcher<undefined, any> {
    private readonly client: ws.client;
    private connection: ws.connection | undefined;
    private readonly connectionUrl: string;
    private reqCount = 0;

    private responseHandlers: Map<string, (msg: RpcRawResponse) => any> =
        new Map();

    constructor(options?: { connectionUrl: string }) {
        this.client = new ws.client();
        this.connectionUrl = options?.connectionUrl ?? '';
        this.client.connect(this.connectionUrl);
    }

    async setupConnection() {
        if (this.connection?.connected) return;
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
        _: undefined,
    ): Promise<TResponse> {
        this.reqCount++;
        const reqId = `${this.reqCount}`;
        await this.setupConnection();
        const msgPayload = encodeRequest(req, validator.params.toJsonString);
        if (!this.connection) {
            throw new Error("Connection hasn't been established");
        }
        return new Promise((res, rej) => {
            this.responseHandlers.set(reqId, (msg) => {
                this.responseHandlers.delete(reqId);
                if (!msg.success) {
                    rej(ArriErrorInstance.fromJson(msg.data));
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
        _hooks?: SseOptions<TOutput> | undefined,
    ): EventSourceController {
        throw new Error('Method not implemented.');
    }
    options?: any;
}
