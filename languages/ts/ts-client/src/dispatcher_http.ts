import { $Fetch, createFetch, Fetch, FetchError, ofetch } from 'ofetch';

import {
    EventStreamHooks,
    RpcDispatcher,
    RpcDispatcherOptions,
    waitFor,
} from './dispatcher';
import { arriSseRequest } from './dispatcher_http_sse';
import { ArriErrorInstance, isArriError } from './errors';
import { getHeaders, RpcRequest, RpcRequestValidator } from './requests';

export interface HttpDispatcherOptions extends RpcDispatcherOptions {
    baseUrl: string;
    fetch?: Fetch;
}

export class HttpDispatcher implements RpcDispatcher {
    transport: string = 'http';
    ofetch: $Fetch;
    options: HttpDispatcherOptions;

    constructor(options: HttpDispatcherOptions) {
        this.options = options;
        this.ofetch = options?.fetch
            ? createFetch({ fetch: options.fetch })
            : ofetch;
    }

    async handleRpc<TParams, TResponse>(
        req: RpcRequest<TParams>,
        validator: RpcRequestValidator<TParams, TResponse>,
        options?: RpcDispatcherOptions,
        retryCount?: number,
    ): Promise<TResponse> {
        let url = this.options.baseUrl + req.path;
        let body: undefined | string;
        let contentType: undefined | string;
        switch (req.method) {
            case 'get':
            case 'GET':
            case 'head':
            case 'HEAD':
                if (req.data && typeof req.data === 'object') {
                    url = `${url}?${validator.params.toUrlQueryString(req.data)}`;
                }
                break;
            default:
                if (req.data && typeof req.data === 'object') {
                    body = validator.params.toJsonString(req.data);
                    contentType = 'application/json';
                }
                break;
        }
        try {
            const headers = await getHeaders(req.customHeaders);
            if (contentType) headers['Content-Type'] = contentType;
            if (req.clientVersion)
                headers['client-version'] = req.clientVersion;
            const errorHandler = options?.onError ?? this.options.onError;
            const response = await this.ofetch.raw(url, {
                method: req.method?.toUpperCase() ?? 'POST',
                body,
                headers,
                onRequestError: errorHandler
                    ? (context) => {
                          errorHandler(req, context.error);
                      }
                    : undefined,
                onResponseError: errorHandler
                    ? async (context) => {
                          try {
                              const err = ArriErrorInstance.fromJson(
                                  context.response._data ??
                                      (await context.response.json()),
                              );
                              errorHandler(req, err);
                              return;
                          } catch (_) {
                              // do nothing
                          }
                          errorHandler(req, context.error);
                      }
                    : undefined,
                responseType: 'text',
                retry: false,
                ignoreResponseError: true,
                signal: options?.signal ?? this.options?.signal,
                timeout: options?.timeout ?? this.options?.timeout,
            });
            if (!response.ok) {
                throw ArriErrorInstance.fromResponse(response);
            }
            return validator.response.fromJsonString(
                response._data ?? (await response.text()),
            );
        } catch (err) {
            const error = err as any as FetchError;
            let arriError: ArriErrorInstance;
            if (err instanceof ArriErrorInstance) {
                arriError = err;
            } else if (isArriError(error.data)) {
                arriError = new ArriErrorInstance(error.data);
            } else {
                arriError = new ArriErrorInstance({
                    code: error.statusCode ?? 500,
                    message:
                        error.statusMessage ??
                        error.message ??
                        `Error connecting to ${url}`,
                    data: error.data,
                    stack: error.stack,
                });
            }
            const maxRetryCount =
                typeof options?.retry === 'number'
                    ? options.retry
                    : typeof this.options.retry === 'number'
                      ? this.options.retry
                      : 0;
            console.log('OPTIONS', options);
            console.log('GLOABAL_OPTIONS', this.options);
            const statusCodes =
                options?.retryErrorCodes ?? this.options.retryErrorCodes ?? [];
            const shouldRetry =
                maxRetryCount !== 0 &&
                (retryCount ?? 0) < maxRetryCount &&
                (statusCodes.length === 0 ||
                    statusCodes.includes(arriError.code));
            options?.onError?.(req, arriError);
            console.log('SHOULD_RETRY', shouldRetry);
            console.log('ERR', arriError);
            if (shouldRetry) {
                let retryDelay =
                    options?.retryDelay ?? this.options.retryDelay ?? 0;
                if (retryDelay === 0 && (retryCount ?? 0) > 0) {
                    retryDelay = retryDelay * (retryCount ?? 1);
                }
                await waitFor(
                    options?.retryDelay ?? this.options.retryDelay ?? 0,
                );
                return this.handleRpc(
                    req,
                    validator,
                    options,
                    (retryCount ?? 0) + 1,
                );
            }
            throw arriError;
        }
    }

    handleEventStreamRpc<TParams, TResponse>(
        req: RpcRequest<TParams>,
        validator: RpcRequestValidator<TParams, TResponse>,
        options?: EventStreamHooks<TResponse>,
    ) {
        return arriSseRequest(
            this.options.baseUrl,
            req,
            validator,
            options ?? {},
            this.options,
            this.ofetch,
        );
    }
}
