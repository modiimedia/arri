import { a } from '@arrirpc/schema';

import { defineRpc, RpcHandler } from './rpc';

describe('Type inference', () => {
    const Params = a.discriminator('type', {
        FOO: a.object({ foo: a.string() }),
        BAR: a.object({ bar: a.boolean() }),
    });
    type Params = a.infer<typeof Params>;
    const Response = a.object({
        foo: a.string(),
        bar: a.boolean(),
        baz: a.object({
            foo: a.string(),
        }),
    });
    type Response = a.infer<typeof Response>;
    test('params and response present', () => {
        defineRpc({
            params: Params,
            response: Response,
            handler({ params }) {
                assertType<Params>(params);
                assertType<'FOO' | 'BAR'>(params.type);
                return {
                    foo: '',
                    bar: false,
                    baz: {
                        foo: '',
                    },
                };
            },
            postHandler({ params, response }) {
                assertType<Params>(params);
                assertType<Response>(response);
            },
        });
    });
    test('params present', () => {
        defineRpc({
            params: Params,
            handler({ params }) {
                assertType<Params>(params);
            },
            postHandler({ params, response }) {
                assertType<Params>(params);
                assertType<undefined>(response);
            },
        });
    });
    test('response present', () => {
        defineRpc({
            response: Response,
            handler({ params }) {
                assertType<undefined>(params);
                return {
                    foo: '',
                    bar: false,
                    baz: {
                        foo: '',
                    },
                };
            },
            postHandler({ params, response }) {
                assertType<undefined>(params);
                assertType<Response>(response);
            },
        });
    });
    test('Rpc Handler', () => {
        type HandlerTypeNoResponse = RpcHandler<{ foo: 'foo' }, undefined>;
        type HandlerTypeResponse = RpcHandler<undefined, { foo: 'foo' }>;
        function voidFn() {}
        assertType<ReturnType<HandlerTypeNoResponse>>(voidFn());
        assertType<ReturnType<HandlerTypeResponse>>({ foo: 'foo' });
    });
});
