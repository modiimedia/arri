import { RpcContext } from './context';

export type RpcMiddleware = (context: RpcContext) => Promise<void> | void;
