import { Server } from 'node:http';

import { ArriError, serializeArriError } from '@arrirpc/core';
import { errorMessageFromErrors, Result } from '@arrirpc/schema';
import {
    EventStreamDispatcher,
    EventStreamMessage,
    EventStreamRpcHandler,
    RpcEventStreamConnection,
    RpcHandler,
    RpcMiddleware,
    RpcMiddlewareContext,
    RpcOnErrorContext,
    RpcPostHandler,
    RpcPostHandlerContext,
    RpcValidators,
    TransportAdapter,
} from '@arrirpc/server-next';
import { AppDefinition, RpcDefinition } from '@arrirpc/type-defs';
import { Express, Request, Response } from 'express';
import express from 'express';

export interface ExpressAdapterOptions {
    app?: Express;
    port?: number;
    debug?: boolean;
    extendContext?: (
        req: Request,
        context: RpcMiddlewareContext,
    ) => Promise<void> | void;
    onRequest?(
        req: Request,
        context: RpcMiddlewareContext,
    ): Promise<void> | void;
    onBeforeResponse?(
        req: Request,
        context: RpcPostHandlerContext<any, any>,
    ): Promise<void> | void;
    onAfterResponse?(
        req: Request,
        context: RpcPostHandlerContext<any, any>,
    ): Promise<void> | void;
    onError?(req: Request, context: RpcOnErrorContext): Promise<void> | void;
}

export class ExpressAdapter implements TransportAdapter {
    transportId: string = 'http';

    constructor(options?: ExpressAdapterOptions) {
        this._app = options?.app ?? express();
        this._port = options?.port ?? 3000;
        this._debug = options?.debug ?? false;
    }

    private _middlewares: RpcMiddleware[] = [];

    private readonly _app: Express;
    private readonly _port: number;
    private readonly _debug: boolean;

    private readonly _onRequest: ExpressAdapterOptions['onRequest'];
    private readonly _onBeforeResponse: ExpressAdapterOptions['onBeforeResponse'];
    private readonly _onAfterResponse: ExpressAdapterOptions['onAfterResponse'];
    private readonly _onError: ExpressAdapterOptions['onError'];

    private _listener: Server | undefined;

    use(middleware: RpcMiddleware) {
        this._middlewares.push(middleware);
    }

    private _getHeaders(req: Request): Record<string, string> {
        let currentKey: string | undefined;
        const result: Record<string, string> = {};
        for (const item of req.rawHeaders) {
            if (!currentKey) {
                currentKey = item;
                continue;
            }
            if (result[currentKey]) {
                result[currentKey] += `,${item}`;
                currentKey = undefined;
                continue;
            }
            result[currentKey] = item;
            continue;
        }
        return result;
    }

    registerRpc(
        name: string,
        procedure: RpcDefinition,
        validators: RpcValidators,
        handler: RpcHandler,
        postHandler?: RpcPostHandler,
    ) {
        let getParams: ((req: Request) => Result<any>) | undefined;
        if (validators.params) {
            switch (procedure.method) {
                case 'get':
                    getParams = (req: Request) => {
                        return validators.params!.coerce(req.params);
                    };
                    break;
                default:
                    getParams = (req: Request) => {
                        return validators.params!.parse(req.body);
                    };
            }
        }
        const routeHandler = async (req: Request, res: Response) => {
            const reqStart = new Date();
            try {
                const clientVersion = req.headers['client-version'];
                const context: RpcMiddlewareContext = {
                    rpcName: name,
                    reqStart: reqStart,
                    transport: this.transportId,
                    headers: this._getHeaders(req),
                    clientVersion:
                        typeof clientVersion === 'string'
                            ? clientVersion
                            : undefined,
                };
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
                    res.status(200).send(payload.value);
                    (context as any).response = response;
                } else {
                    res.status(200).send('');
                }
                if (postHandler) {
                    await postHandler(context as any);
                }
            } catch (err) {
                return this._handleError(res, err);
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
        let getParams: (req: Request) => Result<any>;
        if (validators.params) {
            switch (definition.method) {
                case 'get':
                    getParams = (req: Request) => {
                        return validators.params!.coerce(req.params);
                    };
                    break;
                default:
                    getParams = (req: Request) => {
                        return validators.params!.parse(req.body);
                    };
            }
        }
        const reqHandler = async (req: Request, res: Response) => {
            const reqStart = new Date();
            try {
                const clientVersion = req.headers['client-version'];
                const context: RpcMiddlewareContext = {
                    rpcName: name,
                    reqStart: reqStart,
                    transport: this.transportId,
                    clientVersion:
                        typeof clientVersion === 'string'
                            ? clientVersion
                            : undefined,
                    headers: this._getHeaders(req),
                };
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
                    await m(req as any);
                }
                const eventStream = new RpcEventStreamConnection(
                    new ExpressEventStreamDispatcher({ req, res }),
                    validators.params,
                    30000,
                );
                (context as any).stream = eventStream;
                await handler(context as any);
                if (!res.headersSent) {
                    eventStream.send();
                }
            } catch (err) {
                return this._handleError(res, err);
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

    registerHomeRoute(
        path: string,
        getAppInfo: () => {
            name?: string;
            description?: string;
            version?: string;
            definitionPath?: string;
        },
    ): void {
        this._app.get(path, async (req, res) => {
            try {
                for (const m of this._middlewares) {
                    await m(req as any);
                }
                res.status(200).send(JSON.stringify(getAppInfo()));
            } catch (err) {
                return this._handleError(res, err);
            }
        });
    }
    registerDefinitionRoute(
        path: string,
        getDefinition: () => AppDefinition,
    ): void {
        this._app.get(path, async (req, res) => {
            const reqStart = new Date();
            try {
                const clientVersion = req.headers['client-version'];
                const context: RpcMiddlewareContext = {
                    rpcName: '',
                    reqStart: reqStart,
                    transport: this.transportId,
                    clientVersion:
                        typeof clientVersion === 'string'
                            ? clientVersion
                            : undefined,
                    headers: this._getHeaders(req),
                };
                for (const m of this._middlewares) {
                    await m(context);
                }
                res.status(200);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(getDefinition()));
            } catch (err) {
                return this._handleError(res, err);
            }
        });
    }

    private _handleError(res: Response, err: unknown) {
        if (err instanceof ArriError) {
            return this._sendError(res, err);
        }
        if (err instanceof Error) {
            return this._sendError(
                res,
                new ArriError({
                    code: 500,
                    message: err.message,
                    data: err,
                    stackList: err.stack?.split('\n'),
                }),
            );
        }
        return this._sendError(
            res,
            new ArriError({ code: 500, message: `${err}`, data: err }),
        );
    }

    private _sendError(res: Response, error: ArriError) {
        res.setHeader('Content-Type', 'application/json');
        res.status(error.code);
        res.send(serializeArriError(error, this._debug));
    }

    start(): Promise<void> | void {
        this._listener = this._app.listen(this._port, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.info(`Server running at http://localhost:${this._port}`);
        });
    }
    stop(): Promise<void> | void {
        this._listener?.closeAllConnections();
        this._listener?.close();
    }
}

class ExpressEventStreamDispatcher implements EventStreamDispatcher {
    req: Request;
    res: Response;
    lastEventId?: string | undefined;
    constructor(config: { req: Request; res: Response }) {
        this.req = config.req;
        this.res = config.res;
    }
    send(): void {
        this.res.setHeader('Content-Type', 'text/event-stream');
        this.res.setHeader(
            'Cache-Control',
            'private, no-cache, no-store, no-transform, must-revalidate, max-age=0',
        );
        this.res.setHeader('x-accel-buffering', 'no');
        if (this.req.httpVersionMajor === 1) {
            this.res.setHeader('connection', 'keep-alive');
        }
        this.res.flushHeaders();
    }
    push(msg: EventStreamMessage | EventStreamMessage[]): void | Promise<void> {
        if (Array.isArray(msg)) {
            for (const m of msg) {
                this.res.write(this.formatEventStreamMessage(m));
            }
            return;
        }
        this.res.write(this.formatEventStreamMessage(msg));
    }
    private formatEventStreamMessage(message: EventStreamMessage) {
        let result = '';
        if (message.id) {
            result += `id: ${message.id}\n`;
        }
        if (message.event) {
            result += `event: ${message.event}\n`;
        }
        if (
            typeof message.retry === 'number' &&
            Number.isInteger(message.retry)
        ) {
            result += `retry: ${message.retry}\n`;
        }
        result += `data: ${message.data}\n\n`;
        return result;
    }
    close(): void {
        this.res.end();
    }
    onClosed(cb: () => void): void {
        this.res.on('close', cb);
    }
}
