import { a } from '@arrirpc/schema';
import {
    ArriApp,
    defineError,
    defineEventHandler,
    HttpAdapter,
    WsAdapter,
} from '@arrirpc/server-next';

import { registerHeartbeatTestRoute } from './heartbeat-tests';
import { manualTestService } from './routes/other';

const app = new ArriApp({
    rpcRoutePrefix: '/rpcs',
    version: '10',
});
const http = new HttpAdapter({
    port: 2020,
    cors: {
        origin: '*',
    },
});

const ws = new WsAdapter(http, '/establish-connection');
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
    defineEventHandler((_) => 'ok'),
);

http.h3Router.use(
    '/routes/hello-world',
    defineEventHandler((_) => {
        return 'hello world';
    }),
    ['get', 'post'],
);

registerHeartbeatTestRoute(http.h3Router);

export default app;
