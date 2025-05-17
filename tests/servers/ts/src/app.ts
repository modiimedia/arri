import { a } from '@arrirpc/schema';
import {
    ArriApp,
    defineError,
    defineEventHandler,
    defineHttpMiddleware,
    getHeader,
    handleCors,
    HttpDispatcher,
    WsDispatcher,
} from '@arrirpc/server-next';

import { manualTestService } from './routes/other';

console.log('HELLO WORLD!');

const app = new ArriApp({
    rpcRoutePrefix: '/rpcs',
    version: '10',
});
const http = new HttpDispatcher({
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
    defineHttpMiddleware(async (event, _) => {
        const authHeader = getHeader(event, 'x-test-header');
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
const ws = new WsDispatcher(http);
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
