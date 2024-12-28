import { isAppDefinition, normalizeWhitespace } from '@arrirpc/codegen-utils';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'pathe';

import { tmpDir } from './_common';
import { createRustClient } from './_index';

beforeAll(() => {
    if (!existsSync(tmpDir)) {
        mkdirSync(tmpDir);
    }
});

test('Generated code matches codegen reference', async () => {
    const appDef = JSON.parse(
        readFileSync(
            path.resolve(
                __dirname,
                '../../../../tests/test-files/AppDefinition.json',
            ),
            { encoding: 'utf8' },
        ),
    ) as unknown;
    const referenceClient = readFileSync(
        path.resolve(
            __dirname,
            '../../rust-codegen-reference/src/example_client.rs',
        ),
        'utf8',
    );
    if (!isAppDefinition(appDef)) {
        throw new Error('Error loading test AppDefinition.json');
    }
    const result = createRustClient(appDef, {
        clientName: 'ExampleClient',
        typeNamePrefix: '',
        instancePath: '',
        schemaPath: '',
        generatedTypes: [],
    });
    const outputFile = path.resolve(tmpDir, 'example_client.g.rs');
    writeFileSync(outputFile, result);
    execSync(`rustfmt ${outputFile} --edition 2021`, { stdio: 'inherit' });
    const finalResult = readFileSync(outputFile, 'utf8');
    expect(normalizeWhitespace(finalResult)).toBe(
        normalizeWhitespace(referenceClient),
    );
});
