import { a } from '@arrirpc/schema';
import { defineEventStreamRpc } from '@arrirpc/server';

export default defineEventStreamRpc({
    params: a.object('AutoReconnectParams', {
        messageCount: a.uint8(),
    }),
    response: a.object('AutoReconnectResponse', {
        count: a.uint8(),
        message: a.string(),
    }),
    handler({ params, stream, peer }) {
        let messageCount = 0;
        stream.send();
        const interval = setInterval(async () => {
            messageCount++;
            await stream.push({
                count: messageCount,
                message: `Hello World ${messageCount}`,
            });
            if (messageCount === params.messageCount) {
                // manually close the connection without sending a "done" message
                stream.close({ notifyClients: false });
                peer?.close();
                return;
            }
            if (messageCount > params.messageCount) {
                throw new Error('Interval was not properly cleaned up');
            }
        }, 1);
        stream.onClosed(() => {
            clearInterval(interval);
        });
    },
});
