import { defineWebsocketRpc } from "arri";
import { a } from "arri-validate";

export default defineWebsocketRpc({
    params: a.object({
        name: a.string(),
    }),
    response: a.object({
        message: a.string(),
    }),
    handler: {
        onClose: (peer) => {
            console.log("CLOSED", peer);
        },
        onOpen: (peer) => {
            console.log("OPENED", peer);
        },
        onMessage: (peer, message) => {
            console.log("MESSAGE", peer, message);
            peer.send({ message: `Hello ${message.name}` });
        },
        onError: (peer, error) => {},
    },
});
