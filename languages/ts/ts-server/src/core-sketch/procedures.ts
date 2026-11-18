import type { ArriHeaders, ErrorCode } from '@arrirpc/core';

import type { TransportInfo } from './transport';

export interface Codec<T> {
    /**
     * Throw to reject the input. The client receives an INVALID_INPUT error.
     */
    decode(body: Uint8Array | undefined): T;
    encode(value: T): Uint8Array;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function jsonCodec<T>(
    validate?: (value: unknown) => value is T,
): Codec<T> {
    return {
        decode(body) {
            const value: unknown = JSON.parse(
                body ? textDecoder.decode(body) : 'null',
            );
            if (validate && !validate(value)) {
                throw new Error('Input failed validation.');
            }
            return value as T;
        },
        encode: (value) => textEncoder.encode(JSON.stringify(value)),
    };
}

export interface CallContext {
    rpcName: string;
    headers: ArriHeaders;
    /**
     * Sent with OK, ERROR, or STREAM_START (whichever the call sends first).
     */
    responseHeaders: ArriHeaders;
    /**
     * Aborted when the client cancels the call or the connection closes.
     */
    signal: AbortSignal;
    transport: TransportInfo;
}

export interface OutputStream<T> {
    send(value: T, options?: { msgId?: string }): Promise<void>;
    /**
     * Send STREAM_START immediately. Otherwise it is sent along with the first item, which lets
     * a procedure fail with a regular error response (e.g. an HTTP status code) before committing to a stream.
     */
    start(): Promise<void>;
}

export interface UnaryProcedure<TInput, TOutput> {
    kind: 'unary';
    input: Codec<TInput>;
    output: Codec<TOutput>;
    handler(input: TInput, context: CallContext): TOutput | Promise<TOutput>;
}

/**
 * The call ends with STREAM_END when the handler resolves.
 */
export interface OutputStreamProcedure<TInput, TOutput> {
    kind: 'outputStream';
    input: Codec<TInput>;
    output: Codec<TOutput>;
    handler(
        input: TInput,
        output: OutputStream<TOutput>,
        context: CallContext,
    ): void | Promise<void>;
}

export interface InputStreamProcedure<TInput, TOutput> {
    kind: 'inputStream';
    input: Codec<TInput>;
    output: Codec<TOutput>;
    handler(
        inputs: AsyncIterable<TInput>,
        context: CallContext,
    ): TOutput | Promise<TOutput>;
}

/**
 * The call ends with STREAM_END when the handler resolves.
 */
export interface BidirectionalProcedure<TInput, TOutput> {
    kind: 'bidirectional';
    input: Codec<TInput>;
    output: Codec<TOutput>;
    handler(
        inputs: AsyncIterable<TInput>,
        output: OutputStream<TOutput>,
        context: CallContext,
    ): void | Promise<void>;
}

export type Procedure =
    | UnaryProcedure<any, any>
    | OutputStreamProcedure<any, any>
    | InputStreamProcedure<any, any>
    | BidirectionalProcedure<any, any>;

export type ProcedureKind = Procedure['kind'];

export function hasStreamedInput(
    procedure: Procedure,
): procedure is
    | InputStreamProcedure<any, any>
    | BidirectionalProcedure<any, any> {
    return (
        procedure.kind === 'inputStream' || procedure.kind === 'bidirectional'
    );
}

export function hasStreamedOutput(
    procedure: Procedure,
): procedure is
    | OutputStreamProcedure<any, any>
    | BidirectionalProcedure<any, any> {
    return (
        procedure.kind === 'outputStream' || procedure.kind === 'bidirectional'
    );
}

export function defineUnary<TInput, TOutput>(
    def: Omit<UnaryProcedure<TInput, TOutput>, 'kind'>,
): UnaryProcedure<TInput, TOutput> {
    return { kind: 'unary', ...def };
}

export function defineOutputStream<TInput, TOutput>(
    def: Omit<OutputStreamProcedure<TInput, TOutput>, 'kind'>,
): OutputStreamProcedure<TInput, TOutput> {
    return { kind: 'outputStream', ...def };
}

export function defineInputStream<TInput, TOutput>(
    def: Omit<InputStreamProcedure<TInput, TOutput>, 'kind'>,
): InputStreamProcedure<TInput, TOutput> {
    return { kind: 'inputStream', ...def };
}

export function defineBidirectional<TInput, TOutput>(
    def: Omit<BidirectionalProcedure<TInput, TOutput>, 'kind'>,
): BidirectionalProcedure<TInput, TOutput> {
    return { kind: 'bidirectional', ...def };
}

export class RpcError extends Error {
    readonly code: ErrorCode;
    readonly type?: string;
    readonly data?: unknown;

    constructor(
        code: ErrorCode,
        message: string,
        options?: { type?: string; data?: unknown },
    ) {
        super(message);
        this.name = 'RpcError';
        this.code = code;
        this.type = options?.type;
        this.data = options?.data;
    }
}
