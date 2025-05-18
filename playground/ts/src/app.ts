import {
    ArriApp,
    handleCors,
    HttpAdapter,
    WsAdapter,
} from '@arrirpc/server-next';

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
const ws = new WsAdapter(http, '/ws', {
    onRequest: (peer, context) => {
        console.log('REQUEST', peer.id, context);
    },
    onOpen: (peer) => {
        console.log('OPENED', peer.id);
    },
    onClose: (peer, details) => {
        console.log('CLOSED', peer.id, details);
    },
});
app.use(http);
app.use(ws);

export default app;
