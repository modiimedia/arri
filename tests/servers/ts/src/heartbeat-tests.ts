import {
    createEventStream,
    defineEventHandler,
    getQuery,
    Router,
    setResponseHeader,
} from '@arrirpc/server/http';
import * as express from 'express';

const heartbeatMs = 300;

export function registerHeartbeatTestRouteH3(router: Router) {
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

export function registerHeartbeatTestRouteExpress(
    express: express.Application,
) {
    express.get('/heartbeat-test', (req, res) => {
        res.setHeader('heartbeat-interval', heartbeatMs.toString());

        const heartbeatEnabled =
            req.query.heartbeatEnabled === 'TRUE' ||
            req.query.heartbeatEnabled === 'true';

        res.status(200);
        res.setHeader('Content-Type', 'text/event-stream');

        for (let i = 0; i < 5; i++) {
            res.send(`event: message\ndata: {"message":"hello world"}\n\n`);
        }
        let interval1: NodeJS.Timeout | undefined;
        if (heartbeatEnabled) {
            interval1 = setInterval(() => {
                res.send(`event: heartbeat\ndata:\n\n`);
            }, heartbeatMs);
        }

        const interval2 = setInterval(async () => {
            res.send(`event: message\ndata: {"message":"hello world"}\n\n`);
        }, 1000);
        req.on('close', () => {
            clearInterval(interval1);
            clearInterval(interval2);
        });
        res.on('close', () => {
            clearInterval(interval1);
            clearInterval(interval2);
        });
    });
}
