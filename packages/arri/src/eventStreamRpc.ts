import { nextTick } from "node:process";
import { type InferType, a } from "arri-validate";
import {
    type H3Event,
    setHeaders,
    getHeader,
    setResponseStatus,
    sendStream,
    type Router,
    eventHandler,
    isPreflightRequest,
} from "h3";
import { handleH3Error, type ErrorResponse } from "./errors";
import { type MiddlewareEvent } from "./middleware";
import { type RouteOptions } from "./route";
import {
    type Rpc,
    type RpcParamSchema,
    type RpcHandlerContext,
    type RpcEvent,
    isRpcParamSchema,
    validateRpcRequestInput,
    isRpc,
} from "./rpc";

export function setSseHeaders(event: H3Event) {
    setHeaders(event, {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
    });
}

export function defineEventStreamRpc<
    TParams extends RpcParamSchema | undefined = undefined,
    TResponse extends RpcParamSchema | undefined | never = undefined,
>(
    config: Omit<EventStreamRpc<TParams, TResponse>, "isEventStream">,
): EventStreamRpc<TParams, TResponse> {
    return {
        ...config,
        method: config.method ?? "get",
        isEventStream: true,
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
    event: EventStreamRpcEvent<TParams, TResponse>,
) => void | Promise<void>;

export interface EventStreamRpcEvent<TParams, TResponse>
    extends RpcEvent<TParams> {
    connection: EventStreamConnection<TResponse>;
}

export interface EventStreamRpcHandlerContext<TParams = any, TResponse = any>
    extends RpcHandlerContext<TParams> {
    connection: EventStreamConnection<TResponse>;
}

export interface EventStreamConnectionOptions<TData> {
    serializer: (input: TData) => string;
    pingInterval?: number;
}

/**
 * A server sent event
 */
export interface Sse {
    id?: string;
    event?: string;
    data: string;
}

export function formatSse({ id, data, event }: Sse): string {
    const parts: string[] = [];
    if (id) {
        parts.push(`id: ${id}`);
    }
    if (event) {
        parts.push(`event: ${event}`);
    }
    parts.push(`data: ${data}`);
    const payload = `${parts.join("\n")}\n\n`;
    return payload;
}

export function formatSseList(events: Sse[]): string {
    let output = "";
    for (const event of events) {
        output += formatSse(event);
    }
    return output;
}

export class EventStreamConnection<TData> {
    lastEventId: string | undefined;
    private readonly writable: WritableStream;
    private readonly readable: ReadableStream;
    private readonly writer: WritableStreamDefaultWriter;
    private writerIsClosed: boolean = false;
    private readonly encoder: TextEncoder;
    private readonly serializer: (input: TData) => string;
    private readonly h3Event: H3Event;
    private pingInterval: NodeJS.Timeout | undefined = undefined;
    private readonly pingIntervalMs: number;

    constructor(event: H3Event, opts: EventStreamConnectionOptions<TData>) {
        this.h3Event = event;
        const id = getHeader(event, "Last-Event-ID");
        this.lastEventId = id;

        const { readable, writable } = new TransformStream();
        this.writable = writable;
        this.readable = readable;
        this.writer = writable.getWriter();
        this.encoder = new TextEncoder();
        this.pingIntervalMs = opts.pingInterval ?? 60000;

        this.serializer = opts.serializer;
        void this.writer.closed.then(() => {
            this.writerIsClosed = true;
        });
    }

    /**
     * Start sending the event stream to the client
     */
    start() {
        setSseHeaders(this.h3Event);
        setResponseStatus(this.h3Event, 200);
        this.h3Event._handled = true;
        void sendStream(this.h3Event, this.readable);
        this.pingInterval = setInterval(async () => {
            await this.publishEvent({
                id: this.lastEventId,
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
            const events: Sse[] = [];
            for (const item of data) {
                events.push({
                    id: eventId,
                    event: "message",
                    data: this.serializer(item),
                });
            }
            await this.publishEvents(events);
            return;
        }
        await this.publishEvent({
            id: eventId,
            event: "message",
            data: this.serializer(data),
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
    async pushError(error: ErrorResponse, eventId?: string) {
        await this.publishEvent({
            id: eventId,
            event: "error",
            data: JSON.stringify(error),
        });
    }

    private async publishEvents(events: Sse[]) {
        const payload = formatSseList(events);
        if (this.writerIsClosed) {
            try {
                this.h3Event.node.res.end();
            } catch (_) {
                await this.cleanup();
            }
            return;
        }
        await this.writer.write(this.encoder.encode(payload));
    }

    private async publishEvent(event: Sse) {
        const payload = formatSse(event);
        if (this.writerIsClosed) {
            try {
                this.h3Event.node.res.end();
            } catch (_) {
                await this.cleanup();
            }
            return;
        }
        await this.writer.write(this.encoder.encode(payload));
    }

    private async cleanup() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }
        if (!this.writerIsClosed) {
            try {
                await this.writer.close();
            } catch (_) {}
        }
    }

    /**
     * Tell clients that the stream has ended and close the connection.
     */
    async end() {
        await this.publishEvent({
            event: "done",
            data: "this stream has ended",
        }).catch();
        await new Promise((resolve, reject) => {
            nextTick(() => {
                try {
                    this.h3Event.node.res.end();
                    resolve(true);
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    on(event: "disconnect", callback: () => any): void;
    on(event: "end", callback: () => any): void;
    on(event: "disconnect" | "end", callback: () => any) {
        switch (event) {
            case "disconnect":
                this.h3Event.node.req.on("close", async () => {
                    await callback();
                    await this.cleanup();
                });
                break;
            case "end":
                this.h3Event.node.req.on("end", async () => {
                    await callback();
                    await this.cleanup();
                });
                break;
        }
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
            const connection = new EventStreamConnection(event, {
                pingInterval: procedure.pingInterval,
                serializer:
                    responseValidator?.serialize ??
                    function (_) {
                        return "";
                    },
            });
            event.context.connection = connection;
            await procedure.handler(
                event.context as EventStreamRpcHandlerContext,
                event as EventStreamRpcEvent<any, any>,
            );
        } catch (err) {
            await handleH3Error(err, event, opts.onError);
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
