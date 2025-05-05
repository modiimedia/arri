import {
    isRpcHttpMethod,
    removeDisallowedChars,
    type RpcDefinition,
    type RpcHttpMethod,
} from '@arrirpc/codegen-utils';
import {
    a,
    ADiscriminatorSchema,
    AObjectSchema,
    CompiledValidator,
    errorMessageFromErrors,
    InferType,
    isADiscriminatorSchema,
    isAObjectSchema,
    isASchema,
    Result,
    ValueError,
} from '@arrirpc/schema';
import {
    eventHandler,
    getValidatedQuery,
    type H3Event,
    isPreflightRequest,
    readRawBody,
    type Router,
    send,
    setResponseHeader,
} from 'h3';
import { kebabCase, pascalCase } from 'scule';

import { type RpcEventContext, type RpcPostEventContext } from './context';
import { defineError, handleH3Error } from './errors';
import {
    type EventStreamRpc,
    type EventStreamRpcHandler,
} from './eventStreamRpc';
import { type MiddlewareEvent } from './middleware';
import { type RouteOptions } from './route';

export type RpcParamSchema<T = any> =
    | AObjectSchema<T>
    | ADiscriminatorSchema<T>;

export function isRpcParamSchema(input: unknown): input is RpcParamSchema<any> {
    return isAObjectSchema(input) || isADiscriminatorSchema(input);
}

export interface NamedHttpRpc<
    TIsEventStream extends boolean = false,
    TParams extends RpcParamSchema | undefined = undefined,
    TResponse extends RpcParamSchema | undefined = undefined,
> extends Rpc<TIsEventStream, TParams, TResponse> {
    name: string;
}

export interface Rpc<
    TIsEventStream extends boolean = false,
    TParams extends RpcParamSchema | undefined = undefined,
    TResponse extends RpcParamSchema | undefined = undefined,
    TTransport extends string = 'http',
> {
    transport?: TTransport;
    method?: RpcHttpMethod;
    path?: string;
    description?: string;
    params: TParams;
    response: TResponse;
    isDeprecated?: boolean;
    isEventStream?: TIsEventStream;
    pingInterval?: TIsEventStream extends true ? number : undefined;
    handler: TIsEventStream extends true
        ? EventStreamRpcHandler<
              TParams extends RpcParamSchema<any>
                  ? InferType<TParams>
                  : undefined,
              TResponse extends RpcParamSchema<any>
                  ? InferType<TResponse>
                  : undefined
          >
        : RpcHandler<
              TParams extends RpcParamSchema<any>
                  ? InferType<TParams>
                  : undefined,
              TResponse extends RpcParamSchema<any>
                  ? InferType<TResponse>
                  : void
          >;
    postHandler?: TIsEventStream extends true
        ? undefined
        : RpcPostHandler<
              TParams extends RpcParamSchema<any>
                  ? InferType<TParams>
                  : undefined,
              TResponse extends RpcParamSchema<any>
                  ? InferType<TResponse>
                  : undefined
          >;
}

export interface RpcEvent<TParams = undefined>
    extends Omit<H3Event, 'context'> {
    context: RpcEventContext<TParams>;
}

export interface RpcPostEvent<TParams = undefined, TResponse = undefined>
    extends Omit<H3Event, 'context'> {
    context: RpcPostEventContext<TParams, TResponse>;
}

export type RpcHandler<TParams, TResponse> = (
    context: RpcEventContext<TParams>,
) => TResponse | Promise<TResponse>;

export type RpcPostHandler<TParams, TResponse> = (
    context: RpcPostEventContext<TParams, TResponse>,
) => any;

export function isRpc(input: unknown): input is Rpc<any, any> {
    return (
        typeof input === 'object' &&
        input !== null &&
        'method' in input &&
        isRpcHttpMethod(input.method) &&
        'handler' in input &&
        typeof input.handler === 'function'
    );
}

export function defineRpc<
    TParams extends RpcParamSchema | undefined = undefined,
    TResponse extends RpcParamSchema | undefined | never = undefined,
    TTransport extends string = 'http',
>(
    config: Omit<Rpc<false, TParams, TResponse, TTransport>, 'isEventStream'>,
): Rpc<false, TParams, TResponse> {
    return config as any;
}

export function createRpcDefinition(
    rpcName: string,
    httpPath: string,
    procedure: Rpc<any, any, any>,
    defaultTransport: string,
): RpcDefinition {
    let method: RpcHttpMethod;
    if (procedure.isEventStream === true) {
        method = procedure.method ?? 'get';
    } else {
        method = procedure.method ?? 'post';
    }
    return {
        transport: procedure.transport ?? defaultTransport,
        description: procedure.description,
        path: httpPath,
        method,
        params: getRpcParamName(rpcName, procedure),
        response: getRpcResponseDefinition(rpcName, procedure),
        isDeprecated: procedure.isDeprecated,
        isEventStream: procedure.isEventStream === true ? true : undefined,
    };
}

export function getRpcPath(rpcName: string, prefix = ''): string {
    const path = rpcName
        .split('.')
        .map((part) =>
            removeDisallowedChars(
                kebabCase(part),
                '!@#$%^&*()+=[]{}|\\;:\'"<>,./?',
            ),
        )
        .join('/');
    const finalPath = prefix ? `/${prefix}/${path}` : `/${path}`;
    return finalPath;
}

export function getRpcParamName(
    rpcName: string,
    procedure: Rpc<any, any, any>,
): string | undefined {
    if (!isRpcParamSchema(procedure.params)) {
        return undefined;
    }
    const paramName = getSchemaName(rpcName, 'params', procedure.params);
    return paramName;
}

export function getRpcResponseName(
    rpcName: string,
    procedure: Rpc<any, any, any>,
): string | undefined {
    if (!isRpcParamSchema(procedure.response)) {
        return undefined;
    }
    const responseName = getSchemaName(rpcName, 'response', procedure.response);
    return responseName;
}

function getRpcResponseDefinition(
    rpcName: string,
    procedure: Rpc<any, any, any> | EventStreamRpc<any, any>,
): RpcDefinition['response'] {
    if (!isRpcParamSchema(procedure.response)) {
        return undefined;
    }
    const name = getRpcResponseName(rpcName, procedure);
    if (!name) {
        return undefined;
    }
    return name;
}

export function registerRpc(
    router: Router,
    path: string,
    name: string,
    def: RpcDefinition,
    validators: {
        params?: CompiledValidator<any>;
        response?: CompiledValidator<any>;
    },
    rpcHandler: RpcHandler<any, any>,
    rpcPostHandler: RpcPostHandler<any, any> | undefined,
    opts: RouteOptions,
) {
    const httpMethod = (def.method ?? 'post') as any;
    const handler = eventHandler(async (event: MiddlewareEvent) => {
        event.context.rpcName = name;
        if (isPreflightRequest(event)) {
            return 'ok';
        }
        try {
            if (opts.onRequest) {
                await opts.onRequest(event);
            }
            if (opts.middleware.length) {
                for (const m of opts.middleware) {
                    await m(event);
                }
            }
            if (validators.params) {
                await validateRpcRequestInput(
                    event,
                    httpMethod,
                    validators.params!,
                );
            }

            const response = await rpcHandler(event.context as any);
            event.context.response = response;
            if (opts.onBeforeResponse) {
                await opts.onBeforeResponse(event);
            }
            if (typeof response === 'object') {
                const payload = validators.response?.serialize(response);
                if (payload && payload.success !== true) {
                    throw defineError(500, {
                        message:
                            'Failed to serialize response. Response does not match specified schema',
                        data: payload?.errors,
                    });
                }
                setResponseHeader(event, 'Content-Type', 'application/json');
                await send(event, payload?.value ?? JSON.stringify(response));
            } else {
                setResponseHeader(event, 'Content-Type', 'application/json');
                await send(event, `{}`);
            }
            if (opts.onAfterResponse) {
                await opts.onAfterResponse(event);
            }
            if (rpcPostHandler) {
                await rpcPostHandler(event.context as RpcPostEventContext);
            }
        } catch (err) {
            await handleH3Error(err, event, opts.onError, opts.debug ?? false);
        }
        return '';
    });
    switch (httpMethod) {
        case 'get':
            router.get(path, handler);
            break;
        case 'delete':
            router.delete(path, handler);
            break;
        case 'patch':
            router.patch(path, handler);
            break;
        case 'put':
            router.put(path, handler);
            break;
        case 'post':
        default:
            router.post(path, handler);
            break;
    }
}

export async function validateRpcRequestInput(
    event: H3Event,
    httpMethod: RpcHttpMethod,
    validator: CompiledValidator<any>,
) {
    switch (httpMethod) {
        case 'get': {
            const parsedParams = await getValidatedQuery(event, (input) =>
                validator.coerce(input),
            );
            if (parsedParams.success) {
                event.context.params = parsedParams.value;
            } else {
                const errParts: string[] = [];
                for (const err of parsedParams.errors) {
                    const errPath = err.instancePath?.split('/');
                    errPath?.shift();
                    const propName = errPath?.join('.');
                    if (propName && !errParts.includes(propName)) {
                        errParts.push(propName);
                    }
                }
                const message = `Missing or invalid url query parameters: [${errParts.join(
                    ', ',
                )}]`;
                throw defineError(400, {
                    message,
                    data: parsedParams.errors,
                });
            }
            break;
        }
        case 'delete':
        case 'patch':
        case 'post':
        case 'put': {
            const body = await readRawBody(event);
            if (!body) {
                throw defineError(400, {
                    message: `Invalid request body. Expected object. Got undefined.`,
                });
            }
            const parsedParams = validator.parse(body);
            if (!parsedParams?.success) {
                throw defineError(400, {
                    message: errorMessageFromErrors(parsedParams.errors),
                    data: parsedParams.errors,
                });
            }
            event.context.params = parsedParams.value;
            break;
        }
        default:
            break;
    }
}

export type RequestValidator<T = any> = {
    validate: (input: unknown) => input is T;
    errors: (input: unknown) => ValueError[];
    coerce: (input: unknown) => Result<T>;
    parse: (input: unknown) => Result<T>;
    serialize: (input: any) => Result<string>;
};

export function getSchemaValidator<T extends Record<string, any> = any>(
    rpcName: string,
    type: 'params' | 'response',
    schema: RpcParamSchema<T>,
): RequestValidator<T> | undefined {
    if (isASchema(schema)) {
        try {
            const validator = a.compile(schema);
            return {
                validate: validator.validate,
                serialize: validator.serialize,
                parse: validator.parse,
                coerce: validator.coerce,
                errors: (input) => a.errors(schema, input),
            };
        } catch (err) {
            console.error(
                `Error compiling ${type} validator for ${rpcName}. Error: ${err}`,
            );
        }
    }
    return undefined;
}

export function getSchemaName(
    rpcName: string,
    type: 'params' | 'response',
    schema: RpcParamSchema<any>,
): string {
    const cleanedName = rpcName
        .split('.')
        .map((part) =>
            removeDisallowedChars(part, '!@#$%^&*()+=[]{}|\\;:\'"<>,./?'),
        )
        .join('_');
    return (
        schema.metadata?.id ??
        pascalCase(`${cleanedName}_${type}`, {
            normalize: true,
        })
    );
}
