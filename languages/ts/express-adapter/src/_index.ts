import { Server } from 'node:http';

import {
    ArriError,
    serializeArriError,
    ServerEventStreamMessage,
} from '@arrirpc/core';
import { encodeServerEventStreamMessageToSseMessage } from '@arrirpc/core';
import { errorMessageFromErrors, Result } from '@arrirpc/schema';
import {
    EventStreamDispatcher,
    EventStreamRpcHandler,
    HttpEndpointRegister,
    RpcEventStreamConnection,
    RpcHandler,
    RpcMiddleware,
    RpcMiddlewareContext,
    RpcOnErrorContext,
    RpcPostHandler,
    RpcValidators,
    TransportAdapter,
    TransportAdapterOptions,
    WsEndpointRegister,
} from '@arrirpc/server';
import { RouterMethod, WebHandler } from '@arrirpc/server/http';
import { Hooks } from '@arrirpc/server/ws';
import crossws, { NodeAdapter } from '@arrirpc/server/ws/adapters/node';
import { RpcDefinition } from '@arrirpc/type-defs';
import {
    Express,
    Request as ExpressRequest,
    Response as ExpressResponse,
} from 'express';
import express from 'express';

export interface ExpressAdapterOptions {
    app?: Express;
    port?: number;
    debug?: boolean;
    onRequest?: (
        req: ExpressRequest,
        context: RpcMiddlewareContext,
    ) => Promise<void> | void;
}

export class ExpressAdapter
    implements TransportAdapter, HttpEndpointRegister, WsEndpointRegister
{
    transportId: string = 'http';

    private globalOptions: TransportAdapterOptions | undefined;

    constructor(options?: ExpressAdapterOptions) {
        this._app = options?.app ?? express();
        this._port = options?.port ?? 3000;
        this._debug = options?.debug ?? false;
        this._onRequest = options?.onRequest;
    }
    get isStarted(): boolean {
        throw new Error('Method not implemented.');
    }

    setOptions(options: TransportAdapterOptions): void {
        this.globalOptions = options;
    }

    private _middlewares: RpcMiddleware[] = [];

    private readonly _app: Express;
    private readonly _port: number;
    private readonly _debug: boolean;

    private readonly _onRequest: ExpressAdapterOptions['onRequest'];

    private _listener: Server | undefined;

    use(middleware: RpcMiddleware) {
        this._middlewares.push(middleware);
    }

    private _getHeaders(req: ExpressRequest): Record<string, string> {
        const result: Record<string, string> = {};
        for (const [key, val] of Object.entries(req.headers)) {
            if (Array.isArray(val)) {
                result[key] = val.join(',');
                continue;
            }
            if (typeof val === 'string') {
                result[key] = val;
                continue;
            }
        }
        return result;
    }

    registerRpc(
        name: string,
        procedure: RpcDefinition,
        validators: RpcValidators,
        handler: RpcHandler<any, any>,
        postHandler?: RpcPostHandler,
    ) {
        let getParams: ((req: ExpressRequest) => Result<any>) | undefined;
        if (validators.params) {
            switch (procedure.method) {
                case 'get':
                    getParams = (req: ExpressRequest) => {
                        return validators.params!.coerce(req.query);
                    };
                    break;
                default:
                    getParams = (req: ExpressRequest) => {
                        return validators.params!.parse(req.body);
                    };
            }
        }
        const routeHandler = async (
            req: ExpressRequest,
            res: ExpressResponse,
        ) => {
            const reqStart = new Date();
            const clientVersion = req.headers['client-version'];
            let reqId = req.headers['req-id'];
            if (Array.isArray(reqId)) {
                reqId = reqId.join(',');
            }
            const context: RpcMiddlewareContext = {
                reqId: reqId,
                rpcName: name,
                reqStart: reqStart,
                transport: this.transportId,
                headers: this._getHeaders(req),
                remoteAddress: req.ip,
                clientVersion:
                    typeof clientVersion === 'string'
                        ? clientVersion
                        : undefined,
                setResponseHeader: function (key: string, val: string): void {
                    res.setHeader(key, val);
                },
                setResponseHeaders: function (
                    headers: Record<string, string>,
                ): void {
                    for (const [key, val] of Object.entries(headers)) {
                        res.setHeader(key, val);
                    }
                },
            };
            try {
                await this._onRequest?.(req, context);
                await this.globalOptions?.onRequest?.(context);
                if (typeof getParams !== 'undefined') {
                    const result = getParams(req);
                    if (!result.success) {
                        return this._sendError(
                            res,
                            new ArriError({
                                code: 400,
                                message: errorMessageFromErrors(result.errors),
                                data: result.errors,
                            }),
                        );
                    }
                    context.params = result.value;
                }
                for (const m of this._middlewares) {
                    await m(context);
                }
                const response = await handler(context as any);
                (context as any).response = response;
                await this.globalOptions?.onBeforeResponse?.(context as any);
                if (validators.response) {
                    const payload = validators.response.serialize(response);
                    if (!payload.success) {
                        return this._sendError(
                            res,
                            new ArriError({
                                code: 500,
                                message: 'Error serializing response',
                                data: payload.errors,
                            }),
                        );
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).end(payload.value);
                } else {
                    res.status(200).end('');
                }
                await this.globalOptions?.onAfterResponse?.(context as any);
                if (postHandler) {
                    await postHandler(context as any);
                }
            } catch (err) {
                (context as any).error = err;
                return this._handleError(res, context as any);
            }
        };
        switch (procedure.method) {
            case 'get':
                this._app.get(procedure.path, routeHandler);
                break;
            case 'delete':
                this._app.delete(procedure.path, routeHandler);
                break;
            case 'patch':
                this._app.patch(procedure.path, routeHandler);
                break;
            case 'put':
                this._app.put(procedure.path, routeHandler);
                break;
            case 'post':
            case undefined:
                this._app.post(procedure.path, routeHandler);
                break;
            default:
                procedure.method satisfies never;
                throw new Error('Method not implemented.');
        }
    }

    registerEventStreamRpc(
        name: string,
        definition: RpcDefinition,
        validators: RpcValidators,
        handler: EventStreamRpcHandler<any, any>,
    ): void {
        let getParams: (req: ExpressRequest) => Result<any>;
        if (validators.params) {
            switch (definition.method) {
                case 'get':
                    getParams = (req: ExpressRequest) => {
                        return validators.params!.coerce(req.query);
                    };
                    break;
                default:
                    getParams = (req: ExpressRequest) => {
                        return validators.params!.parse(req.body);
                    };
            }
        }
        const reqHandler = async (
            req: ExpressRequest,
            res: ExpressResponse,
        ) => {
            const reqStart = new Date();
            const clientVersion = req.headers['client-version'];
            const context: RpcMiddlewareContext = {
                reqId: req.header('req-id'),
                rpcName: name,
                reqStart: reqStart,
                transport: this.transportId,
                remoteAddress: req.ip,
                clientVersion:
                    typeof clientVersion === 'string'
                        ? clientVersion
                        : undefined,
                headers: this._getHeaders(req),
                setResponseHeader: function (key: string, val: string): void {
                    res.setHeader(key, val);
                },
                setResponseHeaders: function (
                    headers: Record<string, string>,
                ): void {
                    for (const [key, val] of Object.entries(headers)) {
                        res.setHeader(key, val);
                    }
                },
            };
            try {
                await this._onRequest?.(req, context);
                await this.globalOptions?.onRequest?.(context);
                if (typeof getParams !== 'undefined') {
                    const result = getParams(req);
                    if (!result.success) {
                        return this._sendError(
                            res,
                            new ArriError({
                                code: 400,
                                message: errorMessageFromErrors(result.errors),
                                data: result.errors,
                            }),
                        );
                    }
                    context.params = result.value;
                }
                for (const m of this._middlewares) {
                    await m(context);
                }
                const eventStream = new RpcEventStreamConnection(
                    new ExpressEventStreamDispatcher({ req, res }),
                    validators.params,
                    this.globalOptions?.heartbeatInterval ?? 20000,
                    this.globalOptions?.heartbeatEnabled ?? true,
                    context.reqId,
                );
                (context as any).stream = eventStream;
                await handler(context as any);
                if (!res.headersSent) {
                    eventStream.send();
                }
            } catch (err) {
                (context as any).error = err;
                return this._handleError(res, context as any);
            }
        };
        switch (definition.method) {
            case 'get':
                this._app.get(definition.path, reqHandler);
                break;
            case 'patch':
                this._app.patch(definition.path, reqHandler);
                break;
            case 'put':
                this._app.put(definition.path, reqHandler);
                break;
            case 'delete':
                this._app.delete(definition.path, reqHandler);
                break;
            case 'post':
            case undefined:
                this._app.post(definition.path, reqHandler);
                break;
            default:
                definition.method satisfies never;
                throw new Error(`Unsupported method: ${definition.method}`);
        }
    }

    registerEndpoint(
        path: string,
        handler: WebHandler,
        method?: RouterMethod | RouterMethod[],
    ): void {
        const register = (method: RouterMethod) => {
            const internalHandler = async (
                req: ExpressRequest,
                res: ExpressResponse,
            ) => {
                try {
                    const body = req.body;
                    const headers = new Headers();
                    for (const [key, val] of Object.keys(req.headers)) {
                        if (!key) continue;
                        if (!val) continue;
                        headers.set(key, val);
                    }
                    const controller = new AbortController();
                    const webRequest = new Request(
                        req.protocol + '://' + req.host + req.path,
                        {
                            method: method.toUpperCase(),
                            headers: headers,
                            body: body,
                            referrerPolicy:
                                (headers.get('Referrer-Policy') as any) ??
                                'strict-origin-when-cross-origin',
                            keepalive: headers.get('Connect') == 'keep-alive',
                            signal: controller.signal,
                        },
                    );
                    const response = await handler(webRequest);
                    res.setHeaders(response.headers);
                    res.status(response.status);
                    if (response.body instanceof ReadableStream) {
                        for await (const chunk of response.body) {
                            res.send(chunk);
                        }
                        res.end();
                        return;
                    }
                    res.end(response.body);
                    return;
                } catch (err) {
                    res.status(500).end(
                        err instanceof Error ? err.message : `${err}`,
                    );
                }
            };
            this.registerRawHandler(path, method, internalHandler);
        };
        if (Array.isArray(method)) {
            for (const m of method) {
                register(m);
            }
            return;
        }
        register(method ?? 'get');
    }

    private registerRawHandler(
        path: string,
        method: RouterMethod,
        handler: (r: ExpressRequest, res: ExpressResponse) => any,
    ) {
        switch (method) {
            case 'get':
                this._app.get(path, handler);
                break;
            case 'connect':
                this._app.connect(path, handler);
                break;
            case 'delete':
                this._app.delete(path, handler);
                break;
            case 'head':
                this._app.head(path, handler);
                break;
            case 'options':
                this._app.options(path, handler);
                break;
            case 'patch':
                this._app.patch(path, handler);
                break;
            case 'post':
                this._app.post(path, handler);
                break;
            case 'put':
                this._app.put(path, handler);
                break;
            case 'trace':
                this._app.trace(path, handler);
                break;
            default:
                method satisfies never;
                break;
        }
    }

    private wsAdapter: NodeAdapter | undefined;

    registerWsEndpoint(
        path: string,
        method: RouterMethod | RouterMethod[],
        hooks: Hooks,
    ): void {
        this.wsAdapter = crossws({ hooks: hooks });
        const handler = async (req: ExpressRequest, res: ExpressResponse) => {
            if (!this.wsAdapter) {
                res.status(500);
                res.end('ws adapter not initialized');
                return;
            }
            if (req.headers.upgrade === 'websocket') {
                this.wsAdapter.handleUpgrade(req, req.socket, Buffer.from([]));
            }
        };

        if (Array.isArray(method)) {
            for (const m of method) {
                this.registerRawHandler(path, m, handler);
            }
            return;
        }
        this.registerRawHandler(path, method, handler);
    }

    private async _handleError(
        res: ExpressResponse,
        context: RpcOnErrorContext,
    ) {
        try {
            await this.globalOptions?.onError?.(context);
        } catch (err) {
            if (err instanceof ArriError) {
                return this._sendError(res, err);
            }
            if (err instanceof Error) {
                return this._sendError(
                    res,
                    new ArriError({
                        code: 500,
                        message: err.message,
                        data: context.error,
                        stackList: this._debug
                            ? err.stack?.split('\n')
                            : undefined,
                    }),
                );
            }
            return this._sendError(
                res,
                new ArriError({
                    code: 500,
                    message: `${err}`,
                    data: err,
                }),
            );
        }
        if (context.error instanceof ArriError) {
            return this._sendError(res, context.error);
        }
        if (context.error instanceof Error) {
            return this._sendError(
                res,
                new ArriError({
                    code: 500,
                    message: context.error.message,
                    data: context.error,
                    stackList: this._debug
                        ? context.error.stack?.split('\n')
                        : undefined,
                }),
            );
        }
        return this._sendError(
            res,
            new ArriError({
                code: 500,
                message: `${context.error}`,
                data: context.error,
            }),
        );
    }

    private _sendError(res: ExpressResponse, error: ArriError) {
        res.setHeader('Content-Type', 'application/json');
        res.status(error.code);
        res.send(serializeArriError(error, this._debug));
    }

    start(): Promise<void> | void {
        this._listener = this._app.listen(this._port, (err) => {
            if (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                return;
            }
            // eslint-disable-next-line no-console
            console.info(`Server running at http://localhost:${this._port}`);
        });
    }
    stop(): Promise<void> | void {
        this._listener?.closeAllConnections();
        this._listener?.close();
        this.wsAdapter?.closeAll();
    }
}

class ExpressEventStreamDispatcher implements EventStreamDispatcher<string> {
    req: ExpressRequest;
    res: ExpressResponse;
    lastEventId?: string | undefined;
    constructor(config: { req: ExpressRequest; res: ExpressResponse }) {
        this.req = config.req;
        this.res = config.res;
    }
    send(): void {
        this.res.status(200);
        this.res.setHeader('content-type', 'text/event-stream');
        this.res.setHeader(
            'cache-control',
            'private, no-cache, no-store, no-transform, must-revalidate, max-age=0',
        );
        this.res.setHeader('x-accel-buffering', 'no');
        if (this.req.httpVersionMajor === 1) {
            this.res.setHeader('connection', 'keep-alive');
        }
        this.res.flushHeaders();
    }
    push(
        msg: ServerEventStreamMessage | ServerEventStreamMessage[],
    ): void | Promise<void> {
        if (Array.isArray(msg)) {
            for (const m of msg) {
                this.res.write(encodeServerEventStreamMessageToSseMessage(m));
            }
            return;
        }
        this.res.write(encodeServerEventStreamMessageToSseMessage(msg));
    }
    close(): void {
        this.res.end();
    }
    onClosed(cb: () => void): void {
        this.res.on('close', cb);
    }
}
