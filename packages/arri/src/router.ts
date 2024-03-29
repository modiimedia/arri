import { type ASchema, type AObjectSchema } from "arri-validate";
import { type ModelMap } from "./app";
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

    registerModels: (models: ModelMap) => void;
}

export class ArriRouter implements ArriRouterBase {
    private readonly procedures: Array<NamedRpc<any, any, any>> = [];

    private readonly routes: Array<ArriRoute<any>> = [];

    private readonly models: ModelMap = {};

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

    registerModels(models: ModelMap) {
        for (const key of Object.keys(models)) {
            this.models[key] = models[key]!;
        }
    }

    getProcedures() {
        return this.procedures;
    }

    getRoutes() {
        return this.routes;
    }

    getModels() {
        return this.models;
    }
}
