import assert from 'node:assert';

import {
    AppDefinition,
    RpcDefinition,
    RpcHttpMethod,
} from '@arrirpc/codegen-utils';
import { ArriError } from '@arrirpc/core';
import { CompiledValidator } from '@arrirpc/schema';
import * as listhen from '@joshmossas/listhen';
import * as ws from 'crossws';
import * as h3 from 'h3';

import { TransportAdapter, TransportAdapterOptions } from './adapter';
import {
    defineError,
    getValidationErrorMessage,
    serializeArriErrorResponse,
} from './error';
import {
    RpcMiddleware,
    RpcMiddlewareContext,
    RpcOnErrorContext,
} from './middleware';
import { RpcHandler, RpcPostHandler } from './rpc';
import {
    EventStreamRpcHandler,
    RpcEventStreamConnection,
} from './rpc_event_stream';

export interface HttpOptions {
    debug?: boolean;
    h3App?: h3.App;
    h3Router?: h3.Router;
    onRequest?: (
        event: h3.H3Event,
        context: RpcMiddlewareContext,
    ) => void | Promise<void>;
    cors?: h3.H3CorsOptions;
    https?: boolean | listhen.HTTPSOptions;
    http2?: boolean;
    autoClose?: boolean;
    port?: number;
    public?: boolean;
    httpWithHttps?: boolean;
    httpWithHttpsPort?: number;
    trustXForwardedFor?: boolean;
}

export interface HttpEndpointRegister {
    registerEndpoint(
        path: string,
        method: h3.RouterMethod | h3.RouterMethod[],
        handler: h3.WebHandler,
    ): void;
}

export function isHttpEndpointRegister(
    input: unknown,
): input is HttpEndpointRegister {
    return (
        typeof input === 'object' &&
        input !== null &&
        'registerEndpoint' in input &&
        typeof input.registerEndpoint === 'function'
    );
}

export interface WsEndpointRegister {
    registerWsEndpoint(
        path: string,
        method: h3.RouterMethod | h3.RouterMethod[],
        hooks: ws.Hooks,
    ): void;
}

export function isWsEndpointRegister(
    input: unknown,
): input is WsEndpointRegister {
    return (
        typeof input === 'object' &&
        input !== null &&
        'registerWsEndpoint' in input &&
        typeof input.registerWsEndpoint === 'function'
    );
}

/**
 * HTTP transport dispatcher that uses the H3 server framework.
 * H3 is designed to be used in any JS runtime.
 * Meaning it can work in NodeJs, Cloudflare Workers, Bun, and Deno.
 */
export class HttpAdapter
    implements TransportAdapter, HttpEndpointRegister, WsEndpointRegister
{
    readonly h3App: h3.App;
    readonly h3Router: h3.Router;

    readonly transportId: string = 'http';

    private readonly _debug: boolean;
    private readonly _onRequest: HttpOptions['onRequest'];
    private _globalOnRequest: TransportAdapterOptions['onRequest'];
    private _globalOnBeforeResponse: TransportAdapterOptions['onBeforeResponse'];
    private _globalOnAfterResponse: TransportAdapterOptions['onAfterResponse'];
    private _globalOnError: TransportAdapterOptions['onError'];
    private _middlewares: RpcMiddleware[] = [];
    private _options: TransportAdapterOptions | undefined;

    private _cores: HttpOptions['cors'];
    private _https: HttpOptions['https'];
    private _http2: HttpOptions['http2'];
    private _autoClose: HttpOptions['autoClose'];
    private _port: HttpOptions['port'];
    private _public: NonNullable<HttpOptions['public']>;
    private _httpWithHttps?: HttpOptions['httpWithHttps'];
    private _httpWithHttpsPort?: HttpOptions['httpWithHttpsPort'];
    private _trustXForwardedFor?: HttpOptions['trustXForwardedFor'];

    private _listener: listhen.Listener | undefined;
    private _secondaryListener: listhen.Listener | undefined;

    constructor(options: HttpOptions = {}) {
        this.h3App =
            options.h3App ??
            h3.createApp({
                debug: options.debug,
                onRequest: (event) => {
                    event.context.reqStart = new Date();
                    if (this._cores) h3.handleCors(event, this._cores!);
                },
                onError: (err, event) => {
                    const context: RpcOnErrorContext = {
                        rpcName: '',
                        reqStart: event.context.reqStart,
                        ipAddress: h3.getRequestIP(event, {
                            xForwardedFor: this._trustXForwardedFor,
                        }),
                        transport: this.transportId,
                        clientVersion: h3.getHeader(event, 'client-version'),
                        headers: h3.getHeaders(event),
                        setResponseHeader: (key, val) =>
                            h3.setResponseHeader(event, key, val),
                        setResponseHeaders: (headers) =>
                            h3.setResponseHeaders(event, headers),
                        error: err,
                    };
                    return this._handleError(event, context);
                },
            });
        this.h3Router = options.h3Router ?? h3.createRouter();
        this.h3App.use(this.h3Router);
        this._debug = options.debug ?? false;
        this._onRequest = options.onRequest;
        this._cores = options.cors;
        this._https = options.https;
        this._http2 = options.http2;
        this._autoClose = options.autoClose;
        this._port = options.port;
        this._public = options.public ?? true;
        this._trustXForwardedFor = options.trustXForwardedFor;

        // default fallback route
        this.h3Router.use(
            '/**',
            h3.defineEventHandler(async (event) => {
                h3.setResponseStatus(event, 404);
                const error = defineError(404);
                const context: RpcMiddlewareContext = {
                    rpcName: '',
                    ipAddress: h3.getRequestIP(event, {
                        xForwardedFor: this._trustXForwardedFor,
                    }),
                    reqStart: event.context.reqStart ?? new Date(),
                    transport: this.transportId,
                    clientVersion: h3.getHeader(event, 'client-version'),
                    setResponseHeader: (key, val) =>
                        h3.setResponseHeader(event, key, val),
                    setResponseHeaders: (headers) =>
                        h3.setResponseHeaders(event, headers),
                    headers: h3.getHeaders(event),
                };
                try {
                    await this._onRequest?.(event, context);
                    await this._globalOnRequest?.(context);
                } catch (err) {
                    (context as any).error = err;
                    return this._handleError(event, context as any);
                }
                if (event.handled) return;
                (context as any).error = error;
                return this._handleError(event, context as any);
            }),
        );
    }

    setOptions(options: TransportAdapterOptions): void {
        this._options = options;
    }

    use(middleware: RpcMiddleware): void {
        this._middlewares.push(middleware);
    }
    registerEndpoint(
        path: string,
        method: h3.RouterMethod | h3.RouterMethod[],
        handler: h3.WebHandler,
    ) {
        this.h3Router.use(
            path,
            h3.defineEventHandler((event) => {
                const request = h3.toWebRequest(event);
                return handler(request, event.context);
            }),
        );
    }

    registerWsEndpoint(
        path: string,
        method: h3.RouterMethod | h3.RouterMethod[],
        hooks: ws.Hooks,
    ): void {
        this.h3Router.use(path, h3.defineWebSocketHandler(hooks), method);
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
                    throw new ArriError({
                        code: 400,
                        message: `Expected JSON input. Received nothing.`,
                    });
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
            if (h3.isPreflightRequest(event)) {
                h3.setResponseStatus(event, 200);
                return h3.send(event, 'ok');
            }
            const headers = h3.getHeaders(event);
            const context: RpcMiddlewareContext = {
                rpcName: name,
                ipAddress: h3.getRequestIP(event, {
                    xForwardedFor: this._trustXForwardedFor,
                }),
                reqStart: event.context.reqStart ?? new Date(),
                transport: this.transportId,
                clientVersion: headers['client-version'],
                headers: headers,
                setResponseHeader: (key, val) =>
                    h3.setResponseHeader(event, key, val),
                setResponseHeaders: (headers) =>
                    h3.setResponseHeaders(event, headers),
            };
            try {
                if (this._onRequest) await this._onRequest(event, context);
                const params: any | undefined = await this._getParams(
                    event,
                    definition.method,
                    validators.params,
                );
                (context as any).params = params;
                for (const m of this._middlewares) {
                    await m(context);
                }
                const response = await handler(context as any);
                (context as any).response = response;
                if (this._globalOnBeforeResponse) {
                    await this._globalOnBeforeResponse(context as any);
                }
                if (validators.response) {
                    const serialResult =
                        validators.response.serialize(response);
                    if (!serialResult.success) {
                        throw new ArriError({
                            code: 500,
                            message: 'Error serializing response',
                            data: serialResult.errors,
                        });
                    }
                    await h3.send(
                        event,
                        serialResult.value,
                        'application/json',
                    );
                } else {
                    await h3.send(event, '', 'text/plain');
                }
                if (this._globalOnAfterResponse) {
                    await this._globalOnAfterResponse(context as any);
                }
                if (postHandler) await postHandler(context as any);
            } catch (err) {
                (context as any).error = err;
                return this._handleError(event, context as any);
            }
        });
        assert(definition.path.startsWith('/'), 'path must start with "/"');
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
            if (h3.isPreflightRequest(event)) {
                h3.setResponseStatus(event, 200);
                return h3.send(event, 'ok');
            }
            const context: RpcMiddlewareContext = {
                rpcName: name,
                reqStart: event.context.reqStart ?? new Date(),
                ipAddress: h3.getRequestIP(event, {
                    xForwardedFor: this._trustXForwardedFor,
                }),
                transport: this.transportId,
                clientVersion: h3.getHeader(event, 'client-version'),
                headers: h3.getHeaders(event),
                setResponseHeader: (key, val) =>
                    h3.setResponseHeader(event, key, val),
                setResponseHeaders: (headers) =>
                    h3.setResponseHeaders(event, headers),
            };
            try {
                if (this._onRequest) await this._onRequest(event, context);
                const params = await this._getParams(
                    event,
                    definition.method,
                    validators.params,
                );
                (context as any).params = params;
                for (const m of this._middlewares) {
                    await m(context);
                }
                h3.setResponseHeader(
                    event,
                    'heartbeat-interval',
                    this._options?.heartbeatInterval ?? 20000,
                );
                const stream = new RpcEventStreamConnection(
                    h3.createEventStream(event),
                    validators.response,
                    this._options?.heartbeatInterval ?? 20000,
                    this._options?.heartbeatEnabled ?? true,
                );
                (context as any).stream = stream;
                await handler(context as any);
                if (!event.handled) {
                    stream.send();
                }
            } catch (err) {
                (context as any).error = err;
                return this._handleError(event, context as any);
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
            const context: RpcMiddlewareContext = {
                transport: this.transportId,
                reqStart: event.context.reqStart ?? new Date(),
                ipAddress: h3.getRequestIP(event, {
                    xForwardedFor: this._trustXForwardedFor,
                }),
                rpcName: '',
                clientVersion: h3.getHeader(event, 'client-version'),
                headers: h3.getHeaders(event),
                setResponseHeader: (key, val) =>
                    h3.setResponseHeader(event, key, val),
                setResponseHeaders: (headers) =>
                    h3.setResponseHeaders(event, headers),
            };
            try {
                if (this._onRequest) await this._onRequest(event, context);
                for (const m of this._middlewares) {
                    await m(context);
                }
                const response = getAppInfo();
                (context as any).response = response;
                if (this._globalOnBeforeResponse) {
                    await this._globalOnBeforeResponse(context as any);
                }
                h3.setResponseStatus(event, 200);
                h3.setResponseHeader(event, 'Content-Type', 'application/json');
                await h3.send(event, JSON.stringify(response));
                if (this._globalOnAfterResponse) {
                    await this._globalOnAfterResponse(context as any);
                }
                return '';
            } catch (err) {
                (context as any).error = err;
                return this._handleError(event, context as any);
            }
        });
        this.h3Router.use(path, handler, ['get', 'head']);
    }

    registerDefinitionRoute(
        path: string,
        getDefinition: () => AppDefinition,
    ): void {
        const handler = h3.defineEventHandler(async (event) => {
            if (h3.isPreflightRequest(event)) {
                h3.setResponseStatus(event, 200);
                return 'ok';
            }
            const context: RpcMiddlewareContext = {
                rpcName: '',
                reqStart: event.context.reqStart ?? new Date(),
                ipAddress: h3.getRequestIP(event, {
                    xForwardedFor: this._trustXForwardedFor,
                }),
                transport: this.transportId,
                clientVersion: h3.getHeader(event, 'client-version'),
                headers: h3.getHeaders(event),
                setResponseHeader: (key, val) =>
                    h3.setResponseHeader(event, key, val),
                setResponseHeaders: (headers) =>
                    h3.setResponseHeaders(event, headers),
            };
            try {
                if (this._onRequest) await this._onRequest(event, context);
                for (const m of this._middlewares) {
                    await m(context);
                }
                const response = getDefinition();
                (context as any).response = response;
                if (this._globalOnBeforeResponse) {
                    await this._globalOnBeforeResponse(context as any);
                }
                h3.setResponseStatus(event, 200);
                h3.setResponseHeader(event, 'Content-Type', 'application/json');
                await h3.send(
                    event,
                    JSON.stringify(response),
                    'application/json',
                );
                if (this._globalOnAfterResponse) {
                    await this._globalOnAfterResponse(context as any);
                }
                return '';
            } catch (err) {
                (context as any).error = err;
                return this._handleError(event, context as any);
            }
        });
        this.h3Router.use(path, handler, ['get', 'head']);
    }

    private async _handleError(event: h3.H3Event, context: RpcOnErrorContext) {
        try {
            if (this._globalOnError) await this._globalOnError(context);
            h3.setResponseHeader(event, 'Content-Type', 'application/json');
            if (context.error instanceof ArriError) {
                h3.setResponseStatus(event, context.error.code);
                await h3.send(
                    event,
                    serializeArriErrorResponse(
                        {
                            code: context.error.code,
                            message: context.error.message,
                            data: context.error.data,
                            stack: context.error.stackList,
                        },
                        this._debug,
                    ),
                );
                return;
            }
            if (context.error instanceof h3.H3Error) {
                h3.setResponseStatus(event, context.error.statusCode);
                await h3.send(
                    event,
                    serializeArriErrorResponse(
                        {
                            code: context.error.statusCode,
                            message:
                                context.error.statusMessage ??
                                context.error.message,
                            data: context.error.data,
                            stack: context.error.stack?.split('\n'),
                        },
                        this._debug,
                    ),
                );
                return;
            }
            h3.setResponseStatus(event, 500);
            await h3.send(
                event,
                serializeArriErrorResponse(
                    {
                        code: 500,
                        message:
                            context.error instanceof Error
                                ? context.error.message
                                : `${context.error}`,
                        data: context.error,
                        stack:
                            context.error instanceof Error
                                ? context.error.stack?.split('\n')
                                : undefined,
                    },
                    this._debug,
                ),
            );
            return;
        } catch (err) {
            h3.setResponseHeader(event, 'Content-Type', 'application/json');
            if (err instanceof ArriError) {
                h3.setResponseStatus(event, err.code);
                await h3.send(
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
                return;
            }
            if (err instanceof h3.H3Error) {
                h3.setResponseStatus(event, err.statusCode);
                await h3.send(
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
                return;
            }
            h3.setResponseStatus(event, 500);
            await h3.send(
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
            return;
        }
    }

    get isStarted(): boolean {
        return (
            typeof this._listener === 'undefined' &&
            typeof this._secondaryListener === 'undefined'
        );
    }

    async start(): Promise<void> {
        this._listener = await listhen.listen(h3.toNodeListener(this.h3App), {
            port: this._port ?? 3000,
            http2: this._http2,
            https: this._https,
            public: this._public,
            autoClose: this._autoClose,
            ws: this.h3App.websocket.resolve
                ? {
                      resolve: this.h3App.websocket.resolve,
                  }
                : undefined,
        });
        if (this._httpWithHttps) {
            this._secondaryListener = await listhen.listen(
                h3.toNodeListener(this.h3App),
                {
                    port: this._httpWithHttpsPort ?? (this._port ?? 3000) + 1,
                    public: this._public,
                    http2: this._http2,
                    https: false,
                    autoClose: this._autoClose,
                    ws: this.h3App.websocket.resolve
                        ? {
                              resolve: this.h3App.websocket.resolve,
                          }
                        : undefined,
                    showURL: false,
                    qr: false,
                },
            );
            // eslint-disable-next-line no-console
            console.info(
                `Serving unencrypted traffic from port ${this._secondaryListener.address.port}`,
            );
        }
    }

    async stop(): Promise<void> {
        await this._listener?.close();
        this._listener = undefined;
        await this._secondaryListener?.close();
        this._secondaryListener = undefined;
    }
}
