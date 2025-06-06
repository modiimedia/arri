import { a } from '@arrirpc/schema';
import { defineError, defineEventStreamRpc, getHeader } from '@arrirpc/server';

const heartbeatDuration = 300;

export default defineEventStreamRpc({
    description: `Sends 5 messages quickly then starts sending messages slowly (1s) after that.
When heartbeat is enabled the client should keep the connection alive regardless of the slowdown of messages.
When heartbeat is disabled the client should open a new connection sometime after receiving the 5th message.`,
    params: a.object({
        heartbeatEnabled: a.boolean(),
    }),
    heartbeatMs: heartbeatDuration,
    heartbeatEnabled: false,
    response: a.object({
        message: a.string(),
    }),
    async handler({ params, stream }, event) {
        const xTestHeader = getHeader(event, 'x-test-header');
        if (!xTestHeader) throw defineError(401);
        const lastEventId = a.coerce(
            a.uint32(),
            `${stream.lastEventId ?? '0'}`,
        );
        if (!lastEventId.success) {
            throw defineError(400, { message: 'Invalid event id' });
        }
        stream.send();
        let interval1: NodeJS.Timeout | undefined;
        if (params.heartbeatEnabled) {
            interval1 = setInterval(async () => {
                await stream.eventStream.push({ event: 'heartbeat', data: '' });
            }, heartbeatDuration);
        }
        for (let i = 0; i < 5; i++) {
            await stream.push({ message: `Hello world` });
        }
        // this will force trigger a reconnect when heartbeat is disabled
        const interval2 = setInterval(async () => {
            await stream.push({ message: `Hello world` });
        }, 1000);
        stream.onClosed(() => {
            clearInterval(interval1);
            clearInterval(interval2);
        });
    },
});
