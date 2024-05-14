import { defineWebsocketRpc } from "@arrirpc/server";
import {
    StreamLargeObjectsResponse,
    randomLargeObjectResponse,
} from "./streamLargeObjects.rpc";

export default defineWebsocketRpc({
    params: undefined,
    response: StreamLargeObjectsResponse,
    handler() {
        return {
            onOpen: async (peer) => {
                for (let i = 0; i < 10; i++) {
                    peer.send(randomLargeObjectResponse());
                }
            },
            onMessage: (peer, message) => {},
            onClose: (peer) => {},
            onError: (peer) => {},
        };
    },
});
