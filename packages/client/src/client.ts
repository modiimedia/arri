/* eslint-disable @typescript-eslint/ban-types */
import { ofetch, type FetchOptions } from "ofetch";
import { H3Event, type HTTPMethod as H3HTTPMethod } from "h3";
import type { Serialize } from "nitropack";
import type { ExtractParams } from "arri";

export type HttpMethod = Lowercase<H3HTTPMethod>;

export type ApiDefinition = Record<HttpMethod, Record<string, any>>;

interface TestApi {
    get: {
        "/users/:userId": {
            path: "/users/:userId";
            method: "get";
            handler: (event: H3Event) => string;
        };
    };
    head: {};
    patch: {};
    post: {};
    put: {};
    delete: {};
    connect: {};
    options: {};
    trace: {};
}

export type ApiUrl<
    TApi extends ApiDefinition,
    TMethod extends HttpMethod
> = Exclude<keyof TApi[TMethod], symbol | number>;

type RouteSchema<
    TApi extends ApiDefinition,
    TMethod extends HttpMethod,
    TPath extends string
> = TApi[TMethod][TPath]["schema"];

export type RouteReturn<
    TApi extends ApiDefinition,
    TMethod extends HttpMethod,
    TPath extends string
> = Serialize<Awaited<ReturnType<TApi[TMethod][TPath]["handler"]>>>;

export interface ArriClientOpts {
    baseUrl?: string;
    defaultHeaders?: Record<string, string>;
}

export interface ApiRequestOptions<
    TApi extends ApiDefinition,
    TMethod extends HttpMethod,
    TPath extends ApiUrl<TApi, TMethod>
> extends Omit<FetchOptions, "method"> {
    params: TPath extends string ? ExtractParams<TPath> : undefined;
    query: RouteSchema<TApi, TMethod, TPath>;
    body: RouteSchema<TApi, TMethod, TPath>;
}

export class ArriClient<TApi extends ApiDefinition> {
    baseUrl: string;

    defaultHeaders: Record<string, string>;

    constructor(opts: ArriClientOpts) {
        this.baseUrl = opts.baseUrl ?? "";
        this.defaultHeaders = opts.defaultHeaders ?? {};
    }

    async request<
        TMethod extends HttpMethod,
        TUrl extends ApiUrl<TApi, TMethod>
    >(
        method: TMethod,
        url: TUrl,
        options?: ApiRequestOptions<TApi, TMethod, TUrl>
    ) {
        const headers = {
            ...this.defaultHeaders,
            ...options?.headers,
        };
        let finalUrl = url as string;
        if (options?.params) {
            Object.keys(options.params).forEach((key) => {
                finalUrl = finalUrl.replace(
                    `:${key}`,
                    (options.params as any)[key]
                );
            });
        }
        const result = (await ofetch(finalUrl, {
            ...options,
            method,
            params: undefined,
            headers,
        })) as RouteReturn<TApi, TMethod, TUrl>;
        return result;
    }

    delete<TUrl extends ApiUrl<TApi, "delete">>(
        url: TUrl,
        options?: ApiRequestOptions<TApi, "delete", TUrl>
    ) {
        return this.request("delete", url, options);
    }

    get<TUrl extends ApiUrl<TApi, "get">>(
        url: TUrl,
        options?: ApiRequestOptions<TApi, "get", TUrl>
    ) {
        return this.request("get", url, options);
    }

    patch<TUrl extends ApiUrl<TApi, "patch">>(
        url: TUrl,
        options?: ApiRequestOptions<TApi, "patch", TUrl>
    ) {
        return this.request("patch", url, options);
    }

    post<TUrl extends ApiUrl<TApi, "post">>(
        url: TUrl,
        options?: ApiRequestOptions<TApi, "post", TUrl>
    ) {
        return this.request("post", url, options);
    }

    put<TUrl extends ApiUrl<TApi, "put">>(
        url: TUrl,
        options?: ApiRequestOptions<TApi, "put", TUrl>
    ) {
        return this.request("put", url, options);
    }
}
