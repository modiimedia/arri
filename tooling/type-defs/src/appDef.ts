import { pascalCase } from 'scule';

import {
    Schema,
    SchemaFormDiscriminator,
    SchemaFormProperties,
} from './typeDef';

export const HttpMethodValues = [
    'get',
    'post',
    'put',
    'patch',
    'delete',
    'head',
] as const;

export type HttpMethod = (typeof HttpMethodValues)[number];
export type RpcHttpMethod = Exclude<HttpMethod, 'head'>;
export const isHttpMethod = (input: any): input is HttpMethod => {
    if (typeof input !== 'string') {
        return false;
    }
    return HttpMethodValues.includes(input as any);
};

export const isRpcHttpMethod = (input: any): input is RpcHttpMethod => {
    return isHttpMethod(input) && input !== 'head';
};

export const SCHEMA_VERSION = '0.0.8';

export interface AppDefinition {
    schemaVersion: typeof SCHEMA_VERSION;
    info?: {
        title?: string;
        description?: string;
        version?: string;
        [key: string]: string | undefined;
    };
    externalDocs?: {
        description?: string;
        url: string;
    };
    procedures: Record<string, RpcDefinition>;
    definitions: Record<string, Schema>;
}

export function isAppDefinition(input: unknown): input is AppDefinition {
    if (typeof input !== 'object') {
        return false;
    }
    const inputObj = input as Record<any, any>;
    if (typeof inputObj.schemaVersion !== 'string') {
        return false;
    }
    if (typeof inputObj.procedures !== 'object') {
        return false;
    }
    if (typeof inputObj.definitions !== 'object') {
        return false;
    }
    return true;
}

export interface RpcDefinition<T = string> {
    transports: string[];
    path: string;
    method?: RpcHttpMethod;
    params?: T;
    response?: T;
    description?: string;
    isEventStream?: boolean;
    isDeprecated?: boolean;
    deprecationNote?: string;
    // deprecatedSince?: string;
}

// export interface HttpRpcDefinition<T = string> extends RpcDefinitionBase<T> {
//     transport: 'http';
//     method: RpcHttpMethod;
//     isEventStream?: boolean;
// }
// export interface WsRpcDefinition<T = string> extends RpcDefinitionBase<T> {
//     transport: 'ws';
// }
// export interface CustomRpcDefinition<T = string> extends RpcDefinitionBase<T> {
//     transport: `custom:${string}`;
//     [key: string]: unknown;
// }
// export type RpcDefinition<T = string> =
//     | HttpRpcDefinition<T>
//     | WsRpcDefinition<T>
//     | CustomRpcDefinition<T>;

export function isRpcDefinition(input: unknown): input is RpcDefinition {
    if (typeof input !== 'object' || input === null) {
        return false;
    }
    if (
        'params' in input &&
        typeof input.params !== 'undefined' &&
        typeof input.params !== 'string'
    ) {
        return false;
    }
    if (
        'response' in input &&
        typeof input.response !== 'undefined' &&
        typeof input.response !== 'string'
    ) {
        return false;
    }
    if (
        'method' in input &&
        (typeof input.method !== 'string' || !isRpcHttpMethod(input.method))
    ) {
        return false;
    }
    if (
        'isEventStreamRpc' in input &&
        typeof input.isEventStreamRpc !== 'boolean'
    ) {
        return false;
    }
    return (
        'transport' in input &&
        Array.isArray(input.transport) &&
        input.transport.every((val) => typeof val === 'string') &&
        input.transport.length > 0 &&
        'path' in input &&
        typeof input.path === 'string' &&
        input.path.length > 0
    );
}

export interface ServiceDefinition {
    [key: string]: RpcDefinition | ServiceDefinition;
}

export function isServiceDefinition(input: any): input is ServiceDefinition {
    if (typeof input !== 'object') {
        return false;
    }

    for (const key of Object.keys(input)) {
        if (typeof input[key] !== 'object') {
            return false;
        }
    }
    return true;
}

export interface Generator<TOptions extends Record<string, any> | undefined> {
    run: (def: AppDefinition, isDevServer?: boolean) => any;
    options: TOptions;
}

export type GeneratorPlugin<TOptions extends Record<string, any> | undefined> =
    (options: TOptions) => Generator<TOptions>;

export function defineGeneratorPlugin<
    TOptions extends Record<string, any> | undefined,
>(plugin: GeneratorPlugin<TOptions>) {
    return plugin;
}

type RpcDefinitionHelper = RpcDefinition<
    SchemaFormProperties | SchemaFormDiscriminator
>;

type AppDefinitionHelper = Omit<
    AppDefinition,
    'procedures' | 'definitions' | 'schemaVersion'
> & {
    procedures: Record<string, RpcDefinitionHelper>;
    definitions?: AppDefinition['definitions'];
};

export function createAppDefinition(input: AppDefinitionHelper): AppDefinition {
    const definitions = { ...input.definitions };
    const procedures: AppDefinition['procedures'] = {};
    for (const key of Object.keys(input.procedures)) {
        const def = input.procedures[key]!;
        let paramName: string | undefined;
        if (def.params) {
            paramName =
                def.params.metadata?.id ??
                pascalCase(`${key.split('.').join('_')}Params`);
            definitions[paramName] = def.params;
        }
        let responseName: string | undefined;
        if (def.response) {
            responseName =
                def.response.metadata?.id ??
                pascalCase(`${key.split('.').join('_')}Response`);
            definitions[responseName] = def.response;
        }
        delete def.params;
        delete def.response;
        procedures[key] = {
            ...def,
            params: paramName,
            response: responseName,
        };
    }
    const result: AppDefinition = {
        schemaVersion: '0.0.8',
        ...input,
        procedures,
        definitions,
    };
    return result;
}
