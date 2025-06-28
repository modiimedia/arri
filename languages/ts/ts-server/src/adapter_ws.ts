import assert from 'node:assert';

import { HttpMethod, RpcDefinition } from '@arrirpc/codegen-utils';
import {
    ArriError,
    encodeServerMessage,
    parseClientMessage,
    ServerMessage,
} from '@arrirpc/core';
import { CompiledValidator, errorMessageFromErrors } from '@arrirpc/schema';
import { defineHooks, Hooks, Message, Peer, WSError } from 'crossws';

import { TransportAdapter, TransportAdapterOptions } from './adapter';
import { WsEndpointRegister } from './adapter_http';
import {
    RpcMiddleware,
    RpcMiddlewareContext,
    RpcOnErrorContext,
} from './middleware';
import { RpcHandler, RpcPostHandler, RpcPostHandlerContext } from './rpc';
import { EventStreamRpcHandler } from './rpc_event_stream';

export interface WsOptions {
    connectionPath: string;
    connectionMethod?: HttpMethod;
    debug?: boolean;
    onOpen?: (peer: Peer) => Promise<void> | void;
    onUpgrade?: Hooks['upgrade'];
    onError?: (peer: Peer, error: unknown) => Promise<void> | void;
    onRequest?: (
        peer: Peer,
        context: RpcMiddlewareContext,
    ) => Promise<void> | void;
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

    private readonly _register: TransportAdapter & WsEndpointRegister;

    // options specific to this websocket
    private readonly _config: WsOptions;

    // options passed to every adapter by the ArriApp
    private _globalOptions: TransportAdapterOptions | undefined;
    private readonly _hooks: Hooks;

    private _handlers: Map<string, HandlerItem> = new Map();
    private _middlewares: RpcMiddleware[] = [];
    private _peers: Map<string, Peer> = new Map();

    constructor(
        register: TransportAdapter & WsEndpointRegister,
        config: WsOptions,
    ) {
        assert(
            config.connectionPath.startsWith('/'),
            'connection path must start with "/"',
        );
        this._register = register;
        this._config = config;
        this._hooks = defineHooks({
            upgrade: (req) => {
                if (this._config.onUpgrade) {
                    return this._config.onUpgrade(req);
                }
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
            this._config.connectionPath,
            this._config.connectionMethod ?? 'get',
            this._hooks,
        );
    }

    setOptions(options: TransportAdapterOptions): void {
        this._globalOptions = options;
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

    async start(): Promise<void> {
        if (!this._register.isStarted) {
            await this._register.start();
        }
    }
    stop(): void {
        for (const peer of this._peers.values()) {
            peer.close();
        }
        this._peers.clear();
    }

    private _heartbeatTimers = new Map<string, NodeJS.Timeout>();
    get heartbeatInterval() {
        return this._globalOptions?.heartbeatInterval ?? 20000;
    }

    private async _handleOpen(peer: Peer) {
        const existing = this._peers.get(peer.id);
        const existingTimer = this._heartbeatTimers.get(peer.id);
        if (existing) existing.close();
        if (existingTimer) clearInterval(existingTimer);
        const connectedMsg = encodeServerMessage({
            type: 'CONNECTION_START',
            heartbeatInterval: this.heartbeatInterval,
        });
        peer.send(connectedMsg);
        this._peers.set(peer.id, peer);
        this._heartbeatTimers.set(
            peer.id,
            setInterval(() => {
                const msg = encodeServerMessage({
                    type: 'HEARTBEAT',
                    heartbeatInterval: this.heartbeatInterval,
                });
                peer.send(msg);
            }, this.heartbeatInterval),
        );
        try {
            await this._config.onOpen?.(peer);
        } catch (err) {
            await this._config.onError?.(peer, err);
        }
    }

    private async _handleError(peer: Peer, error: WSError) {
        if (!this._config.onError) return;
        await this._config.onError(peer, error);
    }

    private async _handleClose(
        peer: Peer,
        details: { code?: number; reason?: string },
    ) {
        this._peers.delete(peer.id);
        clearInterval(this._heartbeatTimers.get(peer.id));
        this._heartbeatTimers.delete(peer.id);
        try {
            await this._config.onClose?.(peer, details);
        } catch (err) {
            await this._config.onError?.(peer, err);
        }
    }

    private async _handleMessage(peer: Peer, message: Message) {
        const reqStart = new Date();
        const result = parseClientMessage(message.text());
        if (!result.success) {
            await this._handleArriError(peer, {
                reqId: undefined,
                error: new ArriError({
                    code: 400,
                    message: `Invalid message: ${result.error}`,
                }),
                rpcName: '',
                reqStart: reqStart,
                transport: 'ws',
                ipAddress: peer.remoteAddress,
                clientVersion: undefined,
                headers: {},
                setResponseHeader: function (
                    _key: string,
                    _val: string,
                ): void {},
                setResponseHeaders: function (
                    _headers: Record<string, string>,
                ): void {},
            });
            peer.close(1003, result.error);
            return;
        }
        const msg = result.value;
        const responseHeaders: Record<string, string> = {};
        const context: RpcMiddlewareContext = {
            reqId: msg.reqId,
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
        try {
            await this._config.onRequest?.(peer, context);
            await this._globalOptions?.onRequest?.(context);
            const handler = this._handlers.get(msg.rpcName);
            if (!handler) {
                const err = new ArriError({
                    code: 404,
                    message: 'Procedure not found',
                });
                (context as any).error = err;
                return this._handleArriError(peer, context as any);
            }
            if (handler.validators.params) {
                const result = handler.validators.params.parse(msg.body);
                if (!result.success) {
                    const err = new ArriError({
                        code: 400,
                        message: errorMessageFromErrors(result.errors),
                        data: result.errors,
                    });
                    (context as any).error = err;
                    return this._handleArriError(peer, context as any);
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
                    const err = new ArriError({
                        code: 500,
                        message: 'Error serializing response',
                        data: payload.errors,
                    });
                    (context as any).error = err;
                    return this._handleArriError(peer, context as any);
                }
                (context as any).response = response;
                const serverMsg: ServerMessage = {
                    type: 'SUCCESS',
                    reqId: msg.reqId,
                    contentType: 'application/json',
                    customHeaders: responseHeaders,
                    body: payload.value,
                };
                return this._sendMessage(peer, serverMsg, context as any);
            }
            const serverMsg: ServerMessage = {
                type: 'SUCCESS',
                reqId: msg.reqId,
                contentType: 'application/json',
                customHeaders: responseHeaders,
                body: undefined,
            };
            return this._sendMessage(peer, serverMsg, context as any);
        } catch (err) {
            (context as any).error = err;
            return this._handleArriError(peer, context as any);
        }
    }

    private async _sendMessage(
        peer: Peer,
        message: ServerMessage,
        context: RpcPostHandlerContext<any, any>,
    ) {
        try {
            await this._globalOptions?.onBeforeResponse?.(context);
            const payload = encodeServerMessage(message, {
                includeErrorStackTrack: this._config.debug,
            });
            peer.send(payload);
            await this._globalOptions?.onAfterResponse?.(context);
        } catch (err) {
            (context as any).error = err;
            await this._handleArriError(peer, context as any);
        }
    }

    private async _handleArriError(peer: Peer, context: RpcOnErrorContext) {
        let err: ArriError;
        if (context.error instanceof ArriError) {
            err = context.error;
        } else if (context.error instanceof Error) {
            err = new ArriError({
                code: 500,
                message: context.error.message,
                data: context.error,
                stackList: context.error.stack?.split('\n'),
            });
        } else {
            err = new ArriError({
                code: 500,
                message: `${context.error}`,
                data: context.error,
            });
        }
        const response: ServerMessage = {
            type: 'FAILURE',
            reqId: context.reqId,
            contentType: 'application/json',
            customHeaders: context.headers as any,
            error: err,
        };
        try {
            await this._config.onError?.(peer, err);
            await this._globalOptions?.onError?.(context);
        } catch (_) {
            // do nothing
        }
        peer.send(
            encodeServerMessage(response, {
                includeErrorStackTrack: this._config.debug,
            }),
        );
    }
}
