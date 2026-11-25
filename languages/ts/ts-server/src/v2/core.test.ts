import { ArriHeaders, Message, ServerMessage } from '@arrirpc/core';
import { a } from '@arrirpc/schema';

import { ArriApp } from './core';
import { defineError } from './errors';
import { defineRpc } from './rpc';
import { TestAdapter } from './transport';

const textEncoder = new TextEncoder();
const jsonEncode = (input: Record<string, any>) =>
    textEncoder.encode(JSON.stringify(input));

class SimulatedAsyncStore<T> {
    private store = new Map<string, T>();
    private asyncDurationMs: number;
    constructor(asyncDurationMs?: number) {
        this.asyncDurationMs = asyncDurationMs ?? 1;
    }

    get(id: string): Promise<T | undefined> {
        return new Promise((res, _) => {
            setTimeout(() => res(this.store.get(id)), this.asyncDurationMs);
        });
    }
    set(id: string, value: T): Promise<T> {
        return new Promise((res, _) => {
            setTimeout(() => {
                this.store.set(id, value);
                res(value);
            }, this.asyncDurationMs);
        });
    }
    delete(id: string): Promise<boolean> {
        return new Promise((res, _) => {
            setTimeout(() => res(this.store.delete(id)), this.asyncDurationMs);
        });
    }
}

class ReqResponseStore {
    private connectionMessages: ServerMessage[] = [];
    private messages: Map<string, ServerMessage[]> = new Map();
    get length(): number {
        let len = 0;
        for (const val of this.messages.values()) {
            len += val.length;
        }
        return len;
    }
    push(msg: ServerMessage) {
        const id = reqId(msg);
        if (!id) {
            this.connectionMessages.push(msg);
            return;
        }
        const items = this.messages.get(id) ?? [];
        items.push(msg);
        this.messages.set(id, items);
    }
    get(reqId: string | undefined) {
        if (!reqId) {
            return this.connectionMessages;
        }
        return this.messages.get(reqId);
    }

    waitForResponse(
        reqId: string,
        expectedMessageTypes: ServerMessage['type'][] = [
            'OK',
            'STREAM_END',
            'ERROR',
        ],
        timeoutMs = 10_000,
    ) {
        const startTime = new Date().getTime();
        const wait = (
            res: (_: unknown) => void,
            rej: (err: unknown) => void,
        ) => {
            const now = new Date().getTime();
            if (now - startTime > timeoutMs) {
                return rej('timeout exceeded');
            }
            const items = this.messages.get(reqId);
            if (typeof items !== 'undefined' && items.length > 0) {
                for (const item of items) {
                    if (expectedMessageTypes.includes(item.type)) {
                        return res(undefined);
                    }
                }
            }
            setTimeout(() => {
                return wait(res, rej);
            }, 1);
        };
        return new Promise((res, rej) => {
            return wait(res, rej);
        });
    }

    async waitForResponses(
        reqIds: string[],
        expectedMessageTypes: ServerMessage['type'][] = [
            'OK',
            'STREAM_END',
            'ERROR',
        ],
        timeoutMs = 10_000,
    ) {
        await Promise.all(
            reqIds.map((reqId) =>
                this.waitForResponse(reqId, expectedMessageTypes, timeoutMs),
            ),
        );
    }
}

function reqId(msg: Message): string | undefined {
    switch (msg.type) {
        case 'HEARTBEAT':
        case 'CONNECTION_START':
        case 'GOAWAY':
            return undefined;
        case 'CANCEL':
        case 'ERROR':
        case 'INVOCATION':
        case 'OK':
        case 'STREAM_DATA':
        case 'STREAM_END':
        case 'STREAM_START':
            return msg.reqId;
        default:
            msg satisfies never;
            return undefined;
    }
}

test('simulate transport send/receive', async () => {
    const app = new ArriApp();

    const User = a.object({
        id: a.string(),
        name: a.string(),
        email: a.nullable(a.string()),
    });
    type User = a.infer<typeof User>;

    const UserRef = a.object({ userId: a.string() });
    type UserRef = a.infer<typeof UserRef>;

    const users = new SimulatedAsyncStore<User>();
    const messages = new ReqResponseStore();

    app.rpc(
        'users.getUser',
        defineRpc({
            input: UserRef,
            output: User,
            async handler(input, _) {
                const user = await users.get(input.userId);
                if (!user) throw defineError('NOT_FOUND');
                return user;
            },
        }),
    );

    app.rpc(
        'users.setUser',
        defineRpc({
            input: User,
            output: User,
            async handler(input, _) {
                return users.set(input.id, input);
            },
        }),
    );

    app.rpc(
        'users.deleteUser',
        defineRpc({
            input: UserRef,
            output: undefined,
            async handler(input, _) {
                await users.delete(input.userId);
            },
        }),
    );

    const transport = new TestAdapter((msg) => {
        messages.push(msg);
    });
    app.use(transport);

    transport.receive({
        type: 'INVOCATION',
        rpcName: 'users.getUser',
        contentType: 'application/json',
        reqId: 'get_user_1',
        headers: new ArriHeaders(),
        body: jsonEncode({ userId: 'user:1' } satisfies UserRef),
    });
    await messages.waitForResponse('get_user_1');
    transport.receive({
        type: 'INVOCATION',
        rpcName: 'users.deleteUser',
        contentType: 'application/json',
        reqId: 'delete_user_1',
        headers: new ArriHeaders(),
        body: jsonEncode({ userId: 'user:1' } satisfies UserRef),
    });
    await messages.waitForResponse('delete_user_1');
    transport.receive({
        type: 'INVOCATION',
        rpcName: 'users.setUser',
        contentType: 'application/json',
        reqId: 'set_user_1',
        headers: new ArriHeaders(),
        body: jsonEncode({
            id: 'user:1',
            name: 'John Doe',
            email: null,
        } satisfies User),
    });
    await messages.waitForResponse('set_user_1');
    transport.receive({
        type: 'INVOCATION',
        rpcName: 'users.getUser',
        reqId: 'get_user_2',
        headers: new ArriHeaders(),
        body: jsonEncode({ userId: 'user:1' } satisfies UserRef),
    });
    await messages.waitForResponse('get_user_2');
    transport.receive({
        type: 'INVOCATION',
        rpcName: 'users.deleteUser',
        reqId: 'delete_user_2',
        headers: new ArriHeaders(),
        body: jsonEncode({ userId: 'user:1' } satisfies UserRef),
    });
    await messages.waitForResponse('delete_user_2');
    transport.receive({
        type: 'INVOCATION',
        rpcName: 'users.getUser',
        reqId: 'get_user_3',
        headers: new ArriHeaders(),
        body: jsonEncode({ userId: 'user:1' } satisfies UserRef),
    });
    await messages.waitForResponse('get_user_3');
    expect(messages.length).toBe(6);
    expect(messages.get('get_user_1')).toStrictEqual([
        {
            type: 'ERROR',
            reqId: 'get_user_1',
            headers: new ArriHeaders(),
            contentType: 'application/json',
            body: jsonEncode({
                code: 'NOT_FOUND',
                message: 'NOT_FOUND',
                data: undefined,
            }),
        },
    ] satisfies ServerMessage[]);
    expect(messages.get('delete_user_1')).toStrictEqual([
        {
            type: 'OK',
            reqId: 'delete_user_1',
            headers: new ArriHeaders(),
            contentType: 'application/json',
            body: new Uint8Array(),
        },
    ] satisfies ServerMessage[]);
    expect(messages.get('set_user_1')).toStrictEqual([
        {
            type: 'OK',
            reqId: 'set_user_1',
            headers: new ArriHeaders(),
            contentType: 'application/json',
            body: jsonEncode({
                id: 'user:1',
                name: 'John Doe',
                email: null,
            } satisfies User),
        },
    ] satisfies ServerMessage[]);
    expect(messages.get('get_user_2')).toStrictEqual([
        {
            type: 'OK',
            reqId: 'get_user_2',
            headers: new ArriHeaders(),
            contentType: 'application/json',
            body: jsonEncode({
                id: 'user:1',
                name: 'John Doe',
                email: null,
            } satisfies User),
        },
    ] satisfies ServerMessage[]);
    expect(messages.get('get_user_3')).toStrictEqual([
        {
            type: 'ERROR',
            reqId: 'get_user_3',
            headers: new ArriHeaders(),
            contentType: 'application/json',
            body: jsonEncode({
                code: 'NOT_FOUND',
                message: 'NOT_FOUND',
                data: undefined,
            }),
        },
    ] satisfies ServerMessage[]);
});
