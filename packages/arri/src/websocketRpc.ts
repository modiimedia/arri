import { type WsRpcDefinition } from "arri-codegen-utils";
import {
    type CompiledValidator,
    type ASchema,
    a,
    type InferType,
} from "arri-validate";
import { type Peer, type WSError } from "crossws";
import { defineWebSocketHandler, type Router } from "h3";
import { type ErrorResponse } from "./errors";
import {
    getRpcParamName,
    getRpcResponseName,
    type RpcParamSchema,
} from "./rpc";

export interface NamedWebsocketRpc<
    TParams extends RpcParamSchema | undefined = undefined,
    TResponse extends RpcParamSchema | undefined = undefined,
> extends WebsocketRpc<TParams, TResponse> {
    name: string;
}

export interface WebsocketRpc<
    TParams extends RpcParamSchema | undefined = undefined,
    TResponse extends RpcParamSchema | undefined = undefined,
> {
    transport: "ws";
    description?: string;
    path?: string;
    isDeprecated?: boolean;
    params: TParams;
    response: TResponse;
    pingInterval?: boolean;
    handler: WebSocketRpcHandler<
        TParams extends RpcParamSchema ? InferType<TParams> : undefined,
        TResponse extends RpcParamSchema ? InferType<TResponse> : undefined
    >;
}

interface WsPeerOpts<TResponse> {
    validator?: CompiledValidator<ASchema<TResponse>>;
    context: WsPeerContext;
}

export interface WsPeerContext extends Record<string, any> {
    rpcName: string;
    queryParams?: Record<string, string>;
    clientAddress?: string;
}

export class WsPeer<TResponse> {
    private readonly _peer: Peer;
    private readonly _validator?: CompiledValidator<ASchema<TResponse>>;

    context: WsPeerContext;
    url: string;

    constructor(peer: Peer, opts: WsPeerOpts<TResponse>) {
        this._peer = peer;
        this._validator = opts.validator;
        this.url = peer.url;
        this.context = opts.context;
    }

    send(data: TResponse) {
        if (!this._validator) {
            return;
        }
        if (!this._validator.validate(data)) {
            return;
        }
        const payload = this._validator.serialize(data);
        return this._peer.send(`type: message\ndata: ${payload}`);
    }

    sendError(err: ErrorResponse) {
        return this._peer.send(`type: error\ndata: ${JSON.stringify(err)}`);
    }

    close() {
        throw new Error("close() is not yet implemented on WsPeer");
    }

    subscribe(channel: string) {
        this._peer.subscribe(channel);
    }

    unsubscribe(channel: string) {
        this._peer.unsubscribe(channel);
    }

    publish(channel: string, message: TResponse) {
        if (!this._validator) {
            return;
        }
        if (!this._validator.validate(message)) {
            const err: ErrorResponse = {
                statusCode: 500,
                statusMessage: `Error serializing message on server. The payload doesn't match the specified schema.`,
                data: {
                    payload: message,
                },
            };
            this.sendError(err);
            return;
        }
        const payload = this._validator.serialize(message);
        this._peer.publish(channel, payload);
    }

    readyState() {
        return this._peer.readyState;
    }
}

export interface WebSocketRpcHandler<TParams, TResponse> {
    onOpen: (peer: WsPeer<TResponse>) => void;
    onMessage: (peer: WsPeer<TResponse>, message: TParams) => void;
    onClose: (
        peer: WsPeer<TResponse>,
        details: { code?: number; reason?: string },
    ) => void;
    onError: (peer: WsPeer<TResponse>, error: WSError) => void;
}

export function defineWebsocketRpc<
    TParams extends RpcParamSchema | undefined,
    TResponse extends RpcParamSchema | undefined,
>(
    def: Omit<WebsocketRpc<TParams, TResponse>, "transport">,
): WebsocketRpc<TParams, TResponse> {
    (def as any).transport = "ws";
    return def as any;
}

export function registerWebsocketRpc(
    router: Router,
    path: string,
    rpc: NamedWebsocketRpc<any, any>,
) {
    let responseValidator: undefined | ReturnType<typeof a.compile>;
    let paramValidator: undefined | ReturnType<typeof a.compile>;
    try {
        responseValidator = rpc.response ? a.compile(rpc.response) : undefined;
    } catch (err) {
        console.error("ERROR COMPILING VALIDATOR", err);
    }
    try {
        paramValidator = rpc.params ? a.compile(rpc.params) : undefined;
    } catch (err) {
        console.error("ERROR COMPILING PARAMS", err);
    }

    const handler = defineWebSocketHandler({
        open(peer) {
            const urlParts = peer.url.split("?");
            const context: WsPeerContext = {
                rpcName: rpc.name,
                clientAddress: peer.addr,
            };
            if (urlParts.length > 1) {
                urlParts.shift();
                const queryStr = new URLSearchParams(urlParts.join("?"));
                const query: Record<string, string> = {};
                for (const [key, val] of queryStr.entries()) {
                    query[key] = val;
                }
                context.queryParams = query;
            }
            const wsPeer = new WsPeer(peer, {
                validator: responseValidator,
                context,
            });
            peer.ctx.__wsPeer = wsPeer;
            rpc.handler.onOpen(peer.ctx.__wsPeer as WsPeer<any>);
        },
        message(peer, message) {
            if (!paramValidator) {
                return;
            }
            const data = paramValidator.safeParse(message.text());
            if (!data.success) {
                const errorResponse: ErrorResponse = {
                    statusCode: 400,
                    statusMessage: data.error.message,
                    data: data.error.errors,
                    stack: data.error.stack,
                };
                (peer.ctx.__wsPeer as WsPeer<any>).sendError(errorResponse);
                return;
            }
            rpc.handler.onMessage(peer.ctx.__wsPeer as WsPeer<any>, data.value);
        },
        close(peer, details) {
            rpc.handler.onClose(peer.ctx.__wsPeer as WsPeer<any>, details);
        },
    });

    router.use(path, handler);
}

export function createWsRpcDefinition(
    rpcName: string,
    path: string,
    rpc: NamedWebsocketRpc<any, any>,
): WsRpcDefinition {
    return {
        transport: "ws",
        path,
        params: getRpcParamName(rpcName, rpc),
        response: getRpcResponseName(rpcName, rpc),
        isDeprecated: rpc.isDeprecated,
        description: rpc.description,
    };
}

export function parseWsPayload(input: string): {
    type: "error" | "message" | "unknown";
    data: string;
} {
    const lines = input.split("\n");
    let type: "error" | "message" | "unknown" = "unknown";
    let data = "";
    for (const line of lines) {
        if (line.startsWith("type: ")) {
            switch (line.replace("type: ", "").trim().toLowerCase()) {
                case "error":
                    type = "error";
                    break;
                case "message":
                    type = "message";
                    break;
                default:
                    break;
            }
        }
        if (line.startsWith("data: ")) {
            const content = line.substring(5).trim();
            data = content;
        }
    }
    return {
        type,
        data,
    };
}
