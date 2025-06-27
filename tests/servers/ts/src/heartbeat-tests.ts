import {
    createEventStream,
    defineEventHandler,
    getQuery,
    Router,
    setResponseHeader,
} from '@arrirpc/server/http';

export function registerHeartbeatTestRoute(router: Router) {
    const heartbeatMs = 300;
    router.get(
        '/heartbeat-test',
        defineEventHandler(async (event) => {
            const eventStream = createEventStream(event);
            setResponseHeader(event, 'heartbeat-interval', heartbeatMs);
            eventStream.send();
            const heartbeatEnabledQuery = getQuery(event).heartbeatEnabled;
            const heartbeatEnabled =
                heartbeatEnabledQuery === 'true' ||
                heartbeatEnabledQuery === 'TRUE';
            for (let i = 0; i < 5; i++) {
                await eventStream.push({
                    event: 'message',
                    data: `{"message":"hello world"}`,
                });
            }
            let interval1: NodeJS.Timeout | undefined;
            if (heartbeatEnabled) {
                interval1 = setInterval(async () => {
                    await eventStream.push({ event: 'heartbeat', data: '' });
                }, heartbeatMs);
            }
            // this slow message interval should cause clients to reconnect when heartbeat has been disabled
            // when heartbeat is enabled the connection should remain open
            const interval2 = setInterval(async () => {
                await eventStream.push({
                    event: 'message',
                    data: `{"message":"hello world"}`,
                });
            }, 1000);
            eventStream.onClosed(() => {
                clearInterval(interval1);
                clearInterval(interval2);
            });
        }),
    );
}
