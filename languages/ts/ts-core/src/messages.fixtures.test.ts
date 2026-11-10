import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { ArriHeaders } from './headers';
import {
    CLIENT_MESSAGE_TYPES,
    encodeMessage,
    Message,
    parseClientMessage,
    parseMessage,
    parseServerMessage,
    SERVER_MESSAGE_TYPES,
} from './messages';

const testDir = path.resolve(__dirname, '../../../../tests/test-files');

interface Manifest {
    valid: {
        name: string;
        file: string;
        canonical: boolean;
        message: Record<string, unknown>;
    }[];
    invalid: { name: string; file: string; reqId?: string }[];
}

const manifest: Manifest = JSON.parse(
    readFileSync(path.resolve(testDir, 'Messages.json'), 'utf8'),
);

function readFixture(file: string): Uint8Array {
    return new Uint8Array(readFileSync(path.resolve(testDir, file)));
}

/**
 * Convert the JSON representation in Messages.json into a Message
 */
function messageFromJson(input: Record<string, unknown>): Message {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
        switch (key) {
            case 'headers':
                result.headers = new ArriHeaders(value as [string, string][]);
                break;
            case 'body':
                result.body = new TextEncoder().encode(value as string);
                break;
            case 'bodyBase64':
                result.body = new Uint8Array(
                    Buffer.from(value as string, 'base64'),
                );
                break;
            default:
                result[key] = value;
        }
    }
    return result as unknown as Message;
}

/**
 * Drop undefined fields so messages can be compared structurally
 */
function normalize(msg: Message): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(msg)) {
        if (value === undefined) continue;
        if (value instanceof ArriHeaders) {
            result[key] = [...value];
        } else if (value instanceof Uint8Array) {
            result[key] = [...value];
        } else {
            result[key] = value;
        }
    }
    return result;
}

const clientTypes: readonly string[] = CLIENT_MESSAGE_TYPES;
const serverTypes: readonly string[] = SERVER_MESSAGE_TYPES;

describe('manifest', () => {
    test('lists every fixture file exactly once', () => {
        const listed = [...manifest.valid, ...manifest.invalid].map(
            (fixture) => fixture.file,
        );
        const onDisk = readdirSync(path.resolve(testDir, 'messages'))
            .filter((file) => file.endsWith('.arrimsg'))
            .map((file) => `messages/${file}`);
        expect(new Set(listed).size).toBe(listed.length);
        expect([...listed].sort()).toStrictEqual([...onDisk].sort());
    });
    test('fixture names are unique', () => {
        const valid = manifest.valid.map((fixture) => fixture.name);
        const invalid = manifest.invalid.map((fixture) => fixture.name);
        expect(new Set(valid).size).toBe(valid.length);
        expect(new Set(invalid).size).toBe(invalid.length);
    });
    test('every message type has a canonical fixture', () => {
        const covered = new Set(
            manifest.valid
                .filter((fixture) => fixture.canonical)
                .map((fixture) => fixture.message.type),
        );
        for (const type of [...clientTypes, ...serverTypes]) {
            expect(covered, type).toContain(type);
        }
    });
});

describe('valid messages', () => {
    for (const fixture of manifest.valid) {
        const input = readFixture(fixture.file);
        const expected = messageFromJson(fixture.message);
        describe(fixture.name, () => {
            test('parses', () => {
                const result = parseMessage(input);
                if (!result.success) throw new Error(result.error);
                expect(normalize(result.value)).toStrictEqual(
                    normalize(expected),
                );
            });
            if (fixture.canonical) {
                test('encodes to the fixture bytes', () => {
                    expect(encodeMessage(expected)).toStrictEqual(input);
                });
            } else {
                test('re-encodes to an equivalent canonical message', () => {
                    const parsed = parseMessage(input);
                    if (!parsed.success) throw new Error(parsed.error);
                    const encoded = encodeMessage(parsed.value);
                    expect(encoded).not.toStrictEqual(input);
                    const reparsed = parseMessage(encoded);
                    if (!reparsed.success) throw new Error(reparsed.error);
                    expect(normalize(reparsed.value)).toStrictEqual(
                        normalize(expected),
                    );
                    // canonical encoding is stable
                    expect(encodeMessage(reparsed.value)).toStrictEqual(
                        encoded,
                    );
                });
            }
            test('client parser only accepts client messages', () => {
                const result = parseClientMessage(input);
                expect(result.success).toBe(
                    clientTypes.includes(expected.type),
                );
                if (!result.success) {
                    expect(result.reqId).toBe(fixture.message.reqId);
                }
            });
            test('server parser only accepts server messages', () => {
                const result = parseServerMessage(input);
                expect(result.success).toBe(
                    serverTypes.includes(expected.type),
                );
                if (!result.success) {
                    expect(result.reqId).toBe(fixture.message.reqId);
                }
            });
            test('fails to parse when truncated before the end of the head', () => {
                const headEnd = indexOfEmptyLine(input);
                expect(headEnd).toBeGreaterThan(0);
                for (let i = 0; i <= headEnd + 1; i++) {
                    const result = parseMessage(input.subarray(0, i));
                    expect(result.success, `truncated to ${i} bytes`).toBe(
                        false,
                    );
                }
            });
        });
    }
});

describe('invalid messages', () => {
    for (const fixture of manifest.invalid) {
        const input = readFixture(fixture.file);
        describe(fixture.name, () => {
            for (const [parserName, parse] of [
                ['parseMessage', parseMessage],
                ['parseClientMessage', parseClientMessage],
                ['parseServerMessage', parseServerMessage],
            ] as const) {
                test(`${parserName} fails and recovers the req-id`, () => {
                    const result = parse(input);
                    expect(result.success).toBe(false);
                    if (result.success) return;
                    expect(result.error.length).toBeGreaterThan(0);
                    expect(result.reqId).toBe(fixture.reqId);
                });
            }
        });
    }
});

function indexOfEmptyLine(input: Uint8Array): number {
    for (let i = 0; i < input.length - 1; i++) {
        if (input[i] === 0x0a && input[i + 1] === 0x0a) return i;
    }
    return -1;
}
