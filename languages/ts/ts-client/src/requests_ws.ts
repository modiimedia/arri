import { EventSourceController } from 'event-source-plus';
import { IncomingMessage } from 'http';
import ws from 'websocket';

import { ArriErrorInstance } from './errors';
import {
    getHeaders,
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
                            parsedMsg = decodeWsRpcRequest(msg.utf8Data);
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
        const msgPayload = encodeWsRpcRequest(
            req,
            validator.params.toJsonString,
        );
        if (!this.connection)
            throw new Error("Connection hasn't been established");
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

export async function encodeWsRpcRequest<TParams>(
    req: RpcRequest<TParams>,
    paramEncoder: (input: TParams) => string,
) {
    if (!req.reqId) {
        throw new Error(`reqId is required for transporting over websockets`);
    }
    let result = `procedure: ${req.procedure}\npath: ${req.path}\nclient-version: ${req.clientVersion ?? ''}\nreq-id: ${req.reqId ?? ''}`;
    if (typeof req.customHeaders !== 'undefined') {
        const headers = await getHeaders(req.customHeaders);
        for (const [key, value] of Object.entries(headers)) {
            result += `\n${key}: ${value}`;
        }
    }
    result += '\n\n';
    if (req.data) {
        result += paramEncoder(req.data);
    }
    return result;
}

function decodeWsRpcRequest(input: string): RpcRawResponse {
    let reqId: string | undefined;
    let procedure: string = '';
    let path: string = '';
    let success: boolean = false;
    let method: string | undefined;

    let previousChar = '';
    let currentLine = '';
    let bodyIndex = -1;

    function handleParseLine() {
        const parseResult = parseLine(currentLine);
        switch (parseResult.type) {
            case 'invalid':
                break;
            case 'method':
                method = parseResult.value;
                break;
            case 'path':
                path = parseResult.value;
                break;
            case 'procedure':
                procedure = parseResult.value;
                break;
            case 'reqId':
                reqId = parseResult.value;
                break;
            case 'success':
                success =
                    parseResult.value === 'true' ||
                    parseResult.value === 'TRUE';
                break;
            default:
                parseResult satisfies never;
                break;
        }
    }
    for (let i = 0; i < input.length; i++) {
        const char = input[i]!;
        if (char === '\n') {
            handleParseLine();
            if (previousChar === '\n') {
                bodyIndex = i + 1;
                break;
            }
            previousChar = char;
            continue;
        }
        currentLine += char;
        previousChar = char;
    }
    const result: RpcRawResponse = {
        procedure: procedure,
        reqId: reqId,
        path: path,
        method: method,
        success: success,
    };
    if (!input[bodyIndex]) return result;
    result.data = input.substring(bodyIndex);
    return result;
}

function parseLine(input: string):
    | {
          type: 'procedure' | 'reqId' | 'path' | 'method' | 'success';
          value: string;
      }
    | { type: 'invalid' } {
    if (input.startsWith('procedure:')) {
        return {
            type: 'procedure',
            value: input.substring(10).trim(),
        };
    }
    if (input.startsWith('req-id:')) {
        return {
            type: 'reqId',
            value: input.substring(7).trim(),
        };
    }
    if (input.startsWith('path:')) {
        return {
            type: 'path',
            value: input.substring(5).trim(),
        };
    }
    if (input.startsWith('method:')) {
        return {
            type: 'method',
            value: input.substring(7).trim(),
        };
    }
    if (input.startsWith('success:')) {
        return {
            type: 'success',
            value: input.substring(8).trim(),
        };
    }
    return {
        type: 'invalid',
    };
}
