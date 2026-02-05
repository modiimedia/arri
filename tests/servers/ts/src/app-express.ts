import { ExpressAdapter } from '@arrirpc/express-adapter';
import { a } from '@arrirpc/schema';
import { ArriApp, defineError, WsAdapter } from '@arrirpc/server';
import * as express from 'express';

import { registerHeartbeatTestRouteExpress } from './heartbeat-tests';
import { manualTestService } from './routes/other';

const expressApp = express.default();
expressApp.use(express.json());
expressApp.use(express.urlencoded());

const app = new ArriApp({
    rpcRoutePrefix: '/rpcs',
    version: '10',
});
const http = new ExpressAdapter({
    debug: true,
    port: 2020,
    app: expressApp,
});
app.use(http);
app.use(new WsAdapter(http, { connectionPath: '/establish-connection' }));

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

expressApp.get('/status', (_, res) => {
    res.status(200).end('ok');
});

expressApp.get('/routes/hello-world', (_, res) => {
    res.status(200).end('hello world');
});
expressApp.post('/routes/hello-world', (_, res) => {
    res.status(200).end('hello world');
});

registerHeartbeatTestRouteExpress(expressApp);

export default app;
