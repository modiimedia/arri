import { ArriError, serializeArriError } from '@arrirpc/core';
import {
    CompiledValidator,
    errorMessageFromErrors,
    Result,
} from '@arrirpc/schema';
import {
    EventStreamRpcHandler,
    Hooks,
    HTTPMethod,
    RpcContext,
    RpcHandler,
    RpcPostHandler,
    TransportDispatcher,
    WebsocketHttpDispatcher,
} from '@arrirpc/server-next';
import { AppDefinition, RpcDefinition } from '@arrirpc/type-defs';
import { Express, Request, Response } from 'express';
import express from 'express';

export type ExpressDispatcherMiddleware = (
    req: Request & { context: RpcContext & { params?: any } },
) => Promise<void> | void;
export function defineMiddleware(middleware: ExpressDispatcherMiddleware) {
    return middleware;
}

export class HttpExpressDispatcher
    implements TransportDispatcher, WebsocketHttpDispatcher
{
    transportId: string = 'http';

    constructor(options?: { app?: Express; port?: number; debug?: boolean }) {
        this._app = options?.app ?? express();
        this._port = options?.port ?? 3000;
        this._debug = options?.debug ?? false;
    }

    private _middlewares: ExpressDispatcherMiddleware[] = [];

    private readonly _app: Express;
    private readonly _port: number;
    private readonly _debug: boolean;

    use(middleware: ExpressDispatcherMiddleware) {
        this._middlewares.push(middleware);
    }

    registerRpc(
        name: string,
        procedure: RpcDefinition,
        validators: {
            params?: CompiledValidator<any>;
            response?: CompiledValidator<any>;
        },
        handler: RpcHandler,
        postHandler?: RpcPostHandler,
    ) {
        let getParams: (req: Request) => Result<any>;
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
        const routeHandler = async (
            req: Request & { context?: RpcContext },
            res: Response,
        ) => {
            try {
                const clientVersion = req.headers['client-version'];
                const context: RpcContext = {
                    rpcName: name,
                    clientVersion:
                        typeof clientVersion === 'string'
                            ? clientVersion
                            : undefined,
                };
                req.context = context;
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
                    (req.context as any).params = result.value;
                }
                for (const m of this._middlewares) {
                    await m(req as any);
                }
                const response = await handler(req.context as any);
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
                    (req.context as any).response = response;
                } else {
                    res.status(200).send('');
                }
                if (postHandler) {
                    await postHandler(req.context as any);
                }
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
        validators: {
            params?: CompiledValidator<any>;
            response?: CompiledValidator<any>;
        },
        handler: EventStreamRpcHandler<any, any>,
    ): void {
        throw new Error('Method not implemented.');
    }

    registerHomeRoute?(
        path: string,
        getAppInfo: () => {
            name?: string;
            description?: string;
            version?: string;
            definitionPath?: string;
        },
    ): void {
        throw new Error('Method not implemented.');
    }
    registerDefinitionRoute?(
        path: string,
        getDefinition: () => AppDefinition,
    ): void {
        throw new Error('Method not implemented.');
    }

    registerWebsocketEndpoint(
        path: string,
        method: HTTPMethod,
        hooks: Hooks,
    ): void {
        throw new Error('Method not implemented.');
    }

    private _sendError(res: Response, error: ArriError) {
        res.setHeader('Content-Type', 'application/json');
        res.status(error.code);
        res.send(serializeArriError(error, this._debug));
    }

    start(): Promise<void> | void {
        throw new Error('Method not implemented.');
    }
    stop(): Promise<void> | void {
        throw new Error('Method not implemented.');
    }
}
