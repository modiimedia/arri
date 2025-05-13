import {
    ClientMessage,
    encodeClientMessage,
    parseClientMessage,
} from './messages';

describe('Client Messages', () => {
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
    const encodedMsg = `ARRIRPC/1.0 example.foo.bar
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

describe('Server Messages', () => {
    test('encoding', () => {
        const expectedResult = `
ARRIRPC/1.0 SUCCESS
req-id: 15
content-type: application/json

{"message":"hello world"}`;
    });
});
