import { a } from '@arrirpc/schema';
import { defineError, defineOutputStreamRpc } from '@arrirpc/server';

const usedTokens: Record<string, boolean> = {};

export default defineOutputStreamRpc({
    input: undefined,
    output: a.object({
        message: a.string(),
    }),
    async handler({ stream, headers, peer }) {
        const authToken = headers['x-test-header'];
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
            if (msgCount >= 10) {
                stream.close({ notifyClients: false });
                peer?.close();
            }
        });
        stream.onClosed(() => {
            clearInterval(interval);
        });
    },
});
