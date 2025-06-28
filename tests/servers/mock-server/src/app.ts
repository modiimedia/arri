import { ArriApp, HttpAdapter, WsAdapter } from '@arrirpc/server';

const app = new ArriApp();
const http = new HttpAdapter();
const ws = new WsAdapter(http, { connectionPath: '/create-connection' });
app.use(http);
app.use(ws);

export default app;
