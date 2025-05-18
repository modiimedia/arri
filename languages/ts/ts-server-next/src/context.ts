export interface RpcContext {
    transport: string;
    rpcName: string;
    clientVersion?: string;
    headers: Record<string, string | undefined>;
}
