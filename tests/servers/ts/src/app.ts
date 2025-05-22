import { a } from '@arrirpc/schema';
import {
    ArriApp,
    defineError,
    defineEventHandler,
    HttpAdapter,
    WsAdapter,
} from '@arrirpc/server-next';

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
    onError(event, err) {
        console.log('ERROR', event.path, err);
    },
});

const ws = new WsAdapter(http, '/establish-connection');
app.use(http);
app.use(ws);
app.use(manualTestService);

// auth middleware
app.use(async (context) => {
    const authHeader = context.headers['x-test-header'];
    context.xTestHeader = authHeader;
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

app.registerDefinitions({
    ManuallyAddedModel: a.object({
        hello: a.string(),
    }),
});

// http.h3App.use(manualRouter);
// app.use(manualTestService);

export default app;
