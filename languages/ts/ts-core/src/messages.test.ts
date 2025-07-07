import { ArriError } from './errors';
import {
    ARRI_VERSION,
    ClientMessage,
    encodeClientMessage,
    encodeServerMessage,
    parseClientMessage,
    parseHeaderLine,
    parseServerMessage,
    ServerMessage,
} from './messages';

test('parseHeaderLine', () => {
    const testCases = [
        {
            input: 'foo: foo',
            expectedResult: ['foo', 'foo'] as const,
        },
        {
            input: 'url:  https://www.google.com',
            expectedResult: ['url', 'https://www.google.com'] as const,
        },
        {
            input: 'message:My name is: "Jeff".\\nI like ice cream!',
            expectedResult: [
                'message',
                'My name is: "Jeff".\\nI like ice cream!',
            ] as const,
        },
    ];
    for (const testCase of testCases) {
        const result = parseHeaderLine(testCase.input);
        expect(result).toStrictEqual(testCase.expectedResult);
    }
});

describe('client messages', async () => {
    const decodedMsg: ClientMessage = {
        rpcName: 'example.foo.bar',
        reqId: '15',
        clientVersion: '1',
        contentType: 'application/json',
        customHeaders: {
            foo: 'foo',
            bar: 'hello\\nworld',
        },
        body: `{"message":"hello world"}`,
        lastEventId: undefined,
        action: undefined,
    };
    const encodedMsg = `ARRIRPC/${ARRI_VERSION} example.foo.bar
content-type: application/json
req-id: 15
client-version: 1
foo: foo
bar: hello\\nworld

{"message":"hello world"}`;

    const decodedActionMsg: ClientMessage = {
        rpcName: 'example.foo.bar',
        contentType: 'application/json',
        reqId: '15',
        customHeaders: {},
        action: 'CLOSE',
        clientVersion: undefined,
        lastEventId: undefined,
        body: undefined,
    };
    const encodedActionMsg = `ARRIRPC/${ARRI_VERSION} example.foo.bar CLOSE
content-type: application/json
req-id: 15

`;

    test('encoding', () => {
        const result = encodeClientMessage(decodedMsg);
        expect(result).toStrictEqual(encodedMsg);
        const actionResult = encodeClientMessage(decodedActionMsg);
        expect(actionResult).toStrictEqual(encodedActionMsg);
    });
    test('decoding', () => {
        const result = parseClientMessage(encodedMsg);
        if (!result.success) console.error(result.error);
        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.value).toStrictEqual(decodedMsg);

        const actionResult = parseClientMessage(encodedActionMsg);
        if (!actionResult.success) console.error(actionResult.error);
        expect(actionResult.success).toBe(true);
        if (!actionResult.success) return;
        expect(actionResult.value).toStrictEqual(decodedActionMsg);
    });
    test('decoding failures', () => {
        const testCases = [
            `ARRIRPC/0.0.7 example.foo.bar
content-type: application/json
req-id: 15

{"message":"hello world"}`,
            `HTTP/1.1 example.foo.bar
content-type: application/json
req-id: 15

{"message":"hello world"}`,
            `ARRIRPC/${ARRI_VERSION} example.foo.bar
content-type: application/json
req-id: 15
client-version: 1
foo: foo
bar: hello world`,
        ];
        for (const testCase of testCases) {
            const result = parseClientMessage(testCase);
            if (result.success)
                console.log('UNEXPECTED SUCCESS:', result.value);
            expect(result.success).toBe(false);
        }
    });
});

describe('server messages', () => {
    describe('success message', () => {
        const encodedMsg = `ARRIRPC/${ARRI_VERSION} SUCCESS
content-type: application/json
req-id: 15
foo: foo

{"message":"hello world"}`;
        const decodedMsg: ServerMessage = {
            type: 'SUCCESS',
            reqId: '15',
            contentType: 'application/json',
            customHeaders: {
                foo: 'foo',
            },
            body: `{"message":"hello world"}`,
        };
        test('encoding', () => {
            expect(encodeServerMessage(decodedMsg)).toBe(encodedMsg);
        });
        test('decoding', () => {
            const result = parseServerMessage(encodedMsg);
            if (!result.success) console.log(result.error);
            expect(result.success).toBe(true);
            if (!result.success) return;
            expect(result.value).toStrictEqual(decodedMsg);
        });
    });
    describe('failure message', () => {
        test('encoding', () => {
            const expectedResult = `ARRIRPC/${ARRI_VERSION} FAILURE
content-type: application/json
req-id: 15
foo: foo

{"code":12345,"message":"there was an error"}`;
            const message: ServerMessage = {
                type: 'FAILURE',
                contentType: 'application/json',
                reqId: '15',
                customHeaders: {
                    foo: 'foo',
                },
                error: new ArriError({
                    code: 12345,
                    message: 'there was an error',
                }),
            };
            const result = encodeServerMessage(message);
            expect(result).toBe(expectedResult);
        });
    });
    describe('heartbeat message', () => {
        const withInterval: ServerMessage = {
            type: 'HEARTBEAT',
            heartbeatInterval: 150,
        };
        const withIntervalEncoded = `ARRIRPC/${ARRI_VERSION} HEARTBEAT
heartbeat-interval: 150\n\n`;
        const withoutInterval: ServerMessage = {
            type: 'HEARTBEAT',
            heartbeatInterval: undefined,
        };
        const withoutIntervalEncoded = `ARRIRPC/${ARRI_VERSION} HEARTBEAT\n\n`;
        test('encoding', () => {
            const result1 = encodeServerMessage(withInterval);
            expect(result1).toBe(withIntervalEncoded);
            const result2 = encodeServerMessage(withoutInterval);
            expect(result2).toBe(withoutIntervalEncoded);
        });
        test('decoding', () => {
            const result1 = parseServerMessage(withIntervalEncoded);
            expect(result1.success).toBe(true);
            if (!result1.success) return;
            expect(result1.value).toStrictEqual(withInterval);
            const result2 = parseServerMessage(withoutIntervalEncoded);
            expect(result2.success).toBe(true);
            if (!result2.success) return;
            expect(result2.value).toStrictEqual(withoutInterval);
        });
    });
    describe('start message', () => {
        const decodedMessageWithInterval: ServerMessage = {
            type: 'CONNECTION_START',
            heartbeatInterval: 150,
        };
        const encodedMessageWithInterval = `ARRIRPC/${ARRI_VERSION} CONNECTION_START
heartbeat-interval: 150\n\n`;

        const decodedMessageWithoutInterval: ServerMessage = {
            type: 'CONNECTION_START',
            heartbeatInterval: undefined,
        };
        const encodedMessageWithoutInterval = `ARRIRPC/${ARRI_VERSION} CONNECTION_START\n\n`;
        test('encoding', () => {
            const result1 = encodeServerMessage(decodedMessageWithInterval);
            expect(result1).toStrictEqual(encodedMessageWithInterval);
            const result2 = encodeServerMessage(decodedMessageWithoutInterval);
            expect(result2).toBe(encodedMessageWithoutInterval);
        });
        test('decoding', () => {
            const result1 = parseServerMessage(encodedMessageWithInterval);
            expect(result1.success).toBe(true);
            if (!result1.success) return;
            expect(result1.value).toStrictEqual(decodedMessageWithInterval);
            const result2 = parseServerMessage(encodedMessageWithoutInterval);
            expect(result2.success).toBe(true);
            if (!result2.success) return;
            expect(result2.value).toStrictEqual(decodedMessageWithoutInterval);
        });
    });
    test('invalid messages', () => {
        const messageInputs = [
            `ARRIRPC/${ARRI_VERSION} FOO\n\n`,
            `HTTP/1 GET /hello-world`,
            `ARRIRPC/${ARRI_VERSION} SUCCESS\ncontent-type: application/json\nreq-id: 1\n`,
        ];
        for (const input of messageInputs) {
            const result = parseServerMessage(input);
            if (result.success) {
                console.log('Should not pass:');
                console.log(input);
            }
            expect(result.success).toBe(false);
        }
    });
});
