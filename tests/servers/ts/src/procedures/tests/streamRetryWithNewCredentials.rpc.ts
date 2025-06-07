import { a } from '@arrirpc/schema';
import { defineError, defineEventStreamRpc, getHeader } from '@arrirpc/server';

const usedTokens: Record<string, boolean> = {};

export default defineEventStreamRpc({
    params: undefined,
    response: a.object({
        message: a.string(),
    }),
    async handler({ stream }, event) {
        const authToken = getHeader(event, 'x-test-header');
        if (!authToken) {
            throw defineError(400);
        }
        if (usedTokens[authToken]) {
            throw defineError(403, {
                message: 'Token has expired',
            });
        }
        usedTokens[authToken] = true;
        stream.send();
        await stream.push({ message: 'ok' });
        let msgCount = 0;
        const interval = setInterval(async () => {
            await stream.push({ message: 'ok' });
            msgCount++;
            if (msgCount >= 10) {
                event.node.res.end();
            }
        });
        stream.onClosed(() => {
            clearInterval(interval);
        });
    },
});
