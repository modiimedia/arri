import { type WsRpcDefinition } from "@arrirpc/codegen-utils";
import {
    type ASchema,
    type CompiledValidator,
    type InferType,
} from "@arrirpc/schema";
import { type Peer, type WSError } from "crossws";
import { defineWebSocketHandler, type Router } from "h3";

import { type arriErrorResponse } from "./errors";
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
    handler:
        | WebSocketRpcHandler<
              TParams extends RpcParamSchema ? InferType<TParams> : undefined,
              TResponse extends RpcParamSchema
                  ? InferType<TResponse>
                  : undefined
          >
        | (() => WebSocketRpcHandler<
              TParams extends RpcParamSchema ? InferType<TParams> : undefined,
              TResponse extends RpcParamSchema
                  ? InferType<TResponse>
                  : undefined
          >);
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
        this.url = peer.websocket.url ?? "";
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
        return this._peer.send(`event: message\ndata: ${payload}`);
    }

    sendError(err: arriErrorResponse) {
        return this._peer.send(`event: error\ndata: ${JSON.stringify(err)}`);
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
            const err: arriErrorResponse = {
                code: 500,
                message: `Error serializing message on server. The payload doesn't match the specified schema.`,
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

/**
 * @experimental
 */
export function defineWebsocketRpc<
    TParams extends RpcParamSchema | undefined,
    TResponse extends RpcParamSchema | undefined,
>(
    def: Omit<WebsocketRpc<TParams, TResponse>, "transport">,
): WebsocketRpc<TParams, TResponse> {
    (def as any).transport = "ws";
    return def as any;
}

/**
 * @experimental
 */
export function registerWebsocketRpc(
    router: Router,
    path: string,
    _rpc: NamedWebsocketRpc<any, any>,
) {
    // let responseValidator: undefined | ReturnType<typeof a.compile>;
    // let paramValidator: undefined | ReturnType<typeof a.compile>;
    // try {
    //     responseValidator = rpc.response ? a.compile(rpc.response) : undefined;
    // } catch (err) {
    //     console.error("ERROR COMPILING VALIDATOR", err);
    // }
    // try {
    //     paramValidator = rpc.params ? a.compile(rpc.params) : undefined;
    // } catch (err) {
    //     console.error("ERROR COMPILING PARAMS", err);
    // }

    // const rpcHandler =
    //     typeof rpc.handler === "function" ? rpc.handler() : rpc.handler;

    const handler = defineWebSocketHandler({
        upgrade(_req) {},
        open(_) {
            // const urlParts = peer.websocket.url?.split("?") ?? [];
            // const context: WsPeerContext = {
            //     rpcName: rpc.name,
            //     clientAddress: peer.remoteAddress,
            // };
            // if (urlParts.length > 1) {
            //     urlParts.shift();
            //     const queryStr = new URLSearchParams(urlParts.join("?"));
            //     const query: Record<string, string> = {};
            //     for (const [key, val] of queryStr.entries()) {
            //         query[key] = val;
            //     }
            //     context.queryParams = query;
            // }
            // const wsPeer = new WsPeer(peer, {
            //     validator: responseValidator,
            //     context,
            // });
            // peer.__wsPeer = wsPeer;
            // rpcHandler.onOpen(peer.ctx.__wsPeer as WsPeer<any>);
        },
        message(_, __) {
            // if (!paramValidator) {
            //     return;
            // }
            // const data = paramValidator.safeParse(message.text());
            // if (!data.success) {
            //     const errorResponse: arriErrorResponse = {
            //         code: 400,
            //         message: data.error.message,
            //         data: data.error.errors,
            //         stack: data.error.stack?.split("\n"),
            //     };
            //     (peer.ctx.__wsPeer as WsPeer<any>).sendError(errorResponse);
            //     return;
            // }
            // rpcHandler.onMessage(peer.ctx.__wsPeer as WsPeer<any>, data.value);
        },
        close(_, __) {
            // rpcHandler.onClose(peer.ctx.__wsPeer as WsPeer<any>, details);
        },
    });

    router.use(path, handler);
}

/**
 * @experimental
 */
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
