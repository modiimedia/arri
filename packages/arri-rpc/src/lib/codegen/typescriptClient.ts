import { type Static } from "@sinclair/typebox";
import { ofetch, type FetchOptions } from "ofetch";
import { type ApplicationDefinition } from "./utils";
import { type RpcMethod } from "../arri-rpc";
import { kebabCase } from "scule";

export interface ArriClientOpts {
    baseUrl?: string;
    headers?: Record<string, string>;
}

export class ArriClient<T extends ApplicationDefinition = any> {
    baseUrl: string;
    headers: Record<string, string>;

    constructor(opts: ArriClientOpts = {}) {
        this.baseUrl = opts.baseUrl ?? "";
        this.headers = opts.headers ?? {};
    }

    async request<TName extends keyof T["procedures"]>(
        procedure: TName,
        opts: RequestOpts<
            ExtractRpcMethod<T, TName>,
            ExtractRpcParams<T, TName>
        >
    ): Promise<ExtractRpcResponse<T, TName>> {
        const pathParts: string[] = [];
        for (const part of procedure.toString().split(".")) {
            pathParts.push(kebabCase(part.trim()));
        }
        const url = `/${pathParts.join("/")}`;
        const result = await ofetch(url, {
            method: opts.method,
            query: opts.method === "get" ? (opts.params as any) : undefined,
            body: opts.method !== "get" ? (opts.params as any) : undefined,
            baseURL: this.baseUrl,
            headers: { ...this.headers, ...opts.headers },
        });
        return result;
    }

    async rawRequest<TName extends keyof T["procedures"]>(
        procedure: TName,
        opts: RawRequestOpts<T, TName>
    ) {
        const pathParts: string[] = [];
        for (const part of procedure.toString().split(".")) {
            pathParts.push(kebabCase(part.trim()));
        }
        const url = `/${pathParts.join("/")}`;
        const result = await ofetch(url, {
            ...opts,
            baseURL: opts.baseURL ?? this.baseUrl,
            headers: { ...this.headers, ...opts.headers },
        });
        return result;
    }
}

export type ExtractRpc<
    TDef extends ApplicationDefinition,
    TName extends keyof TDef["procedures"]
> = TDef["procedures"][TName];

export type ExtractRpcMethod<
    TDef extends ApplicationDefinition,
    TName extends keyof TDef["procedures"]
> = ExtractRpc<TDef, TName>["method"];

export type ExtractRpcParams<
    TDef extends ApplicationDefinition,
    TName extends keyof TDef["procedures"]
> = Static<TDef["models"][ExtractRpc<TDef, TName>["params"]]>;

export type ExtractRpcResponse<
    TDef extends ApplicationDefinition,
    TName extends keyof TDef["procedures"]
> = Static<TDef["models"][ExtractRpc<TDef, TName>["response"]]>;

export interface RawRequestOpts<
    TDef extends ApplicationDefinition,
    TName extends keyof TDef["procedures"]
> extends FetchOptions {
    method: ExtractRpcMethod<TDef, TName>;
}

export interface RequestOpts<
    TMethod extends RpcMethod = "post",
    TParams = any
> {
    method: TMethod;
    params: TParams;
    headers?: Record<string, string>;
}
