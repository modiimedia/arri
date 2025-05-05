import { RpcDefinition } from '@arrirpc/codegen-utils';
import { defineEventHandler, getQuery, H3Event, readRawBody, Router } from 'h3';

import { RpcContext, RpcHandler, TransportDispatcher } from './transport';

export type H3HttpTransportMiddleware = (
    event: H3Event,
    context: any,
) => Promise<void> | void;

export class DefaultHttpTransport<TEvent = any>
    implements TransportDispatcher<TEvent, 'http'>
{
    transportId = 'http' as const;
    router: Router;

    private readonly createContext = (rpcName: string): RpcContext => ({
        rpcName: rpcName,
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

    RegisterRpc(name: string, def: RpcDefinition, handler: RpcHandler): void {
        if (def.transport !== this.transportId) {
            throw new Error(
                `Tried to register a non-HTTP procedure (${def.transport}) to use the HTTP transport.`,
            );
        }
        switch (def.method) {
            case 'get':
                this.router.get(
                    def.path,
                    defineEventHandler(async (event) => {
                        const query = getQuery(event);
                        const ctx = this.createContext(name);
                        for (const m of this.middleware) {
                            await m(event, ctx);
                        }
                        return handler(query, ctx);
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
                        return handler(body, ctx);
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
                        return handler(body, ctx);
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
                        return handler(body, ctx);
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
                        return handler(body, ctx);
                    }),
                );
                break;
        }
    }
}
