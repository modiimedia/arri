import { RpcHttpMethod } from '@arrirpc/codegen-utils';
import {
    ASchema,
    CompiledValidator,
    InferType,
    ValueError,
} from '@arrirpc/schema';
import * as h3 from 'h3';

import { RpcContext } from './context';

export interface EventStreamHandlerContext<TParams, TResponse>
    extends RpcContext {
    params: TParams;
    stream: EventStreamConnection<TResponse>;
}

export type EventStreamRpcHandler<TParams, TResponse> = (
    context: EventStreamHandlerContext<TParams, TResponse>,
) => Promise<void> | void;

export interface EventStreamRpc<
    TParams extends ASchema,
    TResponse extends ASchema,
> {
    isEventStream: true;
    transport?: string | string[];
    name?: string;
    method?: RpcHttpMethod;
    path?: string;
    params?: TParams;
    response?: TResponse;
    handler: EventStreamRpcHandler<InferType<TParams>, InferType<TResponse>>;
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

export interface EventStreamInterface {
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

export class EventStreamConnection<TData> {
    readonly connection: EventStreamInterface;

    private readonly _validator: CompiledValidator<ASchema<TData>>;
    private _pingInterval: any | undefined = undefined;
    private readonly _pingIntervalMs: number;

    constructor(
        connection: EventStreamInterface,
        validator: CompiledValidator<ASchema<TData>>,
        pingInterval: number,
    ) {
        this.connection = connection;
        this._validator = validator;
        this._pingIntervalMs = pingInterval;
    }

    get lastEventId(): string | undefined {
        return this.connection.lastEventId;
    }

    send() {
        void this.connection.send();
        this.connection.push({
            event: 'start',
            data: 'connection successful',
        });
        this._pingInterval = setInterval(async () => {
            await this.connection.push({
                event: 'ping',
                data: '',
            });
        }, this._pingIntervalMs);
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
            await this.connection.push(events);
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
        await this.connection.push({
            id: eventId,
            event: 'message',
            data: serialResult.value,
        });
        return {
            success: true,
        };
    }

    private cleanup() {
        if (this._pingInterval) {
            clearInterval(this._pingInterval);
        }
    }

    async close() {
        try {
            await this.connection.push({
                event: 'done',
                data: 'this stream has ended',
            });
        } catch (_) {
            // do nothing
        }
        this.connection.close();
    }

    onClosed(cb: () => any): void {
        this.connection.onClosed(cb);
    }
}

export function defineEventStreamRpc() {}
