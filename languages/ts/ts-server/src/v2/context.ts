import { ArriHeaders } from '@arrirpc/core';

export interface RpcCall {
    rpcName: string;
    transport: string;
    clientVersion?: string;
    contentType: string;
    accept: string | undefined;
    headers: ArriHeaders;
    signal: AbortSignal;
    meta: RpcMeta;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RpcMeta extends Record<string, any> {}
