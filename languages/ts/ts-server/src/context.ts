import { type ExtractParams } from './middleware';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ArriEventContext extends Record<string, any> {}

export type RpcEventContext<TParams = undefined> = ArriEventContext & {
    rpcName: string;
    params: TParams;
};

export type RpcPostEventContext<
    TParams = undefined,
    TResponse = undefined,
> = RpcEventContext<TParams> & {
    response: TResponse;
};

export type RouteEventContext<
    TPath extends string,
    TQuery extends Record<any, any> = any,
    TBody = any,
> = ArriEventContext & {
    params: ExtractParams<TPath>;
    query: TQuery;
    body: TBody;
};

export type RoutePostEventContext<
    TPath extends string,
    TQuery extends Record<any, any> = any,
    TBody = any,
    TResponse = any,
> = RouteEventContext<TPath, TQuery, TBody> & {
    response: TResponse;
};

export type MiddlewareEventContext = ArriEventContext & {
    rpcName?: string;
};

export type RequestHookContext = ArriEventContext & {
    rpcName?: string;
    params?: Record<string, any>;
    response?: unknown;
};
