import { defineEventStreamRpc } from "arri";
import { a } from "arri-validate";

export default defineEventStreamRpc({
    params: a.object(
        {
            messageCount: a.uint8(),
        },
        { id: "AutoReconnectParams" },
    ),
    response: a.object(
        {
            count: a.uint8(),
            message: a.string(),
        },
        { id: "AutoReconnectResponse" },
    ),
    handler({ params, stream }, event) {
        let messageCount = 0;
        const interval = setInterval(async () => {
            messageCount++;
            await stream.push({
                count: messageCount,
                message: `Hello World ${messageCount}`,
            });
            if (messageCount === params.messageCount) {
                // manually close the connection without sending a "done" message
                event.node.res.end();
                return;
            }
            if (messageCount > params.messageCount) {
                throw new Error("Interval was not properly cleaned up");
            }
        });
        stream.onClose(() => {
            clearInterval(interval);
        });
    },
});
