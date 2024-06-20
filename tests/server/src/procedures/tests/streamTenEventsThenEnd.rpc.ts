import { defineEventStreamRpc } from "@arrirpc/server";
import { randomUUID } from "crypto";

import { ChatMessage } from "./streamMessages.rpc";

export default defineEventStreamRpc({
    description:
        "When the client receives the 'done' event, it should close the connection and NOT reconnect",
    params: undefined,
    response: ChatMessage,
    handler({ stream }) {
        let messageCount = 0;
        const interval = setInterval(async () => {
            messageCount++;
            await stream.push({
                id: randomUUID(),
                channelId: "1",
                date: new Date(),
                messageType: "TEXT",
                text: "hello world",
                userId: randomUUID(),
            });
            if (messageCount > 10) {
                throw new Error(
                    "Message count exceeded 10. This means setInterval was not properly cleaned up.",
                );
            }
            if (messageCount === 10) {
                await stream.close();
            }
        });
        async function cleanup() {
            clearInterval(interval);
        }
        stream.onClosed(() => cleanup());
        stream.send();
    },
});
