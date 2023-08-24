import { type TSchema, type Static } from "@sinclair/typebox";
import { ofetch, type FetchOptions } from "ofetch";
import type { Serialize } from "nitropack";
import { kebabCase } from "scule";
import { type ClientDefinition as ExampleDefinition } from "../../../.arri/definition";

export interface ArriClientOpts {
    baseUrl?: string;
    headers?: Record<string, string>;
}

export type ArriClientDefinition = Record<string, any>;

export class ArriClient<T extends ArriClientDefinition = any> {
    baseUrl: string;
    headers: Record<string, string>;

    constructor(opts: ArriClientOpts = {}) {
        this.baseUrl = opts.baseUrl ?? "";
        this.headers = opts.headers ?? {};
    }

    async request<TName extends keyof T>(
        procedure: TName,
        // eslint-disable-next-line @typescript-eslint/ban-types
        opts: T[TName]["path"]["params"] extends undefined
            ? RequestOpts<T, TName>
            : RequestOptsWithParams<T, TName>
    ): Promise<ExtractRpcResponse<T, TName>> {
        const pathParts: string[] = [];
        for (const part of procedure.toString().split(".")) {
            pathParts.push(kebabCase(part.trim()));
        }
        const url = `/${pathParts.join("/")}`;
        const result = await ofetch(url, {
            method: (opts.method ?? "get") as string,
            query:
                opts.method === "get" && "params" in opts
                    ? opts.params
                    : undefined,
            body:
                opts.method !== "get" && "params" in opts
                    ? opts.params
                    : undefined,
            baseURL: this.baseUrl,
            headers: { ...this.headers, ...opts.headers },
        });
        return result;
    }

    async rawRequest<TName extends keyof T>(
        procedure: TName,
        opts: RawRequestOpts<T, TName>
    ) {
        const pathParts: string[] = [];
        for (const part of procedure.toString().split(".")) {
            pathParts.push(kebabCase(part.trim()));
        }
        const url = `/${pathParts.join("/")}`;
        const result = await ofetch(url, {
            ...(opts as any),
            baseURL: opts.baseURL ?? this.baseUrl,
            headers: { ...this.headers, ...opts.headers },
        });
        return result;
    }
}

export type ExtractRpc<
    TDef extends ArriClientDefinition,
    TName extends keyof TDef
> = TDef[TName]["path"];

export type ExtractRpcMethod<
    TDef extends ArriClientDefinition,
    TName extends keyof TDef
> = TDef[TName]["method"];

export type ExtractRpcParams<
    TDef extends ArriClientDefinition,
    TName extends keyof TDef
> = TDef[TName]["path"]["params"] extends undefined
    ? never
    : Static<TDef[TName]["path"]["params"]>;

export type ExtractRpcResponse<
    TDef extends ArriClientDefinition,
    TName extends keyof TDef
> = ExtractRpc<TDef, TName>["response"] extends TSchema
    ? Serialize<Static<ExtractRpc<TDef, TName>["response"]>>
    : Serialize<Awaited<ReturnType<ExtractRpc<TDef, TName>["handler"]>>>;

export interface RawRequestOpts<
    TDef extends ArriClientDefinition,
    TName extends keyof TDef
> extends FetchOptions {
    method: ExtractRpcMethod<TDef, TName>;
}

export interface RequestOpts<
    TDef extends ArriClientDefinition,
    TName extends keyof TDef
> {
    method: ExtractRpcMethod<TDef, TName>;
    headers?: Record<string, string>;
}

export interface RequestOptsWithParams<
    TDef extends ArriClientDefinition,
    TName extends keyof TDef
> extends RequestOpts<TDef, TName> {
    params: ExtractRpcParams<TDef, TName>;
}

async function main() {
    const client = new ArriClient<ExampleDefinition>();
    const result = await client.request("comments.getPostComments", {
        method: "get",
        params: {
            postId: "",
        },
    });
    const result2 = await client.request("posts.deletePost", {
        method: "post",
        params: {},
    });
    console.log(result, result2);
}

void main();
