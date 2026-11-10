import { readFileSync } from 'node:fs';
import path from 'node:path';

import { ArriHeaders } from './headers';
import { encodeMessage, Message, parseMessage } from './messages';

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

describe('valid messages', () => {
    for (const fixture of manifest.valid) {
        const input = readFixture(fixture.file);
        const expected = messageFromJson(fixture.message);
        test(`${fixture.name} parses`, () => {
            const result = parseMessage(input);
            if (!result.success) throw new Error(result.error);
            expect(normalize(result.value)).toStrictEqual(normalize(expected));
        });
        if (fixture.canonical) {
            test(`${fixture.name} encodes`, () => {
                expect(encodeMessage(expected)).toStrictEqual(input);
            });
        }
    }
});

describe('invalid messages', () => {
    for (const fixture of manifest.invalid) {
        test(`${fixture.name} fails to parse`, () => {
            const result = parseMessage(readFixture(fixture.file));
            expect(result.success).toBe(false);
            if (result.success) return;
            expect(result.reqId).toBe(fixture.reqId);
        });
    }
});
