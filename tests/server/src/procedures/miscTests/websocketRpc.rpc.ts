import { defineWebsocketRpc } from "arri";
import { a } from "arri-validate";

const EntityFields = a.object({
    entityId: a.string(),
    x: a.float64(),
    y: a.float64(),
});

const ParamsSchema = a.discriminator(
    "type",
    {
        CREATE_ENTITY: EntityFields,
        UPDATE_ENTITY: EntityFields,
        DISCONNECT: a.object({
            reason: a.string(),
        }),
    },
    {
        id: "WsMessageParams",
    },
);

const ResponseSchema = a.discriminator(
    "type",
    {
        ENTITY_CREATED: EntityFields,
        ENTITY_UPDATED: EntityFields,
    },
    {
        id: "WsMessageResponse",
    },
);

export default defineWebsocketRpc({
    params: ParamsSchema,
    response: ResponseSchema,
    handler: {
        onClose: (peer) => {},
        onOpen: (peer) => {
            console.log(peer.url);
        },
        onMessage: async (peer, message) => {
            switch (message.type) {
                case "CREATE_ENTITY":
                    peer.send({
                        type: "ENTITY_CREATED",
                        entityId: message.entityId,
                        x: message.x,
                        y: message.y,
                    });
                    break;
                case "UPDATE_ENTITY":
                    peer.send({
                        type: "ENTITY_UPDATED",
                        entityId: message.entityId,
                        x: message.x,
                        y: message.y,
                    });
                    break;
            }
        },
        onError: (peer, error) => {},
    },
});
