import { RpcContext } from './context';

export type Middleware<T> = (
    req: T,
    context: RpcContext,
) => Promise<void> | void;
