import { RpcHttpMethod } from '@arrirpc/codegen-utils';
import {
    a,
    ADiscriminatorSchema,
    AObjectSchema,
    ASchema,
    CompiledValidator,
    InferType,
    ValueError,
} from '@arrirpc/schema';
import * as h3 from 'h3';

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
    heartbeatEnabled?: boolean;
    heartbeatMs?: number;
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

export interface EventStreamDispatcher {
    lastEventId?: string;

    send(): void;

    push(msg: h3.EventStreamMessage): Promise<void> | void;
    push(msgs: h3.EventStreamMessage[]): Promise<void> | void;
    push(
        msg: h3.EventStreamMessage | h3.EventStreamMessage[],
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
    readonly dispatcher: EventStreamDispatcher;

    private readonly _validator: CompiledValidator<ASchema<TData>>;
    private _heartbeatInterval: any | undefined = undefined;
    private readonly _heartbeatIntervalMs: number;
    private readonly _heartbeatEnabled: boolean;

    constructor(
        dispatcher: EventStreamDispatcher,
        validator: CompiledValidator<ASchema<TData>> | undefined,
        heartbeatInterval: number,
        heartbeatEnabled: boolean,
    ) {
        this.dispatcher = dispatcher;
        this._validator = validator ?? a.compile(a.any());
        this._heartbeatIntervalMs = heartbeatInterval;
        this._heartbeatEnabled = heartbeatEnabled;
    }

    get lastEventId(): string | undefined {
        return this.dispatcher.lastEventId;
    }

    send() {
        void this.dispatcher.send();
        this.dispatcher.push({
            event: 'start',
            data: 'connection successful',
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
            const events: h3.EventStreamMessage[] = [];
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
                    id: eventId,
                    event: 'message',
                    data: serialResult.value,
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
            id: eventId,
            event: 'message',
            data: serialResult.value,
        });
        return {
            success: true,
        };
    }

    /**
     * This is called automatically using the heartbeatMs option, unless you have manually disabled the heartbeat messages
     */
    async heartbeat() {
        await this.dispatcher.push({ event: 'heartbeat', data: '' });
    }

    private cleanup() {
        if (this._heartbeatInterval) {
            clearInterval(this._heartbeatInterval);
        }
    }

    async close(notifyClients = true) {
        if (notifyClients) {
            try {
                await this.dispatcher.push({
                    event: 'done',
                    data: 'this stream has ended',
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
