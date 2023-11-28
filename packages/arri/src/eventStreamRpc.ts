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
import { randomUUID } from "uncrypto";
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
        "Transfer-Encoding": "chunked",
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

export interface EventStreamConnectionOptions<TType> {
    serializer: (input: TType) => string;
    pingInterval?: number;
}

export class EventStreamConnection<TType> {
    sessionId: string;
    private readonly writable: WritableStream;
    private readonly readable: ReadableStream;
    private readonly writer: WritableStreamDefaultWriter;
    private readonly encoder: TextEncoder;
    private readonly serializer: (input: TType) => string;
    private readonly h3Event: H3Event;
    private pingInterval: NodeJS.Timeout | undefined = undefined;
    private readonly pingIntervalMs: number;

    constructor(event: H3Event, opts: EventStreamConnectionOptions<TType>) {
        this.h3Event = event;
        setSseHeaders(this.h3Event);
        setResponseStatus(this.h3Event, 200);
        const id = getHeader(event, "Last-Event-ID");
        this.sessionId = id?.length ? id : randomUUID();

        const { readable, writable } = new TransformStream();
        this.writable = writable;
        this.readable = readable;
        this.writer = writable.getWriter();
        this.encoder = new TextEncoder();
        this.pingIntervalMs = opts.pingInterval ?? 60000;

        this.serializer = opts.serializer;
    }

    startStream() {
        this.h3Event._handled = true;
        void sendStream(this.h3Event, this.readable);
        this.pingInterval = setInterval(async () => {
            await this.pushRawEvent({
                id: this.sessionId,
                event: "ping",
                data: "",
            });
        }, this.pingIntervalMs);
    }

    async push(data: TType) {
        await this.pushRawEvent({
            id: this.sessionId,
            event: "message",
            data: this.serializer(data),
        });
    }

    async pushError(error: ErrorResponse) {
        await this.pushRawEvent({
            id: this.sessionId,
            event: "error",
            data: JSON.stringify(error),
        });
    }

    private async pushRawEvent({
        id,
        data,
        event,
    }: {
        id?: string;
        data: string;
        event?: string;
    }) {
        const parts: string[] = [];
        if (id) {
            parts.push(`id: ${id}`);
        }
        if (event) {
            parts.push(`event: ${event}`);
        }
        parts.push(`data: ${data}`);
        const payload = `${parts.join("\n")}\n\n`;
        await this.writer.write(this.encoder.encode(payload));
    }

    private async cleanup() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }
        try {
            await this.writer.close();
        } catch (_) {}
    }

    async close() {
        this.h3Event.node.res.end();
        await this.cleanup();
    }

    on(event: "disconnect" | "close", callback: () => any) {
        switch (event) {
            case "disconnect":
                this.h3Event.node.req.on("close", callback);
                break;
            case "close":
                this.h3Event.node.req.on("end", callback);
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
            await procedure.handler(event.context as any, event as any);
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
