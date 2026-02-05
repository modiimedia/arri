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
            input: Params,
            output: Response,
            handler({ input: params }) {
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
            postHandler({ input: params, output: response }) {
                assertType<Params>(params);
                assertType<Response>(response);
            },
        });
    });
    test('params present', () => {
        defineRpc({
            input: Params,
            handler({ input: params }) {
                assertType<Params>(params);
            },
            postHandler({ input: params, output: response }) {
                assertType<Params>(params);
                assertType<undefined>(response);
            },
        });
    });
    test('response present', () => {
        defineRpc({
            output: Response,
            handler({ input: params }) {
                assertType<undefined>(params);
                return {
                    foo: '',
                    bar: false,
                    baz: {
                        foo: '',
                    },
                };
            },
            postHandler({ input: params, output: response }) {
                assertType<undefined>(params);
                assertType<Response>(response);
            },
        });
    });
    test('Rpc Handler', () => {
        type HandlerTypeNoResponse = RpcHandler<{ foo: 'foo' }, void>;
        type HandlerTypeResponse = RpcHandler<undefined, { foo: 'foo' }>;
        function voidFn() {}
        assertType<ReturnType<HandlerTypeNoResponse>>(voidFn());
        assertType<ReturnType<HandlerTypeResponse>>({ foo: 'foo' });
    });
    test('Recursive Unions', () => {
        type RecursiveUnion =
            | { type: 'CHILD'; data: RecursiveUnion }
            | {
                  type: 'CHILDREN';
                  data: RecursiveUnion[];
              }
            | { type: 'TEXT'; data: string }
            | {
                  type: 'SHAPE';
                  data: { width: number; height: number; color: string };
              };

        const RecursiveUnion = a.recursive<RecursiveUnion>(
            'RecursiveUnion',
            (self) =>
                a.discriminator('type', {
                    CHILD: a.object(
                        {
                            data: self,
                        },
                        { description: 'Child node' },
                    ),
                    CHILDREN: a.object(
                        {
                            data: a.array(self),
                        },
                        { description: 'List of children node' },
                    ),
                    TEXT: a.object(
                        {
                            data: a.string(),
                        },
                        {
                            description: 'Text node',
                        },
                    ),
                    SHAPE: a.object(
                        {
                            data: a.object({
                                width: a.float64(),
                                height: a.float64(),
                                color: a.string(),
                            }),
                        },
                        {
                            description: 'Shape node',
                        },
                    ),
                }),
        );
        defineRpc({
            input: RecursiveUnion,
            output: RecursiveUnion,
            async handler({ input: params }) {
                return params;
            },
        });
    });
});
