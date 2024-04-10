import { defineWebsocketRpc } from "arri";
import {
    StreamLargeObjectsResponse,
    randomLargeObjectResponse,
} from "./streamLargeObjects.rpc";

export default defineWebsocketRpc({
    params: undefined,
    response: StreamLargeObjectsResponse,
    handler() {
        return {
            onOpen: (peer) => {
                peer.context.interval = setInterval(() => {
                    peer.send(randomLargeObjectResponse());
                });
            },
            onMessage: (peer, message) => {},
            onClose: (peer) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                clearInterval(peer.context.interval);
            },
            onError: (peer) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                clearInterval(peer.context.interval);
            },
        };
    },
});
