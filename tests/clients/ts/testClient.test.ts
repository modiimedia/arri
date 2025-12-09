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

// function wait(ms: number) {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve(true);
//         }, ms);
//     });
// }

const baseUrl = 'http://127.0.0.1:2020';
const headers = {
    'x-test-header': 'test',
};

const client = new TestClient({
    baseUrl,
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
    const result = await client.tests.nested.emptyParamsGetRequest();
    const result2 = await client.tests.nested.emptyParamsPostRequest();
    expect(typeof result.message).toBe('string');
    expect(typeof result2.message).toBe('string');
});
test('can handle RPCs with no response', async () => {
    await client.tests.nested.emptyResponseGetRequest({ message: 'ok' });
    await client.tests.nested.emptyResponsePostRequest({ message: 'ok' });
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
        async headers() {
            await new Promise((res) => {
                setTimeout(() => {
                    res(true);
                }, 1000);
            });
            return headers;
        },
    });
    const result = await _client.tests.nested.emptyParamsGetRequest();
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

test('[SSE] supports server sent events', async () => {
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
                onResponse({ response }) {
                    wasConnected = response.status === 200;
                },
            },
        );
        controller.onAbort(() => res(undefined));
    });
    expect(receivedMessageCount > 0).toBe(true);
    expect(wasConnected).toBe(true);
});

test("[SSE] closes connection when receiving 'done' event", async () => {
    let timesConnected = 0;
    let messageCount = 0;
    let errorReceived: ArriErrorInstance | undefined;
    await new Promise((res, rej) => {
        setTimeout(() => rej(), 2000);
        const controller = client.tests.streamTenEventsThenEnd({
            onMessage(_) {
                messageCount++;
            },
            onRequestError({ error }) {
                errorReceived = error;
            },
            onResponseError({ error }) {
                errorReceived = error;
            },
            onRequest() {
                timesConnected++;
            },
        });
        controller.onAbort(() => res(undefined));
    });
    expect(errorReceived).toBe(undefined);
    expect(timesConnected).toBe(1);
    expect(messageCount).toBe(10);
});

test('[SSE] auto-reconnects when connection is closed by server', async () => {
    let reqCount = 0;
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
                onRequest() {
                    reqCount++;
                },
                onResponse() {
                    resCount++;
                },
                onMessage(data) {
                    messageCount++;
                    expect(data.count > 0).toBe(true);
                    if (messageCount >= 30) controller.abort();
                },
                onResponseError(_) {
                    errorCount++;
                },
            },
        );
        controller.onAbort(() => res(undefined));
    });
    expect(messageCount).toBe(30);
    expect(reqCount).toBe(3);
    expect(resCount).toBe(3);
    expect(errorCount).toBe(0);
});

test('[SSE] reconnect with new credentials', async () => {
    const dynamicClient = new TestClient({
        baseUrl,
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
            onRequestError({ error }) {
                rej(error);
            },
            onResponse(_) {
                openCount++;
            },
            onResponseError({ error }) {
                rej(error);
            },
        });
        controller.onAbort(() => res(undefined));
    });
    expect(msgCount >= 40).toBe(true);
    expect(openCount).toBe(4);
});

describe('[SSE] respects heartbeat header', async () => {
    test(
        'reconnects when no heartbeat is received',
        { timeout: 30000 },
        async () => {
            let msgCount = 0;
            let resCount = 0;
            await new Promise((res, rej) => {
                setTimeout(() => {
                    rej();
                }, 30000);
                const controller = client.tests.streamHeartbeatDetectionTest(
                    { heartbeatEnabled: false },
                    {
                        onMessage(_) {
                            msgCount++;
                            if (msgCount >= 15) controller.abort();
                        },
                        onResponse() {
                            resCount++;
                        },
                        onRequestError({ error }) {
                            rej(error);
                        },
                        onResponseError({ error }) {
                            rej(error);
                        },
                    },
                );
                controller.onAbort(() => res(undefined));
            });
            expect(resCount).toBe(3);
            expect(msgCount).toBe(15);
        },
    );

    test(
        'keeps connection alive when heartbeat is received',
        { timeout: 30000 },
        async () => {
            let msgCount = 0;
            let resCount = 0;
            await new Promise((res, rej) => {
                setTimeout(() => {
                    rej();
                }, 30000);
                const controller = client.tests.streamHeartbeatDetectionTest(
                    { heartbeatEnabled: true },
                    {
                        onMessage(_) {
                            msgCount++;
                            if (msgCount >= 8) controller.abort();
                        },
                        onResponse() {
                            resCount++;
                        },
                        onRequestError({ error }) {
                            rej(error);
                        },
                        onResponseError({ error }) {
                            rej(error);
                        },
                    },
                );
                controller.onAbort(() => res(undefined));
            });
            expect(resCount).toBe(1);
            expect(msgCount).toBe(8);
        },
    );
});

describe('request options', () => {
    test('global options', async () => {
        let numRequest = 0;
        let numRequestErr = 0;
        let numResponse = 0;
        let numResponseErr = 0;
        const client = new TestClient({
            baseUrl: baseUrl,
            headers: headers,
            options: {
                retry: 2,
                retryStatusCodes: [409],
                onRequest: () => {
                    numRequest++;
                },
                onRequestError: () => {
                    numRequestErr++;
                },
                onResponse: () => {
                    numResponse++;
                },
                onResponseError: () => {
                    numResponseErr++;
                },
            },
        });
        await client.tests.nested.emptyParamsGetRequest();
        expect(numRequest).toBe(1);
        expect(numRequestErr).toBe(0);
        expect(numResponse).toBe(1);
        expect(numResponseErr).toBe(0);
        numRequest = 0;
        numRequestErr = 0;
        numResponse = 0;
        numResponseErr = 0;
        try {
            await client.tests.sendError({ message: '', code: 409 });
        } catch (_) {
            // do nothing
        }
        expect(numRequest).toBe(3);
        expect(numRequestErr).toBe(0);
        expect(numResponse).toBe(3);
        expect(numResponseErr).toBe(3);
    });
    test('local function options', async () => {
        let numRequest = 0;
        let numRequestErr = 0;
        let numResponse = 0;
        let numResponseErr = 0;
        const client = new TestClient({
            baseUrl: baseUrl,
            headers: headers,
            options: {
                retry: false,
                onRequest: () => {
                    numRequest += 1000;
                },
                onRequestError: () => {
                    numRequestErr += 1000;
                },
                onResponse: () => {
                    numResponse += 1000;
                },
                onResponseError: () => {
                    numResponseErr += 1000;
                },
            },
        });

        await client.tests.nested.emptyParamsGetRequest({
            onRequest: () => {
                numRequest++;
            },
            onRequestError: () => {
                numRequestErr++;
            },
            onResponse: () => {
                numResponse++;
            },
            onResponseError: () => {
                numResponseErr++;
            },
        });
        expect(numRequest).toBe(1);
        expect(numRequestErr).toBe(0);
        expect(numResponse).toBe(1);
        expect(numResponseErr).toBe(0);
        numRequest = 0;
        numRequestErr = 0;
        numResponse = 0;
        numResponseErr = 0;
        try {
            await client.tests.sendError(
                { message: '', code: 409 },
                {
                    retry: 3,
                    retryStatusCodes: [409],
                    onRequest: () => {
                        numRequest++;
                    },
                    onResponseError: () => {
                        numResponseErr++;
                    },
                },
            );
        } catch (_) {
            // do nothing
        }
        expect(numRequest).toBe(4);
        expect(numRequestErr).toBe(0);
        expect(numResponse).toBe(0);
        expect(numResponseErr).toBe(4);
    });
});

// test("[ws] support websockets", async () => {
//     let connectionCount = 0;
//     let messageCount = 0;
//     const errorCount = 0;
//     const msgMap: Record<string, WsMessageResponse> = {};
//     const controller = await client.tests.websocketRpc({
//         onMessage(msg) {
//             messageCount++;
//             msgMap[msg.entityId] = msg;
//         },
//         onConnectionError(err) {
//             throw new ArriErrorInstance({
//                 code: err.code,
//                 message: err.message,
//                 data: err.data,
//                 stack: err.stack,
//             });
//         },
//     });
//     controller.onOpen = () => {
//         connectionCount++;
//         controller.send({
//             type: "CREATE_ENTITY",
//             entityId: "1",
//             x: 100,
//             y: 200,
//         });
//         controller.send({
//             type: "UPDATE_ENTITY",
//             entityId: "2",
//             x: 1,
//             y: 2,
//         });
//         controller.send({
//             type: "UPDATE_ENTITY",
//             entityId: "3",
//             x: 5,
//             y: -5,
//         });
//     };
//     controller.connect();
//     await wait(1000);
//     controller.close();
//     expect(connectionCount).toBe(1);
//     expect(messageCount).toBe(3);
//     expect(errorCount).toBe(0);
//     expect(msgMap["1"]!.x).toBe(100);
//     expect(msgMap["1"]!.y).toBe(200);
//     expect(msgMap["2"]!.x).toBe(1);
//     expect(msgMap["2"]!.y).toBe(2);
//     expect(msgMap["3"]!.x).toBe(5);
//     expect(msgMap["3"]!.y).toBe(-5);
// });

// test("[ws] receive large messages", async () => {
//     let messageCount = 0;
//     const controller = await client.tests.websocketRpcSendTenLargeMessages({
//         onMessage(_) {
//             messageCount++;
//         },
//     });
//     controller.connect();
//     await wait(2000);
//     controller.close();
//     expect(messageCount).toBe(10);
// });

// test("[ws] connection errors", async () => {
//     let connectionCount = 0;
//     let messageCount = 0;
//     let errorCount = 0;
//     const controller = await new TestClient({
//         baseUrl: "http://127.0.0.1:2021",
//     }).tests.websocketRpc({
//         onOpen() {
//             connectionCount++;
//         },
//         onMessage() {
//             messageCount++;
//         },
//         onConnectionError() {
//             errorCount++;
//         },
//         onClose() {},
//     });
//     controller.connect();
//     await wait(500);
//     expect(connectionCount).toBe(0);
//     expect(errorCount).toBe(1);
//     expect(messageCount).toBe(0);
// });

// describe("arri adapters", () => {
//     test("typebox adapter", async () => {
//         const input: TypeBoxObject = {
//             string: "hello world",
//             optionalString: undefined,
//             boolean: false,
//             integer: 100,
//             number: 10.5,
//             enumField: "B",
//             object: {
//                 string: "hello world",
//             },
//             array: [true, false],
//         };
//         const result = await client.adapters.typebox(input);
//         expect(result).toStrictEqual(input);
//     });
// });
