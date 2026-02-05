import {
    ARRI_VERSION,
    InvocationMessage,
    encodeMessage,
    parseHeaderLine,
    Message,
    parseMessage,
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

describe('invocation messages', async () => {
    const decodedMsg: InvocationMessage = {
        type: 'INVOCATION',
        rpcName: 'example.foo.bar',
        reqId: '15',
        clientVersion: '1',
        contentType: 'application/json',
        customHeaders: {
            foo: 'foo',
            bar: 'hello\\nworld',
        },
        body: `{"message":"hello world"}`,
        lastMsgId: undefined,
    };
    const encodedMsg = `ARRIRPC/${ARRI_VERSION} example.foo.bar
content-type: application/json
req-id: 15
client-version: 1
foo: foo
bar: hello\\nworld

{"message":"hello world"}`;

    test('encoding', () => {
        const result = encodeMessage(decodedMsg);
        expect(result).toStrictEqual(encodedMsg);
    });
    test('decoding', () => {
        const result = parseMessage(encodedMsg);
        if (!result.ok) console.error(result.error);
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value).toStrictEqual(decodedMsg);
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
            const result = parseMessage(testCase);
            if (result.ok) console.log('UNEXPECTED SUCCESS:', result.value);
            expect(result.ok).toBe(false);
        }
    });
});

describe('success message', () => {
    const encodedMsg = `ARRIRPC/${ARRI_VERSION} OK
content-type: application/json
req-id: 15
foo: foo

{"message":"hello world"}`;
    const decodedMsg: Message = {
        type: 'OK',
        reqId: '15',
        contentType: 'application/json',
        customHeaders: {
            foo: 'foo',
        },
        heartbeatInterval: undefined,
        body: `{"message":"hello world"}`,
    };
    test('encoding', () => {
        expect(encodeMessage(decodedMsg)).toBe(encodedMsg);
    });
    test('decoding', () => {
        const result = parseMessage(encodedMsg);
        if (!result.ok) console.log(result.error);
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value).toStrictEqual(decodedMsg);
    });
});
describe('failure message', () => {
    test('encoding', () => {
        const expectedResult = `ARRIRPC/${ARRI_VERSION} ERROR
content-type: application/json
req-id: 15
err-code: 12345
err-msg: there was an error
foo: foo

`;
        const message: Message = {
            type: 'ERROR',
            contentType: 'application/json',
            reqId: '15',
            customHeaders: {
                foo: 'foo',
            },
            errorCode: 12345,
            errorMessage: 'there was an error',
            body: undefined,
        };
        const result = encodeMessage(message);
        expect(result).toBe(expectedResult);
    });
});
describe('heartbeat message', () => {
    const withInterval: Message = {
        type: 'HEARTBEAT',
        heartbeatInterval: 150,
    };
    const withIntervalEncoded = `ARRIRPC/${ARRI_VERSION} HEARTBEAT
heartbeat-interval: 150\n\n`;
    const withoutInterval: Message = {
        type: 'HEARTBEAT',
        heartbeatInterval: undefined,
    };
    const withoutIntervalEncoded = `ARRIRPC/${ARRI_VERSION} HEARTBEAT\n\n`;
    test('encoding', () => {
        const result1 = encodeMessage(withInterval);
        expect(result1).toBe(withIntervalEncoded);
        const result2 = encodeMessage(withoutInterval);
        expect(result2).toBe(withoutIntervalEncoded);
    });
    test('decoding', () => {
        const result1 = parseMessage(withIntervalEncoded);
        expect(result1.ok).toBe(true);
        if (!result1.ok) return;
        expect(result1.value).toStrictEqual(withInterval);
        const result2 = parseMessage(withoutIntervalEncoded);
        expect(result2.ok).toBe(true);
        if (!result2.ok) return;
        expect(result2.value).toStrictEqual(withoutInterval);
    });
});
describe('start message', () => {
    const decodedMessageWithInterval: Message = {
        type: 'CONNECTION_START',
        heartbeatInterval: 150,
    };
    const encodedMessageWithInterval = `ARRIRPC/${ARRI_VERSION} CONNECTION_START
heartbeat-interval: 150\n\n`;

    const decodedMessageWithoutInterval: Message = {
        type: 'CONNECTION_START',
        heartbeatInterval: undefined,
    };
    const encodedMessageWithoutInterval = `ARRIRPC/${ARRI_VERSION} CONNECTION_START\n\n`;
    test('encoding', () => {
        const result1 = encodeMessage(decodedMessageWithInterval);
        expect(result1).toStrictEqual(encodedMessageWithInterval);
        const result2 = encodeMessage(decodedMessageWithoutInterval);
        expect(result2).toBe(encodedMessageWithoutInterval);
    });
    test('decoding', () => {
        const result1 = parseMessage(encodedMessageWithInterval);
        expect(result1.ok).toBe(true);
        if (!result1.ok) return;
        expect(result1.value).toStrictEqual(decodedMessageWithInterval);
        const result2 = parseMessage(encodedMessageWithoutInterval);
        expect(result2.ok).toBe(true);
        if (!result2.ok) return;
        expect(result2.value).toStrictEqual(decodedMessageWithoutInterval);
    });
});
test('invalid messages', () => {
    const messageInputs = [
        `ARRIRPC/${ARRI_VERSION} FOO\n\n`,
        `HTTP/1 GET /hello-world`,
        `ARRIRPC/${ARRI_VERSION} OK\ncontent-type: application/json\nreq-id: 1\n`,
    ];
    for (const input of messageInputs) {
        const result = parseMessage(input);
        if (result.ok) {
            console.log('Should not pass:');
            console.log(input);
        }
        expect(result.ok).toBe(false);
    }
});
