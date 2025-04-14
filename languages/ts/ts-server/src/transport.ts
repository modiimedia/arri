import { RpcDefinition } from '@arrirpc/codegen-utils';
import { defineEventHandler, getQuery, readRawBody, Router } from 'h3';

type ProcedureHandler = (params: unknown, event: any) => string;

export interface ArriTransport {
    id: string;
    RegisterProcedure(def: RpcDefinition, handler: ProcedureHandler): void;
}

export class DefaultHttpTransport implements ArriTransport {
    id = 'http' as const;

    router: Router;

    constructor(options: { router: Router }) {
        this.router = options.router;
    }

    RegisterProcedure(def: RpcDefinition, handler: ProcedureHandler): void {
        if (def.transport !== this.id) {
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
                        return handler(query, '');
                    }),
                );
                break;
            case 'delete':
                this.router.delete(
                    def.path,
                    defineEventHandler(async (event) => {
                        const body = await readRawBody(event);
                        return handler(body, '');
                    }),
                );
                break;
            case 'patch':
                this.router.patch(
                    def.path,
                    defineEventHandler(async (event) => {
                        const body = await readRawBody(event);
                        return handler(body, '');
                    }),
                );
                break;
            case 'put':
                this.router.put(
                    def.path,
                    defineEventHandler(async (event) => {
                        const body = await readRawBody(event);
                        return handler(body, '');
                    }),
                );
                break;
            case 'post':
                this.router.post(
                    def.path,
                    defineEventHandler(async (event) => {
                        const body = await readRawBody(event);
                        return handler(body, '');
                    }),
                );
                break;
        }
    }
}
