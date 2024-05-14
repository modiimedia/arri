import { type H3EventContext } from "h3";
import { type ExtractParams } from "./middleware";

export type ArriEventContext = Record<string, any>;

export interface RpcEventContext<TParams = undefined>
    extends ArriEventContext,
        Omit<H3EventContext, "params"> {
    rpcName: string;
    params: TParams;
}

export interface RpcPostEventContext<TParams = undefined, TResponse = undefined>
    extends RpcEventContext<TParams> {
    response: TResponse;
}

export interface RouteEventContext<
    TPath extends string,
    TQuery extends Record<any, any> = any,
    TBody = any,
> extends ArriEventContext,
        H3EventContext {
    params: ExtractParams<TPath>;
    query: TQuery;
    body: TBody;
}

export interface RoutePostEventContext<
    TPath extends string,
    TQuery extends Record<any, any> = any,
    TBody = any,
    TResponse = any,
> extends RouteEventContext<TPath, TQuery, TBody> {
    response: TResponse;
}

export interface MiddlewareEventContext
    extends ArriEventContext,
        H3EventContext {
    rpcName?: string;
}
