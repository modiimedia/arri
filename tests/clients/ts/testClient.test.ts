import { ArriErrorInstance } from '@arrirpc/client';
import { randomUUID } from 'crypto';
import { FetchError, ofetch } from 'ofetch';
import { describe, expect, test } from 'vitest';

import {
    type ObjectWithEveryNullableType,
    type ObjectWithEveryOptionalType,
    type ObjectWithEveryType,
    ObjectWithPascalCaseKeys,
    ObjectWithSnakeCaseKeys,
    type RecursiveObject,
    type RecursiveUnion,
    TestClient,
} from './testClient.g';

const baseUrl = 'http://127.0.0.1:2020';
const wsConnectionUrl = baseUrl + '/ws';
const headers = {
    'x-test-header': 'test',
};

const client = new TestClient({
    baseUrl,
    wsConnectionUrl,
    headers,
});

test('route request', async () => {
    const result = await ofetch('/routes/hello-world', {
        method: 'post',
        baseURL: baseUrl,
        headers,
        body: {
            name: 'John Doe',
        },
    });
    expect(result).toBe('hello world');
});

test('route request (unauthorized)', async () => {
    try {
        await ofetch('/routes/hello-world', {
            method: 'post',
            baseURL: baseUrl,
        });
    } catch (err) {
        expect(err instanceof ArriErrorInstance);
        if (err instanceof ArriErrorInstance) {
            expect(err.code).toBe(401);
        }
    }
});

test('can handle RPCs with no params', async () => {
    const result = await client.tests.emptyParamsGetRequest();
    const result2 = await client.tests.emptyParamsPostRequest();
    expect(typeof result.message).toBe('string');
    expect(typeof result2.message).toBe('string');
});
test('can handle RPCs with no response', async () => {
    await client.tests.emptyResponseGetRequest({ message: 'ok' });
    await client.tests.emptyResponsePostRequest({ message: 'ok' });
});
const input: ObjectWithEveryType = {
    any: {
        blah: 'blah',
        blah2: 'blah2',
        blah3: true,
    },
    boolean: true,
    string: 'hello world',
    timestamp: new Date(),
    float32: 0,
    float64: 0,
    int8: 0,
    uint8: 0,
    int16: 0,
    uint16: 0,
    int32: 0,
    uint32: 0,
    int64: 0n,
    uint64: 0n,
    enumerator: 'B',
    array: [true, false, false],
    object: {
        string: '',
        boolean: false,
        timestamp: new Date(),
    },
    record: {
        A: BigInt('1'),
        B: BigInt('0'),
        '"C"\t': BigInt('4'),
    },
    discriminator: {
        type: 'B',
        title: 'Hello World',
        description: '',
    },
    nestedObject: {
        id: '',
        timestamp: new Date(),
        data: {
            id: '',
            timestamp: new Date(),
            data: {
                id: '',
                timestamp: new Date(),
            },
        },
    },
    nestedArray: [
        [
            { id: '', timestamp: new Date() },
            { id: '', timestamp: new Date() },
        ],
    ],
};
test('can send/receive object every field type', async () => {
    const result = await client.tests.sendObject(input);
    expect(result).toStrictEqual(input);
});
test('can send/receive object with transformed keys', async () => {
    const snakeCasePayload: ObjectWithSnakeCaseKeys = {
        createdAt: new Date(),
        displayName: 'john doe',
        emailAddress: 'johndoe@gmail.com',
        phoneNumber: null,
        isAdmin: false,
    };
    const snakeCaseResult =
        await client.tests.sendObjectWithSnakeCaseKeys(snakeCasePayload);
    expect(snakeCaseResult).toStrictEqual(snakeCasePayload);
    const pascalCasePayload: ObjectWithPascalCaseKeys = {
        createdAt: new Date(),
        emailAddress: undefined,
        isAdmin: undefined,
        displayName: 'john doe',
        phoneNumber: '2112112111',
    };
    const pascalCaseResult =
        await client.tests.sendObjectWithPascalCaseKeys(pascalCasePayload);
    expect(pascalCaseResult).toStrictEqual(pascalCasePayload);
});
test('returns error if sending nothing when RPC expects body', async () => {
    try {
        await ofetch(`${baseUrl}/rpcs/tests/send-object`, {
            method: 'post',
            headers,
        });
        // should never reach this
        expect(false).toBe(true);
    } catch (err) {
        expect(err instanceof FetchError).toBe(true);
        if (err instanceof FetchError) {
            expect(err.statusCode).toBe(400);
            expect(err.data?.code).toBe(400);
            expect(
                typeof err.data.message === 'string' &&
                    err.data.message.length > 0,
            ).toBe(true);
        }
    }
});
test('unauthenticated RPC request returns a 401 error', async () => {
    let firedOnErr = false;
    const unauthenticatedClient = new TestClient({
        baseUrl,
        wsConnectionUrl: baseUrl + '/create-connection',
        onError(_) {
            firedOnErr = true;
        },
    });
    try {
        await unauthenticatedClient.tests.sendObject(input);
        expect(true).toBe(false);
    } catch (err) {
        expect(err instanceof ArriErrorInstance);
        if (err instanceof ArriErrorInstance) {
            expect(err.code).toBe(401);
        }
    }
    expect(firedOnErr).toBe(true);
});
test('can use async functions for headers', async () => {
    const _client = new TestClient({
        baseUrl: baseUrl,
        wsConnectionUrl,
        async headers() {
            await new Promise((res) => {
                setTimeout(() => {
                    res(true);
                }, 1000);
            });
            return headers;
        },
    });
    const result = await _client.tests.emptyParamsGetRequest();
    expect(typeof result.message).toBe('string');
});
test('can send/receive partial objects', async () => {
    const fullObjectResult = await client.tests.sendPartialObject(input);
    expect(fullObjectResult).toStrictEqual(input);
    const partialInput: ObjectWithEveryOptionalType = {
        string: '',
        boolean: undefined,
        timestamp: undefined,
        float32: undefined,
        float64: undefined,
        int8: undefined,
        uint8: undefined,
        int16: 0,
        uint16: undefined,
        int32: undefined,
        uint32: undefined,
        int64: 0n,
        uint64: undefined,
        enumerator: undefined,
        array: undefined,
        object: undefined,
        record: undefined,
        discriminator: undefined,
        nestedObject: undefined,
        nestedArray: undefined,
        any: undefined,
    };
    const partialObjectResult =
        await client.tests.sendPartialObject(partialInput);
    expect(partialObjectResult).toStrictEqual(partialInput);
});
test('can send/receive object with nullable fields', async () => {
    const fullObjectResult =
        await client.tests.sendObjectWithNullableFields(input);
    expect(fullObjectResult).toStrictEqual(input);
    const nullableInput: ObjectWithEveryNullableType = {
        any: null,
        boolean: null,
        string: null,
        timestamp: null,
        float32: null,
        float64: null,
        int8: null,
        uint8: null,
        int16: null,
        uint16: null,
        int32: null,
        uint32: null,
        int64: null,
        uint64: null,
        enumerator: null,
        array: null,
        object: null,
        record: null,
        discriminator: null,
        nestedObject: {
            id: null,
            timestamp: null,
            data: {
                id: null,
                timestamp: null,
                data: null,
            },
        },
        nestedArray: [null],
    };
    const nullableResult =
        await client.tests.sendObjectWithNullableFields(nullableInput);
    expect(nullableResult).toStrictEqual(nullableInput);
});

test('can send/receive recursive objects', async () => {
    const payload: RecursiveObject = {
        left: {
            left: {
                left: null,
                right: null,
                value: 'depth3',
            },
            right: {
                left: null,
                right: {
                    left: null,
                    right: null,
                    value: 'depth4',
                },
                value: 'depth3',
            },
            value: 'depth2',
        },
        right: null,
        value: 'depth1',
    };
    const result = await client.tests.sendRecursiveObject(payload);
    expect(result).toStrictEqual(payload);
});

test('can send/receive recursive unions', async () => {
    const payload: RecursiveUnion = {
        type: 'CHILDREN',
        data: [
            {
                type: 'CHILD',
                data: {
                    type: 'TEXT',
                    data: 'Hello world',
                },
            },
            {
                type: 'SHAPE',
                data: {
                    width: 1,
                    height: 2,
                    color: 'blue',
                },
            },
            {
                type: 'CHILDREN',
                data: [
                    {
                        type: 'TEXT',
                        data: 'Hello world',
                    },
                ],
            },
        ],
    };
    const result = await client.tests.sendRecursiveUnion(payload);
    expect(result).toStrictEqual(payload);
});

test('onError hook fires properly', async () => {
    let onErrorFired = false;
    const customClient = new TestClient({
        baseUrl,
        wsConnectionUrl,
        onError(err) {
            onErrorFired = true;
            expect(err instanceof ArriErrorInstance).toBe(true);
        },
    });
    try {
        await customClient.tests.sendObject(input);
    } catch (_) {
        // do nothing
    }
    expect(onErrorFired).toBe(true);
});

test('[EVENT_STREAM_RPC] supports event streams', async () => {
    let wasConnected = false;
    let receivedMessageCount = 0;
    await new Promise((res, rej) => {
        setTimeout(() => rej(), 2000);
        const controller = client.tests.streamMessages(
            { channelId: '1' },
            {
                onMessage(msg) {
                    receivedMessageCount++;
                    expect(msg.channelId).toBe('1');
                    switch (msg.messageType) {
                        case 'IMAGE':
                            expect(msg.date instanceof Date).toBe(true);
                            expect(typeof msg.image).toBe('string');
                            break;
                        case 'TEXT':
                            expect(msg.date instanceof Date).toBe(true);
                            expect(typeof msg.text).toBe('string');
                            break;
                        case 'URL':
                            expect(msg.date instanceof Date).toBe(true);
                            expect(typeof msg.url).toBe('string');
                            break;
                    }
                    if (receivedMessageCount >= 12) controller.abort();
                },
                onOpen() {
                    wasConnected = true;
                },
            },
        );
        controller.onAbort(() => res(undefined));
    });
    expect(receivedMessageCount > 0).toBe(true);
    expect(wasConnected).toBe(true);
});

test("[EVENT_STREAM_RPC] closes connection when receiving 'done' event", async () => {
    let timesConnected = 0;
    let messageCount = 0;
    let errorReceived: unknown | undefined;
    await new Promise((res, rej) => {
        setTimeout(() => rej(), 2000);
        const controller = client.tests.streamTenEventsThenEnd({
            onMessage(_) {
                messageCount++;
            },
            onError(error) {
                errorReceived = error;
            },
            onOpen() {
                timesConnected++;
            },
        });
        controller.onAbort(() => res(undefined));
    });
    expect(errorReceived).toBe(undefined);
    expect(timesConnected).toBe(1);
    expect(messageCount).toBe(10);
});

test('[EVENT_STREAM_RPC] auto-reconnects when connection is closed by server', async () => {
    let resCount = 0;
    let errorCount = 0;
    let messageCount = 0;
    await new Promise((res, rej) => {
        setTimeout(() => rej(), 2000);
        const controller = client.tests.streamAutoReconnect(
            {
                messageCount: 10,
            },
            {
                onOpen() {
                    resCount++;
                },
                onMessage(data) {
                    messageCount++;
                    expect(data.count > 0).toBe(true);
                    if (messageCount >= 30) controller.abort();
                },
                onError(_) {
                    errorCount++;
                },
            },
        );
        controller.onAbort(() => res(undefined));
    });
    expect(messageCount).toBe(30);
    expect(resCount).toBe(3);
    expect(errorCount).toBe(0);
});

test('[EVENT_STREAM_RPC] reconnect with new credentials', async () => {
    const dynamicClient = new TestClient({
        baseUrl,
        wsConnectionUrl,
        headers() {
            return {
                'x-test-header': randomUUID(),
            };
        },
    });
    let msgCount = 0;
    let openCount = 0;
    await new Promise((res, rej) => {
        setTimeout(() => rej(), 2000);
        const controller = dynamicClient.tests.streamRetryWithNewCredentials({
            onMessage(_) {
                msgCount++;
                if (msgCount >= 40) controller.abort();
            },
            onOpen() {
                openCount++;
            },
            onError(error) {
                rej(error);
            },
        });
        controller.onAbort(() => res(undefined));
    });
    expect(msgCount >= 40).toBe(true);
    expect(openCount).toBe(4);
});

describe('request options', () => {
    test('global options', async () => {
        let numErr = 0;
        const client = new TestClient({
            baseUrl,
            wsConnectionUrl,
            headers,
            retry: 2,
            retryErrorCodes: [409],
            onError: () => {
                numErr++;
            },
        });
        await client.tests.emptyParamsGetRequest();
        expect(numErr).toBe(0);
        numErr = 0;
        try {
            await client.tests.sendError({ message: '', code: 409 });
        } catch (_) {
            // do nothing
        }
        expect(numErr).toBe(3);
    });
    test('local function options', async () => {
        let numErr = 0;
        const client = new TestClient({
            baseUrl,
            wsConnectionUrl,
            headers,
            retry: false,
            onError: () => {
                numErr += 1000;
            },
        });

        await client.tests.emptyParamsGetRequest({
            onError: () => {
                numErr++;
            },
        });
        expect(numErr).toBe(0);
        numErr = 0;
        try {
            await client.tests.sendError(
                { message: '', code: 409 },
                {
                    retry: 10,
                    retryErrorCodes: [409],
                    onError: () => {
                        numErr++;
                    },
                },
            );
        } catch (_) {
            // do nothing
        }
        expect(numErr).toBe(11);
    });
});
