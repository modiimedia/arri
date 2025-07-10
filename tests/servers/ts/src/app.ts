import { a } from '@arrirpc/schema';
import { ArriApp, defineError, HttpAdapter, WsAdapter } from '@arrirpc/server';
import * as h3 from '@arrirpc/server/http';

import { registerHeartbeatTestRouteH3 } from './heartbeat-tests';
import { manualTestService } from './routes/other';

const app = new ArriApp({
    rpcRoutePrefix: '/rpcs',
    version: '10',
    defaultTransport: ['http', 'ws'],
});
const http = new HttpAdapter({
    port: 2020,
    cors: {
        origin: '*',
    },
});
const ws = new WsAdapter(http, {
    connectionPath: '/establish-connection',
    onRequest(peer, context) {
        context.peer = peer;
    },
});
app.use(http);
app.use(ws);

app.registerDefinitions({
    ManuallyAddedModel: a.object({
        hello: a.string(),
    }),
});

app.use(manualTestService);

// auth middleware
app.use(async (context) => {
    const authHeader = context.headers['x-test-header'];
    if (!authHeader?.length && context.rpcName.length) {
        throw defineError(401, {
            message: "Missing test auth header 'x-test-header'",
        });
    }
});

http.h3Router.get(
    '/status',
    h3.defineEventHandler((_) => 'ok'),
);

http.h3Router.use(
    '/routes/hello-world',
    h3.defineEventHandler((_) => {
        return 'hello world';
    }),
    ['get', 'post'],
);

registerHeartbeatTestRouteH3(http.h3Router);

export default app;
