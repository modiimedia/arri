import { randomUUID } from "crypto";
import { defineEventStreamRpc } from "arri";
import { ChatMessage } from "./streamMessages.rpc";

export default defineEventStreamRpc({
    method: "post",
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
                await stream.pushError({
                    statusCode: 400,
                    statusMessage: "Too many requests",
                });
                await cleanup();
            }
        });
        async function cleanup() {
            clearInterval(interval);
        }
        stream.onClose(() => cleanup());
    },
});
