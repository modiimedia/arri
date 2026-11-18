import { RpcCall } from './context';

export type Middleware = (
    input: unknown,
    call: RpcCall,
    next: () => Promise<unknown>,
) => Promise<void> | void;

export function defineMiddleware(middleware: Middleware): Middleware {
    return middleware;
}
