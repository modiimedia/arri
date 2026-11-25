import { ASchema, InferSubType } from '@arrirpc/schema';

import { RpcCall, RpcMeta } from './context';
import { MaybePromise } from './utils';

export type Rpc<TIn, TOut> =
    | UnaryRpc<TIn, TOut>
    | InStreamRpc<TIn, TOut>
    | OutStreamRpc<TIn, TOut>
    | DuplexStreamRpc<TIn, TOut>;

interface RpcBase<TIn, TOut> {
    transport?: string[];
    meta?: RpcMeta;
    tags?: string[];
    description?: string;
    isDeprecated?: boolean;
    input: ASchema<TIn> | undefined;
    output: ASchema<TOut> | undefined;
}

interface UnaryRpc<TIn, TOut> extends RpcBase<TIn, TOut> {
    type: 'unary';
    handler: RpcHandlerUnary<TIn, TOut>;
}

interface InStreamRpc<TIn, TOut> extends RpcBase<TIn, TOut> {
    type: 'in_stream';
    handler: RpcHandlerInStream<TIn, TOut>;
}

interface OutStreamRpc<TIn, TOut> extends RpcBase<TIn, TOut> {
    type: 'out_stream';
    handler: RpcHandlerOutStream<TIn, TOut>;
}

interface DuplexStreamRpc<TIn, TOut> extends RpcBase<TIn, TOut> {
    type: 'duplex_stream';
    handler: RpcHandlerDuplexStream<TIn, TOut>;
}

export type RpcHandlerUnary<TIn, TOut> = (
    input: TIn,
    call: RpcCall,
) => MaybePromise<TOut>;

export type RpcHandlerInStream<TIn, TOut> = (
    input: AsyncIterable<TIn>,
    call: RpcCall,
) => MaybePromise<TOut>;

export type RpcHandlerOutStream<TIn, TOut> = (
    input: TIn,
    call: RpcCall,
) => AsyncIterable<TOut> | Iterable<TOut>;

export type RpcHandlerDuplexStream<TIn, TOut> = (
    input: AsyncIterable<TIn>,
    call: RpcCall,
) => AsyncIterable<TOut> | Iterable<TOut>;

type RpcBuilder<TIn, TOut, TType extends Rpc<TIn, TOut>['type']> = Omit<
    InferSubType<Rpc<TIn, TOut>, 'type', TType>,
    'type'
>;

export function defineRpc<TIn, TOut>(input: RpcBuilder<TIn, TOut, 'unary'>) {
    return {
        type: 'unary',
        ...input,
    } satisfies Rpc<TIn, TOut>;
}

export function defineInStreamRpc<TIn, TOut>(
    input: RpcBuilder<TIn, TOut, 'in_stream'>,
) {
    return {
        type: 'in_stream',
        ...input,
    } satisfies Rpc<TIn, TOut>;
}

export function defineOutStreamRpc<TIn, TOut>(
    input: RpcBuilder<TIn, TOut, 'out_stream'>,
) {
    return {
        type: 'out_stream',
        ...input,
    } satisfies Rpc<TIn, TOut>;
}

export function defineDuplexStreamRpc<TIn, TOut>(
    input: RpcBuilder<TIn, TOut, 'duplex_stream'>,
) {
    return {
        type: 'duplex_stream',
        ...input,
    } satisfies Rpc<TIn, TOut>;
}
