import { RpcHttpMethod } from '@arrirpc/codegen-utils';
import { StreamMessage } from '@arrirpc/core';
import {
    a,
    ADiscriminatorSchema,
    AObjectSchema,
    ASchema,
    CompiledValidator,
    InferType,
    ValueError,
} from '@arrirpc/schema';

import { RpcContext } from './rpc';

export interface OutputStreamHandlerContext<TInput, TOutput>
    extends RpcContext<TInput> {
    stream: RpcOutputStreamConnection<TOutput>;
}

export type OutputStreamRpcHandler<TInput, TOutput> = (
    context: OutputStreamHandlerContext<TInput, TOutput>,
) => Promise<void> | void;

// InputStreamRpc
// ClientStreamRpc

export interface OutputStreamRpc<
    TInput extends ASchema | undefined = undefined,
    TOutput extends ASchema | undefined = undefined,
> {
    transport?: string | string[];
    name?: string;
    method?: RpcHttpMethod;
    path?: string;
    input?: TInput;
    output?: TOutput;
    outputIsStream: true;
    handler: OutputStreamRpcHandler<
        TInput extends ASchema ? InferType<TInput> : undefined,
        TOutput extends ASchema ? InferType<TOutput> : undefined
    >;
    isDeprecated?: boolean | string;
    description?: string;
}

export function isEventStreamRpc(
    input: unknown,
): input is OutputStreamRpc<any, any> {
    return (
        typeof input === 'object' &&
        input !== null &&
        'outputIsStream' in input &&
        typeof input.outputIsStream === 'boolean' &&
        input.outputIsStream &&
        'handler' in input &&
        typeof input.handler === 'function'
    );
}

export interface StreamDispatcher<T> {
    lastMessageId?: string;

    get isActive(): boolean;
    get isPaused(): boolean;
    start(): void;
    pause(): void;
    resume(): void | Promise<void>;
    push(msg: StreamMessage<T>): Promise<void> | void;
    push(msgs: StreamMessage<T>[]): Promise<void> | void;
    push(msg: StreamMessage<T> | StreamMessage<T>[]): Promise<void> | void;

    close(): void;
    onClosed(cb: () => void): void;
}

export type OutputStreamPushResult =
    | {
          success: true;
      }
    | { success: false; errors: ValueError[] };

export class RpcOutputStreamConnection<TData> {
    readonly dispatcher: StreamDispatcher<string>;

    private readonly _reqId: string | undefined;
    private readonly _validator: CompiledValidator<ASchema<TData>>;
    private _heartbeatInterval: any | undefined = undefined;
    private readonly _heartbeatIntervalMs: number;
    private readonly _heartbeatEnabled: boolean;

    constructor(
        dispatcher: StreamDispatcher<string>,
        validator: CompiledValidator<ASchema<TData>> | undefined,
        heartbeatInterval: number,
        heartbeatEnabled: boolean,
        reqId: string | undefined,
    ) {
        this.dispatcher = dispatcher;
        this._validator = validator ?? a.compile(a.any());
        this._heartbeatIntervalMs = heartbeatInterval;
        this._heartbeatEnabled = heartbeatEnabled;
        this._reqId = reqId;
    }

    get lastEventId(): string | undefined {
        return this.dispatcher.lastMessageId;
    }

    private _customHeaders: Record<string, string> = {};

    setResponseHeader(key: string, val: string) {
        this._customHeaders[key] = val;
    }

    setResponseHeaders(headers: Record<string, string>) {
        for (const [key, val] of Object.entries(headers)) {
            this._customHeaders[key] = val;
        }
    }

    get isActive() {
        return this.dispatcher.isActive;
    }

    get isPaused() {
        return this.dispatcher.isPaused;
    }

    pause() {
        return this.dispatcher.pause();
    }

    resume() {
        return this.dispatcher.resume();
    }

    start() {
        void this.dispatcher.start();
        this.dispatcher.push({
            type: 'STREAM_START',
            reqId: this._reqId,
            heartbeatInterval: this._heartbeatIntervalMs,
            contentType: 'application/json',
            customHeaders: this._customHeaders,
        });
        if (this._heartbeatEnabled) {
            this._heartbeatInterval = setInterval(async () => {
                await this.heartbeat();
            }, this._heartbeatIntervalMs);
        }
    }

    async push(data: TData, eventId?: string): Promise<OutputStreamPushResult>;
    async push(
        data: TData[],
        eventId?: string,
    ): Promise<OutputStreamPushResult[]>;
    async push(data: TData | TData[], msgId?: string) {
        if (Array.isArray(data)) {
            const results: OutputStreamPushResult[] = [];
            const events: StreamMessage<string>[] = [];
            for (const item of data) {
                if (!this._validator.validate(item)) {
                    const errors = this._validator.errors(item);
                    results.push({
                        success: false,
                        errors: errors,
                    });
                    continue;
                }
                const serialResult = this._validator.serialize(item);
                if (!serialResult.success) {
                    results.push(serialResult);
                    continue;
                }
                events.push({
                    type: 'STREAM_DATA',
                    reqId: this._reqId,
                    msgId: msgId,
                    body: serialResult.value,
                });
            }
            await this.dispatcher.push(events);
            return results;
        }
        if (!this._validator.validate(data)) {
            const errors = this._validator.errors(data);
            return {
                success: false,
                errors: errors,
            };
        }
        const serialResult = this._validator.serialize(data);
        if (!serialResult.success) {
            return serialResult;
        }
        await this.dispatcher.push({
            type: 'STREAM_DATA',
            reqId: this._reqId,
            msgId: msgId,
            body: serialResult.value,
        });
        return {
            success: true,
        };
    }

    /**
     * This is called automatically using the heartbeatMs option, unless you have manually disabled the heartbeat messages
     */
    async heartbeat() {
        await this.dispatcher.push({
            type: 'HEARTBEAT',
            heartbeatInterval: this._heartbeatInterval,
        });
    }

    private cleanup() {
        if (this._heartbeatInterval) {
            clearInterval(this._heartbeatInterval);
        }
    }

    async close(options?: { reason?: string; notifyClients?: boolean }) {
        if (options?.notifyClients ?? true) {
            try {
                await this.dispatcher.push({
                    type: 'STREAM_END',
                    reqId: this._reqId,
                    reason: options?.reason,
                });
            } catch (_) {
                // do nothing
            }
        }
        this.dispatcher.close();
        this.cleanup();
    }

    onClosed(cb: () => any): void {
        this.dispatcher.onClosed(cb);
    }
}

export function defineOutputStreamRpc<
    TInput extends
        | AObjectSchema
        | ADiscriminatorSchema<any>
        | undefined = undefined,
    TOutput extends
        | AObjectSchema
        | ADiscriminatorSchema<any>
        | undefined = undefined,
>(
    config: Omit<OutputStreamRpc<TInput, TOutput>, 'outputIsStream'>,
): OutputStreamRpc<TInput, TOutput> {
    return {
        outputIsStream: true,
        ...config,
    };
}
