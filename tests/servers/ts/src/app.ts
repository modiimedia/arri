import { a } from '@arrirpc/schema';
import {
    ArriApp,
    defineError,
    defineEventHandler,
    defineHttpMiddleware,
    getHeader,
    handleCors,
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
    onRequest(event, _) {
        handleCors(event, {
            origin: '*',
        });
    },
    onError(event, err) {
        console.log('ERROR', event.path, err);
    },
});
http.use(
    defineHttpMiddleware(async (event, context) => {
        const authHeader = getHeader(event, 'x-test-header');
        context.xTestHeader = authHeader;
        if (
            !authHeader?.length &&
            event.path !== '/' &&
            event.path !== '/status' &&
            event.path !== '/favicon.ico' &&
            !event.path.endsWith('definition')
        ) {
            throw defineError(401, {
                message: "Missing test auth header 'x-test-header'",
            });
        }
    }),
);
const ws = new WsAdapter(http);
app.use(http);
app.use(ws);
app.use(manualTestService);

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
