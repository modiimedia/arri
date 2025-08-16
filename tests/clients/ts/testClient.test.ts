import { ArriError, EventStreamController } from '@arrirpc/client';
import { randomUUID } from 'crypto';
import { FetchError, ofetch } from 'ofetch';
import { afterAll, describe, expect, it, test } from 'vitest';

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
const wsConnectionUrl = 'ws://127.0.0.1:2020/establish-connection';
const headers = {
    'x-test-header': 'test',
};
const transport = process.env['CLIENT_TRANSPORT'] === 'ws' ? 'ws' : 'http';
// const transport = 'ws';

console.info(`running tests over "${transport}"`);

const client = new TestClient({
    baseUrl,
    wsConnectionUrl,
    headers,
    transport: transport,
});

afterAll(() => {
    client.terminateConnections();
});

describe('non-rpc http routes', () => {
    test('authenticated request', async () => {
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
    test('unauthenticated request', async () => {
        try {
            await ofetch('/routes/hello-world', {
                method: 'post',
                baseURL: baseUrl,
            });
        } catch (err) {
            expect(err instanceof ArriError);
            if (err instanceof ArriError) {
                expect(err.code).toBe(401);
            }
        }
    });
});

describe('rpcs', () => {
    it('can handle RPCs with no params', { timeout: 10000 }, async () => {
        const result = await client.tests.emptyParamsGetRequest();
        const result2 = await client.tests.emptyParamsPostRequest();
        expect(typeof result.message).toBe('string');
        expect(typeof result2.message).toBe('string');
    });
    it('can handle RPCs with no response', async () => {
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
    it('can send/receive object with every field type', async () => {
        const result = await client.tests.sendObject(input);
        expect(result).toStrictEqual(input);
    });
    it('can send/receive object with transformed keys', async () => {
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
    it('returns error if sending nothing when RPC expects body', async () => {
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
    it('returns a 401 error for unauthenticated RPC request', async () => {
        let firedOnErr = false;
        const unauthenticatedClient = new TestClient({
            baseUrl,
            wsConnectionUrl: wsConnectionUrl,
            transport: transport,
            onError(_) {
                firedOnErr = true;
            },
        });
        try {
            await unauthenticatedClient.tests.sendObject(input);
            expect(true).toBe(false);
        } catch (err) {
            expect(err instanceof ArriError);
            if (err instanceof ArriError) {
                expect(err.code).toBe(401);
            }
        }
        expect(firedOnErr).toBe(true);
        unauthenticatedClient.terminateConnections();
    });
    it('can use async functions for headers', async () => {
        const _client = new TestClient({
            baseUrl: baseUrl,
            wsConnectionUrl,
            transport: transport,
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
        _client.terminateConnections();
    });
    it('can send/receive partial objects', async () => {
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
    it('can send/receive object with nullable fields', async () => {
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
    it('can send/receive recursive objects', async () => {
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
    it('can send/receive recursive unions', async () => {
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
            transport,
            onError(_, err) {
                onErrorFired = true;
                expect(err instanceof ArriError).toBe(true);
            },
        });
        try {
            await customClient.tests.sendObject(input);
        } catch (_) {
            // do nothing
        }
        expect(onErrorFired).toBe(true);
        customClient.terminateConnections();
    });
});

describe('event stream rpcs', () => {
    it('supports event streams', async () => {
        let wasConnected = false;
        let receivedMessageCount = 0;
        let openCount = 0;
        await new Promise((res, rej) => {
            setTimeout(() => rej('timeout exceeded'), 2000);
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
                        openCount++;
                        wasConnected = true;
                    },
                    onClose() {
                        res(undefined);
                    },
                },
            );
        });
        expect(receivedMessageCount > 0).toBe(true);
        expect(wasConnected).toBe(true);
        expect(openCount).toBe(1);
    });

    it("closes connection when receiving 'done' event", async () => {
        let timesConnected = 0;
        let messageCount = 0;
        let errorReceived: unknown | undefined;
        await new Promise((res, rej) => {
            setTimeout(() => rej('timeout exceeded'), 2000);
            client.tests.streamTenEventsThenEnd({
                onMessage(_) {
                    messageCount++;
                },
                onError(error) {
                    errorReceived = error;
                },
                onOpen() {
                    timesConnected++;
                },
                onClose() {
                    res(undefined);
                },
            });
        });
        expect(errorReceived).toBe(undefined);
        expect(timesConnected).toBe(1);
        expect(messageCount).toBe(10);
    });

    it('auto-reconnects when connection is closed by server', async () => {
        let resCount = 0;
        let errorCount = 0;
        let messageCount = 0;
        const customClient = new TestClient({
            baseUrl,
            wsConnectionUrl,
            headers,
        });
        await new Promise((res, rej) => {
            setTimeout(() => rej('timeout exceeded'), 2000);
            const controller = customClient.tests.streamAutoReconnect(
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
                    onClose() {
                        res(undefined);
                    },
                },
            );
        });
        expect(messageCount).toBe(30);
        expect(resCount).toBe(3);
        expect(errorCount).toBe(0);
        customClient.terminateConnections();
    });

    it('reconnect with new credentials', async () => {
        const dynamicClient = new TestClient({
            baseUrl,
            wsConnectionUrl,
            transport,
            headers() {
                return {
                    'x-test-header': randomUUID(),
                };
            },
        });
        let msgCount = 0;
        let openCount = 0;
        await new Promise((res, rej) => {
            setTimeout(() => rej('timeout exceeded'), 5000);
            const controller =
                dynamicClient.tests.streamRetryWithNewCredentials({
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
                    onClose() {
                        res(undefined);
                    },
                });
        });
        expect(msgCount >= 40).toBe(true);
        expect(openCount).toBe(4);
        dynamicClient.terminateConnections();
    });

    it('can handle receiving large objects', { timeout: 10000 }, async () => {
        let openCount = 0;
        let msgCount = 0;
        let error: unknown = undefined;
        const largePayloadClient = new TestClient({
            baseUrl: baseUrl,
            wsConnectionUrl: wsConnectionUrl,
            transport: transport,
            headers: headers,
            maxReceivedFrameSize: 1096478 * 2,
        });
        await new Promise((res) => {
            const controller = largePayloadClient.tests.streamLargeObjects({
                onOpen() {
                    openCount++;
                    if (openCount > 1) controller.abort();
                },
                onMessage() {
                    msgCount++;
                    if (msgCount > 2) {
                        controller.abort();
                    }
                },
                onError(err) {
                    error = err;
                    controller.abort();
                },
                onClose() {
                    res(undefined);
                },
            });
        });
        expect(error).toBe(undefined);
        expect(openCount).toBe(1);
        expect(msgCount > 2).toBe(true);
    });
    test('stream connection error test', async () => {
        let errCount = 0;
        let controller: EventStreamController | undefined;
        await new Promise((res) => {
            controller = client.tests.streamConnectionErrorTest(
                {
                    statusCode: 411,
                    statusMessage: 'hello world',
                },
                {
                    onError(err) {
                        console.log('ERROR', err);
                        expect(err instanceof ArriError).toBe(true);
                        if (err instanceof ArriError) {
                            expect(err.code).toBe(411);
                            expect(err.message).toBe('hello world');
                        }
                        errCount++;
                        if (errCount >= 5) controller?.abort();
                    },
                    onClose() {
                        res(undefined);
                    },
                },
            );
        });
        controller?.abort();
        expect(errCount).toBe(5);
    });
});

describe('request options', () => {
    test('global options', async () => {
        let numErr = 0;
        const customClient = new TestClient({
            baseUrl,
            wsConnectionUrl,
            headers,
            retry: 2,
            retryErrorCodes: [409],
            transport,
            onError: () => {
                numErr++;
            },
        });
        await customClient.tests.emptyParamsGetRequest();
        expect(numErr).toBe(0);
        numErr = 0;
        try {
            await customClient.tests.sendError({ message: '', code: 409 });
        } catch (_) {
            // do nothing
        }
        expect(numErr).toBe(3);
        customClient.terminateConnections();
    });
    test('local function options', async () => {
        let numErr = 0;
        const client = new TestClient({
            baseUrl,
            wsConnectionUrl,
            headers,
            transport,
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
                    onError: (_req, _err) => {
                        numErr++;
                    },
                },
            );
        } catch (_) {
            // do nothing
        }
        expect(numErr).toBe(11);
        client.terminateConnections();
    });
});
