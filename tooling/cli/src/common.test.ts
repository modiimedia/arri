import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { isInsideDir, loadAppDefinition } from './common';

test('isInsideDir', () => {
    expect(isInsideDir('/foo/bar/baz/foo', '/foo/bar/baz')).toBe(true);
    expect(isInsideDir('./../shared/src/components', './src/')).toBe(false);
});

describe('loadAppDefinition()', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arri-test-'));
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('loads a valid JSON AppDefinition', async () => {
        const appDef = {
            schemaVersion: '0.0.8',
            procedures: {},
            definitions: {
                User: {
                    properties: {
                        id: { type: 'string' },
                    },
                },
            },
        };
        const filePath = path.join(tempDir, 'app.json');
        fs.writeFileSync(filePath, JSON.stringify(appDef));

        const result = await loadAppDefinition(filePath);
        expect(result.schemaVersion).toBe('0.0.8');
        expect(result.definitions?.User).toBeDefined();
    });

    it('throws for non-existent file', async () => {
        const filePath = path.join(tempDir, 'nonexistent.json');
        await expect(loadAppDefinition(filePath)).rejects.toThrow(
            'Unable to find',
        );
    });

    it('throws for invalid JSON AppDefinition', async () => {
        const filePath = path.join(tempDir, 'invalid.json');
        fs.writeFileSync(filePath, JSON.stringify({ foo: 'bar' }));

        await expect(loadAppDefinition(filePath)).rejects.toThrow(
            'Invalid AppDefinition',
        );
    });

    it('throws for malformed JSON', async () => {
        const filePath = path.join(tempDir, 'malformed.json');
        fs.writeFileSync(filePath, 'not valid json');

        await expect(loadAppDefinition(filePath)).rejects.toThrow();
    });
});
