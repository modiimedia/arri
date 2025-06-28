import { ArriError } from './errors';
import {
    ClientMessage,
    encodeClientMessage,
    encodeServerMessage,
    parseClientMessage,
    parseServerMessage,
    ServerMessage,
} from './messages';

describe('client messages', () => {
    const decodedMsg: ClientMessage = {
        rpcName: 'example.foo.bar',
        reqId: '15',
        clientVersion: '1',
        contentType: 'application/json',
        customHeaders: {
            foo: 'foo',
        },
        body: `{"message":"hello world"}`,
    };
    const encodedMsg = `ARRIRPC/0.0.8 example.foo.bar
content-type: application/json
req-id: 15
client-version: 1
foo: foo

{"message":"hello world"}`;

    test('encoding', () => {
        const result = encodeClientMessage(decodedMsg);
        expect(result).toStrictEqual(encodedMsg);
    });
    test('decoding', () => {
        const result = parseClientMessage(encodedMsg);
        if (!result.success) console.error(result.error);
        expect(result.success).toBe(true);
        if (!result.success) return;
        expect(result.value).toStrictEqual(decodedMsg);
    });
});

describe('server messages', () => {
    describe('success message', () => {
        const encodedMsg = `ARRIRPC/0.0.8 SUCCESS
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
            const expectedResult = `ARRIRPC/0.0.8 FAILURE
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
        const withIntervalEncoded = `ARRIRPC/0.0.8 HEARTBEAT
heartbeat-interval: 150\n\n`;
        const withoutInterval: ServerMessage = {
            type: 'HEARTBEAT',
            heartbeatInterval: undefined,
        };
        const withoutIntervalEncoded = `ARRIRPC/0.0.8 HEARTBEAT\n\n`;
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
        const encodedMessageWithInterval = `ARRIRPC/0.0.8 CONNECTION_START
heartbeat-interval: 150\n\n`;

        const decodedMessageWithoutInterval: ServerMessage = {
            type: 'CONNECTION_START',
            heartbeatInterval: undefined,
        };
        const encodedMessageWithoutInterval = `ARRIRPC/0.0.8 CONNECTION_START\n\n`;
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
            `ARRIRPC/0.0.8 FOO\n\n`,
            `HTTP/1 GET /hello-world`,
            `ARRIRPC/0.0.8 SUCCESS\ncontent-type: application/json\nreq-id: 1\n`,
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
