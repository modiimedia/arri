import { a } from '@arrirpc/schema';
import {
    ArriApp,
    defineError,
    defineMiddleware,
    defineRpc,
    getHeader,
    handleCors,
} from '@arrirpc/server';
import { typeboxAdapter } from '@arrirpc/typebox-adapter';
import { Type } from '@sinclair/typebox';

import { manualRouter, manualTestService } from './routes/other';

const app = new ArriApp({
    rpcRoutePrefix: 'rpcs',
    appInfo: {
        version: '10',
    },
    onRequest(event) {
        handleCors(event, {
            origin: '*',
        });
    },
});

app.use(
    defineMiddleware(async (event) => {
        const authHeader = getHeader(event, 'x-test-header');
        if (
            !authHeader?.length &&
            event.path !== '/' &&
            event.path !== '/status' &&
            event.path !== '/favicon.ico'
        ) {
            throw defineError(401, {
                message: "Missing test auth header 'x-test-header'",
            });
        }
    }),
);

app.route({
    path: '/status',
    method: 'get',
    handler() {
        return 'ok';
    },
});

app.registerDefinitions({
    ManuallyAddedModel: a.object({
        hello: a.string(),
    }),
});

app.use(manualRouter);
app.use(manualTestService);

app.rpc(
    'HelloTypebox',
    defineRpc({
        params: typeboxAdapter(
            Type.Object({
                id: Type.String(),
            }),
        ),
        response: undefined,
        async handler() {},
    }),
);

export default app;
