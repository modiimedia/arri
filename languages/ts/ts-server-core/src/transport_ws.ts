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

import { RpcContext } from './context';
import {
    RpcHandler,
    RpcHandlerContext,
    RpcPostHandler,
    RpcPostHandlerContext,
} from './rpc';
import { EventStreamRpcHandler } from './rpc_event_stream';
import { TransportDispatcher } from './transport';
import { WebsocketHttpRegister } from './transport_http';

export interface WsOptions {
    connectionPath?: string;
    connectionMethod?: HTTPMethod;
    debug?: boolean;
    onOpen?: (peer: Peer) => Promise<void> | void;
    onUpgrade?: Hooks['upgrade'];
    onRequest?: (peer: Peer, context: RpcContext) => Promise<void> | void;
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

type WsMiddleware = (
    peer: Peer,
    context: RpcHandlerContext<any>,
) => Promise<void> | void;

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

export class WsDispatcher implements TransportDispatcher {
    transportId: string = 'ws';

    register: WebsocketHttpRegister;

    options: WsOptions;

    hooks: Hooks;

    handlers: Map<string, HandlerItem> = new Map();

    middlewares: WsMiddleware[] = [];

    constructor(register: WebsocketHttpRegister, options?: WsOptions) {
        this.register = register;
        this.options = options ?? {};
        this.hooks = defineHooks({
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

        this.register.registerWebsocketEndpoint(
            this.options.connectionPath ?? '/ws',
            this.options.connectionMethod ?? 'GET',
            this.hooks,
        );
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
        this.handlers.set(name, {
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
        this.handlers.set(name, {
            isEventStream: true,
            validators,
            handler,
        });
    }

    start(): void {}
    stop(): void {
        throw new Error('Method not implemented.');
    }

    private _handleOpen(peer: Peer) {
        if (!this.options.onOpen) return;
        try {
            this.options.onOpen(peer);
        } catch (err) {
            if (!this.options.onError) return;
            this.options.onError(peer, err);
        }
    }

    private async _handleError(peer: Peer, error: WSError) {
        if (!this.options.onError) return;
        await this.options.onError(peer, error);
    }

    private async _handleClose(
        peer: Peer,
        details: { code?: number; reason?: string },
    ) {
        if (!this.options.onClose) return;
        try {
            await this.options.onClose(peer, details);
        } catch (err) {
            if (!this.options.onError) return;
            await this.options.onError(peer, err);
        }
    }

    private async _handleMessage(peer: Peer, message: Message) {
        const result = parseClientMessage(message.text());
        if (!result.success) {
            peer.close();
            return;
        }
        const msg = result.value;
        try {
            const context: RpcContext = {
                rpcName: msg.rpcName,
            };
            if (this.options.onRequest) {
                await this.options.onRequest(peer, context);
            }
            const handler = this.handlers.get(msg.rpcName);
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
            for (const m of this.middlewares) {
                await m(peer, context as any);
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
                    customHeaders: {},
                    body: payload.value,
                };
                this._sendMessage(peer, serverMsg, context as any);
            } else {
                const serverMsg: ServerMessage = {
                    reqId: msg.reqId,
                    contentType: 'application/json',
                    success: true,
                    customHeaders: {},
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
        if (this.options.onBeforeResponse) {
            try {
                await this.options.onBeforeResponse(peer, context);
            } catch (err) {
                if (err instanceof ArriError) {
                    return this._handleArriError(peer, message.reqId, err);
                }
                if (this.options.onError) {
                    try {
                        this.options.onError(peer, err);
                    } catch (_) {
                        // do nothing
                    }
                }
            }
        }
        const payload = encodeServerMessage(message, {
            includeErrorStackTrack: this.options.debug,
        });
        peer.send(payload);
        if (this.options.onAfterResponse) {
            try {
                await this.options.onAfterResponse(peer, context);
            } catch (err) {
                if (!this.options.onError) return;
                try {
                    await this.options.onError(peer, err);
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
        if (this.options.onError) {
            try {
                await this.options.onError(peer, error);
            } catch (_) {
                // do nothing
            }
        }
        peer.send(
            encodeServerMessage(response, {
                includeErrorStackTrack: this.options.debug,
            }),
        );
    }
}
