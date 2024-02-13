import { randomUUID } from "crypto";
import { defineEventStreamRpc } from "arri";
import { ChatMessage } from "./streamMessages.rpc";

export default defineEventStreamRpc({
    params: undefined,
    response: ChatMessage,
    handler({ connection }) {
        let messageCount = 0;
        const interval = setInterval(async () => {
            messageCount++;
            await connection.push({
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
                await connection.end();
                await cleanup();
            }
        });
        async function cleanup() {
            clearInterval(interval);
        }
        connection.on("disconnect", () => cleanup());
        connection.start();
    },
});
