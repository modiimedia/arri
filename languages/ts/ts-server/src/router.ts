import { type AObjectSchema, type ASchema } from '@arrirpc/schema';

import { type DefinitionMap } from './app';
import { type ArriRoute } from './route';

export class ArriRouter {
    private readonly routes: Array<ArriRoute<any>> = [];
    private readonly definitions: DefinitionMap = {};

    prefix: string;

    constructor(routePrefix = '') {
        this.prefix = routePrefix;
    }

    route<
        TPath extends string,
        TQuery extends AObjectSchema<any, any> = any,
        TBody extends ASchema<any> = any,
        TResponse = any,
    >(route: ArriRoute<TPath, TQuery, TBody, TResponse>) {
        route.path = `${this.prefix}${route.path}` as any;
        this.routes.push(route);
    }

    registerDefinitions(models: DefinitionMap) {
        for (const key of Object.keys(models)) {
            this.definitions[key] = models[key]!;
        }
    }

    getRoutes() {
        return this.routes;
    }

    getDefinitions() {
        return this.definitions;
    }
}
