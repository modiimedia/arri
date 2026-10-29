import { AppDefinition, SchemaFormUnion } from '@arrirpc/codegen-utils';
import fs from 'fs';
import path from 'pathe';
import { beforeAll, describe, expect, test } from 'vitest';

import { createTypescriptClient } from './_index';

// Tag/value keys that aren't valid camelCase identifiers should become camelCase
// fields in TS while keeping their original key in JSON

const rectangle = {
    properties: {
        width: { type: 'float64' },
        height: { type: 'float64' },
    },
} as const;
const circle = {
    properties: {
        radius: { type: 'float64' },
    },
} as const;

const InternalSnakeCase: SchemaFormUnion = {
    tagKey: 'shape_type',
    union: { rectangle, circle },
    metadata: { id: 'InternalSnakeCase' },
};
const AdjacentSnakeCase: SchemaFormUnion = {
    tagKey: 'shape_kind',
    valueKey: 'shape_data',
    union: { rectangle, circle, label: { type: 'string' } },
    metadata: { id: 'AdjacentSnakeCase' },
};
const AdjacentKebabCase: SchemaFormUnion = {
    tagKey: 'shape-kind',
    valueKey: 'shape-data',
    union: { rectangle, circle, label: { type: 'string' } },
    metadata: { id: 'AdjacentKebabCase' },
};

const appDef: AppDefinition = {
    schemaVersion: '0.0.8',
    procedures: {},
    definitions: {
        InternalSnakeCase,
        AdjacentSnakeCase,
        AdjacentKebabCase,
    },
};

const outFile = path.resolve(__dirname, '../.temp/union-key-casing/client.ts');

let client: Record<string, any>;

beforeAll(async () => {
    const result = await createTypescriptClient(appDef, {
        clientName: 'UnionKeyCasingClient',
        outputFile: '',
        features: {
            validateFn: true,
            cloneFn: true,
            validatorObj: true,
        },
    });
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, result);
    client = await import(outFile);
});

describe('internally tagged union with snake_case tag key', () => {
    const json = '{"shape_type":"rectangle","width":50,"height":25}';
    const value = { shapeType: 'rectangle', width: 50, height: 25 };
    test('JSON parsing', () => {
        expect(client.$$InternalSnakeCase.fromJsonString(json)).toStrictEqual(
            value,
        );
        expect(
            client.$$InternalSnakeCase.fromJsonString(
                '{"shape_type":"circle","radius":5}',
            ),
        ).toStrictEqual({ shapeType: 'circle', radius: 5 });
    });
    test('JSON output', () => {
        expect(client.$$InternalSnakeCase.toJsonString(value)).toBe(json);
    });
    test('validation', () => {
        expect(client.$$InternalSnakeCase.validate(value)).toBe(true);
        expect(
            client.$$InternalSnakeCase.validate({
                shape_type: 'rectangle',
                width: 50,
                height: 25,
            }),
        ).toBe(false);
    });
    test('cloning', () => {
        const cloned = client.$$InternalSnakeCase.clone(value);
        expect(cloned).toStrictEqual(value);
        expect(cloned).not.toBe(value);
    });
    test('URL query string output', () => {
        expect(client.$$InternalSnakeCase.toUrlSearchParamsString(value)).toBe(
            'shape_type=rectangle&width=50&height=25',
        );
    });
});

for (const { name, tagKey, valueKey } of [
    {
        name: 'AdjacentSnakeCase',
        tagKey: 'shape_kind',
        valueKey: 'shape_data',
    },
    {
        name: 'AdjacentKebabCase',
        tagKey: 'shape-kind',
        valueKey: 'shape-data',
    },
]) {
    describe(`adjacently tagged union with ${tagKey} / ${valueKey} keys`, () => {
        const objectJson = `{"${tagKey}":"rectangle","${valueKey}":{"width":50,"height":25}}`;
        const objectValue = {
            shapeKind: 'rectangle',
            shapeData: { width: 50, height: 25 },
        };
        const stringJson = `{"${tagKey}":"label","${valueKey}":"hello world"}`;
        const stringValue = { shapeKind: 'label', shapeData: 'hello world' };
        test('JSON parsing', () => {
            const validator = client[`$$${name}`];
            expect(validator.fromJsonString(objectJson)).toStrictEqual(
                objectValue,
            );
            expect(validator.fromJsonString(stringJson)).toStrictEqual(
                stringValue,
            );
        });
        test('JSON output', () => {
            const validator = client[`$$${name}`];
            expect(validator.toJsonString(objectValue)).toBe(objectJson);
            expect(validator.toJsonString(stringValue)).toBe(stringJson);
        });
        test('validation', () => {
            const validator = client[`$$${name}`];
            expect(validator.validate(objectValue)).toBe(true);
            expect(validator.validate(stringValue)).toBe(true);
            expect(validator.validate(JSON.parse(objectJson))).toBe(false);
        });
        test('cloning', () => {
            const validator = client[`$$${name}`];
            const cloned = validator.clone(objectValue);
            expect(cloned).toStrictEqual(objectValue);
            expect(cloned.shapeData).not.toBe(objectValue.shapeData);
        });
        test('new', () => {
            expect(client[`$$${name}`].new()).toStrictEqual({
                shapeKind: 'rectangle',
                shapeData: { width: 0, height: 0 },
            });
        });
    });
}
