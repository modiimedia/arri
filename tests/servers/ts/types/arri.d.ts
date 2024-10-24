import "@arrirpc/server";

declare module "@arrirpc/server" {
    interface ArriEventContext {
        foo?: string;
    }
}
