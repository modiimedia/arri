import {
    ArriErrorPayload,
    ArriHeaders,
    ClientMessage,
    Err,
    InvocationMessage,
    Ok,
    Result,
} from '@arrirpc/core';
import {
    a,
    ASchema,
    errorMessageFromErrors,
    ValueError,
} from '@arrirpc/schema';

import { RpcCall } from './context';
import { Middleware } from './middleware';
import { Rpc } from './rpc';
import { TransportAdapter } from './transport';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export class ArriApp {
    procedures: Map<string, Rpc<any, any>> = new Map();
    middlewares: Middleware[] = [];
    transports: Map<string, TransportAdapter> = new Map();

    use(middleware: Middleware): void;
    use(transport: TransportAdapter): void;
    use(input: Middleware | TransportAdapter) {
        if (input instanceof TransportAdapter) {
            this.transports.set(input.name, input);
            return;
        }
        if (typeof input === 'function') {
            this.middlewares.push(input as any);
            return;
        }
        // todo
    }

    private parseBody(
        schema: ASchema<any> | undefined,
        contentType: string | undefined,
        body: Uint8Array | undefined,
    ): Result<any, ValueError[]> {
        if (typeof schema !== 'undefined') {
            switch (contentType) {
                case 'application/json':
                case undefined: {
                    const textBody =
                        typeof body !== 'undefined'
                            ? textDecoder.decode(body)
                            : undefined;
                    const result = a.parse(schema, textBody);
                    return result;
                }
                default: {
                    return Err([
                        {
                            instancePath: '',
                            schemaPath: '',
                            message: `Unsupported content type: ${contentType}`,
                        },
                    ]);
                }
            }
        }
        return Ok(undefined);
    }

    private serializeBody(
        schema: ASchema<any> | undefined,
        contentType: string | undefined,
        content: any,
    ): Result<Uint8Array, ValueError[]> {
        if (typeof schema !== 'undefined') {
            switch (contentType) {
                case 'application/json':
                case undefined: {
                    const result = a.serialize(schema, content);
                    return result.map((val) => textEncoder.encode(val));
                }
                default:
                    return Err([
                        {
                            message: `unsupported content type "${contentType}"`,
                            instancePath: '',
                        },
                    ]);
            }
        }
        return Ok(new Uint8Array());
    }

    private serializeError(
        contentType: string | undefined,
        error: ArriErrorPayload,
    ): Uint8Array {
        switch (contentType) {
            case 'application/json':
            case undefined:
                return textEncoder.encode(JSON.stringify(error));
            default: {
                const err: ArriErrorPayload = {
                    code: 'UNSUPPORTED_CONTENT_TYPE',
                    message: `"${contentType}" is not a supported content type`,
                    trace: new Error().stack?.split('\n'),
                };
                return textEncoder.encode(JSON.stringify(err));
            }
        }
    }

    private async handleInvocation(
        transport: TransportAdapter,
        msg: InvocationMessage,
    ) {
        const abortController = new AbortController();
        const call: RpcCall = {
            transport: transport.name,
            rpcName: msg.rpcName,
            clientVersion: msg.clientVersion,
            headers: msg.headers,
            signal: abortController.signal,
            contentType: msg.contentType ?? 'application/json',
            accept: msg.accept,
            meta: {},
        };
        const rpc = this.procedures.get(msg.rpcName);
        if (!rpc) {
            const errorPayload: ArriErrorPayload = {
                code: 'PROCEDURE_NOT_FOUND',
                message: 'procedure not found',
                trace: new Error().stack?.split('\n'),
            };
            await transport.send({
                type: 'ERROR',
                reqId: msg.reqId,
                headers: new ArriHeaders(),
                body: textEncoder.encode(JSON.stringify(errorPayload)),
            });
            return;
        }
        call.meta = rpc.meta ?? {};
        switch (rpc.type) {
            case 'unary': {
                try {
                    const input = this.parseBody(
                        rpc.input,
                        msg.contentType,
                        msg.body,
                    );
                    if (!input.ok) {
                        const errorBody: ArriErrorPayload = {
                            code: 'INVALID_INPUT',
                            type: 'invalid_input',
                            data: input.error,
                            message: errorMessageFromErrors(input.error),
                        };
                        await transport.send({
                            type: 'ERROR',
                            reqId: msg.reqId,
                            headers: new ArriHeaders(),
                            body: textEncoder.encode(JSON.stringify(errorBody)),
                        });
                        return;
                    }
                    const output = await rpc.handler(input, call);
                    const payload = this.serializeBody(
                        rpc.input,
                        call.contentType,
                        output,
                    );
                    switch (payload.ok) {
                        case true:
                            await transport.send({
                                type: 'OK',
                                reqId: msg.reqId,
                                contentType: call.contentType,
                                headers: new ArriHeaders(),
                                body: payload.value,
                            });
                            return;
                        case false: {
                            const errorBody = this.serializeError(
                                call.contentType,
                                {
                                    code: 'INVALID_RESPONSE',
                                    type: 'invalid_response',
                                    data: payload.error,
                                    message: errorMessageFromErrors(
                                        payload.error,
                                    ),
                                },
                            );
                            await transport.send({
                                type: 'ERROR',
                                reqId: msg.reqId,
                                contentType: call.contentType,
                                headers: new ArriHeaders(),
                                body: errorBody,
                            });
                            return;
                        }
                        default:
                            payload satisfies never;
                            return;
                    }
                } catch (_) {
                    // todo
                } finally {
                    // todo
                }
                break;
            }
            case 'in_stream': {
                break;
            }
            case 'out_stream': {
                break;
            }
            case 'duplex_stream': {
                break;
            }
            default:
                rpc satisfies never;
        }
    }

    async input(transportId: string, msg: ClientMessage) {
        const transport = this.transports.get(transportId);
        if (!transport) return; // handle this somehow
        switch (msg.type) {
            case 'INVOCATION': {
                return this.handleInvocation(transport, msg);
            }
            case 'STREAM_START':
                break;
            case 'STREAM_DATA':
                break;
            case 'STREAM_END':
                break;
            case 'CANCEL':
                break;
            default: {
                msg satisfies never;
            }
        }
    }
}
