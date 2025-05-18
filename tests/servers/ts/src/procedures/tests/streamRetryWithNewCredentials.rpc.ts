import { a } from '@arrirpc/schema';
import { defineError, defineEventStreamRpc } from '@arrirpc/server-next';

const usedTokens: Record<string, boolean> = {};

export default defineEventStreamRpc({
    params: undefined,
    response: a.object({
        message: a.string(),
    }),
    async handler({ stream, xTestHeader }) {
        const authToken = xTestHeader;
        if (!authToken) throw defineError(400);
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
            if (msgCount >= 10) stream.close(false);
        });
        stream.onClosed(() => {
            clearInterval(interval);
        });
    },
});
