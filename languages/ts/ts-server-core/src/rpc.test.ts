import { a } from '@arrirpc/schema';

import { defineRpc } from './rpc';

test('Type Inference', () => {
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
