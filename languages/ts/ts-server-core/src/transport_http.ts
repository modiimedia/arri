import { AppDefinition, RpcDefinition } from '@arrirpc/codegen-utils';
import { CompiledValidator } from '@arrirpc/schema';
import * as h3 from 'h3';

import { RpcContext } from './context';
import {
    ArriError,
    getValidationErrorMessage,
    serializeArriErrorResponse,
} from './error';
import { RpcHandler, RpcPostHandler, RpcPostHandlerContext } from './rpc';
import { EventStreamRpcHandler } from './rpc_event_stream';
import { Dispatcher } from './transport';

export interface HttpOptions {
    debug?: boolean;
    h3App?: h3.App;
    h3Router?: h3.Router;
    onRequest?: (event: h3.H3Event, context: unknown) => void | Promise<void>;
    onBeforeResponse?: (
        event: h3.H3Event,
        context: RpcPostHandlerContext<any, any>,
    ) => void | Promise<void>;
    onAfterResponse?: (
        event: h3.H3Event,
        context: RpcPostHandlerContext<any, any>,
    ) => void | Promise<void>;
    onError?: (event: h3.H3Event, error: unknown) => void | Promise<void>;
}

export type HttpMiddleware = (
    event: h3.H3Event,
    context: RpcContext,
) => Promise<void> | void;

/**
 * HTTP transport dispatcher that uses the H3 server framework.
 * H3 is designed to be used in any JS runtime.
 * Meaning it can work in NodeJs, Cloudflare Workers, Bun, and Deno.
 */
export class HttpDispatcher implements Dispatcher {
    readonly h3App: h3.App;
    readonly h3Router: h3.Router;

    readonly transportId: string = 'http';

    private readonly _debug: boolean;
    private readonly _onRequest: HttpOptions['onRequest'];
    private readonly _onBeforeResponse: HttpOptions['onBeforeResponse'];
    private readonly _onAfterResponse: HttpOptions['onAfterResponse'];
    private readonly _onError: HttpOptions['onError'];
    private _middlewares: HttpMiddleware[] = [];

    constructor(options: HttpOptions) {
        this.h3App = options.h3App ?? h3.createApp({ debug: options.debug });
        this.h3Router = options.h3Router ?? h3.createRouter();
        this._debug = options.debug ?? false;
        this._onRequest = options.onRequest;
        this._onBeforeResponse = options.onBeforeResponse;
        this._onAfterResponse = options.onAfterResponse;
        this._onError = options.onError;
    }

    use(middleware: HttpMiddleware): void {
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
        const requestHandler = h3.defineEventHandler(async (event) => {
            try {
                if (h3.isPreflightRequest(event)) {
                    h3.setResponseStatus(event, 200);
                    return h3.send(event, 'ok');
                }
                const context: RpcContext = { rpcName: name };
                if (this._onRequest) await this._onRequest(event, context);
                let params: any | undefined;
                if (validators.params) {
                    switch (definition.method) {
                        case 'get': {
                            const parsedResult = validators.params.coerce(
                                h3.getQuery(event),
                            );
                            if (!parsedResult.success) {
                                return this._handleError(
                                    event,
                                    new ArriError({
                                        code: 400,
                                        message: getValidationErrorMessage(
                                            parsedResult.errors,
                                        ),
                                        data: parsedResult.errors,
                                    }),
                                );
                            }
                            params = parsedResult.value;
                            break;
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
                            const parsedResult = validators.params.parse(body);
                            if (!parsedResult.success) {
                                return this._handleError(
                                    event,
                                    new ArriError({
                                        code: 400,
                                        message: getValidationErrorMessage(
                                            parsedResult.errors,
                                        ),
                                        data: parsedResult.errors,
                                    }),
                                );
                            }
                            params = parsedResult.value;
                            break;
                        }
                        default:
                            definition.method satisfies never;
                            throw new Error(
                                `Unexpected method in definition "${definition.method}"`,
                            );
                    }
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
        throw new Error('Not implemented');
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
        const handler = h3.defineEventHandler((event) => {
            if (h3.isPreflightRequest(event)) {
                h3.setResponseStatus(event, 200);
                return 'ok';
            }
            h3.setResponseStatus(event, 200);
            h3.setResponseHeader(event, 'Content-Type', 'application/json');
            return getAppInfo();
        });
        this.h3Router.use(path, handler, ['get', 'head']);
    }

    registerDefinitionRoute(
        path: string,
        getDefinition: () => AppDefinition,
    ): void {
        const handler = h3.defineEventHandler((event) => {
            if (h3.isPreflightRequest(event)) {
                h3.setResponseStatus(event, 200);
                return 'ok';
            }
            h3.setResponseStatus(event, 200);
            h3.setResponseHeader(event, 'Content-Type', 'application/json');
            return getDefinition();
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
        throw new Error('Not implemented');
    }
}
