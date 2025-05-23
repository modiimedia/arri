import '@arrirpc/server-next';

declare module '@arrirpc/server-next' {
    interface RpcContext {
        foo?: string;
    }
}
