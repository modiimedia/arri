import { defineWebsocketRpc } from "@arrirpc/server";

import {
    randomLargeObjectResponse,
    StreamLargeObjectsResponse,
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
            onMessage: (_, __) => {},
            onClose: (_) => {},
            onError: (_) => {},
        };
    },
});
