import { RpcDefinition } from '@arrirpc/codegen-utils';
import {
    ASchema,
    CompiledValidator,
    ValidationException,
} from '@arrirpc/schema';
import {
    defineEventHandler,
    getQuery,
    H3Event,
    readRawBody,
    Router,
    setResponseStatus,
} from 'h3';

import { RpcEventContext } from './context';
import { registerRpc, RpcHandler, RpcPostHandler } from './rpc';

export interface RpcContext {
    rpcName: string;
}
export interface RpcHandlerContext<TParams> extends RpcContext {
    params: TParams;
}
export interface RpcPostHandlerContext<TParams, TResponse> extends RpcContext {
    params: TParams;
    response: TResponse;
}

export interface TransportDispatcher<TTransport extends string = any> {
    transportId: TTransport;

    RegisterRpc(
        name: string,
        definition: RpcDefinition,
        validators: {
            params?: CompiledValidator<any>;
            response?: CompiledValidator<any>;
        },
        handler: RpcHandler<any, any>,
        postHandler: RpcPostHandler<any, any>,
    ): void;

    RegisterEventStreamRpc(
        rpcName: string,
        def: RpcDefinition,
        handler: RpcHandler<any, any>,
    ): void;
}

export type H3HttpTransportMiddleware = (
    event: H3Event,
    context: any,
) => Promise<void> | void;

export class DefaultHttpTransport<TEvent = any>
    implements TransportDispatcher<'http'>
{
    transportId = 'http' as const;
    router: Router;

    private readonly createContext = (
        rpcName: string,
    ): RpcEventContext<any> => ({
        rpcName: rpcName,
        params: undefined as any as unknown,
    });

    private readonly middleware: H3HttpTransportMiddleware[] = [];

    constructor(options: {
        router: Router;
        contextBuilder: (event: H3Event) => TEvent;
    }) {
        this.router = options.router;
    }

    use(m: H3HttpTransportMiddleware) {
        this.middleware.push(m);
    }

    RegisterRpc(
        name: string,
        def: RpcDefinition<ASchema>,
        handler: RpcHandler<any, any>,
        postHandler: RpcPostHandler<any, any>,
    ): void {
        if (def.transport !== this.transportId) {
            throw new Error(
                `Tried to register a non-HTTP procedure (${def.transport}) to use the HTTP transport.`,
            );
        }
        registerRpc(this.router, def.path, def, {});
        switch (def.method) {
            case 'get':
                this.router.get(
                    def.path,
                    defineEventHandler(async (event) => {
                        let params: unknown | undefined;
                        if (validators.params) {
                            const parsedResult = validators.params.coerce(
                                getQuery(event),
                            );
                            if (!parsedResult.success) {
                                setResponseStatus(event, 400);
                                throw new ValidationException({
                                    errors: parsedResult.errors,
                                });
                            }
                            params = parsedResult.value;
                        }
                        const ctx = this.createContext(name);
                        ctx.params = params;
                        for (const m of this.middleware) {
                            await m(event, ctx);
                        }
                        const result = await handler(ctx);
                        if (!validators.response) {
                            setResponseStatus(event, 200);
                            return '';
                        }
                        const serializedResult =
                            validators.response.serialize(result);
                        if (!serializedResult.success) {
                            setResponseStatus(event, 400);
                            throw new ValidationException({
                                errors: serializedResult.errors,
                            });
                        }
                        setResponseStatus(event, 200);
                        return serializedResult;
                    }),
                );
                break;
            case 'delete':
                this.router.delete(
                    def.path,
                    defineEventHandler(async (event) => {
                        const body = await readRawBody(event);
                        const ctx = this.createContext(name);
                        for (const m of this.middleware) {
                            await m(event, ctx);
                        }
                        ctx.params = body;
                        return handler(ctx);
                    }),
                );
                break;
            case 'patch':
                this.router.patch(
                    def.path,
                    defineEventHandler(async (event) => {
                        const body = await readRawBody(event);
                        const ctx = this.createContext(name);
                        for (const m of this.middleware) {
                            await m(event, ctx);
                        }
                        ctx.params = body;
                        return handler(ctx);
                    }),
                );
                break;
            case 'put':
                this.router.put(
                    def.path,
                    defineEventHandler(async (event) => {
                        const body = await readRawBody(event);
                        const ctx = this.createContext(name);
                        for (const m of this.middleware) {
                            await m(event, ctx);
                        }
                        ctx.params = body;
                        return handler(ctx);
                    }),
                );
                break;
            case 'post':
                this.router.post(
                    def.path,
                    defineEventHandler(async (event) => {
                        const body = await readRawBody(event);
                        const ctx = this.createContext(name);
                        for (const m of this.middleware) {
                            await m(event, ctx);
                        }
                        ctx.params = body;
                        return handler(ctx);
                    }),
                );
                break;
        }
    }

    RegisterEventStreamRpc(
        rpcName: string,
        def: RpcDefinition,
        handler: RpcHandler<any, any>,
    ): void {
        throw new Error('Method not implemented.');
    }
}
