import { RpcContext } from './rpc';

export interface RpcMiddlewareContext extends Omit<RpcContext<any>, 'params'> {
    params?: any;
}

export type RpcMiddleware = (
    context: RpcMiddlewareContext,
) => Promise<void> | void;

export interface RpcOnErrorContext extends RpcMiddlewareContext {
    error: unknown;
}

export function defineMiddleware(middleware: RpcMiddleware) {
    return middleware;
}
