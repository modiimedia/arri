import { a } from '@arrirpc/schema';
import { defineOutputStreamRpc } from '@arrirpc/server';

export default defineOutputStreamRpc({
    input: a.object('AutoReconnectParams', {
        messageCount: a.uint8(),
    }),
    output: a.object('AutoReconnectResponse', {
        count: a.uint8(),
        message: a.string(),
    }),
    handler({ input, stream, peer }) {
        let messageCount = 0;
        stream.send();
        const interval = setInterval(async () => {
            messageCount++;
            await stream.push({
                count: messageCount,
                message: `Hello World ${messageCount}`,
            });
            if (messageCount === input.messageCount) {
                // manually close the connection without sending a "done" message
                stream.close({ notifyClients: false });
                peer?.close();
                return;
            }
            if (messageCount > input.messageCount) {
                throw new Error('Interval was not properly cleaned up');
            }
        }, 1);
        stream.onClosed(() => {
            clearInterval(interval);
        });
    },
});
