import { InferType, ResultSuccess, ValueError } from '@arrirpc/schema';
import {
    createEventStream,
    eventHandler,
    EventStream,
    EventStreamMessage,
    getHeader,
    type H3Event,
    isPreflightRequest,
    type Router,
} from 'h3';

import { type RpcEventContext } from './context';
import { handleH3Error } from './errors';
import { type MiddlewareEvent } from './middleware';
import { type RouteOptions } from './route';
import {
    getSchemaValidator,
    isRpc,
    isRpcParamSchema,
    RequestValidator,
    Rpc,
    type RpcEvent,
    type RpcParamSchema,
    validateRpcRequestInput,
} from './rpc';

export function defineEventStreamRpc<
    TResponse extends RpcParamSchema<any>,
    TParams extends RpcParamSchema<any> | undefined = undefined,
    TTransport extends string = 'http',
>(
    config: Omit<
        EventStreamRpc<TParams, TResponse, TTransport>,
        'isEventStream'
    >,
): EventStreamRpc<TParams, TResponse, TTransport> {
    return {
        ...config,
        method: config.method ?? 'get',
        isEventStream: true,
    };
}

export function isEventStreamRpc(
    input: unknown,
): input is EventStreamRpc<any, any> {
    return (
        isRpc(input) && 'isEventStream' in input && input.isEventStream === true
    );
}

export interface EventStreamRpc<
    TParams extends RpcParamSchema | undefined = undefined,
    TResponse extends RpcParamSchema | undefined = undefined,
    TTransport extends string = 'http',
> extends Omit<
        Rpc<true, TParams, TResponse, TTransport>,
        'handler' | 'postHandler'
    > {
    isEventStream: true;
    handler: EventStreamRpcHandler<
        TParams extends RpcParamSchema ? InferType<TParams> : undefined,
        TResponse extends RpcParamSchema ? InferType<TResponse> : undefined
    >;
}

export type EventStreamRpcHandler<TParams, TResponse> = (
    context: EventStreamRpcHandlerContext<TParams, TResponse>,
    event: RpcEvent<TResponse>,
) => void | Promise<void>;

export interface EventStreamRpcHandlerContext<TParams = any, TResponse = any>
    extends RpcEventContext<TParams> {
    stream: H3EventStreamConnection<TResponse>;
}

export interface EventStreamConnectionOptions<TData> {
    validator?: RequestValidator<TData>;
    pingInterval?: number;
}

export interface EventStreamConnection<TData> {
    readonly lastEventId?: string;

    send(): void;

    push(msg: TData[], eventId?: string): Promise<SsePushResult[]>;
    push(msg: TData, eventId?: string): Promise<SsePushResult>;
    push(
        _: TData | TData[],
        __?: string,
    ): Promise<SsePushResult> | Promise<SsePushResult[]>;

    close(): void;
    onClosed(cb: () => any): void;
}

export class H3EventStreamConnection<TData>
    implements EventStreamConnection<TData>
{
    readonly lastEventId?: string;
    private readonly validator?: RequestValidator<TData>;
    // for some reason Rollup cannot output DTS when this is set to NodeJS.Timeout
    private pingInterval: any | undefined = undefined;
    private readonly pingIntervalMs: number;
    readonly eventStream: EventStream;

    constructor(event: H3Event, opts: EventStreamConnectionOptions<TData>) {
        this.eventStream = createEventStream(event);
        this.lastEventId = getHeader(event, 'Last-Event-Id');
        this.pingIntervalMs = opts.pingInterval ?? 60000;
        this.validator = opts.validator;
        this.eventStream.onClosed(() => {
            this.cleanup();
        });
    }

    /**
     * Send the stream to the client. This must be called before sending any events.
     */
    send() {
        void this.eventStream.send();
        this.eventStream.push({
            event: 'start',
            data: 'connection successful',
        });
        this.pingInterval = setInterval(async () => {
            await this.eventStream.push({
                event: 'ping',
                data: '',
            });
        }, this.pingIntervalMs);
    }

    /**
     * Publish a new event. Events published with this hook will trigger the `onData()` hooks of any connected clients.
     */
    async push(data: TData[], eventId?: string): Promise<SsePushResult[]>;
    async push(data: TData, eventId?: string): Promise<SsePushResult>;
    async push(data: TData | TData[], eventId?: string) {
        if (!this.validator) return;
        if (Array.isArray(data)) {
            const results: SsePushResult[] = [];
            const events: EventStreamMessage[] = [];
            for (const item of data) {
                if (this.validator.validate(item)) {
                    events.push({
                        id: eventId,
                        event: 'message',
                        data: (
                            this.validator.serialize(
                                item,
                            ) as ResultSuccess<string>
                        ).value,
                    });
                    results.push({ success: true });
                    continue;
                }
                const errors = this.validator.errors(item);
                results.push({
                    success: false,
                    errors,
                });
            }
            await this.eventStream.push(events);
            return results;
        }
        if (this.validator.validate(data)) {
            await this.eventStream.push({
                id: eventId,
                event: 'message',
                data: (this.validator.serialize(data) as ResultSuccess<string>)
                    .value,
            });
            return { success: true };
        }
        const errors = this.validator.errors(data);
        return {
            success: false,
            errors,
        };
    }

    private cleanup() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }
    }

    /**
     * Tell clients that the stream has ended and close the connection.
     */
    async close() {
        await this.eventStream
            .push({
                event: 'done',
                data: 'this stream has ended',
            })
            .catch();
        await this.eventStream.close();
    }

    onClosed(cb: () => any): void {
        this.eventStream.onClosed(cb);
    }
}

export type SsePushResult =
    | {
          success: true;
      }
    | { success: false; errors: ValueError[] };

export function registerEventStreamRpc(
    router: Router,
    path: string,
    procedure: EventStreamRpc<any, any> & { name: string },
    opts: RouteOptions,
) {
    const paramValidator = procedure.params
        ? getSchemaValidator(procedure.name, 'params', procedure.params)
        : undefined;
    const responseValidator = procedure.response
        ? getSchemaValidator(procedure.name, 'response', procedure.response)
        : undefined;
    const httpMethod = procedure.method ?? 'get';
    const handler = eventHandler(async (event: MiddlewareEvent) => {
        event.context.rpcName = procedure.name;
        if (isPreflightRequest(event)) {
            return 'ok';
        }
        try {
            if (opts.onRequest) {
                await opts.onRequest(event);
            }
            if (opts.middleware.length) {
                for (const m of opts.middleware) {
                    await m(event);
                }
            }
            if (isRpcParamSchema(procedure.params)) {
                await validateRpcRequestInput(
                    event,
                    httpMethod,
                    paramValidator!,
                );
            }
            const stream = new H3EventStreamConnection(event, {
                pingInterval: procedure.pingInterval,
                validator: responseValidator,
            });
            event.context.stream = stream;
            await procedure.handler(
                event.context as EventStreamRpcHandlerContext,
                event as RpcEvent<any>,
            );
            if (!event.handled) {
                stream.send();
            }
        } catch (err) {
            await handleH3Error(err, event, opts.onError, opts.debug ?? false);
        }
        return '';
    });
    switch (httpMethod) {
        case 'get':
            router.get(path, handler);
            break;
        case 'delete':
            router.delete(path, handler);
            break;
        case 'patch':
            router.patch(path, handler);
            break;
        case 'put':
            router.put(path, handler);
            break;
        case 'post':
        default:
            router.post(path, handler);
            break;
    }
}
