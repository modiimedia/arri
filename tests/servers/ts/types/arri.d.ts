import '@arrirpc/server';

import { Peer } from '@arrirpc/server/ws';

declare module '@arrirpc/server' {
    interface RpcContext {
        foo?: string;
        peer?: Peer;
    }
}
