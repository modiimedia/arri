import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';

import { normalizeWhitespace } from '@arrirpc/codegen-utils';
import path from 'pathe';

import { createDartClient } from './_index';

const tempDir = path.resolve(__dirname, '../.temp');
beforeAll(async () => {
    if (!existsSync(tempDir)) {
        await fs.mkdir(tempDir);
    }
});

test('Results match reference client', async () => {
    const appDef = JSON.parse(
        await fs.readFile(
            path.resolve(
                __dirname,
                '../../../../tests/test-files/AppDefinition.json',
            ),
            'utf8',
        ),
    );
    const outputFile = path.resolve(tempDir, 'dart_client.g.dart');
    const referenceFile = path.resolve(
        __dirname,
        '../../dart-codegen-reference/lib/reference_client.dart',
    );
    const fileContent = createDartClient(appDef, {
        clientName: 'ExampleClient',
        outputFile: path.resolve(__dirname, '../.temp/dart_client.g.dart'),
    });
    await fs.writeFile(outputFile, fileContent);
    execSync(`dart format ${outputFile}`, { stdio: 'inherit' });
    const result = await fs.readFile(outputFile, 'utf8');
    const reference = await fs.readFile(referenceFile, 'utf8');
    expect(normalizeWhitespace(result)).toBe(normalizeWhitespace(reference));
});
