import { defineEventStreamRpc } from "arri";
import { a } from "arri-validate";

export default defineEventStreamRpc({
    params: undefined,
    response: a.object({
        message: a.string(),
    }),
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
            await connection.push({ message: "hello world" });
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
