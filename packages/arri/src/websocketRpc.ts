import { type WsRpcDefinition } from "arri-codegen-utils";
import {
    type CompiledValidator,
    type ASchema,
    a,
    type InferType,
} from "arri-validate";
import { type WSError } from "crossws";
import { defineWebSocketHandler, type Router } from "h3";
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

interface WsSender {
    send: (data: string) => any;
}

interface WsPeerOpts<TResponse> {
    validator?: CompiledValidator<ASchema<TResponse>>;
    sender: WsSender;
}

export class WsPeer<TResponse> {
    _sender: WsSender;
    _validator?: CompiledValidator<ASchema<TResponse>>;

    constructor(opts: WsPeerOpts<TResponse>) {
        this._validator = opts.validator;
        this._sender = opts.sender;
    }

    send(data: TResponse) {
        if (!this._validator) {
            return;
        }
        if (!this._validator.validate(data)) {
            return;
        }
        const payload = this._validator.serialize(data);
        return this._sender.send(payload);
    }
}

export interface WebSocketRpcHandler<TParams, TResponse> {
    onOpen: (peer: WsPeer<TResponse>) => void;
    onMessage: (peer: WsPeer<TResponse>, message: TParams) => void;
    onClose: (peer: WsPeer<TResponse>) => void;
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
            const sender: WsSender = {
                send: (data) => peer.send(data),
            };
            peer.ctx.__wsPeer = new WsPeer({
                validator: responseValidator,
                sender,
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            rpc.handler.onOpen(peer.ctx.__wsPeer);
        },
        message(peer, message) {
            const data = paramValidator?.parse(message.text());
            if (!data) {
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            rpc.handler.onMessage(peer.ctx.__wsPeer, data);
        },
        close(peer, details) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            rpc.handler.onClose(peer.ctx.__wsPeer);
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
