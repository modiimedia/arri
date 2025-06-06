import { a } from '@arrirpc/schema';
import { defineEventStreamRpc } from '@arrirpc/server';

export default defineEventStreamRpc({
    method: 'get',
    params: a.object('AutoReconnectParams', {
        messageCount: a.uint8(),
    }),
    response: a.object('AutoReconnectResponse', {
        count: a.uint8(),
        message: a.string(),
    }),
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
                throw new Error('Interval was not properly cleaned up');
            }
        }, 1);
        event.node.req.on('close', () => {
            console.log('REQ_CLOSE');
        });
        event.node.res.once('close', () => {
            console.log('RES_CLOSE');
            clearInterval(interval);
        });
        stream.onClosed(() => {
            clearInterval(interval);
        });
    },
});
