import { EventSourceController } from 'event-source-plus';
import { IncomingMessage } from 'http';
import ws from 'websocket';

import { ArriErrorInstance } from './errors';
import { RpcDispatcher, RpcRequest } from './requests';
import { SseOptions } from './sse';

export class WsRpcDispatcher implements RpcDispatcher {
    private readonly client: ws.client;
    private connection: ws.connection | undefined;
    private readonly connectionUrl: string;
    private reqCount = 0;

    private messageHandlers: Map<string, (msg: WebsocketServerMessage) => any> =
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
                    let parsedMsg: WebsocketServerMessage | undefined;
                    switch (msg.type) {
                        case 'utf8':
                            parsedMsg = websocketServerMessageFromString(
                                msg.utf8Data,
                            );
                            break;
                        case 'binary':
                            throw new Error(
                                "unsupported encoding format 'binary'",
                            );
                    }
                    if (!parsedMsg) return;
                    const handler = this.messageHandlers.get(
                        parsedMsg.metadata.id,
                    );
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

    encodeMsg(msg: WebsocketClientMessage) {
        const result = `{"${msg.metadata.id}":"${msg.metadata.id}","path":"${msg.metadata.path}","clientVersion":"${msg.metadata['clientVersion']}"}`;
        if (!msg.data) return `${result}\n\n`;
        return `${result}\n${msg.data}\n\n`;
    }

    transport: string = 'ws';

    async handleRpc<TParams, TOutput>(
        req: RpcRequest<TParams, TOutput, unknown>,
    ): Promise<TOutput> {
        this.reqCount++;
        const reqId = `${this.reqCount}`;
        await this.setupConnection();
        const msgPayload = this.encodeMsg({
            metadata: {
                id: reqId,
                path: req.path,
                clientVersion: req.clientVersion,
            },
            data: req.params
                ? req.paramValidator.toJsonString(req.params!)
                : undefined,
        });
        if (!this.connection)
            throw new Error("Connection hasn't been established");
        return new Promise((res, rej) => {
            this.messageHandlers.set(reqId, (msg: WebsocketServerMessage) => {
                this.messageHandlers.delete(reqId);
                if (!msg.metadata.success) {
                    rej(ArriErrorInstance.fromJson(msg.data));
                    return;
                }
                const parsedMsg = req.responseValidator.fromJsonString(
                    msg.data,
                );
                res(parsedMsg);
            });
            this.connection!.send(msgPayload);
        });
    }

    handleEventStreamRpc<TParams, TOutput>(
        _req: RpcRequest<TParams, TOutput, unknown>,
        _hooks?: SseOptions<TOutput> | undefined,
    ): EventSourceController {
        throw new Error('Method not implemented.');
    }
    options?: unknown;
}

interface WebsocketClientMessage {
    metadata: {
        id: string;
        path: string;
        clientVersion: string;
    };
    data?: string;
}

interface WebsocketServerMessage {
    metadata: {
        id: string;
        path: string;
        success: boolean;
    };
    data: string;
}

function websocketServerMessageFromString(
    _input: string,
): WebsocketServerMessage {
    // TODO
    throw new Error('Not implemented');
}
