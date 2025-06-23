import assert from 'node:assert';

import { RpcDefinition } from '@arrirpc/codegen-utils';
import {
    ArriError,
    encodeServerMessage,
    parseClientMessage,
    ServerMessage,
} from '@arrirpc/core';
import { CompiledValidator, errorMessageFromErrors } from '@arrirpc/schema';
import { defineHooks, Hooks, Message, Peer, WSError } from 'crossws';
import { HTTPMethod } from 'h3';

import { TransportAdapter, TransportAdapterOptions } from './adapter';
import { WsHttpRegister } from './adapter_http';
import { RpcMiddleware, RpcMiddlewareContext } from './middleware';
import { RpcHandler, RpcPostHandler, RpcPostHandlerContext } from './rpc';
import { EventStreamRpcHandler } from './rpc_event_stream';

export interface WsOptions {
    connectionMethod?: HTTPMethod;
    debug?: boolean;
    onOpen?: (peer: Peer) => Promise<void> | void;
    onUpgrade?: Hooks['upgrade'];
    onRequest?: (
        peer: Peer,
        context: RpcMiddlewareContext,
    ) => Promise<void> | void;
    onBeforeResponse?: (
        peer: Peer,
        context: RpcPostHandlerContext<any, any>,
    ) => Promise<void> | void;
    onAfterResponse?: (
        peer: Peer,
        context: RpcPostHandlerContext<any, any>,
    ) => Promise<void> | void;
    onError?: (peer: Peer, error: unknown) => Promise<void> | void;
    onClose?: Hooks['close'];
}

type HandlerItem = RpcHandlerObj | EventStreamRpcHandlerObj;

interface RpcHandlerObj {
    isEventStream: false;
    validators: {
        params?: CompiledValidator<any>;
        response?: CompiledValidator<any>;
    };
    handler: RpcHandler<any, any>;
    postHandler?: RpcPostHandler<any, any>;
}

interface EventStreamRpcHandlerObj {
    isEventStream: true;
    validators: {
        params?: CompiledValidator<any>;
        response?: CompiledValidator<any>;
    };
    handler: EventStreamRpcHandler<any, any>;
}

export class WsAdapter implements TransportAdapter {
    transportId: string = 'ws';

    private readonly _register: WsHttpRegister;
    private readonly _connectionPath: string;
    private readonly _options: WsOptions;
    private _transportOptions: TransportAdapterOptions | undefined;
    private readonly _hooks: Hooks;

    private _handlers: Map<string, HandlerItem> = new Map();
    private _middlewares: RpcMiddleware[] = [];
    private _peers: Map<string, Peer> = new Map();

    constructor(
        dispatcher: WsHttpRegister,
        connectionPath: string,
        options?: WsOptions,
    ) {
        assert(
            connectionPath.startsWith('/'),
            'connection path must start with "/"',
        );
        this._connectionPath = connectionPath;
        this._register = dispatcher;
        this._options = options ?? {};
        this._hooks = defineHooks({
            upgrade: (_) => {
                return {
                    headers: {},
                };
            },
            open: (peer) => this._handleOpen(peer),
            error: (peer, error) => this._handleError(peer, error),
            close: (peer, details) => this._handleClose(peer, details),
            message: (peer, message) => this._handleMessage(peer, message),
        });

        this._register.registerWsEndpoint(
            this._connectionPath,
            this._options.connectionMethod ?? 'GET',
            this._hooks,
        );
    }

    setOptions(options: TransportAdapterOptions): void {
        this._transportOptions = options;
    }

    use(middleware: RpcMiddleware) {
        this._middlewares.push(middleware);
    }

    registerRpc(
        name: string,
        definition: RpcDefinition,
        validators: {
            params?: CompiledValidator<any>;
            response?: CompiledValidator<any>;
        },
        handler: RpcHandler<any, any>,
        postHandler?: RpcPostHandler<any, any>,
    ): void {
        if (!definition.transports.includes(this.transportId)) {
            throw new Error(
                `Procedure "${name}" doesn't support transport: "${this.transportId}"`,
            );
        }
        this._handlers.set(name, {
            isEventStream: false,
            validators,
            handler,
            postHandler,
        });
    }

    registerEventStreamRpc(
        name: string,
        definition: RpcDefinition,
        validators: {
            params?: CompiledValidator<any>;
            response?: CompiledValidator<any>;
        },
        handler: EventStreamRpcHandler<any, any>,
    ): void {
        if (!definition.transports.includes(this.transportId)) {
            throw new Error(
                `Procedure "${name}" doesn't support transport: "${this.transportId}"`,
            );
        }
        this._handlers.set(name, {
            isEventStream: true,
            validators,
            handler,
        });
    }

    start(): void {}
    stop(): void {
        for (const peer of this._peers.values()) {
            peer.close();
        }
        this._peers.clear();
    }

    private _handleOpen(peer: Peer) {
        const existing = this._peers.get(peer.id);
        if (existing) existing.close();
        this._peers.set(peer.id, peer);
        if (!this._options.onOpen) return;
        try {
            this._options.onOpen(peer);
        } catch (err) {
            if (!this._options.onError) return;
            this._options.onError(peer, err);
        }
    }

    private async _handleError(peer: Peer, error: WSError) {
        if (!this._options.onError) return;
        await this._options.onError(peer, error);
    }

    private async _handleClose(
        peer: Peer,
        details: { code?: number; reason?: string },
    ) {
        this._peers.delete(peer.id);
        if (!this._options.onClose) return;
        try {
            await this._options.onClose(peer, details);
        } catch (err) {
            if (!this._options.onError) return;
            await this._options.onError(peer, err);
        }
    }

    private async _handleMessage(peer: Peer, message: Message) {
        const reqStart = new Date();
        const result = parseClientMessage(message.text());
        if (!result.success) {
            await this._handleArriError(
                peer,
                undefined,
                new ArriError({
                    code: 400,
                    message: result.error,
                }),
            );
            peer.close(1003, result.error);
            return;
        }
        const msg = result.value;
        try {
            const responseHeaders: Record<string, string> = {};
            const context: RpcMiddlewareContext = {
                rpcName: msg.rpcName,
                reqStart: reqStart,
                ipAddress: peer.remoteAddress,
                transport: this.transportId,
                clientVersion: msg.clientVersion,
                headers: result.value.customHeaders,
                setResponseHeader: (key, val) => {
                    responseHeaders[key] = val;
                },
                setResponseHeaders: (headers) => {
                    for (const [key, val] of Object.entries(headers)) {
                        responseHeaders[key] = val;
                    }
                },
            };
            if (this._options.onRequest) {
                await this._options.onRequest(peer, context);
            }
            const handler = this._handlers.get(msg.rpcName);
            if (!handler) {
                return this._handleArriError(
                    peer,
                    msg.reqId,
                    new ArriError({
                        code: 404,
                        message: 'Procedure not found',
                    }),
                );
            }
            if (handler.validators.params) {
                const result = handler.validators.params.parse(msg.body);
                if (!result.success) {
                    return this._handleArriError(
                        peer,
                        msg.reqId,
                        new ArriError({
                            code: 400,
                            message: errorMessageFromErrors(result.errors),
                            data: result.errors,
                        }),
                    );
                }
                (context as any).params = result.value;
            }
            for (const m of this._middlewares) {
                await m(context);
            }
            if (handler.isEventStream) {
                throw new Error('Not implemented');
            }
            const response = await handler.handler(context as any);
            if (handler.validators.response) {
                const payload = handler.validators.response.serialize(response);
                if (!payload.success) {
                    return this._handleArriError(
                        peer,
                        msg.reqId,
                        new ArriError({
                            code: 500,
                            message: 'Error serializing response',
                            data: payload.errors,
                        }),
                    );
                }
                (context as any).response = response;
                const serverMsg: ServerMessage = {
                    reqId: msg.reqId,
                    contentType: 'application/json',
                    success: true,
                    customHeaders: responseHeaders,
                    body: payload.value,
                };
                this._sendMessage(peer, serverMsg, context as any);
            } else {
                const serverMsg: ServerMessage = {
                    reqId: msg.reqId,
                    contentType: 'application/json',
                    success: true,
                    customHeaders: responseHeaders,
                    body: undefined,
                };
                this._sendMessage(peer, serverMsg, context as any);
            }
            if (handler.postHandler) {
                await handler.postHandler(context as any);
            }
        } catch (err) {
            if (err instanceof ArriError) {
                return this._handleArriError(peer, msg.reqId, err);
            }
            if (err instanceof Error) {
                return this._handleArriError(
                    peer,
                    msg.reqId,
                    new ArriError({
                        code: 500,
                        message: err.message,
                        data: err,
                        stackList: err.stack?.split('\n'),
                    }),
                );
            }
            return this._handleArriError(
                peer,
                msg.reqId,
                new ArriError({
                    code: 500,
                    message: `${err}`,
                    data: err,
                }),
            );
        }
    }

    private async _sendMessage(
        peer: Peer,
        message: ServerMessage,
        context: RpcPostHandlerContext<any, any>,
    ) {
        if (this._options.onBeforeResponse) {
            try {
                await this._options.onBeforeResponse(peer, context);
            } catch (err) {
                if (err instanceof ArriError) {
                    return this._handleArriError(peer, message.reqId, err);
                }
                if (this._options.onError) {
                    try {
                        this._options.onError(peer, err);
                    } catch (_) {
                        // do nothing
                    }
                }
            }
        }
        const payload = encodeServerMessage(message, {
            includeErrorStackTrack: this._options.debug,
        });
        peer.send(payload);
        if (this._options.onAfterResponse) {
            try {
                await this._options.onAfterResponse(peer, context);
            } catch (err) {
                if (!this._options.onError) return;
                try {
                    await this._options.onError(peer, err);
                } catch (_) {
                    // do nothing
                }
            }
        }
    }

    private async _handleArriError(
        peer: Peer,
        reqId: string | undefined,
        error: ArriError,
    ) {
        const response: ServerMessage = {
            success: false,
            reqId: reqId,
            contentType: 'application/json',
            customHeaders: {},
            error: error,
        };
        if (this._options.onError) {
            try {
                await this._options.onError(peer, error);
            } catch (_) {
                // do nothing
            }
        }
        peer.send(
            encodeServerMessage(response, {
                includeErrorStackTrack: this._options.debug,
            }),
        );
    }
}
