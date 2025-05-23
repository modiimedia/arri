import { a } from '@arrirpc/schema';
import { defineRpc, defineService } from '@arrirpc/server-next';

const DefaultPayload = a.object('DefaultPayload', {
    message: a.string(),
});

export const manualTestService = defineService('tests', {
    emptyParamsGetRequest: defineRpc({
        method: 'get',
        params: undefined,
        response: DefaultPayload,
        handler() {
            return {
                message: 'ok',
            };
        },
    }),
    emptyParamsPostRequest: defineRpc({
        params: undefined,
        response: DefaultPayload,
        handler() {
            return {
                message: 'ok',
            };
        },
    }),
    emptyResponseGetRequest: defineRpc({
        method: 'get',
        params: DefaultPayload,
        response: undefined,
        handler() {},
    }),
    emptyResponsePostRequest: defineRpc({
        params: DefaultPayload,
        response: undefined,
        handler() {},
    }),
});
