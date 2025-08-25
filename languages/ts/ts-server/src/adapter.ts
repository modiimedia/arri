import { RpcDefinition } from '@arrirpc/codegen-utils';
import { CompiledValidator } from '@arrirpc/schema';

import {
    RpcMiddleware,
    RpcMiddlewareContext,
    RpcOnErrorContext,
} from './middleware';
import { RpcHandler, RpcPostHandler, RpcPostHandlerContext } from './rpc';
import { OutputStreamRpcHandler } from './rpc_output_stream';

export type RpcValidators = {
    input?: CompiledValidator<any>;
    output?: CompiledValidator<any>;
};

export interface TransportAdapterOptions {
    heartbeatInterval: number;
    heartbeatEnabled: boolean;
    onRequest:
        | ((context: RpcMiddlewareContext) => Promise<void> | void)
        | undefined;
    onBeforeResponse:
        | ((
              context: RpcPostHandlerContext<unknown, unknown>,
          ) => Promise<void> | void)
        | undefined;
    onAfterResponse:
        | ((
              context: RpcPostHandlerContext<unknown, unknown>,
          ) => Promise<void> | void)
        | undefined;
    onError: ((context: RpcOnErrorContext) => Promise<void> | void) | undefined;
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
        handler: OutputStreamRpcHandler<any, any>,
    ): void;

    start(): Promise<void> | void;

    stop(): Promise<void> | void;

    setOptions(options: TransportAdapterOptions): void;
}
