import { AppDefinition, RpcDefinition } from '@arrirpc/codegen-utils';
import { CompiledValidator } from '@arrirpc/schema';

import { RpcHandler, RpcPostHandler } from './rpc';
import { EventStreamRpcHandler } from './rpc_event_stream';

export interface TransportDispatcher {
    transportId: string;

    registerRpc(
        name: string,
        definition: RpcDefinition,
        validators: {
            params?: CompiledValidator<any>;
            response?: CompiledValidator<any>;
        },
        handler: RpcHandler<any, any>,
        postHandler?: RpcPostHandler<any, any>,
    ): void;

    registerEventStreamRpc(
        name: string,
        definition: RpcDefinition,
        validators: {
            params?: CompiledValidator<any>;
            response?: CompiledValidator<any>;
        },
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

    start(): void;

    stop(): void;
}
