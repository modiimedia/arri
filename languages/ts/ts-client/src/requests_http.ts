import {
    $Fetch,
    createFetch,
    Fetch,
    FetchError,
    FetchOptions,
    ofetch,
} from 'ofetch';

import { ArriErrorInstance, isArriError } from './errors';
import {
    getHeaders,
    HeaderInput,
    RpcDispatcher,
    RpcRequest,
    RpcRequestValidator,
} from './requests';
import { arriSseRequest, SseOptions } from './requests_http_sse';

export interface HttpRpcRequestOptions {
    retry?: FetchOptions['retry'];
    retryDelay?: FetchOptions['retryDelay'];
    retryStatusCodes?: FetchOptions['retryStatusCodes'];
    onRequest?: FetchOptions['onRequest'];
    onRequestError?: FetchOptions['onRequestError'];
    onResponse?: FetchOptions['onResponse'];
    onResponseError?: FetchOptions['onResponseError'];
    timeout?: FetchOptions['timeout'];
    signal?: FetchOptions['signal'];
}

export class HttpRpcDispatcher implements RpcDispatcher<HttpRpcRequestOptions> {
    transport: string = 'http';
    baseUrl: string;
    ofetch: $Fetch;
    options?: HttpRpcRequestOptions;

    constructor(
        config?: HttpRpcRequestOptions & {
            baseUrl: string;
            headers?: HeaderInput;
            fetch?: Fetch;
            options?: HttpRpcRequestOptions;
        },
    ) {
        this.options = config?.options;
        this.baseUrl = config?.baseUrl ?? '';
        this.ofetch = config?.fetch
            ? createFetch({ fetch: config.fetch })
            : ofetch;
    }

    async handleRpc<TParams, TResponse>(
        req: RpcRequest<TParams>,
        validator: RpcRequestValidator<TParams, TResponse>,
        options?: HttpRpcRequestOptions,
    ): Promise<TResponse> {
        let url = this.baseUrl + req.path;
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
            const response = await this.ofetch(url, {
                method: req.method?.toUpperCase() ?? 'POST',
                body,
                headers,
                onRequest: options?.onRequest ?? this.options?.onRequest,
                onRequestError:
                    options?.onRequestError ?? this.options?.onRequestError,
                onResponse: options?.onResponse ?? this.options?.onResponse,
                onResponseError:
                    options?.onResponseError ?? this.options?.onResponseError,
                responseType: 'text',
                retry: options?.retry ?? this.options?.retry,
                retryDelay: options?.retryDelay ?? this.options?.retryDelay,
                retryStatusCodes:
                    options?.retryStatusCodes ?? this.options?.retryStatusCodes,
                signal: options?.signal ?? this.options?.signal,
                timeout: options?.timeout ?? this.options?.timeout,
            });
            return validator.response.fromJsonString(response);
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
            if (validator.onError) validator.onError(arriError);
            throw arriError;
        }
    }

    handleEventStreamRpc<TParams, TResponse>(
        req: RpcRequest<TParams>,
        validator: RpcRequestValidator<TParams, TResponse>,
        options?: SseOptions<TResponse>,
    ) {
        let url = this.baseUrl + req.path;
        let body: string | undefined;
        switch (req.method) {
            case 'get':
            case 'GET':
            case 'head':
            case 'HEAD':
                if (req.data) {
                    url += `?${validator.params.toUrlQueryString(req.data)}`;
                }
                break;
            default:
                if (req.data) {
                    body = validator.params.toJsonString(req.data);
                }
                break;
        }
        return arriSseRequest(
            {
                url,
                headers: req.customHeaders,
                clientVersion: req.clientVersion,
                ofetch: this.ofetch,
                method: (req.method as any) ?? 'post',
                body,
                responseDecoder: validator.response.fromJsonString,
                onError: validator.onError,
            },
            options ?? {},
        );
    }
}
