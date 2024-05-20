import { a, type InferType, type ValueError } from "@arrirpc/schema";
import {
    eventHandler,
    type H3Event,
    isPreflightRequest,
    type Router,
} from "h3";
import {
    createEventStream,
    type EventStream,
    type EventStreamMessage,
} from "h3-sse";

import { type RpcEventContext } from "./context";
import {
    type ArriServerError,
    type ArriServerErrorResponse,
    defineError,
    handleH3Error,
} from "./errors";
import { type MiddlewareEvent } from "./middleware";
import { type RouteOptions } from "./route";
import {
    isRpc,
    isRpcParamSchema,
    type Rpc,
    type RpcEvent,
    type RpcParamSchema,
    validateRpcRequestInput,
} from "./rpc";

export function defineEventStreamRpc<
    TParams extends RpcParamSchema | undefined = undefined,
    TResponse extends RpcParamSchema | undefined | never = undefined,
>(
    config: Omit<
        EventStreamRpc<TParams, TResponse>,
        "isEventStream" | "transport"
    >,
): EventStreamRpc<TParams, TResponse> {
    return {
        ...config,
        method: config.method ?? "get",
        isEventStream: true,
        transport: "http",
    };
}

export function isEventStreamRpc(
    input: unknown,
): input is EventStreamRpc<any, any> {
    return (
        isRpc(input) && "isEventStream" in input && input.isEventStream === true
    );
}

export interface EventStreamRpc<
    TParams extends RpcParamSchema | undefined = undefined,
    TResponse extends RpcParamSchema | undefined = undefined,
> extends Omit<Rpc<true, TParams, TResponse>, "handler" | "postHandler"> {
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
    stream: EventStreamConnection<TResponse>;
}

export interface EventStreamConnectionOptions<TData> {
    validator: (input: unknown) => input is TData;
    validationErrors: (input: unknown) => ValueError[];
    serializer: (input: TData) => string;
    pingInterval?: number;
}

export class EventStreamConnection<TData> {
    readonly lastEventId?: string;
    private readonly validationErrors: (input: unknown) => ValueError[];
    private readonly validator: (input: unknown) => input is TData;
    private readonly serializer: (input: TData) => string;
    // for some reason Rollup cannot output DTS when this is set to NodeJS.Timeout
    private pingInterval: any | undefined = undefined;
    private readonly pingIntervalMs: number;
    readonly eventStream: EventStream;

    constructor(event: H3Event, opts: EventStreamConnectionOptions<TData>) {
        this.eventStream = createEventStream(event);
        this.lastEventId = this.eventStream.lastEventId;
        this.pingIntervalMs = opts.pingInterval ?? 60000;
        this.serializer = opts.serializer;
        this.validator = opts.validator;
        this.validationErrors = opts.validationErrors;
        this.eventStream.onClose(() => {
            this.cleanup();
        });
    }

    /**
     * Send the stream to the client. This must be called before sending any events.
     */
    send() {
        void this.eventStream.send();
        this.pingInterval = setInterval(async () => {
            await this.eventStream.push({
                event: "ping",
                data: "",
            });
        }, this.pingIntervalMs);
    }

    /**
     * Publish a new event. Events published with this hook will trigger the `onData()` hooks of any connected clients.
     */
    async push(data: TData[], eventId?: string): Promise<void>;
    async push(data: TData, eventId?: string): Promise<void>;
    async push(data: TData | TData[], eventId?: string) {
        if (Array.isArray(data)) {
            const events: EventStreamMessage[] = [];
            for (const item of data) {
                if (this.validator(item)) {
                    events.push({
                        id: eventId,
                        event: "message",
                        data: this.serializer(item),
                    });
                    continue;
                }
                const errors = this.validationErrors(item);
                const errorResponse: ArriServerError = defineError(500, {
                    message:
                        "Failed to serialize response. Response does not match specified schema.",
                    data: errors,
                });
                events.push({
                    id: eventId,
                    event: "error",
                    data: JSON.stringify(errorResponse),
                });
            }
            await this.eventStream.push(events);
            return;
        }
        if (this.validator(data)) {
            await this.eventStream.push({
                id: eventId,
                event: "message",
                data: this.serializer(data),
            });
            return;
        }
        const errors = this.validationErrors(data);
        const errorResponse = defineError(500, {
            message:
                "Failed to serialize response. Response does not match specified schema.",
            data: errors,
        });
        await this.eventStream.push({
            id: eventId,
            event: "error",
            data: JSON.stringify(errorResponse),
        });
    }

    // /**
    //  * Push a custom event. These events will need to be parsed manually using the `onEvent` hooks of any generated clients.
    //  * Note events with the name "error" or "message" cannot be used for custom events.
    //  */
    // async pushCustomEvent(event: SseEvent): Promise<void> {
    //     if (event.event === "message") {
    //         throw new Error(
    //             `Event type "message" is the default event type. Therefore it cannot be used when pushing custom events.`,
    //         );
    //     }
    //     if (event.event === "error") {
    //         throw new Error(
    //             `Event type "error" is reserved for the pushError() method. Therefore it cannot be used when pushing custom events.`,
    //         );
    //     }
    // }

    /**
     * Publish an error event. This will trigger the `onError` hooks of any connected clients.
     */
    async pushError(error: ArriServerErrorResponse, eventId?: string) {
        await this.eventStream.push({
            id: eventId,
            event: "error",
            data: JSON.stringify(error),
        });
    }

    private cleanup() {
        if (this.pingInterval) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            clearInterval(this.pingInterval);
        }
    }

    /**
     * Tell clients that the stream has ended and close the connection.
     */
    async close() {
        await this.eventStream
            .push({
                event: "done",
                data: "this stream has ended",
            })
            .catch();
        await this.eventStream.close();
    }

    onClose(cb: () => any): void {
        this.eventStream.onClose(cb);
    }
}

export function registerEventStreamRpc(
    router: Router,
    path: string,
    procedure: EventStreamRpc<any, any> & { name: string },
    opts: RouteOptions,
) {
    let responseValidator: undefined | ReturnType<typeof a.compile>;
    try {
        responseValidator = procedure.response
            ? a.compile(procedure.response)
            : undefined;
    } catch (err) {
        console.error("ERROR COMPILING VALIDATOR", err);
    }
    const httpMethod = procedure.method ?? "get";
    const handler = eventHandler(async (event: MiddlewareEvent) => {
        event.context.rpcName = procedure.name;
        if (isPreflightRequest(event)) {
            return "ok";
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
                    procedure.params,
                );
            }
            const stream = new EventStreamConnection(event, {
                pingInterval: procedure.pingInterval,
                validator:
                    responseValidator?.validate ??
                    (function () {
                        return true;
                    } as any),
                serializer:
                    // eslint-disable-next-line @typescript-eslint/unbound-method
                    responseValidator?.serialize ??
                    function (_) {
                        return "";
                    },
                validationErrors(input) {
                    if (procedure.response) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        return a.errors(procedure.response, input);
                    }
                    return [];
                },
            });
            event.context.stream = stream;
            await procedure.handler(
                event.context as EventStreamRpcHandlerContext,
                event as RpcEvent<any>,
            );
            if (!event.handled && !stream.eventStream._handled) {
                stream.send();
            }
        } catch (err) {
            await handleH3Error(err, event, opts.onError, opts.debug ?? false);
        }
        return "";
    });
    switch (httpMethod) {
        case "get":
            router.get(path, handler);
            break;
        case "delete":
            router.delete(path, handler);
            break;
        case "patch":
            router.patch(path, handler);
            break;
        case "put":
            router.put(path, handler);
            break;
        case "post":
        default:
            router.post(path, handler);
            break;
    }
}
