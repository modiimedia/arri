import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import {
    ArriHeaders,
    type ClientMessage,
    encodeMessage,
    parseServerMessage,
    type ServerMessage,
} from '@arrirpc/core';

import { AsyncQueue } from './async-queue';
import { ArriServerCore } from './core';
import { createHttpHandler } from './http';
import { connectMessageTransport } from './message-transport';
import {
    defineBidirectional,
    defineInputStream,
    defineOutputStream,
    defineUnary,
    jsonCodec,
    RpcError,
} from './procedures';

const utf8 = (value: unknown) =>
    new TextEncoder().encode(JSON.stringify(value));
const fromUtf8 = (bytes: Uint8Array | undefined) =>
    JSON.parse(new TextDecoder().decode(bytes));

let cancelledReason: unknown;

function createTestCore() {
    return new ArriServerCore()
        .register(
            'math.add',
            defineUnary({
                input: jsonCodec<{ a: number; b: number }>(),
                output: jsonCodec<{ sum: number }>(),
                handler: ({ a, b }) => ({ sum: a + b }),
            }),
        )
        .register(
            'users.getUser',
            defineUnary({
                input: jsonCodec<{ id: string }>(),
                output: jsonCodec<{ id: string }>(),
                handler: ({ id }) => {
                    throw new RpcError('NOT_FOUND', 'User not found', {
                        type: 'USER_NOT_FOUND',
                        data: { id },
                    });
                },
            }),
        )
        .register(
            'counter.count',
            defineOutputStream({
                input: jsonCodec<{ to: number }>(),
                output: jsonCodec<{ n: number }>(),
                handler: async ({ to }, output) => {
                    for (let n = 1; n <= to; n++) {
                        await output.send({ n }, { msgId: String(n) });
                    }
                },
            }),
        )
        .register(
            'math.sum',
            defineInputStream({
                input: jsonCodec<number>(),
                output: jsonCodec<{ sum: number }>(),
                handler: async (inputs) => {
                    let sum = 0;
                    for await (const value of inputs) sum += value;
                    return { sum };
                },
            }),
        )
        .register(
            'chat.echo',
            defineBidirectional({
                input: jsonCodec<string>(),
                output: jsonCodec<string>(),
                handler: async (inputs, output) => {
                    for await (const value of inputs) {
                        await output.send(`echo: ${value}`);
                    }
                },
            }),
        )
        .register(
            'slow.waitForever',
            defineUnary({
                input: jsonCodec<null>(),
                output: jsonCodec<null>(),
                handler: (_, { signal }) =>
                    new Promise((resolve) => {
                        signal.addEventListener('abort', () => {
                            cancelledReason = signal.reason;
                            resolve(null);
                        });
                    }),
            }),
        );
}

function connectTestClient(core: ArriServerCore) {
    const received = new AsyncQueue<ServerMessage>();
    const iterator = received[Symbol.asyncIterator]();
    const transport = connectMessageTransport(core, {
        info: { name: 'test' },
        sendBytes: (bytes) => {
            const result = parseServerMessage(bytes);
            if (!result.ok) throw new Error(result.error.message);
            received.push(result.value);
        },
        close: () => received.end(),
    });
    return {
        send: (msg: ClientMessage) =>
            transport.receiveBytes(encodeMessage(msg)),
        sendRaw: (raw: string) =>
            transport.receiveBytes(new TextEncoder().encode(raw)),
        next: async () => (await iterator.next()).value as ServerMessage,
        closed: () => transport.closed(),
    };
}

async function connect(core = createTestCore()) {
    const client = connectTestClient(core);
    expect((await client.next()).type).toBe('CONNECTION_START');
    return client;
}

function invocation(
    rpcName: string,
    reqId: string,
    input?: unknown,
): ClientMessage {
    return {
        type: 'INVOCATION',
        rpcName,
        reqId,
        headers: new ArriHeaders(),
        body: input === undefined ? undefined : utf8(input),
    };
}

describe('message transport', () => {
    test('unary', async () => {
        const client = await connect();
        client.send(invocation('math.add', '1', { a: 1, b: 2 }));
        const msg = await client.next();
        expect(msg.type).toBe('OK');
        if (msg.type !== 'OK') return;
        expect(msg.reqId).toBe('1');
        expect(fromUtf8(msg.body)).toStrictEqual({ sum: 3 });
    });

    test('typed errors', async () => {
        const client = await connect();
        client.send(invocation('users.getUser', '1', { id: '12' }));
        const msg = await client.next();
        expect(msg.type).toBe('ERROR');
        if (msg.type !== 'ERROR') return;
        expect(fromUtf8(msg.body)).toStrictEqual({
            code: 'NOT_FOUND',
            message: 'User not found',
            type: 'USER_NOT_FOUND',
            data: { id: '12' },
        });
    });

    test('unknown procedure', async () => {
        const client = await connect();
        client.send(invocation('foo.bar', '1', {}));
        const msg = await client.next();
        expect(msg.type === 'ERROR' && fromUtf8(msg.body).code).toBe(
            'PROCEDURE_NOT_FOUND',
        );
    });

    test('output stream', async () => {
        const client = await connect();
        client.send(invocation('counter.count', '1', { to: 2 }));
        const types: string[] = [];
        const items: unknown[] = [];
        for (;;) {
            const msg = await client.next();
            types.push(msg.type);
            if (msg.type === 'STREAM_DATA') items.push(fromUtf8(msg.body));
            if (msg.type === 'STREAM_END') break;
        }
        expect(types).toStrictEqual([
            'STREAM_START',
            'STREAM_DATA',
            'STREAM_DATA',
            'STREAM_END',
        ]);
        expect(items).toStrictEqual([{ n: 1 }, { n: 2 }]);
    });

    test('input stream', async () => {
        const client = await connect();
        client.send(invocation('math.sum', '1'));
        client.send({
            type: 'STREAM_START',
            reqId: '1',
            headers: new ArriHeaders(),
        });
        for (const value of [1, 2, 3]) {
            client.send({ type: 'STREAM_DATA', reqId: '1', body: utf8(value) });
        }
        client.send({ type: 'STREAM_END', reqId: '1' });
        const msg = await client.next();
        expect(msg.type).toBe('OK');
        if (msg.type !== 'OK') return;
        expect(fromUtf8(msg.body)).toStrictEqual({ sum: 6 });
    });

    test('bidirectional stream interleaved with a unary call', async () => {
        const client = await connect();
        client.send(invocation('chat.echo', 'chat'));
        client.send({
            type: 'STREAM_START',
            reqId: 'chat',
            headers: new ArriHeaders(),
        });
        client.send({ type: 'STREAM_DATA', reqId: 'chat', body: utf8('hi') });
        expect((await client.next()).type).toBe('STREAM_START');
        const echo = await client.next();
        expect(echo.type === 'STREAM_DATA' && fromUtf8(echo.body)).toBe(
            'echo: hi',
        );

        client.send(invocation('math.add', 'add', { a: 2, b: 2 }));
        const sum = await client.next();
        expect(sum.type === 'OK' && sum.reqId).toBe('add');

        client.send({ type: 'STREAM_END', reqId: 'chat' });
        const end = await client.next();
        expect(end.type === 'STREAM_END' && end.reqId).toBe('chat');
    });

    test('STREAM_DATA before STREAM_START is a protocol error', async () => {
        const client = await connect();
        client.send(invocation('math.sum', '1'));
        client.send({ type: 'STREAM_DATA', reqId: '1', body: utf8(1) });
        const msg = await client.next();
        expect(msg.type === 'ERROR' && fromUtf8(msg.body).code).toBe(
            'PROTOCOL_ERROR',
        );
    });

    test('duplicate req-id', async () => {
        const client = await connect();
        client.send(invocation('slow.waitForever', '1', null));
        client.send(invocation('math.add', '1', { a: 1, b: 1 }));
        const msg = await client.next();
        expect(msg.type === 'ERROR' && fromUtf8(msg.body).code).toBe(
            'PROTOCOL_ERROR',
        );
        client.closed();
    });

    test('CANCEL aborts the handler without a response', async () => {
        const client = await connect();
        cancelledReason = undefined;
        client.send(invocation('slow.waitForever', '1', null));
        client.send({ type: 'CANCEL', reqId: '1' });
        await vi.waitFor(() => expect(cancelledReason).toBeDefined());
        expect((cancelledReason as RpcError).code).toBe('CANCELLED');
        client.send(invocation('math.add', '2', { a: 1, b: 1 }));
        const next = await client.next();
        expect(next.type === 'OK' && next.reqId).toBe('2');
    });

    test('closing the connection aborts every call', async () => {
        const client = await connect();
        cancelledReason = undefined;
        client.send(invocation('slow.waitForever', '1', null));
        client.closed();
        await vi.waitFor(() => expect(cancelledReason).toBeDefined());
        expect((cancelledReason as RpcError).code).toBe('CONNECTION_ERROR');
    });

    test('unparseable message reports an error for the recovered req-id', async () => {
        const client = await connect();
        client.sendRaw('ARRIRPC/0 NOPE\nreq-id: 7\n\n');
        const msg = await client.next();
        expect(msg.type === 'ERROR' && msg.reqId).toBe('7');
    });

    test('shutdown sends GOAWAY and waits for in-flight calls', async () => {
        const core = createTestCore();
        const client = await connect(core);
        client.send(invocation('chat.echo', '1'));
        client.send({
            type: 'STREAM_START',
            reqId: '1',
            headers: new ArriHeaders(),
        });
        const shutdown = core.shutdown();
        expect((await client.next()).type).toBe('GOAWAY');
        client.send(invocation('math.add', '2', { a: 1, b: 1 }));
        const rejected = await client.next();
        expect(rejected.type === 'ERROR' && fromUtf8(rejected.body).code).toBe(
            'UNAVAILABLE',
        );
        client.send({ type: 'STREAM_END', reqId: '1' });
        expect((await client.next()).type).toBe('STREAM_START');
        expect((await client.next()).type).toBe('STREAM_END');
        await shutdown;
    });
});

describe('http', () => {
    let server: Server;
    let baseUrl: string;

    beforeAll(async () => {
        server = createServer(createHttpHandler(createTestCore()));
        await new Promise<void>((resolve) => server.listen(0, resolve));
        baseUrl = `http://localhost:${(server.address() as AddressInfo).port}`;
    });

    afterAll(() => {
        server.close();
    });

    test('unary', async () => {
        const response = await fetch(`${baseUrl}/math/add`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ a: 1, b: 2 }),
        });
        expect(response.status).toBe(200);
        expect(await response.json()).toStrictEqual({ sum: 3 });
    });

    test('errors map to HTTP status codes', async () => {
        const response = await fetch(`${baseUrl}/users/get-user`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ id: '12' }),
        });
        expect(response.status).toBe(404);
        expect((await response.json()).type).toBe('USER_NOT_FOUND');
    });

    test('output stream as SSE', async () => {
        const response = await fetch(`${baseUrl}/counter/count`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                accept: 'text/event-stream',
            },
            body: JSON.stringify({ to: 2 }),
        });
        expect(response.headers.get('content-type')).toBe('text/event-stream');
        expect(await response.text()).toBe(
            'id: 1\ndata: {"n":1}\n\n' +
                'id: 2\ndata: {"n":2}\n\n' +
                'event: STREAM_END\ndata: \n\n',
        );
    });

    test('input streams are not implemented yet', async () => {
        const response = await fetch(`${baseUrl}/math/sum`, { method: 'POST' });
        expect(response.status).toBe(501);
    });
});
