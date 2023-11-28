import { type ASchema, type AObjectSchema } from "arri-validate";
import { type ArriRoute } from "./route";
import { type NamedRpc } from "./rpc";

export interface ArriRouterBase {
    rpc: <
        TIsEventStream extends boolean,
        TParams extends AObjectSchema<any, any> | undefined,
        TResponse extends AObjectSchema<any, any> | undefined,
    >(
        procedure: NamedRpc<TIsEventStream, TParams, TResponse>,
    ) => void;
    route: <
        TPath extends string,
        TQuery extends AObjectSchema<any, any> = any,
        TBody extends ASchema<any> = any,
        TResponse = any,
    >(
        route: ArriRoute<TPath, TQuery, TBody, TResponse>,
    ) => void;
}

export class ArriRouter implements ArriRouterBase {
    private readonly procedures: Array<NamedRpc<any, any, any>> = [];

    private readonly routes: Array<ArriRoute<any>> = [];

    rpc<
        TIsEventStream extends boolean = false,
        TParams extends AObjectSchema<any, any> | undefined = undefined,
        TResponse extends AObjectSchema<any, any> | undefined = undefined,
    >(procedure: NamedRpc<TIsEventStream, TParams, TResponse>) {
        this.procedures.push(procedure);
    }

    route<
        TPath extends string,
        TQuery extends AObjectSchema<any, any> = any,
        TBody extends ASchema<any> = any,
        TResponse = any,
    >(route: ArriRoute<TPath, TQuery, TBody, TResponse>) {
        this.routes.push(route);
    }

    getProcedures() {
        return this.procedures;
    }

    getRoutes() {
        return this.routes;
    }
}
