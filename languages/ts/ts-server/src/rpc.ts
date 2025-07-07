import { RpcHttpMethod } from '@arrirpc/codegen-utils';
import {
    ADiscriminatorSchema,
    AObjectSchema,
    ASchema,
    InferType,
} from '@arrirpc/schema';

export interface RpcContext<TParams> {
    /**
     * ID sent by the client using the `req-id` header
     *
     * [NOTE] This ID is NOT universally unique it is only unique to the client.
     */
    reqId: string | undefined;
    /**
     * The name of the procedure being invoked
     */
    rpcName: string;
    /**
     * When the request began
     */
    reqStart: Date;
    /**
     * Which transport the request was sent over. Example: "http", "ws", etc
     */
    transport: string;
    remoteAddress: string | undefined;
    /**
     * Value of the `client-version` header sent by the client.
     *
     * For Arri generated clients the `client-version` header will match the `version` option
     * if set when initializing the ArriApp
     */
    clientVersion: string | undefined;
    headers: Record<string, string | undefined>;
    setResponseHeader(key: string, val: string): void;
    setResponseHeaders(headers: Record<string, string>): void;
    /**
     * The RPC request parameters
     */
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
        TResponse extends ASchema ? InferType<TResponse> : void | undefined
    >;
    postHandler?: RpcPostHandler<
        TParams extends ASchema ? InferType<TParams> : undefined,
        TResponse extends ASchema ? InferType<TResponse> : undefined
    >;
    isDeprecated?: boolean | string;
    description?: string;
}

export type RpcHandler<TParams, TResponse> = (
    context: RpcContext<TParams>,
) => TResponse | Promise<TResponse>;

export type RpcPostHandler<TParams = undefined, TResponse = undefined> = (
    context: RpcPostHandlerContext<TParams, TResponse>,
) => Promise<void> | void;

export function defineRpc<
    TParams extends
        | AObjectSchema<any>
        | ADiscriminatorSchema<any>
        | undefined = undefined,
    TResponse extends
        | AObjectSchema<any>
        | ADiscriminatorSchema<any>
        | undefined = undefined,
>(config: Rpc<TParams, TResponse>) {
    if (config.params?.isNullable || config.response?.isNullable) {
        throw new Error(`Root schemas for procedures cannot be nullable`);
    }
    return config;
}
