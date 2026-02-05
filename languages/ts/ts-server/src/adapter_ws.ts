import assert from 'node:assert';

import { HttpMethod, RpcDefinition } from '@arrirpc/codegen-utils';
import {
    ArriError,
    encodeMessage,
    parseMessage,
    Message,
    StreamCancelMessage,
} from '@arrirpc/core';
import { CompiledValidator, errorMessageFromErrors } from '@arrirpc/schema';
import * as ws from 'crossws';

import {
    RpcValidators,
    TransportAdapter,
    TransportAdapterOptions,
} from './adapter';
import { WsEndpointRegister } from './adapter_http';
import {
    RpcMiddleware,
    RpcMiddlewareContext,
    RpcOnErrorContext,
} from './middleware';
import { RpcHandler, RpcPostHandler, RpcPostHandlerContext } from './rpc';
import {
    OutputStreamRpcHandler,
    RpcOutputStreamConnection,
    StreamDispatcher,
} from './rpc_output_stream';

export interface WsOptions {
    connectionPath: string;
    connectionMethod?: HttpMethod;
    debug?: boolean;
    onOpen?: (peer: ws.Peer) => Promise<void> | void;
    onUpgrade?: ws.Hooks['upgrade'];
    onError?: (peer: ws.Peer, error: unknown) => Promise<void> | void;
    onRequest?: (
        peer: ws.Peer,
        context: RpcMiddlewareContext,
    ) => Promise<void> | void;
    onClose?: ws.Hooks['close'];
}

type HandlerItem = RpcHandlerObj | EventStreamRpcHandlerObj;

interface RpcHandlerObj {
    isEventStream: false;
    validators: RpcValidators;
    handler: RpcHandler<any, any>;
    postHandler?: RpcPostHandler<any, any>;
}

interface EventStreamRpcHandlerObj {
    isEventStream: true;
    validators: RpcValidators;
    handler: OutputStreamRpcHandler<any, any>;
}

export class WsAdapter implements TransportAdapter {
    transportId: string = 'ws';

    private readonly _register: TransportAdapter & WsEndpointRegister;

    // options specific to this websocket
    private readonly _config: WsOptions;

    // options passed to every adapter by the ArriApp
    private _globalOptions: TransportAdapterOptions | undefined;
    private readonly _hooks: ws.Hooks;

    private _handlers: Map<string, HandlerItem> = new Map();

    private _middlewares: RpcMiddleware[] = [];
    private _peers: Map<string, ws.Peer> = new Map();
    private _peerOutputStreams: Record<
        string,
        Record<string, RpcOutputStreamConnection<any>>
    > = {};

    get peers() {
        return this._peers;
    }

    get outputStreams() {
        return this._peerOutputStreams;
    }

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
        this._hooks = ws.defineHooks({
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
            input?: CompiledValidator<any>;
            output?: CompiledValidator<any>;
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
        validators: RpcValidators,
        handler: OutputStreamRpcHandler<any, any>,
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
        // cleanup timers
        for (const timer of this._heartbeatTimers.values()) {
            clearInterval(timer);
        }
        this._heartbeatTimers.clear();

        // disconnect peers
        for (const peer of this._peers.values()) {
            peer.close(1001);
            const es = this._peerOutputStreams[peer.id];
            if (es) delete this._peerOutputStreams[peer.id];
        }
        this._peers.clear();
    }

    private _heartbeatTimers = new Map<string, NodeJS.Timeout>();
    get heartbeatInterval() {
        return this._globalOptions?.heartbeatInterval ?? 20000;
    }

    private async _handleOpen(peer: ws.Peer) {
        const existing = this._peers.get(peer.id);
        const existingTimer = this._heartbeatTimers.get(peer.id);
        if (existing) existing.close(1012);
        if (existingTimer) clearInterval(existingTimer);
        const connectedMsg = encodeMessage({
            type: 'CONNECTION_START',
            heartbeatInterval: this.heartbeatInterval,
        });
        peer.send(connectedMsg);
        this._peers.set(peer.id, peer);
        this._heartbeatTimers.set(
            peer.id,
            setInterval(() => {
                const msg = encodeMessage({
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

    private async _handleError(peer: ws.Peer, error: ws.WSError) {
        if (!this._config.onError) return;
        await this._config.onError(peer, error);
    }

    private async _handleClose(
        peer: ws.Peer,
        details: { code?: number; reason?: string },
    ) {
        this._peers.delete(peer.id);
        const eventStreams = this._peerOutputStreams[peer.id];
        if (eventStreams) {
            for (const stream of Object.values(eventStreams)) {
                stream.close();
            }
            delete this._peerOutputStreams[peer.id];
        }
        clearInterval(this._heartbeatTimers.get(peer.id));
        this._heartbeatTimers.delete(peer.id);
        try {
            await this._config.onClose?.(peer, details);
        } catch (err) {
            await this._config.onError?.(peer, err);
        }
    }

    private async _handleMessage(peer: ws.Peer, message: ws.Message) {
        const reqStart = new Date();
        const result = parseMessage(message.text());
        if (!result.ok) {
            await this._handleArriError(peer, {
                reqId: undefined,
                error: new ArriError({
                    code: 400,
                    message: `Invalid message: ${result.error}`,
                }),
                rpcName: '',
                reqStart: reqStart,
                transport: 'ws',
                remoteAddress: peer.remoteAddress,
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
        if (
            msg.type !== 'INVOCATION' &&
            msg.type !== 'STREAM_DATA' &&
            msg.type !== 'STREAM_CANCEL' &&
            msg.type !== 'STREAM_END'
        ) {
            await this._handleArriError(peer, {
                reqId: undefined,
                error: new ArriError({
                    code: 400,
                    message: `Client cannot send a ${msg.type} message`,
                }),
                rpcName: '',
                reqStart: reqStart,
                transport: 'ws',
                remoteAddress: peer.remoteAddress,
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
            peer.close(1003, `Client cannot send a ${msg.type} message`);
            return;
        }
        const responseHeaders: Record<string, string> = {};
        const context: RpcMiddlewareContext = {
            reqId: msg.reqId,
            rpcName: (msg as any).rpcName ?? '',
            reqStart: reqStart,
            remoteAddress: peer.remoteAddress,
            transport: this.transportId,
            clientVersion: (msg as any).clientVersion,
            headers: (msg as any).customHeaders ?? {},
            setResponseHeader: (key, val) => {
                responseHeaders[key] = val;
            },
            setResponseHeaders: (headers) => {
                for (const [key, val] of Object.entries(headers)) {
                    responseHeaders[key] = val;
                }
            },
        };
        if (msg.type === 'STREAM_CANCEL') {
            return this._handleStreamCancelMessage(peer, context, msg);
        }
        if (msg.type !== 'INVOCATION') {
            console.log('NOT YET SUPPORTED FOR CLIENT ', msg.type);
            return;
        }
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
            if (handler.validators.input) {
                const result = handler.validators.input.parse(msg.body);
                if (!result.success) {
                    const err = new ArriError({
                        code: 400,
                        message: errorMessageFromErrors(result.errors),
                        body: { data: result.errors },
                    });
                    (context as any).error = err;
                    return this._handleArriError(peer, context as any);
                }
                (context as any).input = result.value;
            }
            for (const m of this._middlewares) {
                await m(context);
            }
            if (handler.isEventStream) {
                const existing =
                    this._peerOutputStreams?.[peer.id]?.[context.reqId!];
                if (existing) existing.close({ notifyClients: true });
                const eventStream = new RpcOutputStreamConnection(
                    new WsStream(peer),
                    handler.validators?.output,
                    this._globalOptions?.heartbeatInterval ?? 20000,
                    this._globalOptions?.heartbeatEnabled ?? true,
                    context.reqId ?? '',
                );
                if (!this._peerOutputStreams[peer.id])
                    this._peerOutputStreams[peer.id] = {};
                this._peerOutputStreams[peer.id]![context.reqId!] = eventStream;
                (context as any).stream = eventStream;
                await handler.handler(context as any);
                if (!eventStream.isActive) eventStream.start();
                return;
            }
            const output = await handler.handler(context as any);
            if (handler.validators.output) {
                const payload = handler.validators.output.serialize(output);
                if (!payload.success) {
                    const err = new ArriError({
                        code: 500,
                        message: 'Error serializing response',
                        body: { data: payload.errors },
                    });
                    (context as any).error = err;
                    return this._handleArriError(peer, context as any);
                }
                (context as any).output = output;
                const serverMsg: Message = {
                    type: 'OK',
                    reqId: msg.reqId,
                    contentType: 'application/json',
                    customHeaders: responseHeaders,
                    heartbeatInterval: undefined,
                    body: payload.value,
                };
                return this._sendMessage(peer, serverMsg, context as any);
            }
            const serverMsg: Message = {
                type: 'OK',
                reqId: msg.reqId,
                contentType: 'application/json',
                customHeaders: responseHeaders,
                heartbeatInterval: undefined,
                body: undefined,
            };
            return this._sendMessage(peer, serverMsg, context as any);
        } catch (err) {
            (context as any).error = err;
            return this._handleArriError(peer, context as any);
        }
    }

    private async _handleStreamCancelMessage(
        peer: ws.Peer,
        context: RpcMiddlewareContext,
        message: StreamCancelMessage,
    ) {
        try {
            const esConnection =
                this._peerOutputStreams[peer.id]?.[context.reqId ?? ''];
            if (!esConnection) return;
            await esConnection.close({
                reason: 'closed by client',
                notifyClients: true,
            });
            return;
        } catch (err) {
            (context as any).error = err;
            this._handleArriError(peer, context as any);
        }
    }

    private async _sendMessage(
        peer: ws.Peer,
        message: Message,
        context: RpcPostHandlerContext<any, any>,
    ) {
        try {
            await this._globalOptions?.onBeforeResponse?.(context);
            const payload = encodeMessage(message);
            peer.send(payload);
            await this._globalOptions?.onAfterResponse?.(context);
        } catch (err) {
            (context as any).error = err;
            await this._handleArriError(peer, context as any);
        }
    }

    private async _handleArriError(peer: ws.Peer, context: RpcOnErrorContext) {
        let err: ArriError;
        if (context.error instanceof ArriError) {
            err = context.error;
        } else if (context.error instanceof Error) {
            err = new ArriError({
                code: 500,
                message: context.error.message,
                body: {
                    data: context.error,
                    trace: context.error.stack?.split('\n'),
                },
            });
        } else {
            err = new ArriError({
                code: 500,
                message: `${context.error}`,
                body: {
                    data: context.error,
                },
            });
        }
        const output: Message = {
            type: 'ERROR',
            reqId: context.reqId ?? '',
            contentType: 'application/json',
            customHeaders: context.headers as any,
            errorCode: err.code,
            errorMessage: err.message,
            body:
                (this._config.debug && err.trace) || err.data
                    ? JSON.stringify({
                          data: err.data,
                          trace: this._config.debug ? err.trace : undefined,
                      })
                    : undefined,
        };
        try {
            await this._config.onError?.(peer, err);
            await this._globalOptions?.onError?.(context);
        } catch (_) {
            // do nothing
        }
        peer.send(encodeMessage(output));
    }
}

export class WsStream implements StreamDispatcher<string> {
    peer: ws.Peer;
    private _isActive = false;
    private _isPaused = false;
    private _unsentMessages: Message<string>[] = [];

    constructor(peer: ws.Peer) {
        this.peer = peer;
    }
    lastMessageId?: string | undefined;

    pause(): void {
        this._isPaused = true;
    }
    async resume(): Promise<void> {
        this._isPaused = false;
        if (this._unsentMessages.length) {
            await this.push(this._unsentMessages);
            this._unsentMessages = [];
        }
    }

    get isActive(): boolean {
        return this._isActive;
    }
    get isPaused(): boolean {
        return this._isPaused;
    }

    start(): void {
        if (this._unsentMessages.length) {
            this._isPaused = false;
            this.push(this._unsentMessages);
            this._unsentMessages = [];
        }
        this._isActive = true;
    }
    push(msg: Message): Promise<void> | void;
    push(msgs: Message[]): Promise<void> | void;
    push(msg: Message | Message[]): Promise<void> | void {
        if (Array.isArray(msg)) {
            if (this.isPaused || !this.isActive) {
                this._unsentMessages.concat(msg);
                return;
            }
            for (const m of msg) {
                const encoded = encodeMessage(m);
                this.peer.send(encoded);
            }
            return;
        }
        if (this.isPaused || !this.isActive) {
            this._unsentMessages.push(msg);
            return;
        }
        const encoded = encodeMessage(msg);
        this.peer.send(encoded);
    }

    close(): void {
        this._closedCb?.();
        for (const fn of this._onClosedListeners) {
            fn();
        }
        this._isActive = false;
    }

    private _closedCb: (() => void) | undefined;
    private _onClosedListeners: (() => void)[] = [];

    onClosed(cb: () => void): void {
        this._closedCb = cb;
    }

    addOnClosedListener(cb: () => void): void {
        this._onClosedListeners.push(cb);
    }

    removeOnClosedListener(cb: () => void): void {
        const index = this._onClosedListeners.findIndex((val) => val === cb);
        if (index < 0) return;
        this._onClosedListeners.splice(index, 1);
    }
}
