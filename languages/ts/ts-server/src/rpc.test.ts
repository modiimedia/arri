import { a } from '@arrirpc/schema';

import { ArriApp } from './app';
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

describe('union params on GET procedures', () => {
    const External = a.union({ id: a.string() });
    const Adjacent = a.union(
        { id: a.string() },
        { tagKey: 'kind', valueKey: 'data' },
    );
    const Internal = a.union(
        { user: a.object({ id: a.string() }) },
        { tagKey: 'kind' },
    );
    const Recursive = a.recursive<any>('RecursiveUnionParams', (self) =>
        a.union({ child: self, text: a.string() }),
    );
    const Discriminator = a.discriminator('kind', {
        USER: a.object({ id: a.string() }),
    });

    function rpc(name: string, method: 'get' | 'post', params: any) {
        new ArriApp().rpc(
            name,
            defineRpc({ method, params, response: undefined, handler() {} }),
        );
    }
    function stream(
        name: string,
        method: 'get' | 'post' | undefined,
        params: any,
    ) {
        new ArriApp().rpc(
            name,
            defineEventStreamRpc({
                method,
                params,
                response: a.object({ id: a.string() }),
                handler() {},
            }),
        );
    }

    it('rejects externally and adjacently tagged unions', () => {
        expect(() => rpc('external', 'get', External)).toThrow(
            /external.*only internally tagged unions/i,
        );
        expect(() => rpc('adjacent', 'get', Adjacent)).toThrow(
            /adjacent.*only internally tagged unions/i,
        );
        expect(() => rpc('recursive', 'get', Recursive)).toThrow(
            /recursive.*only internally tagged unions/i,
        );
        expect(() => rpc('nullable', 'get', a.nullable(External))).toThrow(
            /nullable.*only internally tagged unions/i,
        );
    });
    it('rejects them on event streams that use GET', () => {
        expect(() => stream('external', 'get', External)).toThrow(
            /only internally tagged unions/i,
        );
        expect(() => stream('adjacent', 'get', Adjacent)).toThrow(
            /only internally tagged unions/i,
        );
    });
    it('allows internally tagged unions and discriminators', () => {
        expect(() => rpc('internal', 'get', Internal)).not.toThrow();
        expect(() => rpc('legacy', 'get', Discriminator)).not.toThrow();
        expect(() => stream('internal', 'get', Internal)).not.toThrow();
    });
    it('allows every union style on other methods', () => {
        expect(() => rpc('external', 'post', External)).not.toThrow();
        expect(() => rpc('adjacent', 'post', Adjacent)).not.toThrow();
        expect(() => stream('external', 'post', External)).not.toThrow();
        expect(() => stream('external', undefined, External)).not.toThrow();
    });
});
