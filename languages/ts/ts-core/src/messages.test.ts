import { ArriHeaders } from './headers';
import {
    encodeMessage,
    Message,
    MessageEncodingError,
    parseClientMessage,
    parseMessage,
    parseServerMessage,
} from './messages';

const utf8 = (input: string) => new TextEncoder().encode(input);
const text = (input: Uint8Array) => new TextDecoder().decode(input);

/**
 * Drop undefined fields, decode the body, and convert headers to plain objects
 * so messages can be compared structurally
 */
function normalize(msg: Message): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(msg)) {
        if (val === undefined) continue;
        if (val instanceof Uint8Array) {
            result[key] = text(val);
        } else if (val instanceof ArriHeaders) {
            result[key] = val.toJSON();
        } else {
            result[key] = val;
        }
    }
    return result;
}

const roundTripCases: Record<string, { msg: Message; encoded: string }> = {
    'INVOCATION with body': {
        msg: {
            type: 'INVOCATION',
            rpcName: 'users.getUser',
            reqId: '12',
            contentType: 'application/json',
            accept: 'application/json',
            clientVersion: '1.2.5',
            headers: new ArriHeaders({ authorization: 'Bearer abc' }),
            body: utf8('{"id":"1"}'),
        },
        encoded: `ARRIRPC/0 INVOCATION users.getUser
req-id: 12
content-type: application/json
accept: application/json
client-version: 1.2.5
authorization: Bearer abc

{"id":"1"}`,
    },
    'INVOCATION without body': {
        msg: {
            type: 'INVOCATION',
            rpcName: 'ping',
            headers: new ArriHeaders(),
        },
        encoded: `ARRIRPC/0 INVOCATION ping

`,
    },
    OK: {
        msg: {
            type: 'OK',
            reqId: '1',
            contentType: 'application/json',
            headers: new ArriHeaders({ 'x-foo': 'foo' }),
            body: utf8('{"message":"hello world"}'),
        },
        encoded: `ARRIRPC/0 OK
req-id: 1
content-type: application/json
x-foo: foo

{"message":"hello world"}`,
    },
    'ERROR with multiline message in body': {
        msg: {
            type: 'ERROR',
            reqId: '1',
            contentType: 'application/json',
            headers: new ArriHeaders(),
            body: utf8('{"code":400,"message":"line 1\\nline 2"}'),
        },
        encoded: `ARRIRPC/0 ERROR
req-id: 1
content-type: application/json

{"code":400,"message":"line 1\\nline 2"}`,
    },
    STREAM_START: {
        msg: {
            type: 'STREAM_START',
            reqId: '3',
            contentType: 'application/json',
            headers: new ArriHeaders(),
        },
        encoded: `ARRIRPC/0 STREAM_START
req-id: 3
content-type: application/json

`,
    },
    STREAM_DATA: {
        msg: {
            type: 'STREAM_DATA',
            reqId: '3',
            msgId: '15',
            body: utf8('{"message":"héllo wörld 👋"}'),
        },
        encoded: `ARRIRPC/0 STREAM_DATA
req-id: 3
msg-id: 15

{"message":"héllo wörld 👋"}`,
    },
    STREAM_END: {
        msg: { type: 'STREAM_END', reqId: '3', reason: 'no more events' },
        encoded: `ARRIRPC/0 STREAM_END
req-id: 3
reason: no more events

`,
    },
    'CANCEL with non-numeric req-id': {
        msg: { type: 'CANCEL', reqId: '01JC9Z8X0R5Q3M7K2H4N6P8T0V' },
        encoded: `ARRIRPC/0 CANCEL
req-id: 01JC9Z8X0R5Q3M7K2H4N6P8T0V

`,
    },
    CANCEL: {
        msg: { type: 'CANCEL', reqId: '3' },
        encoded: `ARRIRPC/0 CANCEL
req-id: 3

`,
    },
    CONNECTION_START: {
        msg: { type: 'CONNECTION_START', heartbeatInterval: 10000 },
        encoded: `ARRIRPC/0 CONNECTION_START
heartbeat-interval: 10000

`,
    },
    HEARTBEAT: {
        msg: { type: 'HEARTBEAT' },
        encoded: `ARRIRPC/0 HEARTBEAT

`,
    },
    GOAWAY: {
        msg: { type: 'GOAWAY', reason: 'shutting down' },
        encoded: `ARRIRPC/0 GOAWAY
reason: shutting down

`,
    },
};

describe('round trip', () => {
    for (const [name, { msg, encoded }] of Object.entries(roundTripCases)) {
        test(name, () => {
            expect(text(encodeMessage(msg))).toBe(encoded);
            const result = parseMessage(utf8(encoded));
            expect(result.success).toBe(true);
            if (!result.success) return;
            expect(normalize(result.value)).toStrictEqual(normalize(msg));
        });
    }
});

describe('binary bodies', () => {
    // contains "\n\n", NUL bytes, and invalid UTF-8
    const binaryBody = new Uint8Array([
        0x00, 0x0a, 0x0a, 0xff, 0xfe, 0x0d, 0x0a, 0x0a, 0x80, 0x00,
    ]);
    test('round trips arbitrary bytes', () => {
        const encoded = encodeMessage({
            type: 'STREAM_DATA',
            reqId: '1',
            body: binaryBody,
        });
        const result = parseMessage(encoded);
        expect(result.success).toBe(true);
        if (!result.success || result.value.type !== 'STREAM_DATA') return;
        expect(result.value.body).toStrictEqual(binaryBody);
    });
    test('body is a view into the input', () => {
        const encoded = encodeMessage({
            type: 'OK',
            headers: new ArriHeaders(),
            body: binaryBody,
        });
        const result = parseMessage(encoded);
        if (!result.success || result.value.type !== 'OK') {
            throw new Error('expected OK message');
        }
        expect(result.value.body?.buffer).toBe(encoded.buffer);
    });
    test('empty body is treated as no body', () => {
        const result = parseMessage(
            encodeMessage({
                type: 'OK',
                headers: new ArriHeaders(),
                body: new Uint8Array(),
            }),
        );
        if (!result.success || result.value.type !== 'OK') {
            throw new Error('expected OK message');
        }
        expect(result.value.body).toBeUndefined();
    });
});

describe('encoding', () => {
    test('writes custom headers as normalized by ArriHeaders', () => {
        const encoded = encodeMessage({
            type: 'OK',
            headers: new ArriHeaders({
                'X-Foo': ' 1 ',
                'x-foo': '2',
                'x-bar': '3',
            }),
        });
        expect(text(encoded)).toBe('ARRIRPC/0 OK\nx-foo: 1, 2\nx-bar: 3\n\n');
    });
    test('rejects newlines in reserved header values', () => {
        expect(() =>
            encodeMessage({ type: 'STREAM_END', reason: 'a\r\nb' }),
        ).toThrow(MessageEncodingError);
    });
    test('rejects non-ASCII reserved header values', () => {
        expect(() =>
            encodeMessage({ type: 'CANCEL', reason: 'no más' }),
        ).toThrow(MessageEncodingError);
    });
    test('trims spaces and tabs from reserved header values', () => {
        const encoded = encodeMessage({
            type: 'STREAM_END',
            reqId: ' \t1\t ',
            reason: '\t  done  \t',
        });
        expect(text(encoded)).toBe(
            'ARRIRPC/0 STREAM_END\nreq-id: 1\nreason: done\n\n',
        );
    });
    test('rejects invalid req-ids', () => {
        expect(() => encodeMessage({ type: 'CANCEL', reqId: '' })).toThrow(
            MessageEncodingError,
        );
        expect(() => encodeMessage({ type: 'CANCEL', reqId: 'a b' })).toThrow(
            MessageEncodingError,
        );
        expect(() =>
            encodeMessage({ type: 'CANCEL', reqId: 'a'.repeat(129) }),
        ).toThrow(MessageEncodingError);
        expect(() =>
            encodeMessage({ type: 'CANCEL', reqId: 'a'.repeat(128) }),
        ).not.toThrow();
    });
    test('rejects invalid rpc names', () => {
        for (const rpcName of ['', 'foo bar', 'föo', 'foo\nbar']) {
            expect(() =>
                encodeMessage({
                    type: 'INVOCATION',
                    rpcName,
                    headers: new ArriHeaders(),
                }),
            ).toThrow(MessageEncodingError);
        }
    });
});

describe('parsing', () => {
    const parse = (input: string) => parseMessage(utf8(input));

    test('rejects other protocol versions', () => {
        expect(parse('ARRIRPC/1 HEARTBEAT\n\n').success).toBe(false);
    });
    test('rejects missing header terminator', () => {
        expect(parse('ARRIRPC/0 HEARTBEAT\n').success).toBe(false);
        expect(parseMessage(new Uint8Array()).success).toBe(false);
    });
    test('rejects non-ASCII and control characters in the head', () => {
        expect(parse('ARRIRPC/0 OK\nx-foo: café\n\n').success).toBe(false);
        expect(parse('ARRIRPC/0 OK\nx-foo: a\rb\n\n').success).toBe(false);
        expect(parse('ARRIRPC/0 OK\r\nx-foo: 1\r\n\r\n').success).toBe(false);
        const input = new Uint8Array([
            ...utf8('ARRIRPC/0 OK\nx-foo: '),
            0xff,
            ...utf8('\n\n'),
        ]);
        expect(parseMessage(input).success).toBe(false);
    });
    test('allows non-ASCII bytes in the body', () => {
        const result = parse('ARRIRPC/0 OK\n\ncafé');
        expect(result.success).toBe(true);
    });
    test('rejects unknown message types', () => {
        expect(parse('ARRIRPC/0 FOO\n\n').success).toBe(false);
    });
    test('header keys are case-insensitive', () => {
        const result = parse(
            'ARRIRPC/0 OK\nReq-ID: 5\nContent-Type: application/json\nX-Foo: bar\n\n',
        );
        expect(result).toStrictEqual({
            success: true,
            value: {
                type: 'OK',
                reqId: '5',
                contentType: 'application/json',
                headers: new ArriHeaders({ 'x-foo': 'bar' }),
                body: undefined,
            },
        });
    });
    test('rejects duplicate headers (case-insensitive)', () => {
        expect(parse('ARRIRPC/0 OK\nx-foo: 1\nx-foo: 2\n\n').success).toBe(
            false,
        );
        expect(parse('ARRIRPC/0 OK\nX-Foo: 1\nx-foo: 2\n\n').success).toBe(
            false,
        );
    });
    test('allows header keys that collide with Object.prototype properties', () => {
        const result = parse('ARRIRPC/0 OK\nconstructor: 1\n__proto__: 2\n\n');
        expect(result).toStrictEqual({
            success: true,
            value: {
                type: 'OK',
                reqId: undefined,
                contentType: undefined,
                headers: new ArriHeaders([
                    ['constructor', '1'],
                    ['__proto__', '2'],
                ]),
                body: undefined,
            },
        });
    });
    test('trims spaces and tabs from header values', () => {
        const result = parse(
            'ARRIRPC/0 STREAM_END\nreq-id:\t 1 \t\nreason:   done  \n\n',
        );
        expect(result).toStrictEqual({
            success: true,
            value: { type: 'STREAM_END', reqId: '1', reason: 'done' },
        });
    });
    test('rejects invalid req-ids', () => {
        expect(parse('ARRIRPC/0 OK\nreq-id: \n\n').success).toBe(false);
        expect(parse('ARRIRPC/0 OK\nreq-id: a b\n\n').success).toBe(false);
        expect(
            parse(`ARRIRPC/0 OK\nreq-id: ${'a'.repeat(129)}\n\n`).success,
        ).toBe(false);
    });
    test('ignores headers reserved for transport bindings', () => {
        const result = parse(
            'ARRIRPC/0 OK\nArri-Connection-Id: abc\nx-foo: bar\n\n',
        );
        if (!result.success || result.value.type !== 'OK') {
            throw new Error('expected OK message');
        }
        expect(result.value.headers.toJSON()).toStrictEqual({ 'x-foo': 'bar' });
    });
    test('ignores reserved headers that do not apply to the message type', () => {
        const result = parse(
            'ARRIRPC/0 HEARTBEAT\nreq-id: 1\nx-unknown: foo\n\n',
        );
        expect(result).toStrictEqual({
            success: true,
            value: { type: 'HEARTBEAT', heartbeatInterval: undefined },
        });
    });
    test('enforces message direction', () => {
        expect(parseClientMessage(utf8('ARRIRPC/0 OK\n\n')).success).toBe(
            false,
        );
        expect(parseServerMessage(utf8('ARRIRPC/0 CANCEL\n\n')).success).toBe(
            false,
        );
        for (const type of ['STREAM_START', 'STREAM_DATA', 'STREAM_END']) {
            expect(
                parseClientMessage(utf8(`ARRIRPC/0 ${type}\n\n`)).success,
            ).toBe(true);
            expect(
                parseServerMessage(utf8(`ARRIRPC/0 ${type}\n\n`)).success,
            ).toBe(true);
        }
    });
});

describe('req-id recovery on parse failure', () => {
    const parse = (input: string | Uint8Array) =>
        parseMessage(typeof input === 'string' ? utf8(input) : input);

    test('unknown message type', () => {
        expect(parse('ARRIRPC/0 FOO\nreq-id: 7\n\n')).toStrictEqual({
            success: false,
            error: expect.any(String),
            reqId: '7',
        });
    });
    test('unsupported protocol version', () => {
        const result = parse('ARRIRPC/9 INVOCATION foo\nreq-id: 7\n\n');
        expect(!result.success && result.reqId).toBe('7');
    });
    test('invalid header elsewhere in the message', () => {
        const result = parse(
            'ARRIRPC/0 INVOCATION foo\nnot a header\nREQ-ID: 7\n\n',
        );
        expect(!result.success && result.reqId).toBe('7');
    });
    test('non-ASCII byte elsewhere in the head', () => {
        const result = parse(
            'ARRIRPC/0 INVOCATION foo\nreq-id: 7\nx-foo: é\n\n',
        );
        expect(!result.success && result.reqId).toBe('7');
    });
    test('missing head terminator', () => {
        const result = parse('ARRIRPC/0 INVOCATION foo\nreq-id: 7\n');
        expect(!result.success && result.reqId).toBe('7');
    });
    test('wrong direction', () => {
        const result = parseServerMessage(
            utf8('ARRIRPC/0 INVOCATION foo\nreq-id: 7\n\n'),
        );
        expect(!result.success && result.reqId).toBe('7');
    });
    test('no req-id available', () => {
        const result = parse('ARRIRPC/0 FOO\n\n');
        expect(result).toStrictEqual({
            success: false,
            error: expect.any(String),
        });
    });
    test('invalid req-id is not recovered', () => {
        const result = parse('ARRIRPC/0 FOO\nreq-id: a b\n\n');
        expect(!result.success && result.reqId).toBe(undefined);
    });
});
