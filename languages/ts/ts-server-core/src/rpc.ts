import { RpcHttpMethod } from '@arrirpc/codegen-utils';
import {
    ADiscriminatorSchema,
    AObjectSchema,
    ASchema,
    InferType,
} from '@arrirpc/schema';

import { RpcContext } from './context';

export interface RpcHandlerContext<TParams> extends RpcContext {
    params: TParams;
}

export interface RpcPostHandlerContext<TParams, TResponse> extends RpcContext {
    params: TParams;
    response: TResponse;
}

export interface Rpc<TParams extends ASchema, TResponse extends ASchema> {
    transport?: string | string[];
    name?: string;
    method?: RpcHttpMethod;
    path?: string;
    params?: TParams;
    response?: TResponse;
    handler: RpcHandler<InferType<TParams>, InferType<TResponse>>;
    postHandler?: RpcPostHandler<InferType<TParams>, InferType<TResponse>>;
    isDeprecated?: boolean | string;
    description?: string;
}

export type RpcHandler<TParams, TResponse> = (
    context: RpcHandlerContext<TParams>,
) => Promise<TResponse> | TResponse;

export type RpcPostHandler<TParams, TResponse> = (
    context: RpcPostHandlerContext<TParams, TResponse>,
) => Promise<void> | void;

export function defineRpc<
    TParams extends AObjectSchema | ADiscriminatorSchema<any>,
    TResponse extends AObjectSchema | ADiscriminatorSchema<any>,
>(config: Rpc<TParams, TResponse>) {
    return config;
}
