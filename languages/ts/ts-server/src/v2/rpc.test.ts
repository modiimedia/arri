import { ArriHeaders } from '@arrirpc/core';
import { a } from '@arrirpc/schema';
import { assertType, describe, test } from 'vitest';

import { RpcCall } from './context';
import {
    defineDuplexStreamRpc,
    defineInStreamRpc,
    defineOutStreamRpc,
    defineRpc,
} from './rpc';
import { InputStream } from './stream';

function callFactory(): RpcCall {
    return {
        rpcName: '',
        transport: '',
        headers: new ArriHeaders(),
        signal: new AbortController().signal,
        meta: {},
        contentType: '',
        accept: undefined,
    };
}

describe('input and output type inference', () => {
    test('unary rpcs', () => {
        const _withArgs = defineRpc({
            input: a.object({ message: a.string() }),
            output: a.object({ id: a.string(), date: a.timestamp() }),
            handler(input, _) {
                assertType<string>(input.message);
                return {
                    id: '',
                    date: new Date(),
                };
            },
        });
        type WithArgsResponse = Awaited<ReturnType<typeof _withArgs.handler>>;
        assertType<WithArgsResponse>({ id: '', date: new Date() });
        const _withoutArgs = defineRpc({
            input: undefined,
            output: undefined,
            handler(input, _) {
                assertType<unknown>(input);
            },
        });
        type WithoutArgsResponse = Awaited<
            ReturnType<typeof _withoutArgs.handler>
        >;
        assertType<WithoutArgsResponse>(undefined);
    });

    test('in stream rpcs', () => {
        const _withArgs = defineInStreamRpc({
            input: a.object({ message: a.string() }),
            output: a.object({ id: a.string(), date: a.timestamp() }),
            async handler(input, _) {
                for await (const item of input) {
                    assertType<string>(item.message);
                }
                return {
                    id: '',
                    date: new Date(),
                };
            },
        });
        type WithArgsResponse = Awaited<ReturnType<typeof _withArgs.handler>>;
        assertType<WithArgsResponse>({ id: '', date: new Date() });
        const _withoutArgs = defineInStreamRpc({
            input: undefined,
            output: undefined,
            async handler(input, _) {
                for await (const item of input) {
                    assertType<unknown>(item);
                }
            },
        });
        type WithoutArgsResponse = Awaited<
            ReturnType<typeof _withoutArgs.handler>
        >;
        assertType<WithoutArgsResponse>(undefined);
    });

    test('out stream rpcs', async () => {
        const _withArgs = defineOutStreamRpc({
            input: a.object({ message: a.string() }),
            output: a.object({ id: a.string(), date: a.timestamp() }),
            async *handler(input, _) {
                assertType<string>(input.message);
                for (let i = 0; i < 100; i++) {
                    yield { id: '', date: new Date() };
                }
            },
        });
        const withArgsGenerator = _withArgs.handler(
            { message: 'foo' },
            callFactory(),
        );
        for await (const item of withArgsGenerator) {
            assertType<{ id: string; date: Date }>(item);
        }
        const _withoutArgs = defineOutStreamRpc({
            input: undefined,
            output: undefined,
            *handler(input, _) {
                assertType<unknown>(input);
                for (let i = 0; i < 100; i++) {
                    yield undefined;
                }
            },
        });
        const withoutArgsGenerator = _withoutArgs.handler(
            undefined,
            callFactory(),
        );
        for await (const item of withoutArgsGenerator) {
            assertType<unknown>(item);
        }
    });
    test('duplex stream rpcs', async () => {
        const _withArgs = defineDuplexStreamRpc({
            input: a.object({ message: a.string() }),
            output: a.object({ id: a.string(), date: a.timestamp() }),
            handler(input, _) {
                (async () => {
                    for await (const msg of input) {
                        assertType<string>(msg.message);
                    }
                })();
                const stream = new InputStream<{ id: string; date: Date }>();
                stream.push({ id: '', date: new Date() });
                return stream;
            },
        });
    });
});
