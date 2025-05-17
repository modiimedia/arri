import { a } from '@arrirpc/schema';
import { ArriRouter } from '@arrirpc/server';
import { defineRpc, defineService } from '@arrirpc/server-next';

export const manualRouter = new ArriRouter();
const DefaultPayload = a.object('DefaultPayload', {
    message: a.string(),
});

manualRouter.route({
    path: '/routes/hello-world',
    method: ['get', 'post'],
    handler(_) {
        return `hello world`;
    },
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
