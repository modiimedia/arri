import { HttpDispatcher } from './transport_http';
import { WsDispatcher } from './transport_ws';

test('HttpDispatcher and WebsocketDispatcher work together', () => {
    const http = new HttpDispatcher();
    new WsDispatcher(http);
});
