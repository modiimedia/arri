import { RpcHttpMethod } from '@arrirpc/codegen-utils';
import {
    ADiscriminatorSchema,
    AObjectSchema,
    ASchema,
    InferType,
} from '@arrirpc/schema';

export interface RpcContext<TParams> {
    rpcName: string;
    reqStart: Date;
    transport: string;
    clientVersion?: string;
    headers: Record<string, string | undefined>;
    params: TParams;
}

export interface RpcPostHandlerContext<TParams, TResponse>
    extends Omit<RpcContext<TParams>, 'params'> {
    params: TParams;
    response: TResponse;
}

export interface Rpc<
    TParams extends ASchema | undefined = undefined,
    TResponse extends ASchema | undefined = undefined,
> {
    transport?: string | string[];
    name?: string;
    method?: RpcHttpMethod;
    path?: string;
    params?: TParams;
    response?: TResponse;
    handler: RpcHandler<
        TParams extends ASchema ? InferType<TParams> : undefined,
        TResponse extends ASchema ? InferType<TResponse> : undefined
    >;
    postHandler?: RpcPostHandler<
        TParams extends ASchema ? InferType<TParams> : undefined,
        TResponse extends ASchema ? InferType<TResponse> : undefined
    >;
    isDeprecated?: boolean | string;
    description?: string;
}

export type RpcHandler<TParams = undefined, TResponse = undefined> = (
    context: RpcContext<TParams>,
) => TResponse extends undefined
    ? Promise<void> | void
    : Promise<TResponse> | TResponse;

export type RpcPostHandler<TParams = undefined, TResponse = undefined> = (
    context: RpcPostHandlerContext<TParams, TResponse>,
) => Promise<void> | void;

export function defineRpc<
    TParams extends
        | AObjectSchema
        | ADiscriminatorSchema<any>
        | undefined = undefined,
    TResponse extends
        | AObjectSchema
        | ADiscriminatorSchema<any>
        | undefined = undefined,
>(config: Rpc<TParams, TResponse>) {
    return config;
}
