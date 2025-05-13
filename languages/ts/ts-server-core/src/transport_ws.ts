import { RpcDefinition } from '@arrirpc/codegen-utils';
import { CompiledValidator } from '@arrirpc/schema';
import { defineHooks, Hooks, Message, Peer, WSError } from 'crossws';
import { HTTPMethod } from 'h3';

import { RpcHandler, RpcPostHandler } from './rpc';
import { EventStreamRpcHandler } from './rpc_event_stream';
import { TransportDispatcher } from './transport';
import { WebsocketHttpRegister } from './transport_http';

export interface WsOptions {
    connectionPath?: string;
    connectionMethod?: HTTPMethod;
}

export class WebsocketDispatcher implements TransportDispatcher {
    transportId: string = 'ws';

    register: WebsocketHttpRegister;

    options: WsOptions;

    hooks: Hooks;

    constructor(register: WebsocketHttpRegister, options?: WsOptions) {
        this.register = register;
        this.options = options ?? {};
        this.hooks = defineHooks({
            upgrade: (_) => {
                return {
                    headers: {},
                };
            },
            open: (peer) => this._handleOpen(peer),
            error: (peer, error) => this._handleError(peer, error),
            close: (peer, details) => this._handleClose(peer, details),
            message: (peer, message) => this._handleMessage(peer, message),
        });

        this.register.registerWebsocketEndpoint(
            this.options.connectionPath ?? '/ws',
            this.options.connectionMethod ?? 'GET',
            this.hooks,
        );
    }

    registerRpc(
        name: string,
        definition: RpcDefinition,
        validators: {
            params?: CompiledValidator<any>;
            response?: CompiledValidator<any>;
        },
        handler: RpcHandler<any, any>,
        postHandler?: RpcPostHandler<any, any>,
    ): void {
        throw new Error('Method not implemented.');
    }

    registerEventStreamRpc(
        name: string,
        definition: RpcDefinition,
        validators: {
            params?: CompiledValidator<any>;
            response?: CompiledValidator<any>;
        },
        handler: EventStreamRpcHandler<any, any>,
    ): void {
        throw new Error('Method not implemented.');
    }

    start(): void {}
    stop(): void {
        throw new Error('Method not implemented.');
    }

    private _handleOpen(peer: Peer) {}

    private _handleError(peer: Peer, error: WSError) {}

    private _handleClose(
        peer: Peer,
        details: { code?: number; reason?: string },
    ) {}

    private _handleMessage(peer: Peer, message: Message) {}
}

function parseWebsocketMessage(msg: Message) {
    const msgText = msg.text();
    const splitIndex = msgText.indexOf('\n\n');
    if (splitIndex < 0) {
        return null;
    }
    const [headerStr, bodyStr] = msg.text().split('\n\n');

    let procedure: string | undefined;
    let path: string | undefined;
    let method: string | undefined;
    let clientVersion: string | undefined;
    const customHeaders: Record<string, string> = {};
}
