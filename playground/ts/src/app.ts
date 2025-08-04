import { ArriApp, HttpAdapter, WsAdapter } from '@arrirpc/server';
import { handleCors } from '@arrirpc/server/http';

const app = new ArriApp({
    defaultTransport: ['http', 'ws'],
});
const http = new HttpAdapter({
    async onRequest(event) {
        handleCors(event, {
            origin: '*',
        });
    },
});
const ws = new WsAdapter(http, { connectionPath: '/ws' });

app.use(http);
app.use(ws);

export default app;
