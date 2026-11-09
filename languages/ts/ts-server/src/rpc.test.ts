import { a } from '@arrirpc/schema';
import type { MockInstance } from 'vitest';

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
    it('rejects internally tagged unions with unsupported fields', () => {
        const NestedObject = a.union(
            { user: a.object({ id: a.string(), tags: a.array(a.string()) }) },
            { tagKey: 'kind' },
        );
        expect(() => rpc('nested', 'get', NestedObject)).toThrow(
            /"\/user\/tags" cannot be passed through url query params/,
        );
        const LegacyNested = a.discriminator('kind', {
            USER: a.object({ id: a.string(), data: a.object({}) }),
        });
        expect(() => rpc('legacyNested', 'get', LegacyNested)).toThrow(
            /"\/USER\/data" cannot be passed through url query params/,
        );
    });
    it('allows every union style on other methods', () => {
        expect(() => rpc('external', 'post', External)).not.toThrow();
        expect(() => rpc('adjacent', 'post', Adjacent)).not.toThrow();
        expect(() => stream('external', 'post', External)).not.toThrow();
        expect(() => stream('external', undefined, External)).not.toThrow();
    });
});

describe('object params on GET procedures', () => {
    function rpc(method: 'get' | 'post', params: any) {
        new ArriApp().rpc(
            'params',
            defineRpc({ method, params, response: undefined, handler() {} }),
        );
    }
    function stream(method: 'get' | 'post', params: any) {
        new ArriApp().rpc(
            'params',
            defineEventStreamRpc({
                method,
                params,
                response: a.object({ id: a.string() }),
                handler() {},
            }),
        );
    }

    it('allows strings, booleans, numbers, timestamps, and enums', () => {
        const Params = a.object({
            string: a.string(),
            boolean: a.boolean(),
            float64: a.float64(),
            int64: a.int64(),
            timestamp: a.timestamp(),
            enum: a.stringEnum(['A', 'B']),
            nullable: a.nullable(a.string()),
            optional: a.optional(a.int32()),
        });
        expect(() => rpc('get', Params)).not.toThrow();
        expect(() => stream('get', Params)).not.toThrow();
    });
    it.each([
        ['array', a.array(a.string())],
        ['object', a.object({ id: a.string() })],
        ['record', a.record(a.string())],
        ['any', a.any()],
        ['union', a.union({ id: a.string() })],
    ])('rejects %s fields', (_, field) => {
        const Params = a.object({ id: a.string(), field });
        expect(() => rpc('get', Params)).toThrow(
            /"\/field" cannot be passed through url query params/,
        );
        expect(() => stream('get', Params)).toThrow(
            /"\/field" cannot be passed through url query params/,
        );
        expect(() => rpc('post', Params)).not.toThrow();
    });
    it('rejects unsupported optional fields', () => {
        const Params = a.object({
            id: a.string(),
            tags: a.optional(a.array(a.string())),
        });
        expect(() => rpc('get', Params)).toThrow(
            /"\/tags" cannot be passed through url query params/,
        );
    });
});

describe('validator compilation failures', () => {
    const Params = a.object({ id: a.string() });
    let warn: MockInstance;
    beforeEach(() => {
        vi.resetModules();
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    async function setup() {
        const { getSchemaValidator } = await import('./rpc');
        const { a: schema } = await import('@arrirpc/schema');
        return { getSchemaValidator, compile: vi.spyOn(schema, 'compile') };
    }
    function errorNamed(name: string) {
        const err = new Error('compilation failed');
        err.name = name;
        return err;
    }

    it('only falls back for the failing rpc when the generated code is invalid', async () => {
        const { getSchemaValidator, compile } = await setup();
        compile.mockImplementationOnce(() => {
            throw new SyntaxError('Invalid left-hand side in assignment');
        });
        const failing = getSchemaValidator('failing', 'params', Params)!;
        expect(failing.parse({ id: '1' }).success).toBe(true);
        expect(failing.parse({ id: 1 }).success).toBe(false);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0]![0]).toContain('failing');
        expect(warn.mock.calls[0]![0]).toContain(
            'Invalid left-hand side in assignment',
        );

        getSchemaValidator('other', 'params', Params);
        expect(compile).toHaveBeenCalledTimes(2);
        expect(warn).toHaveBeenCalledTimes(1);
    });
    it('stops compiling and warns once when the runtime blocks code generation', async () => {
        const { getSchemaValidator, compile } = await setup();
        compile.mockImplementation(() => {
            throw new EvalError(
                'Code generation from strings disallowed for this context',
            );
        });
        const first = getSchemaValidator('first', 'params', Params)!;
        const second = getSchemaValidator('second', 'params', Params)!;
        const third = getSchemaValidator('third', 'response', Params)!;
        expect(compile).toHaveBeenCalledTimes(1);
        expect(warn).toHaveBeenCalledTimes(1);
        for (const validator of [first, second, third]) {
            expect(validator.parse({ id: '1' }).success).toBe(true);
            expect(validator.parse({ id: 1 }).success).toBe(false);
        }
    });
    it('detects blocked code generation by name since errors can come from another realm', async () => {
        const { getSchemaValidator, compile } = await setup();
        compile.mockImplementation(() => {
            throw errorNamed('EvalError');
        });
        getSchemaValidator('first', 'params', Params);
        getSchemaValidator('second', 'params', Params);
        expect(compile).toHaveBeenCalledTimes(1);
    });
    it('falls back for each rpc when a runtime blocks code generation with another error', async () => {
        const { getSchemaValidator, compile } = await setup();
        compile.mockImplementation(() => {
            throw new Error('Dynamic code evaluation is not allowed');
        });
        const validator = getSchemaValidator('first', 'params', Params)!;
        getSchemaValidator('second', 'params', Params);
        expect(validator.parse({ id: '1' }).success).toBe(true);
        expect(compile).toHaveBeenCalledTimes(2);
        expect(warn).toHaveBeenCalledTimes(2);
    });

    describe('disableValidatorCompilation', () => {
        const disabled = { disableValidatorCompilation: true };

        it('uses runtime validators without compiling', async () => {
            const { getSchemaValidator, compile } = await setup();
            const validator = getSchemaValidator(
                'first',
                'params',
                Params,
                disabled,
            )!;
            expect(compile).not.toHaveBeenCalled();
            expect(warn).not.toHaveBeenCalled();
            expect(validator.parse({ id: '1' }).success).toBe(true);
            expect(validator.parse({ id: 1 }).success).toBe(false);
            expect(validator.coerce({ id: '1' }).success).toBe(true);
            expect(validator.validate({ id: '1' })).toBe(true);
            expect(validator.serialize({ id: '1' }).success).toBe(true);
        });
        it('does not affect later procedures that have compilation enabled', async () => {
            const { getSchemaValidator, compile } = await setup();
            getSchemaValidator('first', 'params', Params, disabled);
            getSchemaValidator('second', 'params', Params);
            expect(compile).toHaveBeenCalledTimes(1);
        });
        it('takes priority over strictValidatorCompilation', async () => {
            const { getSchemaValidator, compile } = await setup();
            compile.mockImplementation(() => {
                throw new SyntaxError('Invalid left-hand side in assignment');
            });
            expect(() =>
                getSchemaValidator('first', 'params', Params, {
                    ...disabled,
                    strictValidatorCompilation: true,
                }),
            ).not.toThrow();
            expect(compile).not.toHaveBeenCalled();
        });
        it('is passed through from ArriApp', () => {
            const compile = vi.spyOn(a, 'compile');
            const app = new ArriApp({ disableValidatorCompilation: true });
            app.rpc(
                'first',
                defineRpc({
                    params: Params,
                    response: Params,
                    handler({ params }) {
                        return params;
                    },
                }),
            );
            app.rpc(
                'second',
                defineEventStreamRpc({
                    params: Params,
                    response: Params,
                    handler() {},
                }),
            );
            expect(compile).not.toHaveBeenCalled();
        });
    });

    describe('strictValidatorCompilation', () => {
        const strict = { strictValidatorCompilation: true };

        it('throws when compilation fails', async () => {
            const { getSchemaValidator, compile } = await setup();
            compile.mockImplementation(() => {
                throw new SyntaxError('Invalid left-hand side in assignment');
            });
            expect(() =>
                getSchemaValidator('failing', 'params', Params, strict),
            ).toThrow(/failing.*Invalid left-hand side in assignment/);
            expect(warn).not.toHaveBeenCalled();
        });
        it('does not throw when the runtime blocks code generation', async () => {
            const { getSchemaValidator, compile } = await setup();
            compile.mockImplementation(() => {
                throw new EvalError(
                    'Code generation from strings disallowed for this context',
                );
            });
            const validator = getSchemaValidator(
                'first',
                'params',
                Params,
                strict,
            )!;
            expect(validator.parse({ id: '1' }).success).toBe(true);
            expect(warn).toHaveBeenCalledTimes(1);
        });
        it('is passed through from ArriApp', () => {
            vi.spyOn(a, 'compile').mockImplementation(() => {
                throw new SyntaxError('Invalid left-hand side in assignment');
            });
            const rpc = defineRpc({
                params: Params,
                response: undefined,
                handler() {},
            });
            expect(() =>
                new ArriApp({ strictValidatorCompilation: true }).rpc(
                    'failing',
                    rpc,
                ),
            ).toThrow(/failing/);
            expect(() =>
                new ArriApp({ strictValidatorCompilation: true }).rpc(
                    'failing',
                    defineEventStreamRpc({
                        params: Params,
                        response: Params,
                        handler() {},
                    }),
                ),
            ).toThrow(/failing/);
            expect(() => new ArriApp().rpc('failing', rpc)).not.toThrow();
        });
    });
});
