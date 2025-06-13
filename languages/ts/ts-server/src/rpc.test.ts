import { a } from '@arrirpc/schema';

import { defineEventStreamRpc } from './eventStreamRpc';
import { createHttpRpcDefinition, defineRpc } from './rpc';
describe('Type Inference', () => {
    it('infers types properly', async () => {
        const Params = a.object({
            id: a.string(),
        });
        type Params = a.infer<typeof Params>;
        const Response = a.object({
            id: a.string(),
            count: a.int32(),
        });
        type Response = a.infer<typeof Params>;
        const rpc = defineRpc({
            params: Params,
            response: Response,
            handler({ params }) {
                assertType<Params>({ id: '' });
                return {
                    id: params.id,
                    count: 1245313,
                };
            },
        });
        const result = await rpc.handler(
            {
                params: { id: '12314' },
                rpcName: '',
            },

            {} as any,
        );
        assertType<Response>(result);
    });
});

test('create rpc definition', () => {
    const rpc = defineRpc({
        params: undefined,
        response: undefined,
        handler() {},
    });
    const rpcDef = createHttpRpcDefinition('hello.world', '/hello/world', rpc);
    expect(rpcDef.method).toBe('post');
    expect(rpcDef.isEventStream).toBe(undefined);
    const eventStreamRpc = defineEventStreamRpc({
        params: undefined,
        response: a.object({
            id: a.string(),
        }),
        handler() {},
    });
    const eventStreamDef = createHttpRpcDefinition(
        'hello.world',
        '/hello/world',
        eventStreamRpc,
    );
    expect(eventStreamDef.method).toBe('post');
    expect(eventStreamDef.isEventStream).toBe(true);
});
