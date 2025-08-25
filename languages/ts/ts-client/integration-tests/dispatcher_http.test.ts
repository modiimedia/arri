import { a } from '@arrirpc/schema';

import { HttpDispatcher } from '../src/dispatcher_http';
import { RpcRequest, RpcRequestValidator } from '../src/requests';

describe('[HTTP] respects heartbeat header', () => {
    const dispatcher = new HttpDispatcher({ baseUrl: 'http://localhost:2020' });
    const $$Params = a.compile(a.object({ heartbeatEnabled: a.boolean() }));
    const $$Response = a.compile(a.object({ message: a.string() }));
    const requestFactory = (
        heartbeatEnabled: boolean,
    ): RpcRequest<{ heartbeatEnabled: boolean }> => ({
        reqId: '1',
        clientVersion: '22',
        procedure: 'heartbeatTest',
        method: 'get',
        path: '/heartbeat-test',
        data: { heartbeatEnabled: heartbeatEnabled },
    });
    const validator: RpcRequestValidator<
        { heartbeatEnabled: boolean },
        { message: string }
    > = {
        params: {
            new: () => ({ heartbeatEnabled: false }),
            validate: $$Params.validate,
            fromJson: $$Params.parseUnsafe,
            fromJsonString: $$Params.parseUnsafe,
            toJsonString: $$Params.serializeUnsafe,
            toUrlQueryString: (input) => {
                return `heartbeatEnabled=${input.heartbeatEnabled}`;
            },
        },
        response: {
            new: () => ({ message: '' }),
            validate: $$Response.validate,
            fromJson: $$Response.parseUnsafe,
            fromJsonString: $$Response.parseUnsafe,
            toJsonString: $$Response.serializeUnsafe,
            toUrlQueryString: function (input: { message: string }): string {
                return `message=${input.message}`;
            },
        },
    };
    test(
        'reconnects when no heartbeat is received',
        { timeout: 30000 },
        async () => {
            let msgCount = 0;
            let openCount = 0;
            await new Promise((res, rej) => {
                const controller = dispatcher.handleEventStreamRpc(
                    requestFactory(false),
                    validator,
                    {
                        onMessage(_) {
                            msgCount++;
                            if (msgCount >= 15) controller.abort();
                        },
                        onOpen() {
                            openCount++;
                        },
                        onError(err) {
                            rej(err);
                        },
                    },
                );
                controller.onAbort(() => res(undefined));
            });
            expect(openCount).toBe(3);
            expect(msgCount).toBe(15);
        },
    );
    test(
        'keeps connection alive when heartbeat is received',
        {
            timeout: 30000,
        },
        async () => {
            let msgCount = 0;
            let openCount = 0;
            await new Promise((res, rej) => {
                const controller = dispatcher.handleEventStreamRpc(
                    requestFactory(true),
                    validator,
                    {
                        onMessage(_) {
                            msgCount++;
                            if (msgCount >= 15) controller.abort();
                        },
                        onOpen() {
                            openCount++;
                        },
                        onError(err) {
                            rej(err);
                        },
                    },
                );
                controller.onAbort(() => res(undefined));
            });
            expect(openCount).toBe(1);
            expect(msgCount).toBe(15);
        },
    );
});
