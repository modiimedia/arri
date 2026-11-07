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
        rootService: undefined,
    });
    const outputFile = path.resolve(tmpDir, 'example_client.g.rs');
    writeFileSync(outputFile, result);
    execSync(`rustfmt ${outputFile} --edition 2021`, { stdio: 'inherit' });
    const finalResult = readFileSync(outputFile, 'utf8');
    expect(normalizeWhitespace(finalResult)).toBe(
        normalizeWhitespace(referenceClient),
    );
});

test('Optional properties of internally tagged variants are generated as optional', () => {
    const appDef = {
        ...JSON.parse(
            readFileSync(
                path.resolve(
                    __dirname,
                    '../../../../tests/test-files/AppDefinition.json',
                ),
                { encoding: 'utf8' },
            ),
        ),
        procedures: {},
        definitions: {
            Shape: {
                tagKey: 'type',
                union: {
                    CIRCLE: {
                        properties: { radius: { type: 'float64' } },
                        optionalProperties: { label: { type: 'string' } },
                    },
                },
            },
        },
    };
    if (!isAppDefinition(appDef)) {
        throw new Error('Error creating test AppDefinition');
    }
    const result = normalizeWhitespace(
        createRustClient(appDef, {
            clientName: 'ExampleClient',
            typeNamePrefix: '',
            instancePath: '',
            schemaPath: '',
            generatedTypes: [],
            rootService: undefined,
        }),
    );
    // the field is typed as an Option and defaults to None
    expect(result).toContain(normalizeWhitespace('label: Option<String>,'));
    expect(result).toContain(normalizeWhitespace('label: None,'));
    // the key is only written to JSON when the field is set
    expect(result).toContain(
        normalizeWhitespace(`match label {
            Some(label_val) => {
                _json_output_.push_str(",\\"label\\":");
                _json_output_.push_str(serialize_string(label_val).as_str());
            }
            _ => {}
        };`),
    );
    // the key is only added to the query string when the field is set
    expect(result).toContain(
        normalizeWhitespace(`match label {
            Some(label_val) => {
                _query_parts_.push(format!("label={}", encode_query_component(label_val)));
            }
            _ => {}
        };`),
    );
});
