import { ArriHeaders, ServerMessage } from '@arrirpc/core';
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
        serverMessages.push(msg);
    });
    app.use(transport);

    const serverMessages: ServerMessage[] = [];
    transport.receive({
        type: 'INVOCATION',
        rpcName: 'users.getUser',
        contentType: 'application/json',
        reqId: '1',
        headers: new ArriHeaders(),
        body: jsonEncode({ userId: 'user:1' } satisfies UserRef),
    });
    transport.receive({
        type: 'INVOCATION',
        rpcName: 'users.setUser',
        contentType: 'application/json',
        reqId: '2',
        headers: new ArriHeaders(),
        body: jsonEncode({
            id: 'user:1',
            name: 'John Doe',
            email: null,
        } satisfies User),
    });
    transport.receive({
        type: 'INVOCATION',
        rpcName: 'users.getUser',
        reqId: '3',
        headers: new ArriHeaders(),
        body: jsonEncode({ userId: 'user:1' } satisfies UserRef),
    });
    await waitFor(20);
    expect(serverMessages.length).toBe(3);
    expect(serverMessages).toStrictEqual([
        {
            type: 'ERROR',
            reqId: '1',
            headers: new ArriHeaders(),
            contentType: 'application/json',
            body: jsonEncode({
                code: 'NOT_FOUND',
                message: 'NOT_FOUND',
                data: undefined,
            }),
        },
        {
            type: 'OK',
            reqId: '2',
            headers: new ArriHeaders(),
            contentType: 'application/json',
            body: jsonEncode({
                id: 'user:1',
                name: 'John Doe',
                email: null,
            } satisfies User),
        },
        {
            type: 'OK',
            reqId: '3',
            headers: new ArriHeaders(),
            contentType: 'application/json',
            body: jsonEncode({
                id: 'user:1',
                name: 'John Doe',
                email: null,
            } satisfies User),
        },
    ] satisfies ServerMessage[]);
});

function waitFor(ms: number) {
    return new Promise((res, _) => {
        setTimeout(() => res(undefined), ms);
    });
}
