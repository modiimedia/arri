import { type ASchema, type AObjectSchema } from "arri-validate";
import { type ArriNamedProcedure } from "./procedures";
import { type ArriRoute } from "./routes";
export { defineRoute, type ArriRoute } from "./routes";

export interface ArriRouterBase {
    rpc: <
        TParams extends AObjectSchema<any, any> | undefined,
        TResponse extends AObjectSchema<any, any> | undefined,
    >(
        procedure: ArriNamedProcedure<TParams, TResponse>,
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
    private readonly procedures: Array<ArriNamedProcedure<any, any>> = [];
    private readonly routes: Array<ArriRoute<any>> = [];

    rpc<
        TParams extends AObjectSchema<any, any> | undefined,
        TResponse extends AObjectSchema<any, any> | undefined,
    >(procedure: ArriNamedProcedure<TParams, TResponse>) {
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
