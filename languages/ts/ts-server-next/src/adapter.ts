import { AppDefinition, RpcDefinition } from '@arrirpc/codegen-utils';
import { CompiledValidator } from '@arrirpc/schema';

import { RpcMiddleware } from './middleware';
import { RpcHandler, RpcPostHandler } from './rpc';
import { EventStreamRpcHandler } from './rpc_event_stream';

export type RpcValidators = {
    params?: CompiledValidator<any>;
    response?: CompiledValidator<any>;
};

export interface TransportAdapterOptions {
    heartbeatInterval: number;
}

export interface TransportAdapter {
    /**
     * The name of the transport, such as "http", "ws", "tcp", etc
     */
    transportId: string;

    use(middleware: RpcMiddleware): void;

    registerRpc(
        name: string,
        definition: RpcDefinition,
        validators: RpcValidators,
        handler: RpcHandler<any, any>,
        postHandler?: RpcPostHandler<any, any>,
    ): void;

    registerEventStreamRpc(
        name: string,
        definition: RpcDefinition,
        validators: RpcValidators,
        handler: EventStreamRpcHandler<any, any>,
    ): void;

    registerHomeRoute?(
        path: string,
        getAppInfo: () => {
            name?: string;
            description?: string;
            version?: string;
            definitionPath?: string;
        },
    ): void;

    registerDefinitionRoute?(
        path: string,
        getDefinition: () => AppDefinition,
    ): void;

    start(): Promise<void> | void;

    stop(): Promise<void> | void;

    setOptions(options: TransportAdapterOptions): void;
}
