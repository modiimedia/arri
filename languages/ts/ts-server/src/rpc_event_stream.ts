import { RpcHttpMethod } from '@arrirpc/codegen-utils';
import { ServerEventStreamMessage } from '@arrirpc/core';
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

export interface EventStreamHandlerContext<TParams, TResponse>
    extends RpcContext<TParams> {
    stream: RpcEventStreamConnection<TResponse>;
}

export type EventStreamRpcHandler<TParams, TResponse> = (
    context: EventStreamHandlerContext<TParams, TResponse>,
) => Promise<void> | void;

export interface EventStreamRpc<
    TParams extends ASchema | undefined = undefined,
    TResponse extends ASchema | undefined = undefined,
> {
    isEventStream: true;
    transport?: string | string[];
    name?: string;
    method?: RpcHttpMethod;
    path?: string;
    params?: TParams;
    response?: TResponse;
    handler: EventStreamRpcHandler<
        TParams extends ASchema ? InferType<TParams> : undefined,
        TResponse extends ASchema ? InferType<TResponse> : undefined
    >;
    isDeprecated?: boolean | string;
    description?: string;
}

export function isEventStreamRpc(
    input: unknown,
): input is EventStreamRpc<any, any> {
    return (
        typeof input === 'object' &&
        input !== null &&
        'isEventStream' in input &&
        typeof input.isEventStream === 'boolean' &&
        input.isEventStream &&
        'handler' in input &&
        typeof input.handler === 'function'
    );
}

export interface EventStreamDispatcher<T> {
    lastEventId?: string;

    send(): void;

    push(msg: ServerEventStreamMessage<T>): Promise<void> | void;
    push(msgs: ServerEventStreamMessage<T>[]): Promise<void> | void;
    push(
        msg: ServerEventStreamMessage<T> | ServerEventStreamMessage<T>[],
    ): Promise<void> | void;

    close(): void;
    onClosed(cb: () => void): void;
}

export type EventStreamPushResult =
    | {
          success: true;
      }
    | { success: false; errors: ValueError[] };

export class RpcEventStreamConnection<TData> {
    readonly dispatcher: EventStreamDispatcher<string>;

    private readonly _reqId: string | undefined;
    private readonly _validator: CompiledValidator<ASchema<TData>>;
    private _heartbeatInterval: any | undefined = undefined;
    private readonly _heartbeatIntervalMs: number;
    private readonly _heartbeatEnabled: boolean;

    constructor(
        dispatcher: EventStreamDispatcher<string>,
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
        return this.dispatcher.lastEventId;
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

    send() {
        void this.dispatcher.send();
        this.dispatcher.push({
            type: 'ES_START',
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

    async push(data: TData, eventId?: string): Promise<EventStreamPushResult>;
    async push(
        data: TData[],
        eventId?: string,
    ): Promise<EventStreamPushResult[]>;
    async push(data: TData | TData[], eventId?: string) {
        if (Array.isArray(data)) {
            const results: EventStreamPushResult[] = [];
            const events: ServerEventStreamMessage<string>[] = [];
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
                    type: 'ES_EVENT',
                    reqId: this._reqId,
                    eventId: eventId,
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
            type: 'ES_EVENT',
            reqId: this._reqId,
            eventId: eventId,
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
                    type: 'ES_END',
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

export function defineEventStreamRpc<
    TParams extends
        | AObjectSchema
        | ADiscriminatorSchema<any>
        | undefined = undefined,
    TResponse extends
        | AObjectSchema
        | ADiscriminatorSchema<any>
        | undefined = undefined,
>(
    config: Omit<EventStreamRpc<TParams, TResponse>, 'isEventStream'>,
): EventStreamRpc<TParams, TResponse> {
    return {
        isEventStream: true,
        ...config,
    };
}
