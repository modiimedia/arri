import { randomUUID } from "crypto";
import { defineEventStreamRpc } from "arri";
import { ChatMessage } from "./streamMessages.rpc";

export default defineEventStreamRpc({
    method: "post",
    params: undefined,
    response: ChatMessage,
    handler({ connection }) {
        let messageCount = 0;
        const interval = setInterval(async () => {
            if (messageCount === 10) {
                await connection.pushError({
                    statusCode: 400,
                    statusMessage: "Too many requests",
                });
                await cleanup();
                return;
            }
            await connection.push({
                id: randomUUID(),
                channelId: "1",
                date: new Date(),
                messageType: "TEXT",
                text: "hello world",
                userId: randomUUID(),
            });
            messageCount++;
        }, 100);
        async function cleanup() {
            clearInterval(interval);
            await connection.close();
        }
        connection.on("disconnect", () => cleanup());
        connection.start();
    },
});
