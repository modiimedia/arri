import {
    AppDefinition,
    RpcDefinition,
    RpcHttpMethod,
} from '@arrirpc/codegen-utils';
import { CompiledValidator } from '@arrirpc/schema';
import * as listhen from '@joshmossas/listhen';
import * as ws from 'crossws';
import * as h3 from 'h3';

import { RpcContext } from './context';
import {
    ArriError,
    getValidationErrorMessage,
    serializeArriErrorResponse,
} from './error';
import { RpcHandler, RpcPostHandler } from './rpc';
import {
    EventStreamRpcHandler,
    RpcEventStreamConnection,
} from './rpc_event_stream';
import { TransportDispatcher } from './transport';

export interface HttpOptions {
    debug?: boolean;
    h3App?: h3.App;
    h3Router?: h3.Router;
    onRequest?: (event: h3.H3Event, context: unknown) => void | Promise<void>;
    onBeforeResponse?: (
        event: h3.H3Event,
        context: HttpMiddlewareContextWithResponse,
    ) => void | Promise<void>;
    onAfterResponse?: (
        event: h3.H3Event,
        context: HttpMiddlewareContextWithResponse,
    ) => void | Promise<void>;
    onError?: (event: h3.H3Event, error: unknown) => void | Promise<void>;
    https?: boolean | listhen.HTTPSOptions;
    http2?: boolean;
}

export interface HttpMiddlewareContext extends Omit<RpcContext, 'rpcName'> {
    rpcName?: string;
    params?: any;
}

export interface HttpMiddlewareContextWithResponse
    extends HttpMiddlewareContext {
    response?: any;
}

export type HttpMiddleware = (
    event: h3.H3Event,
    context: HttpMiddlewareContext,
) => Promise<void> | void;

export interface WebsocketHttpRegister {
    registerWebsocketEndpoint(
        path: string,
        method: h3.HTTPMethod,
        hooks: ws.Hooks,
    ): void;
}

/**
 * HTTP transport dispatcher that uses the H3 server framework.
 * H3 is designed to be used in any JS runtime.
 * Meaning it can work in NodeJs, Cloudflare Workers, Bun, and Deno.
 */
export class HttpDispatcher
    implements TransportDispatcher, WebsocketHttpRegister
{
    readonly h3App: h3.App;
    readonly h3Router: h3.Router;

    readonly transportId: string = 'http';

    private readonly _debug: boolean;
    private readonly _onRequest: HttpOptions['onRequest'];
    private readonly _onBeforeResponse: HttpOptions['onBeforeResponse'];
    private readonly _onAfterResponse: HttpOptions['onAfterResponse'];
    private readonly _onError: HttpOptions['onError'];
    private _middlewares: HttpMiddleware[] = [];

    private _https: HttpOptions['https'];
    private _http2: HttpOptions['http2'];

    constructor(options: HttpOptions = {}) {
        this.h3App = options.h3App ?? h3.createApp({ debug: options.debug });
        this.h3Router = options.h3Router ?? h3.createRouter();
        this.h3App.use(this.h3Router);
        this._debug = options.debug ?? false;
        this._onRequest = options.onRequest;
        this._onBeforeResponse = options.onBeforeResponse;
        this._onAfterResponse = options.onAfterResponse;
        this._onError = options.onError;
        this._https = options.https;
        this._http2 = options.http2;
    }

    use(middleware: HttpMiddleware): void {
        this._middlewares.push(middleware);
    }

    registerWebsocketEndpoint(
        path: string,
        method: h3.HTTPMethod,
        hooks: ws.Hooks,
    ): void {
        switch (method) {
            case 'GET':
                this.h3Router.get(path, h3.defineWebSocketHandler(hooks));
                break;
            case 'DELETE':
                this.h3Router.delete(path, h3.defineWebSocketHandler(hooks));
                break;
            case 'POST':
                this.h3Router.post(path, h3.defineWebSocketHandler(hooks));
                break;
            case 'PATCH':
                this.h3Router.patch(path, h3.defineWebSocketHandler(hooks));
                break;
            case 'PUT':
                this.h3Router.put(path, h3.defineWebSocketHandler(hooks));
                break;
            case 'CONNECT':
            case 'HEAD':
            case 'OPTIONS':
            case 'TRACE':
                throw new Error(
                    `Unsupported method for websocket endpoint ${method}`,
                );
        }
    }

    private async _getParams(
        event: h3.H3Event,
        method: RpcHttpMethod | undefined,
        validator: CompiledValidator<any> | undefined,
    ) {
        if (!validator) return undefined;
        switch (method) {
            case 'get': {
                const parsedResult = validator.coerce(h3.getQuery(event));
                if (!parsedResult.success) {
                    throw new ArriError({
                        code: 400,
                        message: getValidationErrorMessage(parsedResult.errors),
                        data: parsedResult.errors,
                    });
                }
                return parsedResult.value;
            }
            case 'delete':
            case 'patch':
            case 'post':
            case 'put':
            case undefined: {
                const body = await h3.readRawBody(event);
                if (!body) {
                    return this._handleError(
                        event,
                        new ArriError({
                            code: 400,
                            message: `Expected JSON input. Received nothing.`,
                        }),
                    );
                }
                const parsedResult = validator.parse(body);
                if (!parsedResult.success) {
                    throw new ArriError({
                        code: 400,
                        message: getValidationErrorMessage(parsedResult.errors),
                        data: parsedResult.errors,
                    });
                }
                return parsedResult.value;
            }
            default:
                method satisfies never;
                return undefined;
        }
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
        const requestHandler = h3.defineEventHandler(async (event) => {
            try {
                if (h3.isPreflightRequest(event)) {
                    h3.setResponseStatus(event, 200);
                    return h3.send(event, 'ok');
                }
                const context: RpcContext = { rpcName: name };
                if (this._onRequest) await this._onRequest(event, context);
                const params: any | undefined = await this._getParams(
                    event,
                    definition.method,
                    validators.params,
                );
                (context as any).params = params;
                for (const m of this._middlewares) {
                    await m(event, context);
                }
                const response = await handler(context as any);
                (context as any).response = response;
                if (this._onBeforeResponse) {
                    await this._onBeforeResponse(event, context as any);
                }
                if (validators.response) {
                    const serialResult =
                        validators.response.serialize(response);
                    if (!serialResult.success) {
                        return this._handleError(
                            event,
                            new ArriError({
                                code: 500,
                                message: 'Error serializing response',
                                data: serialResult.errors,
                            }),
                        );
                    }
                    await h3.send(
                        event,
                        serialResult.value,
                        'application/json',
                    );
                } else {
                    await h3.send(event, '', 'text/plain');
                }
                if (this._onAfterResponse) {
                    await this._onAfterResponse(event, context as any);
                }
                if (postHandler) await postHandler(context as any);
            } catch (err) {
                return this._handleError(event, err);
            }
        });
        switch (definition.method) {
            case 'get':
                this.h3Router.get(definition.path, requestHandler);
                break;
            case 'delete':
                this.h3Router.delete(definition.path, requestHandler);
                break;
            case 'patch':
                this.h3Router.patch(definition.path, requestHandler);
                break;
            case 'put':
                this.h3Router.put(definition.path, requestHandler);
                break;
            case 'post':
            case undefined:
                this.h3Router.post(definition.path, requestHandler);
                break;
            default:
                definition.method satisfies never;
                throw new Error(
                    `Unexpected method in definition "${definition.method}"`,
                );
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
        const requestHandler = h3.defineEventHandler(async (event) => {
            try {
                if (h3.isPreflightRequest(event)) {
                    h3.setResponseStatus(event, 200);
                    return h3.send(event, 'ok');
                }
                const context: RpcContext = { rpcName: name };
                if (this._onRequest) await this._onRequest(event, context);
                const params = await this._getParams(
                    event,
                    definition.method,
                    validators.params,
                );
                (context as any).params = params;
                for (const m of this._middlewares) {
                    await m(event, context);
                }
                const stream = new RpcEventStreamConnection(
                    h3.createEventStream(event),
                    validators.response,
                    30000,
                );
                (context as any).stream = stream;
                await handler(context as any);
                if (!event.handled) {
                    stream.send();
                }
            } catch (err) {
                return this._handleError(event, err);
            }
        });
        switch (definition.method) {
            case 'get':
                this.h3Router.get(definition.path, requestHandler);
                break;
            case 'delete':
                this.h3Router.delete(definition.path, requestHandler);
                break;
            case 'patch':
                this.h3Router.patch(definition.path, requestHandler);
                break;
            case 'put':
                this.h3Router.put(definition.path, requestHandler);
                break;
            case 'post':
            case undefined:
                this.h3Router.post(definition.path, requestHandler);
                break;
            default:
                definition.method satisfies never;
                throw new Error(`Unsupported HTTP Method ${definition.method}`);
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
        const handler = h3.defineEventHandler(async (event) => {
            if (h3.isPreflightRequest(event)) {
                h3.setResponseStatus(event, 200);
                return 'ok';
            }
            const context: Record<string, any> = {};
            if (this._onRequest) await this._onRequest(event, context);
            for (const m of this._middlewares) {
                await m(event, context);
            }
            const response = getAppInfo();
            context.response = response;
            if (this._onBeforeResponse) {
                await this._onBeforeResponse(event, context as any);
            }

            h3.setResponseStatus(event, 200);
            h3.setResponseHeader(event, 'Content-Type', 'application/json');
            await h3.send(event, response, 'application/json');
            if (this._onAfterResponse) {
                await this._onAfterResponse(event, context as any);
            }
            return '';
        });
        this.h3Router.use(path, handler, ['get', 'head']);
    }

    registerDefinitionRoute(
        path: string,
        getDefinition: () => AppDefinition,
    ): void {
        const handler = h3.defineEventHandler(async (event) => {
            try {
                if (h3.isPreflightRequest(event)) {
                    h3.setResponseStatus(event, 200);
                    return 'ok';
                }
                const context: Record<string, any> = {};
                if (this._onRequest) await this._onRequest(event, context);
                for (const m of this._middlewares) {
                    await m(event, context);
                }
                const response = getDefinition();
                context.response = response;
                if (this._onBeforeResponse) {
                    await this._onBeforeResponse(event, context);
                }
                h3.setResponseStatus(event, 200);
                h3.setResponseHeader(event, 'Content-Type', 'application/json');
                await h3.send(event, response, 'application/json');
                if (this._onAfterResponse) {
                    await this._onAfterResponse(event, context);
                }
                return '';
            } catch (err) {
                return this._handleError(event, err);
            }
        });
        this.h3Router.use(path, handler, ['get', 'head']);
    }

    private async _handleError(event: h3.H3Event, error: unknown) {
        try {
            if (this._onError) await this._onError(event, error);
            h3.setResponseHeader(event, 'Content-Type', 'application/json');
            if (error instanceof ArriError) {
                h3.setResponseStatus(event, error.code);
                return h3.send(
                    event,
                    serializeArriErrorResponse(
                        {
                            code: error.code,
                            message: error.message,
                            data: error.data,
                            stack: error.stackList,
                        },
                        this._debug,
                    ),
                );
            }
            if (error instanceof h3.H3Error) {
                h3.setResponseStatus(event, error.statusCode);
                return h3.send(
                    event,
                    serializeArriErrorResponse(
                        {
                            code: error.statusCode,
                            message: error.statusMessage ?? error.message,
                            data: error.data,
                            stack: error.stack?.split('\n'),
                        },
                        this._debug,
                    ),
                );
            }
            h3.setResponseStatus(event, 500);
            return h3.send(
                event,
                serializeArriErrorResponse(
                    {
                        code: 500,
                        message:
                            error instanceof Error ? error.message : `${error}`,
                        data: error,
                        stack:
                            error instanceof Error
                                ? error.stack?.split('\n')
                                : undefined,
                    },
                    this._debug,
                ),
            );
        } catch (err) {
            h3.setResponseHeader(event, 'Content-Type', 'application/json');
            if (err instanceof ArriError) {
                h3.setResponseStatus(event, err.code);
                return h3.send(
                    event,
                    serializeArriErrorResponse(
                        {
                            code: err.code,
                            message: err.message,
                            data: err.data,
                            stack: err.stackList,
                        },
                        this._debug,
                    ),
                );
            }
            if (err instanceof h3.H3Error) {
                h3.setResponseStatus(event, err.statusCode);
                return h3.send(
                    event,
                    serializeArriErrorResponse(
                        {
                            code: err.statusCode,
                            message: err.statusMessage ?? err.message,
                            data: err.data,
                            stack: err.stack?.split('\n'),
                        },
                        this._debug,
                    ),
                );
            }
            h3.setResponseStatus(event, 500);
            return h3.send(
                event,
                serializeArriErrorResponse(
                    {
                        code: 500,
                        message: err instanceof Error ? err.message : `${err}`,
                        data: err,
                        stack:
                            err instanceof Error
                                ? err.stack?.split('\n')
                                : undefined,
                    },
                    this._debug,
                ),
            );
        }
    }

    start(): void {
        const listener = h3.toNodeListener(this.h3App);
        listhen.listen(listener, {
            http2: this._http2,
            https: this._https,
        });
        throw new Error('Not implemented');
    }

    stop(): void {
        throw new Error('Not implemented');
    }
}
