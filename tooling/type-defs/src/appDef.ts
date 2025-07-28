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
    transports: string[];
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
    if (
        !Array.isArray(inputObj.transports) ||
        !inputObj.transports.every((val) => typeof val === 'string') ||
        inputObj.transports.length === 0
    ) {
        return false;
    }
    return true;
}

export interface RpcDefinition<T = string> {
    transports: string[];
    path: string;
    method?: RpcHttpMethod;
    input?: T;
    inputIsStream?: boolean;
    output?: T;
    outputIsStream?: boolean;
    description?: string;
    isDeprecated?: boolean;
    deprecationNote?: string;
    // deprecatedSince?: string;
}

export function isRpcDefinition(input: unknown): input is RpcDefinition {
    if (typeof input !== 'object' || input === null) {
        return false;
    }
    if (
        'input' in input &&
        typeof input.input !== 'undefined' &&
        typeof input.input !== 'string'
    ) {
        return false;
    }
    if (
        'inputIsStream' in input &&
        typeof input.inputIsStream !== 'undefined' &&
        typeof input.inputIsStream !== 'boolean'
    ) {
        return false;
    }
    if (
        'output' in input &&
        typeof input.output !== 'undefined' &&
        typeof input.output !== 'string'
    ) {
        return false;
    }
    if (
        'outputIsStream' in input &&
        typeof input.outputIsStream !== 'undefined' &&
        typeof input.outputIsStream !== 'boolean'
    ) {
        return false;
    }
    if (
        'method' in input &&
        typeof input.method !== 'undefined' &&
        (typeof input.method !== 'string' || !isRpcHttpMethod(input.method))
    ) {
        return false;
    }
    return (
        'transports' in input &&
        Array.isArray(input.transports) &&
        input.transports.every((val) => typeof val === 'string') &&
        input.transports.length > 0 &&
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
    'procedures' | 'definitions' | 'schemaVersion' | 'transports'
> & {
    procedures?: Record<string, RpcDefinitionHelper>;
    definitions?: AppDefinition['definitions'];
};

export function createAppDefinition(input: AppDefinitionHelper): AppDefinition {
    const definitions = { ...input.definitions };
    const procedures: AppDefinition['procedures'] = {};
    const transports: string[] = [];
    for (const key of Object.keys(input.procedures ?? {})) {
        const def = input.procedures![key]!;
        for (const t of def.transports) {
            if (!transports.includes(t)) transports.push(t);
        }
        let paramName: string | undefined;
        if (def.input) {
            paramName =
                def.input.metadata?.id ??
                pascalCase(`${key.split('.').join('_')}Params`);
            definitions[paramName] = def.input;
        }
        let responseName: string | undefined;
        if (def.output) {
            responseName =
                def.output.metadata?.id ??
                pascalCase(`${key.split('.').join('_')}Response`);
            definitions[responseName] = def.output;
        }
        delete def.input;
        delete def.output;
        procedures[key] = {
            ...def,
            input: paramName,
            output: responseName,
        };
    }
    const result: AppDefinition = {
        schemaVersion: '0.0.8',
        ...input,
        transports: transports,
        procedures,
        definitions,
    };
    return result;
}
