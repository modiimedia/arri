import { a } from '@arrirpc/schema';
import { defineRpc, defineService } from '@arrirpc/server';

const DefaultPayload = a.object('DefaultPayload', {
    message: a.string(),
});

export const manualTestService = defineService('tests', {
    emptyParamsGetRequest: defineRpc({
        method: 'get',
        input: undefined,
        output: DefaultPayload,
        handler() {
            return {
                message: 'ok',
            };
        },
    }),
    emptyParamsPostRequest: defineRpc({
        input: undefined,
        output: DefaultPayload,
        handler() {
            return {
                message: 'ok',
            };
        },
    }),
    emptyResponseGetRequest: defineRpc({
        method: 'get',
        input: DefaultPayload,
        output: undefined,
        handler() {},
    }),
    emptyResponsePostRequest: defineRpc({
        input: DefaultPayload,
        output: undefined,
        handler() {},
    }),
});
