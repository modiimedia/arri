import {
    $Fetch,
    createFetch,
    Fetch,
    FetchError,
    FetchOptions,
    ofetch,
} from 'ofetch';

import { ArriErrorInstance, isArriError } from './errors';
import { HeaderInput, RpcDispatcher, RpcRequest } from './requests';
import { arriSseRequest, SseOptions } from './sse';
import { getHeaders } from './utils';

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
    headers: HeaderInput;
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
        this.headers = config?.headers ?? {};
        this.ofetch = config?.fetch
            ? createFetch({ fetch: config.fetch })
            : ofetch;
    }

    async handleRpc<TParams, TOutput>(
        req: RpcRequest<TParams, TOutput, HttpRpcRequestOptions>,
    ): Promise<TOutput> {
        let url = this.baseUrl + req.path;
        let body: undefined | string;
        let contentType: undefined | string;
        switch (req.method) {
            case 'get':
            case 'GET':
            case 'head':
            case 'HEAD':
                if (req.params && typeof req.params === 'object') {
                    url = `${url}?${req.paramValidator.toUrlQueryString(req.params)}`;
                }
                break;
            default:
                if (req.params && typeof req.params === 'object') {
                    body = req.paramValidator.toJsonString(req.params);
                    contentType = 'application/json';
                }
                break;
        }
        try {
            const headers = (await getHeaders(this.headers)) ?? {};
            if (contentType) headers['Content-Type'] = contentType;
            if (req.clientVersion)
                headers['client-version'] = req.clientVersion;
            const response = await this.ofetch(url, {
                method: req.method?.toUpperCase() ?? 'POST',
                body,
                headers,
                onRequest: req.options?.onRequest ?? this.options?.onRequest,
                onRequestError:
                    req.options?.onRequestError ?? this.options?.onRequestError,
                onResponse: req.options?.onResponse ?? this.options?.onResponse,
                onResponseError:
                    req.options?.onResponseError ??
                    this.options?.onResponseError,
                responseType: 'text',
                retry: req.options?.retry ?? this.options?.retry,
                retryDelay: req.options?.retryDelay ?? this.options?.retryDelay,
                retryStatusCodes:
                    req.options?.retryStatusCodes ??
                    this.options?.retryStatusCodes,
                signal: req.options?.signal ?? this.options?.signal,
                timeout: req.options?.timeout ?? this.options?.timeout,
            });
            return req.responseValidator.fromJsonString(response);
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
            if (req.onError) req.onError(arriError);
            throw arriError;
        }
    }

    handleEventStreamRpc<TParams, TOutput>(
        req: RpcRequest<TParams, TOutput, HttpRpcRequestOptions>,
        hooks?: SseOptions<TOutput>,
    ) {
        let url = this.baseUrl + req.path;
        let body: string | undefined;
        switch (req.method) {
            case 'get':
            case 'GET':
            case 'head':
            case 'HEAD':
                if (req.params) {
                    url += `?${req.paramValidator.toUrlQueryString(req.params)}`;
                }
                break;
            default:
                if (req.params) {
                    body = req.paramValidator.toJsonString(req.params);
                }
                break;
        }
        return arriSseRequest(
            {
                url,
                headers: this.headers,
                clientVersion: req.clientVersion,
                ofetch: this.ofetch,
                method: (req.method as any) ?? 'post',
                body,
                responseDecoder: req.responseValidator.fromJsonString,
                onError: req.onError,
            },
            hooks ?? {},
        );
    }
}
