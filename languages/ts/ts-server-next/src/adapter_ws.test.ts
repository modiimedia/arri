import { HttpAdapter } from './adapter_http';
import { WsAdapter } from './adapter_ws';

test('HttpDispatcher and WebsocketDispatcher work together', () => {
    const http = new HttpAdapter();
    new WsAdapter(http, '/ws');
});
