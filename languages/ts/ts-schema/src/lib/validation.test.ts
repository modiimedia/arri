import { isEqual } from 'lodash';

import { a } from '../_index';
import {
    coercionTestSuites,
    parsingTestSuites,
    serializationTestSuites,
    validationTestSuites,
} from '../testSuites';

for (const key of Object.keys(validationTestSuites)) {
    const suite = validationTestSuites[key]!;
    test(key, () => {
        for (const input of suite.goodInputs) {
            expect(a.validate(suite.schema, input));
            const json = a.serializeUnsafe(suite.schema, input);
            expect(isEqual(a.parseUnsafe(suite.schema, json), input));
        }
        for (const input of suite.badInputs) {
            expect(!a.validate(suite.schema, input));
            expect(!a.parse(suite.schema, input).success);
        }
    });
}

describe('parsing test suites', () => {
    for (const key of Object.keys(parsingTestSuites)) {
        const suite = parsingTestSuites[key]!;
        test(key, () => {
            for (let i = 0; i < suite.goodInputs.length; i++) {
                const input = suite.goodInputs[i];
                const expectedResult = suite.expectedResults[i];
                expect(
                    isEqual(a.parseUnsafe(suite.schema, input), expectedResult),
                );
            }
            for (const input of suite.badInputs) {
                expect(!a.parse(suite.schema, input).success);
            }
        });
    }
});

describe('coercion test suites', () => {
    for (const key of Object.keys(coercionTestSuites)) {
        const suite = coercionTestSuites[key]!;
        test(key, () => {
            for (let i = 0; i < suite.goodInputs.length; i++) {
                const input = suite.goodInputs[i];
                const result = a.coerce(suite.schema, input);
                if (!result.success) console.error(result.errors);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.value).toStrictEqual(
                        suite.expectedResults[i],
                    );
                }
            }
        });
    }
});

describe('serialization test suites', () => {
    for (const key of Object.keys(serializationTestSuites)) {
        const suite = serializationTestSuites[key]!;
        test(key, () => {
            for (const input of suite.inputs) {
                const result = a.serializeUnsafe(suite.schema, input);
                const parseResult = a.parse(suite.schema, result);
                if (!parseResult.success) {
                    console.error(parseResult.errors);
                    console.log(result);
                }
                expect(parseResult.success).toBe(true);
                JSON.parse(result);
            }
        });
    }
});

describe('errors()', () => {
    describe('scalar type errors', () => {
        const schemas = [
            a.string(),
            a.boolean(),
            a.int8(),
            a.int16(),
            a.int32(),
            a.int64(),
            a.uint8(),
            a.uint16(),
            a.uint32(),
            a.uint64(),
            a.timestamp(),
        ];
        for (const schema of schemas) {
            test(schema.type, () => {
                const result = a.errors(schema, null);
                expect(result.length).toBe(1);
                expect(result[0]!.schemaPath).toBe('/type');
                expect(result[0]!.instancePath).toBe('');
            });
        }
    });
    test('nullable scalar type errors', () => {
        const schema = a.nullable(a.string());
        const result1 = a.errors(schema, null);
        const result2 = a.errors(schema, 'hello world');
        const result3 = a.errors(schema, true);
        expect(result1.length).toBe(0);
        expect(result2.length).toBe(0);
        expect(result3.length).toBe(1);
        expect(result3[0]!.instancePath).toBe('');
        expect(result3[0]!.schemaPath).toBe('/type');
    });
    test('enum errors', () => {
        const schema = a.enumerator(['USER', 'BOT']);
        const result1 = a.errors(schema, 'USER');
        const result2 = a.errors(schema, 'BOT');
        const result3 = a.errors(schema, 'BLAH');
        expect(result1.length).toBe(0);
        expect(result2.length).toBe(0);
        expect(result3.length).toBe(1);
        expect(result3[0]!.schemaPath).toBe('/enum');
        expect(result3[0]!.instancePath).toBe('');
    });
    test('object errors', () => {
        const schema = a.object({
            id: a.string(),
            date: a.timestamp(),
            role: a.enumerator(['USER', 'BOT']),
        });
        const result1 = a.errors(schema, {
            id: '1',
            date: new Date(),
            role: 'USER',
        });
        const result2 = a.errors(schema, {
            id: '1',
            date: false,
            role: 'BOT',
        });
        const result3 = a.errors(schema, {
            id: '1',
            date: false,
            role: 'BLAH',
        });
        const result4 = a.errors(schema, true);
        expect(result1.length).toBe(0);
        expect(result2.length).toBe(1);
        expect(result2[0]!.instancePath).toBe('/date');
        expect(result2[0]!.schemaPath).toBe('/properties/date/type');
        expect(result3.length).toBe(2);
        expect(result3[0]!.instancePath).toBe('/date');
        expect(result3[0]!.schemaPath).toBe('/properties/date/type');
        expect(result3[1]!.instancePath).toBe('/role');
        expect(result3[1]!.schemaPath).toBe('/properties/role/enum');
        expect(result4.length).toBe(1);
        expect(result4[0]!.instancePath).toBe('');
        expect(result4[0]!.schemaPath).toBe('/properties');
    });
    test('optional object property errors', () => {
        const schema = a.object({
            id: a.string(),
            date: a.optional(a.timestamp()),
        });
        const result1 = a.errors(schema, {
            id: '1',
        });
        const result2 = a.errors(schema, {
            id: '1',
            date: true,
        });
        expect(result1.length).toBe(0);
        expect(result2.length).toBe(1);
        expect(result2[0]!.instancePath).toBe('/date');
        expect(result2[0]!.schemaPath).toBe('/optionalProperties/date/type');
    });
    test('object strict additional field errors', () => {
        const looseSchema = a.object({
            id: a.string(),
            date: a.timestamp(),
        });
        const strictSchema = a.object(
            {
                id: a.string(),
                date: a.timestamp(),
            },
            { strict: true },
        );
        const looseResult = a.errors(looseSchema, {
            id: '1',
            date: new Date(),
            message: 'hello world',
        });
        const strictResult = a.errors(strictSchema, {
            id: '1',
            date: new Date(),
            message: 'hello world',
        });
        expect(looseResult.length).toBe(0);
        expect(strictResult.length).toBe(1);
        expect(strictResult[0]!.instancePath).toBe('/message');
        expect(strictResult[0]!.schemaPath).toBe('/strict');
    });
    test('record errors', () => {
        const schema = a.record(
            a.object({ id: a.string(), date: a.timestamp() }),
        );
        const result1 = a.errors(schema, {});
        const result2 = a.errors(schema, null);
        const result3 = a.errors(schema, {
            '1': {
                id: '1',
                date: new Date(),
            },
            '2': {
                id: '2',
                date: new Date(),
            },
        });
        const result4 = a.errors(schema, {
            '1': {
                id: '1',
                date: new Date(),
            },
            '2': {
                id: 2,
                date: new Date(),
            },
        });
        expect(result1.length).toBe(0);
        expect(result2.length).toBe(1);
        expect(result2[0]!.instancePath).toBe('');
        expect(result2[0]!.schemaPath).toBe('/values');
        expect(result3.length).toBe(0);
        expect(result4.length).toBe(1);
        expect(result4[0]!.instancePath).toBe('/2/id');
        expect(result4[0]!.schemaPath).toBe('/values/properties/id/type');
    });
    test('array errors', () => {
        const schema = a.array(a.boolean());
        const result1 = a.errors(schema, []);
        const result2 = a.errors(schema, [true, false]);
        const result3 = a.errors(schema, ['true', 'false']);
        const result4 = a.errors(schema, null);
        expect(result1.length).toBe(0);
        expect(result2.length).toBe(0);
        expect(result3.length).toBe(2);
        expect(result3[0]!.instancePath).toBe('/0');
        expect(result3[0]!.schemaPath).toBe('/elements/type');
        expect(result3[1]!.instancePath).toBe('/1');
        expect(result3[1]!.schemaPath).toBe('/elements/type');
        expect(result4.length).toBe(1);
        expect(result4[0]!.instancePath).toBe('');
        expect(result4[0]!.schemaPath).toBe('/elements');
    });
    test('discriminator errors', () => {
        const schema = a.discriminator('messageType', {
            TEXT: a.object({
                id: a.string(),
                text: a.string(),
            }),
            IMAGE: a.object({
                id: a.string(),
                imageUrl: a.string(),
            }),
            VIDEO: a.object({
                id: a.string(),
                videoUrl: a.string(),
            }),
        });
        const result1 = a.errors(schema, {
            messageType: 'LINK',
        });
        const result2 = a.errors(schema, {
            id: '1',
            messageType: 'IMAGE',
            text: 'Hello world',
        });
        const result3 = a.errors(schema, {
            id: '1',
            messageType: 'IMAGE',
            imageUrl: 'https://example.com',
        });
        const result4 = a.errors(schema, '');
        expect(result1.length).toBe(1);
        expect(result1[0]!.instancePath).toBe('/messageType');
        expect(result1[0]!.schemaPath).toBe('/discriminator');
        expect(result2.length).toBe(1);
        expect(result2[0]!.instancePath).toBe('/imageUrl');
        expect(result2[0]!.schemaPath).toBe(
            '/mapping/IMAGE/properties/imageUrl/type',
        );
        expect(result3.length).toBe(0);
        expect(result4.length).toBe(1);
        expect(result4[0]!.instancePath).toBe('');
        expect(result4[0]!.schemaPath).toBe('/discriminator');
    });
});
