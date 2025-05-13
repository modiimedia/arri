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
        expect(result.success);
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
            success: true,
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
                success: false,
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
});
