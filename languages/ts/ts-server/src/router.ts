import { type ASchema, type AObjectSchema } from "@arrirpc/schema";
import { type DefinitionMap } from "./app";
import { type ArriRoute } from "./route";
import { type RpcParamSchema, type NamedRpc } from "./rpc";
import { type NamedWebsocketRpc } from "./websocketRpc";

export interface ArriRouterBase {
    rpc: <
        TIsEventStream extends boolean,
        TParams extends AObjectSchema<any, any> | undefined,
        TResponse extends AObjectSchema<any, any> | undefined,
    >(
        procedure: Omit<
            NamedRpc<TIsEventStream, TParams, TResponse>,
            "transport"
        >,
    ) => void;
    wsRpc: <
        TParams extends RpcParamSchema | undefined,
        TResponse extends RpcParamSchema | undefined,
    >(
        procedure: Omit<NamedWebsocketRpc<TParams, TResponse>, "transport">,
    ) => void;
    route: <
        TPath extends string,
        TQuery extends AObjectSchema<any, any> = any,
        TBody extends ASchema<any> = any,
        TResponse = any,
    >(
        route: ArriRoute<TPath, TQuery, TBody, TResponse>,
    ) => void;

    registerDefinitions: (definitions: DefinitionMap) => void;
}

export class ArriRouter implements ArriRouterBase {
    private readonly procedures: Array<
        NamedRpc<any, any, any> | NamedWebsocketRpc<any, any>
    > = [];

    private readonly routes: Array<ArriRoute<any>> = [];

    private readonly definitions: DefinitionMap = {};

    rpc<
        TIsEventStream extends boolean = false,
        TParams extends AObjectSchema<any, any> | undefined = undefined,
        TResponse extends AObjectSchema<any, any> | undefined = undefined,
    >(
        procedure: Omit<
            NamedRpc<TIsEventStream, TParams, TResponse>,
            "transport"
        >,
    ) {
        (procedure as any).transport = "http";
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.procedures.push(procedure as any);
    }

    wsRpc<
        TParams extends RpcParamSchema | undefined,
        TResponse extends RpcParamSchema | undefined,
    >(procedure: Omit<NamedWebsocketRpc<TParams, TResponse>, "transport">) {
        (procedure as any).transport = "ws";
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.procedures.push(procedure as any);
    }

    route<
        TPath extends string,
        TQuery extends AObjectSchema<any, any> = any,
        TBody extends ASchema<any> = any,
        TResponse = any,
    >(route: ArriRoute<TPath, TQuery, TBody, TResponse>) {
        this.routes.push(route);
    }

    registerDefinitions(models: DefinitionMap) {
        for (const key of Object.keys(models)) {
            this.definitions[key] = models[key]!;
        }
    }

    getProcedures() {
        return this.procedures;
    }

    getRoutes() {
        return this.routes;
    }

    getDefinitions() {
        return this.definitions;
    }
}
