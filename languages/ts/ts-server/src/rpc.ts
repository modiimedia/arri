import { RpcHttpMethod } from '@arrirpc/codegen-utils';
import {
    ADiscriminatorSchema,
    AObjectSchema,
    ASchema,
    InferType,
} from '@arrirpc/schema';

export interface RpcContext<TInput> {
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
    input: TInput;
}

export interface RpcPostHandlerContext<TInput, TOutput> extends Omit<
    RpcContext<TInput>,
    'input'
> {
    input: TInput;
    output: TOutput;
}

export interface Rpc<
    TInput extends ASchema | undefined = undefined,
    TOutput extends ASchema | undefined = undefined,
> {
    transport?: string | string[];
    name?: string;
    method?: RpcHttpMethod;
    path?: string;
    input?: TInput;
    output?: TOutput;
    handler: RpcHandler<
        TInput extends ASchema ? InferType<TInput> : undefined,
        TOutput extends ASchema ? InferType<TOutput> : void | undefined
    >;
    postHandler?: RpcPostHandler<
        TInput extends ASchema ? InferType<TInput> : undefined,
        TOutput extends ASchema ? InferType<TOutput> : undefined
    >;
    isDeprecated?: boolean | string;
    description?: string;
}

export type RpcHandler<TInput, TOutput> = (
    context: RpcContext<TInput>,
) => TOutput | Promise<TOutput>;

export type RpcPostHandler<TInput = undefined, TOutput = undefined> = (
    context: RpcPostHandlerContext<TInput, TOutput>,
) => Promise<void> | void;

export function defineRpc<
    TInput extends AObjectSchema<any> | ADiscriminatorSchema<any> | undefined =
        undefined,
    TOutput extends AObjectSchema<any> | ADiscriminatorSchema<any> | undefined =
        undefined,
>(config: Rpc<TInput, TOutput>) {
    if (config.input?.isNullable || config.output?.isNullable) {
        throw new Error(`Root schemas for procedures cannot be nullable`);
    }
    return config;
}
