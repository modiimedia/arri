import '@arrirpc/server';

declare module '@arrirpc/server' {
    interface RpcContext {
        foo?: string;
    }
}
